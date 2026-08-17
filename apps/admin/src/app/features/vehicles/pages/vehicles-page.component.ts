import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { Vehicle, VehicleStatus, VehicleCategory } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { StatusChipComponent } from '../../../shared/chips/status-chip.component';
import { StatusKey } from '@car-rental/theme-pack';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { PageToolbarComponent } from '../../../shared/ui/page-toolbar.component';
import { HeaderToolbarDirective } from '../../../layout/header/header-toolbar-slot';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import {
  FilterOption,
  FilterSelectComponent,
} from '../../../shared/filters/filter-select.component';
import {
  VehicleFormDialogComponent,
  VehicleFormResult,
} from '../dialogs/vehicle-form-dialog.component';
import { TimelineViewComponent } from '../../dispatch/timeline-view/timeline-view.component';
import { firstValueFrom } from 'rxjs';

const STATUS_KEY: Record<VehicleStatus, StatusKey> = {
  available: 'active',
  rented: 'processing',
  maintenance: 'inactive',
  reserved: 'warning',
};

@Component({
  selector: 'app-vehicles-page',
  imports: [
    DataTableComponent,
    DataTableCellDirective,
    MatButtonModule,
    StatusChipComponent,
    PageToolbarComponent,
    FilterSelectComponent,
    HeaderToolbarDirective,
    TimelineViewComponent,
  ],
  templateUrl: './vehicles-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class VehiclesPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Vehicle>[] = [
    { key: 'plateNumber', label: this.t.vehicle.plateNumber, primary: true },
    {
      key: 'category',
      label: this.t.vehicle.type,
      exportValue: (v) => this.t.vehicle.typeLabels[v.category],
    },
    { key: 'model', label: this.t.vehicle.model },
    {
      key: 'status',
      label: this.t.vehicle.status,
      primary: true,
      exportValue: (v) => this.t.vehicle.statusLabels[v.status],
    },
    { key: 'mileage', label: this.t.vehicle.mileage, align: 'end' },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  readonly searchQuery = signal('');
  readonly typeFilter = signal<VehicleCategory | null>(null);
  readonly statusFilter = signal<VehicleStatus | null>(null);
  readonly selectedVehicles = signal<readonly Vehicle[]>([]);
  readonly viewMode = signal<'table' | 'timeline'>('table');

  readonly typeOptions: FilterOption<VehicleCategory>[] = (
    Object.entries(this.t.vehicle.typeLabels) as [VehicleCategory, string][]
  ).map(([value, label]) => ({ value, label }));

  readonly statusOptions: FilterOption<VehicleStatus>[] = (
    Object.entries(this.t.vehicle.statusLabels) as [VehicleStatus, string][]
  ).map(([value, label]) => ({ value, label }));

  readonly activeFilterCount = computed(() => {
    return (this.typeFilter() ? 1 : 0) + (this.statusFilter() ? 1 : 0);
  });

  readonly filteredVehicles = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();
    return this.store.vehicles().filter((v) => {
      if (type && v.category !== type) return false;
      if (status && v.status !== status) return false;
      if (
        query &&
        !v.plateNumber.toLowerCase().includes(query) &&
        !v.model.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  });

  clearFilters(): void {
    this.typeFilter.set(null);
    this.statusFilter.set(null);
  }

  statusKeyOf(v: Vehicle): StatusKey {
    return STATUS_KEY[v.status];
  }

  onExportFailed(e: Error): void {
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  async openForm(vehicle: Vehicle | null): Promise<void> {
    const ref = this.dialog.open(VehicleFormDialogComponent, { data: vehicle, width: '400px' });
    const result: VehicleFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      if (vehicle) this.store.update(vehicle.id, result);
      else this.store.create(result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async remove(vehicle: Vehicle): Promise<void> {
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    try {
      this.store.remove(vehicle.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async removeSelected(vehicles: readonly Vehicle[]): Promise<void> {
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    for (const vehicle of vehicles) {
      try {
        this.store.remove(vehicle.id);
      } catch (e) {
        this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
      }
    }
    this.selectedVehicles.set([]);
  }
}
