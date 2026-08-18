import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardPageComponent } from './dashboard-page.component';
import { CalendarViewComponent } from '../../dispatch/calendar-view/calendar-view.component';
import {
  BOOKING_REPO,
  CUSTOMER_REPO,
  MAINTENANCE_REPO,
  VEHICLE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { Customer, MaintenanceRecord, RentalBooking, Vehicle } from '../../../core/models';
import { MatDialog } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('DashboardPageComponent child date contract', () => {
  function createFixture(bookings: RentalBooking[] = []) {
    TestBed.configureTestingModule({
      providers: [
        provideNativeDateAdapter(),
        { provide: MatDialog, useValue: { open: () => undefined } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('父層 targetDate 變更會傳給 calendar child', async () => {
    const fixture = createFixture();
    const child = fixture.debugElement.query(By.directive(CalendarViewComponent))
      .componentInstance as CalendarViewComponent;
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    fixture.componentInstance.targetDate.set(tomorrow);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(child.targetDate()).toEqual(fixture.componentInstance.targetDate());
  });

  it('Calendar 點選日期後，父層與 child targetDate 同步', () => {
    const fixture = createFixture();
    const child = fixture.debugElement.query(By.directive(CalendarViewComponent))
      .componentInstance as CalendarViewComponent;
    const selected = new Date(2026, 7, 4);

    child.dateSelected.emit(selected);
    fixture.detectChanges();

    expect(fixture.componentInstance.targetDate()).toEqual(selected);
    expect(child.targetDate()).toEqual(selected);
  });
});

describe('DashboardPageComponent 今日出車／還車／待整備統計', () => {
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const at = (day: Date, hour: number) =>
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour).toISOString();

  const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
    id: 'b',
    vehicleId: 'v1',
    customerId: 'c1',
    startTime: at(today, 9),
    endTime: at(tomorrow, 9),
    pickupLocation: '',
    returnLocation: '',
    status: 'confirmed',
    ...partial,
  });

  function createFixture(bookings: RentalBooking[]) {
    TestBed.configureTestingModule({
      providers: [
        provideNativeDateAdapter(),
        { provide: MatDialog, useValue: { open: () => undefined } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    return TestBed.createComponent(DashboardPageComponent).componentInstance;
  }

  it('依 startTime 是否為今天、狀態是否已取車，計算出車進度', () => {
    const component = createFixture([
      mk({ id: 'confirmed', startTime: at(today, 9), status: 'confirmed' }),
      mk({ id: 'in_progress', startTime: at(today, 10), status: 'in_progress' }),
      mk({ id: 'completed', startTime: at(today, 8), status: 'completed' }),
      mk({ id: 'cancelled', startTime: at(today, 11), status: 'cancelled' }),
      mk({ id: 'pending_payment', startTime: at(today, 12), status: 'pending_payment' }),
      mk({ id: 'yesterday', startTime: at(yesterday, 9), status: 'confirmed' }),
    ]);

    expect(component.todayPickupTotal()).toBe(3);
    expect(component.todayPickupDone()).toBe(2);
    expect(component.todayPickupPending()).toBe(1);
  });

  it('依 endTime 是否為今天、狀態是否已還車，計算還車進度與待整備數', () => {
    const component = createFixture([
      mk({ id: 'in_progress', endTime: at(today, 9), status: 'in_progress' }),
      mk({ id: 'completed', endTime: at(today, 10), status: 'completed' }),
      mk({ id: 'not_picked_up', endTime: at(today, 15), status: 'confirmed' }),
      mk({ id: 'cancelled', endTime: at(today, 9), status: 'cancelled' }),
      mk({ id: 'tomorrow', endTime: at(tomorrow, 9), status: 'in_progress' }),
    ]);

    expect(component.todayReturnTotal()).toBe(2);
    expect(component.todayReturnDone()).toBe(1);
    expect(component.todayReturnPending()).toBe(1);
    expect(component.todayPendingPrepCount()).toBe(1);
  });
});
