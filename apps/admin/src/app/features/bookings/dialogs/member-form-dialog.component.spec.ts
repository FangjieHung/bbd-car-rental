import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DriverCredential, IdentityDocument, Member } from '@car-rental/domain';
import { MEMBER_REPO, IDENTITY_DOCUMENT_REPO, DRIVER_CREDENTIAL_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { MemberStore } from '../../../stores/member/member.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { OcrGateway } from '../../../core/services/ocr.gateway';
import { MockOcrGateway } from '../../../core/services/mock-ocr.gateway';
import { DriverEligibilityGateway } from '../../../core/services/driver-eligibility.gateway';
import { MockDriverEligibilityGateway } from '../../../core/services/mock-driver-eligibility.gateway';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { MemberFormDialogComponent } from './member-form-dialog.component';

class FakeDocumentAssetGateway implements DocumentAssetGateway {
  store(): Promise<StoredDocumentAsset> {
    return Promise.resolve({ assetId: 'unused', url: 'unused' });
  }
  resolveUrl(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
  remove(): Promise<void> {
    return Promise.resolve();
  }
}

describe('MemberFormDialogComponent', () => {
  let closeSpy: (result?: unknown) => void;
  let closedWith: unknown[];

  function createFixture(data: Member | null = null) {
    closedWith = [];
    closeSpy = (result?: unknown) => closedWith.push(result);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>(data ? [data] : []) },
        { provide: IDENTITY_DOCUMENT_REPO, useValue: createInMemoryRepo<IdentityDocument>() },
        { provide: DRIVER_CREDENTIAL_REPO, useValue: createInMemoryRepo<DriverCredential>() },
        { provide: DocumentAssetGateway, useValue: new FakeDocumentAssetGateway() },
        MockOcrGateway,
        { provide: OcrGateway, useExisting: MockOcrGateway },
        MockDriverEligibilityGateway,
        { provide: DriverEligibilityGateway, useExisting: MockDriverEligibilityGateway },
      ],
    });
    const fixture = TestBed.createComponent(MemberFormDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('預設本國人（local）：顯示台灣身分證與台灣駕照欄位，不顯示外國旅客／居留證欄位', () => {
    const fixture = createFixture();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('身分證字號');
    expect(text).toContain('駕照正面');
    expect(text).not.toContain('護照號碼');
    expect(text).not.toContain('國籍');
    expect(text).not.toContain('入境日期');
    expect(text).not.toContain('居留證號');
    expect(text).not.toContain('適用的駕照路徑');
  });

  it('切換為外國旅客：顯示國籍、護照、入境日期、原駕照、IDP、簽注頁欄位', () => {
    const fixture = createFixture();
    fixture.componentInstance.form.controls.kind.setValue('foreign_visitor');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('國籍');
    expect(text).toContain('護照號碼');
    expect(text).toContain('入境日期');
    expect(text).toContain('駕照正面（原國駕照）');
    expect(text).toContain('國際駕照（IDP）');
    expect(text).toContain('簽注頁');
    expect(text).not.toContain('身分證字號');
    expect(text).not.toContain('適用的駕照路徑');
  });

  it('切換為外國旅客時顯示互惠資格查核面板；本國人不顯示', () => {
    const local = createFixture();
    expect((local.nativeElement as HTMLElement).textContent).not.toContain('互惠資格查核');

    const fixture = createFixture();
    fixture.componentInstance.form.controls.kind.setValue('foreign_visitor');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('互惠資格查核');
  });

  it('切換為居留證：顯示居留證號與「適用的駕照路徑」；選外國駕照路徑時再顯示 IDP／簽注頁', () => {
    const fixture = createFixture();
    fixture.componentInstance.form.controls.kind.setValue('resident');
    fixture.detectChanges();
    let text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('居留證號');
    expect(text).toContain('適用的駕照路徑');
    expect(text).not.toContain('國際駕照（IDP）');

    fixture.componentInstance.form.controls.licensePath.setValue('foreign');
    fixture.detectChanges();
    text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('國際駕照（IDP）');
    expect(text).toContain('簽注頁');
  });

  it('切換身分類型不會清空已上傳的證件 asset（identityFront 在 local→foreign→local 之間保留）', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.handleAssetCaptured('identityFront', { assetId: 'a1', url: 'blob:1' });
    expect(component.capturedAssets()['identityFront']).toEqual({ assetId: 'a1', url: 'blob:1' });

    component.form.controls.kind.setValue('foreign_visitor');
    fixture.detectChanges();
    expect(component.capturedAssets()['identityFront']).toEqual({ assetId: 'a1', url: 'blob:1' });

    component.form.controls.kind.setValue('local');
    fixture.detectChanges();
    expect(component.capturedAssets()['identityFront']).toEqual({ assetId: 'a1', url: 'blob:1' });
  });

  it('handleIdentityFieldsResolved 只會套用有給的欄位，不會把其他欄位清空', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.patchValue({ identityExpiryDate: '2030-01-01' });

    component.handleIdentityFieldsResolved({ documentNumber: 'A123456789' });

    expect(component.form.controls.identityNumber.value).toBe('A123456789');
    expect(component.form.controls.identityExpiryDate.value).toBe('2030-01-01');
  });

  it('儲存時建立會員與身分證明文件，並以人員核對後的值呼叫 confirm（不會被 OCR 靜默覆寫）', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.patchValue({
      name: '王小明',
      phone: '0912345678',
      identityNumber: 'A100000000',
    });
    component.handleAssetCaptured('identityFront', { assetId: 'asset-1', url: 'blob:1' });

    await component.save();

    expect(closedWith).toEqual([true]);
    const memberStore = TestBed.inject(MemberStore);
    expect(memberStore.members()).toHaveLength(1);
    expect(memberStore.members()[0]).toMatchObject({
      name: '王小明',
      phone: '0912345678',
      kind: 'local',
      idNumber: 'A100000000',
    });

    const documentStore = TestBed.inject(DocumentStore);
    const docs = documentStore.identityDocumentsFor(memberStore.members()[0].id);
    expect(docs).toHaveLength(1);
    expect(docs[0].documentNumber).toBe('A100000000');
    expect(docs[0].verification.state).toBe('verified');
    expect(docs[0].frontImageAssetId).toBe('asset-1');
  });

  it('沒有填寫身分證明號碼時，儲存不會建立身分證明文件（僅建立會員基本資料）', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.patchValue({ name: '陳小華', phone: '0900000000' });

    await component.save();

    const memberStore = TestBed.inject(MemberStore);
    const documentStore = TestBed.inject(DocumentStore);
    expect(memberStore.members()).toHaveLength(1);
    expect(documentStore.identityDocumentsFor(memberStore.members()[0].id)).toHaveLength(0);
  });

  it('編輯既有會員時預先帶入資料，儲存呼叫 MemberStore.update 而非 create', async () => {
    const existing: Member = {
      id: 'm1',
      name: '舊姓名',
      phone: '0911111111',
      kind: 'local',
      idNumber: 'A100000000',
    };
    const fixture = createFixture(existing);
    const component = fixture.componentInstance;
    expect(component.form.controls.name.value).toBe('舊姓名');

    component.form.patchValue({ name: '新姓名' });
    await component.save();

    const memberStore = TestBed.inject(MemberStore);
    expect(memberStore.members()).toHaveLength(1);
    expect(memberStore.members()[0].name).toBe('新姓名');
    expect(memberStore.members()[0].id).toBe('m1');
  });
});
