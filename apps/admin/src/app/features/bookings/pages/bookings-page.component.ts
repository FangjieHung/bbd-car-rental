import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
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
import { StatusKey } from '@car-rental/theme-pack';
import { PageToolbarComponent } from '../../../shared/ui/page-toolbar.component';
import { HeaderToolbarDirective } from '../../../layout/header/header-toolbar-slot';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import {
  FilterOption,
  FilterSelectComponent,
} from '../../../shared/filters/filter-select.component';
import {
  BookingFormDialogComponent,
  BookingFormResult,
} from '../dialogs/booking-form-dialog.component';
import { BookingWorkspaceService } from '../services/booking-workspace.service';
import { WorkspaceSection } from '../dialogs/booking-workspace-dialog.component';

const STATUS_KEY: Record<BookingStatus, StatusKey> = {
  reserved: 'warning',
  in_progress: 'processing',
  completed: 'completed',
  cancelled: 'archived',
};

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
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private workspace = inject(BookingWorkspaceService);
  private readonly paymentStore = inject(PaymentStore);
  private readonly operatorRecoveryStore = inject(OperatorRecoveryStore);
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
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  onExportFailed(e: Error): void {
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  readonly searchQuery = signal('');
  readonly statusFilter = signal<BookingStatus | null>(null);
  readonly selectedBookings = signal<readonly RentalBooking[]>([]);

  readonly statusOptions: FilterOption<BookingStatus>[] = (
    Object.entries(this.t.booking.statusLabels) as [BookingStatus, string][]
  ).map(([value, label]) => ({ value, label }));

  readonly activeFilterCount = computed(() => (this.statusFilter() ? 1 : 0));

  readonly filteredBookings = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const filtered = this.store.bookings().filter((b) => {
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

  statusKeyOf(b: RentalBooking): StatusKey {
    return STATUS_KEY[b.status];
  }

  // ---------------------------------------------------------------------
  // 急迫指標：逾時未還、退款待處理、業者復原處理中——每一項在畫面上都要有 icon + 文字 +
  // 動作（不能只靠顏色），點擊一律導向同一個訂單工作區的對應分頁，不在清單裡另做判斷邏輯。
  // ---------------------------------------------------------------------

  isOverdueReturn(b: RentalBooking): boolean {
    return b.status === 'in_progress' && new Date(b.endTime).getTime() < Date.now();
  }

  hasRefundPending(b: RentalBooking): boolean {
    return this.paymentStore.refundsFor(b.id).some((r) => r.status === 'pending');
  }

  hasUrgentOperatorRecovery(b: RentalBooking): boolean {
    return this.operatorRecoveryStore.casesFor(b.id).some((c) => c.status === 'in_progress');
  }

  isUrgent(b: RentalBooking): boolean {
    return this.isOverdueReturn(b) || this.hasRefundPending(b) || this.hasUrgentOperatorRecovery(b);
  }

  goUrgent(b: RentalBooking, section: WorkspaceSection): void {
    this.workspace.open(b.id, section);
  }

  /** 「辦理取車」「辦理還車」快捷操作一律開同一個訂單工作區的交還車分頁，不再繞過就緒判斷
   *  與稽核紀錄直接呼叫 BookingStore.pickUp()/complete()——那兩個方法本身仍是狀態機把關者，
   *  但完整流程（含就緒判斷、主管覆核、費用試算與稽核）只在 HandoverPanelComponent 裡走一次。 */
  handoverAction(b: RentalBooking): void {
    this.workspace.open(b.id, 'handover');
  }

  /** 「取消訂單」開同一個訂單工作區的取消分頁（含責任歸屬、試算、退款／保留金撥付的完整
   *  流程），不再是清單裡一個 confirm() 就直接呼叫 BookingStore.cancel() 的簡化版本。 */
  cancelAction(b: RentalBooking): void {
    this.workspace.open(b.id, 'cancellation');
  }

  openWorkspace(booking: RentalBooking): void {
    this.workspace.open(booking.id);
  }

  /** 編輯既有訂單（新增訂單已改為 /orders/new 頁面；編輯下一階段改為訂單詳情頁）。 */
  async openForm(booking: RentalBooking): Promise<void> {
    const ref = this.dialog.open(BookingFormDialogComponent, {
      data: booking,
      width: '80vw',
      maxWidth: '800px',
      maxHeight: '90dvh',
      panelClass: 'booking-form-wizard-dialog',
    });
    const result: BookingFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    // 精靈本身已經完成建立/更新訂單（含會員、款項、合約、提醒）的完整寫入序列，
    // 這裡只需要直接開工作區讓操作人員接續補其他資料，不必再呼叫 BookingStore 寫入。
    this.workspace.open(result.bookingId);
  }
}
