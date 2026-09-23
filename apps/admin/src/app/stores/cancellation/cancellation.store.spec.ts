import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AuditEntry,
  CancellationCase,
  ChargeAdjustment,
  CustomerCreditLedgerEntry,
  Member,
  PaymentRecord,
  RefundRecord,
  RentalOrder,
  ReminderStatus,
  Vehicle,
} from '@car-rental/domain';
import {
  AUDIT_ENTRY_REPO,
  ORDER_REPO,
  CANCELLATION_CASE_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CUSTOMER_CREDIT_LEDGER_REPO,
  MAINTENANCE_REPO,
  MEMBER_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { ReminderDispatchResult, ReminderGateway, ScheduleReminderInput } from '../../core/services/reminder.gateway';
import { OrderStore } from '../order/order.store';
import { PaymentStore } from '../payment/payment.store';
import { CreditStore } from '../credit/credit.store';
import { ReminderStore } from '../reminder/reminder.store';
import {
  CancellationDispositionPartialFailureError,
  CaseNotReadyForDispositionError,
  CreditConsentRequiredError,
  DispositionAmountMismatchError,
  DispositionRetryMismatchError,
  ForceMajeureApprovalRequiredError,
  ForceMajeureEvidenceRequiredError,
  TransferFeeApprovalRequiredError,
} from './cancellation.store';
import { CancellationStore } from './cancellation.store';

/** 可觀測的 fake gateway：讓迴歸測試能斷言 suppressForOrder() 真的透過 cancel() 取消了排程。 */
class FakeReminderGateway implements ReminderGateway {
  readonly cancelCalls: Array<{ bookingId: string; offset: ScheduleReminderInput['offset'] }> = [];

  async schedule(_input: ScheduleReminderInput): Promise<ReminderDispatchResult> {
    return { state: 'scheduled' };
  }

  async cancel(bookingId: string, offset: ScheduleReminderInput['offset']): Promise<void> {
    this.cancelCalls.push({ bookingId, offset });
  }
}

/** 讓所有微任務（含 MockReminderGateway 內部的 queueMicrotask）都跑完，才能斷言 fire-and-forget 呼叫的結果。 */
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

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

function makeOrder(partial: Partial<RentalOrder> = {}): RentalOrder {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: T_START,
    endTime: T_END,
    pickupBranchId: '馬公',
    returnBranchId: '馬公',
    status: 'reserved',
    depositRequired: 1000,
    ...partial,
  };
}

function makeMember(partial: Partial<Member> = {}): Member {
  return { id: 'm1', name: '王小明', phone: '0900000000', kind: 'local', ...partial };
}

function createFixture(
  options: {
    vehicle?: Partial<Vehicle>;
    order?: Partial<RentalOrder>;
    reminderStatuses?: ReminderStatus[];
  } = {},
) {
  // 允許在同一個 it() 內（外層 beforeEach 已建立一次 TestBed 之後）重新配置一份帶自訂
  // order／vehicle 的 fixture——resetTestingModule() 先清空，避免「TestBed 已實例化」錯誤。
  TestBed.resetTestingModule();
  const reminderGateway = new FakeReminderGateway();
  const reminderStatusRepo = createInMemoryRepo<ReminderStatus>(options.reminderStatuses ?? []);
  TestBed.configureTestingModule({
    providers: [
      { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>() },
      { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>() },
      { provide: ORDER_REPO, useValue: createInMemoryRepo<RentalOrder>([makeOrder(options.order)]) },
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle(options.vehicle)]) },
      { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember()]) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<{ id: string }>([]) },
      { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
      { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
      { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
      { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>([]) },
      { provide: REMINDER_STATUS_REPO, useValue: reminderStatusRepo },
      { provide: ReminderGateway, useValue: reminderGateway },
    ],
  });

  return {
    store: TestBed.inject(CancellationStore),
    orderStore: TestBed.inject(OrderStore),
    paymentStore: TestBed.inject(PaymentStore),
    creditStore: TestBed.inject(CreditStore),
    reminderStore: TestBed.inject(ReminderStore),
    auditRepo: TestBed.inject(AUDIT_ENTRY_REPO),
    orderRepo: TestBed.inject(ORDER_REPO),
    reminderGateway,
    reminderStatusRepo,
  };
}

