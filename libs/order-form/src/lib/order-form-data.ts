import { InjectionToken, Signal } from '@angular/core';
import { AddOn, InsurancePlan, Member, PriceBreakdown, RentalOrder, Vehicle } from '@car-rental/domain';

/** 報價試算輸入：日期為 YYYY-MM-DD；`addOnQty` 的 key 為 AddOn id，未列出的項目數量視為 0。 */
export interface OrderQuoteInput {
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  addOnQty: Record<string, number>;
  insurancePlan?: InsurancePlan;
}

/**
 * 訂單表單區塊需要的參考資料。刻意保持最小：只放區塊與表單連動實際用到的東西，
 * 讓表單積木不直接依賴 admin 的 store（見 docs/adr/0001）。
 * 讀取 signal 的方法（searchMembers／quote／findConflicts…）在 computed 內呼叫時會自動追蹤相依。
 */
export interface OrderFormData {
  /** 可選車輛；保險方案取自各車的 `insurancePlans`。 */
  readonly vehicles: Signal<Vehicle[]>;
  /** 可加購項目。 */
  readonly addOns: Signal<AddOn[]>;
  /** 依姓名或電話搜尋既有會員；空字串回傳空陣列。 */
  searchMembers(query: string): Member[];
  memberById(id: string): Member | undefined;
  /** 報價試算；該車型沒有可用定價方案或試算失敗時回傳 undefined。 */
  quote(input: OrderQuoteInput): PriceBreakdown | undefined;
  /** 同一台車在時段內重疊的有效訂單；`excludeBookingId` 用於編輯時排除自己。 */
  findConflicts(vehicleId: string, startIso: string, endIso: string, excludeBookingId?: string): RentalOrder[];
  /** 訂金上限（亦為新增訂單的預設訂金）。 */
  depositCap(vehicle: Vehicle | undefined, quoteTotal: number): number;
}

export const ORDER_FORM_DATA = new InjectionToken<OrderFormData>('ORDER_FORM_DATA');
