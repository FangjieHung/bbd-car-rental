import { BookingStatus } from './enums';

export interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;
}
