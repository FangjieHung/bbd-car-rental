import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Vehicle, VehicleStatus } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { VehicleStore } from '../../stores/vehicle.store';
import { StatusChipComponent, ChipTone } from '../../shared/status-chip.component';
import { confirm } from '../../shared/confirm-dialog.component';
import { VehicleFormDialogComponent, VehicleFormResult } from './vehicle-form-dialog.component';
import { firstValueFrom } from 'rxjs';

const STATUS_TONE: Record<VehicleStatus, ChipTone> = {
  available: 'green', rented: 'blue', maintenance: 'gray', reserved: 'yellow',
};

@Component({
  selector: 'app-vehicles-page',
  imports: [MatTableModule, MatButtonModule, StatusChipComponent],
  templateUrl: './vehicles-page.component.html',
  styleUrls: ['./vehicles-page.component.scss'],
})
export class VehiclesPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly columns = ['plateNumber', 'type', 'model', 'status', 'mileage', 'actions'];

  toneOf(v: Vehicle): ChipTone {
    return STATUS_TONE[v.status];
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
