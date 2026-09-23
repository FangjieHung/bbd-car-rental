import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AuditEntry,
  CancellationCase,
  ChargeAdjustment,
  ContractVersion,
  CustomerCreditLedgerEntry,
  Member,
  OperatorRecoveryCase,
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
  CONTRACT_VERSION_REPO,
  CUSTOMER_CREDIT_LEDGER_REPO,
  MAINTENANCE_REPO,
  MEMBER_REPO,
  OPERATOR_RECOVERY_CASE_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { ReminderGateway } from '../../core/services/reminder.gateway';
import { OrderStore } from '../order/order.store';
import { VehicleStore } from '../vehicle/vehicle.store';
import { ContractStore } from '../contract/contract.store';
import { CancellationStore, CreditConsentRequiredError } from '../cancellation/cancellation.store';
import {
  ApprovalRequiredError,
  CaseNotInProgressError,
  ConsentRequiredError,
  EscalationRequiresAllRemedyAttemptsError,
  OperatorRecoveryStore,
  RemedyOutOfOrderError,
  RemedyVehicleUnavailableError,
} from './operator-recovery.store';

const T_START = '2026-08-20T09:00:00.000Z';
const T_END = '2026-08-22T18:00:00.000Z';

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
    seats: 5,
    luggage: 2,
    hasAirConditioner: true,
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

function makeContractVersion(partial: Partial<ContractVersion> = {}): ContractVersion {
  return {
    id: 'cv1',
    bookingId: 'b1',
    version: 1,
    status: 'signed',
    snapshot: {
      renter: { memberId: 'm1', name: '王小明', phone: '0900000000' },
      driver: { memberId: 'm1', name: '王小明', phone: '0900000000' },
      vehicle: {
        vehicleId: 'v1',
        plateNumber: 'A-1',
        brand: 'Toyota',
        model: 'Yaris',
        category: 'car',
      },
      rentalStartTime: T_START,
      rentalEndTime: T_END,
      pickupBranchId: '馬公',
      returnBranchId: '馬公',
      depositRequired: 1000,
      pricing: {
        dailyLines: [],
        rentalRaw: 2000,
        tierDiscountPercent: 0,
        tierDiscountAmount: 0,
        rentalSubtotal: 2000,
        partnerDiscountPercent: 0,
        partnerDiscount: 0,
        addOnLines: [],
        addOnSubtotal: 0,
        insuranceSubtotal: 0,
        couponDiscount: 0,
        total: 2000,
      },
      disclosedRules: { cancellationContractKind: 'passenger_car', cancellationRuleVersion: '2026.1' },
    },
    createdAt: T_START,
    signedAt: T_START,
    ...partial,
  };
}

function createFixture(
  options: {
    vehicles?: Vehicle[];
    order?: Partial<RentalOrder>;
    contracts?: ContractVersion[];
  } = {},
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: OPERATOR_RECOVERY_CASE_REPO, useValue: createInMemoryRepo<OperatorRecoveryCase>() },
      { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>() },
      { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>() },
      { provide: ORDER_REPO, useValue: createInMemoryRepo<RentalOrder>([makeOrder(options.order)]) },
      {
        provide: VEHICLE_REPO,
        useValue: createInMemoryRepo<Vehicle>(options.vehicles ?? [makeVehicle()]),
      },
      { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember()]) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<{ id: string }>([]) },
      { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>(options.contracts ?? []) },
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

  return {
    store: TestBed.inject(OperatorRecoveryStore),
    orderStore: TestBed.inject(OrderStore),
    vehicleStore: TestBed.inject(VehicleStore),
    contractStore: TestBed.inject(ContractStore),
    cancellationStore: TestBed.inject(CancellationStore),
  };
}

const ACTOR = { actorId: 'staff1', actorName: '櫃檯甲' };

