import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { addDays, fmtDate, fmtDateTime, isSameDay, startOfDay } from '../../../core/date-utils';
import { RentalBooking } from '../../../core/models';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../../stores/customer/customer.store';
import { MaintenanceStore } from '../../../stores/maintenance/maintenance.store';
import { TimelineViewComponent } from '../../dispatch/timeline-view/timeline-view.component';
import { CalendarViewComponent } from '../../dispatch/calendar-view/calendar-view.component';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';

const ACTIVE: RentalBooking['status'][] = ['confirmed', 'in_progress'];

export interface WorkListRow {
  id: string;
  booking: RentalBooking;
  kind: 'pickup' | 'return';
}

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DataTableComponent,
    DataTableCellDirective,
    TimelineViewComponent,
    CalendarViewComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class DashboardPageComponent {
  protected readonly t = ZH_TW;
  readonly vehicleStore = inject(VehicleStore);
  readonly bookingStore = inject(BookingStore);
  readonly customerStore = inject(CustomerStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly statusKeys = ['available', 'rented', 'maintenance', 'reserved'] as const;

  readonly dispatchView = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => (p.get('view') === 'calendar' ? 'calendar' : 'timeline')),
    ),
    { initialValue: 'timeline' as const },
  );

  setDispatchView(view: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  readonly labels = ADMIN_DATA_TABLE_LABELS;
  readonly fmt = fmtDateTime;
  readonly targetDate = signal(startOfDay(new Date()));

  private readonly todayShortcutDate = startOfDay(new Date());
  private readonly tomorrowShortcutDate = addDays(this.todayShortcutDate, 1);
  readonly todayToggleLabel = `${this.t.dashboard.today} (${fmtDate(this.todayShortcutDate)})`;
  readonly tomorrowToggleLabel = `${this.t.dashboard.tomorrow} (${fmtDate(this.tomorrowShortcutDate)})`;

  readonly selectedDate = computed<'today' | 'tomorrow' | ''>(() => {
    const date = this.targetDate();
    const today = startOfDay(new Date());
    if (isSameDay(date, today)) return 'today';
    if (isSameDay(date, addDays(today, 1))) return 'tomorrow';
    return '';
  });

  setSelectedDate(value: string): void {
    const today = startOfDay(new Date());
    this.targetDate.set(value === 'tomorrow' ? addDays(today, 1) : today);
  }

  selectCalendarDate(date: Date): void {
    this.targetDate.set(startOfDay(date));
  }

  readonly workListColumns: DataTableColumn<WorkListRow>[] = [
    { key: 'vehicle', label: '車輛', primary: true },
    { key: 'customer', label: '客戶' },
    { key: 'time', label: '時間' },
    { key: 'location', label: '地點' },
    { key: 'transport', label: '班次' },
    { key: 'wash', label: '洗車' },
    { key: 'contact', label: '聯絡', exportSkip: true },
    { key: 'payment', label: '付款' },
  ];

  private readonly activeBookings = computed(() =>
    this.bookingStore.bookings().filter((b) => ACTIVE.includes(b.status)),
  );

  readonly pickupWorkRows = computed<WorkListRow[]>(() =>
    this.activeBookings()
      .filter((b) => isSameDay(new Date(b.startTime), this.targetDate()))
      .map((booking) => ({ id: `pickup-${booking.id}`, booking, kind: 'pickup' })),
  );

  readonly returnWorkRows = computed<WorkListRow[]>(() =>
    this.activeBookings()
      .filter((b) => isSameDay(new Date(b.endTime), this.targetDate()))
      .map((booking) => ({ id: `return-${booking.id}`, booking, kind: 'return' })),
  );

  readonly returnPreviewRows = computed<WorkListRow[]>(() => {
    if (this.returnWorkRows().length > 0) return [];
    const tomorrow = addDays(this.targetDate(), 1);
    return this.activeBookings()
      .filter((b) => isSameDay(new Date(b.endTime), tomorrow))
      .map((booking) => ({ id: `preview-${booking.id}`, booking, kind: 'return' }));
  });

  readonly showReturnPreview = computed(
    () => this.returnWorkRows().length === 0 && this.returnPreviewRows().length > 0,
  );

  readonly returnSectionRows = computed<WorkListRow[]>(() =>
    this.showReturnPreview() ? this.returnPreviewRows() : this.returnWorkRows(),
  );

  returnTimeLabel(row: WorkListRow): string {
    const time = this.fmt(row.booking.endTime);
    return this.showReturnPreview() ? `（明日 ${time} 還車）` : time;
  }

  vehicleLabel(row: WorkListRow): string {
    const vehicle = this.vehicleStore.vehicles().find((v) => v.id === row.booking.vehicleId);
    return vehicle ? `${vehicle.plateNumber} (${vehicle.model})` : '—';
  }

  customerName(row: WorkListRow): string {
    return this.customerStore.nameOf(row.booking.customerId);
  }

  location(row: WorkListRow): string {
    return row.kind === 'pickup' ? row.booking.pickupLocation || '—' : row.booking.returnLocation || '—';
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

  dateLabel(date: Date): string {
    return fmtDate(date);
  }

  tomorrowDate(): Date {
    return addDays(this.targetDate(), 1);
  }

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find((v) => v.id === id)?.plateNumber ?? '—';
  }
}
