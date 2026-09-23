import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AuditEntry,
  CancellationCase,
  CancellationQuote,
  ChargeAdjustment,
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
  CUSTOMER_CREDIT_LEDGER_REPO,
  MAINTENANCE_REPO,
  MEMBER_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { ReminderGateway } from '../../../core/services/reminder.gateway';
import { CustomerCreditPanelComponent } from './customer-credit-panel.component';
import { CancellationStore } from '../../../stores/cancellation/cancellation.store';
import { CreditStore, addMonths } from '../../../stores/credit/credit.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ZH_TW } from '../../../core/i18n/zh-tw';

const T_START = '2026-07-20T09:00:00.000Z';
const T_END = '2026-07-22T18:00:00.000Z';

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

describe('CustomerCreditPanelComponent', () => {
  function configure(options: { booking?: Partial<RentalBooking> } = {}) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>() },
        { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>() },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([makeBooking(options.booking)]) },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember()]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo() },
        { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
        { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
        { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
        { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>([]) },
        { provide: REMINDER_STATUS_REPO, useValue: createInMemoryRepo<ReminderStatus>([]) },
        {
          provide: ReminderGateway,
          useValue: { schedule: async () => ({ state: 'scheduled' as const }), cancel: async () => undefined },
        },
      ],
    });
  }

  beforeEach(() => configure());

  function createFixture(bookingId = 'b1') {
    const fixture = TestBed.createComponent(CustomerCreditPanelComponent);
    fixture.componentRef.setInput('bookingId', bookingId);
    fixture.detectChanges();
    return fixture;
  }

  function seedQuotedCase(): CancellationCase {
    const cancellationStore = TestBed.inject(CancellationStore);
    const quote: CancellationQuote = {
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
    };
    return cancellationStore.createCase({
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: '2026-07-08T02:00:00.000Z',
      ruleVersion: '2026.1',
      originalDepositPaid: 500,
      originalOtherPrepayment: 0,
      quote,
    });
  }

  it('沒有待撥付案件時顯示提示', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.customerCreditPanel.noDisposableCases);
  });

  it('全部轉保留金但未勾選同意時撥付失敗；勾選同意後成功核發保留金並預設 12 個月效期', () => {
    seedQuotedCase();
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const creditStore = TestBed.inject(CreditStore);

    component['form'].patchValue({ disposition: 'credit', refundAmount: 0, creditAmount: 500, actorName: 'staff1' });
    fixture.detectChanges();

    return component['submitDisposition']().then(() => {
      expect(component['submitError']()).toBe(ZH_TW.customerCreditPanel.creditConsentRequired);
      expect(creditStore.balanceFor('m1')).toBe(0);

      component['form'].patchValue({ creditConsent: true });
      return component['submitDisposition']().then(() => {
        expect(component['submitError']()).toBeUndefined();
        expect(creditStore.balanceFor('m1')).toBe(500);
        const entries = creditStore.entriesFor('m1');
        expect(entries).toHaveLength(1);
        // 撥付未指定 creditExpiryMonths（表單預設 12），CreditStore.issue() 依核發時間
        // 自動算出 12 個月後到期——用同一份 addMonths() 反推驗證，不寫死絕對日期字串
        // （occurredAt 是元件呼叫當下的 new Date().toISOString()，測試無法預先得知）。
        expect(entries[0].expiresAt).toBe(addMonths(entries[0].occurredAt, 12));
      });
    });
  });

  it('部分退款加部分保留金：金額不符時顯示錯誤，不建立任何撥付紀錄', () => {
    seedQuotedCase();
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const creditStore = TestBed.inject(CreditStore);

    component['form'].patchValue({
      disposition: 'split',
      refundAmount: 200,
      creditAmount: 200,
      creditConsent: true,
      actorName: 'staff1',
    });
    fixture.detectChanges();

    return component['submitDisposition']().then(() => {
      expect(component['submitError']()).toBe(ZH_TW.customerCreditPanel.amountMismatch);
      expect(creditStore.balanceFor('m1')).toBe(0);
    });
  });

  it('切換撥付方式為原方式退款時，自動帶入應退總額；轉保留金時自動歸零退款金額', () => {
    seedQuotedCase();
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component['selectDisposition']('refund');
    expect(component['form'].controls.refundAmount.value).toBe(500);
    expect(component['form'].controls.creditAmount.value).toBe(0);

    component['selectDisposition']('credit');
    expect(component['form'].controls.refundAmount.value).toBe(0);
    expect(component['form'].controls.creditAmount.value).toBe(500);
  });

  it('保留金即將於 30 天內到期時顯示提醒', () => {
    seedQuotedCase();
    const fixture = createFixture();
    const creditStore = TestBed.inject(CreditStore);

    const now = new Date();
    const soon = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
    creditStore.issue({ memberId: 'm1', amount: 100, occurredAt: now.toISOString(), expiresAt: soon, handledBy: 'staff1' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.customerCreditPanel.reminderNotice);
  });

  it('展延保留金未填理由時表單無效，不寫入帳本；填了理由後成功寫入帳本', () => {
    seedQuotedCase();
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const creditStore = TestBed.inject(CreditStore);
    creditStore.issue({ memberId: 'm1', amount: 200, occurredAt: '2026-07-01T00:00:00.000Z', handledBy: 'staff1' });

    // reason 欄位本身掛了 Validators.required（設計文件「主管可展期且保存理由」——理由是
    // 展延的硬性前提，UI 層直接擋下比等 CreditStore.extend() 丟錯更早給出回饋）。
    component['extendForm'].patchValue({ amount: 0, actorName: '主管林經理' });
    component['submitExtend']();
    expect(component['extendForm'].invalid).toBe(true);
    expect(component['extendForm'].controls.reason.errors).toEqual({ required: true });
    expect(creditStore.entriesFor('m1')).toHaveLength(1);

    component['extendForm'].patchValue({ reason: '顧客申請展延' });
    component['submitExtend']();
    expect(component['extendError']()).toBeUndefined();
    expect(creditStore.entriesFor('m1')).toHaveLength(2);
    expect(creditStore.entriesFor('m1')[1].reason).toBe('顧客申請展延');
  });

  it('CreditStore.extend() 本身仍會拒絕空理由——UI 表單驗證與 store 的守則是兩道獨立防線', () => {
    const creditStore = TestBed.inject(CreditStore);
    creditStore.issue({ memberId: 'm1', amount: 200, occurredAt: '2026-07-01T00:00:00.000Z', handledBy: 'staff1' });

    expect(() =>
      creditStore.extend({ memberId: 'm1', amount: 0, occurredAt: '2026-07-02T00:00:00.000Z', handledBy: 'staff1' }),
    ).toThrow('展延保留金必須填寫理由');
  });

  it('4.6 part="refund"：只有撥付與退款紀錄，不含保留金餘額與展延', () => {
    const fixture = TestBed.createComponent(CustomerCreditPanelComponent);
    fixture.componentRef.setInput('bookingId', 'b1');
    fixture.componentRef.setInput('part', 'refund');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.customerCreditPanel.noDisposableCases);
    expect(el.textContent).not.toContain(ZH_TW.customerCreditPanel.creditBalanceTitle);
  });

  it('4.6 part="credit"：只有保留金餘額與展延，不含撥付；沒有保留金時不給展延表單', () => {
    seedQuotedCase();
    const fixture = TestBed.createComponent(CustomerCreditPanelComponent);
    fixture.componentRef.setInput('bookingId', 'b1');
    fixture.componentRef.setInput('part', 'credit');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.customerCreditPanel.creditBalanceTitle);
    expect(el.textContent).not.toContain(ZH_TW.customerCreditPanel.submitDisposition);
    expect(el.querySelector('form')).toBeNull();
    expect(el.textContent).toContain(ZH_TW.customerCreditPanel.noCreditToExtend);

    TestBed.inject(CreditStore).issue({ memberId: 'm1', amount: 100, occurredAt: '2026-07-01T00:00:00.000Z', handledBy: 'staff1' });
    fixture.detectChanges();
    expect(el.querySelector('form')).not.toBeNull();
    expect(el.textContent).not.toContain(ZH_TW.customerCreditPanel.noCreditToExtend);
  });

  it('4.6 退款段列出這筆訂單的退款紀錄（唯讀）', () => {
    TestBed.inject(PaymentStore).recordRefund({
      bookingId: 'b1',
      amount: 300,
      method: 'cash',
      status: 'pending',
      handledBy: 'staff2',
      note: '退款處理中，待出納撥款',
    });
    const fixture = createFixture();
    const list = (fixture.nativeElement as HTMLElement).querySelector('.customer-credit-panel__refunds');
    expect(list?.textContent).toContain('NT$300');
    expect(list?.textContent).toContain(ZH_TW.activityTimeline.refundStatusLabels['pending']);
    expect(list?.textContent).toContain('退款處理中，待出納撥款');
  });
});
