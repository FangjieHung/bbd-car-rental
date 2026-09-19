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
  RentalBooking,
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
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { BookingStore } from '../booking/booking.store';
import { PaymentStore } from '../payment/payment.store';
import { CreditStore } from '../credit/credit.store';
import {
  CancellationDispositionPartialFailureError,
  CaseNotReadyForDispositionError,
  CreditConsentRequiredError,
  DispositionAmountMismatchError,
  ForceMajeureApprovalRequiredError,
  ForceMajeureEvidenceRequiredError,
  TransferFeeApprovalRequiredError,
} from './cancellation.store';
import { CancellationStore } from './cancellation.store';

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

function createFixture(options: { vehicle?: Partial<Vehicle>; booking?: Partial<RentalBooking> } = {}) {
  // 允許在同一個 it() 內（外層 beforeEach 已建立一次 TestBed 之後）重新配置一份帶自訂
  // booking／vehicle 的 fixture——resetTestingModule() 先清空，避免「TestBed 已實例化」錯誤。
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>() },
      { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>() },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([makeBooking(options.booking)]) },
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle(options.vehicle)]) },
      { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember()]) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<{ id: string }>([]) },
      { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
      { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
      { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
      { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>([]) },
    ],
  });

  return {
    store: TestBed.inject(CancellationStore),
    bookingStore: TestBed.inject(BookingStore),
    paymentStore: TestBed.inject(PaymentStore),
    creditStore: TestBed.inject(CreditStore),
    auditRepo: TestBed.inject(AUDIT_ENTRY_REPO),
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
      const { store: s, bookingStore, paymentStore } = createFixture();
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
      expect(bookingStore.bookings().find((b) => b.id === 'b1')?.status).toBe('cancelled');
      // 付款歷史從未被刪除，仍看得到原始訂金收款紀錄
      expect(paymentStore.paymentsFor('b1')).toHaveLength(1);
    });

    it('全部轉保留金但未取得顧客同意時丟錯，不寫入任何撥付紀錄', () => {
      const { store: s, creditStore, bookingStore } = createFixture();
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
      expect(bookingStore.bookings().find((b) => b.id === 'b1')?.status).toBe('reserved');
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
      const { store: s, bookingStore } = createFixture();
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
      expect(bookingStore.bookings().find((b) => b.id === 'b1')?.status).toBe('cancelled');
    });

    it('訂單已非 reserved 時撥付於訂單轉換步驟失敗，回報已完成步驟且不遺失已建立的退款紀錄', () => {
      const { store: s, bookingStore, paymentStore } = createFixture({ booking: { status: 'in_progress' } });
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
      expect(bookingStore.bookings().find((b) => b.id === 'b1')?.status).toBe('in_progress');
    });
  });
});
