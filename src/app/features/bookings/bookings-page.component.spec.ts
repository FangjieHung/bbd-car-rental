import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingsPageComponent } from './bookings-page.component';
import { VEHICLE_REPO, BOOKING_REPO, CUSTOMER_REPO, MAINTENANCE_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Vehicle, RentalBooking, Customer, MaintenanceRecord } from '../../core/models';

function makeVehicle(partial: Partial<Vehicle>): Vehicle {
  return { id: partial.id ?? 'v1', plateNumber: 'ABC-123', type: 'scooter', model: 'Gogoro',
    status: 'available', mileage: 100, createdAt: new Date().toISOString(), ...partial };
}

function makeBooking(partial: Partial<RentalBooking>): RentalBooking {
  return { id: partial.id ?? 'b1', vehicleId: 'v1', customerId: 'c1',
    startTime: new Date().toISOString(), endTime: new Date().toISOString(),
    pickupLocation: '馬公', returnLocation: '馬公', status: 'confirmed', ...partial };
}

describe('BookingsPageComponent filtering', () => {
  let component: BookingsPageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([
          makeVehicle({ id: 'v1', plateNumber: 'ABC-123' }),
          makeVehicle({ id: 'v2', plateNumber: 'XYZ-999' }),
        ]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([
          { id: 'c1', name: '王小明', phone: '0912000111' },
          { id: 'c2', name: '陳大文', phone: '0922000222' },
        ]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([
          makeBooking({ id: 'b1', vehicleId: 'v1', customerId: 'c1', status: 'confirmed' }),
          makeBooking({ id: 'b2', vehicleId: 'v2', customerId: 'c2', status: 'in_progress' }),
          makeBooking({ id: 'b3', vehicleId: 'v1', customerId: 'c2', status: 'cancelled' }),
        ]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    component = TestBed.createComponent(BookingsPageComponent).componentInstance;
  });

  it('沒有任何篩選時顯示全部', () => {
    expect(component.filteredBookings()).toHaveLength(3);
  });

  it('依客戶姓名搜尋', () => {
    component.searchQuery.set('王小明');
    expect(component.filteredBookings().map(b => b.id)).toEqual(['b1']);
  });

  it('依車牌搜尋（不分大小寫）', () => {
    component.searchQuery.set('xyz');
    expect(component.filteredBookings().map(b => b.id)).toEqual(['b2']);
  });

  it('依訂單狀態篩選', () => {
    component.statusFilter.set('cancelled');
    expect(component.filteredBookings().map(b => b.id)).toEqual(['b3']);
  });

  it('搜尋與篩選可同時套用', () => {
    component.searchQuery.set('陳大文');
    component.statusFilter.set('cancelled');
    expect(component.filteredBookings().map(b => b.id)).toEqual(['b3']);
  });

  it('clearFilters 只清除篩選，不清除搜尋文字', () => {
    component.searchQuery.set('王小明');
    component.statusFilter.set('confirmed');
    component.clearFilters();
    expect(component.statusFilter()).toBeNull();
    expect(component.searchQuery()).toBe('王小明');
  });
});
