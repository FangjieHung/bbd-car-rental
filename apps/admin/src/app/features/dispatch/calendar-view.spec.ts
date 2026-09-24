import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import {
  CalendarViewComponent,
  dayStats,
  pickupProgress,
  returnProgress,
} from './calendar-view/calendar-view.component';
import { ZH_TW } from '../../core/i18n/zh-tw';
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
  PrepTask,
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
  PREP_TASK_REPO,
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
import { ReminderGateway } from '../../core/services/reminder.gateway';
import { OrderDetailNavigation } from '../orders/navigation/order-detail-navigation';
import { orderInitialFromQuery } from '../orders/pages/order-create-page.component';
import { toLocalInputValue } from '../orders/order-form/order-form';
import { TimelineViewComponent } from './timeline-view/timeline-view.component';

function provideBreakpoint(matches: boolean) {
  return {
    provide: BreakpointObserver,
    useValue: { observe: () => of({ matches, breakpoints: {} }) },
  };
}

// CalendarViewComponent 透過預估逾時費與可用分頁的租金試算用到 PricingStore，兩個 repo 都得備齊。
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
function provideOrderDetailRepos() {
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
    // 預設用假的訂單詳情導覽／dialog，避免每個既有測試都要處理 Router 這些真正導頁才需要的相依；
    // 需要斷言「前往哪個訂單詳情分頁」的測試會在自己的 TestBed.configureTestingModule 裡另外覆寫。
    { provide: OrderDetailNavigation, useValue: { open: () => undefined, edit: () => undefined } },
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

const mkVehicle = (id: string, status: Vehicle['status'] = 'available'): Vehicle => ({
  id,
  plateNumber: id,
  category: 'car',
  model: 'X',
  brand: 'Y',
  year: 2022,
  status,
  mileage: 0,
  createdAt: '',
});

describe('dayStats', () => {
  it('取/還/可用數（1.2：與 pickupProgress／returnProgress 同一份定義）', () => {
    const vehicles = [mkVehicle('v1'), mkVehicle('v2'), mkVehicle('v3')];
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
    expect(dayStats(bookings, vehicles, new Date(2026, 6, 21))).toEqual({
      pickups: 1,
      returns: 0,
      available: 2,
      needsDispatch: 0,
    });
    // 7/23：b1 還車、b2 取車，v1 v2 都佔用
    expect(dayStats(bookings, vehicles, new Date(2026, 6, 23))).toEqual({
      pickups: 1,
      returns: 1,
      available: 1,
      needsDispatch: 0,
    });
    // 7/26：無事，全可用
    expect(dayStats(bookings, vehicles, new Date(2026, 6, 26))).toEqual({
      pickups: 0,
      returns: 0,
      available: 3,
      needsDispatch: 0,
    });
  });

  it('cancelled 不計入取還車數', () => {
    const vehicles = [mkVehicle('v1'), mkVehicle('v2'), mkVehicle('v3')];
    expect(dayStats([mk({ status: 'cancelled' })], vehicles, new Date(2026, 6, 21))).toEqual({
      pickups: 0,
      returns: 0,
      available: 3,
      needsDispatch: 0,
    });
  });

  // 1.2：過去一天已完成的取還——過去日期的月曆格先前看不到已完成的訂單，這裡驗證
  // completed 訂單的取／還車日照樣計入（即使那天早就過去了）。completed 不在 OCCUPYING
  // （只看 reserved／in_progress），所以也不影響同一天的可用數判斷（v1 仍可用）。
  it('過去一天已完成的取還照樣計入取／還車數，且不影響可用數', () => {
    const vehicles = [mkVehicle('v1')];
    const pastDay = new Date(2026, 6, 10);
    const completed = mk({
      status: 'completed',
      startTime: new Date(2026, 6, 10, 9).toISOString(),
      endTime: new Date(2026, 6, 10, 18).toISOString(),
    });
    expect(dayStats([completed], vehicles, pastDay)).toEqual({
      pickups: 1,
      returns: 1,
      available: 1,
      needsDispatch: 0,
    });
  });

  // 1.3：保養中的車不計入可用數（JKL-012：月曆先前只算「總車數－當天佔用」，沒扣保養中的車）。
  it('保養中的車不計入可用數', () => {
    const vehicles = [mkVehicle('v1'), mkVehicle('v2', 'maintenance'), mkVehicle('v3')];
    expect(dayStats([], vehicles, new Date(2026, 6, 21)).available).toBe(2);
  });

  // 1.2：月曆數字＝面板總數——用同一組 bookings／day 直接比對 dayStats 與
  // pickupProgress／returnProgress 的結果，證明兩邊永遠是同一份定義算出來的。
  it('月曆的取／還數字與 pickupProgress／returnProgress 的 total 永遠一致', () => {
    const vehicles = [mkVehicle('v1'), mkVehicle('v2'), mkVehicle('v3', 'maintenance')];
    const day = new Date(2026, 6, 21);
    const bookings = [
      mk({ id: 'b-reserved', status: 'reserved', startTime: new Date(2026, 6, 21, 9).toISOString() }),
      mk({
        id: 'b-return-not-picked-up',
        status: 'reserved',
        vehicleId: 'v2',
        endTime: new Date(2026, 6, 21, 18).toISOString(),
      }),
      mk({ id: 'b-cancelled', status: 'cancelled', startTime: new Date(2026, 6, 21, 9).toISOString() }),
    ];
    const stats = dayStats(bookings, vehicles, day);
    expect(stats.pickups).toBe(pickupProgress(bookings, day).total);
    expect(stats.returns).toBe(returnProgress(bookings, day).total);
  });

  // 3.3：月曆格「需調度 N」＝當天取車清單中需調度的筆數——只算尚未取車（reserved）、
  // 車輛所在據點與取車據點不同的訂單；已取車、已取消、別天取車、車輛沒設據點的都不算。
  it('needsDispatch：當天尚未取車、且車不在取車據點的筆數', () => {
    const day = new Date(2026, 6, 21);
    const at9 = new Date(2026, 6, 21, 9).toISOString();
    const vehicles: Vehicle[] = [
      { ...mkVehicle('at-store'), location: 'mzg-store' },
      { ...mkVehicle('at-airport'), location: 'mzg-airport' },
      { ...mkVehicle('unknown') },
    ];
    const bookings = [
      mk({ id: 'needs', vehicleId: 'at-store', pickupLocation: 'mzg-airport', startTime: at9 }),
      mk({ id: 'needs-2', vehicleId: 'at-store', pickupLocation: 'mzg-port', startTime: at9 }),
      mk({ id: 'same-branch', vehicleId: 'at-airport', pickupLocation: 'mzg-airport', startTime: at9 }),
      mk({ id: 'no-location', vehicleId: 'unknown', pickupLocation: 'mzg-airport', startTime: at9 }),
      mk({ id: 'picked-up', vehicleId: 'at-store', pickupLocation: 'mzg-airport', startTime: at9, status: 'in_progress' }),
      mk({ id: 'cancelled', vehicleId: 'at-store', pickupLocation: 'mzg-airport', startTime: at9, status: 'cancelled' }),
      mk({
        id: 'other-day',
        vehicleId: 'at-store',
        pickupLocation: 'mzg-airport',
        startTime: new Date(2026, 6, 22, 9).toISOString(),
      }),
    ];

    expect(dayStats(bookings, vehicles, day).needsDispatch).toBe(2);
    expect(dayStats(bookings, vehicles, new Date(2026, 6, 22)).needsDispatch).toBe(1);
  });
});

describe('CalendarViewComponent supplied date', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideOrderDetailRepos(),
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
        ...provideOrderDetailRepos(),
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

  // 3.4：換月不關面板——原本選的日子不在新月份，改選新月份的 1 日。
  it('換月不收起面板：改選新月份的 1 日', () => {
    fixture.componentInstance.month.set(new Date(2026, 6, 1));
    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    fixture.componentInstance.shiftMonth(1);

    expect(fixture.componentInstance.month()).toEqual(new Date(2026, 7, 1));
    expect(fixture.componentInstance.selected()).toEqual(new Date(2026, 7, 1));
    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('換月前面板是收起的（窄螢幕），換月後仍保持收起', () => {
    fixture.componentInstance.month.set(new Date(2026, 6, 1));
    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    fixture.componentInstance.dismissPanel();
    fixture.componentInstance.shiftMonth(1);

    expect(fixture.componentInstance.selected()).toEqual(new Date(2026, 7, 1));
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
        ...provideOrderDetailRepos(),
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

  // 3.4：換月不關面板。新月份包含今天時選今天，否則選 1 日；原選取日就在新月份時保留。
  it('換月後面板保持開啟；新月份包含今天就選今天，否則選該月 1 日', () => {
    const component = fixture.componentInstance;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const emitted: Date[] = [];
    component.dateSelected.subscribe((d) => emitted.push(d));

    component.shiftMonth(1);
    expect(component.selected()).toEqual(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    expect(component.panelOpen()).toBe(true);

    component.shiftMonth(-1);
    expect(component.selected()).toEqual(todayStart);
    expect(component.panelOpen()).toBe(true);

    // 換月改了選取日，也要通知總覽（與點日期格同一條路）。
    expect(emitted).toEqual([new Date(today.getFullYear(), today.getMonth() + 1, 1), todayStart]);
  });

  it('原選取日就在新月份（點了灰色的鄰月日期）時保留原選取日', () => {
    const component = fixture.componentInstance;
    component.month.set(new Date(2026, 6, 1));
    component.selectDate(new Date(2026, 7, 1)); // 7 月格線最後一列的 8/1

    component.shiftMonth(1);

    expect(component.month()).toEqual(new Date(2026, 7, 1));
    expect(component.selected()).toEqual(new Date(2026, 7, 1));
  });

  it('換月、換選取日都停在目前的分頁（例如「可用」），不會跳回取車', () => {
    const component = fixture.componentInstance;
    component.onPanelTabIndexChange(2);

    component.shiftMonth(1);
    fixture.detectChanges();
    expect(component.panelTab()).toBe('available');

    component.selectDate(new Date(2026, 6, 10));
    fixture.detectChanges();
    expect(component.panelTab()).toBe('available');
  });
});

describe('CalendarViewComponent 面板 DOM 行為（窄螢幕）', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideOrderDetailRepos(),
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
        ...provideOrderDetailRepos(),
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
        ...provideOrderDetailRepos(),
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
        ...provideOrderDetailRepos(),
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
        ...provideOrderDetailRepos(),
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

describe('returnProgress（1.2 修正：尚未取車的預訂到期也列入還車清單）', () => {
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

  // 舊版（訂單16）曾經刻意把 reserved 排除在還車統計外；1.2 反過來要求尚未取車的預訂
  // 到了還車日也要列入當天的還車清單（標「尚未取車」，不算 done），才能讓月曆格的
  // 「還 N」與面板的還車總數一致（月曆格先前用的是 reserved／in_progress 都算的口徑）。
  it('reserved（尚未取車）訂單到了還車日也計入還車統計的 total，但不算 done', () => {
    const day = new Date(2026, 7, 4);
    const bookings = [
      mkBooking({ id: 'reserved', status: 'reserved' }),
      mkBooking({ id: 'in_progress', status: 'in_progress' }),
      mkBooking({ id: 'completed', status: 'completed' }),
      mkBooking({ id: 'cancelled', status: 'cancelled' }),
    ];

    expect(returnProgress(bookings, day)).toEqual({ total: 3, done: 1, pending: 2 });
  });
});

/**
 * 取車清單欄位／動作（設計文件 6.2）：付款狀態＋待收餘額、證件查核、最新合約簽署狀態、
 * 就緒判斷（可取車或具體阻擋原因），以及 pay/edit/cancel/view-contract/pickup 五個快捷操作
 * 全部導向同一個訂單詳情（不同分頁），不在清單裡另做第二套表單。
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
    prepTasks?: PrepTask[];
  } = {}) {
    const workspaceOpen = options.workspaceOpen ?? vi.fn();
    const workspaceEdit = vi.fn();
    const identityDoc = options.identityDoc === null ? undefined : options.identityDoc ?? makeIdentityDocument();
    const credential = options.credential === null ? undefined : options.credential ?? makeDriverCredential();
    const contract = options.contract === null ? undefined : options.contract ?? makeSignedContract();
    const deposit = options.deposit ?? 1000;

    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideOrderDetailRepos(),
        { provide: OrderDetailNavigation, useValue: { open: workspaceOpen, edit: workspaceEdit } },
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
        { provide: PREP_TASK_REPO, useValue: createInMemoryRepo<PrepTask>(options.prepTasks ?? []) },
      ],
    });
    const fixture = TestBed.createComponent(CalendarViewComponent);
    // 用 targetDate input（而非直接呼叫 selectDate()）指定日期：CalendarViewComponent
    // 建構子裡的 effect() 要等第一次 detectChanges() 才會真正 flush，若在那之前呼叫
    // selectDate() 會被這次 effect 的初次執行用 targetDate 預設值（今天）蓋回去。
    fixture.componentRef.setInput('targetDate', DATE);
    fixture.detectChanges();
    const row = fixture.componentInstance.pickupWorkRows()[0];
    return { fixture, component: fixture.componentInstance, row, workspaceOpen, workspaceEdit };
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

  it('訂金未收足、證件缺件、合約未建立時顯示具體阻擋原因，且每一項都能導向對應的訂單詳情分頁', () => {
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
    // 打磨（4）：chip 顯示拿掉句尾句號，blockersOf() 本身（展開清單用）維持原文案含句號。
    expect(component.readinessLabel(row)).toBe(blockers[0].message.replace(/。$/, ''));
    expect(blockers[0].message.endsWith('。')).toBe(true);
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

  // 阻擋／提醒已經不在列內展開，而是在明細視窗裡（work-list-detail-dialog）。這裡驗「清單交給
  // 視窗的內容」每一則都有可讀的文字與可辨識的類別；實際的 icon + 文字 + 按鈕排版由
  // work-list-detail-dialog.component.spec.ts 驗。
  it('阻擋項目交給明細視窗時帶有類別與文字，不是只靠顏色', () => {
    const { component } = setup({ deposit: 0, identityDoc: null, credential: null, contract: null });

    const severities = component.workListDetailData(component.pickupWorkRows()[0]).severities;
    expect(severities.length).toBeGreaterThan(0);
    for (const severity of severities) {
      expect(['blocker', 'warning']).toContain(severity.kind);
      expect(severity.message.trim()).not.toBe('');
      expect(severity.key).not.toBe('');
    }
  });

  // 4.3：該車還有沒整備的待辦 → 取車列顯示「尚未整備」提醒；不列入阻擋、不影響可取車與可用數。
  const openPrep = (partial: Partial<PrepTask> = {}): PrepTask => ({
    id: 'prep-1',
    vehicleId: 'v1',
    bookingId: 'b-prev',
    returnedAt: new Date(2026, 7, 3, 18).toISOString(),
    returnLocation: '機場',
    ...partial,
  });
  const prepChip = (fixture: { nativeElement: HTMLElement }) =>
    fixture.nativeElement.querySelector('.work-list-row__prep') as HTMLElement | null;

  it('4.3：車還沒整備 → 取車列顯示「尚未整備」提醒，但仍是「可取車」，也沒有多出阻擋原因', () => {
    const { fixture, component, row } = setup({ prepTasks: [openPrep()] });

    expect(component.needsPrep(row)).toBe(true);
    expect(prepChip(fixture)?.textContent).toContain('尚未整備');
    expect(prepChip(fixture)?.classList).toContain('ui-chip--warning');
    // 不是阻擋：就緒判斷、阻擋與提醒清單都和沒有整備待辦時一模一樣。
    expect(component.isPickupReady(row)).toBe(true);
    expect(component.readinessLabel(row)).toBe('可取車');
    expect(component.blockersOf(row)).toEqual([]);
    expect(component.warningsOf(row)).toEqual([]);
  });

  it('4.3：阻擋原因不含整備——有阻擋時照舊，整備只多一個提醒', () => {
    const withPrep = setup({ deposit: 0, prepTasks: [openPrep()] });
    const blockersWithPrep = withPrep.component.blockersOf(withPrep.row).map((b) => b.type);
    const labelWithPrep = withPrep.component.readinessLabel(withPrep.row);
    expect(withPrep.component.needsPrep(withPrep.row)).toBe(true);
    TestBed.resetTestingModule();
    const withoutPrep = setup({ deposit: 0 });

    expect(blockersWithPrep).toEqual(withoutPrep.component.blockersOf(withoutPrep.row).map((b) => b.type));
    expect(blockersWithPrep).toEqual(['deposit_below_threshold']);
    expect(labelWithPrep).toBe(withoutPrep.component.readinessLabel(withoutPrep.row));
  });

  it('4.3：已整備完成（或沒有整備待辦）就不提醒', () => {
    const { fixture, component, row } = setup({
      prepTasks: [openPrep({ completedAt: new Date(2026, 7, 4, 8).toISOString(), completedBy: '管理員' })],
    });

    expect(component.needsPrep(row)).toBe(false);
    expect(prepChip(fixture)).toBeNull();
  });

  it('4.3：已取車的列不提醒（車已經交出去了）', () => {
    const { fixture, component, row } = setup({ booking: { status: 'in_progress' }, prepTasks: [openPrep()] });

    expect(component.needsPrep(row)).toBe(false);
    expect(prepChip(fixture)).toBeNull();
  });

  it('4.3：待整備不影響月曆可用數與可用分頁——沒有訂單的那天，這台車照樣算可用', () => {
    const { fixture, component } = setup({ prepTasks: [openPrep()] });
    const freeDay = new Date(2026, 7, 10);

    expect(component.statsOf(freeDay).available).toBe(1);

    // 可用分頁只查今天以後的日子：挑一個沒有訂單的未來日子。
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    fixture.componentRef.setInput('targetDate', future);
    fixture.detectChanges();
    expect(component.availableCount()).toBe(1);
  });

  it('pay/edit/cancel/view-contract/pickup 快捷操作都開同一個訂單詳情，不另做第二套表單', () => {
    const { component, row, workspaceOpen, workspaceEdit } = setup();

    component.payAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'payments');

    component.viewContractAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'contract');

    component.cancelAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'cancellation');

    component.pickupAction(row);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'handover');

    component.editAction(row);
    // 修改直接進入訂單詳情總覽的編輯訂單（/orders/:id?edit=1），不是另一套簡化表單。
    expect(workspaceEdit).toHaveBeenCalledWith('b1');
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
        ...provideOrderDetailRepos(),
        { provide: OrderDetailNavigation, useValue: { open: workspaceOpen, edit: () => undefined } },
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
    const { component } = setup();

    // 快捷操作已移到明細視窗：用 action key 判斷，不用按鈕文字——「已還車／應收未結」狀態
    // 徽章的文字本身就含「還車」兩字，用文字比對會把已還車的列誤判成有還車按鈕。
    for (const row of component.returnWorkRows()) {
      const keys = component.workListDetailData(row).actions.map((a) => a.key);
      expect(keys).toContain('view');
      expect(keys.includes('return')).toBe(row.booking.status === 'in_progress');
    }
  });

  it('view/contact/return 快捷操作：view 與 return 都開同一個訂單詳情', () => {
    const { component, workspaceOpen } = setup();
    const overdueRow = component.returnWorkRows()[0];

    component.viewAction(overdueRow);
    expect(workspaceOpen).toHaveBeenLastCalledWith('overdue');

    component.returnAction(overdueRow);
    expect(workspaceOpen).toHaveBeenLastCalledWith('overdue', 'handover');

    expect(component.phoneHref(overdueRow.booking)).toBe('tel:0900000000');
  });
});

/**
 * 需調度標記（CONTEXT.md「需調度」）：取車據點與車輛所在據點不同、且訂單仍是 reserved
 * （車輛還沒被取走）才算需調度。只處理取車端，還車端不在本次範圍內。
 */
describe('CalendarViewComponent 需調度標記與篩選', () => {
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
      pickupLocation: 'mzg-airport', returnLocation: 'mzg-airport',
      status: 'reserved', depositRequired: 0,
      ...partial,
    };
  }

  function setup(vehicles: Vehicle[], bookings: RentalBooking[]) {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideOrderDetailRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
        {
          provide: MEMBER_REPO,
          useValue: createInMemoryRepo<Member>([{ id: 'c1', name: '王小明', phone: '', kind: 'local' }]),
        },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
      ],
    });
    const fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.componentRef.setInput('targetDate', DATE);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('取車據點與車輛所在據點不同、訂單為 reserved → true', () => {
    const { component } = setup(
      [makeVehicle({ location: 'mzg-store' })],
      [makeBooking({ pickupLocation: 'mzg-airport', status: 'reserved' })],
    );
    const row = component.pickupWorkRows()[0];

    expect(component.needsDispatch(row)).toBe(true);
  });

  it('取車據點與車輛所在據點相同 → false', () => {
    const { component } = setup(
      [makeVehicle({ location: 'mzg-airport' })],
      [makeBooking({ pickupLocation: 'mzg-airport', status: 'reserved' })],
    );
    const row = component.pickupWorkRows()[0];

    expect(component.needsDispatch(row)).toBe(false);
  });

  it('車輛沒有所在據點（不確定）→ false', () => {
    const { component } = setup(
      [makeVehicle({ location: undefined })],
      [makeBooking({ pickupLocation: 'mzg-airport', status: 'reserved' })],
    );
    const row = component.pickupWorkRows()[0];

    expect(component.needsDispatch(row)).toBe(false);
  });

  it('in_progress（已取車）訂單即使據點不同也不算需調度', () => {
    const { component } = setup(
      [makeVehicle({ location: 'mzg-store' })],
      [makeBooking({ pickupLocation: 'mzg-airport', status: 'in_progress' })],
    );
    const row = component.pickupWorkRows()[0];

    expect(component.needsDispatch(row)).toBe(false);
  });

  it('篩選開啟時，取車清單只剩需調度的列，數量正確，關閉後恢復', () => {
    const { component } = setup(
      [
        makeVehicle({ id: 'v1', location: 'mzg-store' }),
        makeVehicle({ id: 'v2', location: 'mzg-airport' }),
      ],
      [
        makeBooking({ id: 'b1', vehicleId: 'v1', pickupLocation: 'mzg-airport', status: 'reserved' }),
        makeBooking({ id: 'b2', vehicleId: 'v2', pickupLocation: 'mzg-airport', status: 'reserved' }),
      ],
    );

    expect(component.pickupWorkRows()).toHaveLength(2);
    expect(component.pickupNeedsDispatchCount()).toBe(1);

    component.showNeedsDispatchOnly.set(true);
    expect(component.pickupWorkRows()).toHaveLength(1);
    expect(component.pickupWorkRows()[0].booking.id).toBe('b1');

    component.showNeedsDispatchOnly.set(false);
    expect(component.pickupWorkRows()).toHaveLength(2);
  });

  it('篩選開啟且當天沒有需調度的取車時，清單清空（畫面顯示空狀態文字）', () => {
    const { fixture, component } = setup(
      [makeVehicle({ location: 'mzg-airport' })],
      [makeBooking({ pickupLocation: 'mzg-airport', status: 'reserved' })],
    );

    component.showNeedsDispatchOnly.set(true);
    fixture.detectChanges();

    expect(component.pickupWorkRows()).toHaveLength(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('當天沒有需調度的取車');
  });
});

/**
 * 1.2 驗收情境：規格列出的四種情況——未來一天有尚未取車的預訂到期、今天的逾時未還、
 * 月曆數字＝面板總數（前兩種已用純函式測過，這裡從元件角度驗證清單內容與畫面顯示）。
 */
describe('CalendarViewComponent 1.2：月曆與面板取還數字統一', () => {
  function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
    return {
      id: 'v1', plateNumber: 'ABC-123', category: 'scooter', model: 'Gogoro',
      brand: 'Gogoro', year: 2022, status: 'available', mileage: 100, createdAt: '',
      ...partial,
    };
  }

  function setup(bookings: RentalBooking[], now?: Date) {
    if (now) {
      vi.useFakeTimers();
      vi.setSystemTime(now);
    }
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideOrderDetailRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([{ id: 'c1', name: '林美惠', phone: '0900000000', kind: 'local' }]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        provideBreakpoint(false),
      ],
    });
    const fixture = TestBed.createComponent(CalendarViewComponent);
    return { fixture, component: fixture.componentInstance };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('未來一天有尚未取車的預訂到期時，列入當天還車清單並標「尚未取車」，不提供辦理還車', () => {
    const futureDay = new Date(2026, 8, 25);
    const booking: RentalBooking = {
      id: 'b-future-return', vehicleId: 'v1', memberId: 'c1',
      startTime: new Date(2026, 8, 23, 10).toISOString(),
      endTime: new Date(2026, 8, 25, 17).toISOString(),
      pickupLocation: '', returnLocation: '', status: 'reserved', depositRequired: 0,
    };
    const { fixture, component } = setup([booking]);
    // 建構子裡的 effect() 要等第一次 detectChanges() 才會真正 flush，若在那之前呼叫
    // selectDate() 會被這次 effect 的初次執行用 targetDate 預設值（今天）蓋回去。
    fixture.detectChanges();
    component.selectDate(futureDay);
    fixture.detectChanges();

    expect(component.returnWorkRows().map((r) => r.booking.id)).toEqual(['b-future-return']);
    // 這天的還車統計 total 也要看得到它（面板 tab 標籤與月曆格共用同一份數字）。
    expect(component.selectedReturnProgress()).toEqual({ total: 1, done: 0, pending: 1 });
    expect(component.statsOf(futureDay).returns).toBe(1);

    // matTabContent 延遲渲染，MatTabGroup 內部切換動畫走的是計時器；要先開 fake timers
    // 再觸發切換，才能用 advanceTimersByTime 把還車 tab 的內容真正推進 DOM。
    vi.useFakeTimers();
    component.onPanelTabIndexChange(1);
    fixture.detectChanges();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('尚未取車');
    const returnButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.work-list-actions button'),
    ) as HTMLElement[];
    expect(returnButtons.some((b) => b.textContent?.includes('還車'))).toBe(false);
  });

  it('今天的還車清單另外列出逾時未還（即使還車日不是今天），但月曆格的還車數不計逾時', () => {
    const today = new Date(2026, 8, 23, 12, 0, 0);
    // 三天前就該還車、狀態仍是 in_progress（尚未還車）——不是「今天」到期的還車。
    const overdueFromDaysAgo: RentalBooking = {
      id: 'b-overdue-old', vehicleId: 'v1', memberId: 'c1',
      startTime: new Date(2026, 8, 18, 9).toISOString(),
      endTime: new Date(2026, 8, 20, 9).toISOString(),
      pickupLocation: '', returnLocation: '', status: 'in_progress', depositRequired: 0,
    };
    const { fixture, component } = setup([overdueFromDaysAgo], today);
    fixture.detectChanges();
    component.selectDate(today);
    fixture.detectChanges();

    // 清單裡看得到它（今天視角另外列出的逾時未還）。
    expect(component.returnWorkRows().map((r) => r.booking.id)).toEqual(['b-overdue-old']);
    expect(component.isOverdue(component.returnWorkRows()[0])).toBe(true);

    // 但它的還車日是 9/20、不是今天，今天（9/23）的還車統計 total／月曆格「還 N」不計它。
    expect(component.selectedReturnProgress()).toEqual({ total: 0, done: 0, pending: 0 });
    expect(component.statsOf(today).returns).toBe(0);
  });

  it('月曆可用數與可用分頁都不計保養中的車（1.3）', () => {
    const today = new Date();
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    const vehicles: Vehicle[] = [
      makeVehicle({ id: 'v1', status: 'available' }),
      makeVehicle({ id: 'v2', status: 'maintenance' }),
      makeVehicle({ id: 'v3', status: 'available' }),
    ];
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideOrderDetailRepos(),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        provideBreakpoint(false),
      ],
    });
    const fixture = TestBed.createComponent(CalendarViewComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectDate(day);
    fixture.detectChanges();

    expect(component.statsOf(day).available).toBe(2);
    expect(component.availableCount()).toBe(2);
  });
});

