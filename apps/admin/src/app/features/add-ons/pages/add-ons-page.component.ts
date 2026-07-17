import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AddOn } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { AddOnStore } from '../../../stores/addon/addon.store';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { AddOnDialogComponent, AddOnFormResult } from '../dialogs/add-on-dialog.component';

@Component({
  selector: 'app-add-ons-page',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './add-ons-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class AddOnsPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(AddOnStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly columns = ['name', 'unitPrice', 'unit', 'actions'];

  async openForm(addOn: AddOn | null): Promise<void> {
    const ref = this.dialog.open(AddOnDialogComponent, { data: addOn, width: '420px' });
    const result: AddOnFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      if (addOn) this.store.update(addOn.id, result);
      else this.store.create(result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async remove(addOn: AddOn): Promise<void> {
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    try {
      this.store.remove(addOn.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }
}
