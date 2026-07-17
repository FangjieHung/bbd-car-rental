import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { Coupon } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { CouponStore } from '../../../stores/coupon/coupon.store';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { CouponDialogComponent, CouponFormResult } from '../dialogs/coupon-dialog.component';

@Component({
  selector: 'app-coupons-page',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './coupons-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class CouponsPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(CouponStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly columns = ['code', 'type', 'value', 'minDays', 'applicableCategories', 'period', 'actions'];

  async openForm(coupon: Coupon | null): Promise<void> {
    const ref = this.dialog.open(CouponDialogComponent, { data: coupon, width: '480px' });
    const result: CouponFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      if (coupon) this.store.update(coupon.id, result);
      else this.store.create(result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async remove(coupon: Coupon): Promise<void> {
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    try {
      this.store.remove(coupon.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }
}
