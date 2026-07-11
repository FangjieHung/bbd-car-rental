import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Vehicle, VehicleStatus, VehicleType } from '../core/models';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../core/repositories/tokens';
import { ZH_TW } from '../core/i18n/zh-tw';

const ALLOWED: Record<VehicleStatus, VehicleStatus[]> = {
  available: ['reserved', 'rented', 'maintenance'],
  reserved: ['rented', 'available'],
  rented: ['available'],
  maintenance: ['available'],
};

@Injectable({ providedIn: 'root' })
export class VehicleStore {
  private repo = inject(VEHICLE_REPO);
  private bookingRepo = inject(BOOKING_REPO);
  private maintenanceRepo = inject(MAINTENANCE_REPO);

  private _vehicles = signal<Vehicle[]>(this.repo.getAll());
  readonly vehicles: Signal<Vehicle[]> = this._vehicles.asReadonly();

  readonly statusCounts = computed(() => {
    const counts: Record<VehicleStatus, number> = { available: 0, rented: 0, maintenance: 0, reserved: 0 };
    for (const v of this._vehicles()) counts[v.status]++;
    return counts;
  });

  create(input: { plateNumber: string; type: VehicleType; model: string; mileage: number }): Vehicle {
    this.assertPlateUnique(input.plateNumber);
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      ...input,
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    this.repo.create(vehicle);
    this.reload();
    return vehicle;
  }

  update(id: string, patch: { plateNumber?: string; model?: string; mileage?: number }): void {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    if (patch.plateNumber !== undefined && patch.plateNumber !== current.plateNumber) {
      this.assertPlateUnique(patch.plateNumber);
    }
    if (patch.mileage !== undefined && patch.mileage < current.mileage) {
      throw new Error(ZH_TW.vehicle.mileageDecrease);
    }
    this.repo.update(id, patch);
    this.reload();
  }

  transition(id: string, to: VehicleStatus): void {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    if (!ALLOWED[current.status].includes(to)) {
      throw new Error(ZH_TW.vehicle.invalidTransition);
    }
    this.repo.update(id, { status: to });
    this.reload();
  }

  remove(id: string): void {
    const hasActiveBooking = this.bookingRepo.getAll().some(
      b => b.vehicleId === id && (b.status === 'confirmed' || b.status === 'in_progress'),
    );
    const hasRecords = this.maintenanceRepo.getAll().some(r => r.vehicleId === id);
    if (hasActiveBooking || hasRecords) throw new Error(ZH_TW.vehicle.deleteBlocked);
    this.repo.remove(id);
    this.reload();
  }

  reload(): void {
    this._vehicles.set(this.repo.getAll());
  }

  private assertPlateUnique(plate: string): void {
    if (this.repo.getAll().some(v => v.plateNumber === plate)) {
      throw new Error(ZH_TW.vehicle.plateDuplicate);
    }
  }
}
