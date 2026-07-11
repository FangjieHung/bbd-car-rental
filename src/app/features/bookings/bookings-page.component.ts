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
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 class="text-xl font-bold">{{ t.booking.title }}</h1>
        <div class="flex gap-2">
          <a mat-button routerLink="/bookings/customers">{{ t.booking.goCustomers }}</a>
          <button mat-flat-button (click)="openForm(null)">{{ t.common.create }}</button>
        </div>
      </div>
      @if (store.bookings().length === 0) {
        <p class="text-gray-500">{{ t.common.empty }}</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2">{{ t.booking.vehicle }}</th>
                <th>{{ t.booking.customer }}</th>
                <th>{{ t.booking.startTime }}</th>
                <th>{{ t.booking.endTime }}</th>
                <th>{{ t.booking.status }}</th>
                <th>{{ t.common.actions }}</th>
              </tr>
            </thead>
            <tbody>
              @for (b of store.bookings(); track b.id) {
                <tr class="border-b">
                  <td class="py-2">{{ plateOf(b.vehicleId) }}</td>
                  <td>{{ customerStore.nameOf(b.customerId) }}</td>
                  <td>{{ fmt(b.startTime) }}</td>
                  <td>{{ fmt(b.endTime) }}</td>
                  <td><app-status-chip [label]="t.booking.statusLabels[b.status]" [tone]="toneOf(b)" /></td>
                  <td class="whitespace-nowrap">
                    @if (b.status === 'confirmed') {
                      <button mat-button (click)="act(() => store.pickUp(b.id))">{{ t.booking.pickUp }}</button>
                      <button mat-button (click)="openForm(b)">{{ t.common.edit }}</button>
                    }
                    @if (b.status === 'in_progress') {
                      <button mat-button (click)="act(() => store.complete(b.id))">{{ t.booking.complete }}</button>
                    }
                    @if (b.status === 'confirmed' || b.status === 'in_progress') {
                      <button mat-button color="warn" (click)="cancelBooking(b)">{{ t.booking.cancelBooking }}</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
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
