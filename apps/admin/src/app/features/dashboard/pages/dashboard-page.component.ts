import { Component, computed, inject } from '@angular/core';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime, isSameDay } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { CustomerStore } from '../../../stores/customer/customer.store';
import { MaintenanceStore } from '../../../stores/maintenance/maintenance.store';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class DashboardPageComponent {
  protected readonly t = ZH_TW;
  readonly vehicleStore = inject(VehicleStore);
  readonly customerStore = inject(CustomerStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private bookingStore = inject(BookingStore);
  readonly fmt = fmtDateTime;
  readonly statusKeys = ['available', 'rented', 'maintenance', 'reserved'] as const;

  readonly todayPickups = computed(() =>
    this.bookingStore
      .bookings()
      .filter((b) => b.status === 'confirmed' && isSameDay(new Date(b.startTime), new Date())),
  );

  readonly todayReturns = computed(() =>
    this.bookingStore
      .bookings()
      .filter((b) => b.status === 'in_progress' && isSameDay(new Date(b.endTime), new Date())),
  );

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find((v) => v.id === id)?.plateNumber ?? '—';
  }
}
