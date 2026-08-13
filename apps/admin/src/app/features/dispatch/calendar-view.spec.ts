import { beforeEach, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CalendarViewComponent, dayStats } from './calendar-view/calendar-view.component';
import { Customer, MaintenanceRecord, RentalBooking, Vehicle } from '../../core/models';
import {
  BOOKING_REPO,
  CUSTOMER_REPO,
  MAINTENANCE_REPO,
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';

const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
  id: 'b1',
  vehicleId: 'v1',
  customerId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupLocation: '',
  returnLocation: '',
  status: 'confirmed',
  ...partial,
});

describe('dayStats', () => {
  it('取/還/可用數', () => {
    const bookings = [
      mk({}),
      mk({
        id: 'b2',
        vehicleId: 'v2',
        startTime: new Date(2026, 6, 23, 10).toISOString(),
        endTime: new Date(2026, 6, 25, 10).toISOString(),
      }),
    ];
    // 7/21：b1 取車、v1 佔用
    expect(dayStats(bookings, 3, new Date(2026, 6, 21))).toEqual({
      pickups: 1,
      returns: 0,
      available: 2,
    });
    // 7/23：b1 還車、b2 取車，v1 v2 都佔用
    expect(dayStats(bookings, 3, new Date(2026, 6, 23))).toEqual({
      pickups: 1,
      returns: 1,
      available: 1,
    });
    // 7/26：無事，全可用
    expect(dayStats(bookings, 3, new Date(2026, 6, 26))).toEqual({
      pickups: 0,
      returns: 0,
      available: 3,
    });
  });

  it('cancelled/completed 不計', () => {
    expect(dayStats([mk({ status: 'cancelled' })], 3, new Date(2026, 6, 21))).toEqual({
      pickups: 0,
      returns: 0,
      available: 3,
    });
  });
});

describe('CalendarViewComponent supplied date', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
  });

  it('以 supplied date 所在月份顯示並選取該日', () => {
    const suppliedDate = new Date(2026, 6, 23, 15);

    fixture.componentRef.setInput('targetDate', suppliedDate);
    fixture.detectChanges();

    expect(fixture.componentInstance.month()).toEqual(new Date(2026, 6, 1));
    expect(fixture.componentInstance.selected()).toEqual(new Date(2026, 6, 23));
  });

  it('點選其他日期後，無關變更不會覆寫 selected', () => {
    const suppliedDate = new Date(2026, 6, 23, 15);
    const otherDate = new Date(2026, 6, 28);

    fixture.componentRef.setInput('targetDate', suppliedDate);
    fixture.detectChanges();
    fixture.componentInstance.selected.set(otherDate);

    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toEqual(otherDate);
  });

  it('點選日期會透過 output 回傳給 Dashboard', () => {
    const selectedDates: Date[] = [];
    fixture.componentInstance.dateSelected.subscribe((date) => selectedDates.push(date));

    fixture.componentInstance.selectDate(new Date(2026, 6, 28));

    expect(selectedDates).toEqual([new Date(2026, 6, 28)]);
  });
});

describe('CalendarViewComponent 面板開關', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
  });

  it('selectDate 開啟面板並保留選取日期', () => {
    const d = new Date(2026, 6, 10);
    fixture.componentInstance.selectDate(d);

    expect(fixture.componentInstance.selected()).toEqual(d);
    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('dismissPanel 收起面板但保留選取日期', () => {
    const d = new Date(2026, 6, 10);
    fixture.componentInstance.selectDate(d);
    fixture.componentInstance.dismissPanel();

    expect(fixture.componentInstance.selected()).toEqual(d);
    expect(fixture.componentInstance.panelOpen()).toBe(false);
  });

  it('關閉後再次 selectDate 同一天會重新開啟面板', () => {
    const d = new Date(2026, 6, 10);
    fixture.componentInstance.selectDate(d);
    fixture.componentInstance.dismissPanel();
    fixture.componentInstance.selectDate(d);

    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('面板關閉時 selectDate 另一天會開啟並顯示新日期', () => {
    const d1 = new Date(2026, 6, 10);
    const d2 = new Date(2026, 6, 12);
    fixture.componentInstance.selectDate(d1);
    fixture.componentInstance.dismissPanel();
    fixture.componentInstance.selectDate(d2);

    expect(fixture.componentInstance.selected()).toEqual(d2);
    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('換月會收起面板（selected 清空）', () => {
    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    fixture.componentInstance.shiftMonth(1);

    expect(fixture.componentInstance.selected()).toBeNull();
    expect(fixture.componentInstance.panelOpen()).toBe(false);
  });

  it('panelHeading 依選取日期組字串；未選取時為空字串', () => {
    expect(fixture.componentInstance.panelHeading()).toBe('');

    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    expect(fixture.componentInstance.panelHeading()).toBe('當日明細（7/10）');
  });
});
