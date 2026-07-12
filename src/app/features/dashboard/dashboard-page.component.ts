import { Component, computed, inject } from '@angular/core';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime, isSameDay } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';
import { MaintenanceStore } from '../../stores/maintenance.store';

@Component({
  selector: 'app-dashboard-page',
  template: `
    <div class="p-4 grid gap-4 md:grid-cols-2">
      <!-- 今日取車 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.todayPickups }}</h2>
        @if (todayPickups().length === 0) {
          <p class="text-gray-500 text-sm">{{ t.dashboard.none }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (b of todayPickups(); track b.id) {
              <li>{{ plateOf(b.vehicleId) }}｜{{ customerStore.nameOf(b.customerId) }}｜{{ fmt(b.startTime) }}</li>
            }
          </ul>
        }
      </section>

      <!-- 今日還車 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.todayReturns }}</h2>
        @if (todayReturns().length === 0) {
          <p class="text-gray-500 text-sm">{{ t.dashboard.none }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (b of todayReturns(); track b.id) {
              <li>{{ plateOf(b.vehicleId) }}｜{{ customerStore.nameOf(b.customerId) }}｜{{ fmt(b.endTime) }}</li>
            }
          </ul>
        }
      </section>

      <!-- 保養警示 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.alerts }}</h2>
        @if (maintenanceStore.alerts().length === 0) {
          <p class="text-gray-500 text-sm">{{ t.maintenance.noAlerts }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (a of maintenanceStore.alerts(); track a.vehicleId + a.ruleType) {
              <li [class.text-red-700]="a.status === 'overdue'" [class.text-yellow-700]="a.status === 'upcoming'">
                {{ plateOf(a.vehicleId) }}：{{ a.status === 'overdue' ? t.maintenance.overdue : t.maintenance.upcoming }}
              </li>
            }
          </ul>
        }
      </section>

      <!-- 車輛狀態 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.statusCounts }}</h2>
        <div class="grid grid-cols-2 gap-2 text-sm">
          @for (s of statusKeys; track s) {
            <div class="flex justify-between border rounded px-2 py-1">
              <span>{{ t.vehicle.statusLabels[s] }}</span>
              <b>{{ vehicleStore.statusCounts()[s] }}</b>
            </div>
          }
        </div>
      </section>
    </div>
  `,
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
    this.bookingStore.bookings().filter(
      b => b.status === 'confirmed' && isSameDay(new Date(b.startTime), new Date()),
    ),
  );

  readonly todayReturns = computed(() =>
    this.bookingStore.bookings().filter(
      b => b.status === 'in_progress' && isSameDay(new Date(b.endTime), new Date()),
    ),
  );

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === id)?.plateNumber ?? '—';
  }
}
