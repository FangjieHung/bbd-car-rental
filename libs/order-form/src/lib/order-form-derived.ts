import { Signal, computed } from '@angular/core';
import { PriceBreakdown, RentalOrder, Vehicle } from '@car-rental/domain';
import type { OrderFormLabels } from './order-form-labels';
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
 * 送出前的檢查：訂單底線（客人＋車輛＋租期）與既有的完整性規則
 * （取／還車據點必填、車輛時段衝突、可試算報價、訂金不超過上限、保險方案已確認）。
 * 其餘資訊不擋送出，會成為待補項目。
 */
export function orderFormProblems(
  value: OrderFormValue,
  derived: Pick<OrderFormDerived, 'conflicts' | 'quoteUnavailable' | 'depositCap' | 'depositExceedsCap' | 'insuranceUnreconciled'>,
  t: OrderFormLabels,
): OrderFormProblems {
  const { rental, renter, pricing } = value;
  const problems: OrderFormProblems = { rental: [], renter: [], pricing: [] };

  if (!rental.vehicleId || !rental.startLocal || !rental.endLocal) {
    problems.rental.push(t.orderForm.problems.rentalBaseline);
  } else if (new Date(rental.endLocal).getTime() <= new Date(rental.startLocal).getTime()) {
    problems.rental.push(t.orderForm.problems.endBeforeStart);
  }
  if (!rental.pickupBranchId || !rental.returnBranchId) {
    problems.rental.push(t.orderForm.problems.branchesRequired);
  }
  if (derived.conflicts().length > 0) problems.rental.push(t.orderForm.vehicleConflict);
  if (derived.quoteUnavailable()) problems.rental.push(t.orderForm.quoteUnavailable);

  if (!renter.name.trim() || !renter.phone.trim()) problems.renter.push(t.orderForm.problems.renterBaseline);

  if (pricing.depositRequired == null || !Number.isFinite(pricing.depositRequired) || pricing.depositRequired < 0) {
    problems.pricing.push(t.orderForm.problems.depositInvalid);
  } else if (derived.depositExceedsCap()) {
    problems.pricing.push(`${t.orderForm.depositExceedsCap}（${derived.depositCap()}）`);
  }
  if (derived.insuranceUnreconciled()) problems.pricing.push(t.orderForm.insuranceUnreconciled);

  return problems;
}

/** 合約簽署狀態（建立訂單前的預簽）。 */
export type OrderContractSigning = 'unsigned' | 'signed' | 'needs_resign';

/**
 * 待補項目：訂單可以成立、但尚未完成的事項（沿用舊建單 dialog 的規則）。
 * `contract` 是合約目前的簽署狀態；需重新簽署等同未簽署，但以專屬文字提示。
 */
export function orderIncompleteItems(
  value: OrderFormValue,
  quoteTotal: number,
  contract: OrderContractSigning,
  t: OrderFormLabels,
): string[] {
  const items: string[] = [];
  if (!value.renter.email) items.push(t.orderForm.incomplete.missingEmail);

  const drafts = value.payments.drafts;
  const deposit = value.pricing.depositRequired;
  const depositCollected = drafts.filter((p) => p.purpose === 'deposit').reduce((sum, p) => sum + p.amount, 0);
  if (deposit > 0 && depositCollected < deposit) items.push(t.orderForm.incomplete.depositNotCollected);

  if (contract === 'unsigned') items.push(t.orderForm.incomplete.contractNotSigned);
  if (contract === 'needs_resign') items.push(t.orderForm.incomplete.contractNeedsResign);

  const totalCollected = drafts.reduce((sum, p) => sum + p.amount, 0);
  if (quoteTotal > 0 && totalCollected < quoteTotal) items.push(t.orderForm.incomplete.balanceNotCollected);
  return items;
}
