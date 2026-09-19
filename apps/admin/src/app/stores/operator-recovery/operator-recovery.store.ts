import { Injectable, Signal, inject, signal } from '@angular/core';
import {
  CancellationCase,
  CancellationContractKind,
  ContractSnapshot,
  OPERATOR_RECOVERY_REMEDY_ORDER,
  OperatorRecoveryCase,
  OperatorRecoveryGoodwillCompensation,
  OperatorRecoveryGoodwillCompensationType,
  OperatorRecoveryReason,
  OperatorRecoveryRemedyAttempt,
  OperatorRecoveryRemedyOutcome,
  OperatorRecoveryRemedyType,
  OperatorRecoveryTaxiReimbursement,
  quoteCancellation,
} from '@car-rental/domain';
import { OPERATOR_RECOVERY_CASE_REPO } from '../../core/repositories/tokens';
import { BookingStore } from '../booking/booking.store';
import { VehicleStore } from '../vehicle/vehicle.store';
import { ContractStore } from '../contract/contract.store';
import { CancellationStore } from '../cancellation/cancellation.store';

export interface CreateOperatorRecoveryCaseInput {
  bookingId: string;
  reason: OperatorRecoveryReason;
  reasonNote?: string;
  /** 發現問題的時間（ISO）。 */
  discoveredAt: string;
  /** 通知顧客的時間（ISO）。 */
  notifiedAt: string;
  actor: { actorId: string; actorName: string };
}

export interface AttemptRemedyInput {
  caseId: string;
  type: OperatorRecoveryRemedyType;
  attemptedAt: string;
  availabilitySnapshot?: string;
  /** 同級調車／免費升等使用：本社車隊內的替代車輛 id。 */
  replacementVehicleId?: string;
  /** 合作同業轉單使用。 */
  partnerId?: string;
  partnerName?: string;
  externalVehicleDescription?: string;
  externalQuoteAmount?: number;
  absorbedDifference?: number;
  outcome: OperatorRecoveryRemedyOutcome;
  customerConsent?: boolean;
  customerDecisionAt?: string;
  customerDecisionNote?: string;
  notedBy: string;
  approvedBy?: string;
}

export interface EscalateToCancellationInput {
  caseId: string;
  contractKind: CancellationContractKind;
  /** 提出（進入）業者責任取消的時間（ISO，含時區）。 */
  requestedAt: string;
  ruleVersion: string;
  depositPaid: number;
  otherPrepayment: number;
  /** 業者過失且未收定金時，依設計文件第 10 節以約定總租金一倍試算所需的基礎金額。 */
  agreedRentalTotal?: number;
  /** true 代表涉及業者故意違約，轉 operator_intentional 責任歸屬（quoteCancellation 一律 manual_review）。 */
  intentionalConduct?: boolean;
  /** 顧客另有提出待鑑定之額外損害（quoteCancellation 一律 manual_review）。 */
  additionalCustomerDamageClaimed?: boolean;
  evidenceAssetIds?: string[];
  actor: { actorId: string; actorName: string };
  approvedBy: string;
}

export interface EscalateToCancellationResult {
  case: OperatorRecoveryCase;
  cancellationCase: CancellationCase;
}

export interface RecordTaxiReimbursementInput {
  caseId: string;
  amount: number;
  evidenceAssetId?: string;
  occurredAt: string;
  notedBy: string;
  approvedBy: string;
}

export interface RecordGoodwillCompensationInput {
  caseId: string;
  type: OperatorRecoveryGoodwillCompensationType;
  amount: number;
  couponCode?: string;
  occurredAt: string;
  notedBy: string;
  approvedBy: string;
}

export class RemedyOutOfOrderError extends Error {
  constructor(
    readonly expected: OperatorRecoveryRemedyType | undefined,
    readonly attempted: OperatorRecoveryRemedyType,
  ) {
    super(
      expected
        ? `補救方案須依序嘗試：下一個應嘗試「${expected}」，收到「${attempted}」。`
        : `三個補救方案皆已嘗試過，不可再嘗試新的補救方案（收到「${attempted}」），請改用 escalateToCancellation。`,
    );
    this.name = 'RemedyOutOfOrderError';
  }
}

export class CaseNotInProgressError extends Error {
  constructor(readonly status: OperatorRecoveryCase['status']) {
    super(`案件狀態為「${status}」，不是進行中（in_progress），無法執行此操作。`);
    this.name = 'CaseNotInProgressError';
  }
}

export class ConsentRequiredError extends Error {
  constructor() {
    super('補救方案被採用前必須取得顧客明確同意。');
    this.name = 'ConsentRequiredError';
  }
}

