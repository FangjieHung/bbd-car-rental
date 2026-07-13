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
  template: `
    <div class="pt-6 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <h1 class="v-page-title">{{ t.vehicle.title }}</h1>
        <button mat-flat-button (click)="openForm(null)">{{ t.common.create }}</button>
      </div>

      @if (store.vehicles().length === 0) {
        <p class="text-sm" style="color: var(--text-tertiary)">{{ t.common.empty }}</p>
      } @else {
        <div class="v-card overflow-x-auto !p-0">
          <table mat-table [dataSource]="store.vehicles()" class="w-full">
            <ng-container matColumnDef="plateNumber">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.plateNumber }}</th>
              <td mat-cell *matCellDef="let v">{{ v.plateNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.type }}</th>
              <td mat-cell *matCellDef="let v">{{ t.vehicle.typeLabels[v.type] }}</td>
            </ng-container>
            <ng-container matColumnDef="model">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.model }}</th>
              <td mat-cell *matCellDef="let v">{{ v.model }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.status }}</th>
              <td mat-cell *matCellDef="let v">
                <app-status-chip [label]="t.vehicle.statusLabels[v.status]" [tone]="toneOf(v)" />
              </td>
            </ng-container>
            <ng-container matColumnDef="mileage">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.mileage }}</th>
              <td mat-cell *matCellDef="let v">{{ v.mileage }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ t.common.actions }}</th>
              <td mat-cell *matCellDef="let v">
                <button mat-button (click)="openForm(v)">{{ t.common.edit }}</button>
                <button mat-button color="warn" (click)="remove(v)">{{ t.common.delete }}</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns" style="border-color: var(--border-subtle)"></tr>
          </table>
        </div>
      }
    </div>
  `,
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
