import { SelectOption } from './select-option';

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';
/**
 * 訂單的「履約」狀態，只描述車輛交接進度，不代表付款是否完成 ——
 * 付款狀態改由 Task 7 的付款分類帳（PaymentRecord 系列）獨立追蹤。
 * 舊資料的 pending_payment／confirmed 由 normalizeRentalBooking 統一遷移為 reserved。
 */
export type BookingStatus = 'reserved' | 'in_progress' | 'completed' | 'cancelled';
/** 客戶下單時表達的付款意向（官網訂單流程用）；與後台實際收款方式 PaymentMethod 是不同的集合。 */
export type PaymentPreference = 'credit_card' | 'line_pay' | 'on_site' | 'bank_transfer';

/** 標籤取自官網 confirm-step／payment-page 原本各自維護的 PAYMENT_METHOD_LABEL（現已統一到這裡）。 */
export const PAYMENT_PREFERENCE_OPTIONS: SelectOption<PaymentPreference>[] = [
  { value: 'credit_card', label: '信用卡' },
  { value: 'line_pay', label: 'LINE Pay' },
  { value: 'on_site', label: '現場付款' },
  { value: 'bank_transfer', label: '轉帳' },
];
