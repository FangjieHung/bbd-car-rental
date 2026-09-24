import { branchName, findBranch, needsDispatch } from '@car-rental/domain';
import { PriceBreakdown, Vehicle } from '../../../core/models';
import { fmtDateTime } from '../../../core/date-utils';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import {
  NO_INSURANCE_VALUE,
  OrderFormValue,
  OrderRequirement,
  OrderRequirementGroup,
  orderRentalDays,
  paymentDraftBalance,
} from '@car-rental/order-form';

/** 建立訂單頁左側「訂單摘要」欄要顯示的內容（已整理好、模板只負責排版）。 */
export interface OrderSummaryView {
  vehicle: { plate: string; model: string } | null;
  /** 取車／還車時間（全站日期時間格式）；未填為 null。 */
  pickupAt: string | null;
  returnAt: string | null;
  /** 租期天數（與報價引擎同一個定義）；租期未填或不合理時為 null。 */
  days: number | null;
  pickupBranch: string | null;
  returnBranch: string | null;
  /** 需調度時的路線：車輛所在據點 → 取車據點。 */
  dispatchRoute: { from: string; to: string } | null;
  renterName: string;
  renterPhone: string;
  /** 保險方案：方案名稱、「不加保」，或「未選」（選的方案不屬於這台車，或編輯時原方案反推不出來）。 */
  insurance: string;
  /** 報價明細；車輛與租期未齊、或試算不出報價時為 null。 */
  quote: { rental: number; insurance: number; addOns: number; total: number } | null;
  depositRequired: number;
  /** 本次收款合計。 */
  collected: number;
  /** 建立後待收（負數＝溢收）；沒有報價時為 null。 */
  due: number | null;
  requirements: OrderRequirement[];
  /** 「還缺：…」：還沒填的分組。 */
  missing: OrderRequirementGroup[];
  /** 建立後待補（原第 5 步的清單）。 */
  incompleteItems: string[];
}

export interface OrderSummaryInput {
  value: OrderFormValue;
  vehicle: Vehicle | undefined;
  quote: PriceBreakdown | undefined;
  requirements: OrderRequirement[];
  incompleteItems: string[];
  /** 日期時間格式的參考日期（同一年省略年份）；測試固定用，預設為現在。 */
  now?: Date;
}

/** 由表單值與衍生狀態組出訂單摘要；金額、待收等計算一律沿用表單區塊用的同一套函式。 */
export function buildOrderSummary(input: OrderSummaryInput): OrderSummaryView {
  const { value, vehicle, quote, requirements } = input;
  const { rental, renter, pricing } = value;
  const now = input.now ?? new Date();
  const balance = paymentDraftBalance(value.payments.drafts, quote?.total);

  return {
    vehicle: vehicle ? { plate: vehicle.plateNumber, model: `${vehicle.brand} ${vehicle.model}`.trim() } : null,
    pickupAt: rental.startLocal ? fmtDateTime(rental.startLocal, now) : null,
    returnAt: rental.endLocal ? fmtDateTime(rental.endLocal, now) : null,
    days: orderRentalDays(rental) ?? null,
    pickupBranch: rental.pickupBranchId ? branchName(rental.pickupBranchId) : null,
    returnBranch: rental.returnBranchId ? branchName(rental.returnBranchId) : null,
    dispatchRoute:
      vehicle && needsDispatch(vehicle.branchId, rental.pickupBranchId)
        ? { from: findBranch(vehicle.branchId)?.name ?? '', to: findBranch(rental.pickupBranchId)?.name ?? '' }
        : null,
    renterName: renter.name.trim(),
    renterPhone: renter.phone.trim(),
    insurance: insuranceName(pricing.insurancePlanId, vehicle),
    quote: quote
      ? {
          rental: quote.rentalSubtotal,
          insurance: quote.insuranceSubtotal,
          addOns: quote.addOnSubtotal,
          total: quote.total,
        }
      : null,
    depositRequired: pricing.depositRequired,
    collected: balance.collected,
    due: balance.due ?? null,
    requirements,
    missing: requirements.filter((r) => r.missing).map((r) => r.group),
    incompleteItems: input.incompleteItems,
  };
}

function insuranceName(planId: string, vehicle: Vehicle | undefined): string {
  if (planId === NO_INSURANCE_VALUE) return ZH_TW.orderForm.insuranceNone;
  const plan = planId ? vehicle?.insurancePlans?.find((p) => p.id === planId) : undefined;
  return plan?.name ?? ZH_TW.orderSummary.insuranceUnresolved;
}
