/**
 * 取消案件適用的合約類型。目前只有 passenger_car 訂有完整的日期級距退費表；
 * scooter 尚未訂出退費表，customer 責任的取消一律落 manual_review（見 quoteCancellation）。
 */
export type CancellationContractKind = 'passenger_car' | 'scooter';

/**
 * 取消責任歸屬：
 * - customer：顧客自行取消，適用日期級距退費表。
 * - force_majeure：不可抗力（天災等），全額退款、不收手續費。
 * - operator_fault：可歸責於業者之過失，退款外另負法定違約補償（有訂金者加倍退還訂金；
 *   未收訂金者以一次租金總額計）。
 * - operator_intentional：業者故意違約，金額爭議大，一律 manual_review，不由本函式自動試算。
 */
export type CancellationResponsibility =
  | 'customer'
  | 'force_majeure'
  | 'operator_fault'
  | 'operator_intentional';

/** 案件最終如何了結：退現金、轉會員購物金、或兩者拆分。 */
export type CancellationDisposition = 'refund' | 'credit' | 'split';

/** 案件目前的處理階段。manual_review 代表金額無法自動試算，需要人工判斷。 */
export type CancellationCaseStatus = 'manual_review' | 'quoted' | 'approved' | 'settled' | 'voided';

export type CancellationRefundLineLabel =
  | 'deposit'
  | 'other_prepayment'
  | 'statutory_compensation'
  | 'goodwill_compensation';

export interface CancellationRefundLine {
  label: CancellationRefundLineLabel;
  amount: number;
}

/**
 * 一筆取消案件的完整快照：不只存最終金額，連當下的輸入條件（責任歸屬、原始已收款、
 * 適用規則版本）都要留存，事後才查得出「當時是依什麼規則、什麼輸入算出這個金額」。
 */
export interface CancellationCase {
  id: string;
  bookingId: string;
  contractKind: CancellationContractKind;
  responsibility: CancellationResponsibility;
  /** 原因標籤，例：customer_change_of_mind、weather、vehicle_breakdown。 */
  reason: string;
  /** 顧客／業者提出取消的時間（ISO） */
  requestedAt: string;
  /** 試算當下套用的退費規則版本，規則調整後才能追溯舊案件依據哪個版本。 */
  ruleVersion: string;
  originalDepositPaid: number;
  originalOtherPrepayment: number;
  refundLines: CancellationRefundLine[];
  transferFee: number;
  disposition: CancellationDisposition;
  status: CancellationCaseStatus;
  approvedBy?: string;
  approvedAt?: string;
  /** 佐證資料（照片、對話紀錄等）的 asset ID，manual_review 案件審核時用。 */
  evidenceAssetIds: string[];
}
