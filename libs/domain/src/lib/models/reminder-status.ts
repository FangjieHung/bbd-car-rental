/**
 * 還車提醒的排程種類：還車前 24 小時完整提醒、還車前 2 小時短版提醒。
 * 設計文件第 8 節「Email 還車提醒」預設排程。
 */
export type ReminderOffset = '24h_before_return' | '2h_before_return';

/**
 * 提醒狀態，逐字對應設計文件第 8 節前端顯示的五種狀態：
 * 待排程、已排程、已寄送、失敗、缺少 Email。
 * 實際排程、寄送與重試邏輯由後端負責；前端只顯示這個狀態欄位（與後端交接的資料形狀）。
 */
export type ReminderState = 'pending_schedule' | 'scheduled' | 'sent' | 'failed' | 'missing_email';

/**
 * 單筆還車提醒的狀態紀錄。訂單取消或完成後不寄（呼叫端應把既有排程轉為終止狀態，
 * 本模型不強制規定用哪個 state 表示「已終止」，交由呼叫端決定，例如直接刪除排程紀錄）；
 * 修改還車時間後，後端會取消舊排程並依新時間重排，此時 scheduledFor 會更新。
 */
export interface ReminderStatus {
  id: string;
  bookingId: string;
  offset: ReminderOffset;
  state: ReminderState;
  /** 預計寄送時間（ISO），由還車時間反推；缺少 Email 或尚未排程時不提供。 */
  scheduledFor?: string;
  sentAt?: string; // ISO
  /** 寄送失敗原因，後端回傳的錯誤訊息或代碼；state 非 failed 時不提供。 */
  failureReason?: string;
  updatedAt: string; // ISO
}
