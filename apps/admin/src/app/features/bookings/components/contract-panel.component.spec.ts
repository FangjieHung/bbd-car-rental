import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ContractSnapshot, ContractVersion } from '@car-rental/domain';
import {
  ContractSigningDialogComponent,
  DEFAULT_CONTRACT_SIGNING_LABELS,
  SignatureAsset,
} from '@car-rental/contract-signing';
import { CONTRACT_VERSION_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { ContractStore } from '../../../stores/contract/contract.store';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { ContractPanelComponent } from './contract-panel.component';

/** 假的 MatDialog：記錄 open 的呼叫，afterClosed() 回傳預先指定的結果（模擬客人確認或取消）。 */
const SIGNED_ASSET: SignatureAsset = { assetId: 'sig-asset-9', url: 'blob:sig-9' };

// 刻意不給預設值：傳入 undefined（模擬取消）時不能被預設參數吃掉。
function fakeDialog(result: SignatureAsset | undefined) {
  const open = vi.fn().mockReturnValue({ afterClosed: () => of(result) });
  return { open };
}

function snapshot(overrides: Partial<ContractSnapshot> = {}): ContractSnapshot {
  return {
    renter: { memberId: 'c1', name: '王小明', phone: '0912345678' },
    driver: { memberId: 'c2', name: '林小華', phone: '0922333444' },
    vehicle: {
      vehicleId: 'v1',
      plateNumber: 'ABC-123',
      brand: 'Toyota',
      model: 'Yaris',
      category: 'car',
      fuelPolicy: 'full_to_full',
      mileagePolicy: 'unlimited',
      energyType: 'gasoline',
    },
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
      addOnLines: [{ addOnId: 'a1', name: '兒童安全座椅', qty: 1, amount: 200 }],
      addOnSubtotal: 200,
      insuranceSubtotal: 300,
      couponDiscount: 0,
      total: 4500,
    },
    disclosedRules: {
      cancellationContractKind: 'passenger_car',
      cancellationRuleVersion: 'v1',
      lateReturnPolicy: { graceMinutes: 30, unitMinutes: 60, feePerUnit: 100, dailyCap: 500 },
      energyReturnPolicy: { measure: 'eighths', feePerUnit: 50, serviceFee: 100 },
      otherDisclosures: ['禁止攜帶寵物'],
    },
    ...overrides,
  };
}

function createFixture(bookingId = 'b1', dialog = fakeDialog(SIGNED_ASSET)) {
  TestBed.configureTestingModule({
    providers: [
      { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>() },
      { provide: MatDialog, useValue: dialog },
    ],
  });

  const fixture = TestBed.createComponent(ContractPanelComponent);
  fixture.componentRef.setInput('bookingId', bookingId);
  fixture.detectChanges();
  const contractStore = TestBed.inject(ContractStore);

  return { fixture, component: fixture.componentInstance, contractStore, dialog };
}

function text(fixture: ReturnType<typeof createFixture>['fixture']): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

/** 「檢視合約並簽署」按鈕（沒有時回傳 undefined）。 */
function signButton(fixture: ReturnType<typeof createFixture>['fixture']): HTMLButtonElement | undefined {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === ZH_TW.contractPanel.openSigningDialog,
  );
}

describe('ContractPanelComponent 空狀態', () => {
  it('沒有任何合約版本時顯示「尚未建立合約版本」，不顯示簽署按鈕', () => {
    const { fixture } = createFixture();
    expect(text(fixture)).toContain(ZH_TW.contractPanel.noVersions);
    expect(signButton(fixture)).toBeUndefined();
  });
});

describe('ContractPanelComponent 草稿預覽內容', () => {
  it('以共用 ContractDocumentComponent 完整渲染快照：承租人、駕駛人、車輛、租期地點、計價、加購、逾時/能源規則、其他揭露事項與免責提示', () => {
    const { fixture, contractStore } = createFixture();
    contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('lib-contract-document')).toBeTruthy();
    const content = text(fixture);
    expect(content).toContain('王小明'); // 承租人
    expect(content).toContain('林小華'); // 駕駛人（與承租人不同會員）
    expect(content).toContain('ABC-123'); // 車牌
    expect(content).toContain('Yaris'); // 型號
    expect(content).toContain('馬公門市'); // 取還車地點
    expect(content).toContain('4500'); // 計價合計
    expect(content).toContain('1000'); // 訂金
    expect(content).toContain('兒童安全座椅'); // 加購配件
    expect(content).toContain('30'); // 逾時寬限分鐘
    expect(content).toContain('禁止攜帶寵物'); // 其他揭露事項
    expect(content).toContain(DEFAULT_CONTRACT_SIGNING_LABELS.document.disclaimer); // 開發期模擬合約免責提示
  });

  it('駕駛人與承租人是同一會員時顯示「同承租人」，不重複列出相同資料', () => {
    const { fixture, contractStore } = createFixture();
    const base = snapshot();
    contractStore.createDraft('b1', snapshot({ driver: base.renter }));
    fixture.detectChanges();

    expect(text(fixture)).toContain(DEFAULT_CONTRACT_SIGNING_LABELS.document.sameAsRenter);
  });

  it('草稿版本且為最新版本時顯示「檢視合約並簽署」按鈕，不再 inline 顯示簽名板', () => {
    const { fixture, contractStore } = createFixture();
    contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

    expect(signButton(fixture)).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('lib-signature-pad')).toBeNull();
  });
});

