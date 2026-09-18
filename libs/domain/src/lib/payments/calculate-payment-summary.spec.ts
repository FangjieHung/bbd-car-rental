import { describe, it, expect } from 'vitest';
import { calculatePaymentSummary } from './calculate-payment-summary';
import { ChargeAdjustment, PaymentRecord, RefundRecord } from '../models';

function payment(partial: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: 'pay1',
    bookingId: 'b1',
    amount: 1000,
    method: 'cash',
    purpose: 'balance',
    status: 'confirmed',
    receivedAt: '2026-01-01T00:00:00+08:00',
    handledBy: 'staff1',
    ...partial,
  };
}

function adjustment(partial: Partial<ChargeAdjustment> = {}): ChargeAdjustment {
  return {
    id: 'adj1',
    bookingId: 'b1',
    kind: 'manual',
    quotedAmount: 500,
    amount: 500,
    status: 'confirmed',
    createdAt: '2026-01-01T00:00:00+08:00',
    handledBy: 'staff1',
    ...partial,
  };
}

function refund(partial: Partial<RefundRecord> = {}): RefundRecord {
  return {
    id: 'ref1',
    bookingId: 'b1',
    amount: 500,
    method: 'cash',
    status: 'completed',
    handledBy: 'staff1',
    ...partial,
  };
}

describe('calculatePaymentSummary', () => {
  it('zero payment → deposit_due', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [],
      adjustments: [],
      refunds: [],
    });

    expect(summary).toMatchObject({
      requiredTotal: 3_000,
      netPaid: 0,
      balanceDue: 3_000,
      status: 'deposit_due',
    });
  });

  it('deposit paid but below full total → deposit_paid', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [payment({ amount: 900, purpose: 'deposit' })],
      adjustments: [],
      refunds: [],
    });

    expect(summary).toMatchObject({
      requiredTotal: 3_000,
      netPaid: 900,
      balanceDue: 2_100,
      status: 'deposit_paid',
    });
  });

  it('mixed payment methods are all reflected in methods', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [
        payment({ id: 'p1', amount: 900, method: 'cash', purpose: 'deposit' }),
        payment({ id: 'p2', amount: 2_100, method: 'credit_card', purpose: 'balance' }),
      ],
      adjustments: [],
      refunds: [],
    });

    expect(summary.methods).toEqual(expect.arrayContaining(['cash', 'credit_card']));
    expect(summary.methods).toHaveLength(2);
  });

  it('full payment → paid_in_full', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [payment({ amount: 3_000, purpose: 'balance' })],
      adjustments: [],
      refunds: [],
    });

    expect(summary).toMatchObject({
      requiredTotal: 3_000,
      netPaid: 3_000,
      balanceDue: 0,
      status: 'paid_in_full',
    });
  });

  it('becomes additional_payment_due when a confirmed adjustment reopens a settled booking', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [payment({ amount: 3_000, purpose: 'balance' })],
      adjustments: [adjustment({ amount: 500 })],
      refunds: [],
    });

    expect(summary).toMatchObject({
      requiredTotal: 3_500,
      netPaid: 3_000,
      balanceDue: 500,
      status: 'additional_payment_due',
    });
  });

  it('draft/voided adjustments are excluded from requiredTotal', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [payment({ amount: 3_000, purpose: 'balance' })],
      adjustments: [
        adjustment({ id: 'draft', amount: 200, status: 'draft' }),
        adjustment({ id: 'voided', amount: 300, status: 'voided' }),
      ],
      refunds: [],
    });

    expect(summary.requiredTotal).toBe(3_000);
    expect(summary.status).toBe('paid_in_full');
  });

  it('a completed refund reduces netPaid back to deposit_due', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [payment({ amount: 3_000, purpose: 'balance' })],
      adjustments: [],
      refunds: [refund({ amount: 3_000 })],
    });

    expect(summary).toMatchObject({
      requiredTotal: 3_000,
      completedRefunds: 3_000,
      netPaid: 0,
      balanceDue: 3_000,
      status: 'deposit_due',
    });
  });

  it('pending refunds do not affect netPaid', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [payment({ amount: 3_000, purpose: 'balance' })],
      adjustments: [],
      refunds: [refund({ amount: 3_000, status: 'pending' })],
    });

    expect(summary.completedRefunds).toBe(0);
    expect(summary.netPaid).toBe(3_000);
    expect(summary.status).toBe('paid_in_full');
  });

  it('overpayment → overpaid', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [payment({ amount: 3_500, purpose: 'balance' })],
      adjustments: [],
      refunds: [],
    });

    expect(summary).toMatchObject({
      requiredTotal: 3_000,
      netPaid: 3_500,
      balanceDue: -500,
      status: 'overpaid',
    });
  });

  it('pending or failed payments are not counted', () => {
    const summary = calculatePaymentSummary({
      baseTotal: 3_000,
      depositRequired: 900,
      payments: [
        payment({ id: 'confirmed', amount: 900, status: 'confirmed', purpose: 'deposit' }),
        payment({ id: 'pending', amount: 2_100, status: 'pending', purpose: 'balance' }),
        payment({ id: 'failed', amount: 2_100, status: 'failed', purpose: 'balance' }),
      ],
      adjustments: [],
      refunds: [],
    });

    expect(summary.confirmedPayments).toBe(900);
    expect(summary.status).toBe('deposit_paid');
  });
});
