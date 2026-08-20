import { Injectable, inject } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateRange, DefaultMatCalendarRangeStrategy } from '@angular/material/datepicker';

/**
 * Reports the date the pointer is over, so a dual-calendar picker can highlight across both panes.
 *
 * Material's own preview is per month view — each one listens to its own `MatCalendarBody`. The
 * pointer is only ever over a single calendar, so with the range starting in the left month and
 * the pointer in the right one, the left month's trailing days never light up. Here `createPreview`
 * is used purely as a hover signal; the caller folds the date into the `[selected]` range that both
 * calendars share, which is what makes the highlight continuous across the month boundary.
 *
 * Providing a strategy does not affect click handling: only `MatDatepickerContent` ever calls
 * `selectionFinished`, and a bare `mat-calendar` is not inside one.
 */
@Injectable()
export class HoverPreviewRangeStrategy extends DefaultMatCalendarRangeStrategy<Date> {
  onHover: ((date: Date | null) => void) | null = null;

  constructor() {
    super(inject<DateAdapter<Date>>(DateAdapter));
  }

  override createPreview(activeDate: Date | null, currentRange: DateRange<Date>): DateRange<Date> {
    this.onHover?.(activeDate);
    return super.createPreview(activeDate, currentRange);
  }
}
