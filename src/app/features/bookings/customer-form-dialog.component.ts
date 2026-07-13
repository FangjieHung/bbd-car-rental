import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Customer } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';

@Component({
  selector: 'app-customer-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data ? t.common.edit : t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-3 !pt-2">
      <mat-form-field><mat-label>{{ t.customer.name }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field><mat-label>{{ t.customer.phone }}</mat-label><input matInput formControlName="phone" /></mat-form-field>
      <mat-form-field><mat-label>{{ t.customer.idNumber }}</mat-label><input matInput formControlName="idNumber" /></mat-form-field>
      <mat-form-field><mat-label>{{ t.customer.note }}</mat-label><input matInput formControlName="note" /></mat-form-field>
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
})
export class CustomerFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<CustomerFormDialogComponent>);
  readonly data = inject<Customer | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    phone: [this.data?.phone ?? '', Validators.required],
    idNumber: [this.data?.idNumber ?? ''],
    note: [this.data?.note ?? ''],
  });

  save(): void {
    if (this.form.valid) this.ref.close(this.form.getRawValue());
  }
}
