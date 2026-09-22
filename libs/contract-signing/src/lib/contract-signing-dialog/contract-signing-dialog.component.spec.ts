import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, of } from 'rxjs';
import { ContractSnapshot } from '@car-rental/domain';
import { DEFAULT_CONTRACT_SIGNING_LABELS } from '../contract-signing-labels';
import { SIGNATURE_ASSET_STORE, SignatureAsset, SignatureAssetStore } from '../signature-asset-store';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { ContractDocumentComponent } from '../contract-document/contract-document.component';
import { ContractSigningDialogComponent, ContractSigningDialogData } from './contract-signing-dialog.component';
import {
  CONTRACT_SIGNING_DIALOG_FULLSCREEN_PANEL_CLASS,
  contractSigningDialogConfig,
  openContractSigningDialog,
} from './open-contract-signing-dialog';

const SNAPSHOT: ContractSnapshot = {
  renter: { memberId: 'c1', name: '王小明', phone: '0912345678' },
  driver: { memberId: 'c1', name: '王小明', phone: '0912345678' },
  vehicle: { vehicleId: 'v1', plateNumber: 'ABC-123', brand: 'Toyota', model: 'Yaris', category: 'car' },
  rentalStartTime: '2026-07-20T09:00:00.000Z',
  rentalEndTime: '2026-07-22T18:00:00.000Z',
  pickupLocation: '馬公門市',
  returnLocation: '馬公門市',
  depositRequired: 1000,
  pricing: {
    dailyLines: [],
    rentalRaw: 4000,
    tierDiscountPercent: 0,
    tierDiscountAmount: 0,
    rentalSubtotal: 4000,
    partnerDiscountPercent: 0,
    partnerDiscount: 0,
    addOnLines: [],
    addOnSubtotal: 0,
    insuranceSubtotal: 0,
    couponDiscount: 0,
    total: 4000,
  },
  disclosedRules: { cancellationContractKind: 'passenger_car', cancellationRuleVersion: 'v1' },
};

class FakeSignatureAssetStore implements SignatureAssetStore {
  readonly stored: Array<{ file: Blob; filename: string }> = [];
  store(file: Blob, filename: string): Promise<SignatureAsset> {
    this.stored.push({ file, filename });
    return Promise.resolve({ assetId: 'sig-asset-1', url: 'blob:sig-1' });
  }
}

const L = DEFAULT_CONTRACT_SIGNING_LABELS;