export class ApprovalRequiredError extends Error {
  constructor(action: string) {
    super(`「${action}」須經核准人確認。`);
    this.name = 'ApprovalRequiredError';
  }
}

export class RemedyVehicleUnavailableError extends Error {
  constructor(readonly vehicleId: string) {
    super(`重新檢查可用性：替代車輛（${vehicleId}）目前不可用，無法採用此補救方案。`);
    this.name = 'RemedyVehicleUnavailableError';
  }
}

export class EscalationRequiresAllRemedyAttemptsError extends Error {
  constructor() {
    super('三個補救方案（同級調車、免費升等、合作同業轉單）都必須先嘗試過，才能進入業者責任取消。');
    this.name = 'EscalationRequiresAllRemedyAttemptsError';
  }
}

function assertIntegerMoney(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative integer amount of TWD, got ${value}`);
  }
}

/**
 * 業者責任案件的復原與補償：依設計文件第 10 節「流程不是先取消，而是依序救單」——
 * 同級調車 → 免費升等 → 合作同業轉單 → （皆失敗或顧客不同意）業者責任取消。
 *
 * - 同級調車／免費升等使用本社車隊：接受後透過 BookingStore.updateBooking() 換車（沿用既有
 *   通用 patch 方法，不新增訂單狀態轉換），並透過 ContractStore.reviseIfChanged()（Task 6）
 *   判斷是否構成合約重大異動、需要新版本——不重新實作比對邏輯。
 * - 合作同業轉單使用外部車輛，不屬於本社車隊，不觸動 BookingStore／ContractStore。
 * - 業者責任取消整段委派給既有 quoteCancellation 純函式與 CancellationStore（Task 4／14）：
 *   金額試算、manual_review 判斷（業者故意違約、顧客另有損害待鑑定）、退款/保留金撥付的
 *   顧客同意與金額比對規則，全部原封不動沿用，這裡只負責「決定何時可以呼叫」。
 * - 計程車車資補貼與善意補償（折價券／保留金）各自獨立累積在案件自己的欄位，
 *   不會、也沒有任何路徑去折抵業者責任取消案件的法定現金賠償（CancellationCase.totalCashDue）。
 */
@Injectable({ providedIn: 'root' })
export class OperatorRecoveryStore {
  private readonly repo = inject(OPERATOR_RECOVERY_CASE_REPO);
  private readonly bookingStore = inject(BookingStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly contractStore = inject(ContractStore);
  private readonly cancellationStore = inject(CancellationStore);

  private readonly _cases = signal<OperatorRecoveryCase[]>(this.repo.getAll());
  readonly cases: Signal<OperatorRecoveryCase[]> = this._cases.asReadonly();

  casesFor(bookingId: string): OperatorRecoveryCase[] {
    return this._cases()
      .filter((c) => c.bookingId === bookingId)
      .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());
  }

  createCase(input: CreateOperatorRecoveryCaseInput): OperatorRecoveryCase {
    const now = new Date().toISOString();
    const kase: OperatorRecoveryCase = {
      id: crypto.randomUUID(),
      bookingId: input.bookingId,
      reason: input.reason,
      ...(input.reasonNote ? { reasonNote: input.reasonNote } : {}),
      discoveredAt: input.discoveredAt,
      notifiedAt: input.notifiedAt,
      status: 'in_progress',
      remedyAttempts: [],
      taxiReimbursements: [],
      goodwillCompensations: [],
      createdBy: input.actor.actorName,
      createdAt: now,
      updatedAt: now,
    };
    this.repo.create(kase);
    this.reload();
    return kase;
  }

  /**
   * 嘗試一個補救方案。type 必須是這個案件下一個依序該嘗試的方案（見
   * OPERATOR_RECOVERY_REMEDY_ORDER），否則丟 RemedyOutOfOrderError——即使之前的方案是
   * unavailable（根本無方案）而非顧客拒絕，仍視為「已嘗試」，不能跳過。
   *
   * outcome 為 accepted 時：
   * - 必須有 customerConsent === true 與非空 approvedBy，否則分別丟 ConsentRequiredError／
   *   ApprovalRequiredError。
   * - 同級調車／免費升等：重新檢查 replacementVehicleId 目前是否為 available（否則丟
   *   RemedyVehicleUnavailableError），透過 BookingStore.updateBooking() 換車，並用
   *   ContractStore.reviseIfChanged() 視需要產生新合約版本。訂單的 priceBreakdown／
   *   depositRequired 完全不變動——顧客價格不因此增加，價差只記在 absorbedDifference。
   * - 合作同業轉單：不動本社車輛／合約，只記錄合作業者與外部報價資訊。
   * - 案件狀態轉為 resolved。
   */
  attemptRemedy(input: AttemptRemedyInput): OperatorRecoveryCase {
    const kase = this.mustGet(input.caseId);
    if (kase.status !== 'in_progress') {
      throw new CaseNotInProgressError(kase.status);
    }

    const expectedType = OPERATOR_RECOVERY_REMEDY_ORDER[kase.remedyAttempts.length];
    if (input.type !== expectedType) {
      throw new RemedyOutOfOrderError(expectedType, input.type);
    }

    const absorbedDifference = input.absorbedDifference ?? 0;
    assertIntegerMoney(absorbedDifference, 'absorbedDifference');

    let contractVersionId: string | undefined;

    if (input.outcome === 'accepted') {
      if (!input.customerConsent) {
        throw new ConsentRequiredError();
      }
      if (!input.approvedBy?.trim()) {
        throw new ApprovalRequiredError('採用補救方案');
      }

      if (input.type === 'same_class_replacement' || input.type === 'free_upgrade') {
        const vehicleId = input.replacementVehicleId;
        if (!vehicleId) {
          throw new Error('replacementVehicleId is required when accepting same_class_replacement or free_upgrade');
        }
        const vehicle = this.vehicleStore.vehicles().find((v) => v.id === vehicleId);
        if (!vehicle || vehicle.status !== 'available') {
          throw new RemedyVehicleUnavailableError(vehicleId);
        }

        this.bookingStore.updateBooking(kase.bookingId, { vehicleId });

        const latestContract = this.contractStore.latestFor(kase.bookingId);
        if (latestContract) {
          const nextSnapshot: ContractSnapshot = {
            ...latestContract.snapshot,
            vehicle: {
              vehicleId: vehicle.id,
              plateNumber: vehicle.plateNumber,
              brand: vehicle.brand,
              model: vehicle.model,
              category: vehicle.category,
              ...(vehicle.fuelPolicy ? { fuelPolicy: vehicle.fuelPolicy } : {}),
              ...(vehicle.mileagePolicy ? { mileagePolicy: vehicle.mileagePolicy } : {}),
              ...(vehicle.energyType ? { energyType: vehicle.energyType } : {}),
            },
          };
          const revised = this.contractStore.reviseIfChanged(kase.bookingId, nextSnapshot);
          if (revised.id !== latestContract.id) {
            contractVersionId = revised.id;
          }
        }
      }
      // partner_transfer：外部車輛，不屬於本社車隊，不動 BookingStore／ContractStore。
    }

    const attempt: OperatorRecoveryRemedyAttempt = {
      id: crypto.randomUUID(),
      type: input.type,
      attemptedAt: input.attemptedAt,
      ...(input.availabilitySnapshot ? { availabilitySnapshot: input.availabilitySnapshot } : {}),
      ...(input.replacementVehicleId ? { replacementVehicleId: input.replacementVehicleId } : {}),
      ...(input.partnerId ? { partnerId: input.partnerId } : {}),
      ...(input.partnerName ? { partnerName: input.partnerName } : {}),
      ...(input.externalVehicleDescription ? { externalVehicleDescription: input.externalVehicleDescription } : {}),
      ...(input.externalQuoteAmount != null ? { externalQuoteAmount: input.externalQuoteAmount } : {}),
      absorbedDifference,
      outcome: input.outcome,
      ...(input.customerDecisionAt ? { customerDecisionAt: input.customerDecisionAt } : {}),
      ...(input.customerDecisionNote ? { customerDecisionNote: input.customerDecisionNote } : {}),
      ...(input.customerConsent != null ? { customerConsent: input.customerConsent } : {}),
      ...(contractVersionId ? { contractVersionId } : {}),
      notedBy: input.notedBy,
      ...(input.approvedBy ? { approvedBy: input.approvedBy } : {}),
    };

    const patch: Partial<OperatorRecoveryCase> = {
      remedyAttempts: [...kase.remedyAttempts, attempt],
      updatedAt: new Date().toISOString(),
    };
    if (input.outcome === 'accepted') {
      patch.status = 'resolved';
      patch.resolvedRemedyType = input.type;
      patch.resolvedAt = input.attemptedAt;
    }

    const updated = this.repo.update(kase.id, patch);
    this.reload();
    return updated;
  }

  /**
   * 進入業者責任取消——只有在三個補救方案都已嘗試過、且案件仍是 in_progress（代表沒有任何
   * 一個方案被接受）時才允許。實際金額試算與案件建立完全委派給既有的 quoteCancellation／
   * CancellationStore：
   * - intentionalConduct 為 true 時以 responsibility: 'operator_intentional' 呼叫，
   *   quoteCancellation 本身就會回傳 manual_review，這裡不重新判斷。
   * - additionalCustomerDamageClaimed 一樣交給 quoteCancellation 判斷是否轉 manual_review。
   * - operator_fault／operator_intentional 分支的 transferFee 由 quoteCancellation 內部
   *   固定為 0，這裡完全不傳入 transferFee 參數，結構上就不會讓業者責任案件被收轉單手續費。
   */
  escalateToCancellation(input: EscalateToCancellationInput): EscalateToCancellationResult {
    const kase = this.mustGet(input.caseId);
    if (kase.status !== 'in_progress') {
      throw new CaseNotInProgressError(kase.status);
    }
    if (kase.remedyAttempts.length < OPERATOR_RECOVERY_REMEDY_ORDER.length) {
      throw new EscalationRequiresAllRemedyAttemptsError();
    }
    if (!input.approvedBy?.trim()) {
      throw new ApprovalRequiredError('進入業者責任取消');
    }

    const booking = this.bookingStore.bookings().find((b) => b.id === kase.bookingId);
    if (!booking) throw new Error(`not found: ${kase.bookingId}`);

    const responsibility = input.intentionalConduct ? 'operator_intentional' : 'operator_fault';

    const quote = quoteCancellation({
      contractKind: input.contractKind,
      responsibility,
      cancellationRequestedAt: input.requestedAt,
      pickupAt: booking.startTime,
      depositPaid: input.depositPaid,
      otherPrepayment: input.otherPrepayment,
      additionalCustomerDamageClaimed: input.additionalCustomerDamageClaimed,
      ...(input.agreedRentalTotal != null ? { agreedRentalTotal: input.agreedRentalTotal } : {}),
    });

    const cancellationCase = this.cancellationStore.createCase({
      bookingId: kase.bookingId,
      contractKind: input.contractKind,
      responsibility,
      reason: kase.reason,
      requestedAt: input.requestedAt,
      ruleVersion: input.ruleVersion,
      originalDepositPaid: input.depositPaid,
      originalOtherPrepayment: input.otherPrepayment,
      quote,
      ...(input.evidenceAssetIds ? { evidenceAssetIds: input.evidenceAssetIds } : {}),
    });

    const updated = this.repo.update(kase.id, {
      status: 'escalated_to_cancellation',
      cancellationCaseId: cancellationCase.id,
      escalatedAt: input.requestedAt,
      updatedAt: new Date().toISOString(),
    });
    this.reload();

    return { case: updated, cancellationCase };
  }

  /** 計程車車資補貼：金額、憑證、核准人（設計文件第 10 節「額外補償獨立記錄」）。 */
  recordTaxiReimbursement(input: RecordTaxiReimbursementInput): OperatorRecoveryCase {
    assertIntegerMoney(input.amount, 'amount');
    if (!input.approvedBy?.trim()) {
      throw new ApprovalRequiredError('計程車車資補貼');
    }
    const kase = this.mustGet(input.caseId);

    const entry: OperatorRecoveryTaxiReimbursement = {
      id: crypto.randomUUID(),
      amount: input.amount,
      ...(input.evidenceAssetId ? { evidenceAssetId: input.evidenceAssetId } : {}),
      occurredAt: input.occurredAt,
      notedBy: input.notedBy,
      approvedBy: input.approvedBy,
    };

    const updated = this.repo.update(kase.id, {
      taxiReimbursements: [...kase.taxiReimbursements, entry],
      updatedAt: new Date().toISOString(),
    });
    this.reload();
    return updated;
  }

  /**
   * 善意補償（折價券／額外保留金）。獨立累積在案件自己的 goodwillCompensations，
   * 不會、也沒有任何程式路徑會拿去折抵業者責任取消案件的法定現金賠償——
   * 兩者從建立到讀取全程都是分開的資料結構與方法，不共用同一筆金額。
   */
  recordGoodwillCompensation(input: RecordGoodwillCompensationInput): OperatorRecoveryCase {
    assertIntegerMoney(input.amount, 'amount');
    if (!input.approvedBy?.trim()) {
      throw new ApprovalRequiredError('善意補償');
    }
    const kase = this.mustGet(input.caseId);

    const entry: OperatorRecoveryGoodwillCompensation = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: input.amount,
      ...(input.couponCode ? { couponCode: input.couponCode } : {}),
      occurredAt: input.occurredAt,
      notedBy: input.notedBy,
      approvedBy: input.approvedBy,
    };

    const updated = this.repo.update(kase.id, {
      goodwillCompensations: [...kase.goodwillCompensations, entry],
      updatedAt: new Date().toISOString(),
    });
    this.reload();
    return updated;
  }

  private mustGet(id: string): OperatorRecoveryCase {
    const kase = this.repo.getById(id);
    if (!kase) throw new Error(`not found: ${id}`);
    return kase;
  }

  private reload(): void {
    this._cases.set(this.repo.getAll());
  }
}
