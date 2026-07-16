import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { VehiclesPageComponent } from './vehicles-page.component';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord } from '../../../core/models';

function makeVehicle(partial: Partial<Vehicle>): Vehicle {
  return {
    id: partial.id ?? 'v1',
    plateNumber: 'ABC-123',
    type: 'scooter',
    model: 'Gogoro',
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('VehiclesPageComponent filtering', () => {
  let component: VehiclesPageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VEHICLE_REPO,
          useValue: createInMemoryRepo<Vehicle>([
            makeVehicle({
              id: 'v1',
              plateNumber: 'ABC-123',
              model: 'Gogoro',
              type: 'scooter',
              status: 'available',
            }),
            makeVehicle({
              id: 'v2',
              plateNumber: 'XYZ-999',
              model: 'Toyota Altis',
              type: 'car',
              status: 'rented',
            }),
            makeVehicle({
              id: 'v3',
              plateNumber: 'DEF-456',
              model: 'Gogoro 2',
              type: 'scooter',
              status: 'maintenance',
            }),
          ]),
        },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    component = TestBed.createComponent(VehiclesPageComponent).componentInstance;
  });

  it('沒有任何篩選時顯示全部', () => {
    expect(component.filteredVehicles()).toHaveLength(3);
  });

  it('依車牌或車型關鍵字搜尋（不分大小寫）', () => {
    component.searchQuery.set('gogoro');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v1', 'v3']);

    component.searchQuery.set('xyz');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v2']);
  });

  it('依車種篩選', () => {
    component.typeFilter.set('car');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v2']);
  });

  it('依狀態篩選', () => {
    component.statusFilter.set('maintenance');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v3']);
  });

  it('搜尋與篩選可同時套用', () => {
    component.searchQuery.set('gogoro');
    component.statusFilter.set('maintenance');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v3']);
  });

  it('activeFilterCount 反映已套用的篩選數量', () => {
    expect(component.activeFilterCount()).toBe(0);
    component.typeFilter.set('scooter');
    expect(component.activeFilterCount()).toBe(1);
    component.statusFilter.set('available');
    expect(component.activeFilterCount()).toBe(2);
  });

  it('clearFilters 只清除篩選，不清除搜尋文字', () => {
    component.searchQuery.set('gogoro');
    component.typeFilter.set('scooter');
    component.statusFilter.set('available');
    component.clearFilters();
    expect(component.typeFilter()).toBeNull();
    expect(component.statusFilter()).toBeNull();
    expect(component.searchQuery()).toBe('gogoro');
  });
});
