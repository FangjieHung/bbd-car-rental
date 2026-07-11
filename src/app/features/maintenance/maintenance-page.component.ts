import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MaintenanceAlert, Vehicle } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime } from '../../core/date-utils';
import { MaintenanceStore } from '../../stores/maintenance.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { MaintenanceRecordDialogComponent, RecordFormResult } from './maintenance-record-dialog.component';

@Component({
  selector: 'app-maintenance-page',
  imports: [MatButtonModule],
  template: `
    <div class="p-4 flex flex-col gap-6">
      <!-- 提醒 -->
      <section>
        <h1 class="text-xl font-bold mb-2">{{ t.maintenance.alerts }}</h1>
        @if (store.alerts().length === 0) {
          <p class="text-gray-500">{{ t.maintenance.noAlerts }}</p>
        } @else {
          <div class="flex flex-col gap-2">
            @for (a of store.alerts(); track a.vehicleId + a.ruleType) {
              <div class="rounded-md p-3 text-sm"
                   [class.bg-red-50]="a.status === 'overdue'"
                   [class.text-red-800]="a.status === 'overdue'"
                   [class.bg-yellow-50]="a.status === 'upcoming'"
                   [class.text-yellow-800]="a.status === 'upcoming'">
                <b>{{ plateOf(a.vehicleId) }}</b>：
                {{ a.status === 'overdue' ? t.maintenance.overdue : t.maintenance.upcoming }}
                （{{ a.ruleType === 'mileage' ? t.maintenance.byMileage : t.maintenance.byDate }}
                {{ a.ruleType === 'mileage' ? a.threshold + ' km' : fmt('' + a.threshold) }}）
              </div>
            }
          </div>
        }
      </section>

      <!-- 車輛送修/完修 -->
      <section>
        <h2 class="font-bold mb-2">{{ t.vehicle.status }}</h2>
        <div class="flex flex-col gap-1">
          @for (v of vehicleStore.vehicles(); track v.id) {
            <div class="flex items-center gap-3 text-sm border-b py-1">
              <span class="w-28">{{ v.plateNumber }}</span>
              <span class="w-20">{{ t.vehicle.statusLabels[v.status] }}</span>
              @if (v.status === 'available') {
                <button mat-button (click)="send(v)">{{ t.maintenance.sendToMaintenance }}</button>
              }
              @if (v.status === 'maintenance') {
                <button mat-button (click)="completeFix(v)">{{ t.maintenance.completeMaintenance }}</button>
              }
            </div>
          }
        </div>
      </section>

      <!-- 紀錄 -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-bold">{{ t.maintenance.records }}</h2>
          <button mat-flat-button (click)="addRecord()">{{ t.common.create }}</button>
        </div>
        @if (store.records().length === 0) {
          <p class="text-gray-500">{{ t.common.empty }}</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left border-b">
                  <th class="py-2">{{ t.booking.vehicle }}</th>
                  <th>{{ t.maintenance.type }}</th>
                  <th>{{ t.maintenance.performedAt }}</th>
                  <th>{{ t.maintenance.mileageAtService }}</th>
                  <th>{{ t.maintenance.nextDueMileage }}</th>
                  <th>{{ t.maintenance.nextDueDate }}</th>
                  <th>{{ t.maintenance.cost }}</th>
                </tr>
              </thead>
              <tbody>
                @for (r of store.records(); track r.id) {
                  <tr class="border-b">
                    <td class="py-2">{{ plateOf(r.vehicleId) }}</td>
                    <td>{{ t.maintenance.typeLabels[r.type] }}</td>
                    <td>{{ fmt(r.performedAt) }}</td>
                    <td>{{ r.mileageAtService }}</td>
                    <td>{{ r.nextDueMileage ?? '—' }}</td>
                    <td>{{ r.nextDueDate ? fmt(r.nextDueDate) : '—' }}</td>
                    <td>{{ r.cost }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
})
export class MaintenancePageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(MaintenanceStore);
  readonly vehicleStore = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly fmt = fmtDateTime;

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === id)?.plateNumber ?? '—';
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
