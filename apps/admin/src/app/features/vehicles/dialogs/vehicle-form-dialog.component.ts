import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Vehicle } from '../../../core/models';
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

  form = this.fb.group({
    plateNumber: [this.data?.plateNumber ?? '', Validators.required],
    category: [this.data?.category ?? ('scooter' as Vehicle['category']), Validators.required],
    model: [this.data?.model ?? '', Validators.required],
    brand: [this.data?.brand ?? '', Validators.required],
    year: [this.data?.year ?? new Date().getFullYear(), [Validators.required, Validators.min(0)]],
    displacement: [this.data?.displacement ?? null],
    mileage: [this.data?.mileage ?? 0, [Validators.required, Validators.min(0)]],
    nextServiceMileage: [this.data?.nextServiceMileage ?? null],
    insuranceExpiry: [this.data?.insuranceExpiry ?? ''],
  });

  save(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const result: VehicleFormResult = {
        plateNumber: raw.plateNumber,
        category: raw.category,
        model: raw.model,
        brand: raw.brand,
        year: raw.year,
        mileage: raw.mileage,
        ...(raw.displacement != null ? { displacement: raw.displacement } : {}),
        ...(raw.nextServiceMileage != null ? { nextServiceMileage: raw.nextServiceMileage } : {}),
        ...(raw.insuranceExpiry ? { insuranceExpiry: raw.insuranceExpiry } : {}),
      };
      this.ref.close(result);
    }
  }
}
