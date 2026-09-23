import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ResponsivePanelComponent } from '@car-rental/ui';
import { VehicleStepComponent } from '@car-rental/booking-flow';
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
  Vehicle,
  calculatePrice,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { addDays, isSameDay, startOfDay } from '../../../core/date-utils';
import { REMINDER_STATUS_REPO } from '../../../core/repositories/tokens';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { PricingStore } from '../../../stores/pricing/pricing.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { HandoverStore } from '../../../stores/handover/handover.store';
import { OrderDetailNavigation } from '../../orders/navigation/order-detail-navigation';
import { OrderDetailSection } from '../../orders/navigation/order-detail-sections';

const NARROW_QUERY = '(max-width: 1280px)';

function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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

const ACTIVE: RentalBooking['status'][] = ['reserved', 'in_progress'];

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

export function dayStats(
  bookings: RentalBooking[],
  totalVehicles: number,
  day: Date,
): { pickups: number; returns: number; available: number } {
  const active = bookings.filter((b) => ACTIVE.includes(b.status));
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const pickups = active.filter((b) => isSameDay(new Date(b.startTime), day)).length;
  const returns = active.filter((b) => isSameDay(new Date(b.endTime), day)).length;
  const occupied = new Set(
    active
      .filter((b) => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart)
      .map((b) => b.vehicleId),
  );
  return { pickups, returns, available: totalVehicles - occupied.size };
}

export interface DayProgress {
  total: number;
  done: number;
  pending: number;
}

export function pickupProgress(bookings: RentalBooking[], day: Date): DayProgress {
  const relevant = bookings.filter(
    (b) =>
      isSameDay(new Date(b.startTime), day) &&
      (b.status === 'reserved' || b.status === 'in_progress' || b.status === 'completed'),
  );
  const done = relevant.filter((b) => b.status !== 'reserved').length;
  return { total: relevant.length, done, pending: relevant.length - done };
}

/**
 * 還車進度：total 只計 in_progress／completed（已取車、租期進行中或已完成的訂單）中還車日
 * 是這天的——reserved 訂單根本還沒被取走，永遠不計入還車統計（即使 endTime 剛好是這天）。
 * done 只計 completed（真正已辦理還車完成）；in_progress 即使已逾期，也還是「未完成」。
 */
export function returnProgress(bookings: RentalBooking[], day: Date): DayProgress {
  const relevant = bookings.filter(
    (b) =>
      isSameDay(new Date(b.endTime), day) && (b.status === 'in_progress' || b.status === 'completed'),
  );
  const done = relevant.filter((b) => b.status === 'completed').length;
  return { total: relevant.length, done, pending: relevant.length - done };
}

