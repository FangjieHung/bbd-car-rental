import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AddOn } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';

export type AddOnFormResult = Omit<AddOn, 'id'>;

@Component({
  selector: 'app-add-on-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-on-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class AddOnDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<AddOnDialogComponent>);
  readonly data = inject<AddOn | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    unitPrice: [this.data?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
    unit: [this.data?.unit ?? ('per_rental' as AddOn['unit']), Validators.required],
  });

  save(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const result: AddOnFormResult = {
        name: raw.name,
        unitPrice: raw.unitPrice,
        unit: raw.unit,
      };
      this.ref.close(result);
    }
  }
}
