import { OrderStatus, PaymentPreference } from './enums';
import { PriceBreakdown } from './price-breakdown';

export interface OrderAddOnLine {
  addOnId: string;
  qty: number;
}

export interface RentalOrder {
  id: string;
  vehicleId: string;
  memberId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  /** 取車據點 id（見 RENTAL_BRANCHES）；可與車輛所在據點不同，需調度時由 needsDispatch 判斷。 */
  pickupBranchId: string;
  /** 還車據點 id（見 RENTAL_BRANCHES）；可與取車據點不同（甲地租、乙地還）。 */
  returnBranchId: string;
  status: OrderStatus;
  addOns?: OrderAddOnLine[];
  couponCode?: string;
  /** 建立當下鎖定的報價快照；核價完成後不可變動，異動一律走加收/退款，不改這裡。 */
  priceBreakdown?: PriceBreakdown;
  paymentPreference?: PaymentPreference;
  /** 應收訂金；由建立時的報價與車型規則算出，履約狀態變動不會回頭改它。 */
  depositRequired: number;
  sourcePartnerId?: string;
  insurancePlanId?: string;
}