/** 批次 3 用的共用 fixture：寬螢幕（面板內容直接渲染在元件裡）、可指定「現在」、可攔導頁。 */
function setupBatch3(options: {
  vehicles: Vehicle[];
  bookings?: RentalBooking[];
  members?: Member[];
  now?: Date;
  date?: Date;
}) {
  if (options.now) {
    vi.useFakeTimers();
    vi.setSystemTime(options.now);
  }
  TestBed.configureTestingModule({
    providers: [
      ...providePricing(),
      ...provideOrderDetailRepos(),
      provideRouter([]),
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(options.vehicles) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(options.bookings ?? []) },
      {
        provide: MEMBER_REPO,
        useValue: createInMemoryRepo<Member>(
          options.members ?? [{ id: 'c1', name: '林美惠', phone: '0900000000', kind: 'local', email: 'a@b.com' }],
        ),
      },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      provideBreakpoint(false),
    ],
  });
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  const fixture = TestBed.createComponent(CalendarViewComponent);
  if (options.date) fixture.componentRef.setInput('targetDate', options.date);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, component: fixture.componentInstance, el, navigate };
}

function vehicleAt(id: string, partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id, plateNumber: id.toUpperCase(), category: 'car', model: `Model-${id}`, brand: 'Toyota',
    year: 2022, status: 'available', mileage: 0, createdAt: '', ...partial,
  };
}

