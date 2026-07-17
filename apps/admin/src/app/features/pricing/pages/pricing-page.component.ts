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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { PricingPlan } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { PricingStore } from '../../../stores/pricing/pricing.store';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import {
  PricingPlanDialogComponent,
  PricingPlanFormResult,
} from '../dialogs/pricing-plan-dialog.component';

type RangeGroup = FormGroup<{ start: FormControl<string>; end: FormControl<string> }>;

@Component({
  selector: 'app-pricing-page',
  imports: [MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './pricing-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class PricingPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(PricingStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);

  readonly columns = ['name', 'appliesToCategory', 'weekday', 'weekend', 'holiday', 'peak', 'tiers', 'actions'];

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

  async openForm(plan: PricingPlan | null): Promise<void> {
    const ref = this.dialog.open(PricingPlanDialogComponent, { data: plan, width: '480px' });
    const result: PricingPlanFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      if (plan) this.store.updatePlan(plan.id, result);
      else this.store.createPlan(result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async remove(plan: PricingPlan): Promise<void> {
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    try {
      this.store.removePlan(plan.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  tiersSummary(plan: PricingPlan): string {
    if (plan.tiers.length === 0) return this.t.common.empty;
    return plan.tiers.map((tier) => `滿${tier.minDays}天 -${tier.discountPercent}%`).join('、');
  }
}
