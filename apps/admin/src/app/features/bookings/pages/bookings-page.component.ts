import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { BookingStatus, RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { OperatorRecoveryStore } from '../../../stores/operator-recovery/operator-recovery.store';
import { StatusChipComponent } from '../../../shared/chips/status-chip.component';
import { BOOKING_STATUS_KEY } from '../../../shared/chips/booking-status-key';
import { StatusKey } from '@car-rental/theme-pack';
import { PageToolbarComponent } from '../../../shared/ui/page-toolbar.component';
import { HeaderToolbarDirective } from '../../../layout/header/header-toolbar-slot';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import {
  FilterOption,
  FilterSelectComponent,
} from '../../../shared/filters/filter-select.component';
import { OrderDetailNavigation } from '../../orders/navigation/order-detail-navigation';
import { OrderDetailSection } from '../../orders/navigation/order-detail-sections';
import { OrderIncompleteItem } from '../../orders/incomplete/order-incomplete';
import { OrderIncompleteService } from '../../orders/incomplete/order-incomplete.service';
import {
  hasRefundPending,
  hasUrgentOperatorRecovery,
  isOverdueReturn,
  isUrgent,
} from '../booking-urgency';

/** 4.1：「待補」篩選只有一個選項（只看有待補）；沒選＝全部。 */
export type IncompleteFilter = 'has';

/** 1.4：電話比對前先去掉空白與連字號，讓「0912-345-678」與「0912 345 678」都比對得到。 */
function stripPhoneSeparators(value: string): string {
  return value.replace(/[\s-]/g, '');
}

@Component({
  selector: 'app-bookings-page',
  imports: [
    DataTableComponent,
    DataTableCellDirective,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    RouterLink,
    StatusChipComponent,
    PageToolbarComponent,
    FilterSelectComponent,
    HeaderToolbarDirective,
  ],
  templateUrl: './bookings-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class BookingsPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(BookingStore);
  readonly memberStore = inject(MemberStore);
  private vehicleStore = inject(VehicleStore);
  private snackBar = inject(MatSnackBar);
  private orderDetail = inject(OrderDetailNavigation);
  private readonly paymentStore = inject(PaymentStore);
  private readonly operatorRecoveryStore = inject(OperatorRecoveryStore);
  private readonly incomplete = inject(OrderIncompleteService);
  private readonly route = inject(ActivatedRoute);
  readonly fmt = fmtDateTime;

  readonly labels = { ...ADMIN_DATA_TABLE_LABELS, batchDelete: this.t.booking.cancelBooking };

  readonly columns: DataTableColumn<RentalBooking>[] = [
    {
      key: 'vehicleId',
      label: this.t.booking.vehicle,
      primary: true,
      exportValue: (b) => this.plateOf(b.vehicleId),
    },
    {
      key: 'memberId',
      label: this.t.booking.member,
      primary: true,
      exportValue: (b) => this.memberStore.nameOf(b.memberId),
    },
    { key: 'startTime', label: this.t.booking.startTime, exportValue: (b) => this.fmt(b.startTime) },
    { key: 'endTime', label: this.t.booking.endTime, exportValue: (b) => this.fmt(b.endTime) },
    {
      key: 'status',
      label: this.t.booking.status,
      primary: true,
      exportValue: (b) => this.t.booking.statusLabels[b.status],
    },
    // 4.1：待補項數（數字徽章，0 不顯示）；規則與訂單詳情的待補卡同一套。
    { key: 'incomplete', label: this.t.booking.incomplete, exportValue: (b) => this.incompleteOf(b).length },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  onExportFailed(e: Error): void {
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  // 1.4：總覽的放大鏡送出後導到 /bookings?q=關鍵字，這裡預填搜尋框。
  readonly searchQuery = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  readonly statusFilter = signal<BookingStatus | null>(null);
  readonly incompleteFilter = signal<IncompleteFilter | null>(null);
  readonly selectedBookings = signal<readonly RentalBooking[]>([]);

  readonly statusOptions: FilterOption<BookingStatus>[] = (
    Object.entries(this.t.booking.statusLabels) as [BookingStatus, string][]
  ).map(([value, label]) => ({ value, label }));
  readonly incompleteOptions: FilterOption<IncompleteFilter>[] = [{ value: 'has', label: this.t.booking.incompleteOnly }];

  readonly activeFilterCount = computed(() => [this.statusFilter(), this.incompleteFilter()].filter((f) => f !== null).length);

  /** 每筆訂單的待補項目（已取消、已完成的訂單不計，為空陣列）。 */
  private readonly incompleteByBooking = computed(
    () => new Map(this.store.bookings().map((b) => [b.id, this.incomplete.itemsFor(b)] as const)),
  );

  readonly filteredBookings = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    // 1.4：搜尋除姓名、車牌外也比對電話；比對前雙方都先去掉空白與連字號，
    // 「0912-345-678」「0912 345 678」「0912345678」都要比對得到。
    const normalizedPhoneQuery = stripPhoneSeparators(query);
    const status = this.statusFilter();
    const onlyIncomplete = this.incompleteFilter() === 'has';
    const filtered = this.store.bookings().filter((b) => {
      if (status && b.status !== status) return false;
      if (onlyIncomplete && this.incompleteOf(b).length === 0) return false;
      if (query) {
        const memberName = this.memberStore.nameOf(b.memberId).toLowerCase();
        const plate = this.plateOf(b.vehicleId).toLowerCase();
        const phone = stripPhoneSeparators(this.phoneOf(b.memberId).toLowerCase());
        const matchesPhone = normalizedPhoneQuery.length > 0 && phone.includes(normalizedPhoneQuery);
        if (!memberName.includes(query) && !plate.includes(query) && !matchesPhone) return false;
      }
      return true;
    });
    // 急迫項目（逾時未還／退款待處理／業者復原處理中）排在一般列之前；Array.prototype.sort
    // 是穩定排序，同一急迫層級內仍維持原本（依訂單載入順序）的相對順序。
    return [...filtered].sort((a, b) => Number(this.isUrgent(b)) - Number(this.isUrgent(a)));
  });

  clearFilters(): void {
    this.statusFilter.set(null);
    this.incompleteFilter.set(null);
  }

  incompleteOf(b: RentalBooking): OrderIncompleteItem[] {
    return this.incompleteByBooking().get(b.id) ?? [];
  }

  /** 待補徽章的提示：列出每一項（「、」隔開）。 */
  incompleteSummary(b: RentalBooking): string {
    return this.incompleteOf(b)
      .map((item) => item.label)
      .join('、');
  }

  incompleteCountLabel(b: RentalBooking): string {
    return this.t.booking.incompleteCount.replace('{count}', String(this.incompleteOf(b).length));
  }

  plateOf(vehicleId: string): string {
    return this.vehicleStore.vehicles().find((v) => v.id === vehicleId)?.plateNumber ?? '—';
  }

  private phoneOf(memberId: string): string {
    return this.memberStore.members().find((m) => m.id === memberId)?.phone ?? '';
  }

  statusKeyOf(b: RentalBooking): StatusKey {
    return BOOKING_STATUS_KEY[b.status];
  }

  // ---------------------------------------------------------------------
  // 急迫指標：逾時未還、退款待處理、業者復原處理中——每一項在畫面上都要有 icon + 文字 +
  // 動作（不能只靠顏色），點擊一律導向同一個訂單詳情的對應分頁，不在清單裡另做判斷邏輯。
  // 判斷邏輯本身抽到 booking-urgency.ts，與訂單詳情標題旁的急迫狀態共用、不重寫。
  // ---------------------------------------------------------------------

  isOverdueReturn(b: RentalBooking): boolean {
    return isOverdueReturn(b);
  }

  hasRefundPending(b: RentalBooking): boolean {
    return hasRefundPending(b, this.paymentStore);
  }

  hasUrgentOperatorRecovery(b: RentalBooking): boolean {
    return hasUrgentOperatorRecovery(b, this.operatorRecoveryStore);
  }

  isUrgent(b: RentalBooking): boolean {
    return isUrgent(b, this.paymentStore, this.operatorRecoveryStore);
  }

  goUrgent(b: RentalBooking, section: OrderDetailSection): void {
    void this.orderDetail.open(b.id, section);
  }

  /** 「辦理取車」「辦理還車」快捷操作一律開同一個訂單詳情的交還車分頁，不再繞過就緒判斷
   *  與稽核紀錄直接呼叫 BookingStore.pickUp()/complete()——那兩個方法本身仍是狀態機把關者，
   *  但完整流程（含就緒判斷、主管覆核、費用試算與稽核）只在 HandoverPanelComponent 裡走一次。 */
  handoverAction(b: RentalBooking): void {
    void this.orderDetail.open(b.id, 'handover');
  }

  /** 「取消訂單」開同一個訂單詳情的取消分頁（含責任歸屬、試算、退款／保留金撥付的完整
   *  流程），不再是清單裡一個 confirm() 就直接呼叫 BookingStore.cancel() 的簡化版本。 */
  cancelAction(b: RentalBooking): void {
    void this.orderDetail.open(b.id, 'cancellation');
  }

  openDetail(booking: RentalBooking): void {
    void this.orderDetail.open(booking.id);
  }

  /** 編輯訂單：開啟訂單詳情並直接進入總覽的編輯狀態。 */
  editOrder(booking: RentalBooking): void {
    void this.orderDetail.edit(booking.id);
  }
}
