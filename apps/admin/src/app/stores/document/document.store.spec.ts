import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DriverCredential, IdentityDocument } from '@car-rental/domain';
import { DRIVER_CREDENTIAL_REPO, IDENTITY_DOCUMENT_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { DocumentStore } from './document.store';
import { OcrGateway } from '../../core/services/ocr.gateway';
import { MockOcrGateway } from '../../core/services/mock-ocr.gateway';
import { DriverEligibilityGateway } from '../../core/services/driver-eligibility.gateway';
import { MockDriverEligibilityGateway } from '../../core/services/mock-driver-eligibility.gateway';

describe('DocumentStore', () => {
  let store: DocumentStore;
  let ocr: MockOcrGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: IDENTITY_DOCUMENT_REPO, useValue: createInMemoryRepo<IdentityDocument>() },
        { provide: DRIVER_CREDENTIAL_REPO, useValue: createInMemoryRepo<DriverCredential>() },
        MockOcrGateway,
        { provide: OcrGateway, useExisting: MockOcrGateway },
        MockDriverEligibilityGateway,
        { provide: DriverEligibilityGateway, useExisting: MockDriverEligibilityGateway },
      ],
    });
    store = TestBed.inject(DocumentStore);
    ocr = TestBed.inject(MockOcrGateway);
  });

  it('上傳證件metadata後套用 OCR 低信心結果，人員核對訂正後才推進為 verified', async () => {
    ocr.setFixture('asset-front-1', {
      status: 'low_confidence',
      documentNumber: 'A100000009',
      confidence: 0.5,
    });

    const doc = await store.uploadIdentityDocument({
      memberId: 'c1',
      type: 'taiwan_id',
      documentNumber: 'A100000000',
      issuingCountry: 'TW',
      frontImageAssetId: 'asset-front-1',
    });

    // uploadIdentityDocument 的回傳值本身就必須是套用 OCR 結果之後的狀態，
    // 不是上傳當下、還沒跑 OCR 的舊物件——呼叫端不該還要另外重讀一次才拿得到正確資料。
    expect(doc.verification.state).toBe('ocr_extracted');
    expect(doc.verification.ocrConfidence).toBe(0.5);
    // OCR 誤判：號碼少讀一碼，先暫存 OCR 讀到的（錯誤）結果。
    expect(doc.documentNumber).toBe('A100000009');

    const afterOcr = store.identityDocumentsFor('c1')[0];
    expect(afterOcr).toEqual(doc);

    const confirmed = store.confirmIdentityDocument(doc.id, 'staff1', {
      documentNumber: 'A100000001',
    });

    expect(confirmed.verification.state).toBe('verified');
    expect(confirmed.verification.verifiedBy).toBe('staff1');
    expect(confirmed.documentNumber).toBe('A100000001');
  });

  it('沒有前置夾具時 OCR 預設回傳低信心，不會假裝辨識成功', async () => {
    const doc = await store.uploadIdentityDocument({
      memberId: 'c2',
      type: 'taiwan_id',
      documentNumber: 'A200000000',
      issuingCountry: 'TW',
      frontImageAssetId: 'asset-unknown',
    });

    expect(doc.verification.state).toBe('ocr_extracted');
    expect(doc.verification.ocrConfidence).toBe(0.4);

    const stored = store.identityDocumentsFor('c2').find((d) => d.id === doc.id);
    expect(stored).toEqual(doc);
  });

  it('uploadDriverCredential 的回傳值也是套用 OCR 結果之後的狀態', async () => {
    ocr.setFixture('asset-license-1', {
      status: 'succeeded',
      documentNumber: 'TL-9999',
      confidence: 0.95,
    });

    const credential = await store.uploadDriverCredential({
      memberId: 'c1',
      type: 'taiwan_license',
      documentNumber: 'TL-0000',
      issuingCountry: 'TW',
      originalVehicleClassText: '普通輕型機車',
      standardizedVehicleClass: 'scooter',
      frontImageAssetId: 'asset-license-1',
    });

    expect(credential.verification.state).toBe('ocr_extracted');
    expect(credential.documentNumber).toBe('TL-9999');

    const stored = store.driverCredentialsFor('c1').find((d) => d.id === credential.id);
    expect(stored).toEqual(credential);
  });

  it('同一位會員再上傳：接在前一版後面（version 遞增、supersededId 指回前一版），取最新時才拿得到新的那筆', async () => {
    const base = {
      memberId: 'c1',
      documentNumber: 'TL-0001',
      issuingCountry: 'TW',
      originalVehicleClassText: '普通小型車',
      standardizedVehicleClass: 'car' as const,
    };
    const first = await store.uploadDriverCredential({ ...base, type: 'taiwan_license' });
    const second = await store.uploadDriverCredential({ ...base, type: 'foreign_license', documentNumber: 'X-1' });
    const other = await store.uploadDriverCredential({ ...base, type: 'taiwan_license', memberId: 'c2' });
    expect(first).toMatchObject({ version: 1 });
    expect(first.supersededId).toBeUndefined();
    // 駕駛資格整位會員一條版本線（取車時看最新的那一張，不分種類）
    expect(second).toMatchObject({ version: 2, supersededId: first.id });
    expect(other).toMatchObject({ version: 1 });

    const id1 = await store.uploadIdentityDocument({ memberId: 'c1', type: 'taiwan_id', documentNumber: 'A1', issuingCountry: 'TW' });
    const id2 = await store.uploadIdentityDocument({ memberId: 'c1', type: 'taiwan_id', documentNumber: 'A2', issuingCountry: 'TW' });
    // 身分證明文件依種類各自一條版本線：改交居留證不算取代身分證
    const permit = await store.uploadIdentityDocument({ memberId: 'c1', type: 'resident_permit', documentNumber: 'R1', issuingCountry: 'TW' });
    expect(id2).toMatchObject({ version: 2, supersededId: id1.id });
    expect(permit).toMatchObject({ version: 1 });
    expect(permit.supersededId).toBeUndefined();
  });

  it('remove*：只供建立訂單失敗時補償清除這次新建的紀錄', async () => {
    const doc = await store.uploadIdentityDocument({ memberId: 'c1', type: 'taiwan_id', documentNumber: 'A1', issuingCountry: 'TW' });
    const credential = await store.uploadDriverCredential({
      memberId: 'c1',
      type: 'taiwan_license',
      documentNumber: 'TL-1',
      issuingCountry: 'TW',
      originalVehicleClassText: '',
      standardizedVehicleClass: 'car',
    });
    store.removeIdentityDocument(doc.id);
    store.removeDriverCredential(credential.id);
    expect(store.identityDocumentsFor('c1')).toEqual([]);
    expect(store.driverCredentialsFor('c1')).toEqual([]);
  });
});
