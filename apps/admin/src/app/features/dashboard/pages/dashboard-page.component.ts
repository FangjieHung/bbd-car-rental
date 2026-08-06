import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime, isSameDay } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../../stores/customer/customer.store';
import { MaintenanceStore } from '../../../stores/maintenance/maintenance.store';
import { TimelineViewComponent } from '../../dispatch/timeline-view.component';
import { CalendarViewComponent } from '../../dispatch/calendar-view.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonToggleModule, TimelineViewComponent, CalendarViewComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class DashboardPageComponent {
  protected readonly t = ZH_TW;
  readonly vehicleStore = inject(VehicleStore);
  readonly customerStore = inject(CustomerStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private bookingStore = inject(BookingStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly fmt = fmtDateTime;
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

  /* 以下今日／明日切換為重建的程式碼——原始版本在一次工作區還原事故中遺失，
     依模板的用法與既有的 todayPickups/todayReturns 邏輯回推，請檢視是否符合原意。 */
  readonly selectedDate = signal<'today' | 'tomorrow'>('today');

  setSelectedDate(value: string): void {
    this.selectedDate.set(value === 'tomorrow' ? 'tomorrow' : 'today');
  }

  private readonly targetDate = computed(() => {
    const d = new Date();
    if (this.selectedDate() === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    return d;
  });

  readonly pickups = computed(() =>
    this.bookingStore
      .bookings()
      .filter(
        (b) => b.status === 'confirmed' && isSameDay(new Date(b.startTime), this.targetDate()),
      ),
  );

  readonly returns = computed(() =>
    this.bookingStore
      .bookings()
      .filter(
        (b) => b.status === 'in_progress' && isSameDay(new Date(b.endTime), this.targetDate()),
      ),
  );

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find((v) => v.id === id)?.plateNumber ?? '—';
  }
}
