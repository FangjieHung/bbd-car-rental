import { Injectable, Signal, inject, signal } from '@angular/core';
import { ChargeAdjustment, PaymentRecord, PaymentSummary, RefundRecord, calculatePaymentSummary } from '@car-rental/domain';
import {
  BOOKING_REPO,
  CHARGE_ADJUSTMENT_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
} from '../../core/repositories/tokens';

/**
 * 付款分類帳的薄封裝：CRUD 寫入三個 repository（付款、退款、費用調整），
 * 金額試算全部委派給 Task 2 的 calculatePaymentSummary 純函式，這裡不重算任何金額規則。
 */
@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private readonly paymentRepo = inject(PAYMENT_REPO);
  private readonly refundRepo = inject(REFUND_REPO);
  private readonly adjustmentRepo = inject(CHARGE_ADJUSTMENT_REPO);
  private readonly bookingRepo = inject(BOOKING_REPO);

  private readonly _payments = signal<PaymentRecord[]>(this.paymentRepo.getAll());
  readonly payments: Signal<PaymentRecord[]> = this._payments.asReadonly();

  private readonly _refunds = signal<RefundRecord[]>(this.refundRepo.getAll());
  readonly refunds: Signal<RefundRecord[]> = this._refunds.asReadonly();

  private readonly _adjustments = signal<ChargeAdjustment[]>(this.adjustmentRepo.getAll());
  readonly adjustments: Signal<ChargeAdjustment[]> = this._adjustments.asReadonly();

  paymentsFor(bookingId: string): PaymentRecord[] {
    return this._payments().filter((p) => p.bookingId === bookingId);
  }

  refundsFor(bookingId: string): RefundRecord[] {
    return this._refunds().filter((r) => r.bookingId === bookingId);
  }

  adjustmentsFor(bookingId: string): ChargeAdjustment[] {
    return this._adjustments().filter((a) => a.bookingId === bookingId);
  }

  recordPayment(input: Omit<PaymentRecord, 'id'>): PaymentRecord {
    const payment: PaymentRecord = { id: crypto.randomUUID(), ...input };
    this.paymentRepo.create(payment);
    this.reloadPayments();
    return payment;
  }

  voidPayment(id: string): void {
    this.paymentRepo.update(id, { status: 'voided' });
    this.reloadPayments();
  }

  recordRefund(input: Omit<RefundRecord, 'id'>): RefundRecord {
    const refund: RefundRecord = { id: crypto.randomUUID(), ...input };
    this.refundRepo.create(refund);
    this.reloadRefunds();
    return refund;
  }

  completeRefund(id: string, processedAt: string): RefundRecord {
    const updated = this.refundRepo.update(id, { status: 'completed', processedAt });
    this.reloadRefunds();
    return updated;
  }

  createAdjustment(input: Omit<ChargeAdjustment, 'id' | 'status'>): ChargeAdjustment {
    const adjustment: ChargeAdjustment = { id: crypto.randomUUID(), status: 'draft', ...input };
    this.adjustmentRepo.create(adjustment);
    this.reloadAdjustments();
    return adjustment;
  }

  confirmAdjustment(id: string): void {
    this.adjustmentRepo.update(id, { status: 'confirmed' });
    this.reloadAdjustments();
  }

  voidAdjustment(id: string): void {
    this.adjustmentRepo.update(id, { status: 'voided' });
    this.reloadAdjustments();
  }

  /** 依目前該訂單的付款、調整、退款紀錄，重算最新的付款分類帳摘要。 */
  summaryFor(bookingId: string): PaymentSummary {
    const booking = this.bookingRepo.getById(bookingId);
    if (!booking) throw new Error(`not found: ${bookingId}`);
    return calculatePaymentSummary({
      baseTotal: booking.priceBreakdown?.total ?? 0,
      depositRequired: booking.depositRequired,
      payments: this.paymentsFor(bookingId),
      adjustments: this.adjustmentsFor(bookingId),
      refunds: this.refundsFor(bookingId),
    });
  }

  private reloadPayments(): void {
    this._payments.set(this.paymentRepo.getAll());
  }

  private reloadRefunds(): void {
    this._refunds.set(this.refundRepo.getAll());
  }

  private reloadAdjustments(): void {
    this._adjustments.set(this.adjustmentRepo.getAll());
  }
}
