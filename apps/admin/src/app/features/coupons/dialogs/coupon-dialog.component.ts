import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Coupon, VehicleCategory } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';

export type CouponFormResult = Omit<Coupon, 'id'>;

@Component({
  selector: 'app-coupon-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './coupon-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class CouponDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<CouponDialogComponent>);
  readonly data = inject<Coupon | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  readonly categories: VehicleCategory[] = ['car', 'scooter', 'ev'];

  form = this.fb.group({
    code: [this.data?.code ?? '', Validators.required],
    type: [this.data?.type ?? ('percent' as Coupon['type']), Validators.required],
    value: [this.data?.value ?? 0, [Validators.required, Validators.min(0)]],
    minDays: [this.data?.minDays ?? null],
    applicableCategories: [this.data?.applicableCategories ?? ([] as VehicleCategory[])],
    validFrom: [this.data?.validFrom ?? '', Validators.required],
    validTo: [this.data?.validTo ?? '', Validators.required],
  });

  save(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const result: CouponFormResult = {
        code: raw.code,
        type: raw.type,
        value: raw.value,
        validFrom: raw.validFrom,
        validTo: raw.validTo,
        ...(raw.minDays != null ? { minDays: raw.minDays } : {}),
        ...(raw.applicableCategories.length > 0
          ? { applicableCategories: raw.applicableCategories }
          : {}),
      };
      this.ref.close(result);
    }
  }
}
