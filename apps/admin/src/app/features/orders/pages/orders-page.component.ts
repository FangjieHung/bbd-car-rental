import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { OrderStatus, RentalOrder } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { OrderStore } from '../../../stores/order/order.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { OperatorRecoveryStore } from '../../../stores/operator-recovery/operator-recovery.store';
import { StatusChipComponent } from '../../../shared/chips/status-chip.component';
import { ORDER_STATUS_KEY } from '../../../shared/chips/order-status-key';
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

@Component({
  selector: 'app-orders-page',
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
  templateUrl: './orders-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class OrdersPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(OrderStore);
  readonly memberStore = inject(MemberStore);
  private vehicleStore = inject(VehicleStore);
  private snackBar = inject(MatSnackBar);
  private orderDetail = inject(OrderDetailNavigation);
  private readonly paymentStore = inject(PaymentStore);
  private readonly operatorRecoveryStore = inject(OperatorRecoveryStore);
  readonly fmt = fmtDateTime;

  readonly labels = { ...ADMIN_DATA_TABLE_LABELS, batchDelete: this.t.order.cancelOrder };

  readonly columns: DataTableColumn<RentalOrder>[] = [
    {
      key: 'vehicleId',
      label: this.t.order.vehicle,
      primary: true,
      exportValue: (b) => this.plateOf(b.vehicleId),
    },
    {
      key: 'memberId',
      label: this.t.order.member,
      primary: true,
      exportValue: (b) => this.memberStore.nameOf(b.memberId),
    },
    { key: 'startTime', label: this.t.order.startTime, exportValue: (b) => this.fmt(b.startTime) },
    { key: 'endTime', label: this.t.order.endTime, exportValue: (b) => this.fmt(b.endTime) },
    {
      key: 'status',
      label: this.t.order.status,
      primary: true,
      exportValue: (b) => this.t.order.statusLabels[b.status],
    },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  onExportFailed(e: Error): void {
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  readonly searchQuery = signal('');
  readonly statusFilter = signal<OrderStatus | null>(null);
  readonly selectedOrders = signal<readonly RentalOrder[]>([]);

  readonly statusOptions: FilterOption<OrderStatus>[] = (
    Object.entries(this.t.order.statusLabels) as [OrderStatus, string][]
  ).map(([value, label]) => ({ value, label }));

  readonly activeFilterCount = computed(() => (this.statusFilter() ? 1 : 0));

  readonly filteredOrders = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const filtered = this.store.orders().filter((b) => {
      if (status && b.status !== status) return false;
      if (query) {
        const memberName = this.memberStore.nameOf(b.memberId).toLowerCase();
        const plate = this.plateOf(b.vehicleId).toLowerCase();
        if (!memberName.includes(query) && !plate.includes(query)) return false;
      }
      return true;
    });
    // 急迫項目（逾時未還／退款待處理／業者復原處理中）排在一般列之前；Array.prototype.sort
    // 是穩定排序，同一急迫層級內仍維持原本（依訂單載入順序）的相對順序。
    return [...filtered].sort((a, b) => Number(this.isUrgent(b)) - Number(this.isUrgent(a)));
  });

  clearFilters(): void {
    this.statusFilter.set(null);
  }

  plateOf(vehicleId: string): string {
    return this.vehicleStore.vehicles().find((v) => v.id === vehicleId)?.plateNumber ?? '—';
  }

  statusKeyOf(b: RentalOrder): StatusKey {
    return ORDER_STATUS_KEY[b.status];
  }

  // ---------------------------------------------------------------------
  // 急迫指標：逾時未還、退款待處理、業者復原處理中——每一項在畫面上都要有 icon + 文字 +
  // 動作（不能只靠顏色），點擊一律導向同一個訂單詳情的對應分頁，不在清單裡另做判斷邏輯。
  // ---------------------------------------------------------------------

  isOverdueReturn(b: RentalOrder): boolean {
    return b.status === 'in_progress' && new Date(b.endTime).getTime() < Date.now();
  }

  hasRefundPending(b: RentalOrder): boolean {
    return this.paymentStore.refundsFor(b.id).some((r) => r.status === 'pending');
  }

  hasUrgentOperatorRecovery(b: RentalOrder): boolean {
    return this.operatorRecoveryStore.casesFor(b.id).some((c) => c.status === 'in_progress');
  }

  isUrgent(b: RentalOrder): boolean {
    return this.isOverdueReturn(b) || this.hasRefundPending(b) || this.hasUrgentOperatorRecovery(b);
  }

  goUrgent(b: RentalOrder, section: OrderDetailSection): void {
    void this.orderDetail.open(b.id, section);
  }

  /** 「辦理取車」「辦理還車」快捷操作一律開同一個訂單詳情的交還車分頁，不再繞過就緒判斷
   *  與稽核紀錄直接呼叫 OrderStore.pickUp()/complete()——那兩個方法本身仍是狀態機把關者，
   *  但完整流程（含就緒判斷、主管覆核、費用試算與稽核）只在 HandoverPanelComponent 裡走一次。 */
  handoverAction(b: RentalOrder): void {
    void this.orderDetail.open(b.id, 'handover');
  }

  /** 「取消訂單」開同一個訂單詳情的取消分頁（含責任歸屬、試算、退款／保留金撥付的完整
   *  流程），不再是清單裡一個 confirm() 就直接呼叫 OrderStore.cancel() 的簡化版本。 */
  cancelAction(b: RentalOrder): void {
    void this.orderDetail.open(b.id, 'cancellation');
  }

  openDetail(order: RentalOrder): void {
    void this.orderDetail.open(order.id);
  }

  /** 編輯訂單：開啟訂單詳情並直接進入總覽的編輯狀態。 */
  editOrder(order: RentalOrder): void {
    void this.orderDetail.edit(order.id);
  }
}
