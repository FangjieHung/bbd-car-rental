import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { MaintenanceAlert, MaintenanceRecord } from '../../core/models';
import { MAINTENANCE_REPO } from '../../core/repositories/tokens';
import { VehicleStore } from '../vehicle/vehicle.store';

const MILEAGE_WARN_BEFORE = 300;
const DATE_WARN_DAYS = 7;

@Injectable({ providedIn: 'root' })
export class MaintenanceStore {
  private repo = inject(MAINTENANCE_REPO);
  private vehicleStore = inject(VehicleStore);

  private _records = signal<MaintenanceRecord[]>(this.repo.getAll());
  readonly records: Signal<MaintenanceRecord[]> = this._records.asReadonly();

  readonly alerts = computed(() => this.alertsAt(new Date()));

  alertsAt(now: Date): MaintenanceAlert[] {
    const alerts: MaintenanceAlert[] = [];
    for (const vehicle of this.vehicleStore.vehicles()) {
      const latest = this._records()
        .filter(r => r.vehicleId === vehicle.id)
        .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
      if (!latest) continue;

      if (latest.nextDueMileage !== undefined) {
        if (vehicle.mileage >= latest.nextDueMileage) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'mileage', threshold: latest.nextDueMileage, status: 'overdue' });
        } else if (vehicle.mileage >= latest.nextDueMileage - MILEAGE_WARN_BEFORE) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'mileage', threshold: latest.nextDueMileage, status: 'upcoming' });
        }
      }

      if (latest.nextDueDate !== undefined) {
        const due = new Date(latest.nextDueDate);
        const warnFrom = new Date(due.getTime() - DATE_WARN_DAYS * 86_400_000);
        if (now >= due) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'date', threshold: latest.nextDueDate, status: 'overdue' });
        } else if (now >= warnFrom) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'date', threshold: latest.nextDueDate, status: 'upcoming' });
        }
      }
    }
    return alerts;
  }

  addRecord(input: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord {
    const record: MaintenanceRecord = { id: crypto.randomUUID(), ...input };
    this.repo.create(record);
    this.reload();
    return record;
  }

  sendToMaintenance(vehicleId: string): void {
    this.vehicleStore.transition(vehicleId, 'maintenance');
  }

  completeMaintenance(vehicleId: string, record: Omit<MaintenanceRecord, 'id' | 'vehicleId'>): void {
    this.addRecord({ ...record, vehicleId });
    this.vehicleStore.transition(vehicleId, 'available');
  }

  private reload(): void {
    this._records.set(this.repo.getAll());
  }
}