describe('CancellationStore', () => {
  let store: CancellationStore;

  beforeEach(() => {
    ({ store } = createFixture());
  });

  it('試算報價後建立取消案件，refundLines 與 disposition 依報價結果轉存', () => {
    const quote = store.quote({
      contractKind: 'passenger_car',
      responsibility: 'customer',
      cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 1000,
      otherPrepayment: 0,
    });
    expect(quote.status).toBe('quoted');
    expect(quote.depositRefund).toBe(500); // 8 天前 → 7-9 日前級距 50%

    const kase = store.createCase({
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: '2026-07-10T10:00:00+08:00',
      ruleVersion: '2026.1',
      originalDepositPaid: 1000,
      originalOtherPrepayment: 0,
      quote,
    });

    expect(kase.status).toBe('quoted');
    expect(kase.disposition).toBe('refund');
    expect(kase.refundLines).toEqual([{ label: 'deposit', amount: 500 }]);
    expect(store.casesFor('b1')).toHaveLength(1);
  });

  it('manual_review 報價建立的案件狀態為 manual_review', () => {
    const quote = store.quote({
      contractKind: 'scooter',
      responsibility: 'customer',
      cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 0,
      otherPrepayment: 0,
    });
    expect(quote.status).toBe('manual_review');

    const kase = store.createCase({
      bookingId: 'b2',
      contractKind: 'scooter',
      responsibility: 'customer',
      reason: 'scooter_cancellation_schedule_not_defined',
      requestedAt: '2026-07-10T10:00:00+08:00',
      ruleVersion: '2026.1',
      originalDepositPaid: 0,
      originalOtherPrepayment: 0,
      quote,
    });
    expect(kase.status).toBe('manual_review');
    expect(kase.refundLines).toEqual([]);
  });

  it('不可抗力取消未附佐證資料時建案丟錯', () => {
    const quote = store.quote({
      contractKind: 'passenger_car',
      responsibility: 'force_majeure',
      cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 1000,
      otherPrepayment: 0,
    });
    expect(() =>
      store.createCase({
        bookingId: 'b1',
        contractKind: 'passenger_car',
        responsibility: 'force_majeure',
        reason: 'typhoon',
        requestedAt: '2026-07-10T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 1000,
        originalOtherPrepayment: 0,
        quote,
      }),
    ).toThrow(ForceMajeureEvidenceRequiredError);
    expect(store.casesFor('b1')).toHaveLength(0);
  });

  it('不可抗力取消附上佐證資料後可正常建案', () => {
    const quote = store.quote({
      contractKind: 'passenger_car',
      responsibility: 'force_majeure',
      cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 1000,
      otherPrepayment: 0,
    });
    const kase = store.createCase({
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'force_majeure',
      reason: 'typhoon',
      requestedAt: '2026-07-10T10:00:00+08:00',
      ruleVersion: '2026.1',
      originalDepositPaid: 1000,
      originalOtherPrepayment: 0,
      quote,
      evidenceAssetIds: ['asset-1'],
    });
    expect(kase.status).toBe('quoted');
    expect(kase.refundLines).toEqual([{ label: 'deposit', amount: 1000 }]);
  });

  it('退款手續費達 30 元以上未附理由與主管確認時建案丟錯', () => {
    const quote = store.quote({
      contractKind: 'passenger_car',
      responsibility: 'customer',
      cancellationRequestedAt: '2026-07-08T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 1000,
      otherPrepayment: 0,
      transferFee: 50,
    });
    expect(() =>
      store.createCase({
        bookingId: 'b1',
        contractKind: 'passenger_car',
        responsibility: 'customer',
        reason: 'customer_change_of_mind',
        requestedAt: '2026-07-08T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 1000,
        originalOtherPrepayment: 0,
        quote,
      }),
    ).toThrow(TransferFeeApprovalRequiredError);
  });

  it('退款手續費達 30 元以上附理由與主管確認後可建案，並留存稽核紀錄', () => {
    const { store: s, auditRepo } = createFixture();
    const quote = s.quote({
      contractKind: 'passenger_car',
      responsibility: 'customer',
      cancellationRequestedAt: '2026-07-08T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 1000,
      otherPrepayment: 0,
      transferFee: 50,
    });
    const kase = s.createCase({
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: '2026-07-08T10:00:00+08:00',
      ruleVersion: '2026.1',
      originalDepositPaid: 1000,
      originalOtherPrepayment: 0,
      quote,
      transferFeeReason: '客訴協調後同意較高手續費',
      transferFeeApprovedBy: '主管林經理',
    });
    expect(kase.transferFee).toBe(50);

    const entries = auditRepo.getAll();
    expect(entries).toHaveLength(1);
    expect(entries[0].entityType).toBe('cancellation_case');
    expect(entries[0].entityId).toBe(kase.id);
    expect(entries[0].actorName).toBe('主管林經理');
    expect(entries[0].reason).toBe('客訴協調後同意較高手續費');
  });

  describe('disposeCase 撥付', () => {
    function buildQuotedCase(s: CancellationStore) {
      const quote = s.quote({
        contractKind: 'passenger_car',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
        pickupAt: '2026-07-18T09:00:00+08:00',
        depositPaid: 1000,
        otherPrepayment: 0,
      });
      return s.createCase({
        bookingId: 'b1',
        contractKind: 'passenger_car',
        responsibility: 'customer',
        reason: 'customer_change_of_mind',
        requestedAt: '2026-07-10T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 1000,
        originalOtherPrepayment: 0,
        quote,
      });
    }

    it('全額原方式退款：建立待退款紀錄（pending），訂單轉為 cancelled，保留付款歷史', () => {
      const { store: s, orderStore, paymentStore } = createFixture();
      paymentStore.recordPayment({
        bookingId: 'b1',
        amount: 1000,
        method: 'cash',
        purpose: 'deposit',
        status: 'confirmed',
        receivedAt: '2026-07-01T00:00:00.000Z',
        handledBy: 'staff1',
      });

      const kase = buildQuotedCase(s);
      const result = s.disposeCase({
        caseId: kase.id,
        disposition: 'refund',
        refundAmount: 500,
        creditAmount: 0,
        actor: { actorId: 'staff1', actorName: 'staff1' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      });

      expect(result.refund?.status).toBe('pending');
      expect(result.refund?.amount).toBe(500);
      expect(result.case.status).toBe('settled');
      expect(result.case.disposition).toBe('refund');
      expect(orderStore.orders().find((b) => b.id === 'b1')?.status).toBe('cancelled');
      // 付款歷史從未被刪除，仍看得到原始訂金收款紀錄
      expect(paymentStore.paymentsFor('b1')).toHaveLength(1);
    });

    it('（Task 17 迴歸測試）撥付完成、訂單轉為 cancelled 後，會透過真正的協調流程抑制這筆訂單尚未寄出的提醒——不是只有 ReminderStore.suppressForOrder() 自己的單元測試才驗證這條規則', async () => {
      const { store: s, orderStore, reminderStore, reminderGateway } = createFixture({
        reminderStatuses: [
          {
            id: 'rem-24h',
            bookingId: 'b1',
            offset: '24h_before_return',
            state: 'scheduled',
            scheduledFor: '2026-07-21T18:00:00.000Z',
            updatedAt: '2026-07-15T09:00:00.000Z',
          },
          {
            id: 'rem-2h',
            bookingId: 'b1',
            offset: '2h_before_return',
            state: 'scheduled',
            scheduledFor: '2026-07-22T16:00:00.000Z',
            updatedAt: '2026-07-15T09:00:00.000Z',
          },
        ],
      });
      const kase = buildQuotedCase(s);

      s.disposeCase({
        caseId: kase.id,
        disposition: 'refund',
        refundAmount: 500,
        creditAmount: 0,
        actor: { actorId: 'staff1', actorName: 'staff1' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      });

      expect(orderStore.orders().find((b) => b.id === 'b1')?.status).toBe('cancelled');
      // disposeCase() 本身仍是同步方法；抑制提醒是 fire-and-forget，要等微任務跑完才看得到結果。
      await flushMicrotasks();

      const remaining = reminderStore.statusesFor('b1');
      expect(remaining.every((r) => r.state !== 'scheduled')).toBe(true);
      expect(remaining).toHaveLength(0);
      expect(reminderGateway.cancelCalls.map((c) => c.offset).sort()).toEqual(
        ['24h_before_return', '2h_before_return'].sort(),
      );
    });

    it('全部轉保留金但未取得顧客同意時丟錯，不寫入任何撥付紀錄', () => {
      const { store: s, creditStore, orderStore } = createFixture();
      const kase = buildQuotedCase(s);

      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'credit',
          refundAmount: 0,
          creditAmount: 500,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T10:30:00.000Z',
        }),
      ).toThrow(CreditConsentRequiredError);
      expect(creditStore.entriesFor('m1')).toHaveLength(0);
      expect(orderStore.orders().find((b) => b.id === 'b1')?.status).toBe('reserved');
    });

    it('全部轉保留金，取得同意後核發保留金並預設 12 個月效期', () => {
      const { store: s, creditStore } = createFixture();
      const kase = buildQuotedCase(s);

      const result = s.disposeCase({
        caseId: kase.id,
        disposition: 'credit',
        refundAmount: 0,
        creditAmount: 500,
        creditConsent: true,
        actor: { actorId: 'staff1', actorName: 'staff1' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      });

      expect(result.credit?.amount).toBe(500);
      expect(result.credit?.expiresAt).toBe('2027-07-10T10:30:00.000Z');
      expect(result.credit?.sourceCancellationCaseId).toBe(kase.id);
      expect(creditStore.balanceFor('m1')).toBe(500);
    });

    it('部分退款加部分保留金：金額合計須精確等於應退總額，否則丟錯', () => {
      const { store: s } = createFixture();
      const kase = buildQuotedCase(s);

      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'split',
          refundAmount: 200,
          creditAmount: 200, // 合計 400，應退總額是 500
          creditConsent: true,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T10:30:00.000Z',
        }),
      ).toThrow(DispositionAmountMismatchError);
    });

    it('部分退款加部分保留金：金額合計正確時同時建立退款與保留金紀錄', () => {
      const { store: s, paymentStore, creditStore } = createFixture();
      const kase = buildQuotedCase(s);

      const result = s.disposeCase({
        caseId: kase.id,
        disposition: 'split',
        refundAmount: 300,
        creditAmount: 200,
        creditConsent: true,
        actor: { actorId: 'staff1', actorName: 'staff1' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      });

      expect(result.refund?.amount).toBe(300);
      expect(result.credit?.amount).toBe(200);
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(creditStore.balanceFor('m1')).toBe(200);
    });

    it('機車顧客取消（manual_review）無法撥付，須先由人工確認金額', () => {
      const { store: s } = createFixture({ vehicle: { category: 'scooter' } });
      const quote = s.quote({
        contractKind: 'scooter',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
        pickupAt: '2026-07-18T09:00:00+08:00',
        depositPaid: 500,
        otherPrepayment: 0,
      });
      const kase = s.createCase({
        bookingId: 'b1',
        contractKind: 'scooter',
        responsibility: 'customer',
        reason: 'scooter_cancellation_schedule_not_defined',
        requestedAt: '2026-07-10T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 500,
        originalOtherPrepayment: 0,
        quote,
      });

      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'refund',
          refundAmount: 0,
          creditAmount: 0,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T10:30:00.000Z',
        }),
      ).toThrow(CaseNotReadyForDispositionError);
    });

    it('不可抗力案件未經主管核准前無法撥付；核准後可正常撥付', () => {
      const { store: s, orderStore } = createFixture();
      const quote = s.quote({
        contractKind: 'passenger_car',
        responsibility: 'force_majeure',
        cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
        pickupAt: '2026-07-18T09:00:00+08:00',
        depositPaid: 1000,
        otherPrepayment: 0,
      });
      const kase = s.createCase({
        bookingId: 'b1',
        contractKind: 'passenger_car',
        responsibility: 'force_majeure',
        reason: 'typhoon',
        requestedAt: '2026-07-10T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 1000,
        originalOtherPrepayment: 0,
        quote,
        evidenceAssetIds: ['asset-1'],
      });

      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'refund',
          refundAmount: 1000,
          creditAmount: 0,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T10:30:00.000Z',
        }),
      ).toThrow(ForceMajeureApprovalRequiredError);

      s.approve(kase.id, '主管林經理');
      const result = s.disposeCase({
        caseId: kase.id,
        disposition: 'refund',
        refundAmount: 1000,
        creditAmount: 0,
        actor: { actorId: 'staff1', actorName: 'staff1' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      });
      expect(result.case.status).toBe('settled');
      expect(orderStore.orders().find((b) => b.id === 'b1')?.status).toBe('cancelled');
    });

    it('訂單已非 reserved 時撥付於訂單轉換步驟失敗，回報已完成步驟且不遺失已建立的退款紀錄', () => {
      const { store: s, orderStore, paymentStore } = createFixture({ order: { status: 'in_progress' } });
      const kase = buildQuotedCase(s);

      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'refund',
          refundAmount: 500,
          creditAmount: 0,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T10:30:00.000Z',
        }),
      ).toThrow(CancellationDispositionPartialFailureError);

      // 訂單轉換失敗，但退款紀錄已經建立（並未遺失、也沒有被撤銷）——呼叫端必須依錯誤內容
      // 判斷實際狀態，不能假設整個流程都沒有發生。
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(orderStore.orders().find((b) => b.id === 'b1')?.status).toBe('in_progress');
    });

    it('保留金轉換記錄顧客同意，但不能被寫成主管覆核的 approve 稽核動作', () => {
      const { store: s, auditRepo } = createFixture();
      const kase = buildQuotedCase(s);

      s.disposeCase({
        caseId: kase.id,
        disposition: 'credit',
        refundAmount: 0,
        creditAmount: 500,
        creditConsent: true,
        actor: { actorId: 'staff1', actorName: '櫃檯甲' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      });

      const settlementAudit = auditRepo.getAll().find((entry) => entry.entityId === kase.id);
      expect(settlementAudit?.action).toBe('update');
      expect(settlementAudit?.reason).toBe('顧客同意轉為保留金');
    });

    it('Critical #2 回歸：訂單轉換步驟重複失敗時，重試不會建立第二筆退款／保留金紀錄；訂單恢復 reserved 後重試可順利完成且仍只有一筆', () => {
      const { store: s, orderStore, paymentStore, creditStore, orderRepo } = createFixture({
        order: { status: 'in_progress' },
      });
      const kase = buildQuotedCase(s); // 應退總額 500（8 天前取消，7-9 日級距 50% ×1000）

      const disposeInput = {
        caseId: kase.id,
        disposition: 'split' as const,
        refundAmount: 300,
        creditAmount: 200,
        creditConsent: true,
        actor: { actorId: 'staff1', actorName: 'staff1' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      };

      // 第一次呼叫：退款／保留金紀錄成功寫入，但訂單轉換失敗（訂單不是 reserved）。
      expect(() => s.disposeCase(disposeInput)).toThrow(CancellationDispositionPartialFailureError);
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(creditStore.entriesFor('m1')).toHaveLength(1);

      // 第二次呼叫（同樣的輸入，訂單仍未修好）：案件狀態仍是 quoted，呼叫端很可能重試——
      // 重試不應該再建立第二筆退款／保留金紀錄，只會在訂單轉換這步再次失敗。
      expect(() => s.disposeCase(disposeInput)).toThrow(CancellationDispositionPartialFailureError);
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(creditStore.entriesFor('m1')).toHaveLength(1);

      // 修正根本問題（訂單恢復 reserved，模擬「取車流程被撤銷／原本就是誤判」）後重試：
      // 應該直接重用先前已建立的退款／保留金紀錄，成功完成訂單轉換與結案，且紀錄數量仍是各一筆。
      orderRepo.update('b1', { status: 'reserved' });
      const result = s.disposeCase(disposeInput);

      expect(result.case.status).toBe('settled');
      expect(orderStore.orders().find((b) => b.id === 'b1')?.status).toBe('cancelled');
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(creditStore.entriesFor('m1')).toHaveLength(1);
      expect(result.refund?.amount).toBe(300);
      expect(result.credit?.amount).toBe(200);
    });

    it('Important 回歸：重試時金額與既有紀錄不同會被拒絕，不會沿用舊紀錄卻寫入新金額的假案件歷程', () => {
      const { store: s, orderStore, paymentStore, creditStore } = createFixture({
        order: { status: 'in_progress' },
      });
      const kase = buildQuotedCase(s); // 應退總額 500

      // 第一次呼叫：300/200 拆分，寫入退款／保留金紀錄成功，但訂單轉換失敗。
      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'split',
          refundAmount: 300,
          creditAmount: 200,
          creditConsent: true,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T10:30:00.000Z',
        }),
      ).toThrow(CancellationDispositionPartialFailureError);
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(paymentStore.refundsFor('b1')[0].amount).toBe(300);
      expect(creditStore.entriesFor('m1')).toHaveLength(1);
      expect(creditStore.entriesFor('m1')[0].amount).toBe(200);

      // 重試時改用不同拆分（500/0）——金額合計仍等於案件應退總額 500，所以不會被
      // DispositionAmountMismatchError 擋下；但既有紀錄是 300/200，不是 500/0，
      // 必須被拒絕，不能沿用 300/200 的舊紀錄卻讓 disposition／稽核寫成「退款 500」。
      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'refund',
          refundAmount: 500,
          creditAmount: 0,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T11:00:00.000Z',
        }),
      ).toThrow(DispositionRetryMismatchError);

      // 拒絕後不應該有任何新紀錄被建立，案件也還沒被誤標記成 settled。
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(creditStore.entriesFor('m1')).toHaveLength(1);
      expect(orderStore.orders().find((b) => b.id === 'b1')?.status).toBe('in_progress');

      // 用原本一致的金額（300/200）重試仍然可以正常運作（冪等重用，不受這個防護擋下）。
      const consistentRetryError = (() => {
        try {
          s.disposeCase({
            caseId: kase.id,
            disposition: 'split',
            refundAmount: 300,
            creditAmount: 200,
            creditConsent: true,
            actor: { actorId: 'staff1', actorName: 'staff1' },
            occurredAt: '2026-07-10T11:30:00.000Z',
          });
          return undefined;
        } catch (e) {
          return e;
        }
      })();
      expect(consistentRetryError).toBeInstanceOf(CancellationDispositionPartialFailureError);
      expect(paymentStore.refundsFor('b1')).toHaveLength(1);
      expect(creditStore.entriesFor('m1')).toHaveLength(1);
    });
  });

  describe('operator_fault 的 totalDisposableAmount（Critical #1 回歸測試：不得從 refundLines 重新加總）', () => {
    it('已收定金：應退總額是訂金兩倍加其他預付款，不是訂金三倍（deposit 明細與 statutory_compensation 明細有重疊）', () => {
      const { store: s } = createFixture();
      const quote = s.quote({
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
        pickupAt: '2026-07-18T09:00:00+08:00',
        depositPaid: 1000,
        otherPrepayment: 200,
      });
      // quoteCancellation 自己的算法：depositRefund = 2 × depositPaid（已內含加碼），
      // totalCashDue = depositRefund + otherPrepaymentRefund，不會再加一次 statutoryCompensation。
      expect(quote.depositRefund).toBe(2000);
      expect(quote.statutoryCompensation).toBe(1000);
      expect(quote.totalCashDue).toBe(2200); // 2000 + 200，不是 3000 + 200

      const kase = s.createCase({
        bookingId: 'b1',
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        reason: 'vehicle_breakdown',
        requestedAt: '2026-07-10T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 1000,
        originalOtherPrepayment: 200,
        quote,
      });

      // refundLines 為了對帳仍會列出 deposit（2000）與 statutory_compensation（1000）兩條明細，
      // 加總會是 3200——這正是曾經存在的 bug：totalDisposableAmount() 過去直接加總這份明細，
      // 導致多算了一筆 1000 元的訂金。現在必須直接讀 totalCashDue，等於 2200，不是 3200。
      expect(kase.refundLines).toEqual([
        { label: 'deposit', amount: 2000 },
        { label: 'other_prepayment', amount: 200 },
        { label: 'statutory_compensation', amount: 1000 },
      ]);
      expect(s.totalDisposableAmount(kase)).toBe(2200);
    });

    it('未收定金：應退總額是其他預付款加約定總租金（此分支本來就沒有重疊問題，補上回歸測試）', () => {
      const { store: s } = createFixture();
      const quote = s.quote({
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
        pickupAt: '2026-07-18T09:00:00+08:00',
        depositPaid: 0,
        otherPrepayment: 200,
        agreedRentalTotal: 4000,
      });
      expect(quote.totalCashDue).toBe(4200); // 200 + 4000

      const kase = s.createCase({
        bookingId: 'b1',
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        reason: 'vehicle_breakdown',
        requestedAt: '2026-07-10T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 0,
        originalOtherPrepayment: 200,
        quote,
      });

      expect(s.totalDisposableAmount(kase)).toBe(4200);
    });

    it('已收定金案件的撥付金額必須用正確的 totalCashDue（2200），用舊的錯誤加總（3200）會被拒絕', () => {
      const { store: s } = createFixture();
      const quote = s.quote({
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
        pickupAt: '2026-07-18T09:00:00+08:00',
        depositPaid: 1000,
        otherPrepayment: 200,
      });
      const kase = s.createCase({
        bookingId: 'b1',
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        reason: 'vehicle_breakdown',
        requestedAt: '2026-07-10T10:00:00+08:00',
        ruleVersion: '2026.1',
        originalDepositPaid: 1000,
        originalOtherPrepayment: 200,
        quote,
      });

      // 用舊 bug 會算出的錯誤總額（3200）撥付：現在必須被金額不符擋下，不能真的多退 1000 元。
      expect(() =>
        s.disposeCase({
          caseId: kase.id,
          disposition: 'refund',
          refundAmount: 3200,
          creditAmount: 0,
          actor: { actorId: 'staff1', actorName: 'staff1' },
          occurredAt: '2026-07-10T10:30:00.000Z',
        }),
      ).toThrow(DispositionAmountMismatchError);

      // 用正確總額（2200）撥付才會成功。
      const result = s.disposeCase({
        caseId: kase.id,
        disposition: 'refund',
        refundAmount: 2200,
        creditAmount: 0,
        actor: { actorId: 'staff1', actorName: 'staff1' },
        occurredAt: '2026-07-10T10:30:00.000Z',
      });
      expect(result.refund?.amount).toBe(2200);
      expect(result.case.status).toBe('settled');
    });
  });
});
