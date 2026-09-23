import { Vehicle, RentalBooking } from '../models';
import { vehicleUnavailableReasons } from './vehicle-availability';

/** 單一台車這段期間可不可以租；與 vehicleAvailability 是同一個判斷（沒有任何不能租的原因＝可以租）。 */
export function isVehicleAvailable(input: {
  vehicle: Vehicle; startTime: string; endTime: string; bookings: RentalBooking[];
}): boolean {
  return (
    vehicleUnavailableReasons(input.vehicle, {
      startTime: input.startTime,
      endTime: input.endTime,
      bookings: input.bookings,
    }).length === 0
  );
}
