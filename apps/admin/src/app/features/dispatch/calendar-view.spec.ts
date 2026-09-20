import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { CalendarViewComponent, dayStats, returnProgress } from './calendar-view/calendar-view.component';
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
} from '../../core/models';
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
  PRICING_PLAN_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  SEASON_CALENDAR_REPO,
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { OcrGateway } from '../../core/services/ocr.gateway';
import { MockOcrGateway } from '../../core/services/mock-ocr.gateway';
import { DriverEligibilityGateway } from '../../core/services/driver-eligibility.gateway';
import { MockDriverEligibilityGateway } from '../../core/services/mock-driver-eligibility.gateway';
import { BookingWorkspaceService } from '../bookings/services/booking-workspace.service';

function provideBreakpoint(matches: boolean) {
  return {
    provide: BreakpointObserver,
    useValue: { observe: () => of({ matches, breakpoints: {} }) },
  };
}

// CalendarViewComponent 透過 priceForVehicle 用到 PricingStore，兩個 repo 都得備齊。
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
 * 工作清單新增的付款／文件／合約／取車就緒／還車提醒欄位，讓 CalendarViewComponent 額外
 * 依賴了 PaymentStore、DocumentStore、ContractStore、HandoverStore 與 REMINDER_STATUS_REPO——
 * 這些 store 建構時就會 inject 各自的 repository／gateway，即使測試不呼叫相關方法，
 * TestBed 建立元件時仍會整串 DI 解析，缺一個 provider 就會整個測試直接炸掉。
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
    MockOcrGateway,
    { provide: OcrGateway, useExisting: MockOcrGateway },
    MockDriverEligibilityGateway,
    { provide: DriverEligibilityGateway, useExisting: MockDriverEligibilityGateway },
    // 預設用假的 workspace／dialog，避免每個既有測試都要處理 ActivatedRoute／Router 這些
    // BookingWorkspaceService 真正實作才需要的相依；需要斷言「開了哪個工作區分頁」的測試
    // 會在自己的 TestBed.configureTestingModule 裡另外覆寫這兩個 provider。
    { provide: BookingWorkspaceService, useValue: { open: () => undefined } },
    { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(undefined) }) } },
  ];
}

const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
  id: 'b1',
  vehicleId: 'v1',
  memberId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupLocation: '',
  returnLocation: '',
  status: 'reserved',
  depositRequired: 0,
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
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
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
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
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

  it('goToToday 會跳回當月並選取當日，但不叫出面板', () => {
    const today = new Date();
    fixture.componentInstance.shiftMonth(2);
    fixture.componentInstance.goToToday();

    expect(fixture.componentInstance.month()).toEqual(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
    expect(fixture.componentInstance.selected()).toEqual(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    expect(fixture.componentInstance.panelOpen()).toBe(false);
  });

  it('面板開著時按 goToToday 會把面板收起', () => {
    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    expect(fixture.componentInstance.panelOpen()).toBe(true);

    fixture.componentInstance.goToToday();

    expect(fixture.componentInstance.panelOpen()).toBe(false);
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
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
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
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
        provideBreakpoint(true),
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Narrow-mode panel content is relocated into a CDK overlay appended to document.body via
    // DomPortal — destroy the fixture so it doesn't leak into later tests' document.body queries.
    fixture.destroy();
  });

  it('點日期格子開啟面板並標示選取', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.calendar-view__day') as NodeListOf<HTMLButtonElement>,
    );
    dayButtons[10].click();
    fixture.detectChanges();

    expect(dayButtons[10].classList.contains('calendar-view__day--selected')).toBe(true);
    expect(document.body.querySelector('.responsive-panel__body')).not.toBeNull();
  });

  it('點關閉鈕收起面板但保留格子選取樣式', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.calendar-view__day') as NodeListOf<HTMLButtonElement>,
    );
    dayButtons[10].click();
    fixture.detectChanges();

    (document.body.querySelector('.responsive-panel__close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(dayButtons[10].classList.contains('calendar-view__day--selected')).toBe(true);
    expect(document.body.querySelector('.responsive-panel__body')).toBeNull();
  });

  it('關閉後再點同一天會重新開啟面板', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.calendar-view__day') as NodeListOf<HTMLButtonElement>,
    );
    dayButtons[10].click();
    fixture.detectChanges();
    (document.body.querySelector('.responsive-panel__close') as HTMLButtonElement).click();
    fixture.detectChanges();

    dayButtons[10].click();
    fixture.detectChanges();

    expect(document.body.querySelector('.responsive-panel__body')).not.toBeNull();
  });
});

