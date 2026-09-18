export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';
/**
 * 訂單的「履約」狀態，只描述車輛交接進度，不代表付款是否完成 ——
 * 付款狀態改由 Task 7 的付款分類帳（PaymentRecord 系列）獨立追蹤。
 * 舊資料的 pending_payment／confirmed 由 normalizeRentalBooking 統一遷移為 reserved。
 */
export type BookingStatus = 'reserved' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentPreference = 'credit_card' | 'line_pay' | 'on_site' | 'bank_transfer';
