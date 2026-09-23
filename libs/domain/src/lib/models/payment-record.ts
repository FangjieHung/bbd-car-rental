import { SelectOption } from './select-option';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'line_pay'
  | 'bank_transfer'
  | 'customer_credit';

/** 標籤取自 admin apps/admin/src/app/core/i18n/zh-tw.ts 原本的 paymentMethodLabels（現已統一到這裡）。 */
export const PAYMENT_METHOD_OPTIONS: SelectOption<PaymentMethod>[] = [
  { value: 'cash', label: '現金' },
  { value: 'credit_card', label: '信用卡' },
  { value: 'line_pay', label: 'LINE Pay' },
  { value: 'bank_transfer', label: '匯款' },
  { value: 'customer_credit', label: '會員購物金' },
];

export type PaymentPurpose = 'deposit' | 'balance' | 'adjustment';
export type PaymentRecordStatus = 'pending' | 'confirmed' | 'failed' | 'voided';
export type PaymentStatus =
  | 'deposit_due'
  | 'deposit_paid'
  | 'paid_in_full'
  | 'additional_payment_due'
  | 'overpaid';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  purpose: PaymentPurpose;
  status: PaymentRecordStatus;
  receivedAt: string;
  handledBy: string;
  bankLastFive?: string;
  note?: string;
}

export interface ChargeAdjustment {
  id: string;
  bookingId: string;
  kind: 'late_return' | 'energy' | 'manual';
  quotedAmount: number;
  amount: number;
  status: 'draft' | 'confirmed' | 'voided';
  reason?: string;
  createdAt: string;
  handledBy: string;
}

export interface RefundRecord {
  id: string;
  bookingId: string;
  cancellationCaseId?: string;
  amount: number;
  method: Exclude<PaymentMethod, 'customer_credit'>;
  status: 'pending' | 'completed' | 'failed' | 'voided';
  processedAt?: string;
  handledBy: string;
  note?: string;
}
