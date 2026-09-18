import { Injectable, Signal, inject, signal } from '@angular/core';
import {
  CancellationCase,
  CancellationContractKind,
  CancellationQuote,
  CancellationQuoteInput,
  CancellationRefundLine,
  CancellationResponsibility,
  quoteCancellation,
} from '@car-rental/domain';
import { CANCELLATION_CASE_REPO } from '../../core/repositories/tokens';

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
 * 取消案件的薄封裝：試算金額委派給 Task 4 的 quoteCancellation 純函式，
 * 這裡只負責把試算結果轉存成 CancellationCase 紀錄與後續狀態推進。
 */
@Injectable({ providedIn: 'root' })
export class CancellationStore {
  private readonly repo = inject(CANCELLATION_CASE_REPO);

  private readonly _cases = signal<CancellationCase[]>(this.repo.getAll());
  readonly cases: Signal<CancellationCase[]> = this._cases.asReadonly();

  casesFor(bookingId: string): CancellationCase[] {
    return this._cases().filter((c) => c.bookingId === bookingId);
  }

  quote(input: CancellationQuoteInput): CancellationQuote {
    return quoteCancellation(input);
  }

  createCase(input: CreateCancellationCaseInput): CancellationCase {
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

  private reload(): void {
    this._cases.set(this.repo.getAll());
  }
}
