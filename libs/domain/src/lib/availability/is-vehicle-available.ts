import { Vehicle, RentalOrder, isOccupyingStatus } from '../models';
import { rangesOverlap } from './ranges-overlap';
export function isVehicleAvailable(input: {
  vehicle: Vehicle; startTime: string; endTime: string; orders: RentalOrder[];
}): boolean {
  if (input.vehicle.status === 'maintenance') return false;
  return !input.orders.some(
    (b) => b.vehicleId === input.vehicle.id &&
      isOccupyingStatus(b.status) &&
      rangesOverlap(input.startTime, input.endTime, b.startTime, b.endTime),
  );
}
