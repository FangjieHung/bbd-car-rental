import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
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
import {
  BookingFormDialogComponent,
  BookingFormResult,
} from '../../bookings/dialogs/booking-form-dialog.component';
import { BookingWorkspaceService } from '../../bookings/services/booking-workspace.service';

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
  private readonly workspace = inject(BookingWorkspaceService);

  readonly targetDate = signal(startOfDay(new Date()));

  /**
   * 快速查詢選到車輛後，直接開新增訂單精靈並預填車輛與時段，讓查詢直接接上建立訂單。
   * 精靈本身已經完成建立訂單（含會員/款項/合約/提醒）的完整原子寫入序列並自行處理失敗訊息，
   * 這裡只在精靈成功關閉後直接開工作區，不必再呼叫 BookingStore.create() 或自行 catch 錯誤。
   */
  async onQuickRange(range: DateRange): Promise<void> {
    const vehicle = await pickVehicle(this.dialog, range);
    if (!vehicle) return;

    const formRef = this.dialog.open(BookingFormDialogComponent, {
      data: { vehicleId: vehicle.id, startTime: range.startDateTime, endTime: range.endDateTime },
      width: '80vw',
      maxWidth: '800px',
      maxHeight: '90dvh',
      panelClass: 'booking-form-wizard-dialog',
    });
    const result: BookingFormResult | undefined = await firstValueFrom(formRef.afterClosed());
    if (!result) return;
    this.workspace.open(result.bookingId);
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
