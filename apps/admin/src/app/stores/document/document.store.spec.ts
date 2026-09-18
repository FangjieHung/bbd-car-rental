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

    const afterOcr = store.identityDocumentsFor('c1')[0];
    expect(afterOcr.verification.state).toBe('ocr_extracted');
    expect(afterOcr.verification.ocrConfidence).toBe(0.5);
    // OCR 誤判：號碼少讀一碼，先暫存 OCR 讀到的（錯誤）結果。
    expect(afterOcr.documentNumber).toBe('A100000009');

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

    const stored = store.identityDocumentsFor('c2').find((d) => d.id === doc.id);
    expect(stored?.verification.state).toBe('ocr_extracted');
    expect(stored?.verification.ocrConfidence).toBe(0.4);
  });
});