describe('OperatorRecoveryStore', () => {
  describe.each([
    ['vehicle_breakdown' as const, '車輛故障'],
    ['oversell' as const, '超賣'],
    ['staff_dispatch_error' as const, '人員調度失誤'],
  ])('情境：%s（%s）', (reason: 'vehicle_breakdown' | 'oversell' | 'staff_dispatch_error', _label: string) => {
    it('建立案件後狀態為 in_progress，且留存發現與通知時間', () => {
      const { store } = createFixture();
      const kase = store.createCase({
        bookingId: 'b1',
        reason,
        discoveredAt: '2026-08-18T08:00:00.000Z',
        notifiedAt: '2026-08-18T08:30:00.000Z',
        actor: ACTOR,
      });
      expect(kase.status).toBe('in_progress');
      expect(kase.discoveredAt).toBe('2026-08-18T08:00:00.000Z');
      expect(kase.notifiedAt).toBe('2026-08-18T08:30:00.000Z');
      expect(kase.remedyAttempts).toEqual([]);
      expect(kase.createdBy).toBe('櫃檯甲');
    });
  });

  describe('補救方案的順序', () => {
    it('必須依序嘗試：跳過同級調車直接嘗試免費升等會丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle(), makeVehicle({ id: 'v2' })] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'free_upgrade',
          attemptedAt: T_START,
          outcome: 'declined',
          notedBy: '櫃檯甲',
        }),
      ).toThrow(RemedyOutOfOrderError);
    });

    it('同級調車被拒後才能嘗試免費升等；免費升等前再嘗試合作同業轉單一樣會丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle(), makeVehicle({ id: 'v2' })] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'oversell',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      const afterSameClass = store.attemptRemedy({
        caseId: kase.id,
        type: 'same_class_replacement',
        attemptedAt: T_START,
        outcome: 'declined',
        notedBy: '櫃檯甲',
      });
      expect(afterSameClass.remedyAttempts).toHaveLength(1);
      expect(afterSameClass.status).toBe('in_progress');

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'partner_transfer',
          attemptedAt: T_START,
          outcome: 'declined',
          notedBy: '櫃檯甲',
          partnerName: '合作業者',
          externalQuoteAmount: 3000,
        }),
      ).toThrow(RemedyOutOfOrderError);
    });

    it('三個補救方案皆已嘗試後，第四次呼叫 attemptRemedy 一樣會丟錯（須改用 escalateToCancellation）', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'oversell',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      store.attemptRemedy({ caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });
      store.attemptRemedy({ caseId: kase.id, type: 'free_upgrade', attemptedAt: T_START, outcome: 'declined', notedBy: '櫃檯甲' });
      store.attemptRemedy({
        caseId: kase.id,
        type: 'partner_transfer',
        attemptedAt: T_START,
        outcome: 'declined',
        notedBy: '櫃檯甲',
        partnerName: '合作業者',
        externalQuoteAmount: 3000,
      });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'same_class_replacement',
          attemptedAt: T_START,
          outcome: 'declined',
          notedBy: '櫃檯甲',
        }),
      ).toThrow(RemedyOutOfOrderError);
    });
  });

  describe('同級調車 / 免費升等：接受時更新車輛並觸發新合約版本', () => {
    it('同級調車被接受：訂單車輛更新、合約產生新版本、案件狀態為 resolved', () => {
      const { store, orderStore, contractStore } = createFixture({
        vehicles: [makeVehicle(), makeVehicle({ id: 'v2', plateNumber: 'A-2', status: 'available' })],
        contracts: [makeContractVersion()],
      });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      const updated = store.attemptRemedy({
        caseId: kase.id,
        type: 'same_class_replacement',
        attemptedAt: T_START,
        outcome: 'accepted',
        replacementVehicleId: 'v2',
        customerConsent: true,
        approvedBy: '店長乙',
        notedBy: '櫃檯甲',
      });

      expect(updated.status).toBe('resolved');
      expect(updated.resolvedRemedyType).toBe('same_class_replacement');
      expect(orderStore.orders().find((b) => b.id === 'b1')?.vehicleId).toBe('v2');

      const versions = contractStore.versionsFor('b1');
      expect(versions).toHaveLength(2);
      expect(versions[0].status).toBe('superseded');
      expect(versions[1].snapshot.vehicle.vehicleId).toBe('v2');
      expect(updated.remedyAttempts[0].contractVersionId).toBe(versions[1].id);
    });

    it('免費升等被接受：顧客價格（訂單本身）不變動，價差記為業者吸收', () => {
      const { store, orderStore } = createFixture({
        vehicles: [
          makeVehicle(),
          makeVehicle({
            id: 'v2', plateNumber: 'A-2', classLabel: '休旅車', seats: 7, luggage: 4, status: 'available',
          }),
        ],
        contracts: [makeContractVersion()],
      });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'oversell',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      store.attemptRemedy({ caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });

      const before = orderStore.orders().find((b) => b.id === 'b1');
      const updated = store.attemptRemedy({
        caseId: kase.id,
        type: 'free_upgrade',
        attemptedAt: T_START,
        outcome: 'accepted',
        replacementVehicleId: 'v2',
        absorbedDifference: 500,
        customerConsent: true,
        approvedBy: '店長乙',
        notedBy: '櫃檯甲',
      });

      const after = orderStore.orders().find((b) => b.id === 'b1');
      expect(after?.priceBreakdown).toEqual(before?.priceBreakdown);
      expect(after?.depositRequired).toBe(before?.depositRequired);
      expect(updated.remedyAttempts[1].absorbedDifference).toBe(500);
      expect(updated.status).toBe('resolved');
    });

    it('接受補救方案但未取得顧客明確同意時丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle(), makeVehicle({ id: 'v2' })] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'same_class_replacement',
          attemptedAt: T_START,
          outcome: 'accepted',
          replacementVehicleId: 'v2',
          customerConsent: false,
          approvedBy: '店長乙',
          notedBy: '櫃檯甲',
        }),
      ).toThrow(ConsentRequiredError);
    });

    it('接受補救方案但缺核准人時丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle(), makeVehicle({ id: 'v2' })] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'same_class_replacement',
          attemptedAt: T_START,
          outcome: 'accepted',
          replacementVehicleId: 'v2',
          customerConsent: true,
          notedBy: '櫃檯甲',
        }),
      ).toThrow(ApprovalRequiredError);
    });

    it('重新檢查可用性：替代車輛非 available 狀態時丟錯，不更新訂單', () => {
      const { store, orderStore } = createFixture({
        vehicles: [makeVehicle(), makeVehicle({ id: 'v2', status: 'rented' })],
      });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'same_class_replacement',
          attemptedAt: T_START,
          outcome: 'accepted',
          replacementVehicleId: 'v2',
          customerConsent: true,
          approvedBy: '店長乙',
          notedBy: '櫃檯甲',
        }),
      ).toThrow(RemedyVehicleUnavailableError);
      expect(orderStore.orders().find((b) => b.id === 'b1')?.vehicleId).toBe('v1');
    });

    it('跨車種替代即使可用也會被拒絕，不能把訂單換成不相容車種', () => {
      const { store, orderStore } = createFixture({
        vehicles: [
          makeVehicle(),
          makeVehicle({
            id: 'v2', category: 'scooter', plateNumber: 'M-2', seats: 2, luggage: 1,
            hasAirConditioner: false, status: 'available',
          }),
        ],
      });
      const kase = store.createCase({
        bookingId: 'b1', reason: 'vehicle_breakdown', discoveredAt: T_START, notifiedAt: T_START, actor: ACTOR,
      });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'accepted',
          replacementVehicleId: 'v2', customerConsent: true, approvedBy: '店長乙', notedBy: '櫃檯甲',
        }),
      ).toThrow('不符合此補救方案的車種／載客能力門檻');
      expect(orderStore.orders().find((b) => b.id === 'b1')?.vehicleId).toBe('v1');
    });

    it('案件已解決後不可再嘗試補救方案', () => {
      const { store } = createFixture({
        vehicles: [makeVehicle(), makeVehicle({ id: 'v2', status: 'available' })],
      });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      store.attemptRemedy({
        caseId: kase.id,
        type: 'same_class_replacement',
        attemptedAt: T_START,
        outcome: 'accepted',
        replacementVehicleId: 'v2',
        customerConsent: true,
        approvedBy: '店長乙',
        notedBy: '櫃檯甲',
      });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'free_upgrade',
          attemptedAt: T_START,
          outcome: 'declined',
          notedBy: '櫃檯甲',
        }),
      ).toThrow(CaseNotInProgressError);
    });
  });

  describe('合作同業轉單', () => {
    it('轉單被接受：記錄合作業者、外部報價、差額與顧客同意，不影響本社車輛／合約', () => {
      const { store, orderStore, contractStore } = createFixture({
        vehicles: [makeVehicle()],
        contracts: [makeContractVersion()],
      });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'oversell',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      store.attemptRemedy({ caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });
      store.attemptRemedy({ caseId: kase.id, type: 'free_upgrade', attemptedAt: T_START, outcome: 'declined', notedBy: '櫃檯甲' });

      const updated = store.attemptRemedy({
        caseId: kase.id,
        type: 'partner_transfer',
        attemptedAt: T_START,
        outcome: 'accepted',
        partnerName: '離島租車行',
        externalVehicleDescription: 'Toyota Altis 同款',
        externalQuoteAmount: 2500,
        absorbedDifference: 500,
        customerConsent: true,
        approvedBy: '店長乙',
        notedBy: '櫃檯甲',
      });

      expect(updated.status).toBe('resolved');
      expect(updated.resolvedRemedyType).toBe('partner_transfer');
      const attempt = updated.remedyAttempts[2];
      expect(attempt.partnerName).toBe('離島租車行');
      expect(attempt.externalQuoteAmount).toBe(2500);
      expect(attempt.absorbedDifference).toBe(500);
      // 合作同業轉單不是本社車輛，不觸發車輛更新或合約新版本
      expect(orderStore.orders().find((b) => b.id === 'b1')?.vehicleId).toBe('v1');
      expect(contractStore.versionsFor('b1')).toHaveLength(1);
    });

    it('外部報價金額須為非負整數（新台幣無小數位）：非整數會丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'oversell',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      store.attemptRemedy({ caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });
      store.attemptRemedy({ caseId: kase.id, type: 'free_upgrade', attemptedAt: T_START, outcome: 'declined', notedBy: '櫃檯甲' });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'partner_transfer',
          attemptedAt: T_START,
          outcome: 'declined',
          partnerName: '離島租車行',
          externalQuoteAmount: 2500.5,
          notedBy: '櫃檯甲',
        }),
      ).toThrow(RangeError);
      // 拒絕時不寫入任何嘗試紀錄，不能留下一筆金額有問題的稽核資料
      expect(store.cases().find((c) => c.id === kase.id)?.remedyAttempts).toHaveLength(2);
    });

    it('外部報價金額須為非負整數：負數會丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'oversell',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      store.attemptRemedy({ caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });
      store.attemptRemedy({ caseId: kase.id, type: 'free_upgrade', attemptedAt: T_START, outcome: 'declined', notedBy: '櫃檯甲' });

      expect(() =>
        store.attemptRemedy({
          caseId: kase.id,
          type: 'partner_transfer',
          attemptedAt: T_START,
          outcome: 'declined',
          partnerName: '離島租車行',
          externalQuoteAmount: -100,
          notedBy: '櫃檯甲',
        }),
      ).toThrow(RangeError);
      expect(store.cases().find((c) => c.id === kase.id)?.remedyAttempts).toHaveLength(2);
    });
  });

  describe('業者責任取消（只在三個補救方案皆失敗後才可進入）', () => {
    function exhaustAllRemedies(store: OperatorRecoveryStore, caseId: string) {
      store.attemptRemedy({ caseId, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });
      store.attemptRemedy({ caseId, type: 'free_upgrade', attemptedAt: T_START, outcome: 'declined', notedBy: '櫃檯甲' });
      store.attemptRemedy({
        caseId,
        type: 'partner_transfer',
        attemptedAt: T_START,
        outcome: 'declined',
        notedBy: '櫃檯甲',
        partnerName: '離島租車行',
        externalQuoteAmount: 3000,
      });
    }

    it('尚未嘗試完三個補救方案就呼叫 escalateToCancellation 會丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      store.attemptRemedy({ caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });

      expect(() =>
        store.escalateToCancellation({
          caseId: kase.id,
          contractKind: 'passenger_car',
          requestedAt: '2026-08-19T10:00:00+08:00',
          ruleVersion: '2026.1',
          depositPaid: 1000,
          otherPrepayment: 0,
          actor: ACTOR,
          approvedBy: '店長乙',
        }),
      ).toThrow(EscalationRequiresAllRemedyAttemptsError);
    });

    it('三個方案皆失敗後可進入業者責任取消：已收定金加倍退還訂金，且免收轉單手續費', () => {
      const { store, cancellationStore } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      exhaustAllRemedies(store, kase.id);

      const { case: updated, cancellationCase } = store.escalateToCancellation({
        caseId: kase.id,
        contractKind: 'passenger_car',
        requestedAt: '2026-08-19T10:00:00+08:00',
        ruleVersion: '2026.1',
        depositPaid: 1000,
        otherPrepayment: 0,
        actor: ACTOR,
        approvedBy: '店長乙',
      });

      expect(updated.status).toBe('escalated_to_cancellation');
      expect(updated.cancellationCaseId).toBe(cancellationCase.id);
      expect(cancellationCase.responsibility).toBe('operator_fault');
      expect(cancellationCase.status).toBe('quoted');
      expect(cancellationCase.transferFee).toBe(0);
      expect(cancellationCase.totalCashDue).toBe(2000); // 訂金兩倍
      expect(cancellationStore.casesFor('b1')).toHaveLength(1);
    });

    it('缺核准人時無法進入業者責任取消', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      exhaustAllRemedies(store, kase.id);

      expect(() =>
        store.escalateToCancellation({
          caseId: kase.id,
          contractKind: 'passenger_car',
          requestedAt: '2026-08-19T10:00:00+08:00',
          ruleVersion: '2026.1',
          depositPaid: 1000,
          otherPrepayment: 0,
          actor: ACTOR,
          approvedBy: '',
        }),
      ).toThrow(ApprovalRequiredError);
    });

    it('業者故意違約：即使補救方案已窮盡，仍轉 manual_review，不由系統自動試算金額', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'other_attributable',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      exhaustAllRemedies(store, kase.id);

      const { cancellationCase } = store.escalateToCancellation({
        caseId: kase.id,
        contractKind: 'passenger_car',
        requestedAt: '2026-08-19T10:00:00+08:00',
        ruleVersion: '2026.1',
        depositPaid: 1000,
        otherPrepayment: 0,
        intentionalConduct: true,
        actor: ACTOR,
        approvedBy: '店長乙',
      });

      expect(cancellationCase.status).toBe('manual_review');
      expect(cancellationCase.responsibility).toBe('operator_intentional');
      expect(cancellationCase.totalCashDue).toBe(0);
    });

    it('顧客提出其他損害待鑑定：也轉 manual_review', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      exhaustAllRemedies(store, kase.id);

      const { cancellationCase } = store.escalateToCancellation({
        caseId: kase.id,
        contractKind: 'passenger_car',
        requestedAt: '2026-08-19T10:00:00+08:00',
        ruleVersion: '2026.1',
        depositPaid: 1000,
        otherPrepayment: 0,
        additionalCustomerDamageClaimed: true,
        actor: ACTOR,
        approvedBy: '店長乙',
      });

      expect(cancellationCase.status).toBe('manual_review');
    });

    it('進入業者責任取消後，不能強迫顧客把應退現金轉成保留金（沿用既有 CancellationStore 規則）', () => {
      const { store, cancellationStore } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });
      exhaustAllRemedies(store, kase.id);

      const { cancellationCase } = store.escalateToCancellation({
        caseId: kase.id,
        contractKind: 'passenger_car',
        requestedAt: '2026-08-19T10:00:00+08:00',
        ruleVersion: '2026.1',
        depositPaid: 1000,
        otherPrepayment: 0,
        actor: ACTOR,
        approvedBy: '店長乙',
      });

      expect(() =>
        cancellationStore.disposeCase({
          caseId: cancellationCase.id,
          disposition: 'credit',
          refundAmount: 0,
          creditAmount: cancellationCase.totalCashDue,
          actor: ACTOR,
          occurredAt: '2026-08-19T10:30:00.000Z',
        }),
      ).toThrow(CreditConsentRequiredError);
    });
  });

  describe('額外補償：計程車車資補貼與善意補償各自獨立，不抵銷法定現金', () => {
    it('計程車車資補貼須有核准人，且不影響案件的統計現金賠償', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      expect(() =>
        store.recordTaxiReimbursement({
          caseId: kase.id,
          amount: 300,
          occurredAt: T_START,
          notedBy: '櫃檯甲',
          approvedBy: '',
        }),
      ).toThrow(ApprovalRequiredError);

      const updated = store.recordTaxiReimbursement({
        caseId: kase.id,
        amount: 300,
        evidenceAssetId: 'asset-taxi-1',
        occurredAt: T_START,
        notedBy: '櫃檯甲',
        approvedBy: '店長乙',
      });
      expect(updated.taxiReimbursements).toHaveLength(1);
      expect(updated.taxiReimbursements[0].amount).toBe(300);
      expect(updated.taxiReimbursements[0].evidenceAssetId).toBe('asset-taxi-1');
    });

    it('善意補償（保留金／折價券）獨立記錄，且不會被拿去折抵業者責任取消的法定現金賠償', () => {
      const { store, cancellationStore } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      const updated = store.recordGoodwillCompensation({
        caseId: kase.id,
        type: 'credit',
        amount: 200,
        occurredAt: T_START,
        notedBy: '櫃檯甲',
        approvedBy: '店長乙',
      });
      expect(updated.goodwillCompensations).toHaveLength(1);
      expect(updated.goodwillCompensations[0].type).toBe('credit');

      store.attemptRemedy({ caseId: kase.id, type: 'same_class_replacement', attemptedAt: T_START, outcome: 'unavailable', notedBy: '櫃檯甲' });
      store.attemptRemedy({ caseId: kase.id, type: 'free_upgrade', attemptedAt: T_START, outcome: 'declined', notedBy: '櫃檯甲' });
      store.attemptRemedy({
        caseId: kase.id,
        type: 'partner_transfer',
        attemptedAt: T_START,
        outcome: 'declined',
        notedBy: '櫃檯甲',
        partnerName: '離島租車行',
        externalQuoteAmount: 3000,
      });

      const { cancellationCase } = store.escalateToCancellation({
        caseId: kase.id,
        contractKind: 'passenger_car',
        requestedAt: '2026-08-19T10:00:00+08:00',
        ruleVersion: '2026.1',
        depositPaid: 1000,
        otherPrepayment: 0,
        actor: ACTOR,
        approvedBy: '店長乙',
      });

      // 200 元的善意保留金完全不影響法定現金賠償（訂金兩倍 = 2000），兩本帳分開。
      expect(cancellationCase.totalCashDue).toBe(2000);
      expect(cancellationStore.casesFor('b1')[0].totalCashDue).toBe(2000);

      const finalCase = store.cases().find((c) => c.id === kase.id);
      expect(finalCase?.goodwillCompensations).toHaveLength(1);
    });

    it('善意補償缺核准人時丟錯', () => {
      const { store } = createFixture({ vehicles: [makeVehicle()] });
      const kase = store.createCase({
        bookingId: 'b1',
        reason: 'vehicle_breakdown',
        discoveredAt: T_START,
        notifiedAt: T_START,
        actor: ACTOR,
      });

      expect(() =>
        store.recordGoodwillCompensation({
          caseId: kase.id,
          type: 'coupon',
          amount: 100,
          occurredAt: T_START,
          notedBy: '櫃檯甲',
          approvedBy: '',
        }),
      ).toThrow(ApprovalRequiredError);
    });
  });
});
