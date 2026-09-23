import { SelectOption } from './select-option';
import { VehicleCategory } from './vehicle';
export type CouponType = 'percent' | 'amount';

/** 優惠券折扣方式的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const COUPON_TYPE_OPTIONS: SelectOption<CouponType>[] = [
  { value: 'percent', label: '百分比' },
  { value: 'amount', label: '固定金額' },
];
export interface Coupon {
  id: string; code: string; type: CouponType; value: number;
  minDays?: number; applicableCategories?: VehicleCategory[];
  validFrom: string; validTo: string; // 'YYYY-MM-DD'
}
