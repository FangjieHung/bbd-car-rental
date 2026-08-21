import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { DateRange, DateStepComponent } from '@car-rental/booking-flow';
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
import { pickVehicle } from '../../bookings/dialogs/vehicle-picker-dialog.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    CalendarViewComponent,
    PageToolbarComponent,
    HeaderToolbarDirective,
    MatButtonModule,
    MatBadgeModule,
    RouterLink,
    DateStepComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class DashboardPageComponent {
  readonly bookingStore = inject(BookingStore);
  readonly customerStore = inject(CustomerStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private readonly todayDate = startOfDay(new Date());

  private readonly dialog = inject(MatDialog);

  readonly targetDate = signal(startOfDay(new Date()));

  async onQuickRange(range: DateRange): Promise<void> {
    await pickVehicle(this.dialog, range);
  }

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
