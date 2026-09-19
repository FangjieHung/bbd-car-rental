import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  BookingWorkspaceDialogComponent,
  BookingWorkspaceDialogData,
  DEFAULT_WORKSPACE_SECTION,
  WorkspaceSection,
} from '../dialogs/booking-workspace-dialog.component';

const BOOKING_PARAM = 'booking';
const SECTION_PARAM = 'section';

/**
 * 訂單工作區 dialog 的唯一開關進出口：URL 的 `booking`/`section` query params 是單一
 * 事實來源（single source of truth）。呼叫端只需要 open()/close()，實際的 dialog.open()
 * 一律由 queryParamMap 的訂閱觸發——這樣「重新整理復原」「瀏覽器上一頁關閉」跟
 * 「手動呼叫 open()/close()」全部走同一條路徑，不會各自維護一套會兜不起來的狀態。
 */
@Injectable({ providedIn: 'root' })
export class BookingWorkspaceService {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private dialogRef: MatDialogRef<BookingWorkspaceDialogComponent> | null = null;
  private currentBookingId: string | null = null;
  // true 代表目前這次 dialogRef 的關閉是因為 URL 參數被拿掉（瀏覽器上一頁）觸發，
  // afterClosed() 收到通知時不必再導一次去清參數，避免互踩造成多餘的 navigate。
  private closingFromUrlChange = false;

  constructor() {
    this.route.queryParamMap.subscribe((params) => this.syncFromParams(params));
  }

  open(bookingId: string, section: WorkspaceSection = DEFAULT_WORKSPACE_SECTION): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [BOOKING_PARAM]: bookingId, [SECTION_PARAM]: section },
      queryParamsHandling: 'merge',
    });
  }

  close(): void {
    this.dialogRef?.close();
  }

  private syncFromParams(params: ParamMap): void {
    const bookingId = params.get(BOOKING_PARAM);
    if (bookingId) {
      if (this.currentBookingId === bookingId) return; // 同一筆訂單重複的 URL 事件，不重開
      const section = (params.get(SECTION_PARAM) as WorkspaceSection | null) ?? DEFAULT_WORKSPACE_SECTION;
      this.openDialog(bookingId, section);
    } else if (this.dialogRef) {
      this.closingFromUrlChange = true;
      this.dialogRef.close();
    }
  }

  private openDialog(bookingId: string, section: WorkspaceSection): void {
    this.currentBookingId = bookingId;
    const data: BookingWorkspaceDialogData = { bookingId, section };
    this.dialogRef = this.dialog.open(BookingWorkspaceDialogComponent, {
      data,
      width: '80vw',
      maxWidth: '1200px',
      height: 'min(88dvh, 960px)',
      panelClass: 'booking-workspace-dialog',
      autoFocus: 'dialog',
      restoreFocus: true,
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.currentBookingId = null;
      if (!this.closingFromUrlChange) this.clearParams();
      this.closingFromUrlChange = false;
    });
  }

  private clearParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [BOOKING_PARAM]: null, [SECTION_PARAM]: null },
      queryParamsHandling: 'merge',
    });
  }
}