describe('ContractSigningDialogComponent', () => {
  let close: ReturnType<typeof vi.fn>;
  let assetStore: FakeSignatureAssetStore;

  function createFixture(data: ContractSigningDialogData = { snapshot: SNAPSHOT }) {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
        { provide: SIGNATURE_ASSET_STORE, useValue: assetStore },
      ],
    });
    const fixture = TestBed.createComponent(ContractSigningDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  function buttonByText(fixture: ReturnType<typeof createFixture>, label: string): HTMLButtonElement {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    const found = buttons.find((b) => b.textContent?.trim() === label);
    if (!found) throw new Error(`button not found: ${label}`);
    return found as HTMLButtonElement;
  }

  function pad(fixture: ReturnType<typeof createFixture>): SignaturePadComponent {
    return fixture.debugElement.query(By.directive(SignaturePadComponent)).componentInstance;
  }

  /** 以打字簽名模式完成一筆簽名（jsdom 沒有真的 canvas，手寫模式另由 SignaturePadComponent 自己的 spec 驗證）。 */
  function completeSignature(fixture: ReturnType<typeof createFixture>): void {
    const p = pad(fixture);
    p['switchMode']('type');
    p['onTypedNameInput']('王小明');
    p['toggleAcknowledged'](true);
    fixture.detectChanges();
  }

  beforeEach(() => {
    close = vi.fn();
    assetStore = new FakeSignatureAssetStore();
  });

  it('由上而下渲染：合約條文 → 簽名板 → 取消／確認簽署；簽名板自帶的確認鈕被隱藏', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    const doc = el.querySelector('lib-contract-document');
    const signature = el.querySelector('lib-signature-pad');
    const actions = el.querySelector('mat-dialog-actions');
    if (!doc || !signature || !actions) throw new Error('dialog 版面缺少條文、簽名板或按鈕列');
    // DOCUMENT_POSITION_FOLLOWING：後者在前者之後
    expect(doc.compareDocumentPosition(signature) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(signature.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(el.textContent).toContain('ABC-123');
    const confirmButtons = Array.from(el.querySelectorAll('button')).filter(
      (b) => b.textContent?.trim() === L.dialog.confirm,
    );
    expect(confirmButtons).toHaveLength(1); // 只有 dialog 自己的確認鈕
    expect(fixture.debugElement.query(By.directive(ContractDocumentComponent))).toBeTruthy();
  });

  it('簽名尚未完成時確認鈕 disabled；只有簽名內容、沒勾選確認同意也仍 disabled', () => {
    const fixture = createFixture();
    expect(buttonByText(fixture, L.dialog.confirm).disabled).toBe(true);

    const p = pad(fixture);
    p['switchMode']('type');
    p['onTypedNameInput']('王小明');
    fixture.detectChanges();
    expect(buttonByText(fixture, L.dialog.confirm).disabled).toBe(true);
  });

  it('完成簽名後確認鈕可點擊，點擊後存檔並以資產紀錄關閉 dialog', async () => {
    const fixture = createFixture();
    completeSignature(fixture);

    const confirm = buttonByText(fixture, L.dialog.confirm);
    expect(confirm.disabled).toBe(false);
    confirm.click();

    await vi.waitFor(() => expect(close).toHaveBeenCalledTimes(1));
    expect(close).toHaveBeenCalledWith({ assetId: 'sig-asset-1', url: 'blob:sig-1' });
    expect(assetStore.stored).toHaveLength(1);
    expect(assetStore.stored[0].file.type).toBe('text/plain');
  });

  it('取消：以 undefined 關閉 dialog，不存任何簽名', () => {
    const fixture = createFixture();
    completeSignature(fixture);

    buttonByText(fixture, L.dialog.cancel).click();

    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(undefined);
    expect(assetStore.stored).toHaveLength(0);
  });

  it('needsResign 時在條文上方顯示「條款已變更，需重新簽署」；提供 version 時標題顯示版本號', () => {
    const fixture = createFixture({
      snapshot: SNAPSHOT,
      needsResign: true,
      version: { version: 2, createdAt: '2026-07-01T08:00:00.000Z' },
    });
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain(L.needsResignNotice);
    expect(text).toContain(`${L.document.versionLabel} 2`);
  });

  it('一般情況（未標記 needsResign）不顯示需重新簽署提示', () => {
    const fixture = createFixture();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(L.needsResignNotice);
  });
});

describe('openContractSigningDialog', () => {
  it('以 ContractSigningDialogComponent 開啟，並把 afterClosed() 的結果原樣交給呼叫端', async () => {
    const asset: SignatureAsset = { assetId: 'sig-9', url: 'blob:sig-9' };
    const open = vi.fn().mockReturnValue({ afterClosed: () => of(asset) });
    const dialog = { open } as unknown as MatDialog;
    const data: ContractSigningDialogData = { snapshot: SNAPSHOT };

    await expect(firstValueFrom(openContractSigningDialog(dialog, data))).resolves.toEqual(asset);
    expect(open).toHaveBeenCalledWith(ContractSigningDialogComponent, expect.objectContaining({ data }));
  });

  it('取消時結果為 undefined', async () => {
    const dialog = { open: () => ({ afterClosed: () => of(undefined) }) } as unknown as MatDialog;
    await expect(firstValueFrom(openContractSigningDialog(dialog, { snapshot: SNAPSHOT }))).resolves.toBeUndefined();
  });

  it('寬螢幕用大尺寸 dialog；窄螢幕全螢幕；兩者都不允許點背景誤關', () => {
    const wide = contractSigningDialogConfig({ snapshot: SNAPSHOT }, false);
    expect(wide.width).toBe('min(960px, 92vw)');
    expect(wide.disableClose).toBe(true);
    expect(wide.panelClass).not.toContain(CONTRACT_SIGNING_DIALOG_FULLSCREEN_PANEL_CLASS);

    const narrow = contractSigningDialogConfig({ snapshot: SNAPSHOT }, true);
    expect(narrow).toEqual(
      expect.objectContaining({ width: '100vw', height: '100dvh', maxWidth: '100vw', maxHeight: '100dvh' }),
    );
    expect(narrow.disableClose).toBe(true);
    expect(narrow.panelClass).toContain(CONTRACT_SIGNING_DIALOG_FULLSCREEN_PANEL_CLASS);
  });
});
