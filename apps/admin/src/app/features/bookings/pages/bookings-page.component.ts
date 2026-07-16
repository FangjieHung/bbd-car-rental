import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { BookingStatus, RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../../stores/customer/customer.store';
import { StatusChipComponent } from '../../../shared/chips/status-chip.component';
import { StatusKey } from '@car-rental/theme-pack';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { ListToolbarComponent } from '../../../shared/ui/list-toolbar.component';
import {
  FilterOption,
  FilterSelectComponent,
} from '../../../shared/filters/filter-select.component';
import {
  BookingFormDialogComponent,
  BookingFormResult,
} from '../dialogs/booking-form-dialog.component';

const STATUS_KEY: Record<BookingStatus, StatusKey> = {
  confirmed: 'warning',
  in_progress: 'processing',
  completed: 'completed',
  cancelled: 'archived',
};

@Component({
  selector: 'app-bookings-page',
  imports: [
    MatButtonModule,
    RouterLink,
    StatusChipComponent,
    ListToolbarComponent,
    FilterSelectComponent,
  ],
  templateUrl: './bookings-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class BookingsPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(BookingStore);
  readonly customerStore = inject(CustomerStore);
  private vehicleStore = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly fmt = fmtDateTime;

  readonly searchQuery = signal('');
  readonly statusFilter = signal<BookingStatus | null>(null);

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
        const customerName = this.customerStore.nameOf(b.customerId).toLowerCase();
        const plate = this.plateOf(b.vehicleId).toLowerCase();
        if (!customerName.includes(query) && !plate.includes(query)) return false;
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

  async openForm(booking: RentalBooking | null): Promise<void> {
    const ref = this.dialog.open(BookingFormDialogComponent, { data: booking, width: '440px' });
    const result: BookingFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    this.act(() => {
      if (booking) this.store.updateBooking(booking.id, result);
      else this.store.create(result);
    });
  }
}