describe('ContractPanelComponent 簽署與不可覆寫', () => {
  it('點「檢視合約並簽署」開啟共用簽署 dialog；dialog 回傳資產紀錄後完成簽署，畫面轉為唯讀且不再顯示簽署按鈕', () => {
    const { fixture, contractStore, dialog } = createFixture();
    const draft = contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

    signButton(fixture)?.click();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(
      ContractSigningDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ snapshot: draft.snapshot, needsResign: false }),
      }),
    );

    const updated = contractStore.versionsFor('b1').find((v) => v.id === draft.id);
    expect(updated?.status).toBe('signed');
    expect(updated?.signatureAssetIds).toEqual(['sig-asset-9']);
    expect(signButton(fixture)).toBeUndefined();
    expect(text(fixture)).toContain(ZH_TW.contractPanel.readOnlySigned);
  });

  it('客人在 dialog 按取消（回傳 undefined）：不簽署，版本維持草稿、按鈕仍在', () => {
    const { fixture, contractStore } = createFixture('b1', fakeDialog(undefined));
    const draft = contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

    signButton(fixture)?.click();
    fixture.detectChanges();

    expect(contractStore.versionsFor('b1').find((v) => v.id === draft.id)?.status).toBe('draft');
    expect(signButton(fixture)).toBeTruthy();
  });

  it('已簽署且為最新版本：唯讀，不顯示簽署按鈕（已簽署版本不可覆寫）', () => {
    const { fixture, contractStore } = createFixture();
    const v1 = contractStore.createDraft('b1', snapshot());
    contractStore.sign(v1.id, ['sig-1']);
    fixture.detectChanges();

    expect(signButton(fixture)).toBeUndefined();
    expect(text(fixture)).toContain(ZH_TW.contractPanel.readOnlySigned);
  });
});

describe('ContractPanelComponent 需重新簽署', () => {
  it('舊版已簽、條款變更產生新草稿 → 顯示「條款已變更，需重新簽署」，並把狀態帶進 dialog；重新簽署後提示消失', () => {
    const { fixture, contractStore, dialog } = createFixture();
    const v1 = contractStore.createDraft('b1', snapshot());
    contractStore.sign(v1.id, ['sig-1']);
    fixture.detectChanges();
    expect(text(fixture)).not.toContain(DEFAULT_CONTRACT_SIGNING_LABELS.needsResignNotice);

    contractStore.reviseIfChanged('b1', snapshot({ pickupLocation: '機場' }));
    fixture.detectChanges();
    expect(text(fixture)).toContain(DEFAULT_CONTRACT_SIGNING_LABELS.needsResignNotice);

    signButton(fixture)?.click();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledWith(
      ContractSigningDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ needsResign: true }) }),
    );
    expect(text(fixture)).not.toContain(DEFAULT_CONTRACT_SIGNING_LABELS.needsResignNotice);
  });

  it('從未簽過任何版本（只有草稿）時不顯示需重新簽署提示', () => {
    const { fixture, contractStore } = createFixture();
    contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

    expect(text(fixture)).not.toContain(DEFAULT_CONTRACT_SIGNING_LABELS.needsResignNotice);
  });
});

describe('ContractPanelComponent 版本選擇與重大異動後的新版本', () => {
  it('多版本時預設顯示最新版本；可切換檢視舊版本，舊版本唯讀且顯示「已被取代」', () => {
    const { fixture, contractStore, component } = createFixture();
    const v1 = contractStore.createDraft('b1', snapshot());
    contractStore.sign(v1.id, ['sig-1']);
    // 核心欄位（車輛）異動：模擬編輯訂單對既有訂單的一次核心編輯，
    // 不經過本面板——面板必須被動反映 ContractStore 的最新狀態。
    contractStore.reviseIfChanged('b1', snapshot({ vehicle: { ...snapshot().vehicle, plateNumber: 'XYZ-999' } }));
    fixture.detectChanges();

    // 預設（未手動選擇）顯示最新版本：新車牌、草稿、可簽署
    expect(text(fixture)).toContain('XYZ-999');
    expect(text(fixture)).toContain(ZH_TW.contractPanel.statusLabels['draft']);
    expect(signButton(fixture)).toBeTruthy();

    // 切換回查看 v1：內容必須是當時的快照（舊車牌），不能被目前最新版本的資料蓋過去
    component['selectVersion'](v1.id);
    fixture.detectChanges();

    const oldViewText = text(fixture);
    expect(oldViewText).toContain('ABC-123');
    expect(oldViewText).not.toContain('XYZ-999');
    expect(oldViewText).toContain(ZH_TW.contractPanel.readOnlySuperseded);
    expect(oldViewText).toContain(ZH_TW.contractPanel.supersededReason);
    expect(signButton(fixture)).toBeUndefined();
  });

  it('選擇舊版本後，之後又有新版本產生時仍維持使用者手動選擇的版本，不會被自動跳走', () => {
    const { fixture, contractStore, component } = createFixture();
    const v1 = contractStore.createDraft('b1', snapshot());
    contractStore.sign(v1.id, ['sig-1']);
    fixture.detectChanges();

    component['selectVersion'](v1.id);
    fixture.detectChanges();
    expect(text(fixture)).toContain(ZH_TW.contractPanel.readOnlySigned);

    contractStore.reviseIfChanged('b1', snapshot({ pickupLocation: '機場' }));
    fixture.detectChanges();

    // 仍停留在使用者手動選的 v1（已被取代），不會自動跳到新的最新版本
    expect(text(fixture)).toContain(ZH_TW.contractPanel.readOnlySuperseded);
    expect(text(fixture)).toContain('馬公門市');
  });
});
