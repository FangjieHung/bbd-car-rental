import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { ZH_TW } from '../core/i18n/zh-tw';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-content>{{ message }}</div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ t.common.cancel }}</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">{{ t.common.confirm }}</button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  protected readonly t = ZH_TW;
  readonly message = inject<string>(MAT_DIALOG_DATA);
}

export async function confirm(dialog: MatDialog, message: string): Promise<boolean> {
  const ref = dialog.open(ConfirmDialogComponent, { data: message, width: '320px' });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
