import { Injectable, Signal, inject, signal } from '@angular/core';
import {
  AuditEntry,
  ChargeAdjustment,
  HandoverRecord,
  PickupBlocker,
  PickupBlockerType,
  PickupReadiness,
  PickupReadinessInput,
  ReturnChargeInput,
  ReturnChargeResult,
  VehicleStatus,
  calculateReturnCharges,
  evaluatePickupReadiness,
} from '@car-rental/domain';
import { AUDIT_ENTRY_REPO, HANDOVER_RECORD_REPO } from '../../core/repositories/tokens';
import { BookingStore } from '../booking/booking.store';
import { VehicleStore } from '../vehicle/vehicle.store';
import { PaymentStore } from '../payment/payment.store';
import { ReminderStore } from '../reminder/reminder.store';

/**
 * 一般主管覆核不得放行的阻擋類別：設計文件第 7 節「法律資格不符及車輛安全不可交付
 * 不應僅靠一般主管覆核放行」——外國旅客互惠資格／准駕車種不符（法律資格）與車輛
 * 維修中／排程衝突（車輛安全與可交付性）。其餘阻擋（訂金、合約、證件缺失或過期、
 * 本次未核對證件正本）可由主管覆核放行，但必須留存原因、操作人與時間。
 */
export const NON_OVERRIDABLE_PICKUP_BLOCKER_TYPES: readonly PickupBlockerType[] = [
  'foreign_reciprocity_or_vehicle_class_mismatch',
  'vehicle_not_deliverable',
];

export interface HandoverActor {
  actorId: string;
  actorName: string;
}

export interface SupervisorOverrideInput {
  actorId: string;
  actorName: string;
  reason: string;
}

/** 取車／還車橫跨多個 repository 的本地寫入序列，各自可能獨立失敗（見類別註解）。 */
export type HandoverOrchestrationStep =
  | 'save_record'
  | 'vehicle_transition'
  | 'booking_transition'
  | 'confirm_adjustments'
  | 'vehicle_location_update'
  | 'audit_entry';

/** 仍有未解除的阻擋項目、且未提供（或不適用）主管覆核時擲出。 */
export class PickupBlockedError extends Error {
  constructor(readonly readiness: PickupReadiness) {
    super('取車被阻擋：仍有未解除的阻擋項目，請先排除或申請主管覆核。');
    this.name = 'PickupBlockedError';
  }
}

/** 阻擋項目包含法律資格或車輛安全類別，任何主管覆核都不能放行時擲出。 */
export class PickupOverrideNotAllowedError extends Error {
  constructor(readonly nonOverridableBlockers: PickupBlocker[]) {
    super('這些阻擋項目屬於法律資格或車輛安全類別，一般主管覆核無法放行。');
    this.name = 'PickupOverrideNotAllowedError';
  }
}

/** 提供了覆核意圖但未同時附上操作人與理由時擲出。 */
export class SupervisorOverrideInvalidError extends Error {
  constructor() {
    super('主管覆核必須提供操作人與理由。');
    this.name = 'SupervisorOverrideInvalidError';
  }
}

/**
 * 取車／還車的其中一個本地寫入步驟失敗時擲出。local repository 沒有真正的 transaction，
 * 前面已成功的步驟不會自動回滾——呼叫端必須依 completedSteps／failedStep 判斷目前實際狀態，
 * 不能宣稱整個流程完成，也不能假設前面的步驟需要重做。
 */
export class HandoverOrchestrationPartialFailureError extends Error {
  constructor(
    readonly phase: 'pickup' | 'return',
    readonly completedSteps: HandoverOrchestrationStep[],
    readonly failedStep: HandoverOrchestrationStep,
    override readonly cause: unknown,
  ) {
    super(
      `${phase === 'pickup' ? '取車' : '還車'}流程於「${failedStep}」步驟失敗，` +
        `已完成步驟：${completedSteps.length > 0 ? completedSteps.join(', ') : '（無）'}。` +
        '本地紀錄沒有交易保護，請確認目前實際狀態後再重試尚未完成的步驟。',
    );
    this.name = 'HandoverOrchestrationPartialFailureError';
  }
}

export interface PerformPickupInput {
  bookingId: string;
  readinessInput: PickupReadinessInput;
  record: Omit<HandoverRecord, 'id' | 'kind' | 'bookingId'>;
  actor: HandoverActor;
  supervisorOverride?: SupervisorOverrideInput;
}

export interface PerformPickupResult {
  readiness: PickupReadiness;
  record: HandoverRecord;
}

