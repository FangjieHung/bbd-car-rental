import { Vehicle, RentalBooking, BookingStatus } from '../models';
import { rangesOverlap } from './ranges-overlap';
const OCCUPYING: BookingStatus[] = ['pending_payment', 'confirmed', 'in_progress'];
export function isVehicleAvailable(input: {
  vehicle: Vehicle; startTime: string; endTime: string; bookings: RentalBooking[];
}): boolean {
  if (input.vehicle.status === 'maintenance') return false;
  return !input.bookings.some(
    (b) => b.vehicleId === input.vehicle.id &&
      OCCUPYING.includes(b.status) &&
      rangesOverlap(input.startTime, input.endTime, b.startTime, b.endTime),
  );
}
