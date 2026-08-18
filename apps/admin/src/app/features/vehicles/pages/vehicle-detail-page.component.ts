import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { MaintenanceRecord } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MaintenanceStore } from '../../../stores/maintenance/maintenance.store';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import {
  MaintenanceRecordDialogComponent,
  RecordFormResult,
} from '../../maintenance/dialogs/maintenance-record-dialog.component';

@Component({
  selector: 'app-vehicle-detail-page',
  imports: [DataTableComponent, DataTableCellDirective, MatButtonModule, RouterLink],
  templateUrl: './vehicle-detail-page.component.html',
  styleUrls: ['../../../app.scss', './vehicle-detail-page.component.scss'],
})
export class VehicleDetailPageComponent {
  protected readonly t = ZH_TW;
  private readonly route = inject(ActivatedRoute);
  readonly vehicleStore = inject(VehicleStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly fmt = fmtDateTime;
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly vehicleId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  readonly vehicle = computed(() =>
    this.vehicleStore.vehicles().find((v) => v.id === this.vehicleId()),
  );

  readonly records = computed(() =>
    this.maintenanceStore.records().filter((r) => r.vehicleId === this.vehicleId()),
  );

  readonly columns: DataTableColumn<MaintenanceRecord>[] = [
    {
      key: 'type',
      label: this.t.maintenance.type,
      primary: true,
      exportValue: (r) => this.t.maintenance.typeLabels[r.type],
    },
    {
      key: 'performedAt',
      label: this.t.maintenance.performedAt,
      primary: true,
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
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  async addRecord(): Promise<void> {
    const id = this.vehicleId();
    const ref = this.dialog.open(MaintenanceRecordDialogComponent, { data: id, width: '420px' });
    const result: RecordFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (result) this.maintenanceStore.addRecord(result);
  }
}
