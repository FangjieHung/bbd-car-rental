import { Injectable, Signal, inject, signal } from '@angular/core';
import { RentalBooking } from '../../core/models';
import { BOOKING_REPO } from '../../core/repositories/tokens';
import { VehicleStore } from '../vehicle/vehicle.store';
import { ZH_TW } from '../../core/i18n/zh-tw';

const ACTIVE: RentalBooking['status'][] = ['confirmed', 'in_progress'];

@Injectable({ providedIn: 'root' })
export class BookingStore {
  private repo = inject(BOOKING_REPO);
  private vehicleStore = inject(VehicleStore);

  private _bookings = signal<RentalBooking[]>(this.repo.getAll());
  readonly bookings: Signal<RentalBooking[]> = this._bookings.asReadonly();

  findConflicts(
    vehicleId: string,
    startIso: string,
    endIso: string,
    excludeId?: string,
  ): RentalBooking[] {
    const start = new Date(startIso);
    const end = new Date(endIso);
    return this.repo
      .getAll()
      .filter(
        (b) =>
          b.id !== excludeId &&
          b.vehicleId === vehicleId &&
          ACTIVE.includes(b.status) &&
          start < new Date(b.endTime) &&
          end > new Date(b.startTime),
      );
  }

  create(input: Omit<RentalBooking, 'id' | 'status'>): RentalBooking {
    this.validate(input.vehicleId, input.startTime, input.endTime);
    const booking: RentalBooking = { id: crypto.randomUUID(), ...input, status: 'confirmed' };
    this.repo.create(booking);
    this.reload();
    return booking;
  }

  updateBooking(id: string, patch: Partial<Omit<RentalBooking, 'id' | 'status'>>): void {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    const next = { ...current, ...patch };
    this.validate(next.vehicleId, next.startTime, next.endTime, id);
    this.repo.update(id, patch);
    this.reload();
  }

  pickUp(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'confirmed') throw new Error(ZH_TW.booking.invalidTransition);
    this.vehicleStore.transition(b.vehicleId, 'rented');
    this.repo.update(id, { status: 'in_progress' });
    this.reload();
  }

  complete(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'in_progress') throw new Error(ZH_TW.booking.invalidTransition);
    this.vehicleStore.transition(b.vehicleId, 'available');
    this.repo.update(id, { status: 'completed' });
    this.reload();
  }

  cancel(id: string): void {
    const b = this.mustGet(id);
    if (b.status === 'completed' || b.status === 'cancelled') {
      throw new Error(ZH_TW.booking.invalidTransition);
    }
    if (b.status === 'in_progress') {
      this.vehicleStore.transition(b.vehicleId, 'available');
    }
    this.repo.update(id, { status: 'cancelled' });
    this.reload();
  }

  private validate(vehicleId: string, startIso: string, endIso: string, excludeId?: string): void {
    if (new Date(endIso) <= new Date(startIso)) throw new Error(ZH_TW.booking.endBeforeStart);
    const conflicts = this.findConflicts(vehicleId, startIso, endIso, excludeId);
    if (conflicts.length > 0) {
      throw new Error(`${ZH_TW.booking.conflict} ${conflicts.map((c) => c.id).join(', ')}`);
    }
  }

  private mustGet(id: string): RentalBooking {
    const b = this.repo.getById(id);
    if (!b) throw new Error(`not found: ${id}`);
    return b;
  }

  private reload(): void {
    this._bookings.set(this.repo.getAll());
  }
}
