import { SelectOption } from './select-option';
import { VehicleCategory } from './vehicle';

/**
 * 證件與駕駛資格共用的 OCR 辨識與人工確認狀態。設計文件第 4.3 節：
 * 「OCR 狀態、信心分數、人工確認時間與確認人」。
 */
export type DocumentVerificationState = 'unverified' | 'ocr_extracted' | 'verified' | 'rejected';

/** 證件查核狀態的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const DOCUMENT_VERIFICATION_STATE_OPTIONS: SelectOption<DocumentVerificationState>[] = [
  { value: 'unverified', label: '未驗證' },
  { value: 'ocr_extracted', label: 'OCR 已辨識' },
  { value: 'verified', label: '已驗證' },
  { value: 'rejected', label: '已退件' },
];

export interface DocumentVerification {
  state: DocumentVerificationState;
  /** OCR 辨識信心分數 0–1；未經 OCR 或純人工輸入時不提供。 */
  ocrConfidence?: number;
  verifiedAt?: string; // ISO
  verifiedBy?: string;
}

/** 身分證明文件種類：台灣身分證、護照、居留證。設計文件第 4.3 節。 */
export type IdentityDocumentType = 'taiwan_id' | 'passport' | 'resident_permit';

/**
 * 身分證明文件。存於會員層、可跨訂單重用（設計文件第 4.3 節「會員層保存可重用文件」）。
 * 正式證件圖檔只存 asset ID 參照，Member 本身不保存任何圖檔參照（設計原則 #7）。
 * 每次更新以新版本追加（version 遞增、supersededId 指回前一版），不覆寫舊版，
 * 讓訂單當時鎖定的版本參照仍可回溯到當初核對的內容。
 */
export interface IdentityDocument {
  id: string;
  memberId: string;
  type: IdentityDocumentType;
  documentNumber: string;
  issuingCountry: string;
  /** 效期（ISO 日期）；台灣身分證等無到期日的證件不提供。 */
  expiryDate?: string;
  frontImageAssetId?: string;
  backImageAssetId?: string;
  verification: DocumentVerification;
  /** 版本號，從 1 起算。 */
  version: number;
  /** 被取代前一版的 id；第一版為 undefined。 */
  supersededId?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/**
 * 駕駛資格種類：台灣駕照、外國正式駕照、國際駕照（IDP）、外國國際駕照簽證。
 * 設計文件第 4.3 節。
 */
export type DriverCredentialType = 'taiwan_license' | 'foreign_license' | 'idp' | 'foreign_idp_visa';

/**
 * 外國旅客駕照互惠資格：待查核、符合、不符合、需人工審查。設計文件第 4.3 節。
 * 本國籍與持居留證者一律不適用（呼叫端不應對其查詢此欄位，見 evaluatePickupReadiness
 * 裡 PickupDriverCredential.reciprocityStatus 的 'not_applicable' 用法）。
 */
export type ReciprocityStatus = 'pending' | 'eligible' | 'ineligible' | 'manual_review';

/** 駕照互惠查核結果的選項與預設繁中標籤（admin 以 optionLabelMap 取回 ZH_TW 原位；官網依 value 翻譯）。 */
export const RECIPROCITY_STATUS_OPTIONS: SelectOption<ReciprocityStatus>[] = [
  { value: 'pending', label: '尚未查核' },
  { value: 'eligible', label: '符合互惠資格' },
  { value: 'ineligible', label: '不符合互惠資格' },
  { value: 'manual_review', label: '需人工審查' },
];

/**
 * 駕駛資格（駕照 / 國際駕照 / 簽證）。與 IdentityDocument 一樣存於會員層、可跨訂單重用，
 * 以版本追加方式更新。正式證件圖檔只存 asset ID 參照，不進 Member。
 */
export interface DriverCredential {
  id: string;
  memberId: string;
  type: DriverCredentialType;
  documentNumber: string;
  issuingCountry: string;
  expiryDate?: string;
  /** 准駕類別原文，例如駕照上印的「小型車」。 */
  originalVehicleClassText: string;
  /** 標準化後的車種，供系統比對是否符合本次租用車種。 */
  standardizedVehicleClass: VehicleCategory;
  /** 原國駕照、國際駕照、簽證頁及必要正反面圖檔的 asset ID。 */
  frontImageAssetId?: string;
  backImageAssetId?: string;
  internationalPermitImageAssetId?: string;
  visaPageImageAssetId?: string;
  verification: DocumentVerification;
  reciprocityStatus: ReciprocityStatus;
  /** 合法使用截止日（例如國際駕照或簽證的有效期），可能早於證件本身的 expiryDate。 */
  legalUseThroughDate?: string;
  /** 最近一次核對本次租用車種是否相符的結果；未核對過時為 undefined。 */
  matchesRentedVehicleClass?: boolean;
  version: number;
  supersededId?: string;
  createdAt: string;
  updatedAt: string;
}