function booking(id: string, partial: Partial<RentalBooking>): RentalBooking {
  return {
    id, vehicleId: 'v1', memberId: 'c1',
    startTime: new Date(2026, 8, 23, 9).toISOString(), endTime: new Date(2026, 8, 24, 9).toISOString(),
    pickupLocation: 'mzg-airport', returnLocation: 'mzg-airport', status: 'reserved', depositRequired: 0,
    ...partial,
  };
}

/** 切到面板第 index 個分頁；matTabContent 延遲渲染，要推進計時器才會掛進 DOM（需先開 fake timers）。 */
function openPanelTab(fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>, index: number): void {
  fixture.componentInstance.onPanelTabIndexChange(index);
  fixture.detectChanges();
  vi.advanceTimersByTime(1000);
  fixture.detectChanges();
}

/** 月曆格線上某一天的格子。 */
function dayCell(
  fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>,
  day: Date,
): HTMLElement | undefined {
  const index = fixture.componentInstance.monthDays().findIndex((d) => d.getTime() === day.getTime());
  return (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.calendar-view__day')[index];
}

/**
 * 批次 1 驗收 (a)：已取車、已完成的取車列仍顯示「車輛目前在租，與本次取車衝突」——拿「現在」的車況
 * （車正在這位客人自己手上）去套已經發生的取車。就緒／衝突／阻擋提示只給尚未取車的列。
 */
describe('CalendarViewComponent 取車清單：已取車、已完成的列（批次 1 驗收 a）', () => {
  const DAY = new Date(2026, 7, 4);

  function setup() {
    return setupBatch3({
      date: DAY,
      vehicles: [
        vehicleAt('v1', { status: 'rented' }), // 正由 picked-up 這筆出租中
        vehicleAt('v2'),
        vehicleAt('v3'),
      ],
      bookings: [
        booking('picked-up', {
          vehicleId: 'v1', status: 'in_progress',
          startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 6, 10).toISOString(),
        }),
        booking('done', {
          vehicleId: 'v2', status: 'completed',
          startTime: new Date(2026, 7, 4, 9).toISOString(), endTime: new Date(2026, 7, 4, 18).toISOString(),
        }),
        booking('waiting', {
          vehicleId: 'v3', status: 'reserved',
          startTime: new Date(2026, 7, 4, 14).toISOString(), endTime: new Date(2026, 7, 5, 14).toISOString(),
        }),
      ],
    });
  }

  it('已完成的取車也列在清單上，列數＝分頁標籤的「取車 N」', () => {
    const { component } = setup();

    expect(component.pickupWorkRows().map((r) => r.booking.id)).toEqual(['done', 'picked-up', 'waiting']);
    expect(component.selectedPickupProgress()).toEqual({ total: 3, done: 2, pending: 1 });
  });

  it('已取車、已完成的列不做就緒判斷：沒有阻擋、沒有提醒', () => {
    const { component } = setup();
    const rows = component.pickupWorkRows();
    const [done, pickedUp, waiting] = rows;

    for (const row of [done, pickedUp]) {
      expect(component.readiness(row)).toBeUndefined();
      expect(component.blockersOf(row)).toEqual([]);
      expect(component.warningsOf(row)).toEqual([]);
    }
    expect(component.readiness(waiting)).toBeDefined();
  });

  it('畫面上：已取車的列顯示「已取車」，不出現「車輛目前在租」這類衝突警示', () => {
    const { el, component } = setup();
    const listRows = Array.from(el.querySelectorAll<HTMLElement>('.work-list-row'));
    const rows = component.pickupWorkRows();

    expect(listRows).toHaveLength(3);
    for (const [i, listRow] of listRows.slice(0, 2).entries()) {
      expect(listRow.querySelector('.work-list-row__picked-up')?.textContent).toContain('已取車');
      expect(listRow.querySelector('.work-list-row__readiness')).toBeNull();
      // 阻擋／提醒已移到明細視窗，這兩列本來就沒有就緒判斷，視窗裡也該是空的。
      expect(component.workListDetailData(rows[i]).severities).toHaveLength(0);
    }
    expect(listRows[2].querySelector('.work-list-row__readiness')).not.toBeNull();
    expect(el.textContent).not.toContain('車輛目前在租');
  });
});

