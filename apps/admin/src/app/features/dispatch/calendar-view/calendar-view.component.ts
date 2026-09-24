import { Component, computed, effect, inject, input, linkedSignal, model, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ResponsivePanelComponent } from '@car-rental/ui';
import { contractSigningState } from '@car-rental/domain';
import {
  branchName,
  IdentityDocumentType,
  Member,
  MemberKind,
  needsDispatch as computeNeedsDispatch,
  PickupBlocker,
  PickupBlockerType,
  PickupReadiness,
  PickupReadinessInput,
  PickupWarning,
  PickupWarningType,
  ReciprocityStatus,
  RentalBooking,
  ReminderState,
  ReminderStatus,
  VEHICLE_CATEGORIES,
  Vehicle,
  VehicleCategory,
  vehicleAvailability,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { addDays, fmtDate, isSameDay, startOfDay } from '../../../core/date-utils';
import { TwdPipe } from '../../../shared/pipes/twd.pipe';
import { REMINDER_STATUS_REPO } from '../../../core/repositories/tokens';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { PricingStore } from '../../../stores/pricing/pricing.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { HandoverStore } from '../../../stores/handover/handover.store';
import { PrepStore } from '../../../stores/prep/prep.store';
import { OrderDetailNavigation } from '../../orders/navigation/order-detail-navigation';
import { OrderDetailSection } from '../../orders/navigation/order-detail-sections';
import { AvailableVehicleListComponent } from '../available-vehicle-list/available-vehicle-list.component';
import { RENTAL_AVAILABILITY } from '../available-vehicle-list/rental-availability';
import { DEFAULT_RENTAL_TIME, composeLocal, rentalPeriodOf, toDateKey } from '../available-vehicle-list/rental-period';
import { TimelineViewComponent } from '../timeline-view/timeline-view.component';

const NARROW_QUERY = '(max-width: 1280px)';

/** 代入 `{name}` 形式的佔位字（同 common.selectedCount 的寫法）。 */
function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

/**
 * 打磨（4）：取車列阻擋 chip 顯示用——把完整句子尾端的句號拿掉（例如「前一位客人尚未還車
 * （逾時 24 小時 46 分）。」→「…46 分）」）。evaluate-pickup-readiness.ts 的每一則 blocker
 * message 都是寫給「完整句子」情境的（例如展開的阻擋清單 work-list-severity，那裡仍保留句號），
 * 這裡只處理塞進小圓角 chip 時的顯示，不改原始文案本身。
 */
function stripTrailingPeriod(text: string): string {
  return text.endsWith('。') ? text.slice(0, -1) : text;
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** 3.5：總覽月曆卡片的兩種檢視，共用右側面板。 */
export type CalendarViewMode = 'calendar' | 'timeline';

/** 檢視方式記在網址上的參數名（`?view=timeline`），重新整理後保留；月曆是預設值，不寫進網址。 */
export const CALENDAR_VIEW_PARAM = 'view';

export function parseCalendarViewMode(raw: string | null): CalendarViewMode {
  return raw === 'timeline' ? 'timeline' : 'calendar';
}

/**
 * 依會員類型推導本次取車必須查核的身分文件種類：本國人查身分證、居留證者查居留證、外國旅客查護照。
 * 與 handover-panel.component.ts 內的同名函式邏輯一致——兩處都需要從 Member.kind 推導查核種類，
 * 但這裡是工作清單摘要的就緒判斷輸入，不是實際辦理取車的表單，刻意各自維護一份簡短版本，
 * 不把 handover-panel（不在本任務檔案清單內）拉進來共用。
 */
function requiredIdentityDocumentKind(memberKind: MemberKind | undefined): IdentityDocumentType {
  if (memberKind === 'foreign_visitor') return 'passport';
  if (memberKind === 'resident') return 'resident_permit';
  return 'taiwan_id';
}

/** 同一 memberId 底下同種文件／駕駛資格可能有多個版本，永遠取版本號最大的那筆。 */
function latestByVersion<T extends { version: number }>(items: T[]): T | undefined {
  return items.reduce<T | undefined>(
    (latest, item) => (!latest || item.version > latest.version ? item : latest),
    undefined,
  );
}

/** PickupDriverCredential.reciprocityStatus 沒有 'manual_review'，尚未確認一律視同 pending。 */
function toPickupReciprocityStatus(status: ReciprocityStatus): 'pending' | 'eligible' | 'ineligible' {
  return status === 'manual_review' ? 'pending' : status;
}

/**
 * 1.2：月曆格與右側面板取／還數字的共用定義——會佔用車輛的有效訂單（reserved／in_progress）
 * ＋已完成（completed），排除已取消（cancelled）。資料模型沒有「尚未成立」的前置階段
 * （CONTEXT.md「訂單」：建立當下就成立），所以「排除尚未成立者」在這裡沒有對應狀態要處理。
 */
const COUNTED: RentalBooking['status'][] = ['reserved', 'in_progress', 'completed'];

/** 每種取車阻擋／提醒對應該去訂單詳情哪個分頁處理，供「前往處理」動作使用。 */
const BLOCKER_SECTION: Record<PickupBlockerType, OrderDetailSection> = {
  deposit_below_threshold: 'payments',
  latest_contract_unsigned: 'contract',
  required_document_missing_or_expired: 'documents',
  foreign_reciprocity_or_vehicle_class_mismatch: 'documents',
  original_document_not_confirmed: 'handover',
  vehicle_not_deliverable: 'overview',
};

const WARNING_SECTION: Record<PickupWarningType, OrderDetailSection> = {
  missing_email: 'overview',
  low_confidence_ocr: 'documents',
  document_near_expiry: 'documents',
  special_note: 'overview',
};

/** 顯示提醒狀態時的優先序：同一筆訂單可能有兩筆排程（24hr/2hr），取「最值得留意」的那個。 */
const REMINDER_STATE_PRECEDENCE: ReminderState[] = [
  'sent',
  'failed',
  'missing_email',
  'scheduled',
  'pending_schedule',
];

interface WorkListRow {
  id: string;
  booking: RentalBooking;
  kind: 'pickup' | 'return';
}

type PanelTab = 'pickup' | 'return' | 'available';
const PANEL_TABS: PanelTab[] = ['pickup', 'return', 'available'];

/** 3.3：月曆格「可用 N」在這個數量（含）以下改用警示色，提醒這天快沒車可租了。 */
export const LOW_AVAILABILITY_THRESHOLD = 1;

/** 1.3：某一天可租車輛清單——月曆「可用 N」用 libs/domain 的 vehicleAvailability（會扣掉保養中的車），
 *  不是月曆自己另外用「總車數－當天佔用」土法算一次。面板「可用」分頁（3.2）與建單第 1 步（2.3）
 *  的可租清單也是同一個函式，只是期間換成「起租日 09:00 到還車日 09:00」。 */
function vehiclesAvailableOn(vehicles: Vehicle[], bookings: RentalBooking[], day: Date): Vehicle[] {
  const dayStart = startOfDay(day);
  return vehicleAvailability(vehicles, {
    startTime: dayStart.toISOString(),
    endTime: addDays(dayStart, 1).toISOString(),
    bookings,
  }).available;
}

/**
 * 需調度（CONTEXT.md「需調度」）：取車據點與車輛所在據點不同。只有尚未取車（reserved）的訂單
 * 車輛還沒被取走，才可能需要事先調度；已取車／已完成／已取消的訂單這件事已成定局或不再相關。
 * 月曆格「需調度 N」與面板取車分頁的需調度標記、篩選都用這一個判斷。
 */
export function bookingNeedsDispatch(booking: RentalBooking, vehicle: Vehicle | undefined): boolean {
  if (booking.status !== 'reserved') return false;
  return computeNeedsDispatch(vehicle?.location, booking.pickupLocation);
}

export interface DayStats {
  pickups: number;
  returns: number;
  available: number;
  /** 3.3：當天取車清單中需調度的筆數（與取車分頁的「只看需調度（N）」同一個數字）。 */
  needsDispatch: number;
}

/**
 * 1.2／1.3／3.3：月曆格「取 N／還 N／需調度 N／可用 N」——直接沿用 pickupProgress／
 * returnProgress／bookingNeedsDispatch／vehiclesAvailableOn，確保月曆格與右側面板永遠是同一份數字。
 */
export function dayStats(bookings: RentalBooking[], vehicles: Vehicle[], day: Date): DayStats {
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  return {
    pickups: pickupProgress(bookings, day).total,
    returns: returnProgress(bookings, day).total,
    available: vehiclesAvailableOn(vehicles, bookings, day).length,
    needsDispatch: bookings.filter(
      (b) => isSameDay(new Date(b.startTime), day) && bookingNeedsDispatch(b, vehicleById.get(b.vehicleId)),
    ).length,
  };
}

export interface DayProgress {
  total: number;
  done: number;
  pending: number;
}

/** 取車進度：某天取車時間（startTime）落在當天、且訂單有效（COUNTED）的筆數；
 *  done＝已經不是 reserved（in_progress／completed 都代表車已經被取走）。 */
export function pickupProgress(bookings: RentalBooking[], day: Date): DayProgress {
  const relevant = bookings.filter(
    (b) => isSameDay(new Date(b.startTime), day) && COUNTED.includes(b.status),
  );
  const done = relevant.filter((b) => b.status !== 'reserved').length;
  return { total: relevant.length, done, pending: relevant.length - done };
}

/**
 * 還車進度（1.2 修正）：某天還車時間（endTime）落在當天、且訂單有效（COUNTED）的筆數——
 * 這裡刻意把 reserved 也算進來：尚未取車的預訂到了還車日，一樣要出現在當天的還車清單裡
 * （標「尚未取車」，不提供「辦理還車」），不能像先前那樣完全不計。
 * done 只計 completed（真正已辦理還車完成）；in_progress 即使已逾期，也還是「未完成」；
 * reserved（尚未取車）自然也算未完成。
 */
export function returnProgress(bookings: RentalBooking[], day: Date): DayProgress {
  const relevant = bookings.filter(
    (b) => isSameDay(new Date(b.endTime), day) && COUNTED.includes(b.status),
  );
  const done = relevant.filter((b) => b.status === 'completed').length;
  return { total: relevant.length, done, pending: relevant.length - done };
}

@Component({
  selector: 'app-calendar-view',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    ResponsivePanelComponent,
    AvailableVehicleListComponent,
    TimelineViewComponent,
    TwdPipe,
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss', '../../../app.scss'],
})
export class CalendarViewComponent {
  protected readonly t = ZH_TW;
  private bookingStore = inject(BookingStore);
  private vehicleStore = inject(VehicleStore);
  private pricingStore = inject(PricingStore);
  readonly memberStore = inject(MemberStore);
  readonly isSameDay = isSameDay;

  private readonly router = inject(Router);
  private readonly orderDetail = inject(OrderDetailNavigation);
  private readonly availability = inject(RENTAL_AVAILABILITY);
  private readonly paymentStore = inject(PaymentStore);
  private readonly documentStore = inject(DocumentStore);
  private readonly contractStore = inject(ContractStore);
  private readonly handoverStore = inject(HandoverStore);
  private readonly prepStore = inject(PrepStore);
  private readonly reminderRepo = inject(REMINDER_STATUS_REPO);
  private readonly reminderStatuses = signal<ReminderStatus[]>(this.reminderRepo.getAll());

  readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly selected = signal<Date | null>(null);
  readonly panelDismissed = signal(true);
  readonly panelTab = signal<PanelTab>('pickup');
  readonly targetDate = input<Date>(startOfDay(new Date()));
  readonly dateSelected = output<Date>();
  /** 3.5：月曆或時間軸；總覽把它記在網址（`?view=timeline`）。 */
  readonly view = model<CalendarViewMode>('calendar');
  readonly todayDate = new Date();
  private readonly today = startOfDay(this.todayDate);

  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly isNarrow = toSignal(
    this.breakpointObserver.observe([NARROW_QUERY]).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  readonly monthLabel = computed(
    () => `${this.month().getFullYear()} / ${this.month().getMonth() + 1}`,
  );

  readonly monthDays = computed(() => {
    const first = this.month();
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  });

  readonly panelOpen = computed(
    () => this.selected() !== null && (!this.isNarrow() || !this.panelDismissed()),
  );

  readonly panelTabIndex = computed(() => PANEL_TABS.indexOf(this.panelTab()));

  onPanelTabIndexChange(index: number): void {
    this.panelTab.set(PANEL_TABS[index] ?? 'pickup');
  }

  readonly panelHeading = computed(() => {
    const sel = this.selected();
    return sel
      ? `${sel.getMonth() + 1}/${sel.getDate()} 星期${this.t.dispatch.weekdays[sel.getDay()]}`
      : '';
  });

  readonly relativeDayLabel = computed(() => {
    const sel = this.selected();
    if (!sel) return null;
    const today = startOfDay(this.todayDate);
    if (isSameDay(sel, today)) return '今天';
    if (isSameDay(sel, addDays(today, 1))) return '明天';
    if (isSameDay(sel, addDays(today, 2))) return '後天';
    return null;
  });

  /** 自己 emit 出去、預期會由 targetDate 繞回來的日期；用來辨識 effect 收到的是不是回音。 */
  private lastEmitted: number | null = null;

  constructor() {
    let isFirstRun = true;
    effect(() => {
      const date = startOfDay(this.targetDate());
      // 只有「外部」指定的日期才自動把面板叫出來、切回取車分頁；自己 emit 繞回來的不算，
      // 否則 goToToday 想保持面板收起、或使用者停在「可用」分頁換日期，都會被這裡覆蓋掉。
      const isEcho = this.lastEmitted === date.getTime();
      this.lastEmitted = null;
      this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
      this.selected.set(date);
      if (!isEcho) {
        this.panelTab.set('pickup');
      }
      if (!isFirstRun && !isEcho) {
        this.panelDismissed.set(false);
      }
      isFirstRun = false;
    });
  }

  private emitSelection(date: Date): void {
    this.lastEmitted = date.getTime();
    this.dateSelected.emit(date);
  }

  /**
   * 3.4：換月不關面板。原本選的日子不在新月份時，改選新月份的 1 日（新月份包含今天就選今天），
   * 面板與目前分頁都保留，窄螢幕面板原本收著就繼續收著。
   */
  shiftMonth(n: number): void {
    const m = this.month();
    const next = new Date(m.getFullYear(), m.getMonth() + n, 1);
    this.month.set(next);
    const sel = this.selected();
    if (sel && isSameMonth(sel, next)) return;
    const target = isSameMonth(this.today, next) ? this.today : next;
    this.selected.set(target);
    this.emitSelection(target);
  }

  /** 只把格線定位／選取到今天，不叫出面板（窄螢幕面板是覆蓋式的，會擋住日曆）。 */
  goToToday(): void {
    const today = startOfDay(this.todayDate);
    this.month.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selected.set(today);
    this.panelDismissed.set(true);
    this.emitSelection(today);
  }

  dismissPanel(): void {
    this.panelDismissed.set(true);
  }

  /** 換選取日時保留目前的分頁（例如停在「可用」分頁逐日比較），只有外部指定日期才切回取車。 */
  selectDate(date: Date): void {
    const normalized = startOfDay(date);
    this.selected.set(normalized);
    this.panelDismissed.set(false);
    this.emitSelection(normalized);
  }

  setView(view: CalendarViewMode): void {
    this.view.set(view);
  }

  /** 時間軸以選取日為準（3.5）；還沒有選取日時用今天。 */
  readonly timelineDate = computed(() => this.selected() ?? this.today);

  statsOf(d: Date): DayStats {
    return dayStats(this.bookingStore.bookings(), this.vehicleStore.vehicles(), d);
  }

  /** 3.3：今天以前的日子（不含今天）。過去的日子不顯示可用數。 */
  isPast(d: Date): boolean {
    return startOfDay(d).getTime() < this.today.getTime();
  }

  isLowAvailability(stats: DayStats): boolean {
    return stats.available <= LOW_AVAILABILITY_THRESHOLD;
  }

  readonly selectedPickupProgress = computed(() =>
    pickupProgress(this.bookingStore.bookings(), this.selected() ?? this.todayDate),
  );

  readonly selectedReturnProgress = computed(() =>
    returnProgress(this.bookingStore.bookings(), this.selected() ?? this.todayDate),
  );

  /**
   * 取車／還車工作清單的候選集合（1.2）：reserved、in_progress 與 completed——與 pickupProgress／
   * returnProgress 同一份定義，所以分頁標籤的「取車 N」「還車 N」就是清單上當天的列數。
   * 取車清單：已取車、已完成的列也列出來（標「已取車」），不再只列 reserved／in_progress，
   * 否則過去日子的標籤寫「取車 1」清單卻是空的。
   * 還車清單：reserved（尚未取車，還車日到了也要列入並標「尚未取車」）、in_progress（尚待辦理）
   * 與 completed（已還車，可能應收未結）。
   */
  private readonly countedBookings = computed(() =>
    this.bookingStore.bookings().filter((b) => COUNTED.includes(b.status)),
  );

  /** 3.4：取車分頁標籤——大字「取車 N」＋細字「已完成 N」。 */
  readonly pickupTabLabel = computed(() => {
    const progress = this.selectedPickupProgress();
    return {
      title: `${this.t.dispatch.panelTabs.pickup} ${progress.total}`,
      done: fill(this.t.dispatch.panelTabs.done, { count: progress.done }),
    };
  });

  /** 3.4：還車分頁標籤——另外列出清單上逾時未還的筆數（今天的清單含前幾天逾時未還的訂單）。 */
  readonly returnTabLabel = computed(() => {
    const progress = this.selectedReturnProgress();
    const overdue = this.returnWorkRows().filter((row) => this.isOverdue(row)).length;
    return {
      title: `${this.t.dispatch.panelTabs.return} ${progress.total}`,
      done: fill(this.t.dispatch.panelTabs.done, { count: progress.done }),
      overdue: overdue > 0 ? fill(this.t.dispatch.panelTabs.overdue, { count: overdue }) : null,
    };
  });

  /** 3.4：可用分頁標籤只有數字（＝下方清單的列數）；過去的日子不查，只寫「可用」。 */
  readonly availableTabLabel = computed(() => {
    const count = this.availableCount();
    return count === null
      ? this.t.dispatch.panelTabs.available
      : `${this.t.dispatch.panelTabs.available} ${count}`;
  });

  /** 「只看需調度」篩選開關；獨立於 selected() 的日期，換日期時維持使用者的選擇。 */
  readonly showNeedsDispatchOnly = signal(false);

  private readonly pickupWorkRowsForDay = computed<WorkListRow[]>(() => {
    const day = this.selected();
    if (!day) return [];
    return this.countedBookings()
      .filter((b) => isSameDay(new Date(b.startTime), day))
      .map((booking) => ({ id: `pickup-${booking.id}`, booking, kind: 'pickup' as const }))
      .sort((a, b) => new Date(a.booking.startTime).getTime() - new Date(b.booking.startTime).getTime());
  });

  /** 當天取車清單中需調度的筆數，供篩選 toggle 的數量標籤使用（與是否已開啟篩選無關）。 */
  readonly pickupNeedsDispatchCount = computed(
    () => this.pickupWorkRowsForDay().filter((row) => this.needsDispatch(row)).length,
  );

  readonly pickupWorkRows = computed<WorkListRow[]>(() => {
    const rows = this.pickupWorkRowsForDay();
    return this.showNeedsDispatchOnly() ? rows.filter((row) => this.needsDispatch(row)) : rows;
  });

  onNeedsDispatchFilterChange(event: MatSlideToggleChange): void {
    this.showNeedsDispatchOnly.set(event.checked);
  }

  readonly returnWorkRows = computed<WorkListRow[]>(() => {
    const day = this.selected();
    if (!day) return [];
    const sameDayRows = this.countedBookings()
      .filter((b) => isSameDay(new Date(b.endTime), day))
      .map((booking) => ({ id: `return-${booking.id}`, booking, kind: 'return' as const }));

    // 1.2：今天的還車清單另外列出「逾時未還」（in_progress 且還車時間已過）的訂單，即使
    // 它的還車日不是今天（例如兩三天前就該還、至今仍未還）——這是為了讓櫃檯人員在「今天」
    // 這個操作視角就能看到全部積壓的逾時未還訂單，不必回頭一天一天翻找。這些額外併入的筆數
    // 不計入 returnProgress 的當日總數，月曆格「還 N」也不計逾時（該數字只反映當天到期的還車）。
    let rows = sameDayRows;
    if (isSameDay(day, this.todayDate)) {
      const alreadyIncluded = new Set(sameDayRows.map((row) => row.booking.id));
      const overdueFromOtherDays = this.bookingStore
        .bookings()
        .filter(
          (b) =>
            b.status === 'in_progress' &&
            !alreadyIncluded.has(b.id) &&
            new Date(b.endTime).getTime() < Date.now(),
        )
        .map((booking) => ({ id: `return-${booking.id}`, booking, kind: 'return' as const }));
      rows = [...sameDayRows, ...overdueFromOtherDays];
    }

    // 穩定排序疊加兩次：先照還車時間排好基礎順序，再照「是否逾時」排一次——
    // Array.prototype.sort 在現代 JS 引擎皆為穩定排序，逾時（急迫）的列會被移到最前面，
    // 但同一急迫層級內仍維持原本的時間先後順序，不必寫一個複合比較器。
    rows.sort((a, b) => new Date(a.booking.endTime).getTime() - new Date(b.booking.endTime).getTime());
    rows.sort((a, b) => Number(this.isOverdue(b)) - Number(this.isOverdue(a)));
    return rows;
  });

  // ---------------------------------------------------------------------
  // 可用分頁（3.2）：從選取日起租、到還車日為止，哪幾台車可以租；點一台直接去建單。
  // 取／還車時間一律 09:00（DEFAULT_RENTAL_TIME），進了建單頁可以再改。
  // ---------------------------------------------------------------------

  protected readonly categoryOptions = VEHICLE_CATEGORIES.map((value) => ({
    value,
    label: this.t.vehicle.typeLabels[value] ?? value,
  }));

  /** 車型篩選；空字串＝全部。換日期時保留使用者的選擇。 */
  readonly availableCategory = signal<VehicleCategory | ''>('');

  /** 選取日（YYYY-MM-DD）；用字串當來源，重選同一天時還車日不會被重設。 */
  private readonly selectedDateKey = computed(() => {
    const sel = this.selected();
    return sel ? toDateKey(sel) : '';
  });

  /** 還車日最早可選的日子：起租隔天（取還車都是 09:00，同一天還車等於租期是零）。 */
  readonly minReturnDateKey = computed(() => {
    const sel = this.selected();
    return sel ? toDateKey(addDays(startOfDay(sel), 1)) : '';
  });

  /** 還車日（YYYY-MM-DD）：預設起租隔天；換選取日就回到預設。 */
  readonly returnDateKey = linkedSignal(() => (this.selectedDateKey() ? this.minReturnDateKey() : ''));

  /** 選取日在今天以前時，不查可租車輛（只顯示一行說明）。 */
  readonly isSelectedPast = computed(() => {
    const sel = this.selected();
    return !!sel && this.isPast(sel);
  });

  readonly startsOnLabel = computed(() => {
    const sel = this.selected();
    return sel ? fill(this.t.dispatch.availablePanel.startsOn, { date: fmtDate(sel) }) : '';
  });

  /** 可租清單元件的輸入：本地時間 YYYY-MM-DDTHH:mm；過去的日子不查（空字串）。 */
  readonly availableStart = computed(() =>
    this.selectedDateKey() && !this.isSelectedPast()
      ? composeLocal(this.selectedDateKey(), DEFAULT_RENTAL_TIME)
      : '',
  );
  readonly availableEnd = computed(() =>
    this.availableStart() && this.returnDateKey() ? composeLocal(this.returnDateKey(), DEFAULT_RENTAL_TIME) : '',
  );

  /**
   * 分頁標籤的數字：這段期間可以租的車數，與清單元件同一個資料來源與同一個車型篩選，
   * 所以就是清單上的列數。過去的日子（或期間不成立）回傳 null，標籤只寫「可用」。
   */
  readonly availableCount = computed<number | null>(() => {
    const period = rentalPeriodOf(this.availableStart(), this.availableEnd());
    if (!period) return null;
    const category = this.availableCategory();
    return this.availability
      .forPeriod(period.start.toISOString(), period.end.toISOString())
      .available.filter((v) => !category || v.category === category).length;
  });

  /** 還車日不可早於起租隔天；清空或填了更早的日子就回到最早可選的那天（直接改寫輸入框，畫面與值一致）。 */
  onReturnDateChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const min = this.minReturnDateKey();
    const key = inputEl.value && inputEl.value >= min ? inputEl.value : min;
    this.returnDateKey.set(key);
    inputEl.value = key;
  }

  /** 整列點擊：前往建單頁並帶入車輛與起訖（格式同 orderInitialFromQuery 讀的 vehicleId／start／end）。 */
  openOrderFor(vehicle: Vehicle): void {
    const period = rentalPeriodOf(this.availableStart(), this.availableEnd());
    if (!period) return;
    void this.router.navigate(['/orders/new'], {
      queryParams: {
        vehicleId: vehicle.id,
        start: period.start.toISOString(),
        end: period.end.toISOString(),
      },
    });
  }

  vehicleOf(row: WorkListRow): Vehicle | undefined {
    return this.vehicleStore.vehicles().find((v) => v.id === row.booking.vehicleId);
  }

  private memberOf(row: WorkListRow): Member | undefined {
    return this.memberStore.members().find((m) => m.id === row.booking.memberId);
  }

  /**
   * 本地時區的 HH:mm；刻意不共用全站 fmtDateTime（那個會多印日期），
   * 也不能用字串切片取代 getHours/getMinutes，否則非 UTC 時區會讀到錯的時間。
   */
  fmtTime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  memberName(row: WorkListRow): string {
    return this.memberStore.nameOf(row.booking.memberId);
  }

  location(row: WorkListRow): string {
    return branchName(
      row.kind === 'pickup' ? row.booking.pickupLocation : row.booking.returnLocation,
    );
  }

  /** 需調度：與月曆格「需調度 N」同一個判斷（bookingNeedsDispatch）。 */
  needsDispatch(row: WorkListRow): boolean {
    return bookingNeedsDispatch(row.booking, this.vehicleOf(row));
  }

  /**
   * 4.3：這一列要交出去的車還有沒整備的待辦 → 取車列顯示「尚未整備」提醒。只是提醒：
   * 不列入阻擋原因、不影響 readiness()／isPickupReady()（就緒判斷的輸入裡沒有整備這一項），
   * 也不動車輛狀態與可用數。只看尚未取車的列——已取車、已完成的列，車早就交出去了。
   */
  needsPrep(row: WorkListRow): boolean {
    return row.booking.status === 'reserved' && this.prepStore.hasOpenTaskFor(row.booking.vehicleId);
  }

  /** 3.4：需調度 chip 寫出路線「需調度 {所在據點}→{取車據點}」（與可租清單同一個字串）。 */
  dispatchRouteLabel(row: WorkListRow): string {
    return fill(this.t.rentalSearch.needsDispatch, {
      from: branchName(this.vehicleOf(row)?.location),
      to: branchName(row.booking.pickupLocation),
    });
  }

  /** 需調度時的說明文字：「需從〔車輛所在據點〕調度至〔取車據點〕」。 */
  dispatchNote(row: WorkListRow): string {
    const vehicle = this.vehicleOf(row);
    const from = branchName(vehicle?.location);
    const to = this.location(row);
    return `${this.t.dispatch.workList.dispatchNeededPrefix}${from}${this.t.dispatch.workList.dispatchNeededMiddle}${to}`;
  }

  phoneHref(booking: RentalBooking): string | null {
    const phone = this.memberStore.members().find((c) => c.id === booking.memberId)?.phone;
    return phone ? `tel:${phone}` : null;
  }

  phoneLabel(booking: RentalBooking): string {
    return this.memberStore.members().find((c) => c.id === booking.memberId)?.phone ?? '—';
  }

  // ---------------------------------------------------------------------
  // 付款（取車／還車兩個 tab 共用：設計文件 6.2「付款狀態、待收餘額」／
  // 6.3「預估逾時費與目前待收餘額」都要讀同一份付款分類帳摘要）
  // ---------------------------------------------------------------------

  paymentStatusLabel(row: WorkListRow): string {
    return this.t.paymentPanel.statusLabels[this.paymentStore.summaryFor(row.booking.id).status];
  }

  balanceDue(row: WorkListRow): number {
    return this.paymentStore.summaryFor(row.booking.id).balanceDue;
  }

  // ---------------------------------------------------------------------
  // 取車 tab：證件查核、合約簽署狀態、就緒判斷（設計文件 6.2）
  // ---------------------------------------------------------------------

  /** 證件查核的簡化三態摘要：任一必要文件缺件視為 missing，任一被退件視為 rejected，
   *  兩者皆已核對通過才是 verified，其餘（OCR 已抓取但未經人員核對）為 pending。 */
  documentCheckStatus(row: WorkListRow): 'missing' | 'pending' | 'rejected' | 'verified' {
    const member = this.memberOf(row);
    const requiredKind = requiredIdentityDocumentKind(member?.kind);
    const identityDoc = latestByVersion(
      this.documentStore.identityDocumentsFor(row.booking.memberId).filter((d) => d.type === requiredKind),
    );
    const credential = latestByVersion(this.documentStore.driverCredentialsFor(row.booking.memberId));
    if (!identityDoc || !credential) return 'missing';
    const states = [identityDoc.verification.state, credential.verification.state];
    if (states.includes('rejected')) return 'rejected';
    if (states.every((s) => s === 'verified')) return 'verified';
    return 'pending';
  }

  documentCheckLabel(row: WorkListRow): string {
    return this.t.dispatch.workList.documentStatusLabels[this.documentCheckStatus(row)];
  }

  contractStatusLabel(row: WorkListRow): string {
    const latest = this.contractStore.latestFor(row.booking.id);
    return latest ? this.t.contractPanel.statusLabels[latest.status] : this.t.dispatch.workList.noContract;
  }

  /**
   * 組出就緒判斷輸入，邏輯與 handover-panel 的 readinessInput 相同（依會員、文件、駕駛資格、
   * 合約、訂金、車輛狀態即時組出），差別只有一項：originalDocumentCheckedThisVisit 固定為
   * true。那個欄位代表「本次辦理取車時，現場人員是否已核對證件正本」——是取車流程本身的
   * 第一個步驟，不是取車前就該存在的既有缺口；在還沒開始辦理取車的工作清單摘要裡，把它當
   * 阻擋項目顯示會讓每一筆 reserved 訂單永遠顯示「無法取車」，失去「哪些訂單真的有問題」
   * 的篩選意義，因此清單層級的就緒判斷刻意排除這一項，只反映事前就能發現的真實缺口
   * （訂金、合約、證件、駕駛資格、車輛狀態）。
   */
  private readinessInputFor(row: WorkListRow): PickupReadinessInput | undefined {
    const booking = row.booking;
    const vehicle = this.vehicleOf(row);
    if (!vehicle) return undefined;
    const member = this.memberOf(row);

    const requiredKind = requiredIdentityDocumentKind(member?.kind);
    const identityDoc = latestByVersion(
      this.documentStore.identityDocumentsFor(booking.memberId).filter((d) => d.type === requiredKind),
    );
    const credential = latestByVersion(this.documentStore.driverCredentialsFor(booking.memberId));
    const depositPaid = this.paymentStore
      .paymentsFor(booking.id)
      .filter((p) => p.purpose === 'deposit' && p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0);
    const hasSchedulingConflict =
      this.bookingStore.findConflicts(vehicle.id, booking.startTime, booking.endTime, booking.id).length > 0;
    const isForeignVisitor = member?.kind === 'foreign_visitor';
    const previousRental = this.previousRentalOf(booking);

    return {
      evaluatedAt: new Date().toISOString(),
      depositRequired: booking.depositRequired,
      depositPaid,
      // 需重新簽署（舊版已簽、目前有效版本未簽）對交車等同未簽署，一律由領域規則判定。
      latestContractSigned: contractSigningState(this.contractStore.versionsFor(booking.id)) === 'signed',
      requiredDocuments: [
        {
          kind: requiredKind,
          present: !!identityDoc,
          ...(identityDoc?.expiryDate ? { expiryDate: identityDoc.expiryDate } : {}),
          ...(identityDoc?.verification.ocrConfidence != null
            ? { ocrConfidence: identityDoc.verification.ocrConfidence }
            : {}),
        },
      ],
      driverCredential: credential
        ? {
            present: true,
            ...(credential.expiryDate ? { expiryDate: credential.expiryDate } : {}),
            matchesVehicleClass:
              credential.matchesRentedVehicleClass ?? credential.standardizedVehicleClass === vehicle.category,
            isForeignVisitor,
            reciprocityStatus: isForeignVisitor
              ? toPickupReciprocityStatus(credential.reciprocityStatus)
              : 'not_applicable',
          }
        : {
            present: false,
            matchesVehicleClass: true,
            isForeignVisitor,
            reciprocityStatus: 'not_applicable',
          },
      originalDocumentCheckedThisVisit: true,
      vehicle: {
        status: vehicle.status,
        hasSchedulingConflict,
        ...(previousRental ? { previousRental: { scheduledReturnAt: previousRental.endTime } } : {}),
      },
      ...(member?.email ? { memberEmail: member.email } : {}),
    };
  }

  /**
   * 這台車目前在誰手上：同一台車另一筆出租中（含逾時未還）的訂單＝前一位客人還沒還車。
   * 以訂單資料為準，不看車輛狀態欄位，才能寫出那筆訂單預定何時還、逾時多久。
   */
  private previousRentalOf(booking: RentalBooking): RentalBooking | undefined {
    return this.bookingStore
      .bookings()
      .find((b) => b.vehicleId === booking.vehicleId && b.id !== booking.id && b.status === 'in_progress');
  }

  /**
   * 就緒／衝突／阻擋類提示只套用在尚未取車（reserved）的列。已取車、已完成的列不評估——
   * 否則會拿「現在」的車況（例如車正在這位客人自己手上＝出租中）去套已經發生的取車，
   * 顯示「車輛目前在租，與本次取車衝突」這種錯誤警示。
   */
  readiness(row: WorkListRow): PickupReadiness | undefined {
    if (row.booking.status !== 'reserved') return undefined;
    const input = this.readinessInputFor(row);
    return input ? this.handoverStore.evaluateReadiness(input) : undefined;
  }

  readinessLabel(row: WorkListRow): string {
    const readiness = this.readiness(row);
    if (!readiness) return '—';
    if (readiness.ready) return this.t.dispatch.workList.ready;
    const message = readiness.blockers[0]?.message ?? this.t.dispatch.workList.ready;
    return stripTrailingPeriod(message);
  }

  isPickupReady(row: WorkListRow): boolean {
    return this.readiness(row)?.ready ?? true;
  }

  blockersOf(row: WorkListRow): PickupBlocker[] {
    return this.readiness(row)?.blockers ?? [];
  }

  warningsOf(row: WorkListRow): PickupWarning[] {
    return this.readiness(row)?.warnings ?? [];
  }

  /**
   * 阻擋／提醒項目的「前往處理」動作——不在清單裡重做一套表單，直接開同一個訂單詳情。
   * 「前一位客人尚未還車」要處理的是前一筆訂單（聯絡客人、辦理還車），所以開那一筆的交還車分頁。
   */
  goHandleBlocker(row: WorkListRow, blocker: PickupBlocker): void {
    const previous = blocker.reason === 'previous_rental_not_returned' ? this.previousRentalOf(row.booking) : undefined;
    if (previous) {
      void this.orderDetail.open(previous.id, 'handover');
      return;
    }
    void this.orderDetail.open(row.booking.id, BLOCKER_SECTION[blocker.type]);
  }

  goHandleWarning(row: WorkListRow, warning: PickupWarning): void {
    void this.orderDetail.open(row.booking.id, WARNING_SECTION[warning.type]);
  }

  // ---------------------------------------------------------------------
  // 還車 tab：逾時狀態、Email 提醒、預估逾時費（設計文件 6.3）
  // ---------------------------------------------------------------------

  isOverdue(row: WorkListRow): boolean {
    return row.booking.status === 'in_progress' && new Date(row.booking.endTime).getTime() < Date.now();
  }

  overdueDurationLabel(row: WorkListRow): string {
    if (!this.isOverdue(row)) return this.t.dispatch.workList.onTime;
    const minutes = Math.floor((Date.now() - new Date(row.booking.endTime).getTime()) / 60_000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours} ${this.t.dispatch.workList.hoursUnit} ${mins} ${this.t.dispatch.workList.minutesUnit}`
      : `${mins} ${this.t.dispatch.workList.minutesUnit}`;
  }

  /** 已還車但仍有應收餘額——設計文件 6.3「未付追加費用顯示『已還車／應收未結』」。 */
  isReturnedUnsettled(row: WorkListRow): boolean {
    return row.booking.status === 'completed' && this.balanceDue(row) > 0;
  }

  reminderStateLabel(row: WorkListRow): string {
    const records = this.reminderStatuses().filter((r) => r.bookingId === row.booking.id);
    for (const state of REMINDER_STATE_PRECEDENCE) {
      if (records.some((r) => r.state === state)) {
        return this.t.dispatch.workList.reminderStateLabels[state];
      }
    }
    return this.t.dispatch.workList.reminderStateLabels['pending_schedule'];
  }

  /**
   * 依已揭露規則（或退回目前定價方案）試算「若現在馬上還車」的逾時費估計值。能源補繳費
   * 需要實際還車讀數才能算，清單摘要階段還沒有這個輸入，因此把取車／還車讀數都設為同一個
   * 值（0），energyDeficit 必為 0，estimatedLateFee 只反映逾時費部分——這是委派給 Task 2/5
   * 的 calculateReturnCharges 純函式試算，不是重新實作費用規則。
   */
  estimatedLateFee(row: WorkListRow): number {
    const booking = row.booking;
    if (booking.status !== 'in_progress') return 0;
    const vehicle = this.vehicleOf(row);
    if (!vehicle) return 0;
    const policy = this.returnPolicyFor(booking, vehicle);
    const result = this.handoverStore.calculateCharges({
      scheduledReturnAt: booking.endTime,
      actualReturnAt: new Date().toISOString(),
      lateReturnPolicy: policy.lateReturnPolicy,
      energyReturnPolicy: policy.energyReturnPolicy,
      pickupEnergyLevel: 0,
      returnEnergyLevel: 0,
    });
    return result.finalLateFee;
  }

  /** 與 handover-panel.component.ts 的 policyFor 相同優先序：已揭露規則優先，其次目前方案。 */
  private returnPolicyFor(booking: RentalBooking, vehicle: Vehicle) {
    const disclosedRules = this.contractStore.latestFor(booking.id)?.snapshot.disclosedRules;
    const plan = this.pricingStore.plans().find((p) => p.appliesToCategory === vehicle.category);
    return {
      lateReturnPolicy:
        disclosedRules?.lateReturnPolicy ??
        plan?.lateReturnPolicy ?? { graceMinutes: 0, unitMinutes: 60, feePerUnit: 0, dailyCap: 0 },
      energyReturnPolicy:
        disclosedRules?.energyReturnPolicy ??
        plan?.energyReturnPolicy ?? { measure: 'eighths' as const, feePerUnit: 0, serviceFee: 0 },
    };
  }

  // ---------------------------------------------------------------------
  // 快捷操作：全部導向同一個訂單詳情（不同分頁），不在清單裡另做第二套表單。
  // ---------------------------------------------------------------------

  payAction(row: WorkListRow): void {
    void this.orderDetail.open(row.booking.id, 'payments');
  }

  viewContractAction(row: WorkListRow): void {
    void this.orderDetail.open(row.booking.id, 'contract');
  }

  cancelAction(row: WorkListRow): void {
    void this.orderDetail.open(row.booking.id, 'cancellation');
  }

  pickupAction(row: WorkListRow): void {
    void this.orderDetail.open(row.booking.id, 'handover');
  }

  returnAction(row: WorkListRow): void {
    void this.orderDetail.open(row.booking.id, 'handover');
  }

  viewAction(row: WorkListRow): void {
    void this.orderDetail.open(row.booking.id);
  }

  /**
   * 「修改」開啟訂單詳情並直接進入總覽的編輯訂單（與訂單列表的「編輯」同一個入口），
   * 不在清單裡另做一套簡化編輯表單。
   */
  editAction(row: WorkListRow): void {
    void this.orderDetail.edit(row.booking.id);
  }
}
