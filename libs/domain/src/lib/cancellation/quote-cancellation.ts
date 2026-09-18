import { CancellationContractKind, CancellationDisposition, CancellationResponsibility } from '../models';

export interface CancellationQuoteInput {
  contractKind: CancellationContractKind;
  responsibility: CancellationResponsibility;
  /** 提出取消的時間（ISO，含時區）。 */
  cancellationRequestedAt: string;
  /** 取車時間（ISO，含時區）。 */
  pickupAt: string;
  depositPaid: number;
  otherPrepayment: number;
  /** 改期/退款行政手續費，僅允許 0–100，未提供時預設 0。 */
  transferFee?: number;
  /** 顧客另有造成額外損害待鑑定時，無法自動試算，一律轉人工審核。 */
  additionalCustomerDamageClaimed?: boolean;
}

export interface CancellationQuote {
  /** 'manual_review' 代表本函式無法自動試算金額，其餘金額欄位皆為 0／null。 */
  status: 'quoted' | 'manual_review';
  disposition: CancellationDisposition | null;
  /** 依 Asia/Taipei 日曆天數計算的取車前天數；manual_review 或非日期級距情境下為 null。 */
  daysBeforePickup: number | null;
  /** 本次適用的訂金退費比例（0–1）；manual_review 或非日期級距情境下為 null。 */
  depositRefundRate: number | null;
  depositRefund: number;
  otherPrepaymentRefund: number;
  /** 法定違約補償（例：業者過失時加倍退還訂金的加碼部分）。 */
  statutoryCompensation: number;
  /** 酌情補償（善意補貼），本函式不會自動核給，恆為 0，留給後續人工核准流程使用。 */
  goodwillCompensation: number;
  transferFee: number;
  totalCashDue: number;
  reason: string;
}

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 把 ISO 時間換算成「Asia/Taipei 日曆日」的 UTC 午夜 ms，與主機系統時區無關（台灣全年無日光節約，固定 +08:00）。 */
function taipeiCalendarDateUtcMs(iso: string): number {
  const shifted = new Date(new Date(iso).getTime() + TAIPEI_OFFSET_MS);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

/** 取車前的完整日曆天數（Asia/Taipei），非「經過幾個 24 小時」。 */
function calendarDaysBeforePickup(requestedAt: string, pickupAt: string): number {
  const requestedDate = taipeiCalendarDateUtcMs(requestedAt);
  const pickupDate = taipeiCalendarDateUtcMs(pickupAt);
  return Math.round((pickupDate - requestedDate) / MS_PER_DAY);
}

/**
 * 小客車顧客取消的訂金退費級距表：取車前「至少」達到某天數門檻，即適用該檔退費比例。
 * 未列出的天數（例如 8、5 天）比照下一個較低的門檻 —— 表訂天數本身就是門檻，不是逐日連續公式。
 */
const PASSENGER_CAR_DEPOSIT_REFUND_TIERS: ReadonlyArray<{ minDays: number; rate: number }> = [
  { minDays: 10, rate: 1.0 },
  { minDays: 9, rate: 0.9 },
  { minDays: 7, rate: 0.7 },
  { minDays: 6, rate: 0.6 },
  { minDays: 4, rate: 0.4 },
  { minDays: 3, rate: 0.3 },
  { minDays: 2, rate: 0.2 },
  { minDays: 1, rate: 0.1 },
  { minDays: 0, rate: 0 },
];

function passengerCarDepositRefundRate(daysBeforePickup: number): number {
  const tier = PASSENGER_CAR_DEPOSIT_REFUND_TIERS.find((t) => daysBeforePickup >= t.minDays);
  return tier ? tier.rate : 0;
}

function manualReviewQuote(reason: string): CancellationQuote {
  return {
    status: 'manual_review',
    disposition: null,
    daysBeforePickup: null,
    depositRefundRate: null,
    depositRefund: 0,
    otherPrepaymentRefund: 0,
    statutoryCompensation: 0,
    goodwillCompensation: 0,
    transferFee: 0,
    totalCashDue: 0,
    reason,
  };
}

/**
 * 純函式：依取消責任歸屬試算應退／應付金額，不寫入、不查詢任何 repository。
 * 是否允許在目前訂單狀態下取消（例如已出車中不可走本流程）由呼叫端（booking.store）把關，
 * 本函式只負責「金額」計算。
 */
export function quoteCancellation(input: CancellationQuoteInput): CancellationQuote {
  const { depositPaid, otherPrepayment } = input;
  const requestedTransferFee = input.transferFee ?? 0;

  if (requestedTransferFee < 0 || requestedTransferFee > 100) {
    throw new RangeError(`transferFee must be between 0 and 100, got ${requestedTransferFee}`);
  }

  if (input.additionalCustomerDamageClaimed) {
    return manualReviewQuote('additional_customer_damage_claimed');
  }

  if (input.responsibility === 'operator_intentional') {
    return manualReviewQuote('operator_intentional_conduct');
  }

  if (input.responsibility === 'force_majeure') {
    return {
      status: 'quoted',
      disposition: 'refund',
      daysBeforePickup: null,
      depositRefundRate: 1,
      depositRefund: depositPaid,
      otherPrepaymentRefund: otherPrepayment,
      statutoryCompensation: 0,
      goodwillCompensation: 0,
      transferFee: 0,
      totalCashDue: depositPaid + otherPrepayment,
      reason: 'force_majeure_full_refund',
    };
  }

  if (input.responsibility === 'operator_fault') {
    const hasDeposit = depositPaid > 0;
    const statutoryCompensation = hasDeposit ? depositPaid : 0;
    const depositRefund = hasDeposit ? depositPaid * 2 : 0;
    const otherPrepaymentRefund = otherPrepayment;

    return {
      status: 'quoted',
      disposition: 'refund',
      daysBeforePickup: null,
      depositRefundRate: hasDeposit ? 2 : null,
      depositRefund,
      otherPrepaymentRefund,
      statutoryCompensation,
      goodwillCompensation: 0,
      transferFee: 0,
      totalCashDue: depositRefund + otherPrepaymentRefund,
      reason: hasDeposit ? 'operator_fault_double_deposit' : 'operator_fault_one_rental_amount',
    };
  }

  // responsibility === 'customer'
  if (input.contractKind === 'scooter') {
    return manualReviewQuote('scooter_cancellation_schedule_not_defined');
  }

  const daysBeforePickup = calendarDaysBeforePickup(input.cancellationRequestedAt, input.pickupAt);
  const rate = passengerCarDepositRefundRate(daysBeforePickup);
  const depositRefund = Math.round(depositPaid * rate * 100) / 100;
  const otherPrepaymentRefund = otherPrepayment;
  const totalCashDue = depositRefund + otherPrepaymentRefund - requestedTransferFee;

  return {
    status: 'quoted',
    disposition: 'refund',
    daysBeforePickup,
    depositRefundRate: rate,
    depositRefund,
    otherPrepaymentRefund,
    statutoryCompensation: 0,
    goodwillCompensation: 0,
    transferFee: requestedTransferFee,
    totalCashDue,
    reason: `customer_cancellation_tier_${Math.round(rate * 100)}pct`,
  };
}
