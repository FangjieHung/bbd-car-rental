import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ResponsivePanelComponent } from '@car-rental/ui';
import { VehicleStepComponent } from '@car-rental/booking-flow';
import { RentalBooking, Vehicle, calculatePrice } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { addDays, fmtDateTime, isSameDay, startOfDay } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../../stores/customer/customer.store';
import { PricingStore } from '../../../stores/pricing/pricing.store';

const NARROW_QUERY = '(max-width: 1024px)';

function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const ACTIVE: RentalBooking['status'][] = ['confirmed', 'in_progress'];

interface WorkListRow {
  id: string;
  booking: RentalBooking;
  kind: 'pickup' | 'return';
}

type PanelTab = 'pickup' | 'return' | 'available';
const PANEL_TABS: PanelTab[] = ['pickup', 'return', 'available'];

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

export interface DayProgress {
  total: number;
  done: number;
  pending: number;
}

export function pickupProgress(bookings: RentalBooking[], day: Date): DayProgress {
  const relevant = bookings.filter(
    (b) =>
      isSameDay(new Date(b.startTime), day) &&
      (b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'completed'),
  );
  const done = relevant.filter((b) => b.status !== 'confirmed').length;
  return { total: relevant.length, done, pending: relevant.length - done };
}

export function returnProgress(bookings: RentalBooking[], day: Date): DayProgress {
  const relevant = bookings.filter(
    (b) =>
      isSameDay(new Date(b.endTime), day) && (b.status === 'in_progress' || b.status === 'completed'),
  );
  const done = relevant.filter((b) => b.status === 'completed').length;
  return { total: relevant.length, done, pending: relevant.length - done };
}

@Component({
  selector: 'app-calendar-view',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatTabsModule,
    ResponsivePanelComponent,
    VehicleStepComponent,
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss', '../../../app.scss'],
})
export class CalendarViewComponent {
  protected readonly t = ZH_TW;
  private bookingStore = inject(BookingStore);
  private vehicleStore = inject(VehicleStore);
  private pricingStore = inject(PricingStore);
  readonly customerStore = inject(CustomerStore);
  readonly fmt = fmtDateTime;
  readonly isSameDay = isSameDay;

  readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly selected = signal<Date | null>(null);
  readonly panelDismissed = signal(true);
  readonly panelTab = signal<PanelTab>('pickup');
  readonly targetDate = input<Date>(startOfDay(new Date()));
  readonly dateSelected = output<Date>();
  readonly todayDate = new Date();

  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly isNarrow = toSignal(
    this.breakpointObserver.observe([NARROW_QUERY]).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  readonly monthLabel = computed(
    () => `${this.month().getFullYear()} / ${this.month().getMonth() + 1}`,
  );

  readonly monthDays = computed(() => {
    const first = this.month();
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  });

  readonly panelOpen = computed(
    () => this.selected() !== null && (!this.isNarrow() || !this.panelDismissed()),
  );

  readonly panelTabIndex = computed(() => PANEL_TABS.indexOf(this.panelTab()));

  onPanelTabIndexChange(index: number): void {
    this.panelTab.set(PANEL_TABS[index] ?? 'pickup');
  }

  readonly panelHeading = computed(() => {
    const sel = this.selected();
    return sel
      ? `${sel.getMonth() + 1}/${sel.getDate()} 星期${this.t.dispatch.weekdays[sel.getDay()]}`
      : '';
  });

  readonly relativeDayLabel = computed(() => {
    const sel = this.selected();
    if (!sel) return null;
    const today = startOfDay(this.todayDate);
    if (isSameDay(sel, today)) return '今天';
    if (isSameDay(sel, addDays(today, 1))) return '明天';
    if (isSameDay(sel, addDays(today, 2))) return '後天';
    return null;
  });

  /** 自己 emit 出去、預期會由 targetDate 繞回來的日期；用來辨識 effect 收到的是不是回音。 */
  private lastEmitted: number | null = null;

  constructor() {
    let isFirstRun = true;
    effect(() => {
      const date = startOfDay(this.targetDate());
      // 只有「外部」指定的日期才自動把面板叫出來；自己 emit 繞回來的不算，
      // 否則 goToToday 想保持面板收起也會被這裡覆蓋掉。
      const isEcho = this.lastEmitted === date.getTime();
      this.lastEmitted = null;
      this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
      this.selected.set(date);
      this.panelTab.set('pickup');
      if (!isFirstRun && !isEcho) {
        this.panelDismissed.set(false);
      }
      isFirstRun = false;
    });
  }

  private emitSelection(date: Date): void {
    this.lastEmitted = date.getTime();
    this.dateSelected.emit(date);
  }

  shiftMonth(n: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + n, 1));
    this.selected.set(null);
  }

  /** 只把格線定位／選取到今天，不叫出面板（窄螢幕面板是覆蓋式的，會擋住日曆）。 */
  goToToday(): void {
    const today = startOfDay(this.todayDate);
    this.month.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selected.set(today);
    this.panelTab.set('pickup');
    this.panelDismissed.set(true);
    this.emitSelection(today);
  }

  dismissPanel(): void {
    this.panelDismissed.set(true);
  }

  selectDate(date: Date): void {
    const normalized = startOfDay(date);
    this.selected.set(normalized);
    this.panelDismissed.set(false);
    this.panelTab.set('pickup');
    this.emitSelection(normalized);
  }

  statsOf(d: Date) {
    return dayStats(this.bookingStore.bookings(), this.vehicleStore.vehicles().length, d);
  }

  readonly todayPickupProgress = computed(() =>
    pickupProgress(this.bookingStore.bookings(), this.todayDate),
  );

  readonly todayReturnProgress = computed(() =>
    returnProgress(this.bookingStore.bookings(), this.todayDate),
  );

  private readonly activeBookings = computed(() =>
    this.bookingStore.bookings().filter((b) => ACTIVE.includes(b.status)),
  );

  readonly pickupWorkRows = computed<WorkListRow[]>(() => {
    const day = this.selected();
    if (!day) return [];
    return this.activeBookings()
      .filter((b) => isSameDay(new Date(b.startTime), day))
      .map((booking) => ({ id: `pickup-${booking.id}`, booking, kind: 'pickup' }));
  });

  readonly returnWorkRows = computed<WorkListRow[]>(() => {
    const day = this.selected();
    if (!day) return [];
    return this.activeBookings()
      .filter((b) => isSameDay(new Date(b.endTime), day))
      .map((booking) => ({ id: `return-${booking.id}`, booking, kind: 'return' }));
  });

  readonly availableVehicles = computed<Vehicle[]>(() => {
    const day = this.selected();
    if (!day) return [];
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    const occupied = new Set(
      this.activeBookings()
        .filter((b) => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart)
        .map((b) => b.vehicleId),
    );
    return this.vehicleStore.vehicles().filter((v) => !occupied.has(v.id));
  });

  readonly priceForVehicle = (vehicle: Vehicle): number | null => {
    const day = this.selected();
    if (!day) return null;
    const plan = this.pricingStore.plans().find((p) => p.appliesToCategory === vehicle.category);
    if (!plan) return null;
    const start = toIsoDate(startOfDay(day));
    const end = toIsoDate(addDays(startOfDay(day), 1));
    try {
      return calculatePrice({
        plan,
        calendar: this.pricingStore.calendar(),
        startDate: start,
        endDate: end,
        addOns: [],
      }).total;
    } catch {
      return null;
    }
  };

  vehicleLabel(row: WorkListRow): string {
    const vehicle = this.vehicleStore.vehicles().find((v) => v.id === row.booking.vehicleId);
    return vehicle ? `${vehicle.plateNumber} (${vehicle.model})` : '—';
  }

  customerName(row: WorkListRow): string {
    return this.customerStore.nameOf(row.booking.customerId);
  }

  location(row: WorkListRow): string {
    return row.kind === 'pickup'
      ? row.booking.pickupLocation || '—'
      : row.booking.returnLocation || '—';
  }

  phoneHref(booking: RentalBooking): string | null {
    const phone = this.customerStore.customers().find((c) => c.id === booking.customerId)?.phone;
    return phone ? `tel:${phone}` : null;
  }

  phoneLabel(booking: RentalBooking): string {
    return this.customerStore.customers().find((c) => c.id === booking.customerId)?.phone ?? '—';
  }

  paymentLabel(): string {
    return '—';
  }
}
