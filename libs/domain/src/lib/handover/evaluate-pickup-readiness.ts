import { VehicleStatus } from '../models/enums';

/**
 * 取車阻擋分類，逐字對應設計文件第 7 節「取車阻擋與主管覆核」列出的六項一般人員不得取車情況：
 * 未達訂金門檻／最新合約未簽署／必要身分文件或駕照缺失或過期／外國旅客互惠資格或准駕車種不符／
 * 本次尚未確認核對證件正本／車輛衝突、維修中或其他不可交付狀態。
 */
export type PickupBlockerType =
  | 'deposit_below_threshold'
  | 'latest_contract_unsigned'
  | 'required_document_missing_or_expired'
  | 'foreign_reciprocity_or_vehicle_class_mismatch'
  | 'original_document_not_confirmed'
  | 'vehicle_not_deliverable';

/** 非阻擋提醒，逐字對應設計文件第 7 節「非阻擋提醒」：Email 缺少、OCR 信心偏低、證件即將到期、特殊備註。 */
export type PickupWarningType =
  | 'missing_email'
  | 'low_confidence_ocr'
  | 'document_near_expiry'
  | 'special_note';

export interface PickupBlocker {
  type: PickupBlockerType;
  /** 機器可判讀的細節代碼，例如 'missing_document:national_id'，同一 type 底下可能有多種細節。 */
  reason: string;
  message: string;
}

export interface PickupWarning {
  type: PickupWarningType;
  message: string;
}

export interface PickupRequiredDocument {
  /** 文件種類，例如 national_id、passport、resident_permit。 */
  kind: string;
  present: boolean;
  /** 效期（ISO 日期）；未提供代表不追蹤效期。 */
  expiryDate?: string;
  /** OCR 辨識信心分數 0–1；未提供代表未經 OCR 或為人工輸入。 */
  ocrConfidence?: number;
}

export interface PickupDriverCredential {
  present: boolean;
  expiryDate?: string;
  /** 准駕車種是否與本次車輛相符。 */
  matchesVehicleClass: boolean;
  isForeignVisitor: boolean;
  /** 非外國旅客一律為 not_applicable，不參與互惠資格判斷。 */
  reciprocityStatus: 'not_applicable' | 'pending' | 'eligible' | 'ineligible';
}

export interface PickupVehicleReadiness {
  status: VehicleStatus;
  /** 是否與其他訂單／保養排程衝突，導致本次無法交車。 */
  hasSchedulingConflict: boolean;
  /**
   * 這台車目前還在前一位客人手上（另一筆出租中的訂單，含逾時未還）時帶入那筆訂單預定的還車時間（ISO）。
   * 有值時，阻擋原因的第一項是「前一位客人尚未還車」（已逾時就寫出逾時多久），取代「車輛目前在租」
   * 這類通用說法——車還沒回來，其他缺口（合約、訂金…）補齊了也交不了車，所以要最先讓人看到。
   */
  previousRental?: { scheduledReturnAt: string };
}

export interface PickupReadinessInput {
  /** 評估當下時間（ISO），用來判斷文件／駕照是否已過期或即將到期。 */
  evaluatedAt: string;
  depositRequired: number;
  depositPaid: number;
  /**
   * 目前有效的合約版本是否已簽署。呼叫端請一律用
   * `contractSigningState(versions) === 'signed'` 推導，不要自行判斷——
   * 「需重新簽署」（舊版已簽、目前有效版本未簽）對交車而言等同未簽署，必須是 false。
   */
  latestContractSigned: boolean;
  requiredDocuments: PickupRequiredDocument[];
  driverCredential: PickupDriverCredential;
  originalDocumentCheckedThisVisit: boolean;
  vehicle: PickupVehicleReadiness;
  memberEmail?: string;
  specialNotes?: string;
  /** 距到期幾天內視為「即將到期」警示；未提供時預設 30 天。 */
  nearExpiryThresholdDays?: number;
  /** OCR 信心低於此值視為警示；未提供時預設 0.6。 */
  lowConfidenceThreshold?: number;
}

