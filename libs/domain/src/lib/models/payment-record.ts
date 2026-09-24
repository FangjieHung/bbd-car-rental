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

/** 款項用途的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const PAYMENT_PURPOSE_OPTIONS: SelectOption<PaymentPurpose>[] = [
  { value: 'deposit', label: '訂金' },
  { value: 'balance', label: '尾款' },
  { value: 'adjustment', label: '其他調整' },
];
export type PaymentRecordStatus = 'pending' | 'confirmed' | 'failed' | 'voided';

/** 單筆款項狀態的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const PAYMENT_RECORD_STATUS_OPTIONS: SelectOption<PaymentRecordStatus>[] = [
  { value: 'pending', label: '待確認' },
  { value: 'confirmed', label: '已確認' },
  { value: 'failed', label: '失敗' },
  { value: 'voided', label: '已作廢' },
];
export type PaymentStatus =
  | 'deposit_due'
  | 'deposit_paid'
  | 'paid_in_full'
  | 'additional_payment_due'
  | 'overpaid';

/** 訂單付款狀態的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const PAYMENT_STATUS_OPTIONS: SelectOption<PaymentStatus>[] = [
  { value: 'deposit_due', label: '待收訂金' },
  { value: 'deposit_paid', label: '訂金已收，尾款待收' },
  { value: 'paid_in_full', label: '已付清' },
  { value: 'additional_payment_due', label: '有新增應收款' },
  { value: 'overpaid', label: '溢收，待退款或轉保留金' },
];

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
