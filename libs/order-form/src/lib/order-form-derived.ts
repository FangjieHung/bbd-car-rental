import { OrderFormLabels } from './order-form-labels';
import { Signal, computed } from '@angular/core';
import { formatTwd } from '@car-rental/domain';
import { PriceBreakdown, RentalOrder, Vehicle } from '@car-rental/domain';
import type { OrderFormData } from './order-form-data';
import {
  OrderFormValue,
  computeOrderQuote,
  isInsuranceUnreconciled,
  selectedVehicleOf,
} from './order-form';


/** 編輯既有訂單時需要的脈絡；新增訂單時全部留空。 */
export interface OrderFormContext {
  /** 衝突檢查時排除自己。 */
  editingBookingId?: string;
  /** 原本的報價快照，用來判斷保險方案是否「還沒解決」。 */
  originalPriceBreakdown?: PriceBreakdown;
}

export interface OrderFormDerived {
  vehicle: Signal<Vehicle | undefined>;
  quote: Signal<PriceBreakdown | undefined>;
  /** 車輛與租期都填了，卻試算不出報價（該車型沒有定價方案等）。 */
  quoteUnavailable: Signal<boolean>;
  conflicts: Signal<RentalOrder[]>;
  depositCap: Signal<number>;
  depositExceedsCap: Signal<boolean>;
  insuranceUnreconciled: Signal<boolean>;
}

/** 由表單值衍生出的報價、衝突、訂金上限等狀態；頁面與各區塊共用同一套計算。 */
export function createOrderFormDerived(
  value: Signal<OrderFormValue>,
  data: OrderFormData,
  context: () => OrderFormContext = () => ({}),
): OrderFormDerived {
  const vehicle = computed(() => selectedVehicleOf(value(), data));
  const quote = computed(() => computeOrderQuote(value(), data));
  const quoteUnavailable = computed(() => {
    const { vehicleId, startLocal, endLocal } = value().rental;
    return !!vehicleId && !!startLocal && !!endLocal && !quote();
  });
  const conflicts = computed(() => {
    const { vehicleId, startLocal, endLocal } = value().rental;
    if (!vehicleId || !startLocal || !endLocal) return [];
    return data.findConflicts(
      vehicleId,
      new Date(startLocal).toISOString(),
      new Date(endLocal).toISOString(),
      context().editingBookingId,
    );
  });
  const depositCap = computed(() => data.depositCap(vehicle(), quote()?.total ?? 0));
  const depositExceedsCap = computed(() => value().pricing.depositRequired > depositCap());
  const insuranceUnreconciled = computed(() =>
    isInsuranceUnreconciled(context().originalPriceBreakdown, vehicle(), value().pricing.insurancePlanId),
  );
  return { vehicle, quote, quoteUnavailable, conflicts, depositCap, depositExceedsCap, insuranceUnreconciled };
}

/** 各區塊擋住送出的問題（空陣列代表沒問題）。 */
export interface OrderFormProblems {
  rental: string[];
  renter: string[];
  pricing: string[];
}

/**
 * 「建立訂單需要」的四項（訂單摘要欄逐項打勾），依序為車輛、租期、據點、承租人：
 * `CONTEXT.md` 的訂單底線（客人＋車輛＋租期），加上這張表單另外要求的取／還車據點。
 */
export const ORDER_REQUIREMENT_GROUPS = ['vehicle', 'period', 'branches', 'renter'] as const;
export type OrderRequirementGroup = (typeof ORDER_REQUIREMENT_GROUPS)[number];

/** 「建立訂單需要」其中一項的狀態。 */
export interface OrderRequirement {
  group: OrderRequirementGroup;
  /** 這一項的每一條檢查都通過（打勾）。 */
  met: boolean;
  /** 還沒填——「還缺：…」提示只列這種。 */
  missing: boolean;
  /** 填了但不合格的原因（例如時段衝突、還車早於取車）；只是還沒填時為空陣列。 */
  issues: string[];
}

type OrderFormDerivedChecks = Pick<
  OrderFormDerived,
  'conflicts' | 'quoteUnavailable' | 'depositCap' | 'depositExceedsCap' | 'insuranceUnreconciled'
>;

/**
 * 一條會擋住建立訂單的檢查。步驟錯誤（`orderFormProblems`）與訂單摘要欄的「建立訂單需要」
 * （`orderRequirements`）都從同一份清單推導，畫面上的打勾與實際擋送出的規則才不會各說各話。
 * - `section`：問題掛在哪個表單區塊（決定哪個步驟標題亮錯誤）。
 * - `group`：屬於「建立訂單需要」的哪一項；費用類檢查（訂金、保險、收款金額）不屬於任何一項，
 *   只在步驟錯誤與「還有 N 項待修正」出現。
 * - `missing`：是「還沒填」而不是「填了但不合格」。
 */
interface OrderCheck {
  section: keyof OrderFormProblems;
  group?: OrderRequirementGroup;
  missing?: boolean;
  message: string;
  failed: boolean;
}

