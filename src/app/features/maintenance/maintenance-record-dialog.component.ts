import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaintenanceRecord, MaintenanceType } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { VehicleStore } from '../../stores/vehicle.store';

export interface RecordFormResult extends Omit<MaintenanceRecord, 'id'> {}

const TYPES: MaintenanceType[] = ['oil_change', 'tire', 'brake', 'inspection', 'other'];

@Component({
  selector: 'app-maintenance-record-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-3 !pt-2">
      <mat-form-field>
        <mat-label>{{ t.booking.vehicle }}</mat-label>
        <mat-select formControlName="vehicleId">
          @for (v of vehicleStore.vehicles(); track v.id) {
            <mat-option [value]="v.id">{{ v.plateNumber }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.type }}</mat-label>
        <mat-select formControlName="type">
          @for (mt of types; track mt) {
            <mat-option [value]="mt">{{ t.maintenance.typeLabels[mt] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.performedAt }}</mat-label>
        <input matInput type="date" formControlName="performedDate" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.mileageAtService }}</mat-label>
        <input matInput type="number" formControlName="mileageAtService" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.nextDueMileage }}</mat-label>
        <input matInput type="number" formControlName="nextDueMileage" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.nextDueDate }}</mat-label>
        <input matInput type="date" formControlName="nextDueDate" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.cost }}</mat-label>
        <input matInput type="number" formControlName="cost" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.notes }}</mat-label>
        <input matInput formControlName="notes" />
      </mat-form-field>
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
})
export class MaintenanceRecordDialogComponent {
  protected readonly t = ZH_TW;
  readonly types = TYPES;
  readonly ref = inject(MatDialogRef<MaintenanceRecordDialogComponent>);
  readonly vehicleStore = inject(VehicleStore);
  /** data: 預選車輛 id（完修流程帶入）；null 為自由新增 */
  readonly data = inject<string | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    vehicleId: [this.data ?? '', Validators.required],
    type: ['oil_change' as MaintenanceType, Validators.required],
    performedDate: [new Date().toISOString().slice(0, 10), Validators.required],
    mileageAtService: [0, [Validators.required, Validators.min(0)]],
    nextDueMileage: [null as number | null],
    nextDueDate: [''],
    cost: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  save(): void {
    if (!this.form.valid) return;
    const v = this.form.getRawValue();
    const result: RecordFormResult = {
      vehicleId: v.vehicleId,
      type: v.type,
      performedAt: new Date(v.performedDate).toISOString(),
      mileageAtService: v.mileageAtService,
      nextDueMileage: v.nextDueMileage ?? undefined,
      nextDueDate: v.nextDueDate ? new Date(v.nextDueDate).toISOString() : undefined,
      cost: v.cost,
      notes: v.notes,
    };
    this.ref.close(result);
  }
}
