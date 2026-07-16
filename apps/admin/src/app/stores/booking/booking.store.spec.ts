import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BookingStore } from './booking.store';
import {
  VEHICLE_REPO,
  CUSTOMER_REPO,
  BOOKING_REPO,
  MAINTENANCE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord, Customer } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';

const T0 = '2026-07-20T09:00:00.000Z';
const T1 = '2026-07-22T18:00:00.000Z';

function baseInput(partial: Partial<Omit<RentalBooking, 'id' | 'status'>> = {}) {
  return {
    vehicleId: 'v1',
    customerId: 'c1',
    startTime: T0,
    endTime: T1,
    pickupLocation: '馬公',
    returnLocation: '馬公',
    ...partial,
  };
}

describe('BookingStore', () => {
  let store: BookingStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VEHICLE_REPO,
          useValue: createInMemoryRepo<Vehicle>([
            {
              id: 'v1',
              plateNumber: 'A-1',
              type: 'scooter',
              model: 'X',
              status: 'available',
              mileage: 0,
              createdAt: T0,
            },
          ]),
        },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>() },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>() },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>() },
      ],
    });
    store = TestBed.inject(BookingStore);
  });

  it('end <= start 要擋', () => {
    expect(() => store.create(baseInput({ endTime: T0 }))).toThrowError(
      ZH_TW.booking.endBeforeStart,
    );
  });

  it('重疊時段要擋且訊息含衝突單號', () => {
    const b = store.create(baseInput());
    expect(() =>
      store.create(
        baseInput({ startTime: '2026-07-21T09:00:00.000Z', endTime: '2026-07-23T09:00:00.000Z' }),
      ),
    ).toThrowError(new RegExp(b.id));
  });

  it('頭尾相接不算衝突', () => {
    store.create(baseInput());
    expect(() =>
      store.create(baseInput({ startTime: T1, endTime: '2026-07-23T18:00:00.000Z' })),
    ).not.toThrow();
  });

  it('cancelled/completed 不擋新單', () => {
    const b = store.create(baseInput());
    store.cancel(b.id);
    expect(() => store.create(baseInput())).not.toThrow();
  });

  it('取車→還車流程連動車輛狀態', () => {
    const b = store.create(baseInput());
    store.pickUp(b.id);
    expect(store.bookings().find((x) => x.id === b.id)!.status).toBe('in_progress');
    store.complete(b.id);
    expect(store.bookings().find((x) => x.id === b.id)!.status).toBe('completed');
  });

  it('completed 不可取消', () => {
    const b = store.create(baseInput());
    store.pickUp(b.id);
    store.complete(b.id);
    expect(() => store.cancel(b.id)).toThrowError(ZH_TW.booking.invalidTransition);
  });

  it('出租中取消訂單，車輛回 available', () => {
    const b = store.create(baseInput());
    store.pickUp(b.id);
    store.cancel(b.id);
    const vehicleStore = (store as any).vehicleStore;
    expect(vehicleStore.vehicles()[0].status).toBe('available');
  });
});
