import { BookingStatus, PaymentPreference } from './enums';
import { PriceBreakdown } from './price-breakdown';

export interface BookingAddOnLine {
  addOnId: string;
  qty: number;
}

export interface RentalBooking {
  id: string;
  vehicleId: string;
  memberId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;
  addOns?: BookingAddOnLine[];
  couponCode?: string;
  /** 建立當下鎖定的報價快照；核價完成後不可變動，異動一律走加收/退款，不改這裡。 */
  priceBreakdown?: PriceBreakdown;
  paymentPreference?: PaymentPreference;
  /** 應收訂金；由建立時的報價與車型規則算出，履約狀態變動不會回頭改它。 */
  depositRequired: number;
  sourcePartnerId?: string;
}
