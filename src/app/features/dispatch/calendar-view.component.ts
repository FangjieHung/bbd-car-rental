import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { addDays, fmtDateTime, isSameDay, startOfDay } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking/booking.store';
import { VehicleStore } from '../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../stores/customer/customer.store';

const ACTIVE: RentalBooking['status'][] = ['confirmed', 'in_progress'];

export function dayStats(
  bookings: RentalBooking[],
  totalVehicles: number,
  day: Date,
): { pickups: number; returns: number; available: number } {
  const active = bookings.filter(b => ACTIVE.includes(b.status));
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const pickups = active.filter(b => isSameDay(new Date(b.startTime), day)).length;
  const returns = active.filter(b => isSameDay(new Date(b.endTime), day)).length;
  const occupied = new Set(
    active
      .filter(b => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart)
      .map(b => b.vehicleId),
  );
  return { pickups, returns, available: totalVehicles - occupied.size };
}

@Component({
  selector: 'app-calendar-view',
  imports: [MatButtonModule],
  template: `
    <div class="flex items-center gap-2 mb-2">
      <button mat-button (click)="shiftMonth(-1)">{{ t.dispatch.prevMonth }}</button>
      <span class="font-bold">{{ monthLabel() }}</span>
      <button mat-button (click)="shiftMonth(1)">{{ t.dispatch.nextMonth }}</button>
    </div>
    <div class="grid grid-cols-7 gap-px text-xs rounded-lg overflow-hidden" style="background: var(--mat-sys-outline-variant)">
      @for (d of monthDays(); track d.getTime()) {
        <button
          class="p-2 min-h-16 text-left cursor-pointer transition-colors hover:[background:var(--mat-sys-surface-container-high)]"
          style="background: var(--mat-sys-surface)"
          [class.opacity-40]="d.getMonth() !== month().getMonth()"
          [style.background]="selected() && isSameDay(d, selected()!) ? 'var(--app-positive-bg)' : null"
          (click)="selected.set(d)">
          <div class="font-bold" [style.color]="isSameDay(d, todayDate) ? 'var(--mat-sys-primary)' : null">{{ d.getDate() }}</div>
          <div style="color: var(--mat-sys-on-surface-variant)">{{ t.dispatch.pickups }}{{ statsOf(d).pickups }} {{ t.dispatch.returns }}{{ statsOf(d).returns }}</div>
          <div style="color: var(--mat-sys-on-surface-variant)">{{ t.dispatch.available }} {{ statsOf(d).available }}</div>
        </button>
      }
    </div>
    @if (selected(); as sel) {
      <div class="mt-4">
        <h2 class="font-bold mb-2">{{ t.dispatch.dayDetail }}（{{ sel.getMonth() + 1 }}/{{ sel.getDate() }}）</h2>
        @if (dayBookings(sel).length === 0) {
          <p class="text-sm" style="color: var(--mat-sys-on-surface-variant)">{{ t.common.empty }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (b of dayBookings(sel); track b.id) {
              <li class="ui-card !p-3">
                {{ plateOf(b.vehicleId) }}｜{{ customerStore.nameOf(b.customerId) }}｜
                {{ fmt(b.startTime) }} → {{ fmt(b.endTime) }}｜{{ t.booking.statusLabels[b.status] }}
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export class CalendarViewComponent {
  protected readonly t = ZH_TW;
  private bookingStore = inject(BookingStore);
  private vehicleStore = inject(VehicleStore);
  readonly customerStore = inject(CustomerStore);
  readonly fmt = fmtDateTime;
  readonly isSameDay = isSameDay;

  readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly selected = signal<Date | null>(null);
  readonly todayDate = new Date();

  readonly monthLabel = computed(() => `${this.month().getFullYear()} / ${this.month().getMonth() + 1}`);

  readonly monthDays = computed(() => {
    const first = this.month();
    const gridStart = addDays(first, -first.getDay()); // 週日開頭
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  });

  shiftMonth(n: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + n, 1));
    this.selected.set(null);
  }

  statsOf(d: Date) {
    return dayStats(this.bookingStore.bookings(), this.vehicleStore.vehicles().length, d);
  }

  dayBookings(d: Date): RentalBooking[] {
    const dayStart = startOfDay(d);
    const dayEnd = addDays(dayStart, 1);
    return this.bookingStore
      .bookings()
      .filter(b => (b.status === 'confirmed' || b.status === 'in_progress'))
      .filter(b => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart);
  }

  plateOf(vehicleId: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === vehicleId)?.plateNumber ?? '—';
  }
}
