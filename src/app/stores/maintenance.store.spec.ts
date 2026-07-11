import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MaintenanceStore } from './maintenance.store';
import { VehicleStore } from './vehicle.store';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO, CUSTOMER_REPO } from '../core/repositories/tokens';
import { createInMemoryRepo } from '../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord, Customer } from '../core/models';

const NOW = new Date('2026-07-20T12:00:00.000Z');

function setup(vehicles: Vehicle[], records: MaintenanceRecord[]) {
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>() },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>() },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>(records) },
    ],
  });
  return TestBed.inject(MaintenanceStore);
}

const vehicle = (mileage: number): Vehicle =>
  ({ id: 'v1', plateNumber: 'A-1', type: 'scooter', model: 'X', status: 'available', mileage, createdAt: '2026-01-01T00:00:00Z' });

const record = (partial: Partial<MaintenanceRecord>): MaintenanceRecord =>
  ({ id: 'm1', vehicleId: 'v1', type: 'oil_change', performedAt: '2026-06-01T00:00:00Z',
    mileageAtService: 1000, cost: 0, notes: '', ...partial });

describe('MaintenanceStore 提醒規則', () => {
  it('里程未達門檻-300：無提醒', () => {
    const s = setup([vehicle(1500)], [record({ nextDueMileage: 2000 })]);
    expect(s.alertsAt(NOW)).toEqual([]);
  });

  it('里程達門檻-300：upcoming', () => {
    const s = setup([vehicle(1700)], [record({ nextDueMileage: 2000 })]);
    expect(s.alertsAt(NOW)).toEqual([
      { vehicleId: 'v1', ruleType: 'mileage', threshold: 2000, status: 'upcoming' },
    ]);
  });

  it('里程達門檻：overdue', () => {
    const s = setup([vehicle(2000)], [record({ nextDueMileage: 2000 })]);
    expect(s.alertsAt(NOW)[0].status).toBe('overdue');
  });

  it('日期 7 天內：upcoming；過期：overdue', () => {
    const s1 = setup([vehicle(0)], [record({ nextDueDate: '2026-07-25T00:00:00.000Z' })]);
    expect(s1.alertsAt(NOW)).toEqual([
      { vehicleId: 'v1', ruleType: 'date', threshold: '2026-07-25T00:00:00.000Z', status: 'upcoming' },
    ]);
    TestBed.resetTestingModule();
    const s2 = setup([vehicle(0)], [record({ nextDueDate: '2026-07-19T00:00:00.000Z' })]);
    expect(s2.alertsAt(NOW)[0].status).toBe('overdue');
  });

  it('只看最近一筆紀錄', () => {
    const s = setup([vehicle(5000)], [
      record({ id: 'old', performedAt: '2026-01-01T00:00:00Z', nextDueMileage: 3000 }),
      record({ id: 'new', performedAt: '2026-06-01T00:00:00Z', nextDueMileage: 9000 }),
    ]);
    expect(s.alertsAt(NOW)).toEqual([]);
  });

  it('送修/完修驅動車輛狀態', () => {
    const s = setup([vehicle(1000)], []);
    const vs = TestBed.inject(VehicleStore);
    s.sendToMaintenance('v1');
    expect(vs.vehicles()[0].status).toBe('maintenance');
    s.completeMaintenance('v1', { type: 'oil_change', performedAt: NOW.toISOString(),
      mileageAtService: 1000, cost: 300, notes: '' });
    expect(vs.vehicles()[0].status).toBe('available');
    expect(s.records()).toHaveLength(1);
  });
});
