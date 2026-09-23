import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AuditEntry,
  CancellationCase,
  ChargeAdjustment,
  ContractVersion,
  CustomerCreditLedgerEntry,
  Member,
  PaymentRecord,
  RefundRecord,
  RentalBooking,
  ReminderStatus,
  Vehicle,
} from '@car-rental/domain';
import {
  AUDIT_ENTRY_REPO,
  BOOKING_REPO,
  CANCELLATION_CASE_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
  CUSTOMER_CREDIT_LEDGER_REPO,
  MAINTENANCE_REPO,
  MEMBER_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { ReminderGateway } from '../../../core/services/reminder.gateway';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { CancellationPanelComponent } from './cancellation-panel.component';
import { CancellationStore } from '../../../stores/cancellation/cancellation.store';
import { PaymentStore } from '../../../stores/payment/payment.store';

const T_START = '2026-07-20T09:00:00.000Z';
const T_END = '2026-07-22T18:00:00.000Z';

/**
 * 與元件內部 toDatetimeLocalValue() 相同的轉換邏輯（見 handover-panel.component.spec.ts 的
 * 先例）：datetime-local 表單值以「執行測試的主機所在時區」解讀，因此測試檔必須用同一套
 * 轉換，不能直接手寫一段字串假設是 UTC，否則在非 UTC 的機器上會算出不同的取車前天數。
 */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

class FakeDocumentAssetGateway implements DocumentAssetGateway {
  private counter = 0;
  store(): Promise<StoredDocumentAsset> {
    this.counter += 1;
    return Promise.resolve({ assetId: `asset-${this.counter}`, url: `blob:${this.counter}` });
  }
  resolveUrl(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
  remove(): Promise<void> {
    return Promise.resolve();
  }
}

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'A-1',
    category: 'car',
    model: 'Yaris',
    brand: 'Toyota',
    year: 2022,
    status: 'reserved',
    mileage: 1000,
    createdAt: T_START,
    ...partial,
  };
}

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: T_START,
    endTime: T_END,
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'reserved',
    depositRequired: 1000,
    ...partial,
  };
}

function makeMember(partial: Partial<Member> = {}): Member {
  return { id: 'm1', name: '王小明', phone: '0900000000', kind: 'local', ...partial };
}

