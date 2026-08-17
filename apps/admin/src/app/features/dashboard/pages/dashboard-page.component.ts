import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { startOfDay } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { CustomerStore } from '../../../stores/customer/customer.store';
import { MaintenanceStore } from '../../../stores/maintenance/maintenance.store';
import { PageToolbarComponent } from '../../../shared/ui/page-toolbar.component';
import { HeaderToolbarDirective } from '../../../layout/header/header-toolbar-slot';
import {
  CalendarViewComponent,
  pickupProgress,
  returnProgress,
} from '../../dispatch/calendar-view/calendar-view.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    CalendarViewComponent,
    PageToolbarComponent,
    HeaderToolbarDirective,
    MatButtonModule,
    MatBadgeModule,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class DashboardPageComponent {
  protected readonly t = ZH_TW;
  readonly bookingStore = inject(BookingStore);
  readonly customerStore = inject(CustomerStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private readonly todayDate = startOfDay(new Date());

  readonly targetDate = signal(startOfDay(new Date()));

  selectCalendarDate(date: Date): void {
    this.targetDate.set(startOfDay(date));
  }

  private readonly todayPickup = computed(() =>
    pickupProgress(this.bookingStore.bookings(), this.todayDate),
  );
  readonly todayPickupTotal = computed(() => this.todayPickup().total);
  readonly todayPickupDone = computed(() => this.todayPickup().done);
  readonly todayPickupPending = computed(() => this.todayPickup().pending);

  private readonly todayReturn = computed(() =>
    returnProgress(this.bookingStore.bookings(), this.todayDate),
  );
  readonly todayReturnTotal = computed(() => this.todayReturn().total);
  readonly todayReturnDone = computed(() => this.todayReturn().done);
  readonly todayReturnPending = computed(() => this.todayReturn().pending);

  readonly todayPendingPrepCount = computed(() => this.todayReturnDone());
}
