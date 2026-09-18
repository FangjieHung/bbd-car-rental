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
  priceBreakdown?: PriceBreakdown;
  paymentMethod?: PaymentPreference;
  sourcePartnerId?: string;
}