/**
 * 批次 1 驗收 (b)：前一位客人逾時未還（MNO-345）時，同一台車下一筆預訂的取車提醒只寫
 * 「合約尚未簽署」，沒把「車還沒回來」擺在最前面。
 */
describe('CalendarViewComponent 前一位客人尚未還車（批次 1 驗收 b）', () => {
  const NOW = new Date(2026, 8, 23, 12, 0, 0);

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(previousEnd: Date) {
    return setupBatch3({
      now: NOW,
      date: new Date(2026, 8, 23),
      vehicles: [vehicleAt('v5', { plateNumber: 'MNO-345', status: 'rented' })],
      bookings: [
        booking('previous', {
          vehicleId: 'v5', status: 'in_progress',
          startTime: new Date(2026, 8, 20, 9).toISOString(), endTime: previousEnd.toISOString(),
        }),
        // 今天下午取車、合約還沒簽。
        booking('next', {
          vehicleId: 'v5', status: 'reserved',
          startTime: new Date(2026, 8, 23, 15).toISOString(), endTime: new Date(2026, 8, 25, 17).toISOString(),
        }),
      ],
    });
  }

  it('逾時未還：阻擋原因第一位是「前一位客人尚未還車」並寫出逾時多久，標籤也顯示它', () => {
    const { component, el } = setup(new Date(2026, 8, 22, 18, 0)); // 昨天 18:00 該還，逾時 18 小時
    const row = component.pickupWorkRows()[0];
    const blockers = component.blockersOf(row);

    expect(row.booking.id).toBe('next');
    expect(blockers[0].message).toBe('前一位客人尚未還車（逾時 18 小時 0 分）。');
    expect(blockers.map((b) => b.type)).toContain('latest_contract_unsigned');
    expect(blockers.some((b) => b.message.includes('車輛目前在租'))).toBe(false);
    // 打磨（4）：chip（readinessLabel／畫面上的 .work-list-row__readiness）拿掉句尾句號；
    // blockersOf() 的原始 message（展開清單用）不受影響，仍保留句號（上面已驗證過）。
    expect(component.readinessLabel(row)).toBe('前一位客人尚未還車（逾時 18 小時 0 分）');
    expect(el.querySelector('.work-list-row__readiness')?.textContent).toContain('前一位客人尚未還車（逾時 18 小時 0 分）');
    expect(el.querySelector('.work-list-row__readiness')?.textContent?.trim().endsWith('。')).toBe(false);
  });

  it('還沒到前一位客人的還車時間：一樣排第一，但不寫逾時', () => {
    const { component } = setup(new Date(2026, 8, 23, 14, 0));
    const row = component.pickupWorkRows()[0];

    expect(component.blockersOf(row)[0].message).toBe('前一位客人尚未還車。');
  });

  it('「前往處理」開前一位客人那筆訂單的交還車分頁（要處理的是那一筆）', () => {
    const { component } = setup(new Date(2026, 8, 22, 18, 0));
    const open = vi.spyOn(TestBed.inject(OrderDetailNavigation), 'open');
    const row = component.pickupWorkRows()[0];

    component.goHandleBlocker(row, component.blockersOf(row)[0]);

    expect(open).toHaveBeenCalledWith('previous', 'handover');
  });
});