function orderChecks(value: OrderFormValue, derived: OrderFormDerivedChecks, t: OrderFormLabels): OrderCheck[] {
  const { rental, renter, driver, pricing } = value;
  const periodFilled = !!rental.startLocal && !!rental.endLocal;
  const endBeforeStart =
    periodFilled && new Date(rental.endLocal).getTime() <= new Date(rental.startLocal).getTime();
  const depositInvalid =
    pricing.depositRequired == null || !Number.isFinite(pricing.depositRequired) || pricing.depositRequired < 0;
  const p = t.orderForm.problems;

  return [
    // 訂單底線：車輛與租期共用同一句提示（兩者都缺時步驟錯誤只列一次，見 orderFormProblems 的去重）。
    { section: 'rental', group: 'vehicle', missing: true, message: p.rentalBaseline, failed: !rental.vehicleId },
    { section: 'rental', group: 'period', missing: true, message: p.rentalBaseline, failed: !periodFilled },
    { section: 'rental', group: 'period', message: p.endBeforeStart, failed: endBeforeStart },
    {
      section: 'rental',
      group: 'branches',
      missing: true,
      message: p.branchesRequired,
      failed: !rental.pickupBranchId || !rental.returnBranchId,
    },
    // 選了車，但這段期間已被其他訂單佔用，或該車型沒有定價方案：車輛這一項不算完成。
    { section: 'rental', group: 'vehicle', message: t.orderForm.vehicleConflict, failed: derived.conflicts().length > 0 },
    { section: 'rental', group: 'vehicle', message: t.orderForm.quoteUnavailable, failed: derived.quoteUnavailable() },
    {
      section: 'renter',
      group: 'renter',
      missing: true,
      message: p.renterBaseline,
      failed: !renter.name.trim() || !renter.phone.trim(),
    },
    // 駕駛資格整組可以留空（會列入待補）；但填了駕照號碼卻沒選車種，這筆紀錄存不進去，不能默默丟掉。
    {
      section: 'renter',
      message: p.driverClassRequired,
      failed: !!driver.licenseNumber.trim() && !driver.standardizedVehicleClass,
    },
    { section: 'pricing', message: p.depositInvalid, failed: depositInvalid },
    {
      section: 'pricing',
      message: `${t.orderForm.depositExceedsCap}（${formatTwd(derived.depositCap())}）`,
      failed: !depositInvalid && derived.depositExceedsCap(),
    },
    { section: 'pricing', message: t.orderForm.insuranceUnreconciled, failed: derived.insuranceUnreconciled() },
    {
      section: 'pricing',
      message: p.paymentDraftAmountInvalid,
      failed: value.payments.drafts.some((d) => d.amount == null || d.amount <= 0),
    },
  ];
}

/**
 * 送出前的檢查：訂單底線（客人＋車輛＋租期）與既有的完整性規則
 * （取／還車據點必填、車輛時段衝突、可試算報價、訂金不超過上限、保險方案已確認）。
 * 其餘資訊不擋送出，會成為待補項目。同一區塊內相同的訊息只列一次。
 */
export function orderFormProblems(
  value: OrderFormValue,
  derived: OrderFormDerivedChecks,
  t: OrderFormLabels,
): OrderFormProblems {
  const problems: OrderFormProblems = { rental: [], renter: [], pricing: [] };
  for (const check of orderChecks(value, derived, t)) {
    const list = problems[check.section];
    if (check.failed && !list.includes(check.message)) list.push(check.message);
  }
  return problems;
}

/**
 * 訂單摘要欄的「建立訂單需要」：把會擋住建立的檢查依車輛／租期／據點／承租人分組。
 * 只列出表單實際有規則的分組（例如表單不再要求據點時，據點這一項自然消失）。
 */
export function orderRequirements(
  value: OrderFormValue,
  derived: OrderFormDerivedChecks,
  t: OrderFormLabels,
): OrderRequirement[] {
  const checks = orderChecks(value, derived, t);
  return ORDER_REQUIREMENT_GROUPS.filter((group) => checks.some((c) => c.group === group)).map((group) => {
    const failed = checks.filter((c) => c.group === group && c.failed);
    return {
      group,
      met: failed.length === 0,
      missing: failed.some((c) => c.missing),
      issues: failed.filter((c) => !c.missing).map((c) => c.message),
    };
  });
}

/**
 * 租期天數：與報價引擎 `calculatePrice` 同一個定義——取車日到還車日之間的日曆天數（只看日期、不看時刻）。
 * 還沒填完、或還車日早於取車日時回傳 undefined。
 */
export function orderRentalDays(rental: { startLocal: string; endLocal: string }): number | undefined {
  if (!rental.startLocal || !rental.endLocal) return undefined;
  const dayOf = (local: string) => new Date(`${local.slice(0, 10)}T00:00:00`).getTime();
  const days = Math.round((dayOf(rental.endLocal) - dayOf(rental.startLocal)) / 86_400_000);
  return Number.isFinite(days) && days >= 0 ? days : undefined;
}

/** 本次收款合計與建立後待收。 */
export interface PaymentDraftBalance {
  /** 款項草稿金額合計；還沒填的金額（null）視為 0。 */
  collected: number;
  /** 報價合計−本次收款；負數代表溢收。還沒有報價時為 undefined（算不出來，不假裝是 0）。 */
  due: number | undefined;
}

/** 「本次收款 · 建立後待收」的計算；收款區塊底部與訂單摘要欄共用，兩邊的數字才會一致。 */
export function paymentDraftBalance(
  drafts: readonly { amount: number | null }[],
  quoteTotal: number | undefined,
): PaymentDraftBalance {
  const collected = drafts.reduce((sum, d) => sum + (d.amount ?? 0), 0);
  return { collected, due: quoteTotal === undefined ? undefined : quoteTotal - collected };
}

/**
 * 合約簽署狀態（建立訂單前的預簽）。
 * 「建立後待補」的規則在 features/orders/incomplete/order-incomplete.ts，與訂單詳情、訂單列表共用。
 */
export type OrderContractSigning = 'unsigned' | 'signed' | 'needs_resign';
