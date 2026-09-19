import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContractSnapshot, ContractVersion } from '@car-rental/domain';
import { CONTRACT_VERSION_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { ContractStore } from '../../../stores/contract/contract.store';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { ContractPanelComponent } from './contract-panel.component';
import { SignaturePadComponent } from './signature-pad.component';

class FakeDocumentAssetGateway implements DocumentAssetGateway {
  store(): Promise<StoredDocumentAsset> {
    return Promise.resolve({ assetId: 'unused', url: 'blob:unused' });
  }
  resolveUrl(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
  remove(): Promise<void> {
    return Promise.resolve();
  }
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

function createFixture(bookingId = 'b1') {
  TestBed.configureTestingModule({
    providers: [
      { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>() },
      { provide: DocumentAssetGateway, useValue: new FakeDocumentAssetGateway() },
    ],
  });

  const fixture = TestBed.createComponent(ContractPanelComponent);
  fixture.componentRef.setInput('bookingId', bookingId);
  fixture.detectChanges();
  const contractStore = TestBed.inject(ContractStore);

  return { fixture, component: fixture.componentInstance, contractStore };
}

function text(fixture: ReturnType<typeof createFixture>['fixture']): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function signaturePad(fixture: ReturnType<typeof createFixture>['fixture']) {
  return fixture.debugElement.query(By.directive(SignaturePadComponent));
}

describe('ContractPanelComponent 空狀態', () => {
  it('沒有任何合約版本時顯示「尚未建立合約版本」，不渲染簽名元件', () => {
    const { fixture } = createFixture();
    expect(text(fixture)).toContain(ZH_TW.contractPanel.noVersions);
    expect(signaturePad(fixture)).toBeNull();
  });
});

describe('ContractPanelComponent 草稿預覽內容', () => {
  it('完整渲染快照：承租人、駕駛人、車輛、租期地點、計價、加購、逾時/能源規則、其他揭露事項與免責提示', () => {
    const { fixture, contractStore } = createFixture();
    contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

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
    expect(content).toContain(ZH_TW.contractPanel.disclaimer); // 開發期模擬合約免責提示
  });

  it('駕駛人與承租人是同一會員時顯示「同承租人」，不重複列出相同資料', () => {
    const { fixture, contractStore } = createFixture();
    const base = snapshot();
    contractStore.createDraft('b1', snapshot({ driver: base.renter }));
    fixture.detectChanges();

    expect(text(fixture)).toContain(ZH_TW.contractPanel.sameAsRenter);
  });

  it('草稿版本且為最新版本時會渲染簽名元件，供直接簽署', () => {
    const { fixture, contractStore } = createFixture();
    contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

    expect(signaturePad(fixture)).toBeTruthy();
  });
});

describe('ContractPanelComponent 簽署與不可覆寫', () => {
  it('透過 signature-pad 的 signed 事件完成簽署：版本變成 signed，畫面轉為唯讀且不再顯示簽名元件', () => {
    const { fixture, contractStore } = createFixture();
    const draft = contractStore.createDraft('b1', snapshot());
    fixture.detectChanges();

    const pad = signaturePad(fixture);
    expect(pad).toBeTruthy();
    const padInstance = pad?.componentInstance as SignaturePadComponent;
    padInstance.signed.emit({
      assetId: 'sig-asset-9',
      url: 'blob:sig-9',
    });
    fixture.detectChanges();

    const updated = contractStore.versionsFor('b1').find((v) => v.id === draft.id);
    expect(updated?.status).toBe('signed');
    expect(updated?.signatureAssetIds).toEqual(['sig-asset-9']);
    expect(signaturePad(fixture)).toBeNull();
    expect(text(fixture)).toContain(ZH_TW.contractPanel.readOnlySigned);
  });

  it('已簽署且為最新版本：唯讀，不顯示簽名元件（已簽署版本不可覆寫）', () => {
    const { fixture, contractStore } = createFixture();
    const v1 = contractStore.createDraft('b1', snapshot());
    contractStore.sign(v1.id, ['sig-1']);
    fixture.detectChanges();

    expect(signaturePad(fixture)).toBeNull();
    expect(text(fixture)).toContain(ZH_TW.contractPanel.readOnlySigned);
  });
});

describe('ContractPanelComponent 版本選擇與重大異動後的新版本', () => {
  it('多版本時預設顯示最新版本；可切換檢視舊版本，舊版本唯讀且顯示「已被取代」', () => {
    const { fixture, contractStore, component } = createFixture();
    const v1 = contractStore.createDraft('b1', snapshot());
    contractStore.sign(v1.id, ['sig-1']);
    // 核心欄位（車輛）異動：模擬 booking-form-dialog 對既有訂單的一次核心編輯，
    // 不經過本面板——面板必須被動反映 ContractStore 的最新狀態。
    contractStore.reviseIfChanged('b1', snapshot({ vehicle: { ...snapshot().vehicle, plateNumber: 'XYZ-999' } }));
    fixture.detectChanges();

    // 預設（未手動選擇）顯示最新版本：新車牌、草稿、可簽署
    expect(text(fixture)).toContain('XYZ-999');
    expect(text(fixture)).toContain(ZH_TW.contractPanel.statusLabels['draft']);
    expect(signaturePad(fixture)).toBeTruthy();

    // 切換回查看 v1：內容必須是當時的快照（舊車牌），不能被目前最新版本的資料蓋過去
    component['selectVersion'](v1.id);
    fixture.detectChanges();

    const oldViewText = text(fixture);
    expect(oldViewText).toContain('ABC-123');
    expect(oldViewText).not.toContain('XYZ-999');
    expect(oldViewText).toContain(ZH_TW.contractPanel.readOnlySuperseded);
    expect(oldViewText).toContain(ZH_TW.contractPanel.supersededReason);
    expect(signaturePad(fixture)).toBeNull();
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