describe('CalendarViewComponent 面板 DOM 行為（寬螢幕）', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
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
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
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
              id: 'pickup', vehicleId: 'v1', memberId: 'c1',
              startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 5, 10).toISOString(),
              pickupLocation: '機場', returnLocation: '港口', status: 'reserved', depositRequired: 0,
            },
            // reserved 訂單永遠不計入還車清單（即使 endTime 剛好是這天），
            // 這裡用 in_progress 才符合 returnWorkRows 的新語意。
            {
              id: 'return-only', vehicleId: 'v1', memberId: 'c1',
              startTime: new Date(2026, 7, 2, 10).toISOString(), endTime: new Date(2026, 7, 4, 15).toISOString(),
              pickupLocation: '港口', returnLocation: '機場', status: 'in_progress', depositRequired: 0,
            },
          ]),
        },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([{ id: 'c1', name: '林美惠', phone: '0900000000', kind: 'local' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(CalendarViewComponent).componentInstance;

    component.selectDate(date);

    expect(component.pickupWorkRows().map((row) => row.booking.id)).toEqual(['pickup']);
    expect(component.returnWorkRows().map((row) => row.booking.id)).toEqual(['return-only']);
  });

  it('取車清單排除已取消訂單，電話資料提供 tel 連結值', () => {
    const date = new Date(2026, 7, 4);
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([
            {
              id: 'cancelled', vehicleId: 'v1', memberId: 'c1',
              startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 5, 10).toISOString(),
              pickupLocation: '', returnLocation: '', status: 'cancelled', depositRequired: 0,
            },
          ]),
        },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([{ id: 'c1', name: '王小明', phone: '0911222333', kind: 'local' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(CalendarViewComponent).componentInstance;

    component.selectDate(date);

    expect(component.pickupWorkRows()).toEqual([]);
    expect(component.phoneHref({ memberId: 'c1' } as RentalBooking)).toBe('tel:0911222333');
    expect(component.phoneHref({ memberId: 'missing' } as RentalBooking)).toBeNull();
  });
});

