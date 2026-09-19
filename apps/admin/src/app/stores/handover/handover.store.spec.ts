import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AuditEntry,
  HandoverRecord,
  PickupReadinessInput,
  RentalBooking,
  Repository,
  ReturnChargeInput,
  Vehicle,
} from '@car-rental/domain';
import {
  AUDIT_ENTRY_REPO,
  BOOKING_REPO,
  CHARGE_ADJUSTMENT_REPO,
  HANDOVER_RECORD_REPO,
  MAINTENANCE_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import {
  HandoverOrchestrationPartialFailureError,
  HandoverStore,
  PickupBlockedError,
  PickupOverrideNotAllowedError,
  SupervisorOverrideInvalidError,
} from './handover.store';
import { BookingStore } from '../booking/booking.store';
import { VehicleStore } from '../vehicle/vehicle.store';
import { PaymentStore } from '../payment/payment.store';

const T_PICKUP_DUE = '2026-07-20T09:00:00.000Z';
const T_RETURN_DUE = '2026-07-22T18:00:00.000Z';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'A-1',
    category: 'scooter',
    model: 'X',
    brand: 'Gogoro',
    year: 2022,
    status: 'available',
    mileage: 1000,
    createdAt: T_PICKUP_DUE,
    ...partial,
  };
}

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: T_PICKUP_DUE,
    endTime: T_RETURN_DUE,
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  };
}

/** 完全放行、無阻擋也無警示的基準就緒輸入；各測項只覆寫要觸發的那個欄位。 */
function readyReadinessInput(overrides: Partial<PickupReadinessInput> = {}): PickupReadinessInput {
  return {
    evaluatedAt: T_PICKUP_DUE,
    depositRequired: 0,
    depositPaid: 0,
    latestContractSigned: true,
    requiredDocuments: [],
    driverCredential: {
      present: true,
      matchesVehicleClass: true,
      isForeignVisitor: false,
      reciprocityStatus: 'not_applicable',
    },
    originalDocumentCheckedThisVisit: true,
    vehicle: { status: 'available', hasSchedulingConflict: false },
    memberEmail: 'member@example.com',
    ...overrides,
  };
}

function baseRecordInput(overrides: Partial<Omit<HandoverRecord, 'id' | 'kind' | 'bookingId'>> = {}) {
  return {
    actualAt: T_PICKUP_DUE,
    mileage: 1000,
    energyLevel: 8,
    photoAssetIds: ['asset-1'],
    originalDocumentChecked: true,
    operatorConfirmation: { confirmedBy: 'staff1', confirmedAt: T_PICKUP_DUE },
    ...overrides,
  };
}

/** 拋出可預期錯誤的 handover record repo：驗證 save_record 步驟失敗時的部分失敗回報。 */
function createFailingCreateRepo<T extends { id: string }>(): Repository<T> {
  const inner = createInMemoryRepo<T>();
  return {
    ...inner,
    create: () => {
      throw new Error('write failed');
    },
  };
}

