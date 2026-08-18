import { OverlayModule } from '@angular/cdk/overlay';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DateRange, MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface SelectedDateRange {
  start: Date;
  end: Date;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

@Component({
  selector: 'app-dual-month-range-picker',
  imports: [OverlayModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  templateUrl: './dual-month-range-picker.component.html',
  styleUrl: './dual-month-range-picker.component.scss',
})
export class DualMonthRangePickerComponent implements OnChanges {
  @Input() start: Date | null = null;
  @Input() end: Date | null = null;
  @Input() placeholder = '選擇日期範圍';
  @Output() rangeSelected = new EventEmitter<SelectedDateRange>();

  @ViewChild('leftCal') private leftCal?: MatCalendar<Date>;
  @ViewChild('rightCal') private rightCal?: MatCalendar<Date>;

  protected isOpen = false;
  protected leftMonth = startOfMonth(new Date());
  protected selectedRange = new DateRange<Date>(null, null);

  private pendingStart: Date | null = null;
  private pendingEnd: Date | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['start'] || changes['end']) {
      this.pendingStart = this.start;
      this.pendingEnd = this.end;
      this.selectedRange = new DateRange<Date>(this.start, this.end);
      if (this.start) {
        this.leftMonth = startOfMonth(this.start);
      }
    }
  }

  protected get rightMonth(): Date {
    return addMonths(this.leftMonth, 1);
  }

  protected get displayValue(): string {
    if (!this.start || !this.end) return '';
    return `${this.formatDate(this.start)} - ${this.formatDate(this.end)}`;
  }

  protected monthLabel(month: Date): string {
    return `${month.getFullYear()}年${month.getMonth() + 1}月`;
  }

  protected open(): void {
    this.isOpen = true;
  }

  protected close(): void {
    this.isOpen = false;
  }

  protected goPrev(): void {
    this.shiftMonths(-1);
  }

  protected goNext(): void {
    this.shiftMonths(1);
  }

  protected onDateClicked(date: Date | null): void {
    if (!date) return;
    if (!this.pendingStart || this.pendingEnd) {
      this.pendingStart = date;
      this.pendingEnd = null;
    } else if (date < this.pendingStart) {
      this.pendingStart = date;
    } else {
      this.pendingEnd = date;
    }
    this.selectedRange = new DateRange<Date>(this.pendingStart, this.pendingEnd);

    if (this.pendingStart && this.pendingEnd) {
      this.rangeSelected.emit({ start: this.pendingStart, end: this.pendingEnd });
      this.isOpen = false;
    }
  }

  /**
   * `activeDate` is a plain setter rather than an `@Input`, so the two calendars have to be
   * moved imperatively. Initial positioning goes through `[startAt]` instead, which the
   * calendar reads in `ngAfterContentInit` — binding it avoids a visible jump on open.
   */
  private shiftMonths(delta: number): void {
    this.leftMonth = addMonths(this.leftMonth, delta);
    if (this.leftCal) this.leftCal.activeDate = this.leftMonth;
    if (this.rightCal) this.rightCal.activeDate = this.rightMonth;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  }
}
