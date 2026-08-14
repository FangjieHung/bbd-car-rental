import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ResponsivePanelComponent } from '@car-rental/ui';
import { RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { addDays, fmtDateTime, isSameDay, startOfDay } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../../stores/customer/customer.store';

const ACTIVE: RentalBooking['status'][] = ['confirmed', 'in_progress'];

export function dayStats(
  bookings: RentalBooking[],
  totalVehicles: number,
  day: Date,
): { pickups: number; returns: number; available: number } {
  const active = bookings.filter((b) => ACTIVE.includes(b.status));
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const pickups = active.filter((b) => isSameDay(new Date(b.startTime), day)).length;
  const returns = active.filter((b) => isSameDay(new Date(b.endTime), day)).length;
  const occupied = new Set(
    active
      .filter((b) => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart)
      .map((b) => b.vehicleId),
  );
  return { pickups, returns, available: totalVehicles - occupied.size };
}

@Component({
  selector: 'app-calendar-view',
  imports: [MatButtonModule, ResponsivePanelComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
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
  readonly panelDismissed = signal(false);
  readonly targetDate = input<Date>(startOfDay(new Date()));
  readonly dateSelected = output<Date>();
  readonly todayDate = new Date();

  readonly monthLabel = computed(
    () => `${this.month().getFullYear()} / ${this.month().getMonth() + 1}`,
  );

  readonly monthDays = computed(() => {
    const first = this.month();
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  });

  readonly panelOpen = computed(() => this.selected() !== null && !this.panelDismissed());

  readonly panelHeading = computed(() => {
    const sel = this.selected();
    return sel ? `${this.t.dispatch.dayDetail}（${sel.getMonth() + 1}/${sel.getDate()}）` : '';
  });

  constructor() {
    effect(() => {
      const date = startOfDay(this.targetDate());
      this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
      this.selected.set(date);
      this.panelDismissed.set(false);
    });
  }

  shiftMonth(n: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + n, 1));
    this.selected.set(null);
  }

  dismissPanel(): void {
    this.panelDismissed.set(true);
  }

  selectDate(date: Date): void {
    const normalized = startOfDay(date);
    this.selected.set(normalized);
    this.panelDismissed.set(false);
    this.dateSelected.emit(normalized);
  }

  statsOf(d: Date) {
    return dayStats(this.bookingStore.bookings(), this.vehicleStore.vehicles().length, d);
  }

  dayBookings(d: Date): RentalBooking[] {
    const dayStart = startOfDay(d);
    const dayEnd = addDays(dayStart, 1);
    return this.bookingStore
      .bookings()
      .filter((b) => b.status === 'confirmed' || b.status === 'in_progress')
      .filter((b) => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart);
  }

  plateOf(vehicleId: string): string {
    return this.vehicleStore.vehicles().find((v) => v.id === vehicleId)?.plateNumber ?? '—';
  }
}
