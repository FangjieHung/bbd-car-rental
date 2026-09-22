import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';

/** 有未儲存改動時可以擋下離開的頁面。 */
export interface LeaveConfirmable {
  /** 有未儲存改動時回傳要顯示的確認訊息；可以直接離開時回傳 null。 */
  unsavedChangesMessage(): string | null;
}

/**
 * 離開頁面前的確認（側欄導覽、瀏覽器上一頁、站內網址變更都會經過）。
 * 沒有未儲存改動時直接放行；有的話用共用的確認 dialog 詢問。
 */
export const confirmLeaveGuard: CanDeactivateFn<LeaveConfirmable> = (component) => {
  const message = component?.unsavedChangesMessage();
  if (!message) return true;
  return confirm(inject(MatDialog), message);
};
