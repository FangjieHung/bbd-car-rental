import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardPageComponent } from './dashboard-page.component';
import { CalendarViewComponent } from '../../dispatch/calendar-view/calendar-view.component';
import {
  BOOKING_REPO,
  MEMBER_REPO,
  MAINTENANCE_REPO,
  VEHICLE_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import {
  Member,
  MaintenanceRecord,
  PricingPlan,
  RentalBooking,
  SeasonCalendar,
  Vehicle,
} from '../../../core/models';
import { MatDialog } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { VehiclePickerDialogComponent } from '../../bookings/dialogs/vehicle-picker-dialog.component';
import {
  BookingFormDialogComponent,
  BookingFormResult,
} from '../../bookings/dialogs/booking-form-dialog.component';
import { BookingWorkspaceService } from '../../bookings/services/booking-workspace.service';

// Dashboard 內嵌的 CalendarViewComponent 會用到 PricingStore。
function providePricing() {
  return [
    { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([]) },
    {
      provide: SEASON_CALENDAR_REPO,
      useValue: createInMemoryRepo<SeasonCalendar>([{ id: 'cal', holidays: [], peakSeasons: [] }]),
    },
  ];
}

describe('DashboardPageComponent child date contract', () => {
  function createFixture(bookings: RentalBooking[] = []) {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        provideNativeDateAdapter(),
        provideRouter([]),
        { provide: MatDialog, useValue: { open: () => undefined } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
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
    memberId: 'c1',
    startTime: at(today, 9),
    endTime: at(tomorrow, 9),
    pickupLocation: '',
    returnLocation: '',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  });

  function createFixture(bookings: RentalBooking[]) {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        provideNativeDateAdapter(),
        provideRouter([]),
        { provide: MatDialog, useValue: { open: () => undefined } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    return TestBed.createComponent(DashboardPageComponent).componentInstance;
  }

  it('依 startTime 是否為今天、狀態是否已取車，計算出車進度', () => {
    const component = createFixture([
      mk({ id: 'reserved', startTime: at(today, 9), status: 'reserved' }),
      mk({ id: 'in_progress', startTime: at(today, 10), status: 'in_progress' }),
      mk({ id: 'completed', startTime: at(today, 8), status: 'completed' }),
      mk({ id: 'cancelled', startTime: at(today, 11), status: 'cancelled' }),
      mk({ id: 'yesterday', startTime: at(yesterday, 9), status: 'reserved' }),
    ]);

    expect(component.todayPickupTotal()).toBe(3);
    expect(component.todayPickupDone()).toBe(2);
    expect(component.todayPickupPending()).toBe(1);
  });

  it('依 endTime 是否為今天、狀態是否已還車，計算還車進度與待整備數', () => {
    const component = createFixture([
      mk({ id: 'in_progress', endTime: at(today, 9), status: 'in_progress' }),
      mk({ id: 'completed', endTime: at(today, 10), status: 'completed' }),
      mk({ id: 'not_picked_up', endTime: at(today, 15), status: 'reserved' }),
      mk({ id: 'cancelled', endTime: at(today, 9), status: 'cancelled' }),
      mk({ id: 'tomorrow', endTime: at(tomorrow, 9), status: 'in_progress' }),
    ]);

    expect(component.todayReturnTotal()).toBe(2);
    expect(component.todayReturnDone()).toBe(1);
    expect(component.todayReturnPending()).toBe(1);
    expect(component.todayPendingPrepCount()).toBe(1);
  });
});

describe('DashboardPageComponent onQuickRange', () => {
  const vehicle: Vehicle = {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: 'Gogoro',
    brand: 'Gogoro',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
  };

  const formResult: BookingFormResult = {
    vehicleId: 'v1',
    memberId: 'c1',
    startTime: '2026-08-20T10:00:00.000Z',
    endTime: '2026-08-21T10:00:00.000Z',
    pickupLocation: '機場',
    returnLocation: '機場',
    depositRequired: 0,
  };

  function createFixture() {
    const workspaceOpen = vi.fn();
    // pickVehicle()/openForm() 各自對同一個 MatDialog.open() 呼叫兩次、開不同的元件；
    // 依傳入的元件類別回傳對應的假 afterClosed() 結果，模擬使用者選車→填單兩步都完成。
    const dialogOpen = vi.fn((dialogComponent: unknown) => {
      if (dialogComponent === VehiclePickerDialogComponent) return { afterClosed: () => of(vehicle) };
      if (dialogComponent === BookingFormDialogComponent) return { afterClosed: () => of(formResult) };
      return { afterClosed: () => of(undefined) };
    });

    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        provideNativeDateAdapter(),
        provideRouter([]),
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: BookingWorkspaceService, useValue: { open: workspaceOpen } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([vehicle]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([{ id: 'c1', name: '王小明', phone: '0912000111', kind: 'local' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(DashboardPageComponent).componentInstance;
    return { component, workspaceOpen };
  }

  it('快速建單成功後，用新訂單 id 呼叫 BookingWorkspaceService.open() 直接進工作區', async () => {
    const { component, workspaceOpen } = createFixture();

    await component.onQuickRange({
      startDateTime: '2026-08-20T10:00:00',
      endDateTime: '2026-08-21T10:00:00',
    });

    const created = component.bookingStore.bookings()[0];
    expect(created).toBeDefined();
    expect(workspaceOpen).toHaveBeenCalledWith(created.id);
  });

  it('選車或填單任一步驟被取消時，不建立訂單也不開工作區', async () => {
    const { component, workspaceOpen } = createFixture();
    // 這個 fixture 的 dialogOpen 對 VehiclePickerDialogComponent 一律回傳 vehicle；
    // 改成回傳 undefined 來模擬「選車步驟被取消」。
    (TestBed.inject(MatDialog).open as ReturnType<typeof vi.fn>).mockImplementation(
      (dialogComponent: unknown) =>
        dialogComponent === VehiclePickerDialogComponent
          ? { afterClosed: () => of(undefined) }
          : { afterClosed: () => of(formResult) },
    );

    await component.onQuickRange({
      startDateTime: '2026-08-20T10:00:00',
      endDateTime: '2026-08-21T10:00:00',
    });

    expect(component.bookingStore.bookings()).toHaveLength(0);
    expect(workspaceOpen).not.toHaveBeenCalled();
  });
});
