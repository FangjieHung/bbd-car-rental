import { Component, effect, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { PricingStore } from '../../../stores/pricing/pricing.store';

type RangeGroup = FormGroup<{ start: FormControl<string>; end: FormControl<string> }>;

@Component({
  selector: 'app-pricing-calendar-page',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './pricing-calendar-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class PricingCalendarPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(PricingStore);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  readonly calendarForm = this.fb.group({
    holidays: this.fb.array<RangeGroup>([]),
    peakSeasons: this.fb.array<RangeGroup>([]),
  });

  constructor() {
    effect(() => {
      const cal = this.store.calendar();
      this.holidays.clear();
      cal.holidays.forEach((r) => this.holidays.push(this.rangeGroup(r.start, r.end)));
      this.peakSeasons.clear();
      cal.peakSeasons.forEach((r) => this.peakSeasons.push(this.rangeGroup(r.start, r.end)));
    });
  }

  get holidays(): FormArray<RangeGroup> {
    return this.calendarForm.controls.holidays;
  }

  get peakSeasons(): FormArray<RangeGroup> {
    return this.calendarForm.controls.peakSeasons;
  }

  private rangeGroup(start = '', end = ''): RangeGroup {
    return this.fb.group({
      start: [start, Validators.required],
      end: [end, Validators.required],
    });
  }

  addHoliday(): void {
    this.holidays.push(this.rangeGroup());
  }

  removeHoliday(index: number): void {
    this.holidays.removeAt(index);
  }

  addPeakSeason(): void {
    this.peakSeasons.push(this.rangeGroup());
  }

  removePeakSeason(index: number): void {
    this.peakSeasons.removeAt(index);
  }

  saveCalendar(): void {
    if (this.calendarForm.invalid) return;
    const raw = this.calendarForm.getRawValue();
    try {
      this.store.updateCalendar({ holidays: raw.holidays, peakSeasons: raw.peakSeasons });
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }
}