describe('CalendarViewComponent 取車／還車摘要（以車牌為主）', () => {
  function setup(vehicles: Vehicle[], bookings: RentalBooking[], members: Member[]) {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>(members) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        provideBreakpoint(false),
      ],
    });
    const fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('vehicleOf 找不到車輛時回傳 undefined，樣板車牌與車型皆顯示 —', () => {
    const date = new Date(2026, 7, 4);
    const fixture = setup(
      [],
      [
        {
          id: 'b1',
          vehicleId: 'missing-vehicle',
          memberId: 'c1',
          startTime: new Date(2026, 7, 4, 9, 5).toISOString(),
          endTime: new Date(2026, 7, 5, 18, 0).toISOString(),
          pickupLocation: '',
          returnLocation: '',
          status: 'reserved',
          depositRequired: 0,
        },
      ],
      [{ id: 'c1', name: '陳先生', phone: '0900000000', kind: 'local' }],
    );
    fixture.componentInstance.selectDate(date);
    fixture.detectChanges();

    const row = fixture.componentInstance.pickupWorkRows()[0];
    expect(fixture.componentInstance.vehicleOf(row)).toBeUndefined();

    const plateEl = fixture.nativeElement.querySelector('.work-list-row__plate');
    const metaEl = fixture.nativeElement.querySelector('.work-list-row__meta');
    expect(plateEl?.textContent?.trim()).toBe('—');
    expect(metaEl?.textContent?.trim()).toBe('— · 陳先生');
  });

  it('fmtTime 使用本地時間 HH:mm，含前導零時分', () => {
    const fixture = setup([], [], []);
    expect(fixture.componentInstance.fmtTime(new Date(2026, 7, 4, 9, 5).toISOString())).toBe(
      '09:05',
    );
    expect(fixture.componentInstance.fmtTime(new Date(2026, 7, 4, 0, 0).toISOString())).toBe(
      '00:00',
    );
    expect(fixture.componentInstance.fmtTime(new Date(2026, 7, 4, 23, 59).toISOString())).toBe(
      '23:59',
    );
  });

  it('取車摘要讀 startTime、還車摘要讀 endTime，兩者皆顯示於樣板', () => {
    const date = new Date(2026, 7, 4);
    const fixture = setup(
      [
        {
          id: 'v1',
          plateNumber: 'ABC-123',
          category: 'car',
          model: 'Altis',
          brand: 'Toyota',
          year: 2022,
          status: 'available',
          mileage: 0,
          createdAt: '',
        },
      ],
      [
        {
          id: 'b1',
          vehicleId: 'v1',
          memberId: 'c1',
          // 同一天取車又還車，確保兩個 tab 各自讀取自己的時間欄位而非共用同一個值。
          // 狀態用 in_progress（視為當天稍早已取車）而非 reserved，因為 returnWorkRows
          // 的新語意不再納入 reserved 訂單。
          startTime: new Date(2026, 7, 4, 9, 5).toISOString(),
          endTime: new Date(2026, 7, 4, 18, 30).toISOString(),
          pickupLocation: '',
          returnLocation: '',
          status: 'in_progress',
          depositRequired: 0,
        },
      ],
      [{ id: 'c1', name: '陳先生', phone: '0900000000', kind: 'local' }],
    );
    fixture.componentInstance.selectDate(date);
    fixture.detectChanges();

    const pickupRow = fixture.componentInstance.pickupWorkRows()[0];
    const returnRow = fixture.componentInstance.returnWorkRows()[0];
    expect(fixture.componentInstance.fmtTime(pickupRow.booking.startTime)).toBe('09:05');
    expect(fixture.componentInstance.fmtTime(returnRow.booking.endTime)).toBe('18:30');

    // 取車 tab 預設就是選取中的（index 0），直接可從樣板讀到 startTime 的顯示結果。
    const pickupTimeEl = fixture.nativeElement.querySelector('.work-list-row__time');
    expect(pickupTimeEl?.textContent?.trim()).toBe('09:05');
  });
});

describe('returnProgress（訂單16修正的還車進度語意）', () => {
  const mkBooking = (partial: Partial<RentalBooking>): RentalBooking => ({
    id: 'b',
    vehicleId: 'v1',
    memberId: 'c1',
    startTime: new Date(2026, 7, 3, 9).toISOString(),
    endTime: new Date(2026, 7, 4, 9).toISOString(),
    pickupLocation: '',
    returnLocation: '',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  });

  it('reserved 訂單永遠不計入還車統計，即使 endTime 剛好是這天', () => {
    const day = new Date(2026, 7, 4);
    const bookings = [
      mkBooking({ id: 'reserved', status: 'reserved' }),
      mkBooking({ id: 'in_progress', status: 'in_progress' }),
      mkBooking({ id: 'completed', status: 'completed' }),
      mkBooking({ id: 'cancelled', status: 'cancelled' }),
    ];

    expect(returnProgress(bookings, day)).toEqual({ total: 2, done: 1, pending: 1 });
  });
});

/**
 * 取車清單欄位／動作（設計文件 6.2）：付款狀態＋待收餘額、證件查核、最新合約簽署狀態、
 * 就緒判斷（可取車或具體阻擋原因），以及 pay/edit/cancel/view-contract/pickup 五個快捷操作
 * 全部導向同一個訂單工作區（不同分頁），不在清單裡另做第二套表單。
 */
