import { Injectable, Signal, inject, signal } from '@angular/core';
import {
  AuditEntry,
  CancellationCase,
  CancellationCaseStatus,
  CancellationContractKind,
  CancellationDisposition,
  CancellationQuote,
  CancellationQuoteInput,
  CancellationRefundLine,
  CancellationResponsibility,
  CustomerCreditLedgerEntry,
  PaymentMethod,
  RefundRecord,
  quoteCancellation,
} from '@car-rental/domain';
import { AUDIT_ENTRY_REPO, CANCELLATION_CASE_REPO } from '../../core/repositories/tokens';
import { BookingStore } from '../booking/booking.store';
import { PaymentStore } from '../payment/payment.store';
import { CreditStore, addMonths } from '../credit/credit.store';

export interface CreateCancellationCaseInput {
  bookingId: string;
  contractKind: CancellationContractKind;
  responsibility: CancellationResponsibility;
  reason: string;
  requestedAt: string;
  ruleVersion: string;
  originalDepositPaid: number;
  originalOtherPrepayment: number;
  quote: CancellationQuote;
  evidenceAssetIds?: string[];
  /**
   * 設計文件第 9.2 節「填寫 30～100 元時要求理由與主管確認」——退款手續費達 30 元（含）
   * 以上才需要這兩個欄位。理由與確認人不落在 CancellationCase 本身（該模型只存試算結果的
   * 快照，不重複放審核歷程），而是寫入 AuditEntry，與 HandoverStore 的主管覆核紀錄同一套模式。
   */
  transferFeeReason?: string;
  transferFeeApprovedBy?: string;
}

export interface DisposeCancellationCaseInput {
  caseId: string;
  disposition: CancellationDisposition;
  /** 以原方式退還現金的金額；disposition 為 'credit' 時必須是 0。 */
  refundAmount: number;
  refundMethod?: Exclude<PaymentMethod, 'customer_credit'>;
  /** 轉為保留金的金額；disposition 為 'refund' 時必須是 0。 */
  creditAmount: number;
  /** 設計文件第 9.3 節「轉換前必須取得明確同意」——creditAmount > 0 時必須是 true。 */
  creditConsent?: boolean;
  /** 保留金效期（月），未提供時由 CreditStore.issue() 依預設 12 個月核算。 */
  creditExpiryMonths?: number;
  actor: { actorId: string; actorName: string };
  occurredAt: string;
}

export interface DisposeCancellationCaseResult {
  case: CancellationCase;
  refund?: RefundRecord;
  credit?: CustomerCreditLedgerEntry;
}

export class ForceMajeureEvidenceRequiredError extends Error {
  constructor() {
    super('不可抗力取消必須先上傳佐證資料（天災公告、對話紀錄等）。');
    this.name = 'ForceMajeureEvidenceRequiredError';
  }
}

export class TransferFeeApprovalRequiredError extends Error {
  constructor() {
    super('退款手續費達 30 元以上，須填寫理由並取得主管確認。');
    this.name = 'TransferFeeApprovalRequiredError';
  }
}

export class ForceMajeureApprovalRequiredError extends Error {
  constructor() {
    super('不可抗力取消須先經主管核准，才能進行退款／保留金撥付。');
    this.name = 'ForceMajeureApprovalRequiredError';
  }
}

export class CaseNotReadyForDispositionError extends Error {
  constructor(readonly status: CancellationCaseStatus) {
    super(
      `案件狀態為「${status}」，尚無法進行退款／保留金撥付；manual_review 案件須先由人工確認實際金額。`,
    );
    this.name = 'CaseNotReadyForDispositionError';
  }
}

export class CreditConsentRequiredError extends Error {
  constructor() {
    super('轉為保留金前必須取得顧客明確同意。');
    this.name = 'CreditConsentRequiredError';
  }
}

export class DispositionAmountMismatchError extends Error {
  constructor(
    readonly expected: number,
    readonly actual: number,
  ) {
    super(`退款與保留金金額合計（${actual}）與應退總額（${expected}）不符。`);
    this.name = 'DispositionAmountMismatchError';
  }
}

/** 取消撥付橫跨多個 repository 的本地寫入序列，各自可能獨立失敗（同 HandoverStore 的理由）。 */
export type CancellationDispositionStep =
  | 'refund_record'
  | 'credit_entry'
  | 'booking_transition'
  | 'case_settle'
  | 'audit_entry';

/**
 * 取消撥付其中一個本地寫入步驟失敗時擲出。local repository 沒有真正的 transaction，
 * 前面已成功的步驟不會自動回滾——呼叫端必須依 completedSteps／failedStep 判斷目前實際狀態。
 */
export class CancellationDispositionPartialFailureError extends Error {
  constructor(
    readonly completedSteps: CancellationDispositionStep[],
    readonly failedStep: CancellationDispositionStep,
    override readonly cause: unknown,
  ) {
    super(
      `取消撥付於「${failedStep}」步驟失敗，已完成步驟：${
        completedSteps.length > 0 ? completedSteps.join('、') : '（無）'
      }。本地紀錄沒有交易保護，請先確認實際狀態，再決定是否重試尚未完成的步驟。`,
    );
    this.name = 'CancellationDispositionPartialFailureError';
  }
}