describe('CalendarViewComponent 面板分頁標籤（3.4）', () => {
  const NOW = new Date(2026, 7, 10, 12, 0, 0);
  const TODAY = new Date(2026, 7, 10);

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    return setupBatch3({
      now: NOW,
      date: TODAY,
      vehicles: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].map((id) => vehicleAt(id)),
      bookings: [
        // 今天取車 2 筆，1 筆已取車。
        booking('p-reserved', {
          vehicleId: 'v1', startTime: new Date(2026, 7, 10, 10).toISOString(), endTime: new Date(2026, 7, 11, 10).toISOString(),
        }),
        booking('p-picked', {
          vehicleId: 'v2', status: 'in_progress',
          startTime: new Date(2026, 7, 10, 9).toISOString(), endTime: new Date(2026, 7, 12, 9).toISOString(),
        }),
        // 今天還車 2 筆（1 筆已還），另有前幾天逾時未還的 1 筆（列在今天的清單，不計入還車數）。
        booking('r-done', {
          vehicleId: 'v3', status: 'completed',
          startTime: new Date(2026, 7, 8, 9).toISOString(), endTime: new Date(2026, 7, 10, 8).toISOString(),
        }),
        booking('r-due', {
          vehicleId: 'v4', status: 'in_progress',
          startTime: new Date(2026, 7, 8, 9).toISOString(), endTime: new Date(2026, 7, 10, 15).toISOString(),
        }),
        booking('r-overdue', {
          vehicleId: 'v5', status: 'in_progress',
          startTime: new Date(2026, 7, 6, 9).toISOString(), endTime: new Date(2026, 7, 8, 18).toISOString(),
        }),
      ],
    });
  }

  function labels(el: HTMLElement): HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('.panel-tab-label'));
  }

  it('大字「取車 2」＋細字「已完成 1」；還車另外寫出警示色的「逾時 1」；可用只有數字', () => {
    const { component, el } = setup();
    const [pickup, ret, available] = labels(el);

    expect(pickup.querySelector('.panel-tab-label__title')?.textContent?.trim()).toBe('取車 2');
    expect(pickup.querySelector('.panel-tab-label__meta')?.textContent?.trim()).toBe('已完成 1');

    expect(ret.querySelector('.panel-tab-label__title')?.textContent?.trim()).toBe('還車 2');
    expect(ret.querySelector('.panel-tab-label__meta')?.textContent).toContain('已完成 1');
    expect(ret.querySelector('.panel-tab-label__overdue')?.textContent?.trim()).toBe('逾時 1');
    expect(component.returnWorkRows()).toHaveLength(3);

    expect(available.querySelector('.panel-tab-label__meta')).toBeNull();
    expect(available.textContent?.trim()).toBe(`可用 ${component.availableCount()}`);
  });

  it('沒有逾時未還時不顯示逾時', () => {
    const { fixture, component, el } = setup();

    component.selectDate(new Date(2026, 7, 12));
    fixture.detectChanges();

    expect(labels(el)[1].querySelector('.panel-tab-label__overdue')).toBeNull();
    expect(component.returnTabLabel().overdue).toBeNull();
  });
});

