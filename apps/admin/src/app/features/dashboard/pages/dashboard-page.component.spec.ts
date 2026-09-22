import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardPageComponent } from './dashboard-page.component';
import { CalendarViewComponent } from '../../dispatch/calendar-view/calendar-view.component';
import {
  AUDIT_ENTRY_REPO,
  BOOKING_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
  DRIVER_CREDENTIAL_REPO,
  HANDOVER_RECORD_REPO,
  IDENTITY_DOCUMENT_REPO,
  MEMBER_REPO,
  MAINTENANCE_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import {
  AuditEntry,
  ChargeAdjustment,
  ContractVersion,
  DriverCredential,
  HandoverRecord,
  IdentityDocument,
  Member,
  MaintenanceRecord,
  PaymentRecord,
  PricingPlan,
  RefundRecord,
  RentalBooking,
  ReminderStatus,
  SeasonCalendar,
  Vehicle,
} from '../../../core/models';
import { MatDialog } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OcrGateway } from '../../../core/services/ocr.gateway';
import { MockOcrGateway } from '../../../core/services/mock-ocr.gateway';
import { DriverEligibilityGateway } from '../../../core/services/driver-eligibility.gateway';
import { MockDriverEligibilityGateway } from '../../../core/services/mock-driver-eligibility.gateway';
import { ReminderGateway } from '../../../core/services/reminder.gateway';
import { VehiclePickerDialogComponent } from '../../bookings/dialogs/vehicle-picker-dialog.component';

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

/**
 * CalendarViewComponent（Task 16）的付款／文件／合約／取車就緒／還車提醒欄位額外依賴了
 * PaymentStore、DocumentStore、ContractStore、HandoverStore 與 REMINDER_STATUS_REPO，
 * DashboardPageComponent 內嵌了它，因此這裡的每個 TestBed 也都得備齊，理由同
 * calendar-view.spec.ts 的 provideBookingWorkspaceRepos()。
 */
function provideBookingWorkspaceRepos() {
  return [
    { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
    { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
    { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
    { provide: IDENTITY_DOCUMENT_REPO, useValue: createInMemoryRepo<IdentityDocument>([]) },
    { provide: DRIVER_CREDENTIAL_REPO, useValue: createInMemoryRepo<DriverCredential>([]) },
    { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>([]) },
    { provide: HANDOVER_RECORD_REPO, useValue: createInMemoryRepo<HandoverRecord>([]) },
    { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>([]) },
    { provide: REMINDER_STATUS_REPO, useValue: createInMemoryRepo<ReminderStatus>([]) },
    {
      provide: ReminderGateway,
      useValue: { schedule: async () => ({ state: 'scheduled' as const }), cancel: async () => undefined },
    },
    MockOcrGateway,
    { provide: OcrGateway, useExisting: MockOcrGateway },
    MockDriverEligibilityGateway,
    { provide: DriverEligibilityGateway, useExisting: MockDriverEligibilityGateway },
  ];
}

describe('DashboardPageComponent child date contract', () => {
  function createFixture(bookings: RentalBooking[] = []) {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
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
        ...provideBookingWorkspaceRepos(),
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

  function createFixture(pickedVehicle: Vehicle | null = vehicle) {
    // 選車仍是 dialog；選到車之後改為導向 /orders/new 建立訂單頁（不再開建單 dialog）。
    const dialogOpen = vi.fn((dialogComponent: unknown) =>
      dialogComponent === VehiclePickerDialogComponent
        ? { afterClosed: () => of(pickedVehicle ?? undefined) }
        : { afterClosed: () => of(undefined) },
    );

    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        provideNativeDateAdapter(),
        provideRouter([]),
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([vehicle]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([{ id: 'c1', name: '王小明', phone: '0912000111', kind: 'local' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const component = TestBed.createComponent(DashboardPageComponent).componentInstance;
    return { component, dialogOpen, navigate };
  }

  it('選到車輛後導向 /orders/new，並以 query params 預填車輛與起訖時間（ISO）', async () => {
    const { component, dialogOpen, navigate } = createFixture();

    await component.onQuickRange({
      startDateTime: '2026-08-20T10:00:00',
      endDateTime: '2026-08-21T10:00:00',
    });

    expect(dialogOpen).toHaveBeenCalledTimes(1); // 只開選車 dialog，不再開建單 dialog
    expect(navigate).toHaveBeenCalledWith(['/orders/new'], {
      queryParams: {
        vehicleId: 'v1',
        start: new Date('2026-08-20T10:00:00').toISOString(),
        end: new Date('2026-08-21T10:00:00').toISOString(),
      },
    });
  });

  it('選車步驟被取消時，不導頁也不建立訂單', async () => {
    const { component, navigate } = createFixture(null);

    await component.onQuickRange({
      startDateTime: '2026-08-20T10:00:00',
      endDateTime: '2026-08-21T10:00:00',
    });

    expect(component.bookingStore.bookings()).toHaveLength(0);
    expect(navigate).not.toHaveBeenCalled();
  });
});
