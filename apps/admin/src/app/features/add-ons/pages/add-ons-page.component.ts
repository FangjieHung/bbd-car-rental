import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { AddOn } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { AddOnStore } from '../../../stores/addon/addon.store';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { PageToolbarComponent } from '../../../shared/ui/page-toolbar.component';
import { HeaderToolbarDirective } from '../../../layout/header/header-toolbar-slot';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import { AddOnDialogComponent, AddOnFormResult } from '../dialogs/add-on-dialog.component';

@Component({
  selector: 'app-add-ons-page',
  imports: [
    DataTableComponent,
    DataTableCellDirective,
    MatButtonModule,
    PageToolbarComponent,
    HeaderToolbarDirective,
  ],
  templateUrl: './add-ons-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class AddOnsPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(AddOnStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<AddOn>[] = [
    { key: 'name', label: this.t.addOn.name, primary: true },
    { key: 'unitPrice', label: this.t.addOn.unitPrice, primary: true, align: 'end' },
    {
      key: 'unit',
      label: this.t.addOn.unit,
      exportValue: (a) => this.t.addOn.unitLabels[a.unit],
    },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  onExportFailed(e: Error): void {
    this.snackBar.open(e.message, undefined, { duration: 3000 });
  }

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
