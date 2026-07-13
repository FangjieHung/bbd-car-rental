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
  templateUrl: './customer-form-dialog.component.html',
  styleUrls: ['./customer-form-dialog.component.scss'],
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
