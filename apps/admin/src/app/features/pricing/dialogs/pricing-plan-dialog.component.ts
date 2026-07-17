import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PricingPlan } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';

export type PricingPlanFormResult = Omit<PricingPlan, 'id'>;

@Component({
  selector: 'app-pricing-plan-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './pricing-plan-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class PricingPlanDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<PricingPlanDialogComponent>);
  readonly data = inject<PricingPlan | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    appliesToCategory: [
      this.data?.appliesToCategory ?? ('scooter' as PricingPlan['appliesToCategory']),
      Validators.required,
    ],
    weekday: [this.data?.dayTypeRates.weekday ?? 0, [Validators.required, Validators.min(0)]],
    weekend: [this.data?.dayTypeRates.weekend ?? 0, [Validators.required, Validators.min(0)]],
    holiday: [this.data?.dayTypeRates.holiday ?? 0, [Validators.required, Validators.min(0)]],
    peak: [this.data?.dayTypeRates.peak ?? 0, [Validators.required, Validators.min(0)]],
    tiers: this.fb.array(
      (this.data?.tiers ?? []).map((tier) =>
        this.fb.group({
          minDays: [tier.minDays, [Validators.required, Validators.min(1)]],
          discountPercent: [tier.discountPercent, [Validators.required, Validators.min(0)]],
        }),
      ),
    ),
  });

  get tiers(): FormArray<FormGroup> {
    return this.form.controls.tiers as unknown as FormArray<FormGroup>;
  }

  addTier(): void {
    this.tiers.push(
      this.fb.group({
        minDays: [1, [Validators.required, Validators.min(1)]],
        discountPercent: [0, [Validators.required, Validators.min(0)]],
      }),
    );
  }

  removeTier(index: number): void {
    this.tiers.removeAt(index);
  }

  save(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const result: PricingPlanFormResult = {
        name: raw.name,
        appliesToCategory: raw.appliesToCategory,
        dayTypeRates: {
          weekday: raw.weekday,
          weekend: raw.weekend,
          holiday: raw.holiday,
          peak: raw.peak,
        },
        tiers: raw.tiers,
      };
      this.ref.close(result);
    }
  }
}
