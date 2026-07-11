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
    <div mat-dialog-content class="text-sm flex flex-col gap-1">
      <p><b>{{ t.booking.vehicle }}</b>：{{ plate }}</p>
      <p><b>{{ t.booking.customer }}</b>：{{ customerStore.nameOf(data.customerId) }}</p>
      <p><b>{{ t.booking.startTime }}</b>：{{ fmt(data.startTime) }}</p>
      <p><b>{{ t.booking.endTime }}</b>：{{ fmt(data.endTime) }}</p>
      <p><b>{{ t.booking.pickupLocation }}</b>：{{ data.pickupLocation }}</p>
      <p><b>{{ t.booking.returnLocation }}</b>：{{ data.returnLocation }}</p>
      <p><b>{{ t.booking.status }}</b>：{{ t.booking.statusLabels[data.status] }}</p>
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
