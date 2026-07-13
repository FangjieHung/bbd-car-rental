import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';
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
  template: `
    <h2 mat-dialog-title>{{ data ? t.common.edit : t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-3 !pt-2">
      <mat-form-field>
        <mat-label>{{ t.booking.vehicle }}</mat-label>
        <mat-select formControlName="vehicleId">
          @for (v of vehicleStore.vehicles(); track v.id) {
            <mat-option [value]="v.id">{{ v.plateNumber }}（{{ v.model }}）</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.customer }}</mat-label>
        <mat-select formControlName="customerId">
          @for (c of customerStore.customers(); track c.id) {
            <mat-option [value]="c.id">{{ c.name }}（{{ c.phone }}）</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button mat-button type="button" class="self-start" (click)="createCustomer()">
        {{ t.customer.newInline }}
      </button>
      <mat-form-field>
        <mat-label>{{ t.booking.startTime }}</mat-label>
        <input matInput type="datetime-local" formControlName="startLocal" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.endTime }}</mat-label>
        <input matInput type="datetime-local" formControlName="endLocal" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.pickupLocation }}</mat-label>
        <input matInput formControlName="pickupLocation" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.returnLocation }}</mat-label>
        <input matInput formControlName="returnLocation" />
      </mat-form-field>
      @if (error()) {
        <p class="text-sm whitespace-pre-wrap" style="color: var(--status-error-fg)">{{ error() }}</p>
      }
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
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
