import { describe, it, expect } from 'vitest';
import { isVehicleAvailable } from './is-vehicle-available';
import { Vehicle, RentalOrder } from '../models';

const v: Vehicle = { id: 'v1', plateNumber: 'A', category: 'scooter', model: 'G',
  brand: 'G', year: 2022, status: 'available', mileage: 0, createdAt: '' };
function bk(p: Partial<RentalOrder>): RentalOrder {
  return { id: 'b', vehicleId: 'v1', memberId: 'c', startTime: '2026-01-05T09:00:00',
    endTime: '2026-01-08T09:00:00', pickupBranchId: '', returnBranchId: '', status: 'reserved',
    depositRequired: 0, ...p };
}

describe('isVehicleAvailable', () => {
  const req = { startTime: '2026-01-06T09:00:00', endTime: '2026-01-07T09:00:00' };
  it('maintenance 車 → 不可租', () =>
    expect(isVehicleAvailable({ vehicle: { ...v, status: 'maintenance' }, ...req, orders: [] })).toBe(false));
  it('reserved 訂單重疊 → 不可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, orders: [bk({})] })).toBe(false));
  it('in_progress 訂單重疊 → 不可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, orders: [bk({ status: 'in_progress' })] })).toBe(false));
  it('cancelled 訂單不佔用 → 可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, orders: [bk({ status: 'cancelled' })] })).toBe(true));
  it('completed 訂單不佔用 → 可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, orders: [bk({ status: 'completed' })] })).toBe(true));
  it('別台車的訂單 → 可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, orders: [bk({ vehicleId: 'v2' })] })).toBe(true));
});
