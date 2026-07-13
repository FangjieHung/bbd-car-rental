import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Customer } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { CustomerStore } from '../../stores/customer.store';
import { confirm } from '../../shared/confirm-dialog.component';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';

@Component({
  selector: 'app-customers-page',
  imports: [MatButtonModule],
  template: `
    <div class="pt-6 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <h1 class="v-page-title">{{ t.customer.title }}</h1>
        <button mat-flat-button (click)="openForm(null)">{{ t.common.create }}</button>
      </div>
      @if (store.customers().length === 0) {
        <p class="text-sm" style="color: var(--text-tertiary)">{{ t.common.empty }}</p>
      } @else {
        <div class="v-card overflow-x-auto !p-0">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left" style="border-bottom: 1px solid var(--border-subtle)">
                <th class="py-3 px-4" style="color: var(--text-tertiary)">{{ t.customer.name }}</th>
                <th style="color: var(--text-tertiary)">{{ t.customer.phone }}</th>
                <th style="color: var(--text-tertiary)">{{ t.customer.idNumber }}</th>
                <th style="color: var(--text-tertiary)">{{ t.customer.note }}</th>
                <th style="color: var(--text-tertiary)">{{ t.common.actions }}</th>
              </tr>
            </thead>
            <tbody>
              @for (c of store.customers(); track c.id) {
                <tr style="border-bottom: 1px solid var(--border-subtle)">
                  <td class="py-3 px-4">{{ c.name }}</td>
                  <td style="color: var(--text-secondary)">{{ c.phone }}</td>
                  <td style="color: var(--text-secondary)">{{ c.idNumber ?? '—' }}</td>
                  <td style="color: var(--text-secondary)">{{ c.note ?? '' }}</td>
                  <td>
                    <button mat-button (click)="openForm(c)">{{ t.common.edit }}</button>
                    <button mat-button color="warn" (click)="remove(c)">{{ t.common.delete }}</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
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
