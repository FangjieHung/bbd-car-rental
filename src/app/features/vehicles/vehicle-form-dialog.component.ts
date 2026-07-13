import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Vehicle } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';

export interface VehicleFormResult {
  plateNumber: string;
  type: Vehicle['type'];
  model: string;
  mileage: number;
}

@Component({
  selector: 'app-vehicle-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ data ? t.common.edit : t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-3 !pt-2">
      <mat-form-field>
        <mat-label>{{ t.vehicle.plateNumber }}</mat-label>
        <input matInput formControlName="plateNumber" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.vehicle.type }}</mat-label>
        <mat-select formControlName="type">
          <mat-option value="scooter">{{ t.vehicle.typeLabels['scooter'] }}</mat-option>
          <mat-option value="car">{{ t.vehicle.typeLabels['car'] }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.vehicle.model }}</mat-label>
        <input matInput formControlName="model" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.vehicle.mileage }}</mat-label>
        <input matInput type="number" formControlName="mileage" />
      </mat-form-field>
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
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
