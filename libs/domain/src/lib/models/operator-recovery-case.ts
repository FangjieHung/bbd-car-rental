/**
 * 業者過失／意外事件（車輛故障、超賣、派車錯誤等）的復原與補償案件。
 *
 * 完整欄位設計（發現時間、通知時間、各補救方案嘗試記錄與客戶決定、吸收差額、
 * 最終處置、審批人等）屬於 Task 15「操作復原與補償」的範圍，這裡只先定義 Task 7
 * 註冊 repository token 所需的最小骨架，讓 OPERATOR_RECOVERY_CASE_REPO 有型別可用。
 * Task 15 會依設計文件擴充這個介面；擴充時應維持向後相容或提供遷移。
 */
export type OperatorRecoveryCaseStatus =
  | 'open'
  | 'remedy_offered'
  | 'remedy_accepted'
  | 'remedy_rejected'
  | 'resolved'
  | 'cancelled';

export interface OperatorRecoveryCase {
  id: string;
  bookingId: string;
  /** 觸發原因，例：vehicle_breakdown、oversell、staff_dispatch_error；Task 15 會訂出完整列舉。 */
  reason: string;
  status: OperatorRecoveryCaseStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
