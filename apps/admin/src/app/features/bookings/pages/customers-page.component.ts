import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { Customer } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { CustomerStore } from '../../../stores/customer/customer.store';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { PageToolbarComponent } from '../../../shared/ui/page-toolbar.component';
import { HeaderToolbarDirective } from '../../../layout/header/header-toolbar-slot';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import { CustomerFormDialogComponent } from '../dialogs/customer-form-dialog.component';

@Component({
  selector: 'app-customers-page',
  imports: [
    DataTableComponent,
    DataTableCellDirective,
    MatButtonModule,
    PageToolbarComponent,
    HeaderToolbarDirective,
  ],
  templateUrl: './customers-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class CustomersPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(CustomerStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Customer>[] = [
    { key: 'name', label: this.t.customer.name, primary: true },
    { key: 'phone', label: this.t.customer.phone, primary: true },
    { key: 'idNumber', label: this.t.customer.idNumber, exportValue: (c) => c.idNumber ?? '—' },
    { key: 'note', label: this.t.customer.note, exportValue: (c) => c.note ?? '' },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  onExportFailed(e: Error): void {
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  async openForm(customer: Customer | null): Promise<void> {
    const ref = this.dialog.open(CustomerFormDialogComponent, { data: customer, width: '400px' });
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    if (customer) this.store.update(customer.id, result);
    else this.store.create(result);
  }

  async remove(customer: Customer): Promise<void> {
    if (await confirm(this.dialog, this.t.common.deleteConfirm)) this.store.remove(customer.id);
  }
}