describe('CancellationPanelComponent', () => {
  function configure(options: { vehicle?: Partial<Vehicle>; booking?: Partial<RentalBooking> } = {}) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>() },
        { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>() },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([makeBooking(options.booking)]) },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle(options.vehicle)]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember()]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo() },
        { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>([]) },
        { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
        { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
        { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
        { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>([]) },
        { provide: REMINDER_STATUS_REPO, useValue: createInMemoryRepo<ReminderStatus>([]) },
        {
          provide: ReminderGateway,
          useValue: { schedule: async () => ({ state: 'scheduled' as const }), cancel: async () => undefined },
        },
        { provide: DocumentAssetGateway, useValue: new FakeDocumentAssetGateway() },
      ],
    });
  }

  beforeEach(() => configure());

  function createFixture(bookingId = 'b1') {
    const fixture = TestBed.createComponent(CancellationPanelComponent);
    fixture.componentRef.setInput('bookingId', bookingId);
    fixture.detectChanges();
    return fixture;
  }

  it('reserved 以外的訂單顯示不適用提示，不顯示建案表單', () => {
    configure({ booking: { status: 'in_progress' } });
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.cancellationPanel.notApplicableNotice);
    expect(el.querySelector('form')).toBeNull();
    // 4.6：沒有既有案件時只剩那一行說明
    expect(el.textContent).not.toContain(ZH_TW.cancellationPanel.casesTitle);
  });

  it('4.6 已取消的訂單：不給建案表單，但照樣列出當初的取消案件', () => {
    configure({ booking: { status: 'cancelled' } });
    TestBed.inject(CancellationStore).createCase({
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: '2026-07-08T02:00:00.000Z',
      ruleVersion: '2026.1',
      originalDepositPaid: 500,
      originalOtherPrepayment: 0,
      quote: {
        status: 'quoted',
        disposition: 'refund',
        daysBeforePickup: 12,
        depositRefundRate: 1,
        depositRefund: 500,
        otherPrepaymentRefund: 0,
        statutoryCompensation: 0,
        goodwillCompensation: 0,
        transferFee: 0,
        totalCashDue: 500,
        reason: 'customer_cancellation_tier_100pct',
      },
    });
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('form')).toBeNull();
    expect(el.textContent).toContain(ZH_TW.cancellationPanel.notApplicableNotice);
    expect(el.textContent).toContain(ZH_TW.cancellationPanel.casesTitle);
    expect(el.textContent).toContain(ZH_TW.cancellationPanel.responsibilityLabels['customer']);
  });

  it('選擇責任歸屬與原因後，試算結果精確吻合 Task4 quoteCancellation 的輸出', () => {
    // 必須在建立元件（createFixture 內的 detectChanges）之前，透過 PaymentStore 寫入付款
    // 紀錄——PaymentStore 的 _payments signal 是建構當下對 repo.getAll() 的一次性快照，
    // 事後直接寫 PAYMENT_REPO 不會觸發它 reload()，元件會讀到過期的空陣列。
    TestBed.inject(PaymentStore).recordPayment({
      bookingId: 'b1',
      amount: 1000,
      method: 'cash',
      purpose: 'deposit',
      status: 'confirmed',
      receivedAt: '2026-07-01T00:00:00.000Z',
      handledBy: 'staff1',
    });

    const fixture = createFixture();
    const component = fixture.componentInstance;

    component['form'].patchValue({
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      cancellationRequestedAt: toDatetimeLocalValue('2026-07-12T02:00:00.000Z'), // Taipei 07-12 10:00 → 取車前 8 天 → 7-9 日前級距 50%
    });
    fixture.detectChanges();

    const quote = component['quotePreview']();
    expect(quote?.status).toBe('quoted');
    expect(quote?.daysBeforePickup).toBe(8);
    expect(quote?.depositRefundRate).toBe(0.5);
    expect(quote?.depositRefund).toBe(500);
    expect(quote?.otherPrepaymentRefund).toBe(0);
    expect(quote?.statutoryCompensation).toBe(0);
    expect(quote?.goodwillCompensation).toBe(0);
    expect(quote?.transferFee).toBe(0);
    expect(quote?.totalCashDue).toBe(500);
  });

  it('不可抗力取消未附佐證資料時無法建案，附上佐證資料後可建案，且案件需主管核准才算完成', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const cancellationStore = TestBed.inject(CancellationStore);

    component['form'].patchValue({ responsibility: 'force_majeure', reason: 'typhoon' });
    fixture.detectChanges();

    return component['submitCase']().then(() => {
      expect(component['submitError']()).toBe(ZH_TW.cancellationPanel.forceMajeureEvidenceRequired);
      expect(cancellationStore.casesFor('b1')).toHaveLength(0);

      component['evidenceAssetIds'].set(['asset-1']);
      return component['submitCase']().then(() => {
        expect(component['submitError']()).toBeUndefined();
        const cases = cancellationStore.casesFor('b1');
        expect(cases).toHaveLength(1);
        expect(cases[0].approvedBy).toBeUndefined();

        component['approveActorName'].set('主管林經理');
        component['approveCase'](cases[0].id);
        expect(cancellationStore.casesFor('b1')[0].approvedBy).toBe('主管林經理');
      });
    });
  });

  it('退款手續費達 30 元以上未附理由與主管確認時無法建案；補齊後可建案', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const cancellationStore = TestBed.inject(CancellationStore);

    component['form'].patchValue({
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      transferFee: 50,
    });
    fixture.detectChanges();

    return component['submitCase']().then(() => {
      expect(component['submitError']()).toBe(ZH_TW.cancellationPanel.transferFeeApprovalRequired);
      expect(cancellationStore.casesFor('b1')).toHaveLength(0);

      component['form'].patchValue({
        transferFeeReason: '客訴協調後同意較高手續費',
        transferFeeApprovedBy: '主管林經理',
      });
      return component['submitCase']().then(() => {
        expect(component['submitError']()).toBeUndefined();
        const cases = cancellationStore.casesFor('b1');
        expect(cases).toHaveLength(1);
        expect(cases[0].transferFee).toBe(50);
      });
    });
  });

  it('退款手續費表單預設為 0（免填理由即可送出）', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    expect(component['form'].controls.transferFee.value).toBe(0);
    expect(component['needsTransferFeeApproval']()).toBe(false);
  });

  it('機車顧客取消（未訂退費表）試算結果為 manual_review，建案後狀態為 manual_review 且擋下自動撥款提示', () => {
    configure({ vehicle: { category: 'scooter' } });
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const cancellationStore = TestBed.inject(CancellationStore);

    component['form'].patchValue({ responsibility: 'customer', reason: 'customer_change_of_mind' });
    fixture.detectChanges();

    expect(component['quotePreview']()?.status).toBe('manual_review');

    return component['submitCase']().then(() => {
      const cases = cancellationStore.casesFor('b1');
      expect(cases).toHaveLength(1);
      expect(cases[0].status).toBe('manual_review');

      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain(ZH_TW.cancellationPanel.manualReviewNotice);
    });
  });

  it('一般顧客取消建案成功後，案件呈現待退款（pending-refund）狀態', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const cancellationStore = TestBed.inject(CancellationStore);

    component['form'].patchValue({
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      cancellationRequestedAt: toDatetimeLocalValue('2026-07-08T02:00:00.000Z'), // Taipei 07-08 10:00 → 取車前 12 天 → 100%
    });
    fixture.detectChanges();

    return component['submitCase']().then(() => {
      const cases = cancellationStore.casesFor('b1');
      expect(cases).toHaveLength(1);
      expect(cases[0].status).toBe('quoted');

      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain(ZH_TW.cancellationPanel.pendingRefundNotice);
    });
  });
});
