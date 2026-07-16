import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Customer } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { CustomerStore } from '../../../stores/customer.store';
import { confirm } from '../../../shared/confirm-dialog.component';
import { CustomerFormDialogComponent } from '../dialogs/customer-form-dialog.component';

@Component({
  selector: 'app-customers-page',
  imports: [MatButtonModule],
  templateUrl: './customers-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class CustomersPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(CustomerStore);
  private dialog = inject(MatDialog);

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
