import { beforeEach, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CalendarViewComponent, dayStats } from './calendar-view/calendar-view.component';
import { Customer, MaintenanceRecord, RentalBooking, Vehicle } from '../../core/models';
import {
  BOOKING_REPO,
  CUSTOMER_REPO,
  MAINTENANCE_REPO,
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';

function provideBreakpoint(matches: boolean) {
  return {
    provide: BreakpointObserver,
    useValue: { observe: () => of({ matches, breakpoints: {} }) },
  };
}

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

describe('CalendarViewComponent 面板開關（窄螢幕）', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        provideBreakpoint(true),
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

  it('goToToday 會跳回當月並選取當日，開啟面板', () => {
    const today = new Date();
    fixture.componentInstance.shiftMonth(2);
    fixture.componentInstance.goToToday();

    expect(fixture.componentInstance.month()).toEqual(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
    expect(fixture.componentInstance.selected()).toEqual(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('panelHeading 依選取日期組字串；未選取時為空字串', () => {
    fixture.componentInstance.selected.set(null);
    expect(fixture.componentInstance.panelHeading()).toBe('');

    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    expect(fixture.componentInstance.panelHeading()).toBe('7/10 星期五');
  });

  it('元件建立時面板不自動開啟，但當日仍為選取狀態', () => {
    const freshFixture = TestBed.createComponent(CalendarViewComponent);
    freshFixture.detectChanges();

    const today = new Date();
    expect(freshFixture.componentInstance.panelOpen()).toBe(false);
    expect(freshFixture.componentInstance.selected()).not.toBeNull();
    expect(freshFixture.componentInstance.month()).toEqual(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
  });
});

describe('CalendarViewComponent 面板開關（寬螢幕 split view）', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        provideBreakpoint(false),
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
  });

  it('元件建立時面板即為開啟狀態，顯示當日', () => {
    const today = new Date();
    expect(fixture.componentInstance.panelOpen()).toBe(true);
    expect(fixture.componentInstance.selected()).toEqual(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );
  });

  it('點選其他日期會保持開啟並顯示新日期', () => {
    const d = new Date(2026, 6, 10);
    fixture.componentInstance.selectDate(d);

    expect(fixture.componentInstance.selected()).toEqual(d);
    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('dismissPanel 不會收起面板', () => {
    fixture.componentInstance.dismissPanel();

    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('換月清空選取日期後面板收起', () => {
    fixture.componentInstance.shiftMonth(1);

    expect(fixture.componentInstance.selected()).toBeNull();
    expect(fixture.componentInstance.panelOpen()).toBe(false);
  });
});

describe('CalendarViewComponent 面板 DOM 行為（窄螢幕）', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        provideBreakpoint(true),
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
  });

  it('點日期格子開啟面板並標示選取', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.calendar-view__day') as NodeListOf<HTMLButtonElement>,
    );
    dayButtons[10].click();
    fixture.detectChanges();

    expect(dayButtons[10].classList.contains('calendar-view__day--selected')).toBe(true);
    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).not.toBeNull();
  });

  it('點關閉鈕收起面板但保留格子選取樣式', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.calendar-view__day') as NodeListOf<HTMLButtonElement>,
    );
    dayButtons[10].click();
    fixture.detectChanges();

    (fixture.nativeElement
      .querySelector('.responsive-panel__close') as HTMLButtonElement)
      .click();
    fixture.detectChanges();

    expect(dayButtons[10].classList.contains('calendar-view__day--selected')).toBe(true);
    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).toBeNull();
  });

  it('關閉後再點同一天會重新開啟面板', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.calendar-view__day') as NodeListOf<HTMLButtonElement>,
    );
    dayButtons[10].click();
    fixture.detectChanges();
    (fixture.nativeElement
      .querySelector('.responsive-panel__close') as HTMLButtonElement)
      .click();
    fixture.detectChanges();

    dayButtons[10].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).not.toBeNull();
  });
});

describe('CalendarViewComponent 面板 DOM 行為（寬螢幕）', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
        provideBreakpoint(false),
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
  });

  it('載入時面板即顯示，且無關閉鈕', () => {
    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.responsive-panel__close')).toBeNull();
  });

  it('點選其他日期格子只換內容，不觸發開合', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.calendar-view__day') as NodeListOf<HTMLButtonElement>,
    );
    dayButtons[10].click();
    fixture.detectChanges();

    expect(dayButtons[10].classList.contains('calendar-view__day--selected')).toBe(true);
    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).not.toBeNull();
  });
});

describe('CalendarViewComponent 工作清單（取車／還車）', () => {
  it('依選取日期分成取車、還車', () => {
    const date = new Date(2026, 7, 4);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VEHICLE_REPO,
          useValue: createInMemoryRepo<Vehicle>([
            {
              id: 'v1', plateNumber: 'MNO-345', category: 'car', model: 'Many',
              brand: 'Test', year: 2022, status: 'available', mileage: 1, createdAt: '',
            },
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
              id: 'return-only', vehicleId: 'v1', customerId: 'c1',
              startTime: new Date(2026, 7, 2, 10).toISOString(), endTime: new Date(2026, 7, 4, 15).toISOString(),
              pickupLocation: '港口', returnLocation: '機場', status: 'confirmed',
            },
          ]),
        },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([{ id: 'c1', name: '林美惠', phone: '0900000000' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(CalendarViewComponent).componentInstance;

    component.selectDate(date);

    expect(component.pickupWorkRows().map((row) => row.booking.id)).toEqual(['pickup']);
    expect(component.returnWorkRows().map((row) => row.booking.id)).toEqual(['return-only']);
  });

  it('只納入 confirmed 與 in_progress，電話資料提供 tel 連結值', () => {
    const date = new Date(2026, 7, 4);
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([
            {
              id: 'cancelled', vehicleId: 'v1', customerId: 'c1',
              startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 5, 10).toISOString(),
              pickupLocation: '', returnLocation: '', status: 'cancelled',
            },
          ]),
        },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([{ id: 'c1', name: '王小明', phone: '0911222333' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(CalendarViewComponent).componentInstance;

    component.selectDate(date);

    expect(component.pickupWorkRows()).toEqual([]);
    expect(component.phoneHref({ customerId: 'c1' } as RentalBooking)).toBe('tel:0911222333');
    expect(component.phoneHref({ customerId: 'missing' } as RentalBooking)).toBeNull();
  });
});
