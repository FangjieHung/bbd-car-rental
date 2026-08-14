import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DashboardPageComponent } from './dashboard-page.component';
import { TimelineViewComponent } from '../../dispatch/timeline-view/timeline-view.component';
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

describe('DashboardPageComponent date selection', () => {
  let component: DashboardPageComponent;
  const resolvedTargetDate = (instance: DashboardPageComponent): Date => instance.targetDate();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: new BehaviorSubject(convertToParamMap({})).asObservable() } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: MatDialog, useValue: { open: () => undefined } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    component = TestBed.createComponent(DashboardPageComponent).componentInstance;
  });

  it('預設以今日作為 resolved target date', () => {
    const today = new Date();

    expect(component.selectedDate()).toBe('today');
    expect(resolvedTargetDate(component)).toEqual(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );
  });

  it('切換明日後 resolved target date 為明日', () => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    component.setSelectedDate('tomorrow');

    expect(resolvedTargetDate(component)).toEqual(tomorrow);
  });

});

describe('DashboardPageComponent child date contract', () => {
  function createFixture(view: 'timeline' | 'calendar') {
    const queryParamMap = new BehaviorSubject(convertToParamMap({ view }));
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamMap.asObservable() } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: MatDialog, useValue: { open: () => undefined } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('切換明日時，父層會把 targetDate 傳給 timeline child', async () => {
    const fixture = createFixture('timeline');
    const child = fixture.debugElement.query(By.directive(TimelineViewComponent))
      .componentInstance as TimelineViewComponent;

    fixture.componentInstance.setSelectedDate('tomorrow');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(child.targetDate()).toEqual(fixture.componentInstance.targetDate());
  });

  it('切換明日時，父層會把 targetDate 傳給 calendar child', async () => {
    const fixture = createFixture('calendar');
    const child = fixture.debugElement.query(By.directive(CalendarViewComponent))
      .componentInstance as CalendarViewComponent;

    fixture.componentInstance.setSelectedDate('tomorrow');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(child.targetDate()).toEqual(fixture.componentInstance.targetDate());
  });

  it('Calendar 點選日期後，父層 targetDate 與工作清單同步', () => {
    const fixture = createFixture('calendar');
    const child = fixture.debugElement.query(By.directive(CalendarViewComponent))
      .componentInstance as CalendarViewComponent;
    const selected = new Date(2026, 7, 4);

    child.dateSelected.emit(selected);
    fixture.detectChanges();

    expect(fixture.componentInstance.targetDate()).toEqual(selected);
    expect(child.targetDate()).toEqual(selected);
  });

  it('以 Material Symbols 導覽按鈕取代 Material button toggle group', () => {
    const fixture = createFixture('timeline');

    expect(fixture.nativeElement.querySelectorAll('mat-button-toggle-group')).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('.material-symbols-rounded')).not.toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('button[aria-pressed]')).toHaveLength(4);
  });
});

describe('DashboardPageComponent work list', () => {
  it('依 Calendar 主日期分成取車、還車，且無還車時顯示明日預告', () => {
    const date = new Date(2026, 7, 4);
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: new BehaviorSubject(convertToParamMap({})).asObservable() } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: MatDialog, useValue: { open: () => undefined } },
        {
          provide: VEHICLE_REPO,
          useValue: createInMemoryRepo<Vehicle>([
            { id: 'v1', plateNumber: 'MNO-345', category: 'car', model: 'Many', brand: 'Test', year: 2022, status: 'available', mileage: 1, createdAt: '' },
          ]),
        },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([
            {
              id: 'pickup', vehicleId: 'v1', customerId: 'c1',
              startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 5, 10).toISOString(),
              pickupLocation: '機場', returnLocation: '港口', status: 'confirmed',
            },
            {
              id: 'preview', vehicleId: 'v1', customerId: 'c1',
              startTime: new Date(2026, 7, 3, 10).toISOString(), endTime: new Date(2026, 7, 5, 9).toISOString(),
              pickupLocation: '港口', returnLocation: '機場', status: 'in_progress',
            },
          ]),
        },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([{ id: 'c1', name: '林美惠', phone: '0900000000' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(DashboardPageComponent).componentInstance;

    component.selectCalendarDate(date);

    expect(component.pickupWorkRows().map((row) => row.booking.id)).toEqual(['pickup']);
    expect(component.returnWorkRows().map((row) => row.booking.id)).toEqual([]);
    expect(component.returnPreviewRows().map((row) => row.booking.id)).toEqual(['pickup', 'preview']);
  });

  it('只納入 confirmed 與 in_progress，電話資料提供 tel 連結值', () => {
    const date = new Date(2026, 7, 4);
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: new BehaviorSubject(convertToParamMap({})).asObservable() } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: MatDialog, useValue: { open: () => undefined } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([{ id: 'cancelled', vehicleId: 'v1', customerId: 'c1', startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 5, 10).toISOString(), pickupLocation: '', returnLocation: '', status: 'cancelled' }]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([{ id: 'c1', name: '王小明', phone: '0911222333' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(DashboardPageComponent).componentInstance;

    component.selectCalendarDate(date);

    expect(component.pickupWorkRows()).toEqual([]);
    expect(component.phoneHref({ customerId: 'c1' } as RentalBooking)).toBe('tel:0911222333');
    expect(component.phoneHref({ customerId: 'missing' } as RentalBooking)).toBeNull();
  });
});
