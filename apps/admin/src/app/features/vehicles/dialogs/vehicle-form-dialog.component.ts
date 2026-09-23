import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RENTAL_BRANCHES, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';

export interface VehicleFormResult {
  plateNumber: string;
  category: Vehicle['category'];
  model: string;
  brand: string;
  year: number;
  displacement?: number;
  mileage: number;
  nextServiceMileage?: number;
  insuranceExpiry?: string;
  location?: string;
}

@Component({
  selector: 'app-vehicle-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './vehicle-form-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class VehicleFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<VehicleFormDialogComponent>);
  readonly data = inject<Vehicle | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);
  readonly branches = RENTAL_BRANCHES;
  private readonly initialInsuranceExpiry = toDateInputValue(this.data?.insuranceExpiry);

  form = this.fb.group({
    plateNumber: [this.data?.plateNumber ?? '', Validators.required],
    category: [this.data?.category ?? ('scooter' as Vehicle['category']), Validators.required],
    model: [this.data?.model ?? '', Validators.required],
    brand: [this.data?.brand ?? '', Validators.required],
    year: [this.data?.year ?? new Date().getFullYear(), [Validators.required, Validators.min(0)]],
    displacement: [this.data?.displacement ?? null],
    mileage: [this.data?.mileage ?? 0, [Validators.required, Validators.min(0)]],
    nextServiceMileage: [this.data?.nextServiceMileage ?? null],
    insuranceExpiry: [this.initialInsuranceExpiry],
    location: [this.data?.location ?? ''],
  });

  save(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      // 沒改動就原樣保留既有值（可能是完整 ISO 時間），不因輸入框格式轉換而改寫資料。
      const insuranceExpiry =
        raw.insuranceExpiry === this.initialInsuranceExpiry ? this.data?.insuranceExpiry : raw.insuranceExpiry;
      const result: VehicleFormResult = {
        plateNumber: raw.plateNumber,
        category: raw.category,
        model: raw.model,
        brand: raw.brand,
        year: raw.year,
        mileage: raw.mileage,
        ...(raw.displacement != null ? { displacement: raw.displacement } : {}),
        ...(raw.nextServiceMileage != null ? { nextServiceMileage: raw.nextServiceMileage } : {}),
        ...(insuranceExpiry ? { insuranceExpiry } : {}),
        ...(raw.location ? { location: raw.location } : {}),
      };
      this.ref.close(result);
    }
  }
}

/** 原生 `<input type="date">` 只接受 `yyyy-MM-dd`；既有資料可能是完整 ISO 時間，依使用者當地日期轉換。 */
function toDateInputValue(value: string | undefined): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
