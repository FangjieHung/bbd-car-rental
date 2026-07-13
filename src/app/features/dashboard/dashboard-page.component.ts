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
    <div class="pt-6 flex flex-col gap-5">
      <h1 class="v-page-title">{{ t.nav.dashboard }}</h1>

      <!-- 車輛狀態統計：大數字卡列，available 用深 teal hero 卡 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (s of statusKeys; track s) {
          <div [class]="s === 'available' ? 'v-card-dark' : 'v-card'">
            <div class="v-stat-number text-3xl md:text-4xl">{{ vehicleStore.statusCounts()[s] }}</div>
            <div class="mt-1.5 text-sm" [class.text-cream-600]="s !== 'available'"
                 [style.color]="s === 'available' ? 'var(--text-on-inverse-muted)' : null">
              {{ t.vehicle.statusLabels[s] }}
            </div>
          </div>
        }
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <!-- 今日取車 -->
        <section class="v-card">
          <div class="v-card-label mb-0.5">{{ t.dashboard.todayPickups }}</div>
          <div class="font-display font-bold text-lg mb-3">{{ todayPickups().length }} 筆</div>
          @if (todayPickups().length === 0) {
            <p class="text-sm" style="color: var(--text-tertiary)">{{ t.dashboard.none }}</p>
          } @else {
            <ul class="text-sm flex flex-col">
              @for (b of todayPickups(); track b.id) {
                <li class="flex items-center justify-between gap-3 py-2 border-b last:border-b-0" style="border-color: var(--border-subtle)">
                  <span class="font-semibold">{{ plateOf(b.vehicleId) }}</span>
                  <span style="color: var(--text-secondary)">{{ customerStore.nameOf(b.customerId) }}</span>
                  <span class="font-mono text-xs" style="color: var(--text-tertiary)">{{ fmt(b.startTime) }}</span>
                </li>
              }
            </ul>
          }
        </section>

        <!-- 今日還車 -->
        <section class="v-card">
          <div class="v-card-label mb-0.5">{{ t.dashboard.todayReturns }}</div>
          <div class="font-display font-bold text-lg mb-3">{{ todayReturns().length }} 筆</div>
          @if (todayReturns().length === 0) {
            <p class="text-sm" style="color: var(--text-tertiary)">{{ t.dashboard.none }}</p>
          } @else {
            <ul class="text-sm flex flex-col">
              @for (b of todayReturns(); track b.id) {
                <li class="flex items-center justify-between gap-3 py-2 border-b last:border-b-0" style="border-color: var(--border-subtle)">
                  <span class="font-semibold">{{ plateOf(b.vehicleId) }}</span>
                  <span style="color: var(--text-secondary)">{{ customerStore.nameOf(b.customerId) }}</span>
                  <span class="font-mono text-xs" style="color: var(--text-tertiary)">{{ fmt(b.endTime) }}</span>
                </li>
              }
            </ul>
          }
        </section>

        <!-- 保養警示 -->
        <section class="v-card md:col-span-2">
          <div class="v-card-label mb-0.5">{{ t.dashboard.alerts }}</div>
          <div class="font-display font-bold text-lg mb-3">{{ maintenanceStore.alerts().length }} 筆</div>
          @if (maintenanceStore.alerts().length === 0) {
            <p class="text-sm" style="color: var(--text-tertiary)">{{ t.maintenance.noAlerts }}</p>
          } @else {
            <ul class="text-sm flex flex-wrap gap-2">
              @for (a of maintenanceStore.alerts(); track a.vehicleId + a.ruleType) {
                <li
                  class="inline-flex items-center gap-1.5 rounded-full font-semibold"
                  style="padding: 5px 12px; font-size: 12px"
                  [style.background]="a.status === 'overdue' ? 'var(--status-error-bg)' : 'var(--status-warning-bg)'"
                  [style.color]="a.status === 'overdue' ? 'var(--status-error-fg)' : 'var(--status-warning-fg)'"
                >
                  <span class="rounded-full shrink-0" style="width: 6px; height: 6px"
                        [style.background]="a.status === 'overdue' ? 'var(--status-error-dot)' : 'var(--status-warning-dot)'"></span>
                  {{ plateOf(a.vehicleId) }}：{{ a.status === 'overdue' ? t.maintenance.overdue : t.maintenance.upcoming }}
                </li>
              }
            </ul>
          }
        </section>
      </div>
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
