/** 稽核事件涉及的實體類型。涵蓋本次工作流新增的模型；後續 task 如新增實體須擴充此清單。 */
export type AuditEntityType =
  | 'booking' // 即「訂單」；已寫入 localStorage 的持久化值，改名需附資料遷移，故保留舊值
  | 'member'
  | 'identity_document'
  | 'driver_credential'
  | 'contract_version'
  | 'cancellation_case'
  | 'handover_record'
  | 'payment_record';

/**
 * 稽核事件動作類型。override 特別用於設計文件第 7 節「主管可覆核部分阻擋」的情境——
 * 這類覆核不是一般的 update，必須留存原因、操作人與時間，因此獨立成一個動作類型
 * 以便在稽核列表中快速篩選。
 */
export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'override' | 'void';

/**
 * 單筆操作稽核紀錄：誰、什麼時候、對哪個實體做了什麼、異動前後摘要與原因。
 * beforeSummary／afterSummary 是給列表顯示用的簡短摘要，不是完整快照——
 * 完整快照的保存責任在各自的模型（例如 ContractVersion.snapshot），
 * 稽核紀錄只負責記錄「誰在什麼時候基於什麼原因做了這件事」。
 *
 * createdAt／serverRecordedAt 是一組「與後端交接相容」的時間戳欄位：createdAt 是前端
 * 產生事件當下的樂觀時間戳（例如離線或排隊送出時先記錄），serverRecordedAt 是後端實際
 * 寫入資料庫的時間，兩者可能不同，用來偵測裝置時鐘飄移或延遲送出的落差；
 * 尚未同步到後端前 serverRecordedAt 為 undefined。
 */
export interface AuditEntry {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  beforeSummary?: string;
  afterSummary?: string;
  reason?: string;
  actorId: string;
  actorName: string;
  createdAt: string; // ISO，前端產生
  serverRecordedAt?: string; // ISO，後端寫入時補上
}
