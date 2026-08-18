import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { CatalogStore, DateRange, VehicleStepComponent } from '@car-rental/booking-flow';
import { Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';

@Component({
  selector: 'app-vehicle-picker-dialog',
  imports: [MatDialogModule, MatButtonModule, VehicleStepComponent],
  templateUrl: './vehicle-picker-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class VehiclePickerDialogComponent {
  protected readonly t = ZH_TW;
  protected readonly fmt = fmtDateTime;
  readonly ref = inject<MatDialogRef<VehiclePickerDialogComponent, Vehicle>>(MatDialogRef);
  readonly range = inject<DateRange>(MAT_DIALOG_DATA);
  private catalog = inject(CatalogStore);

  readonly vehicles: Vehicle[] = this.catalog.availableVehicles(
    this.range.startDateTime,
    this.range.endDateTime,
  );

  /** 租期天數，供車款卡片把總價換算成每日單價 */
  readonly days = Math.max(
    1,
    Math.round(
      (new Date(this.range.endDateTime.slice(0, 10) + 'T00:00:00').getTime() -
        new Date(this.range.startDateTime.slice(0, 10) + 'T00:00:00').getTime()) /
        86400000,
    ),
  );

  readonly priceForVehicle = (vehicle: Vehicle): number | null => {
    try {
      return this.catalog.price({
        category: vehicle.category,
        startDate: this.range.startDateTime.slice(0, 10),
        endDate: this.range.endDateTime.slice(0, 10),
        addOns: [],
      }).total;
    } catch {
      return null;
    }
  };
}

export async function pickVehicle(
  dialog: MatDialog,
  range: DateRange,
): Promise<Vehicle | undefined> {
  const ref = dialog.open(VehiclePickerDialogComponent, { data: range, width: '720px' });
  return firstValueFrom(ref.afterClosed());
}
