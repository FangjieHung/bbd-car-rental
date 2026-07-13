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
  templateUrl: './maintenance-record-dialog.component.html',
  styleUrls: ['./maintenance-record-dialog.component.scss'],
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
