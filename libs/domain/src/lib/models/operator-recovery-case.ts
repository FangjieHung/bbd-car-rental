/**
 * 業者責任原因（設計文件第 10 節）：車輛故障、超賣、人員調度失誤與其他可歸責事由。
 * 涵蓋的都是取車前、車輛無法依約交付的情境——不是行租中車輛故障（那不在本次工作流範圍內）。
 */
export type OperatorRecoveryReason =
  | 'vehicle_breakdown'
  | 'oversell'
  | 'staff_dispatch_error'
  | 'other_attributable';

/**
 * 依序救單的三種補救方案（設計文件第 10 節「流程不是先取消，而是依序救單」）：
 * 1. 同級調車；2. 免費升等；3. 合作同業轉單。
 * 業者責任取消（operator_fault cancellation）不是「補救方案」，是補救全部失敗或顧客不同意後
 * 的最終處置，透過既有 Task 4/14 的取消基礎設施（quoteCancellation／CancellationStore）
 * 進行，因此不出現在這個列舉——見 OperatorRecoveryCase.status 的 escalated_to_cancellation。
 */
export type OperatorRecoveryRemedyType = 'same_class_replacement' | 'free_upgrade' | 'partner_transfer';

/** 三種補救方案的嘗試順序；OperatorRecoveryStore.attemptRemedy() 依此強制序列。 */
export const OPERATOR_RECOVERY_REMEDY_ORDER: readonly OperatorRecoveryRemedyType[] = [
  'same_class_replacement',
  'free_upgrade',
  'partner_transfer',
];

/**
 * 單次補救嘗試的結果：
 * - accepted：顧客同意採用，案件解決。
 * - declined：有可行方案但顧客不同意，須嘗試下一順位。
 * - unavailable：重新檢查後根本無可行方案（例如同級無空車），視同失敗，須嘗試下一順位。
 * declined 與 unavailable 都會走向下一個補救方案，或（若已是最後一個）走向業者責任取消。
 */
export type OperatorRecoveryRemedyOutcome = 'accepted' | 'declined' | 'unavailable';

/**
 * 一次補救方案的完整嘗試紀錄——設計文件第 10 節要求「發現時間、通知時間、各補救方案嘗試記錄
 * 與客戶決定、吸收差額」全部留存，不是只記最後結果。availabilitySnapshot 是當下查詢到的可用性
 * 或報價文字快照，與之後車輛狀態/報價異動脫鉤，事後查得出「當時依據什麼資訊做決定」。
 */
export interface OperatorRecoveryRemedyAttempt {
  id: string;
  type: OperatorRecoveryRemedyType;
  /** 重新檢查可用性／取得報價的時間（ISO）。 */
  attemptedAt: string;
  /** 可用性或報價快照的文字說明，供事後追溯依據；不是活資料參照。 */
  availabilitySnapshot?: string;
  /** 同級調車／免費升等使用：本社車隊內的替代車輛 id。 */
  replacementVehicleId?: string;
  /** 合作同業轉單使用：合作業者與替代車輛說明、外部報價金額。 */
  partnerId?: string;
  partnerName?: string;
  externalVehicleDescription?: string;
  externalQuoteAmount?: number;
  /**
   * 業者吸收的差額——免費升等時是「升等車型與原車型的價差」，合作同業轉單時是「外部報價
   * 與原契約金額的差額」；同級調車理論上無價差，預設 0。顧客實付金額（訂單 priceBreakdown）
   * 本身不會被這個欄位觸動，「顧客價格不增加」是因為補救方案根本不改動 priceBreakdown，
   * 只改車輛，這個欄位純粹是業者內部吸收成本的稽核記錄。
   */
  absorbedDifference: number;
  outcome: OperatorRecoveryRemedyOutcome;
  /** 顧客決定的時間與備註；outcome 為 unavailable（根本沒有方案可問顧客）時可能沒有值。 */
  customerDecisionAt?: string;
  customerDecisionNote?: string;
  /** outcome 為 accepted 時必須為 true——任何補救方案都必須先取得顧客明確同意。 */
  customerConsent?: boolean;
  /**
   * 車輛異動觸發的新合約版本 id（僅同級調車／免費升等且 outcome accepted、且確實構成合約
   * 重大異動時才有值）——由 ContractStore.reviseIfChanged() 決定，本欄位只是把結果掛回來
   * 方便追溯，不重算是否需要新版本。
   */
  contractVersionId?: string;
  /** 記錄本次嘗試的操作人。 */
  notedBy: string;
  /** outcome 為 accepted 時必須有值——任何一種補救方案的採用都須經主管／有權人核准。 */
  approvedBy?: string;
}

