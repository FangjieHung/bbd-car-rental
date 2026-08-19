import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { DateRange, VehicleGroup } from '../date-range';
import { DualMonthRangePickerComponent, SelectedDateRange } from './dual-month-range-picker.component';

const LOCATIONS = ['機場', '港口', '店舖'] as const;
const DEFAULT_LOCATION = '機場';

const defaultTime = (hour: number): Date => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date;
};

const VEHICLE_GROUPS: { value: VehicleGroup; label: string }[] = [
  { value: 'scooter', label: '機車' },
  { value: 'car', label: '汽車' },
];

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
  protected readonly vehicleGroups = VEHICLE_GROUPS;

  protected vehicleGroup: VehicleGroup = 'car';
  protected startDate: Date | null = null;
  protected endDate: Date | null = null;
  protected startTime: Date | null = defaultTime(9);
  protected endTime: Date | null = defaultTime(9);
  protected pickupLocation = DEFAULT_LOCATION;
  protected returnLocation = DEFAULT_LOCATION;

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
      this.vehicleGroup = this.dateRange.vehicleGroup ?? 'car';
      // 帶回來的兩地不同 → 視為使用者曾手動指定，之後改取車地點不要覆蓋掉
      this.returnLocationTouched =
        !!this.dateRange.returnLocation &&
        this.dateRange.returnLocation !== this.dateRange.pickupLocation;
    }
  }

  protected get isValid(): boolean {
    return !!(this.startDate && this.endDate);
  }

  protected onVehicleGroupChange(group: VehicleGroup): void {
    this.vehicleGroup = group;
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
      startDateTime: this.combine(this.startDate!, this.startTime ?? defaultTime(9)),
      endDateTime: this.combine(this.endDate!, this.endTime ?? defaultTime(9)),
      pickupLocation: this.pickupLocation,
      returnLocation: this.returnLocation,
      vehicleGroup: this.vehicleGroup,
    });
  }

  private combine(date: Date, time: Date): string {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(combined.getHours())}:${pad(combined.getMinutes())}`;
  }
}