function refundLinesFromQuote(quote: CancellationQuote): CancellationRefundLine[] {
  const lines: CancellationRefundLine[] = [];
  if (quote.depositRefund > 0) lines.push({ label: 'deposit', amount: quote.depositRefund });
  if (quote.otherPrepaymentRefund > 0) {
    lines.push({ label: 'other_prepayment', amount: quote.otherPrepaymentRefund });
  }
  if (quote.statutoryCompensation > 0) {
    lines.push({ label: 'statutory_compensation', amount: quote.statutoryCompensation });
  }
  if (quote.goodwillCompensation > 0) {
    lines.push({ label: 'goodwill_compensation', amount: quote.goodwillCompensation });
  }
  return lines;
}

/**
 * 取消案件的封裝：試算金額委派給 Task 4 的 quoteCancellation 純函式，這裡負責把試算結果
 * 轉存成 CancellationCase 紀錄、後續狀態推進，以及（Task 14）橫跨 BookingStore／PaymentStore／
 * CreditStore／AuditEntry 的退款與保留金撥付協調——disposeCase() 依設計文件第 9.3 節指定的
 * 順序執行：appendCase（Step 3 已由 createCase 完成）→ 附加退款／保留金紀錄 →
 * 訂單轉為 cancelled（只允許從 reserved，見 BookingStore.cancel 既有規則，這裡不重複驗證）→
 * 案件轉為 settled → 附加稽核紀錄。全程不呼叫任何 repository 的 remove()，付款與合約紀錄
 * 永遠保留（設計原則「保留歷史」）。
 */
@Injectable({ providedIn: 'root' })
export class CancellationStore {
  private readonly repo = inject(CANCELLATION_CASE_REPO);
  private readonly auditRepo = inject(AUDIT_ENTRY_REPO);
  private readonly bookingStore = inject(BookingStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly creditStore = inject(CreditStore);

  private readonly _cases = signal<CancellationCase[]>(this.repo.getAll());
  readonly cases: Signal<CancellationCase[]> = this._cases.asReadonly();

  casesFor(bookingId: string): CancellationCase[] {
    return this._cases().filter((c) => c.bookingId === bookingId);
  }

  quote(input: CancellationQuoteInput): CancellationQuote {
    return quoteCancellation(input);
  }

  /**
   * 建立取消案件。responsibility 為 force_majeure 時必須已附上佐證資料；退款手續費達 30 元
   * 以上時必須附理由與主管確認（見設計文件第 9.2／9.3 節）——兩者都是建案前的硬性檢查，
   * 不是留給後續步驟才補的軟性提醒。
   */
  createCase(input: CreateCancellationCaseInput): CancellationCase {
    if (input.responsibility === 'force_majeure' && (input.evidenceAssetIds ?? []).length === 0) {
      throw new ForceMajeureEvidenceRequiredError();
    }
    if (input.quote.transferFee >= 30) {
      if (!input.transferFeeReason?.trim() || !input.transferFeeApprovedBy?.trim()) {
        throw new TransferFeeApprovalRequiredError();
      }
    }

    const kase: CancellationCase = {
      id: crypto.randomUUID(),
      bookingId: input.bookingId,
      contractKind: input.contractKind,
      responsibility: input.responsibility,
      reason: input.reason,
      requestedAt: input.requestedAt,
      ruleVersion: input.ruleVersion,
      originalDepositPaid: input.originalDepositPaid,
      originalOtherPrepayment: input.originalOtherPrepayment,
      refundLines: refundLinesFromQuote(input.quote),
      transferFee: input.quote.transferFee,
      disposition: input.quote.disposition ?? 'refund',
      status: input.quote.status === 'manual_review' ? 'manual_review' : 'quoted',
      evidenceAssetIds: input.evidenceAssetIds ?? [],
    };
    this.repo.create(kase);

    if (input.quote.transferFee >= 30) {
      this.appendAuditEntry({
        action: 'approve',
        entityType: 'cancellation_case',
        entityId: kase.id,
        actorId: input.transferFeeApprovedBy as string,
        actorName: input.transferFeeApprovedBy as string,
        reason: input.transferFeeReason,
        afterSummary: `退款手續費 ${input.quote.transferFee} 元，主管確認`,
      });
    }

    this.reload();
    return kase;
  }

  approve(id: string, approvedBy: string): CancellationCase {
    const updated = this.repo.update(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
    });
    this.reload();
    return updated;
  }

  settle(id: string): CancellationCase {
    const updated = this.repo.update(id, { status: 'settled' });
    this.reload();
    return updated;
  }

  void(id: string): CancellationCase {
    const updated = this.repo.update(id, { status: 'voided' });
    this.reload();
    return updated;
  }

  /** 案件退費總額：所有退款明細加總後扣除手續費——與 quoteCancellation 的 totalCashDue 算法一致。 */
  totalDisposableAmount(kase: CancellationCase): number {
    return kase.refundLines.reduce((sum, line) => sum + line.amount, 0) - kase.transferFee;
  }