/** 計程車車資補貼：金額、憑證、核准人（設計文件第 10 節「額外補償獨立記錄」）。 */
export interface OperatorRecoveryTaxiReimbursement {
  id: string;
  amount: number;
  /** 憑證圖檔的 asset id（收據照片等），選填。 */
  evidenceAssetId?: string;
  occurredAt: string;
  notedBy: string;
  approvedBy: string;
}

/** 折價券或額外保留金，標示為善意補償，與法定現金賠償各自獨立。 */
export type OperatorRecoveryGoodwillCompensationType = 'credit' | 'coupon';

/**
 * 善意補償（折價券／額外保留金）。設計文件第 10 節：「善意補償不得自動抵銷依法應退或應賠
 * 的現金」——本模型與 OperatorRecoveryCase 的統計現金賠償（透過 escalatedCancellationCaseId
 * 連到的 CancellationCase.totalCashDue）完全分開存放，OperatorRecoveryStore 沒有任何路徑會
 * 把這裡的金額拿去折抵那邊的現金，兩本帳各自獨立。
 */
export interface OperatorRecoveryGoodwillCompensation {
  id: string;
  type: OperatorRecoveryGoodwillCompensationType;
  amount: number;
  couponCode?: string;
  occurredAt: string;
  notedBy: string;
  approvedBy: string;
}

/**
 * 案件狀態。刻意只有三種、緊貼 OperatorRecoveryStore 實際會用到的轉換，不去猜測補救方案
 * 內部更細的生命週期（那些細節在 OperatorRecoveryRemedyAttempt.outcome 裡）：
 * - in_progress：案件開立中，補救方案依序嘗試。
 * - resolved：某個補救方案被顧客接受，案件解決。
 * - escalated_to_cancellation：三個補救方案皆失敗（拒絕或無方案）後，進入業者責任取消
 *   （透過既有 CancellationStore，見 cancellationCaseId）。
 */
export type OperatorRecoveryCaseStatus = 'in_progress' | 'resolved' | 'escalated_to_cancellation';

/**
 * 業者過失／意外事件（車輛故障、超賣、派車錯誤等）的復原與補償案件——完整設計（Task 15）。
 *
 * 涵蓋範圍：取車前、業者無法依約交付原車輛的情境（車輛故障、超賣、人員調度失誤、其他可歸責
 * 事由）。行租中（in_progress 訂單）車輛故障不在本次工作流範圍內。
 *
 * 流程依設計文件第 10 節「流程不是先取消，而是依序救單」：同級調車 → 免費升等 → 合作同業轉單
 * → （皆失敗或顧客不同意）業者責任取消。取消本身委派給既有 quoteCancellation／
 * CancellationStore（Task 4／14），這裡不重新實作金額試算或訂單轉換。
 */
export interface OperatorRecoveryCase {
  id: string;
  bookingId: string;
  reason: OperatorRecoveryReason;
  reasonNote?: string;
  /** 發現問題的時間（ISO）——例：發現車輛故障、確認超賣的時間點。 */
  discoveredAt: string;
  /** 通知顧客的時間（ISO）。設計文件明載：通知時機只影響緊急程度與善意補償，不縮減基本責任。 */
  notifiedAt: string;
  status: OperatorRecoveryCaseStatus;
  /** 依序記錄的補救方案嘗試；順序與內容見 OPERATOR_RECOVERY_REMEDY_ORDER。 */
  remedyAttempts: OperatorRecoveryRemedyAttempt[];
  /** status 為 resolved 時，記錄是哪個補救方案被接受。 */
  resolvedRemedyType?: OperatorRecoveryRemedyType;
  resolvedAt?: string;
  /** status 為 escalated_to_cancellation 時，指向實際承載金額試算與撥付的取消案件。 */
  cancellationCaseId?: string;
  escalatedAt?: string;
  /** 計程車車資補貼紀錄，與統計現金賠償各自獨立累積。 */
  taxiReimbursements: OperatorRecoveryTaxiReimbursement[];
  /** 善意補償（折價券／額外保留金）紀錄，不得抵銷法定現金賠償。 */
  goodwillCompensations: OperatorRecoveryGoodwillCompensation[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
