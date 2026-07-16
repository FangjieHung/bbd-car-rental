import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../../stores/customer/customer.store';

@Component({
  selector: 'app-booking-detail-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './booking-detail-dialog.component.html',
  styleUrls: ['../../../app.scss'],
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
