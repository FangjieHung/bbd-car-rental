import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime } from '../../core/date-utils';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';

@Component({
  selector: 'app-booking-detail-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-content class="text-sm flex flex-col gap-1.5">
      <p><b>{{ t.booking.vehicle }}</b>：<span style="color: var(--text-secondary)">{{ plate }}</span></p>
      <p><b>{{ t.booking.customer }}</b>：<span style="color: var(--text-secondary)">{{ customerStore.nameOf(data.customerId) }}</span></p>
      <p><b>{{ t.booking.startTime }}</b>：<span style="color: var(--text-secondary)">{{ fmt(data.startTime) }}</span></p>
      <p><b>{{ t.booking.endTime }}</b>：<span style="color: var(--text-secondary)">{{ fmt(data.endTime) }}</span></p>
      <p><b>{{ t.booking.pickupLocation }}</b>：<span style="color: var(--text-secondary)">{{ data.pickupLocation }}</span></p>
      <p><b>{{ t.booking.returnLocation }}</b>：<span style="color: var(--text-secondary)">{{ data.returnLocation }}</span></p>
      <p><b>{{ t.booking.status }}</b>：<span style="color: var(--text-secondary)">{{ t.booking.statusLabels[data.status] }}</span></p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ t.common.confirm }}</button>
    </div>
  `,
})
export class BookingDetailDialogComponent {
  protected readonly t = ZH_TW;
  readonly data = inject<RentalBooking>(MAT_DIALOG_DATA);
  readonly customerStore = inject(CustomerStore);
  private vehicleStore = inject(VehicleStore);
  readonly fmt = fmtDateTime;
  get plate(): string {
    return this.vehicleStore.vehicles().find(v => v.id === this.data.vehicleId)?.plateNumber ?? '—';
  }
}
