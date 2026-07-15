import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Vehicle, VehicleStatus, VehicleType } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { VehicleStore } from '../../stores/vehicle.store';
import { StatusChipComponent } from '../../shared/status-chip.component';
import { StatusKey } from '../../core/theme/status-tone';
import { confirm } from '../../shared/confirm-dialog.component';
import { ListToolbarComponent } from '../../shared/list-toolbar.component';
import { FilterOption, FilterSelectComponent } from '../../shared/filter-select.component';
import { VehicleFormDialogComponent, VehicleFormResult } from './vehicle-form-dialog.component';
import { firstValueFrom } from 'rxjs';

const STATUS_KEY: Record<VehicleStatus, StatusKey> = {
  available: 'active', rented: 'processing', maintenance: 'inactive', reserved: 'warning',
};

@Component({
  selector: 'app-vehicles-page',
  imports: [MatTableModule, MatButtonModule, StatusChipComponent, ListToolbarComponent, FilterSelectComponent],
  templateUrl: './vehicles-page.component.html',
  styleUrls: ['./vehicles-page.component.scss'],
})
export class VehiclesPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly columns = ['plateNumber', 'type', 'model', 'status', 'mileage', 'actions'];

  readonly searchQuery = signal('');
  readonly typeFilter = signal<VehicleType | null>(null);
  readonly statusFilter = signal<VehicleStatus | null>(null);

  readonly typeOptions: FilterOption<VehicleType>[] = (
    Object.entries(this.t.vehicle.typeLabels) as [VehicleType, string][]
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
    return this.store.vehicles().filter(v => {
      if (type && v.type !== type) return false;
      if (status && v.status !== status) return false;
      if (query && !v.plateNumber.toLowerCase().includes(query) && !v.model.toLowerCase().includes(query)) {
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
}