export interface PerformReturnInput {
  bookingId: string;
  record: Omit<HandoverRecord, 'id' | 'kind' | 'bookingId'>;
  /** 已完成人員確認（含必要時的人工調整理由）的最終試算結果，見 calculateCharges()。 */
  charges: ReturnChargeResult;
  actor: HandoverActor;
}

export interface PerformReturnResult {
  record: HandoverRecord;
  adjustments: ChargeAdjustment[];
}

/**
 * 取還車紀錄的封裝：CRUD 寫入 HANDOVER_RECORD_REPO，取車就緒判斷與還車費用試算
 * 委派給 Task 5 的純函式；performPickup／performReturn 則是 Task 13 新增的橫跨
 * HandoverRecord／Vehicle／RentalBooking／ChargeAdjustment／AuditEntry 多個
 * repository 的訂單流程協調，依設計文件第 7 節與本任務 brief 指定的精確順序執行：
 *
 * 取車：重算就緒 → 存取車紀錄 → 車輛轉為 rented → 訂單轉為 in_progress → 附加稽核紀錄。
 * 還車：存還車紀錄 → 確認費用調整 → 車輛轉為 available → 訂單轉為 completed →
 *       車輛所在據點更新為這筆訂單的還車據點（3.7，見 docs/owner-questions.md 第 1 條） →
 *       附加稽核紀錄 → 任何餘額留作應收，不阻擋完成。
 *
 * 車輛與訂單的狀態轉換本身仍由 VehicleStore／BookingStore 把關（見兩者既有的狀態機），
 * 這裡不重複驗證轉換合法性，只負責依序呼叫並在失敗時回報「哪一步已經成功」。
 */
