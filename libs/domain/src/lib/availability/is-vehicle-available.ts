import { Vehicle, RentalOrder, OrderStatus } from '../models';
import { rangesOverlap } from './ranges-overlap';
const OCCUPYING: OrderStatus[] = ['reserved', 'in_progress'];
export function isVehicleAvailable(input: {
  vehicle: Vehicle; startTime: string; endTime: string; orders: RentalOrder[];
}): boolean {
  if (input.vehicle.status === 'maintenance') return false;
  return !input.orders.some(
    (b) => b.vehicleId === input.vehicle.id &&
      OCCUPYING.includes(b.status) &&
      rangesOverlap(input.startTime, input.endTime, b.startTime, b.endTime),
  );
}
