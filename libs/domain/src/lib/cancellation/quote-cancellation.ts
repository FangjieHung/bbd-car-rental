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
  /**
   * 約定總租金；僅在 responsibility 為 operator_fault 且未收定金時需要 —— 設計文件第 10 節
   * 「未收定金：以約定總租金一倍進入賠償流程」的計算基礎。未提供時無法依法試算，轉人工審核，
   * 不會拿 otherPrepayment（顧客當下實付金額，可能小於約定總租金）矇混當作總租金使用。
   */
  agreedRentalTotal?: number;
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
 * 小客車顧客取消的訂金退費級距表 —— 設計文件第 9.1 節「小客車顧客取消預設規則」逐字對應：
 *
 * | 取消通知時間        | 訂金退還比例 |
 * | ------------------ | -----------: |
 * | 10 日前（含）以上   |         100% |
 * | 7～9 日前           |          50% |
 * | 4～6 日前           |          40% |
 * | 2～3 日前           |          30% |
 * | 前 1 日             |          20% |
 * | 當日或未通知        |           0% |
 *
 * 是「級距」而非逐日遞減公式：7～9 日前同屬一檔 50%，不是 9 天 90%、7 天 70% 的線性遞減。
 * 找出取車前天數落在哪一個「至少達到」的門檻（門檻本身即級距下界）即為命中比例。
 */
const PASSENGER_CAR_DEPOSIT_REFUND_TIERS: ReadonlyArray<{ minDays: number; rate: number }> = [
  { minDays: 10, rate: 1.0 },
  { minDays: 7, rate: 0.5 },
  { minDays: 4, rate: 0.4 },
  { minDays: 2, rate: 0.3 },
  { minDays: 1, rate: 0.2 },
  { minDays: 0, rate: 0 },
];

function passengerCarDepositRefundRate(daysBeforePickup: number): number {
  const tier = PASSENGER_CAR_DEPOSIT_REFUND_TIERS.find((t) => daysBeforePickup >= t.minDays);
  return tier ? tier.rate : 0;
}

/** 新台幣沒有小數位；本函式是金額進出的最後一道防線，輸入若非整數一律直接拒絕，不做隱性四捨五入。 */
function assertIntegerMoney(value: number, fieldName: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${fieldName} must be an integer amount of TWD, got ${value}`);
  }
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

  assertIntegerMoney(depositPaid, 'depositPaid');
  assertIntegerMoney(otherPrepayment, 'otherPrepayment');
  if (input.agreedRentalTotal != null) {
    assertIntegerMoney(input.agreedRentalTotal, 'agreedRentalTotal');
  }

  if (requestedTransferFee < 0 || requestedTransferFee > 100) {
    throw new RangeError(`transferFee must be between 0 and 100, got ${requestedTransferFee}`);
  }
  assertIntegerMoney(requestedTransferFee, 'transferFee');

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

    if (hasDeposit) {
      // 已收定金：返還原定金，另加同額賠償，合計定金兩倍。
      const statutoryCompensation = depositPaid;
      const depositRefund = depositPaid * 2;
      const otherPrepaymentRefund = otherPrepayment;

      return {
        status: 'quoted',
        disposition: 'refund',
        daysBeforePickup: null,
        depositRefundRate: 2,
        depositRefund,
        otherPrepaymentRefund,
        statutoryCompensation,
        goodwillCompensation: 0,
        transferFee: 0,
        totalCashDue: depositRefund + otherPrepaymentRefund,
        reason: 'operator_fault_double_deposit',
      };
    }

    // 未收定金：以約定總租金一倍進入賠償流程。這是一筆獨立的法定賠償金額，不是
    // otherPrepayment（顧客當下實付金額，可能少於約定總租金）本身。沒有 agreedRentalTotal
    // 就無法依法試算出正確金額 —— 寧可轉人工審核，也不要用「剛好手上有的數字」矇混賠償基礎，
    // 避免靜默少賠而使業者違反法定義務。
    if (input.agreedRentalTotal == null) {
      return manualReviewQuote('operator_fault_missing_agreed_rental_total');
    }

    const statutoryCompensation = input.agreedRentalTotal;
    const otherPrepaymentRefund = otherPrepayment;

    return {
      status: 'quoted',
      disposition: 'refund',
      daysBeforePickup: null,
      depositRefundRate: null,
      depositRefund: 0,
      otherPrepaymentRefund,
      statutoryCompensation,
      goodwillCompensation: 0,
      transferFee: 0,
      totalCashDue: otherPrepaymentRefund + statutoryCompensation,
      reason: 'operator_fault_one_rental_amount',
    };
  }

  // responsibility === 'customer'
  if (input.contractKind === 'scooter') {
    return manualReviewQuote('scooter_cancellation_schedule_not_defined');
  }

  const daysBeforePickup = calendarDaysBeforePickup(input.cancellationRequestedAt, input.pickupAt);
  const rate = passengerCarDepositRefundRate(daysBeforePickup);
  // 新台幣無小數位：四捨五入到最接近的整數元，不是最接近的 0.01（那樣仍會留下小數）。
  const depositRefund = Math.round(depositPaid * rate);
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
