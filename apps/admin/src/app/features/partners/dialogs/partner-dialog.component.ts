import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommissionType, Partner } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { PartnerStore } from '../../../stores/partner/partner.store';

export type PartnerFormResult = Omit<Partner, 'id'>;

@Component({
  selector: 'app-partner-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './partner-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class PartnerDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<PartnerDialogComponent>);
  readonly data = inject<Partner | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);
  private partnerStore = inject(PartnerStore);

  readonly commissionTypes: CommissionType[] = ['percent', 'per_vehicle_day'];

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    slug: [
      this.data?.slug ?? '',
      [Validators.required, (control: AbstractControl): ValidationErrors | null =>
        this.partnerStore.isSlugUnique(control.value, this.data?.id) ? null : { duplicate: true }],
    ],
    discountPercent: [this.data?.discountPercent ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
    commissionType: [this.data?.commission.type ?? ('percent' as CommissionType), Validators.required],
    commissionValue: [this.data?.commission.value ?? 0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const result: PartnerFormResult = {
        name: raw.name,
        slug: raw.slug,
        discountPercent: raw.discountPercent,
        commission: { type: raw.commissionType, value: raw.commissionValue },
      };
      this.ref.close(result);
    }
  }
}
