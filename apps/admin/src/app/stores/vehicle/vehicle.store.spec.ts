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
    category: 'scooter',
    model: 'Gogoro',
    brand: 'Gogoro',
    year: 2022,
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
      store.create({
        plateNumber: 'ABC-123',
        category: 'car',
        model: 'X',
        brand: 'Toyota',
        year: 2023,
        mileage: 0,
      }),
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

  it('有 reserved 訂單不可刪', () => {
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
              memberId: 'c1',
              startTime: '2026-07-11T09:00:00Z',
              endTime: '2026-07-12T09:00:00Z',
              pickupLocation: '',
              returnLocation: '',
              status: 'reserved',
              depositRequired: 0,
            },
          ]),
        },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>() },
      ],
    });
    const s = TestBed.inject(VehicleStore);
    expect(() => s.remove('v1')).toThrowError(ZH_TW.vehicle.deleteBlocked);
  });

  it('有 in_progress 訂單不可刪', () => {
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
              memberId: 'c1',
              startTime: '2026-07-11T09:00:00Z',
              endTime: '2026-07-12T09:00:00Z',
              pickupLocation: '',
              returnLocation: '',
              status: 'in_progress',
              depositRequired: 0,
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

  // 1.5：已有據點的車改成「未指定」存檔後讀回沒有據點——VehicleFormDialogComponent 清空欄位
  // 時會明確帶出 location: undefined（key 仍存在，只是值是 undefined），update 的型別要能
  // 收下這個 key，repository 的淺合併才會真的把欄位蓋掉，而不是保留舊值。
  it('清空所在據點（改回未指定）存檔後讀回沒有據點', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VEHICLE_REPO,
          useValue: createInMemoryRepo<Vehicle>([makeVehicle({ location: 'mzg-airport' })]),
        },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const s = TestBed.inject(VehicleStore);
    expect(s.vehicles()[0].location).toBe('mzg-airport');

    s.update('v1', { location: undefined });

    expect(s.vehicles()[0].location).toBeUndefined();
  });

  it('建立車輛時可以直接帶入所在據點', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const s = TestBed.inject(VehicleStore);

    s.create({
      plateNumber: 'NEW-001',
      category: 'car',
      model: 'X',
      brand: 'Toyota',
      year: 2023,
      mileage: 0,
      location: 'mzg-port',
    });

    expect(s.vehicles()[0].location).toBe('mzg-port');
  });
});
