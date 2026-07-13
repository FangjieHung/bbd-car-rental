import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { BookingStatus, RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';
import { StatusChipComponent, ChipTone } from '../../shared/status-chip.component';
import { confirm } from '../../shared/confirm-dialog.component';
import { BookingFormDialogComponent, BookingFormResult } from './booking-form-dialog.component';

const STATUS_TONE: Record<BookingStatus, ChipTone> = {
  confirmed: 'yellow', in_progress: 'blue', completed: 'green', cancelled: 'gray',
};

@Component({
  selector: 'app-bookings-page',
  imports: [MatButtonModule, RouterLink, StatusChipComponent],
  templateUrl: './bookings-page.component.html',
  styleUrls: ['./bookings-page.component.scss'],
})
export class BookingsPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(BookingStore);
  readonly customerStore = inject(CustomerStore);
  private vehicleStore = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly fmt = fmtDateTime;

  plateOf(vehicleId: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === vehicleId)?.plateNumber ?? '—';
  }

  toneOf(b: RentalBooking): ChipTone {
    return STATUS_TONE[b.status];
  }

  act(fn: () => void): void {
    try {
      fn();
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 4000 });
    }
  }

  async cancelBooking(b: RentalBooking): Promise<void> {
    if (await confirm(this.dialog, this.t.common.deleteConfirm)) this.act(() => this.store.cancel(b.id));
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
