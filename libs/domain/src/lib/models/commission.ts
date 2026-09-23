import { SelectOption } from './select-option';
export type CommissionType = 'percent' | 'per_vehicle_day';

/** 退佣計算方式的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const COMMISSION_TYPE_OPTIONS: SelectOption<CommissionType>[] = [
  { value: 'percent', label: '訂單金額百分比' },
  { value: 'per_vehicle_day', label: '每車每日固定額' },
];

export interface CommissionRule {
  type: CommissionType;
  value: number;
}
