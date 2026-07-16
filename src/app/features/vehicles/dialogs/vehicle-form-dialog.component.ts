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
  type: Vehicle['type'];
  model: string;
  mileage: number;
}

@Component({
  selector: 'app-vehicle-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
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
    type: [this.data?.type ?? ('scooter' as Vehicle['type']), Validators.required],
    model: [this.data?.model ?? '', Validators.required],
    mileage: [this.data?.mileage ?? 0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.valid) this.ref.close(this.form.getRawValue() as VehicleFormResult);
  }
}
