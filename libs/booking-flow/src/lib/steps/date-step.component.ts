import { Component, EventEmitter, Input, Output, OnChanges, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  DUAL_MONTH_RANGE_PICKER_LABELS,
  DualMonthRangePickerComponent,
  SelectedDateRange,
} from '@car-rental/ui';
import { injectBookingFlowI18n } from '../i18n/booking-flow-i18n';
import { DateRange, VehicleGroup } from '../date-range';

const defaultTime = (hour: number): Date => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date;
};

@Component({
  selector: 'lib-date-step',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, DualMonthRangePickerComponent],
  templateUrl: './date-step.component.html',
  styleUrl: './date-step.component.scss',
  // 選擇器搬到 libs/ui 之後不內建任何文字（同 DataTableLabels 的作法），這裡把官網字典的
  // 那一組交給它。取的是建立元件當下的語言；切語言會重建這一步，所以不必另外做成 signal。
  providers: [
    {
      provide: DUAL_MONTH_RANGE_PICKER_LABELS,
      useFactory: () => injectBookingFlowI18n().t().labels.dateRangePicker,
    },
  ],
})
export class DateStepComponent implements OnChanges {
  protected readonly i18n = injectBookingFlowI18n();

  @Input() dateRange: DateRange | null = null;
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  protected readonly vehicleGroups = computed(() => this.i18n.t().labels.vehicleGroups);

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

  protected search(): void {
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
