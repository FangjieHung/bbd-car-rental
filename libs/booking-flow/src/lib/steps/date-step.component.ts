import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DateRange, VehicleGroup } from '../date-range';
import { DualMonthRangePickerComponent, SelectedDateRange } from './dual-month-range-picker.component';

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
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, DualMonthRangePickerComponent],
  templateUrl: './date-step.component.html',
  styleUrl: './date-step.component.scss',
})
export class DateStepComponent {
  @Input() dateRange: DateRange | null = null;
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  protected readonly vehicleGroups = VEHICLE_GROUPS;

  protected vehicleGroup: VehicleGroup = 'car';
  protected startDate: Date | null = null;
  protected endDate: Date | null = null;
  /** 沒有 UI 可調整；只是把上一步（vehicle-step 篩選器）帶回來的時間原樣保留，避免改日期時被重置成預設值 */
  private startTime: Date = defaultTime(9);
  private endTime: Date = defaultTime(9);

  ngOnChanges(): void {
    if (this.dateRange) {
      const start = new Date(this.dateRange.startDateTime);
      const end = new Date(this.dateRange.endDateTime);
      this.startDate = start;
      this.endDate = end;
      this.startTime = start;
      this.endTime = end;
      this.vehicleGroup = this.dateRange.vehicleGroup ?? 'car';
    }
  }

  protected get isValid(): boolean {
    return !!(this.startDate && this.endDate);
  }

  protected onVehicleGroupChange(group: VehicleGroup): void {
    this.vehicleGroup = group;
  }

  protected onRangeSelected(range: SelectedDateRange): void {
    this.startDate = range.start;
    this.endDate = range.end;
  }

  protected confirm(): void {
    if (!this.isValid) return;
    this.dateRangeChange.emit({
      startDateTime: this.combine(this.startDate!, this.startTime),
      endDateTime: this.combine(this.endDate!, this.endTime),
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
