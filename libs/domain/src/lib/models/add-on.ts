import { SelectOption } from './select-option';
export type AddOnUnit = 'per_rental' | 'per_day';

/** 配件計價單位的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const ADD_ON_UNIT_OPTIONS: SelectOption<AddOnUnit>[] = [
  { value: 'per_rental', label: '每筆訂單' },
  { value: 'per_day', label: '每日' },
];
export interface AddOn { id: string; name: string; unitPrice: number; unit: AddOnUnit; }
