import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MaintenanceAlert, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { MaintenanceStore } from '../../../stores/maintenance/maintenance.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import {
  MaintenanceRecordDialogComponent,
  RecordFormResult,
} from '../dialogs/maintenance-record-dialog.component';

@Component({
  selector: 'app-maintenance-page',
  imports: [MatButtonModule],
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class MaintenancePageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(MaintenanceStore);
  readonly vehicleStore = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly fmt = fmtDateTime;

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find((v) => v.id === id)?.plateNumber ?? '—';
  }

  send(v: Vehicle): void {
    try {
      this.store.sendToMaintenance(v.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async completeFix(v: Vehicle): Promise<void> {
    const ref = this.dialog.open(MaintenanceRecordDialogComponent, { data: v.id, width: '420px' });
    const result: RecordFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      this.store.completeMaintenance(v.id, result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async addRecord(): Promise<void> {
    const ref = this.dialog.open(MaintenanceRecordDialogComponent, { data: null, width: '420px' });
    const result: RecordFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (result) this.store.addRecord(result);
  }
}