describe('CalendarViewComponent 需調度（3.3 月曆格、3.4 路線）', () => {
  const DAY = new Date(2026, 7, 4);

  function setup() {
    return setupBatch3({
      date: DAY,
      vehicles: [vehicleAt('v1', { location: 'mzg-store' }), vehicleAt('v2', { location: 'mzg-airport' })],
      bookings: [
        booking('dispatch', {
          vehicleId: 'v1', pickupLocation: 'mzg-airport',
          startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 5, 10).toISOString(),
        }),
        booking('in-place', {
          vehicleId: 'v2', pickupLocation: 'mzg-airport',
          startTime: new Date(2026, 7, 4, 11).toISOString(), endTime: new Date(2026, 7, 5, 11).toISOString(),
        }),
      ],
    });
  }

  it('取車列的需調度 chip 寫出路線「需調度 {所在據點}→{取車據點}」', () => {
    const { component, el } = setup();
    const row = component.pickupWorkRows().find((r) => r.booking.id === 'dispatch');

    expect(row && component.dispatchRouteLabel(row)).toBe('需調度 馬公中正門市→馬公機場櫃檯');
    const chips = Array.from(el.querySelectorAll('.work-list-row__dispatch'));
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain('需調度 馬公中正門市→馬公機場櫃檯');
    expect(chips[0].classList).toContain('ui-chip--warning');
  });

  it('月曆格顯示警示色「需調度 N」，N＝取車分頁的需調度數；沒有需調度的日子不顯示', () => {
    const { fixture, component } = setup();

    expect(component.statsOf(DAY).needsDispatch).toBe(component.pickupNeedsDispatchCount());
    const chip = dayCell(fixture, DAY)?.querySelector('.calendar-view__stat-chip--dispatch');
    expect(chip?.textContent?.trim()).toBe('需調度 1');
    expect(chip?.classList).toContain('ui-chip--warning');
    expect(dayCell(fixture, new Date(2026, 7, 5))?.querySelector('.calendar-view__stat-chip--dispatch')).toBeNull();
  });
});

