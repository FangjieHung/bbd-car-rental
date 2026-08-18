import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateRange } from '../booking-flow.component';
import { DualMonthRangePickerComponent, SelectedDateRange } from './dual-month-range-picker.component';

@Component({
  selector: 'app-date-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, DualMonthRangePickerComponent],
  templateUrl: './date-step.component.html',
  styleUrl: './date-step.component.scss',
})
export class DateStepComponent {
  @Input() dateRange: DateRange | null = null;
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  protected startDate: Date | null = null;
  protected endDate: Date | null = null;
  protected startTime = '';
  protected endTime = '';

  ngOnChanges(): void {
    if (this.dateRange) {
      const start = new Date(this.dateRange.startDateTime);
      const end = new Date(this.dateRange.endDateTime);
      this.startDate = start;
      this.endDate = end;
      this.startTime = this.toTimeString(start);
      this.endTime = this.toTimeString(end);
    }
  }

  protected get isValid(): boolean {
    return !!(this.startDate && this.endDate && this.startTime && this.endTime);
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
    });
  }

  private toTimeString(date: Date): string {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private combine(date: Date, time: string): string {
    const [hh, mm] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hh, mm, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(combined.getHours())}:${pad(combined.getMinutes())}`;
  }
}