@Injectable({ providedIn: 'root' })
export class HandoverStore {
  private readonly repo = inject(HANDOVER_RECORD_REPO);
  private readonly auditRepo = inject(AUDIT_ENTRY_REPO);
  private readonly bookingStore = inject(BookingStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly reminderStore = inject(ReminderStore);

  private readonly _records = signal<HandoverRecord[]>(this.repo.getAll());
  readonly records: Signal<HandoverRecord[]> = this._records.asReadonly();

  recordsFor(bookingId: string): HandoverRecord[] {
    return this._records().filter((r) => r.bookingId === bookingId);
  }

  pickupFor(bookingId: string): HandoverRecord | undefined {
    return this.recordsFor(bookingId).find((r) => r.kind === 'pickup');
  }

  returnFor(bookingId: string): HandoverRecord | undefined {
    return this.recordsFor(bookingId).find((r) => r.kind === 'return');
  }

  recordPickup(input: Omit<HandoverRecord, 'id' | 'kind'>): HandoverRecord {
    const record: HandoverRecord = { id: crypto.randomUUID(), kind: 'pickup', ...input };
    this.repo.create(record);
    this.reload();
    return record;
  }

  recordReturn(input: Omit<HandoverRecord, 'id' | 'kind'>): HandoverRecord {
    const record: HandoverRecord = { id: crypto.randomUUID(), kind: 'return', ...input };
    this.repo.create(record);
    this.reload();
    return record;
  }

  evaluateReadiness(input: PickupReadinessInput): PickupReadiness {
    return evaluatePickupReadiness(input);
  }

  calculateCharges(input: ReturnChargeInput): ReturnChargeResult {
    return calculateReturnCharges(input);
  }

  /**
   * 取車完整協調流程。阻擋處理規則（設計文件第 7 節）：
   * - 沒有阻擋：直接放行，不需要／不記錄覆核。
   * - 有阻擋但全部可覆核、且提供了有效的 supervisorOverride（actor + reason 皆非空白）：
   *   放行，並以 action: 'override' 附加稽核紀錄（保留原因、操作人、時間）。
   * - 有阻擋但屬於法律資格或車輛安全類別：無論是否提供覆核一律擲出
   *   PickupOverrideNotAllowedError，不放行。
   * - 有阻擋、可覆核、但沒有提供覆核（或覆核缺 actor／reason）：擲出對應錯誤，不放行。
   *
   * 放行後才依序寫入：存取車紀錄 → 車輛轉 rented → 訂單轉 in_progress → 附加稽核紀錄。
   * 任一步失敗即擲出 HandoverOrchestrationPartialFailureError，附上已完成的步驟清單。
   */
  performPickup(input: PerformPickupInput): PerformPickupResult {
    const readiness = this.evaluateReadiness(input.readinessInput);

    if (!readiness.ready) {
      const nonOverridable = readiness.blockers.filter((b) =>
        NON_OVERRIDABLE_PICKUP_BLOCKER_TYPES.includes(b.type),
      );
      if (nonOverridable.length > 0) {
        throw new PickupOverrideNotAllowedError(nonOverridable);
      }

      const override = input.supervisorOverride;
      if (!override) {
        throw new PickupBlockedError(readiness);
      }
      if (!override.actorId.trim() || !override.actorName.trim() || !override.reason.trim()) {
        throw new SupervisorOverrideInvalidError();
      }
    }

    const completed: HandoverOrchestrationStep[] = [];

    let record: HandoverRecord;
    try {
      record = this.recordPickup({ bookingId: input.bookingId, ...input.record });
      completed.push('save_record');
    } catch (cause) {
      throw new HandoverOrchestrationPartialFailureError('pickup', completed, 'save_record', cause);
    }

    const vehicleStatusBeforePickup = this.vehicleStatusFor(input.bookingId);
    try {
      this.bookingStore.pickUp(input.bookingId);
      completed.push('vehicle_transition', 'booking_transition');
    } catch (cause) {
      // 只有「這次呼叫」真的把車輛從非 rented 轉成 rented，才算 vehicle_transition 已完成——
      // 不能只看轉換後的狀態是否等於目標值，車輛可能本來就已經是 rented（例如被其他訂單搶先
      // 交車的競態），那種情況下這次呼叫的 vehicleStore.transition() 其實整個被拒絕，什麼都沒做。
      const vehicleTransitionedNow =
        vehicleStatusBeforePickup !== 'rented' && this.vehicleStatusFor(input.bookingId) === 'rented';
      if (vehicleTransitionedNow) completed.push('vehicle_transition');
      throw new HandoverOrchestrationPartialFailureError(
        'pickup',
        completed,
        vehicleTransitionedNow ? 'booking_transition' : 'vehicle_transition',
        cause,
      );
    }

    try {
      const override = !readiness.ready ? input.supervisorOverride : undefined;
      this.appendAuditEntry({
        action: override ? 'override' : 'create',
        entityType: 'handover_record',
        entityId: record.id,
        actorId: override ? override.actorId : input.actor.actorId,
        actorName: override ? override.actorName : input.actor.actorName,
        afterSummary: `完成取車，里程 ${input.record.mileage}${override ? '（主管覆核放行）' : ''}`,
        ...(override ? { reason: override.reason } : {}),
      });
      completed.push('audit_entry');
    } catch (cause) {
      throw new HandoverOrchestrationPartialFailureError('pickup', completed, 'audit_entry', cause);
    }

    return { readiness, record };
  }

  /**
   * 還車完整協調流程：存還車紀錄 → 確認費用調整（依 charges 建立並直接確認 ChargeAdjustment，
   * 不是先前試算階段就自動建立——見 calculateCharges，試算與確認是刻意分開的兩步）→
   * 車輛轉 available → 訂單轉 completed → 車輛所在據點更新為這筆訂單的還車據點（3.7）→
   * 附加稽核紀錄。
   *
   * 刻意不檢查付款分類帳是否結清：任何未收餘額留作應收（PaymentStore.summaryFor 會反映
   * balanceDue），不阻擋這裡的完成——設計文件與本任務 brief 都明確要求「不得因未收餘額阻擋完成」。
   */
  performReturn(input: PerformReturnInput): PerformReturnResult {
    const completed: HandoverOrchestrationStep[] = [];

    let record: HandoverRecord;
    try {
      record = this.recordReturn({ bookingId: input.bookingId, ...input.record });
      completed.push('save_record');
    } catch (cause) {
      throw new HandoverOrchestrationPartialFailureError('return', completed, 'save_record', cause);
    }

    let adjustments: ChargeAdjustment[];
    try {
      adjustments = this.confirmChargeAdjustments(input.bookingId, input.charges, input.actor.actorName);
      completed.push('confirm_adjustments');
    } catch (cause) {
      throw new HandoverOrchestrationPartialFailureError('return', completed, 'confirm_adjustments', cause);
    }

    const vehicleStatusBeforeComplete = this.vehicleStatusFor(input.bookingId);
    try {
      this.bookingStore.complete(input.bookingId);
      completed.push('vehicle_transition', 'booking_transition');
    } catch (cause) {
      // 理由同 performPickup：只有這次呼叫真的讓車輛從非 available 轉成 available，才算完成。
      const vehicleTransitionedNow =
        vehicleStatusBeforeComplete !== 'available' && this.vehicleStatusFor(input.bookingId) === 'available';
      if (vehicleTransitionedNow) completed.push('vehicle_transition');
      throw new HandoverOrchestrationPartialFailureError(
        'return',
        completed,
        vehicleTransitionedNow ? 'booking_transition' : 'vehicle_transition',
        cause,
      );
    }

    // 3.7：還車完成後，車輛所在據點改為這筆訂單的還車據點——業主問題 #1 的暫定決定
    // （docs/owner-questions.md 第 1 條：「改算還車據點的車」）。車輛狀態的轉換已經在上面
    // 透過 bookingStore.complete() → vehicleStore.transition() 完成；所在據點只是一般欄位、
    // 不經 transition()，這裡用 VehicleStore.update() 直接寫入。刻意放在狀態轉換成功之後：
    // 上面那段若已經擲出部分失敗錯誤，代表車輛還沒真的轉成 available，這裡就不該再動它的據點。
    try {
      const booking = this.bookingStore.bookings().find((b) => b.id === input.bookingId);
      if (booking) {
        this.vehicleStore.update(booking.vehicleId, { location: booking.returnLocation });
      }
      completed.push('vehicle_location_update');
    } catch (cause) {
      throw new HandoverOrchestrationPartialFailureError('return', completed, 'vehicle_location_update', cause);
    }

    // 訂單完成後不寄還車提醒（設計文件第 8 節）。這是刻意的 fire-and-forget 呼叫，不是
    // HandoverOrchestrationStep 序列的一員：performReturn() 本身維持同步、不改變回傳型別，
    // 是 Task 13/14 既有呼叫端（handover-panel 等）與大量既有測試已經假設的公開介面；
    // 提醒抑制是次要、盡力而為的清理動作，即使它失敗（例如 gateway.cancel 拋錯），也不該
    // 讓「訂單已經完成」這個已經發生的事實回頭被回報成失敗——因此不併入上面 try/catch 的
    // 部分失敗回報，只在真的出錯時吞掉例外（不讓 Promise rejection 冒出去干擾呼叫端）。
    void this.reminderStore.suppressForBooking(input.bookingId).catch(() => undefined);

    try {
      this.appendAuditEntry({
        action: 'create',
        entityType: 'handover_record',
        entityId: record.id,
        actorId: input.actor.actorId,
        actorName: input.actor.actorName,
        afterSummary: `完成還車，應收費用 ${input.charges.finalTotalCharge}`,
      });
      completed.push('audit_entry');
    } catch (cause) {
      throw new HandoverOrchestrationPartialFailureError('return', completed, 'audit_entry', cause);
    }

    return { record, adjustments };
  }

  /**
   * 依已確認的試算結果建立並直接確認 ChargeAdjustment（draft → confirmed 一次到位，
   * 「確認」動作本身就是這裡——呼叫端在這之前呈現的試算只是預覽，不會走到這個方法）。
   * 金額為 0 的項目不建立分類帳列，避免留下沒有實際金額的空調整紀錄。
   */
  private confirmChargeAdjustments(
    bookingId: string,
    charges: ReturnChargeResult,
    handledBy: string,
  ): ChargeAdjustment[] {
    const createdAt = new Date().toISOString();
    const reason = charges.manuallyAdjusted ? charges.adjustmentReason : undefined;
    const created: ChargeAdjustment[] = [];

    if (charges.finalLateFee > 0) {
      const adjustment = this.paymentStore.createAdjustment({
        bookingId,
        kind: 'late_return',
        quotedAmount: charges.quote.lateFee,
        amount: charges.finalLateFee,
        createdAt,
        handledBy,
        ...(reason ? { reason } : {}),
      });
      this.paymentStore.confirmAdjustment(adjustment.id);
      created.push({ ...adjustment, status: 'confirmed' });
    }

    if (charges.finalEnergyFee > 0) {
      const adjustment = this.paymentStore.createAdjustment({
        bookingId,
        kind: 'energy',
        quotedAmount: charges.quote.energyFee,
        amount: charges.finalEnergyFee,
        createdAt,
        handledBy,
        ...(reason ? { reason } : {}),
      });
      this.paymentStore.confirmAdjustment(adjustment.id);
      created.push({ ...adjustment, status: 'confirmed' });
    }

    return created;
  }

  private vehicleStatusFor(bookingId: string): VehicleStatus | undefined {
    const booking = this.bookingStore.bookings().find((b) => b.id === bookingId);
    if (!booking) return undefined;
    return this.vehicleStore.vehicles().find((v) => v.id === booking.vehicleId)?.status;
  }

  private appendAuditEntry(input: Omit<AuditEntry, 'id' | 'createdAt'>): AuditEntry {
    const entry: AuditEntry = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input };
    this.auditRepo.create(entry);
    return entry;
  }

  private reload(): void {
    this._records.set(this.repo.getAll());
  }
}