/**
 * 打磨（4）：月曆格「還 N」與「需調度 N」先前都是黃色系警示色，並排時分不出哪個要處理。
 * 「需調度」要是月曆格裡唯一的警示色；「還 N」改成中性色調，跟「取 N」同一層級的日常資訊。
 */
describe('CalendarViewComponent 月曆格顏色層級（打磨 4：還 N 改中性、需調度 N 維持警示）', () => {
  const DAY = new Date(2026, 7, 4);

  function setup() {
    return setupBatch3({
      date: DAY,
      vehicles: [vehicleAt('v1', { location: 'mzg-store' }), vehicleAt('v2')],
      bookings: [
        // 需調度：取車據點跟車輛所在據點不同。
        booking('dispatch', {
          vehicleId: 'v1', pickupLocation: 'mzg-airport',
          startTime: new Date(2026, 7, 4, 10).toISOString(), endTime: new Date(2026, 7, 6, 10).toISOString(),
        }),
        // 同一天還車：讓「還 N」也顯示在同一格，跟「需調度 N」並排比較色調。
        booking('return', {
          vehicleId: 'v2', status: 'in_progress',
          startTime: new Date(2026, 7, 2, 9).toISOString(), endTime: new Date(2026, 7, 4, 12).toISOString(),
        }),
      ],
    });
  }

  it('「還 N」用中性色調（不是 warning），「需調度 N」維持警示色，兩者並排時分得出哪個要處理', () => {
    const { fixture } = setup();
    const cell = dayCell(fixture, DAY);
    const chips = Array.from(cell?.querySelectorAll('.calendar-view__stat-chip') ?? []);

    // 同一天「取 1」（pickups）與「還 1」都會出現；用文字前綴明確找出「還 N」那顆，
    // 不能單靠「不是 --dispatch」排除（取的 chip 一樣不是 --dispatch）。
    const returnChip = chips.find((c) => c.textContent?.trim().startsWith(ZH_TW.dispatch.returns));
    expect(returnChip?.textContent?.trim()).toBe('還 1');
    expect(returnChip?.classList).toContain('ui-chip--neutral');
    expect(returnChip?.classList).not.toContain('ui-chip--warning');

    const dispatchChip = cell?.querySelector('.calendar-view__stat-chip--dispatch');
    expect(dispatchChip?.textContent?.trim()).toBe('需調度 1');
    expect(dispatchChip?.classList).toContain('ui-chip--warning');
  });
});

describe('CalendarViewComponent 月曆格「可用 N」（3.3）', () => {
  const NOW = new Date(2026, 8, 23, 12, 0, 0);
  const on = (day: number, vehicleId: string, id: string) =>
    booking(id, {
      vehicleId,
      startTime: new Date(2026, 8, day, 9).toISOString(),
      endTime: new Date(2026, 8, day, 18).toISOString(),
    });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    return setupBatch3({
      now: NOW,
      date: new Date(2026, 8, 23),
      vehicles: [vehicleAt('v1'), vehicleAt('v2'), vehicleAt('v3')],
      bookings: [
        on(24, 'v1', 'b24'),
        on(25, 'v1', 'b25a'),
        on(25, 'v2', 'b25b'),
        on(26, 'v1', 'b26a'),
        on(26, 'v2', 'b26b'),
        on(26, 'v3', 'b26c'),
      ],
    });
  }

  function availableOf(
    fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>,
    day: number,
  ): HTMLElement | null | undefined {
    return dayCell(fixture, new Date(2026, 8, day))?.querySelector<HTMLElement>('.calendar-view__available');
  }

  it('平常是淡色純文字（不是膠囊），可用數 ≤ 1 才轉警示色', () => {
    const { fixture, el } = setup();

    expect(availableOf(fixture, 23)?.textContent?.trim()).toBe('可用 3');
    expect(availableOf(fixture, 24)?.textContent?.trim()).toBe('可用 2');
    for (const day of [23, 24]) {
      const available = availableOf(fixture, day);
      expect(available?.classList).not.toContain('calendar-view__available--low');
      expect(available?.classList).not.toContain('ui-chip');
    }
    expect(availableOf(fixture, 25)?.textContent?.trim()).toBe('可用 1');
    expect(availableOf(fixture, 25)?.classList).toContain('calendar-view__available--low');
    expect(availableOf(fixture, 26)?.textContent?.trim()).toBe('可用 0');
    expect(availableOf(fixture, 26)?.classList).toContain('calendar-view__available--low');
    // 原本每格都有的綠色「可用」膠囊拿掉了。
    expect(el.querySelector('.calendar-view__grid .ui-chip--positive')).toBeNull();
  });

  it('過去的日子不顯示可用數（今天照常顯示）', () => {
    const { fixture } = setup();

    expect(availableOf(fixture, 22)).toBeNull();
    expect(availableOf(fixture, 1)).toBeNull();
    expect(availableOf(fixture, 23)).not.toBeNull();
  });
});

