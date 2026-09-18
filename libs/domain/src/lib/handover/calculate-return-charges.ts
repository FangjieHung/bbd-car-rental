import { EnergyReturnPolicy, LateReturnPolicy } from '../models/pricing-plan';

const MS_PER_MINUTE = 60 * 1000;

export interface ReturnChargeManualAdjustment {
  /** 主管調整後的最終逾時費；未提供代表沿用試算結果。 */
  lateFee?: number;
  /** 主管調整後的最終能源補繳費；未提供代表沿用試算結果。 */
  energyFee?: number;
  /** 調整理由；金額與試算結果不同時為必填（見 calculateReturnCharges 的驗證）。 */
  reason?: string;
}

export interface ReturnChargeInput {
  scheduledReturnAt: string; // ISO
  actualReturnAt: string; // ISO
  lateReturnPolicy: LateReturnPolicy;
  energyReturnPolicy: EnergyReturnPolicy;
  /** 取車時能源讀數：汽油／機車為 0–8 格，電動車為 0–100 百分比，依 energyReturnPolicy.measure 解讀。 */
  pickupEnergyLevel: number;
  /** 還車時能源讀數，單位同 pickupEnergyLevel。 */
  returnEnergyLevel: number;
  manualAdjustment?: ReturnChargeManualAdjustment;
}

/** 系統依規則自動試算出的結果，不受人工調整影響 —— 用來與最終調整值對照、留存試算依據。 */
export interface ReturnChargeQuote {
  /** 逾還分鐘數（不扣寬限）。 */
  lateMinutes: number;
  /** 扣除寬限後，依計費單位無條件進位出的計費單位數；未超過寬限則為 0。 */
  lateUnits: number;
  /** lateUnits * feePerUnit，套用單日上限後的逾時費。 */
  lateFee: number;
  /** 能源虧缺量（取車讀數 - 還車讀數，最小為 0），單位同 pickupEnergyLevel。 */
  energyDeficit: number;
  /** 虧缺量 * feePerUnit + serviceFee；無虧缺時為 0（不收固定處理費）。 */
  energyFee: number;
  totalCharge: number;
}

export interface ReturnChargeResult {
  quote: ReturnChargeQuote;
  finalLateFee: number;
  finalEnergyFee: number;
  finalTotalCharge: number;
  /** 最終金額是否與系統試算不同。 */
  manuallyAdjusted: boolean;
  adjustmentReason?: string;
}

/**
 * 純函式：依逾時規則與能源補繳規則試算還車費用，並套用（若有）人工調整。
 * 只負責金額計算，不建立 ChargeAdjustment、不寫入任何 repository —— 設計文件第 4.5 節
 * 「系統只先試算；人員確認後才建立 ChargeAdjustment」。
 */
export function calculateReturnCharges(input: ReturnChargeInput): ReturnChargeResult {
  const {
    scheduledReturnAt,
    actualReturnAt,
    lateReturnPolicy,
    energyReturnPolicy,
    pickupEnergyLevel,
    returnEnergyLevel,
    manualAdjustment,
  } = input;

  const lateMinutes = Math.max(
    0,
    Math.round((new Date(actualReturnAt).getTime() - new Date(scheduledReturnAt).getTime()) / MS_PER_MINUTE),
  );
  const minutesPastGrace = Math.max(0, lateMinutes - lateReturnPolicy.graceMinutes);
  const lateUnits = minutesPastGrace === 0 ? 0 : Math.ceil(minutesPastGrace / lateReturnPolicy.unitMinutes);
  const lateFee = Math.min(lateUnits * lateReturnPolicy.feePerUnit, lateReturnPolicy.dailyCap);

  const energyDeficit = Math.max(0, pickupEnergyLevel - returnEnergyLevel);
  const energyFee =
    energyDeficit > 0 ? energyDeficit * energyReturnPolicy.feePerUnit + energyReturnPolicy.serviceFee : 0;

  const quote: ReturnChargeQuote = {
    lateMinutes,
    lateUnits,
    lateFee,
    energyDeficit,
    energyFee,
    totalCharge: lateFee + energyFee,
  };

  const finalLateFee = manualAdjustment?.lateFee ?? quote.lateFee;
  const finalEnergyFee = manualAdjustment?.energyFee ?? quote.energyFee;
  const manuallyAdjusted = finalLateFee !== quote.lateFee || finalEnergyFee !== quote.energyFee;

  if (manuallyAdjusted && (!manualAdjustment?.reason || manualAdjustment.reason.trim() === '')) {
    throw new Error(
      'Manual adjustment changes the charge but is missing a reason — every deviation from the quote must be justified.',
    );
  }

  return {
    quote,
    finalLateFee,
    finalEnergyFee,
    finalTotalCharge: finalLateFee + finalEnergyFee,
    manuallyAdjusted,
    adjustmentReason: manuallyAdjusted ? manualAdjustment?.reason : undefined,
  };
}
