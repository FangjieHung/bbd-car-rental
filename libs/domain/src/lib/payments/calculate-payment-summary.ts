import { ChargeAdjustment, PaymentMethod, PaymentRecord, PaymentStatus, RefundRecord } from '../models';

export interface PaymentSummary {
  requiredTotal: number;
  confirmedPayments: number;
  completedRefunds: number;
  netPaid: number;
  balanceDue: number;
  methods: PaymentMethod[];
  status: PaymentStatus;
}

function deriveStatus(input: {
  netPaid: number;
  baseTotal: number;
  depositRequired: number;
  requiredTotal: number;
}): PaymentStatus {
  const { netPaid, baseTotal, depositRequired, requiredTotal } = input;
  if (netPaid > requiredTotal) return 'overpaid';
  if (netPaid === requiredTotal) return 'paid_in_full';
  if (netPaid >= baseTotal) return 'additional_payment_due';
  if (netPaid >= depositRequired) return 'deposit_paid';
  return 'deposit_due';
}

export function calculatePaymentSummary(input: {
  baseTotal: number;
  depositRequired: number;
  payments: PaymentRecord[];
  adjustments: ChargeAdjustment[];
  refunds: RefundRecord[];
}): PaymentSummary {
  const { baseTotal, depositRequired, payments, adjustments, refunds } = input;

  const confirmedAdjustmentsTotal = adjustments
    .filter((a) => a.status === 'confirmed')
    .reduce((s, a) => s + a.amount, 0);
  const requiredTotal = baseTotal + confirmedAdjustmentsTotal;

  const confirmedPaymentRecords = payments.filter((p) => p.status === 'confirmed');
  const confirmedPayments = confirmedPaymentRecords.reduce((s, p) => s + p.amount, 0);

  const completedRefunds = refunds
    .filter((r) => r.status === 'completed')
    .reduce((s, r) => s + r.amount, 0);

  const netPaid = confirmedPayments - completedRefunds;
  const balanceDue = requiredTotal - netPaid;

  const methods = Array.from(new Set(confirmedPaymentRecords.map((p) => p.method)));

  const status = deriveStatus({ netPaid, baseTotal, depositRequired, requiredTotal });

  return { requiredTotal, confirmedPayments, completedRefunds, netPaid, balanceDue, methods, status };
}