  /**
   * 取消撥付：顧客可選原方式退款、全部轉保留金、或兩者拆分（設計文件第 9.3 節）。
   * - manual_review 案件（機車未訂規則、業者故意違約、待鑑定損害、業者過失未收定金且缺約定
   *   總租金）一律擋下，須先由人工確認實際金額，本函式不猜金額。
   * - force_majeure 案件須先經 approve() 核准（approvedBy 已存在）才能撥付。
   * - 轉保留金的金額（含 split 的保留金部分）必須先取得顧客明確同意（creditConsent）。
   * - 退款＋保留金金額合計必須精確等於案件的應退總額，不允許不明差額。
   */
  disposeCase(input: DisposeCancellationCaseInput): DisposeCancellationCaseResult {
    // 新台幣沒有小數位，理由同 quoteCancellation 的 assertIntegerMoney——這裡收的是表單輸入，
    // 不是純函式算出來的數字，必須在寫入任何紀錄前擋下非整數金額，不做隱性四捨五入。
    if (!Number.isInteger(input.refundAmount)) {
      throw new RangeError(`refundAmount must be an integer amount of TWD, got ${input.refundAmount}`);
    }
    if (!Number.isInteger(input.creditAmount)) {
      throw new RangeError(`creditAmount must be an integer amount of TWD, got ${input.creditAmount}`);
    }

    const kase = this.mustGet(input.caseId);

    if (kase.status !== 'quoted' && kase.status !== 'approved') {
      throw new CaseNotReadyForDispositionError(kase.status);
    }
    if (kase.responsibility === 'force_majeure' && !kase.approvedBy) {
      throw new ForceMajeureApprovalRequiredError();
    }

    const expectedTotal = this.totalDisposableAmount(kase);
    const disposedTotal = input.refundAmount + input.creditAmount;
    if (disposedTotal !== expectedTotal) {
      throw new DispositionAmountMismatchError(expectedTotal, disposedTotal);
    }
    if (input.creditAmount > 0 && !input.creditConsent) {
      throw new CreditConsentRequiredError();
    }

    const booking = this.bookingStore.bookings().find((b) => b.id === kase.bookingId);
    if (!booking) throw new Error(`not found: ${kase.bookingId}`);

    const completed: CancellationDispositionStep[] = [];

    let refund: RefundRecord | undefined;
    if (input.refundAmount > 0) {
      try {
        refund = this.paymentStore.recordRefund({
          bookingId: kase.bookingId,
          cancellationCaseId: kase.id,
          amount: input.refundAmount,
          method: input.refundMethod ?? 'cash',
          status: 'pending',
          handledBy: input.actor.actorName,
        });
        completed.push('refund_record');
      } catch (cause) {
        throw new CancellationDispositionPartialFailureError(completed, 'refund_record', cause);
      }
    }

    let credit: CustomerCreditLedgerEntry | undefined;
    if (input.creditAmount > 0) {
      try {
        credit = this.creditStore.issue({
          memberId: booking.memberId,
          amount: input.creditAmount,
          occurredAt: input.occurredAt,
          handledBy: input.actor.actorName,
          sourceCancellationCaseId: kase.id,
          reason: 'cancellation_credit_conversion',
          ...(input.creditExpiryMonths != null
            ? { expiresAt: addMonths(input.occurredAt, input.creditExpiryMonths) }
            : {}),
        });
        completed.push('credit_entry');
      } catch (cause) {
        throw new CancellationDispositionPartialFailureError(completed, 'credit_entry', cause);
      }
    }

    try {
      this.bookingStore.cancel(kase.bookingId);
      completed.push('booking_transition');
    } catch (cause) {
      throw new CancellationDispositionPartialFailureError(completed, 'booking_transition', cause);
    }

    let updated: CancellationCase;
    try {
      updated = this.repo.update(kase.id, { status: 'settled', disposition: input.disposition });
      this.reload();
      completed.push('case_settle');
    } catch (cause) {
      throw new CancellationDispositionPartialFailureError(completed, 'case_settle', cause);
    }

    try {
      this.appendAuditEntry({
        action: input.creditAmount > 0 ? 'approve' : 'update',
        entityType: 'cancellation_case',
        entityId: kase.id,
        actorId: input.actor.actorId,
        actorName: input.actor.actorName,
        afterSummary: `取消撥付：退款 ${input.refundAmount}、保留金 ${input.creditAmount}`,
        ...(input.creditAmount > 0 ? { reason: '顧客同意轉為保留金' } : {}),
      });
      completed.push('audit_entry');
    } catch (cause) {
      throw new CancellationDispositionPartialFailureError(completed, 'audit_entry', cause);
    }

    return { case: updated, refund, credit };
  }

  private mustGet(id: string): CancellationCase {
    const kase = this.repo.getById(id);
    if (!kase) throw new Error(`not found: ${id}`);
    return kase;
  }

  private appendAuditEntry(input: Omit<AuditEntry, 'id' | 'createdAt'>): AuditEntry {
    const entry: AuditEntry = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input };
    this.auditRepo.create(entry);
    return entry;
  }

  private reload(): void {
    this._cases.set(this.repo.getAll());
  }
}
