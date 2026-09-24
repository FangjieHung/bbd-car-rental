import { describe, it, expect } from 'vitest';
import { vehicleAvailability, vehicleUnavailableReasons } from './vehicle-availability';
import { isVehicleAvailable } from './is-vehicle-available';
import { RentalBooking, Vehicle } from '../models';

const iso = (local: string) => new Date(local).toISOString();

function vehicle(p: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1', plateNumber: 'ABC-123', category: 'car', model: 'Altis', brand: 'Toyota',
    year: 2022, status: 'available', mileage: 0, createdAt: '', ...p,
  };
}

function booking(p: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1', vehicleId: 'v1', memberId: 'm1',
    startTime: iso('2026-01-05T09:00'), endTime: iso('2026-01-08T09:00'),
    pickupLocation: '', returnLocation: '', status: 'reserved', depositRequired: 0, ...p,
  };
}

/** 1/6 09:00 – 1/7 09:00，與上面預設訂單（1/5–1/8）重疊。 */
const period = (bookings: RentalBooking[], excludeBookingId?: string) => ({
  startTime: iso('2026-01-06T09:00'),
  endTime: iso('2026-01-07T09:00'),
  bookings,
  ...(excludeBookingId ? { excludeBookingId } : {}),
});

describe('vehicleUnavailableReasons（可租判斷的唯一來源）', () => {
  it('沒有保養、也沒有重疊訂單 → 沒有原因（可以租）', () => {
    expect(vehicleUnavailableReasons(vehicle(), period([]))).toEqual([]);
  });

  it('保養中 → 原因是保養中', () => {
    expect(vehicleUnavailableReasons(vehicle({ status: 'maintenance' }), period([]))).toEqual([{ kind: 'maintenance' }]);
  });

  it('已預訂、出租中的重疊訂單都佔用車輛，原因帶出那筆訂單', () => {
    const reserved = booking({ id: 'r' });
    const inProgress = booking({ id: 'p', status: 'in_progress' });
    expect(vehicleUnavailableReasons(vehicle(), period([reserved]))).toEqual([{ kind: 'booked', booking: reserved }]);
    expect(vehicleUnavailableReasons(vehicle(), period([inProgress]))).toEqual([{ kind: 'booked', booking: inProgress }]);
  });

  it('已取消、已完成、別台車、無縫接續的訂單都不佔用', () => {
    const bookings = [
      booking({ id: 'c', status: 'cancelled' }),
      booking({ id: 'd', status: 'completed' }),
      booking({ id: 'o', vehicleId: 'v2' }),
      // 1/7 09:00 取車，剛好接在查詢期間之後
      booking({ id: 'n', startTime: iso('2026-01-07T09:00'), endTime: iso('2026-01-09T09:00') }),
    ];
    expect(vehicleUnavailableReasons(vehicle(), period(bookings))).toEqual([]);
  });

  it('排除這筆訂單自己（編輯訂單時）→ 自己的車不算被佔用', () => {
    expect(vehicleUnavailableReasons(vehicle(), period([booking({ id: 'self' })], 'self'))).toEqual([]);
  });

  it('同時保養中又有多筆重疊訂單：全部列出，訂單依取車時間排序', () => {
    const later = booking({ id: 'later', startTime: iso('2026-01-06T12:00'), endTime: iso('2026-01-06T18:00') });
    const earlier = booking({ id: 'earlier', startTime: iso('2026-01-04T09:00'), endTime: iso('2026-01-06T10:00') });
    expect(vehicleUnavailableReasons(vehicle({ status: 'maintenance' }), period([later, earlier]))).toEqual([
      { kind: 'maintenance' },
      { kind: 'booked', booking: earlier },
      { kind: 'booked', booking: later },
    ]);
  });
});

describe('vehicleAvailability', () => {
  it('分成可以租／不能租兩組，各自維持傳入順序', () => {
    const v1 = vehicle({ id: 'v1' });
    const v2 = vehicle({ id: 'v2', status: 'maintenance' });
    const v3 = vehicle({ id: 'v3' });
    const v4 = vehicle({ id: 'v4' });
    const b = booking({ vehicleId: 'v3' });
    const result = vehicleAvailability([v1, v2, v3, v4], period([b]));
    expect(result.available.map((v) => v.id)).toEqual(['v1', 'v4']);
    expect(result.unavailable).toEqual([
      { vehicle: v2, reasons: [{ kind: 'maintenance' }] },
      { vehicle: v3, reasons: [{ kind: 'booked', booking: b }] },
    ]);
  });

  it('與 isVehicleAvailable 永遠同一個結果', () => {
    const vehicles = [vehicle({ id: 'v1' }), vehicle({ id: 'v2', status: 'maintenance' }), vehicle({ id: 'v3' })];
    const bookings = [booking({ vehicleId: 'v3' }), booking({ id: 'b2', vehicleId: 'v1', status: 'cancelled' })];
    const p = period(bookings);
    const available = vehicleAvailability(vehicles, p).available.map((v) => v.id);
    const byOldCheck = vehicles.filter((v) => isVehicleAvailable({ vehicle: v, ...p, bookings })).map((v) => v.id);
    expect(available).toEqual(byOldCheck);
  });
});