describe('CalendarViewComponent 可用分頁（3.2）', () => {
  const NOW = new Date(2026, 8, 23, 12, 0, 0);

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    const ctx = setupBatch3({
      now: NOW,
      date: new Date(2026, 8, 23),
      vehicles: [
        vehicleAt('car-1', { location: 'mzg-airport' }),
        vehicleAt('car-2', { location: 'mzg-port' }),
        vehicleAt('scooter-1', { category: 'scooter', location: 'mzg-store' }),
        vehicleAt('car-maint', { status: 'maintenance' }),
      ],
      bookings: [
        // 9/24 10:00 起被訂走：只租到 9/24 09:00 時可以租，租到 9/25 就不行。
        booking('car-2-booked', {
          vehicleId: 'car-2',
          startTime: new Date(2026, 8, 24, 10).toISOString(), endTime: new Date(2026, 8, 24, 18).toISOString(),
        }),
      ],
    });
    openPanelTab(ctx.fixture, 2);
    return ctx;
  }

  function rows(el: HTMLElement): HTMLButtonElement[] {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('app-available-vehicle-list .avl__row'));
  }

  function tabTitle(el: HTMLElement): string {
    return el.querySelectorAll('.panel-tab-label')[2]?.textContent?.trim() ?? '';
  }

  it('從選取日 09:00 起租，還車日預設隔天 09:00；上方寫出「{選取日} 起租」', () => {
    const { component, el } = setup();

    expect(component.returnDateKey()).toBe('2026-09-24');
    expect(component.availableStart()).toBe('2026-09-23T09:00');
    expect(component.availableEnd()).toBe('2026-09-24T09:00');
    expect(el.querySelector('.available-panel__start')?.textContent?.trim()).toBe('2026/09/23 起租');
    const input = el.querySelector<HTMLInputElement>('.available-panel__return-date');
    expect(input?.value).toBe('2026-09-24');
    expect(input?.min).toBe('2026-09-24');
  });

  it('分頁標籤數字＝清單列數；換還車日、換車型都跟著變', () => {
    const { fixture, component, el } = setup();

    expect(rows(el)).toHaveLength(3); // car-1、car-2、scooter-1（保養中的不算）
    expect(tabTitle(el)).toBe('可用 3');

    const input = el.querySelector<HTMLInputElement>('.available-panel__return-date');
    if (!input) throw new Error('找不到還車日欄位');
    input.value = '2026-09-25';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.returnDateKey()).toBe('2026-09-25');
    expect(rows(el)).toHaveLength(2); // car-2 9/24 被訂走
    expect(tabTitle(el)).toBe('可用 2');

    component.availableCategory.set('car');
    fixture.detectChanges();
    expect(rows(el)).toHaveLength(1);
    expect(tabTitle(el)).toBe('可用 1');
    expect(component.availableCount()).toBe(rows(el).length);
  });

  it('還車日不可早於起租隔天：填更早的日子或清空，都回到最早可選的那天', () => {
    const { fixture, component, el } = setup();
    const input = el.querySelector<HTMLInputElement>('.available-panel__return-date');
    if (!input) throw new Error('找不到還車日欄位');

    input.value = '2026-09-22';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.returnDateKey()).toBe('2026-09-24');
    expect(input.value).toBe('2026-09-24');

    input.value = '';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.returnDateKey()).toBe('2026-09-24');
  });

  it('換選取日時還車日回到新選取日的隔天，車型篩選保留', () => {
    const { fixture, component } = setup();
    component.availableCategory.set('scooter');
    component.returnDateKey.set('2026-09-30');

    component.selectDate(new Date(2026, 8, 26));
    fixture.detectChanges();

    expect(component.returnDateKey()).toBe('2026-09-27');
    expect(component.minReturnDateKey()).toBe('2026-09-27');
    expect(component.availableCategory()).toBe('scooter');
    expect(component.panelTab()).toBe('available');
  });

  it('點一台車 → 前往 /orders/new，帶入車與起訖（建單頁讀得到 09:00 起訖）', () => {
    const { fixture, el, navigate } = setup();
    const input = el.querySelector<HTMLInputElement>('.available-panel__return-date');
    if (!input) throw new Error('找不到還車日欄位');
    input.value = '2026-09-26';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    rows(el)[0].click();

    const queryParams = {
      vehicleId: 'car-1',
      start: new Date(2026, 8, 23, 9).toISOString(),
      end: new Date(2026, 8, 26, 9).toISOString(),
    };
    expect(navigate).toHaveBeenCalledWith(['/orders/new'], { queryParams });
    const initial = orderInitialFromQuery(convertToParamMap(queryParams), [vehicleAt('car-1')]);
    expect(initial.vehicleId).toBe('car-1');
    expect(toLocalInputValue(initial.startTime ?? '')).toBe('2026-09-23T09:00');
    expect(toLocalInputValue(initial.endTime ?? '')).toBe('2026-09-26T09:00');
  });

  it('選取日在過去：只顯示一行說明，不列清單，標籤只寫「可用」', () => {
    const { fixture, component, el } = setup();

    component.selectDate(new Date(2026, 8, 22));
    fixture.detectChanges();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();

    expect(component.isSelectedPast()).toBe(true);
    expect(component.availableCount()).toBeNull();
    expect(el.querySelector('.available-panel__past')?.textContent?.trim()).toBe('無法查詢過去日期的可租車輛');
    expect(el.querySelector('app-available-vehicle-list')).toBeNull();
    expect(tabTitle(el)).toBe('可用');
  });
});

describe('CalendarViewComponent 月曆｜時間軸切換（3.5）', () => {
  function setup() {
    return setupBatch3({ date: new Date(2026, 7, 4), vehicles: [vehicleAt('v1')] });
  }

  function switchButton(el: HTMLElement, label: string): HTMLButtonElement | undefined {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('.calendar-view__view-switch button')).find((b) =>
      b.textContent?.includes(label),
    );
  }

  it('切到時間軸：同一張卡片內換成時間軸（以選取日為準），右側面板照舊；換月鈕收起、「今天」保留', () => {
    const { fixture, component, el } = setup();
    const emitted: string[] = [];
    // model() 的變更就是 (viewChange) 輸出；總覽靠它把檢視寫進網址。
    component.view.subscribe((v) => emitted.push(v));

    switchButton(el, '時間軸')?.click();
    fixture.detectChanges();

    expect(component.view()).toBe('timeline');
    expect(emitted).toEqual(['timeline']);
    expect(switchButton(el, '時間軸')?.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.calendar-view__grid')).toBeNull();
    expect(el.querySelector('.calendar-view__weekday-row')).toBeNull();
    expect(el.querySelector('.responsive-panel__body')).not.toBeNull();
    expect(el.querySelector('[aria-label="上月"]')).toBeNull();
    expect(el.querySelector('[aria-label="下月"]')).toBeNull();
    const toolbarText = el.querySelector('.calendar-view__toolbar')?.textContent ?? '';
    expect(toolbarText).toContain('今天');

    const timeline = fixture.debugElement.query(By.directive(TimelineViewComponent))
      ?.componentInstance as TimelineViewComponent | undefined;
    expect(timeline?.targetDate()).toEqual(new Date(2026, 7, 4));
  });

  it('時間軸模式按「今天」：選取日與時間軸都回到今天', () => {
    const { fixture, component, el } = setup();
    component.setView('timeline');
    fixture.detectChanges();

    component.goToToday();
    fixture.detectChanges();

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const timeline = fixture.debugElement.query(By.directive(TimelineViewComponent))
      ?.componentInstance as TimelineViewComponent | undefined;
    expect(component.selected()).toEqual(todayStart);
    expect(timeline?.targetDate()).toEqual(todayStart);
    expect(el.querySelector('.responsive-panel__body')).not.toBeNull();
  });

  it('時間軸上點日期欄：選取那天，時間軸與右側面板都跟著換', () => {
    const { fixture, component, el } = setup();
    component.setView('timeline');
    fixture.detectChanges();

    const timeline = fixture.debugElement.query(By.directive(TimelineViewComponent))
      .componentInstance as TimelineViewComponent;
    timeline.dateSelect.emit(new Date(2026, 7, 6, 15, 30));
    fixture.detectChanges();

    expect(component.selected()).toEqual(new Date(2026, 7, 6));
    expect(timeline.targetDate()).toEqual(new Date(2026, 7, 6));
    expect(el.querySelector('.responsive-panel__body')).not.toBeNull();
  });

  it('切回月曆：格線與換月鈕回來', () => {
    const { fixture, el } = setup();
    switchButton(el, '時間軸')?.click();
    fixture.detectChanges();

    switchButton(el, '月曆')?.click();
    fixture.detectChanges();

    expect(el.querySelector('.calendar-view__grid')).not.toBeNull();
    expect(el.querySelector('[aria-label="上月"]')).not.toBeNull();
    expect(el.querySelector('app-timeline-view')).toBeNull();
  });
});
