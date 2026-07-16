import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { VehicleStore } from './vehicle.store';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    type: 'scooter',
    model: 'Gogoro',
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('VehicleStore', () => {
  let store: VehicleStore;
  let bookings: RentalBooking[];
  let records: MaintenanceRecord[];

  beforeEach(() => {
    bookings = [];
    records = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        { provide: BOOKING_REPO, useFactory: () => createInMemoryRepo<RentalBooking>(bookings) },
        {
          provide: MAINTENANCE_REPO,
          useFactory: () => createInMemoryRepo<MaintenanceRecord>(records),
        },
      ],
    });
    store = TestBed.inject(VehicleStore);
  });

  it('create 車牌重複要擋', () => {
    expect(() =>
      store.create({ plateNumber: 'ABC-123', type: 'car', model: 'X', mileage: 0 }),
    ).toThrowError(ZH_TW.vehicle.plateDuplicate);
  });

  it('里程只能遞增', () => {
    expect(() => store.update('v1', { mileage: 50 })).toThrowError(ZH_TW.vehicle.mileageDecrease);
    store.update('v1', { mileage: 200 });
    expect(store.vehicles()[0].mileage).toBe(200);
  });

  it('合法轉換：available→maintenance→available', () => {
    store.transition('v1', 'maintenance');
    expect(store.vehicles()[0].status).toBe('maintenance');
    store.transition('v1', 'available');
    expect(store.vehicles()[0].status).toBe('available');
  });

  it('非法轉換：rented→maintenance 丟錯', () => {
    store.transition('v1', 'rented');
    expect(() => store.transition('v1', 'maintenance')).toThrowError(
      ZH_TW.vehicle.invalidTransition,
    );
  });

  it('有未完成訂單不可刪', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([
            {
              id: 'b1',
              vehicleId: 'v1',
              customerId: 'c1',
              startTime: '2026-07-11T09:00:00Z',
              endTime: '2026-07-12T09:00:00Z',
              pickupLocation: '',
              returnLocation: '',
              status: 'confirmed',
            },
          ]),
        },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>() },
      ],
    });
    const s = TestBed.inject(VehicleStore);
    expect(() => s.remove('v1')).toThrowError(ZH_TW.vehicle.deleteBlocked);
  });

  it('無關聯資料可刪', () => {
    store.remove('v1');
    expect(store.vehicles()).toEqual([]);
  });

  it('statusCounts 統計各狀態', () => {
    expect(store.statusCounts()['available']).toBe(1);
    expect(store.statusCounts()['rented']).toBe(0);
  });
});
