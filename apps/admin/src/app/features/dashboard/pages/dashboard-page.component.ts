import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { DateRange, DateStepComponent } from '@car-rental/booking-flow';
import { startOfDay } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { MemberStore } from '../../../stores/member/member.store';
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
  readonly memberStore = inject(MemberStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private readonly todayDate = startOfDay(new Date());

  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly targetDate = signal(startOfDay(new Date()));

  /**
   * 快速查詢選到車輛後，直接前往建立訂單頁並以 query params 預填車輛與時段，讓查詢直接接上建立訂單。
   * 建立訂單頁自行完成寫入與成功後的導向；取消時會回到儀表板。
   */
  async onQuickRange(range: DateRange): Promise<void> {
    const vehicle = await pickVehicle(this.dialog, range);
    if (!vehicle) return;
    await this.router.navigate(['/orders/new'], {
      queryParams: {
        vehicleId: vehicle.id,
        start: new Date(range.startDateTime).toISOString(),
        end: new Date(range.endDateTime).toISOString(),
      },
    });
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
