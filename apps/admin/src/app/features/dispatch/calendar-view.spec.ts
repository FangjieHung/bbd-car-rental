import { describe, it, expect } from 'vitest';
import { dayStats } from './calendar-view.component';
import { RentalBooking } from '../../core/models';

const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
  id: 'b1',
  vehicleId: 'v1',
  customerId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupLocation: '',
  returnLocation: '',
  status: 'confirmed',
  ...partial,
});

describe('dayStats', () => {
  it('取/還/可用數', () => {
    const bookings = [
      mk({}),
      mk({
        id: 'b2',
        vehicleId: 'v2',
        startTime: new Date(2026, 6, 23, 10).toISOString(),
        endTime: new Date(2026, 6, 25, 10).toISOString(),
      }),
    ];
    // 7/21：b1 取車、v1 佔用
    expect(dayStats(bookings, 3, new Date(2026, 6, 21))).toEqual({
      pickups: 1,
      returns: 0,
      available: 2,
    });
    // 7/23：b1 還車、b2 取車，v1 v2 都佔用
    expect(dayStats(bookings, 3, new Date(2026, 6, 23))).toEqual({
      pickups: 1,
      returns: 1,
      available: 1,
    });
    // 7/26：無事，全可用
    expect(dayStats(bookings, 3, new Date(2026, 6, 26))).toEqual({
      pickups: 0,
      returns: 0,
      available: 3,
    });
  });

  it('cancelled/completed 不計', () => {
    expect(dayStats([mk({ status: 'cancelled' })], 3, new Date(2026, 6, 21))).toEqual({
      pickups: 0,
      returns: 0,
      available: 3,
    });
  });
});