describe('HandoverStore', () => {
  let handoverStore: HandoverStore;
  let bookingStore: BookingStore;
  let vehicleStore: VehicleStore;
  let paymentStore: PaymentStore;
  let auditRepo: Repository<AuditEntry>;

  function configure(options: {
    vehicle?: Partial<Vehicle>;
    booking?: Partial<RentalBooking>;
    handoverRepo?: Repository<HandoverRecord>;
  } = {}) {
    auditRepo = createInMemoryRepo<AuditEntry>();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle(options.vehicle)]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([makeBooking(options.booking)]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo() },
        { provide: PAYMENT_REPO, useValue: createInMemoryRepo() },
        { provide: REFUND_REPO, useValue: createInMemoryRepo() },
        { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo() },
        {
          provide: HANDOVER_RECORD_REPO,
          useValue: options.handoverRepo ?? createInMemoryRepo<HandoverRecord>(),
        },
        { provide: AUDIT_ENTRY_REPO, useValue: auditRepo },
      ],
    });
    handoverStore = TestBed.inject(HandoverStore);
    bookingStore = TestBed.inject(BookingStore);
    vehicleStore = TestBed.inject(VehicleStore);
    paymentStore = TestBed.inject(PaymentStore);
  }

  beforeEach(() => configure());

  it('依序記錄取車與還車紀錄，各自可依訂單查到對應那一筆', () => {
    expect(handoverStore.pickupFor('b1')).toBeUndefined();

    const pickup = handoverStore.recordPickup({
      bookingId: 'b1',
      actualAt: '2026-07-20T09:10:00.000Z',
      mileage: 1000,
      energyLevel: 8,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: 'staff1', confirmedAt: '2026-07-20T09:10:00.000Z' },
    });
    expect(pickup.kind).toBe('pickup');
    expect(handoverStore.pickupFor('b1')?.id).toBe(pickup.id);
    expect(handoverStore.returnFor('b1')).toBeUndefined();

    const ret = handoverStore.recordReturn({
      bookingId: 'b1',
      actualAt: '2026-07-22T18:30:00.000Z',
      mileage: 1150,
      energyLevel: 6,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: 'staff1', confirmedAt: '2026-07-22T18:30:00.000Z' },
    });
    expect(ret.kind).toBe('return');
    expect(handoverStore.returnFor('b1')?.id).toBe(ret.id);
    expect(handoverStore.recordsFor('b1')).toHaveLength(2);
  });

  it('evaluateReadiness／calculateCharges 直接委派給 Task 5 純函式', () => {
    const readiness = handoverStore.evaluateReadiness(readyReadinessInput());
    expect(readiness.ready).toBe(true);

    const charges = handoverStore.calculateCharges({
      scheduledReturnAt: T_RETURN_DUE,
      actualReturnAt: T_RETURN_DUE,
      lateReturnPolicy: { graceMinutes: 15, unitMinutes: 30, feePerUnit: 100, dailyCap: 1000 },
      energyReturnPolicy: { measure: 'eighths', feePerUnit: 50, serviceFee: 100 },
      pickupEnergyLevel: 8,
      returnEnergyLevel: 8,
    });
    expect(charges.finalTotalCharge).toBe(0);
  });

  describe('performPickup — 阻擋與覆核', () => {
    it('未達訂金門檻：一般取車被擋，不建立紀錄、車輛與訂單狀態不變', () => {
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput: readyReadinessInput({ depositRequired: 1000, depositPaid: 0 }),
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        }),
      ).toThrow(PickupBlockedError);
      expect(handoverStore.pickupFor('b1')).toBeUndefined();
      expect(vehicleStore.vehicles()[0].status).toBe('available');
      expect(bookingStore.bookings()[0].status).toBe('reserved');
    });

    it('最新合約未簽署：一般取車被擋', () => {
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput: readyReadinessInput({ latestContractSigned: false }),
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        }),
      ).toThrow(PickupBlockedError);
      expect(handoverStore.pickupFor('b1')).toBeUndefined();
    });

    it('必要身分文件缺失：一般取車被擋', () => {
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput: readyReadinessInput({
            requiredDocuments: [{ kind: 'taiwan_id', present: false }],
          }),
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        }),
      ).toThrow(PickupBlockedError);
      expect(handoverStore.pickupFor('b1')).toBeUndefined();
    });

    it('本次尚未確認核對證件正本：一般取車被擋', () => {
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput: readyReadinessInput({ originalDocumentCheckedThisVisit: false }),
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        }),
      ).toThrow(PickupBlockedError);
      expect(handoverStore.pickupFor('b1')).toBeUndefined();
    });

    it('外國旅客互惠資格不符：屬於法律資格類別，即使提供完整主管覆核也不得放行', () => {
      const readinessInput = readyReadinessInput({
        driverCredential: {
          present: true,
          matchesVehicleClass: true,
          isForeignVisitor: true,
          reciprocityStatus: 'ineligible',
        },
      });
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput,
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
          supervisorOverride: { actorId: 'mgr1', actorName: '主管王', reason: '同意放行' },
        }),
      ).toThrow(PickupOverrideNotAllowedError);
      expect(handoverStore.pickupFor('b1')).toBeUndefined();
      expect(vehicleStore.vehicles()[0].status).toBe('available');
    });

    it('准駕車種不符：屬於法律資格類別，即使提供完整主管覆核也不得放行', () => {
      const readinessInput = readyReadinessInput({
        driverCredential: {
          present: true,
          matchesVehicleClass: false,
          isForeignVisitor: false,
          reciprocityStatus: 'not_applicable',
        },
      });
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput,
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
          supervisorOverride: { actorId: 'mgr1', actorName: '主管王', reason: '同意放行' },
        }),
      ).toThrow(PickupOverrideNotAllowedError);
    });

    it('車輛維修中不可交付：屬於車輛安全類別，即使提供完整主管覆核也不得放行', () => {
      const readinessInput = readyReadinessInput({
        vehicle: { status: 'maintenance', hasSchedulingConflict: false },
      });
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput,
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
          supervisorOverride: { actorId: 'mgr1', actorName: '主管王', reason: '同意放行' },
        }),
      ).toThrow(PickupOverrideNotAllowedError);
      expect(handoverStore.pickupFor('b1')).toBeUndefined();
    });

    it('只有警示（例如會員未留 Email）不會阻擋一般取車', () => {
      const readinessInput = readyReadinessInput({ memberEmail: undefined });
      const result = handoverStore.performPickup({
        bookingId: 'b1',
        readinessInput,
        record: baseRecordInput(),
        actor: { actorId: 'staff1', actorName: '櫃檯人員' },
      });
      expect(result.readiness.ready).toBe(true);
      expect(result.readiness.warnings.some((w) => w.type === 'missing_email')).toBe(true);
      expect(handoverStore.pickupFor('b1')?.id).toBe(result.record.id);
      expect(vehicleStore.vehicles()[0].status).toBe('rented');
      expect(bookingStore.bookings()[0].status).toBe('in_progress');
    });

    it('主管覆核缺操作人或理由：擲出 SupervisorOverrideInvalidError，不放行', () => {
      const readinessInput = readyReadinessInput({ depositRequired: 1000, depositPaid: 0 });
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput,
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
          supervisorOverride: { actorId: 'mgr1', actorName: '主管王', reason: '   ' },
        }),
      ).toThrow(SupervisorOverrideInvalidError);
      expect(() =>
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput,
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
          supervisorOverride: { actorId: 'mgr1', actorName: '', reason: '同意先行交車' },
        }),
      ).toThrow(SupervisorOverrideInvalidError);
      expect(handoverStore.pickupFor('b1')).toBeUndefined();
    });

    it('可覆核阻擋＋完整主管覆核：放行取車，並以 override 附加稽核紀錄（含操作人、理由、時間）', () => {
      const readinessInput = readyReadinessInput({ depositRequired: 1000, depositPaid: 0 });
      const result = handoverStore.performPickup({
        bookingId: 'b1',
        readinessInput,
        record: baseRecordInput(),
        actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        supervisorOverride: { actorId: 'mgr1', actorName: '主管王', reason: '訂金餘額改於還車時一併結清' },
      });

      expect(result.readiness.ready).toBe(false);
      expect(handoverStore.pickupFor('b1')?.id).toBe(result.record.id);
      expect(vehicleStore.vehicles()[0].status).toBe('rented');
      expect(bookingStore.bookings()[0].status).toBe('in_progress');

      const entries = auditRepo.getAll();
      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({
        action: 'override',
        entityType: 'handover_record',
        entityId: result.record.id,
        actorId: 'mgr1',
        actorName: '主管王',
        reason: '訂金餘額改於還車時一併結清',
      });
      expect(entries[0].createdAt).toBeTruthy();
    });
  });

  describe('performPickup — 正常放行的協調順序', () => {
    it('依序完成：存取車紀錄 → 車輛轉 rented → 訂單轉 in_progress → 附加稽核紀錄', () => {
      const result = handoverStore.performPickup({
        bookingId: 'b1',
        readinessInput: readyReadinessInput(),
        record: baseRecordInput(),
        actor: { actorId: 'staff1', actorName: '櫃檯人員' },
      });

      expect(handoverStore.pickupFor('b1')?.id).toBe(result.record.id);
      expect(vehicleStore.vehicles()[0].status).toBe('rented');
      expect(bookingStore.bookings()[0].status).toBe('in_progress');

      const entries = auditRepo.getAll();
      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({
        action: 'create',
        entityType: 'handover_record',
        entityId: result.record.id,
        actorId: 'staff1',
        actorName: '櫃檯人員',
      });
    });

    it('save_record 這一步失敗：擲出 partial failure 錯誤，已完成步驟為空，車輛與訂單不受影響', () => {
      configure({ handoverRepo: createFailingCreateRepo<HandoverRecord>() });

      let caught: unknown;
      try {
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput: readyReadinessInput(),
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(HandoverOrchestrationPartialFailureError);
      const err = caught as HandoverOrchestrationPartialFailureError;
      expect(err.phase).toBe('pickup');
      expect(err.completedSteps).toEqual([]);
      expect(err.failedStep).toBe('save_record');
      expect(vehicleStore.vehicles()[0].status).toBe('available');
      expect(bookingStore.bookings()[0].status).toBe('reserved');
    });

    it('車輛轉換這一步失敗（例如車輛已被其他訂單佔用）：紀錄已存但轉換未完成，回報已完成的步驟供重試判斷', () => {
      // 就緒輸入認為車輛 available（可能是稍早快照），但實際 VehicleStore 目前是 rented——
      // 模擬併發搶車的競態，驗證 performPickup 依實際狀態回報「哪一步真的成功」。
      configure({ vehicle: { status: 'rented' } });

      let caught: unknown;
      try {
        handoverStore.performPickup({
          bookingId: 'b1',
          readinessInput: readyReadinessInput(),
          record: baseRecordInput(),
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(HandoverOrchestrationPartialFailureError);
      const err = caught as HandoverOrchestrationPartialFailureError;
      expect(err.completedSteps).toEqual(['save_record']);
      expect(err.failedStep).toBe('vehicle_transition');
      expect(handoverStore.pickupFor('b1')).toBeDefined(); // 紀錄已寫入，不會憑空消失
      expect(bookingStore.bookings()[0].status).toBe('reserved');
    });
  });

  describe('performReturn', () => {
    function pickUpFirst() {
      handoverStore.performPickup({
        bookingId: 'b1',
        readinessInput: readyReadinessInput(),
        record: baseRecordInput(),
        actor: { actorId: 'staff1', actorName: '櫃檯人員' },
      });
    }

    const chargeInput = (overrides: Partial<ReturnChargeInput> = {}): ReturnChargeInput => ({
      scheduledReturnAt: T_RETURN_DUE,
      actualReturnAt: T_RETURN_DUE,
      lateReturnPolicy: { graceMinutes: 15, unitMinutes: 30, feePerUnit: 100, dailyCap: 1000 },
      energyReturnPolicy: { measure: 'eighths', feePerUnit: 50, serviceFee: 100 },
      pickupEnergyLevel: 8,
      returnEnergyLevel: 8,
      ...overrides,
    });

    it('試算階段（calculateCharges）本身不會建立任何 ChargeAdjustment——確認動作與試算分開', () => {
      pickUpFirst();
      const charges = handoverStore.calculateCharges(
        chargeInput({ actualReturnAt: '2026-07-22T19:00:00.000Z', returnEnergyLevel: 5 }),
      );
      expect(charges.finalTotalCharge).toBeGreaterThan(0);
      expect(paymentStore.adjustments()).toHaveLength(0);
    });

    it('人工調整金額不同於試算值卻未附理由：calculateCharges 直接擲錯，委派 Task 5 純函式驗證', () => {
      pickUpFirst();
      expect(() =>
        handoverStore.calculateCharges(
          chargeInput({
            manualAdjustment: { lateFee: 999 },
          }),
        ),
      ).toThrow();
    });

    it('還車：實際時間／里程／能源／照片正確存檔，計算後的費用建立並確認為 ChargeAdjustment，餘額留作應收不阻擋完成', () => {
      pickUpFirst();
      const charges = handoverStore.calculateCharges(
        chargeInput({ actualReturnAt: '2026-07-22T19:00:00.000Z', returnEnergyLevel: 5 }),
      );
      expect(charges.finalLateFee).toBeGreaterThan(0);
      expect(charges.finalEnergyFee).toBeGreaterThan(0);

      const result = handoverStore.performReturn({
        bookingId: 'b1',
        record: baseRecordInput({
          actualAt: '2026-07-22T19:00:00.000Z',
          mileage: 1150,
          energyLevel: 5,
          photoAssetIds: ['dash-1', 'body-1'],
        }),
        charges,
        actor: { actorId: 'staff1', actorName: '櫃檯人員' },
      });

      const savedReturn = handoverStore.returnFor('b1');
      expect(savedReturn?.id).toBe(result.record.id);
      expect(savedReturn?.mileage).toBe(1150);
      expect(savedReturn?.energyLevel).toBe(5);
      expect(savedReturn?.photoAssetIds).toEqual(['dash-1', 'body-1']);

      expect(result.adjustments).toHaveLength(2);
      const kinds = result.adjustments.map((a) => a.kind).sort();
      expect(kinds).toEqual(['energy', 'late_return']);
      expect(result.adjustments.every((a) => a.status === 'confirmed')).toBe(true);
      expect(paymentStore.adjustments()).toHaveLength(2);

      expect(vehicleStore.vehicles()[0].status).toBe('available');
      expect(bookingStore.bookings()[0].status).toBe('completed');

      // 沒有任何付款紀錄，餘額應為正值（應收），但流程仍視為完成，不因此擋下。
      const summary = paymentStore.summaryFor('b1');
      expect(summary.balanceDue).toBeGreaterThan(0);

      const entries = auditRepo.getAll();
      expect(entries.some((e) => e.action === 'create' && e.entityId === result.record.id)).toBe(true);
    });

    it('人工調整金額且附理由：ChargeAdjustment 帶有該理由', () => {
      pickUpFirst();
      const charges = handoverStore.calculateCharges(
        chargeInput({
          actualReturnAt: '2026-07-22T19:00:00.000Z',
          manualAdjustment: { lateFee: 50, reason: '車損協調後酌減' },
        }),
      );

      const result = handoverStore.performReturn({
        bookingId: 'b1',
        record: baseRecordInput({ actualAt: '2026-07-22T19:00:00.000Z', mileage: 1150 }),
        charges,
        actor: { actorId: 'staff1', actorName: '櫃檯人員' },
      });

      const lateAdjustment = result.adjustments.find((a) => a.kind === 'late_return');
      expect(lateAdjustment?.amount).toBe(50);
      expect(lateAdjustment?.reason).toBe('車損協調後酌減');
    });

    it('準時且滿油還車：不產生任何費用調整，仍正常完成', () => {
      pickUpFirst();
      const charges = handoverStore.calculateCharges(chargeInput());
      expect(charges.finalTotalCharge).toBe(0);

      const result = handoverStore.performReturn({
        bookingId: 'b1',
        record: baseRecordInput({ actualAt: T_RETURN_DUE }),
        charges,
        actor: { actorId: 'staff1', actorName: '櫃檯人員' },
      });

      expect(result.adjustments).toHaveLength(0);
      expect(bookingStore.bookings()[0].status).toBe('completed');
    });

    it('save_record 這一步失敗：擲出 partial failure 錯誤，車輛與訂單維持 in_progress／rented', () => {
      pickUpFirst();
      configure({ booking: { status: 'in_progress' }, vehicle: { status: 'rented' }, handoverRepo: createFailingCreateRepo<HandoverRecord>() });
      // configure() 重建了全新的 TestBed，這裡改用新的 handoverStore/bookingStore/vehicleStore 執行 performReturn。

      const charges = handoverStore.calculateCharges(chargeInput());

      let caught: unknown;
      try {
        handoverStore.performReturn({
          bookingId: 'b1',
          record: baseRecordInput({ actualAt: T_RETURN_DUE }),
          charges,
          actor: { actorId: 'staff1', actorName: '櫃檯人員' },
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(HandoverOrchestrationPartialFailureError);
      const err = caught as HandoverOrchestrationPartialFailureError;
      expect(err.phase).toBe('return');
      expect(err.completedSteps).toEqual([]);
      expect(err.failedStep).toBe('save_record');
      expect(vehicleStore.vehicles()[0].status).toBe('rented');
      expect(bookingStore.bookings()[0].status).toBe('in_progress');
    });
  });
});
