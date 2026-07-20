import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { Partner } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { PartnerStore } from '../../../stores/partner/partner.store';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { PartnerDialogComponent, PartnerFormResult } from '../dialogs/partner-dialog.component';

@Component({
  selector: 'app-partners-page',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './partners-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class PartnersPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(PartnerStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly columns = ['name', 'slug', 'discountPercent', 'commission', 'actions'];

  async openForm(partner: Partner | null): Promise<void> {
    const ref = this.dialog.open(PartnerDialogComponent, { data: partner, width: '480px' });
    const result: PartnerFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      if (partner) this.store.update(partner.id, result);
      else this.store.create(result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async remove(partner: Partner): Promise<void> {
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    try {
      this.store.remove(partner.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async copyLink(partner: Partner): Promise<void> {
    const link = this.store.bookingLink(partner);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // clipboard API 不可用時仍提示連結內容
    }
    this.snackBar.open(`${this.t.partner.linkCopied}: ${link}`, undefined, { duration: 3000 });
  }
}
