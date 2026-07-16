import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { VehicleStore } from '../../../stores/vehicle.store';
import { CustomerStore } from '../../../stores/customer.store';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';

export interface BookingFormResult {
  vehicleId: string;
  customerId: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  pickupLocation: string;
  returnLocation: string;
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-booking-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './booking-form-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class BookingFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<BookingFormDialogComponent>);
  readonly data = inject<RentalBooking | null>(MAT_DIALOG_DATA);
  readonly vehicleStore = inject(VehicleStore);
  readonly customerStore = inject(CustomerStore);
  private dialog = inject(MatDialog);
  private fb = inject(NonNullableFormBuilder);
  readonly error = signal('');

  form = this.fb.group({
    vehicleId: [this.data?.vehicleId ?? '', Validators.required],
    customerId: [this.data?.customerId ?? '', Validators.required],
    startLocal: [this.data ? toLocalInputValue(this.data.startTime) : '', Validators.required],
    endLocal: [this.data ? toLocalInputValue(this.data.endTime) : '', Validators.required],
    pickupLocation: [this.data?.pickupLocation ?? '', Validators.required],
    returnLocation: [this.data?.returnLocation ?? '', Validators.required],
  });

  async createCustomer(): Promise<void> {
    const ref = this.dialog.open(CustomerFormDialogComponent, { data: null, width: '400px' });
    const result = await firstValueFrom(ref.afterClosed());
    if (result) {
      const c = this.customerStore.create(result);
      this.form.patchValue({ customerId: c.id });
    }
  }

  save(): void {
    if (!this.form.valid) return;
    const v = this.form.getRawValue();
    const result: BookingFormResult = {
      vehicleId: v.vehicleId,
      customerId: v.customerId,
      startTime: new Date(v.startLocal).toISOString(),
      endTime: new Date(v.endLocal).toISOString(),
      pickupLocation: v.pickupLocation,
      returnLocation: v.returnLocation,
    };
    this.ref.close(result);
  }

  showError(message: string): void {
    this.error.set(message);
  }
}
