import { describe, expect, it, vi } from 'vitest';
import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
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
import { HeaderToolbarSlot } from '../../../layout/header/header-toolbar-slot';

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
 * calendar-view.spec.ts 的 provideOrderDetailRepos()。
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
  ];
}

describe('DashboardPageComponent child date contract', () => {
  function createFixture(bookings: RentalBooking[] = []) {
    TestBed.configureTestingModule({
      providers: [
        ...providePricing(),
        ...provideOrderDetailRepos(),
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

  it('在月曆上換日期（經總覽繞回來）保留面板目前的分頁；總覽另外指定日期才切回取車', () => {
    const fixture = createFixture();
    const child = fixture.debugElement.query(By.directive(CalendarViewComponent))
      .componentInstance as CalendarViewComponent;

    child.onPanelTabIndexChange(2);
    child.selectDate(new Date(2026, 7, 4));
    fixture.detectChanges();
    expect(fixture.componentInstance.targetDate()).toEqual(new Date(2026, 7, 4));
    expect(child.panelTab()).toBe('available');

    fixture.componentInstance.targetDate.set(new Date(2026, 7, 20));
    fixture.detectChanges();
    expect(child.selected()).toEqual(new Date(2026, 7, 20));
    expect(child.panelTab()).toBe('pickup');
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
        ...provideOrderDetailRepos(),
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
      // 1.2：尚未取車的預訂到了還車日也列入當天還車統計（標「尚未取車」），不再排除。
      mk({ id: 'not_picked_up', endTime: at(today, 15), status: 'reserved' }),
      mk({ id: 'cancelled', endTime: at(today, 9), status: 'cancelled' }),
      mk({ id: 'tomorrow', endTime: at(tomorrow, 9), status: 'in_progress' }),
    ]);

    expect(component.todayReturnTotal()).toBe(3);
    expect(component.todayReturnDone()).toBe(1);
    expect(component.todayReturnPending()).toBe(2);
    expect(component.todayPendingPrepCount()).toBe(1);
  });
});


/** 共用 providers：總覽內嵌的月曆／時間軸需要的 store 與 repo 全部備齊；路由由各測試自己給。 */
function dashboardProviders(bookings: RentalBooking[] = []) {
  return [
    ...providePricing(),
    ...provideOrderDetailRepos(),
    provideNativeDateAdapter(),
    { provide: MatDialog, useValue: { open: () => undefined } },
    { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
    { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
    { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
    { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
  ];
}

/** 頁首按鈕登記在 HeaderToolbarSlot、平常由 HeaderComponent 渲染；測試用一個最小的宿主把它畫出來。 */
@Component({
  imports: [NgTemplateOutlet],
  template: '<ng-container [ngTemplateOutlet]="slot.template()" />',
})
class HeaderToolbarHostComponent {
  readonly slot = inject(HeaderToolbarSlot);
}

describe('DashboardPageComponent 頁首', () => {
  const today = new Date();
  const at = (hour: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour).toISOString();

  function renderToolbar(bookings: RentalBooking[] = []) {
    TestBed.configureTestingModule({ providers: [...dashboardProviders(bookings), provideRouter([])] });
    const page = TestBed.createComponent(DashboardPageComponent);
    page.detectChanges();
    const host = TestBed.createComponent(HeaderToolbarHostComponent);
    host.detectChanges();
    return { page, el: host.nativeElement as HTMLElement };
  }

  it('「新增訂單」是唯一的實心主按鈕；待整備、待保養改成外框按鈕並保留徽章', () => {
    // 今天有一筆已還車 → 待整備 1。
    const { el } = renderToolbar([
      {
        id: 'returned', vehicleId: 'v1', memberId: 'c1', startTime: at(8), endTime: at(10),
        pickupLocation: '', returnLocation: '', status: 'completed', depositRequired: 0,
      },
    ]);

    const filled = Array.from(el.querySelectorAll('.mat-mdc-unelevated-button'));
    expect(filled).toHaveLength(1);
    expect(filled[0].textContent).toContain('新增訂單');
    expect(filled[0].getAttribute('href')).toBe('/orders/new');
    expect(el.querySelector('.mat-tonal-button')).toBeNull();

    const queues = Array.from(el.querySelectorAll<HTMLElement>('.dashboard-queue'));
    expect(queues.map((q) => q.textContent)).toEqual([
      expect.stringContaining('待整備'),
      expect.stringContaining('待保養'),
    ]);
    for (const queue of queues) {
      expect(queue.classList).toContain('mat-mdc-outlined-button');
    }
    expect(queues[0].querySelector('.mat-badge-content')?.textContent?.trim()).toBe('1');
  });

  it('搜尋框提示文字寫出能搜什麼：姓名、電話、車牌', () => {
    const { el } = renderToolbar();

    expect(el.querySelector('input.search__input')?.getAttribute('placeholder')).toBe(
      '搜尋訂單：姓名、電話、車牌',
    );
  });

  // 1.4：總覽頁首放大鏡送出後導到訂單列表，帶入關鍵字讓訂單列表預填搜尋。
  it('onSearchSubmit 導向 /bookings，query params 帶入關鍵字', () => {
    const { page } = renderToolbar();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    page.componentInstance.onSearchSubmit('林美惠');

    expect(navigate).toHaveBeenCalledWith(['/bookings'], { queryParams: { q: '林美惠' } });
  });

  // 3.1：上方的建單搜尋卡（車型＋租期＋選車小窗）拿掉了，月曆卡片直接接在頁首下面。
  it('總覽不再有建單搜尋卡，第一個區塊就是月曆卡片', () => {
    const { page } = renderToolbar();
    const container = (page.nativeElement as HTMLElement).querySelector('.shell-container');

    expect(container?.querySelector('app-date-step')).toBeNull();
    expect(container?.firstElementChild?.tagName.toLowerCase()).toBe('app-calendar-view');
  });
});

describe('DashboardPageComponent 月曆｜時間軸切換（3.5）', () => {
  async function openDashboard(url: string) {
    TestBed.configureTestingModule({
      providers: [...dashboardProviders(), provideRouter([{ path: '', component: DashboardPageComponent }])],
    });
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl(url, DashboardPageComponent);
    harness.detectChanges();
    const calendar = harness.fixture.debugElement.query(By.directive(CalendarViewComponent))
      .componentInstance as CalendarViewComponent;
    return { harness, page, calendar, router: TestBed.inject(Router) };
  }

  function viewButton(harness: RouterTestingHarness, label: string): HTMLButtonElement | undefined {
    const root = harness.fixture.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll<HTMLButtonElement>('.calendar-view__view-switch button')).find(
      (b) => b.textContent?.includes(label),
    );
  }

  it('網址帶 ?view=timeline 時直接顯示時間軸（重新整理後保留）', async () => {
    const { harness, page, calendar } = await openDashboard('/?view=timeline');
    const root = harness.fixture.nativeElement as HTMLElement;

    expect(page.view()).toBe('timeline');
    expect(calendar.view()).toBe('timeline');
    expect(root.querySelector('app-timeline-view')).not.toBeNull();
    expect(root.querySelector('.calendar-view__grid')).toBeNull();
  });

  it('沒有參數（或參數不認得）時是月曆', async () => {
    const { harness, page } = await openDashboard('/?view=nope');

    expect(page.view()).toBe('calendar');
    expect((harness.fixture.nativeElement as HTMLElement).querySelector('.calendar-view__grid')).not.toBeNull();
  });

  it('切到時間軸會把 view=timeline 寫進網址；切回月曆就把參數拿掉', async () => {
    const { harness, router } = await openDashboard('/');

    viewButton(harness, '時間軸')?.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe('/?view=timeline');
    expect((harness.fixture.nativeElement as HTMLElement).querySelector('app-timeline-view')).not.toBeNull();

    viewButton(harness, '月曆')?.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe('/');
    expect((harness.fixture.nativeElement as HTMLElement).querySelector('.calendar-view__grid')).not.toBeNull();
  });
});
