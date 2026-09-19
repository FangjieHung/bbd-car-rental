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
import { StatusChipComponent } from '../../../shared/chips/status-chip.component';
import { StatusKey } from '@car-rental/theme-pack';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
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
    return this.store.bookings().filter((b) => {
      if (status && b.status !== status) return false;
      if (query) {
        const memberName = this.memberStore.nameOf(b.memberId).toLowerCase();
        const plate = this.plateOf(b.vehicleId).toLowerCase();
        if (!memberName.includes(query) && !plate.includes(query)) return false;
      }
      return true;
    });
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

  act(fn: () => void): void {
    try {
      fn();
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 4000 });
    }
  }

  async cancelBooking(b: RentalBooking): Promise<void> {
    if (await confirm(this.dialog, this.t.common.deleteConfirm))
      this.act(() => this.store.cancel(b.id));
  }

  async cancelSelected(bookings: readonly RentalBooking[]): Promise<void> {
    const cancellable = bookings.filter((b) => b.status === 'reserved');
    if (cancellable.length === 0) return;
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    for (const booking of cancellable) {
      this.act(() => this.store.cancel(booking.id));
    }
    this.selectedBookings.set([]);
  }

  openWorkspace(booking: RentalBooking): void {
    this.workspace.open(booking.id);
  }

  async openForm(booking: RentalBooking | null): Promise<void> {
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