export interface PickupReadiness {
  /** true 代表 blockers 為空；warnings 不影響這個值。 */
  ready: boolean;
  blockers: PickupBlocker[];
  warnings: PickupWarning[];
}

const DEFAULT_NEAR_EXPIRY_THRESHOLD_DAYS = 30;
const DEFAULT_LOW_CONFIDENCE_THRESHOLD = 0.6;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 到期日相對評估時間的天數；負值代表已過期。 */
function daysUntil(dateIso: string, evaluatedAt: string): number {
  const target = new Date(dateIso).getTime();
  const now = new Date(evaluatedAt).getTime();
  return (target - now) / MS_PER_DAY;
}

function isExpired(dateIso: string, evaluatedAt: string): boolean {
  return daysUntil(dateIso, evaluatedAt) < 0;
}

function isNearExpiry(dateIso: string, evaluatedAt: string, thresholdDays: number): boolean {
  const days = daysUntil(dateIso, evaluatedAt);
  return days >= 0 && days <= thresholdDays;
}

/** 「3 小時 5 分」／「45 分」——與後台還車清單的逾時時間同一種寫法。 */
function formatDurationMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} 小時 ${minutes} 分` : `${minutes} 分`;
}

/** 前一位客人尚未還車；評估當下已超過他的預定還車時間（至少 1 分鐘）時，寫出逾時多久。 */
function previousRentalBlocker(scheduledReturnAt: string, evaluatedAt: string): PickupBlocker {
  const overdueMinutes = Math.floor(
    (new Date(evaluatedAt).getTime() - new Date(scheduledReturnAt).getTime()) / 60_000,
  );
  return {
    type: 'vehicle_not_deliverable',
    reason: 'previous_rental_not_returned',
    message:
      overdueMinutes > 0
        ? `前一位客人尚未還車（逾時 ${formatDurationMinutes(overdueMinutes)}）。`
        : '前一位客人尚未還車。',
  };
}

/**
 * 純函式：依當下輸入判斷是否可取車。回傳的是完整的阻擋與警示清單而非單一布林值 ——
 * 現場人員與主管覆核都需要看到「為什麼不能取車」，不能只有一個 ready 旗標。
 * 不查詢、不寫入任何 repository，也不判斷主管覆核是否放行（那是呼叫端的職責）。
 */
export function evaluatePickupReadiness(input: PickupReadinessInput): PickupReadiness {
  const {
    evaluatedAt,
    depositRequired,
    depositPaid,
    latestContractSigned,
    requiredDocuments,
    driverCredential,
    originalDocumentCheckedThisVisit,
    vehicle,
    memberEmail,
    specialNotes,
  } = input;
  const nearExpiryThresholdDays = input.nearExpiryThresholdDays ?? DEFAULT_NEAR_EXPIRY_THRESHOLD_DAYS;
  const lowConfidenceThreshold = input.lowConfidenceThreshold ?? DEFAULT_LOW_CONFIDENCE_THRESHOLD;

  const blockers: PickupBlocker[] = [];
  const warnings: PickupWarning[] = [];

  // 車還在前一位客人手上：排在第一項（見 PickupVehicleReadiness.previousRental）。
  const { previousRental } = vehicle;
  if (previousRental) {
    blockers.push(previousRentalBlocker(previousRental.scheduledReturnAt, evaluatedAt));
  }

  // 未達訂金門檻
  if (depositPaid < depositRequired) {
    blockers.push({
      type: 'deposit_below_threshold',
      reason: 'deposit_paid_below_required',
      message: `已收訂金 ${depositPaid} 低於應收訂金 ${depositRequired}。`,
    });
  }

  // 最新合約未簽署
  if (!latestContractSigned) {
    blockers.push({
      type: 'latest_contract_unsigned',
      reason: 'latest_contract_unsigned',
      message: '最新版本合約尚未簽署。',
    });
  }

  // 必要身分文件或駕照缺失／過期
  for (const doc of requiredDocuments) {
    if (!doc.present) {
      blockers.push({
        type: 'required_document_missing_or_expired',
        reason: `missing_document:${doc.kind}`,
        message: `必要身分文件缺失：${doc.kind}。`,
      });
    } else if (doc.expiryDate && isExpired(doc.expiryDate, evaluatedAt)) {
      blockers.push({
        type: 'required_document_missing_or_expired',
        reason: `expired_document:${doc.kind}`,
        message: `必要身分文件已過期：${doc.kind}。`,
      });
    } else if (doc.expiryDate && isNearExpiry(doc.expiryDate, evaluatedAt, nearExpiryThresholdDays)) {
      warnings.push({
        type: 'document_near_expiry',
        message: `身分文件即將到期：${doc.kind}。`,
      });
    }

    if (doc.ocrConfidence != null && doc.ocrConfidence < lowConfidenceThreshold) {
      warnings.push({
        type: 'low_confidence_ocr',
        message: `OCR 辨識信心偏低：${doc.kind}（${doc.ocrConfidence}）。`,
      });
    }
  }

  if (!driverCredential.present) {
    blockers.push({
      type: 'required_document_missing_or_expired',
      reason: 'missing_driver_credential',
      message: '駕照缺失。',
    });
  } else if (driverCredential.expiryDate && isExpired(driverCredential.expiryDate, evaluatedAt)) {
    blockers.push({
      type: 'required_document_missing_or_expired',
      reason: 'expired_driver_credential',
      message: '駕照已過期。',
    });
  } else if (
    driverCredential.expiryDate &&
    isNearExpiry(driverCredential.expiryDate, evaluatedAt, nearExpiryThresholdDays)
  ) {
    warnings.push({ type: 'document_near_expiry', message: '駕照即將到期。' });
  }

  // 外國旅客互惠資格或准駕車種不符
  if (!driverCredential.matchesVehicleClass) {
    blockers.push({
      type: 'foreign_reciprocity_or_vehicle_class_mismatch',
      reason: 'vehicle_class_mismatch',
      message: '駕照准駕車種與本次車輛不符。',
    });
  }
  if (driverCredential.isForeignVisitor && driverCredential.reciprocityStatus !== 'eligible') {
    blockers.push({
      type: 'foreign_reciprocity_or_vehicle_class_mismatch',
      reason: 'reciprocity_not_eligible',
      message: `外國旅客互惠資格尚未確認符合（目前狀態：${driverCredential.reciprocityStatus}）。`,
    });
  }

  // 本次尚未確認核對證件正本
  if (!originalDocumentCheckedThisVisit) {
    blockers.push({
      type: 'original_document_not_confirmed',
      reason: 'original_document_not_confirmed',
      message: '本次尚未確認核對證件正本。',
    });
  }

  // 車輛衝突、維修中或其他不可交付狀態。已經用「前一位客人尚未還車」說明車在哪裡時，
  // 「車輛目前在租」與排程衝突講的是同一件事，不再重複列出。
  if (vehicle.status === 'maintenance') {
    blockers.push({
      type: 'vehicle_not_deliverable',
      reason: 'vehicle_under_maintenance',
      message: '車輛維修中，無法交付。',
    });
  } else if (vehicle.status === 'rented' && !previousRental) {
    blockers.push({
      type: 'vehicle_not_deliverable',
      reason: 'vehicle_time_conflict',
      message: '車輛目前在租，與本次取車衝突。',
    });
  }
  if (vehicle.hasSchedulingConflict && vehicle.status !== 'rented' && !previousRental) {
    blockers.push({
      type: 'vehicle_not_deliverable',
      reason: 'vehicle_time_conflict',
      message: '車輛排程與其他訂單衝突。',
    });
  }

  // 非阻擋提醒：Email 缺少
  if (!memberEmail || memberEmail.trim() === '') {
    warnings.push({ type: 'missing_email', message: '會員未留存 Email。' });
  }

  // 非阻擋提醒：特殊備註
  if (specialNotes && specialNotes.trim() !== '') {
    warnings.push({ type: 'special_note', message: specialNotes });
  }

  return { ready: blockers.length === 0, blockers, warnings };
}
