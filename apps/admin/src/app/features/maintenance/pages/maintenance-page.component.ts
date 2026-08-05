import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { MaintenanceAlert, MaintenanceRecord, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { MaintenanceStore } from '../../../stores/maintenance/maintenance.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import {
  MaintenanceRecordDialogComponent,
  RecordFormResult,
} from '../dialogs/maintenance-record-dialog.component';

@Component({
  selector: 'app-maintenance-page',
  imports: [DataTableComponent, DataTableCellDirective, MatButtonModule],
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

  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<MaintenanceRecord>[] = [
    {
      key: 'vehicleId',
      label: this.t.booking.vehicle,
      primary: true,
      exportValue: (r) => this.plateOf(r.vehicleId),
    },
    {
      key: 'type',
      label: this.t.maintenance.type,
      primary: true,
      exportValue: (r) => this.t.maintenance.typeLabels[r.type],
    },
    {
      key: 'performedAt',
      label: this.t.maintenance.performedAt,
      exportValue: (r) => this.fmt(r.performedAt),
    },
    { key: 'mileageAtService', label: this.t.maintenance.mileageAtService, align: 'end' },
    {
      key: 'nextDueMileage',
      label: this.t.maintenance.nextDueMileage,
      align: 'end',
      exportValue: (r) => r.nextDueMileage ?? '—',
    },
    {
      key: 'nextDueDate',
      label: this.t.maintenance.nextDueDate,
      exportValue: (r) => (r.nextDueDate ? this.fmt(r.nextDueDate) : '—'),
    },
    { key: 'cost', label: this.t.maintenance.cost, align: 'end' },
  ];

  onExportFailed(e: Error): void {
    this.snackBar.open(e.message, undefined, { duration: 3000 });
  }

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
