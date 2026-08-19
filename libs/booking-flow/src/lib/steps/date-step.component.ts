import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { DateRange } from '../booking-flow.component';
import { DualMonthRangePickerComponent, SelectedDateRange } from './dual-month-range-picker.component';

const LOCATIONS = ['機場', '港口', '店舖'] as const;

@Component({
  selector: 'app-date-step',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTimepickerModule,
    MatButtonModule,
    DualMonthRangePickerComponent,
  ],
  templateUrl: './date-step.component.html',
  styleUrl: './date-step.component.scss',
})
export class DateStepComponent {
  @Input() dateRange: DateRange | null = null;
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  protected readonly locations = LOCATIONS;

  protected startDate: Date | null = null;
  protected endDate: Date | null = null;
  protected startTime: Date | null = null;
  protected endTime: Date | null = null;
  protected pickupLocation = '';
  protected returnLocation = '';

  /** 使用者是否自己指定過還車地點——是的話就停止跟著取車地點連動 */
  private returnLocationTouched = false;

  ngOnChanges(): void {
    if (this.dateRange) {
      const start = new Date(this.dateRange.startDateTime);
      const end = new Date(this.dateRange.endDateTime);
      this.startDate = start;
      this.endDate = end;
      this.startTime = start;
      this.endTime = end;
      this.pickupLocation = this.dateRange.pickupLocation;
      this.returnLocation = this.dateRange.returnLocation;
      // 帶回來的兩地不同 → 視為使用者曾手動指定，之後改取車地點不要覆蓋掉
      this.returnLocationTouched =
        !!this.dateRange.returnLocation &&
        this.dateRange.returnLocation !== this.dateRange.pickupLocation;
    }
  }

  protected get isValid(): boolean {
    return !!(
      this.startDate &&
      this.endDate &&
      this.startTime &&
      this.endTime &&
      this.pickupLocation &&
      this.returnLocation
    );
  }

  protected onPickupLocationChange(location: string): void {
    this.pickupLocation = location;
    // 多數人原地還車，先預帶同一個地點；使用者仍可自行改成別的
    if (!this.returnLocationTouched) {
      this.returnLocation = location;
    }
  }

  protected onReturnLocationChange(location: string): void {
    this.returnLocation = location;
    this.returnLocationTouched = true;
  }

  protected onRangeSelected(range: SelectedDateRange): void {
    this.startDate = range.start;
    this.endDate = range.end;
  }

  protected confirm(): void {
    if (!this.isValid) return;
    this.dateRangeChange.emit({
      startDateTime: this.combine(this.startDate!, this.startTime!),
      endDateTime: this.combine(this.endDate!, this.endTime!),
      pickupLocation: this.pickupLocation,
      returnLocation: this.returnLocation,
    });
  }

  private combine(date: Date, time: Date): string {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(combined.getHours())}:${pad(combined.getMinutes())}`;
  }
}
