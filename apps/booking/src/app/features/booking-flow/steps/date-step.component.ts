import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateRange } from '../booking-flow.component';

@Component({
  selector: 'app-date-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './date-step.component.html',
  styleUrl: './date-step.component.scss',
})
export class DateStepComponent {
  @Input() dateRange: DateRange | null = null;
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  protected startDateTime = '';
  protected endDateTime = '';

  ngOnChanges(): void {
    if (this.dateRange) {
      this.startDateTime = this.dateRange.startDateTime;
      this.endDateTime = this.dateRange.endDateTime;
    }
  }

  protected confirm(): void {
    if (!this.startDateTime || !this.endDateTime) return;
    this.dateRangeChange.emit({
      startDateTime: this.startDateTime,
      endDateTime: this.endDateTime,
    });
  }
}