describe('CalendarViewComponent 取車清單欄位與快捷操作', () => {
  const DATE = new Date(2026, 7, 4);
  const START = new Date(2026, 7, 4, 10).toISOString();
  const END = new Date(2026, 7, 5, 10).toISOString();

  function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
    return {
      id: 'v1', plateNumber: 'ABC-123', category: 'scooter', model: 'Gogoro',
      brand: 'Gogoro', year: 2022, status: 'available', mileage: 100, createdAt: '',
      ...partial,
    };
  }

  function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
    return {
      id: 'b1', vehicleId: 'v1', memberId: 'c1',
      startTime: START, endTime: END,
      pickupLocation: '機場', returnLocation: '機場',
      status: 'reserved', depositRequired: 1000,
      priceBreakdown: {
        dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0,
        rentalSubtotal: 1000, partnerDiscountPercent: 0, partnerDiscount: 0,
        addOnLines: [], addOnSubtotal: 0, insuranceSubtotal: 0, couponDiscount: 0, total: 1000,
      },
      ...partial,
    };
  }

  function makeMember(partial: Partial<Member> = {}): Member {
    return { id: 'c1', name: '王小明', phone: '0900000000', kind: 'local', email: 'a@b.com', ...partial };
  }

  function makeIdentityDocument(partial: Partial<IdentityDocument> = {}): IdentityDocument {
    return {
      id: 'id1', memberId: 'c1', type: 'taiwan_id', documentNumber: 'A123456789',
      issuingCountry: 'TW', verification: { state: 'verified' }, version: 1,
      createdAt: '', updatedAt: '', ...partial,
    };
  }

  function makeDriverCredential(partial: Partial<DriverCredential> = {}): DriverCredential {
    return {
      id: 'dc1', memberId: 'c1', type: 'taiwan_license', documentNumber: 'B123456',
      issuingCountry: 'TW', originalVehicleClassText: '普通輕型機車', standardizedVehicleClass: 'scooter',
      verification: { state: 'verified' }, reciprocityStatus: 'pending', version: 1,
      createdAt: '', updatedAt: '', ...partial,
    };
  }

  function makeSignedContract(partial: Partial<ContractVersion> = {}): ContractVersion {
    return {
      id: 'cv1', bookingId: 'b1', version: 1, status: 'signed',
      snapshot: {
        renter: { memberId: 'c1', name: '王小明', phone: '0900000000' },
        driver: { memberId: 'c1', name: '王小明', phone: '0900000000' },
        vehicle: { vehicleId: 'v1', plateNumber: 'ABC-123', brand: 'Gogoro', model: 'Gogoro', category: 'scooter' },
        rentalStartTime: START, rentalEndTime: END,
        pickupLocation: '機場', returnLocation: '機場', depositRequired: 1000,
        pricing: {
          dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0,
          rentalSubtotal: 1000, partnerDiscountPercent: 0, partnerDiscount: 0,
          addOnLines: [], addOnSubtotal: 0, insuranceSubtotal: 0, couponDiscount: 0, total: 1000,
        },
        disclosedRules: { cancellationContractKind: 'scooter', cancellationRuleVersion: 'v1' },
      },
      createdAt: '', signedAt: '',
      ...partial,
    };
  }

  function setup(options: {
    booking?: Partial<RentalBooking>;
    member?: Partial<Member>;
    identityDoc?: IdentityDocument | null;
    credential?: DriverCredential | null;
    contract?: ContractVersion | null;
    deposit?: number;
    workspaceOpen?: ReturnType<typeof vi.fn>;
    editDialogOpen?: ReturnType<typeof vi.fn>;
  } = {}) {
    const workspaceOpen = options.workspaceOpen ?? vi.fn();
    const editDialogOpen = options.editDialogOpen ?? vi.fn(() => ({ afterClosed: () => of(undefined) }));
    const identityDoc = options.identityDoc === null ? undefined : options.identityDoc ?? makeIdentityDocument();
    const credential = options.credential === null ? undefined : options.credential ?? makeDriverCredential();
    const contract = options.contract === null ? undefined : options.contract ?? makeSignedContract();
    const deposit = options.deposit ?? 1000;

    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: BookingWorkspaceService, useValue: { open: workspaceOpen } },
        { provide: MatDialog, useValue: { open: editDialogOpen } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([makeBooking(options.booking)]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember(options.member)]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        {
          provide: PAYMENT_REPO,
          useValue: createInMemoryRepo<PaymentRecord>(
            deposit > 0
              ? [
                  {
                    id: 'p1', bookingId: 'b1', amount: deposit, method: 'cash', purpose: 'deposit',
                    status: 'confirmed', receivedAt: '', handledBy: '',
                  },
                ]
              : [],
          ),
        },
        {
          provide: IDENTITY_DOCUMENT_REPO,
          useValue: createInMemoryRepo<IdentityDocument>(identityDoc ? [identityDoc] : []),
        },
        {
          provide: DRIVER_CREDENTIAL_REPO,
          useValue: createInMemoryRepo<DriverCredential>(credential ? [credential] : []),
        },
        {
          provide: CONTRACT_VERSION_REPO,
          useValue: createInMemoryRepo<ContractVersion>(contract ? [contract] : []),
        },
      ],
    });
    const fixture = TestBed.createComponent(CalendarViewComponent);
    // 用 targetDate input（而非直接呼叫 selectDate()）指定日期：CalendarViewComponent
    // 建構子裡的 effect() 要等第一次 detectChanges() 才會真正 flush，若在那之前呼叫
    // selectDate() 會被這次 effect 的初次執行用 targetDate 預設值（今天）蓋回去。
    fixture.componentRef.setInput('targetDate', DATE);
    fixture.detectChanges();
    const row = fixture.componentInstance.pickupWorkRows()[0];
    return { fixture, component: fixture.componentInstance, row, workspaceOpen, editDialogOpen };
  }

  it('齊備資料（訂金已足、合約已簽、證件已核對）顯示可取車，付款/證件/合約欄位皆正確', () => {
    const { component, row } = setup();

    expect(component.paymentStatusLabel(row)).toBe('已付清');
    expect(component.balanceDue(row)).toBe(0);
    expect(component.documentCheckLabel(row)).toBe('已核對');
    expect(component.contractStatusLabel(row)).toBe('已簽署');
    expect(component.isPickupReady(row)).toBe(true);
    expect(component.readinessLabel(row)).toBe('可取車');
    expect(component.blockersOf(row)).toEqual([]);
  });

  it('訂金未收足、證件缺件、合約未建立時顯示具體阻擋原因，且每一項都能導向對應工作區分頁', () => {
    const { component, row, workspaceOpen } = setup({
      deposit: 0,
      identityDoc: null,
      credential: null,
      contract: null,
    });

    expect(component.isPickupReady(row)).toBe(false);
    const blockers = component.blockersOf(row);
    const types = blockers.map((b) => b.type);
    expect(types).toContain('deposit_below_threshold');
    expect(types).toContain('latest_contract_unsigned');
    expect(types).toContain('required_document_missing_or_expired');
    expect(component.readinessLabel(row)).toBe(blockers[0].message);
    expect(component.contractStatusLabel(row)).toBe('尚未建立');

    const depositBlocker = blockers.find((b) => b.type === 'deposit_below_threshold')!;
    component.goHandleBlocker(row, depositBlocker);
    expect(workspaceOpen).toHaveBeenCalledWith('b1', 'payments');

    const contractBlocker = blockers.find((b) => b.type === 'latest_contract_unsigned')!;
    component.goHandleBlocker(row, contractBlocker);
    expect(workspaceOpen).toHaveBeenCalledWith('b1', 'contract');

    const docBlocker = blockers.find((b) => b.type === 'required_document_missing_or_expired')!;
    component.goHandleBlocker(row, docBlocker);
    expect(workspaceOpen).toHaveBeenCalledWith('b1', 'documents');
  });

  it('阻擋清單在畫面上以 icon + 文字 + 按鈕呈現，不是只靠顏色', () => {
    const { fixture } = setup({ deposit: 0, identityDoc: null, credential: null, contract: null });

    const items = Array.from(
      fixture.nativeElement.querySelectorAll('.work-list-severity__item') as NodeListOf<HTMLElement>,
    );
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.querySelector('.material-symbols-rounded')).not.toBeNull();
      expect(item.querySelector('.work-list-severity__text')?.textContent?.trim()).not.toBe('');
      expect(item.querySelector('button')).not.toBeNull();
    }
  });

  it('pay/edit/cancel/view-contract/pickup 快捷操作都開同一個訂單工作區，不另做第二套表單', async () => {
    const { component, row, workspaceOpen, editDialogOpen } = setup();

    component.payAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'payments');

    component.viewContractAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'contract');

    component.cancelAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'cancellation');

    component.pickupAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'handover');

    await component.editAction(row);
    // 修改沿用既有訂單編輯精靈（同一顆 BookingFormDialogComponent），不是另一套簡化表單；
    // 這裡假的 dialog.open 回傳 undefined（模擬使用者取消精靈），因此不會再呼叫一次 workspace.open。
    expect(editDialogOpen).toHaveBeenCalled();
  });
});

