import { SelectOption } from './select-option';
export type PayoutStatus = 'pending' | 'paid';

/** 退佣帳單狀態的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const PAYOUT_STATUS_OPTIONS: SelectOption<PayoutStatus>[] = [
  { value: 'pending', label: '待撥款' },
  { value: 'paid', label: '已撥款' },
];

export interface MonthlyPayout {
  id: string;
  partnerId: string;
  month: string; // 'YYYY-MM'
  status: PayoutStatus;
}
