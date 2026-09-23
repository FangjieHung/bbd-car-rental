import { SelectOption } from './select-option';

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

/** 車輛狀態的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const VEHICLE_STATUS_OPTIONS: SelectOption<VehicleStatus>[] = [
  { value: 'available', label: '可租借' },
  { value: 'rented', label: '出租中' },
  { value: 'maintenance', label: '保養中' },
  { value: 'reserved', label: '已保留' },
];
/**
 * 訂單的「履約」狀態，只描述車輛交接進度，不代表付款是否完成 ——
 * 付款狀態改由 Task 7 的付款分類帳（PaymentRecord 系列）獨立追蹤。
 * 舊資料的 pending_payment／confirmed 由 normalizeRentalOrder 統一遷移為 reserved。
 */
export type OrderStatus = 'reserved' | 'in_progress' | 'completed' | 'cancelled';

/**
 * 會佔用車輛的訂單狀態：還沒交車（reserved）與出租中（in_progress）。可用性、時段衝突、
 * 調度月曆都以這一份為準，不要各自再列一次。
 */
export const OCCUPYING_ORDER_STATUSES: readonly OrderStatus[] = ['reserved', 'in_progress'];

export function isOccupyingStatus(status: OrderStatus): boolean {
  return OCCUPYING_ORDER_STATUSES.includes(status);
}

/** 訂單狀態的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const ORDER_STATUS_OPTIONS: SelectOption<OrderStatus>[] = [
  { value: 'reserved', label: '已預訂' },
  { value: 'in_progress', label: '出租中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];
/** 客戶下單時表達的付款意向（官網訂單流程用）；與後台實際收款方式 PaymentMethod 是不同的集合。 */
export type PaymentPreference = 'credit_card' | 'line_pay' | 'on_site' | 'bank_transfer';

/** 標籤取自官網 confirm-step／payment-page 原本各自維護的 PAYMENT_METHOD_LABEL（現已統一到這裡）。 */
export const PAYMENT_PREFERENCE_OPTIONS: SelectOption<PaymentPreference>[] = [
  { value: 'credit_card', label: '信用卡' },
  { value: 'line_pay', label: 'LINE Pay' },
  { value: 'on_site', label: '現場付款' },
  { value: 'bank_transfer', label: '轉帳' },
];