/**
 * 還車清單欄位／動作（設計文件 6.3）：是否逾時與逾時多久、Email 提醒排程／寄送狀態、
 * 預估逾時費與目前待收餘額，以及 view/contact/return 快捷操作；還車完成後仍應收餘額顯示
 * 「已還車／應收未結」而非還車動作。逾時項目要排在一般項目之前，同一急迫層級內維持時間序。
 */
describe('CalendarViewComponent 還車清單欄位、快捷操作與逾時排序', () => {
  const DATE = new Date(2026, 7, 10);
  const NOW = new Date(2026, 7, 10, 12, 0, 0);

  function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
    return {
      id: partial.id ?? 'v1', plateNumber: `P-${partial.id ?? 'v1'}`, category: 'scooter',
      model: 'Gogoro', brand: 'Gogoro', year: 2022, status: 'available', mileage: 100, createdAt: '',
      ...partial,
    };
  }

  function makeMember(partial: Partial<Member> = {}): Member {
    return { id: 'c1', name: '王小明', phone: '0900000000', kind: 'local', ...partial };
  }

  function makeSignedContract(bookingId: string): ContractVersion {
    return {
      id: `cv-${bookingId}`, bookingId, version: 1, status: 'signed',
      snapshot: {
        renter: { memberId: 'c1', name: '王小明', phone: '0900000000' },
        driver: { memberId: 'c1', name: '王小明', phone: '0900000000' },
        vehicle: { vehicleId: 'v1', plateNumber: 'P-v1', brand: 'Gogoro', model: 'Gogoro', category: 'scooter' },
        rentalStartTime: '', rentalEndTime: '', pickupLocation: '', returnLocation: '', depositRequired: 0,
        pricing: {
          dailyLines: [], rentalRaw: 0, tierDiscountPercent: 0, tierDiscountAmount: 0, rentalSubtotal: 0,
          partnerDiscountPercent: 0, partnerDiscount: 0, addOnLines: [], addOnSubtotal: 0,
          insuranceSubtotal: 0, couponDiscount: 0, total: 0,
        },
        disclosedRules: {
          cancellationContractKind: 'scooter',
          cancellationRuleVersion: 'v1',
          lateReturnPolicy: { graceMinutes: 0, unitMinutes: 60, feePerUnit: 100, dailyCap: 1000 },
        },
      },
      createdAt: '', signedAt: '',
    };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(workspaceOpen = vi.fn()) {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    // A：in_progress，還車時間比現在早 3 小時 → 逾時。
    const overdue: RentalBooking = {
      id: 'overdue', vehicleId: 'v1', memberId: 'c1',
      startTime: new Date(2026, 7, 8, 9).toISOString(),
      endTime: new Date(2026, 7, 10, 9).toISOString(),
      pickupLocation: '', returnLocation: '', status: 'in_progress', depositRequired: 0,
      priceBreakdown: {
        dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0, rentalSubtotal: 1000,
        partnerDiscountPercent: 0, partnerDiscount: 0, addOnLines: [], addOnSubtotal: 0,
        insuranceSubtotal: 0, couponDiscount: 0, total: 1000,
      },
    };
    // B：in_progress，還車時間比現在晚 3 小時 → 未逾時。
    const onTime: RentalBooking = {
      id: 'on-time', vehicleId: 'v1', memberId: 'c1',
      startTime: new Date(2026, 7, 8, 9).toISOString(),
      endTime: new Date(2026, 7, 10, 15).toISOString(),
      pickupLocation: '', returnLocation: '', status: 'in_progress', depositRequired: 0,
    };
    // C：completed，還車時間比現在早 4 小時，仍有應收餘額 → 已還車／應收未結。
    const unsettled: RentalBooking = {
      id: 'unsettled', vehicleId: 'v1', memberId: 'c1',
      startTime: new Date(2026, 7, 8, 9).toISOString(),
      endTime: new Date(2026, 7, 10, 8).toISOString(),
      pickupLocation: '', returnLocation: '', status: 'completed', depositRequired: 0,
      priceBreakdown: {
        dailyLines: [], rentalRaw: 500, tierDiscountPercent: 0, tierDiscountAmount: 0, rentalSubtotal: 500,
        partnerDiscountPercent: 0, partnerDiscount: 0, addOnLines: [], addOnSubtotal: 0,
        insuranceSubtotal: 0, couponDiscount: 0, total: 500,
      },
    };

    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideBookingWorkspaceRepos(),
        { provide: BookingWorkspaceService, useValue: { open: workspaceOpen } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([overdue, onTime, unsettled]),
        },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember()]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        {
          provide: PAYMENT_REPO,
          useValue: createInMemoryRepo<PaymentRecord>([
            {
              id: 'p1', bookingId: 'overdue', amount: 700, method: 'cash', purpose: 'balance',
              status: 'confirmed', receivedAt: '', handledBy: '',
            },
          ]),
        },
        {
          provide: CONTRACT_VERSION_REPO,
          useValue: createInMemoryRepo<ContractVersion>([makeSignedContract('overdue')]),
        },
        {
          provide: REMINDER_STATUS_REPO,
          useValue: createInMemoryRepo<ReminderStatus>([
            {
              id: 'r1', bookingId: 'overdue', offset: '2h_before_return', state: 'scheduled',
              updatedAt: '',
            },
          ]),
        },
        // 寬螢幕 split view：面板內容一律渲染，DOM 斷言才不用管 narrow 模式的 CDK
        // overlay portal 何時掛載。
        provideBreakpoint(false),
      ],
    });
    const fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.componentRef.setInput('targetDate', DATE);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, workspaceOpen };
  }

  it('逾時狀態、Email 提醒、預估逾時費、目前待收餘額皆正確；逾時項目排在最前面', () => {
    const { component } = setup();
    const rows = component.returnWorkRows();

    // 逾時（urgent）排最前，同一急迫層級內維持還車時間先後順序：
    // unsettled（08:00）在 on-time（15:00）之前。
    expect(rows.map((r) => r.booking.id)).toEqual(['overdue', 'unsettled', 'on-time']);

    const overdueRow = rows[0];
    expect(component.isOverdue(overdueRow)).toBe(true);
    expect(component.overdueDurationLabel(overdueRow)).toBe('3 小時 0 分');
    expect(component.reminderStateLabel(overdueRow)).toBe('已排程');
    expect(component.estimatedLateFee(overdueRow)).toBe(300);
    expect(component.balanceDue(overdueRow)).toBe(300);

    const onTimeRow = rows[2];
    expect(component.isOverdue(onTimeRow)).toBe(false);
    expect(component.reminderStateLabel(onTimeRow)).toBe('待排程');

    const unsettledRow = rows[1];
    expect(component.isReturnedUnsettled(unsettledRow)).toBe(true);
    expect(component.isOverdue(unsettledRow)).toBe(false);
  });

  it('已還車／應收未結的列不顯示「還車」動作；in_progress 的列才顯示', () => {
    const { fixture, component } = setup();
    const rows = component.returnWorkRows();
    // 面板預設停在「取車」tab，matTabContent 是延遲載入——還車 tab 的內容要先切過去
    // 才會真的掛進 DOM，否則 querySelectorAll 會撲空。
    component.onPanelTabIndexChange(1);
    fixture.detectChanges();
    // matTabContent 延遲渲染，MatTabGroup 內部切換動畫走的是計時器；已經開了 fake timers，
    // 要主動推進才會真的把還車 tab 的內容掛進 DOM。
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    const panels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-expansion-panel') as NodeListOf<HTMLElement>,
    );

    rows.forEach((row, i) => {
      // 用「快捷操作列裡有沒有一顆文字剛好是『還車』的按鈕」判斷，不能只用整個面板
      // textContent 找子字串——「已還車／應收未結」狀態徽章的文字本身就包含「還車」兩字，
      // 用子字串比對會對已還車列誤判成有還車按鈕。
      const actionButtons = Array.from(
        panels[i]?.querySelectorAll('.work-list-actions button') ?? [],
      ) as HTMLElement[];
      const hasReturnButton = actionButtons.some((btn) => btn.textContent?.includes('還車'));
      expect(hasReturnButton).toBe(row.booking.status === 'in_progress');
    });
  });

  it('view/contact/return 快捷操作：view 與 return 都開同一個訂單工作區', () => {
    const { component, workspaceOpen } = setup();
    const overdueRow = component.returnWorkRows()[0];

    component.viewAction(overdueRow);
    expect(workspaceOpen).toHaveBeenLastCalledWith('overdue');

    component.returnAction(overdueRow);
    expect(workspaceOpen).toHaveBeenLastCalledWith('overdue', 'handover');

    expect(component.phoneHref(overdueRow.booking)).toBe('tel:0900000000');
  });
});