@Component({
  selector: 'app-calendar-view',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatTabsModule,
    ResponsivePanelComponent,
    VehicleStepComponent,
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

  private readonly orderDetail = inject(OrderDetailNavigation);
  private readonly paymentStore = inject(PaymentStore);
  private readonly documentStore = inject(DocumentStore);
  private readonly contractStore = inject(ContractStore);
  private readonly handoverStore = inject(HandoverStore);
  private readonly reminderRepo = inject(REMINDER_STATUS_REPO);
  private readonly reminderStatuses = signal<ReminderStatus[]>(this.reminderRepo.getAll());

  readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly selected = signal<Date | null>(null);
  readonly panelDismissed = signal(true);
  readonly panelTab = signal<PanelTab>('pickup');
  readonly targetDate = input<Date>(startOfDay(new Date()));
  readonly dateSelected = output<Date>();
  readonly todayDate = new Date();

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
      // 只有「外部」指定的日期才自動把面板叫出來；自己 emit 繞回來的不算，
      // 否則 goToToday 想保持面板收起也會被這裡覆蓋掉。
      const isEcho = this.lastEmitted === date.getTime();
      this.lastEmitted = null;
      this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
      this.selected.set(date);
      this.panelTab.set('pickup');
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

  shiftMonth(n: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + n, 1));
    this.selected.set(null);
  }

  /** 只把格線定位／選取到今天，不叫出面板（窄螢幕面板是覆蓋式的，會擋住日曆）。 */
  goToToday(): void {
    const today = startOfDay(this.todayDate);
    this.month.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selected.set(today);
    this.panelTab.set('pickup');
    this.panelDismissed.set(true);
    this.emitSelection(today);
  }

  dismissPanel(): void {
    this.panelDismissed.set(true);
  }

  selectDate(date: Date): void {
    const normalized = startOfDay(date);
    this.selected.set(normalized);
    this.panelDismissed.set(false);
    this.panelTab.set('pickup');
    this.emitSelection(normalized);
  }

  statsOf(d: Date) {
    return dayStats(this.bookingStore.bookings(), this.vehicleStore.vehicles().length, d);
  }

  readonly selectedPickupProgress = computed(() =>
    pickupProgress(this.bookingStore.bookings(), this.selected() ?? this.todayDate),
  );

  readonly selectedReturnProgress = computed(() =>
    returnProgress(this.bookingStore.bookings(), this.selected() ?? this.todayDate),
  );

  private readonly activeBookings = computed(() =>
    this.bookingStore.bookings().filter((b) => ACTIVE.includes(b.status)),
  );

  /** 還車工作清單的候選集合：in_progress（尚待辦理）與 completed（已還車，可能應收未結）。 */
  private readonly returnEligibleBookings = computed(() =>
    this.bookingStore.bookings().filter((b) => b.status === 'in_progress' || b.status === 'completed'),
  );

  /** 「只看需調度」篩選開關；獨立於 selected() 的日期，換日期時維持使用者的選擇。 */
  readonly showNeedsDispatchOnly = signal(false);

  private readonly pickupWorkRowsForDay = computed<WorkListRow[]>(() => {
    const day = this.selected();
    if (!day) return [];
    return this.activeBookings()
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
    const rows = this.returnEligibleBookings()
      .filter((b) => isSameDay(new Date(b.endTime), day))
      .map((booking) => ({ id: `return-${booking.id}`, booking, kind: 'return' as const }));
    // 穩定排序疊加兩次：先照還車時間排好基礎順序，再照「是否逾時」排一次——
    // Array.prototype.sort 在現代 JS 引擎皆為穩定排序，逾時（急迫）的列會被移到最前面，
    // 但同一急迫層級內仍維持原本的時間先後順序，不必寫一個複合比較器。
    rows.sort((a, b) => new Date(a.booking.endTime).getTime() - new Date(b.booking.endTime).getTime());
    rows.sort((a, b) => Number(this.isOverdue(b)) - Number(this.isOverdue(a)));
    return rows;
  });

  readonly availableVehicles = computed<Vehicle[]>(() => {
    const day = this.selected();
    if (!day) return [];
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    const occupied = new Set(
      this.activeBookings()
        .filter((b) => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart)
        .map((b) => b.vehicleId),
    );
    return this.vehicleStore.vehicles().filter((v) => !occupied.has(v.id));
  });

  readonly priceForVehicle = (vehicle: Vehicle): number | null => {
    const day = this.selected();
    if (!day) return null;
    const plan = this.pricingStore.plans().find((p) => p.appliesToCategory === vehicle.category);
    if (!plan) return null;
    const start = toIsoDate(startOfDay(day));
    const end = toIsoDate(addDays(startOfDay(day), 1));
    try {
      return calculatePrice({
        plan,
        calendar: this.pricingStore.calendar(),
        startDate: start,
        endDate: end,
        addOns: [],
      }).total;
    } catch {
      return null;
    }
  };

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

  /**
   * 需調度：取車據點與車輛所在據點不同（CONTEXT.md「需調度」）。只有 reserved 訂單車輛還沒
   * 被取走，才可能需要事先調度；已取車／已完成／已取消的訂單這件事已成定局或不再相關。
   */
  needsDispatch(row: WorkListRow): boolean {
    if (row.booking.status !== 'reserved') return false;
    const vehicle = this.vehicleOf(row);
    return computeNeedsDispatch(vehicle?.location, row.booking.pickupLocation);
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
      vehicle: { status: vehicle.status, hasSchedulingConflict },
      ...(member?.email ? { memberEmail: member.email } : {}),
    };
  }

  readiness(row: WorkListRow): PickupReadiness | undefined {
    const input = this.readinessInputFor(row);
    return input ? this.handoverStore.evaluateReadiness(input) : undefined;
  }

  readinessLabel(row: WorkListRow): string {
    const readiness = this.readiness(row);
    if (!readiness) return '—';
    if (readiness.ready) return this.t.dispatch.workList.ready;
    return readiness.blockers[0]?.message ?? this.t.dispatch.workList.ready;
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

  /** 阻擋／提醒項目的「前往處理」動作——不在清單裡重做一套表單，直接開同一個訂單詳情。 */
  goHandleBlocker(row: WorkListRow, blocker: PickupBlocker): void {
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
