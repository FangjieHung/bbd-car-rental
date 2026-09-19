import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { PaymentPanelComponent } from '../components/payment-panel.component';
import { ContractPanelComponent } from '../components/contract-panel.component';

/**
 * 訂單工作區的七個分頁。內容由 Task 9、11-14、17 陸續補上；本任務只搭殼，
 * 非啟用中的分頁不建立內容（`@switch` 只會渲染命中的分支），避免圖片/表單一次全建。
 */
export type WorkspaceSection =
  | 'overview'
  | 'documents'
  | 'payments'
  | 'contract'
  | 'handover'
  | 'cancellation'
  | 'activity';

export const WORKSPACE_SECTIONS: readonly WorkspaceSection[] = [
  'overview',
  'documents',
  'payments',
  'contract',
  'handover',
  'cancellation',
  'activity',
];

export const DEFAULT_WORKSPACE_SECTION: WorkspaceSection = 'overview';

export interface BookingWorkspaceDialogData {
  bookingId: string;
  section?: WorkspaceSection;
}

@Component({
  selector: 'app-booking-workspace-dialog',
  // 刻意只 import 個別 standalone 指令，不 import 整個 MatDialogModule：該 module 的
  // ɵinj 會用 `providers: [MatDialog]` 幫這個元件另外生一份 MatDialog 實例，跟開啟本
  // dialog 的那個（bookings-page/dashboard-page 注入的）不是同一個單例，會讓巢狀的
  // confirm() dialog 走到不同的 MatDialog 追蹤堆疊。測試時也會因此蓋不掉 TestBed 的
  // MatDialog mock（單元測試已踩過這個坑）。
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    PaymentPanelComponent,
    ContractPanelComponent,
  ],
  templateUrl: './booking-workspace-dialog.component.html',
  styleUrls: ['./booking-workspace-dialog.component.scss'],
})
export class BookingWorkspaceDialogComponent {
  protected readonly t = ZH_TW;
  protected readonly sections = WORKSPACE_SECTIONS;

  readonly ref = inject(MatDialogRef<BookingWorkspaceDialogComponent>);
  readonly data = inject<BookingWorkspaceDialogData>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  protected readonly activeSection = signal<WorkspaceSection>(
    this.data.section ?? DEFAULT_WORKSPACE_SECTION,
  );

  /**
   * 是否有分頁存在未儲存的變更。Task 9/11-14/17 的分頁元件應在表單變髒時呼叫
   * `setDirty(true)`（儲存成功或還原後呼叫 `setDirty(false)`），關閉時才會攔截。
   */
  private readonly _dirty = signal(false);
  readonly dirty = this._dirty.asReadonly();

  setDirty(value: boolean): void {
    this._dirty.set(value);
    // disableClose 是 MatDialogRef 上可隨時覆寫的執行期屬性，只會擋下 ESC／背景點擊，
    // 不影響下面 requestClose() 內主動呼叫的 ref.close()，因此不必更動 dialog.open() 的
    // 開啟設定（Step 2 的設定必須逐字照抄，見 booking-workspace.service.ts）。
    this.ref.disableClose = value;
  }

  selectSection(section: WorkspaceSection): void {
    this.activeSection.set(section);
  }

  async requestClose(): Promise<void> {
    if (this._dirty() && !(await confirm(this.dialog, this.t.bookingWorkspace.discardChangesConfirm))) {
      return;
    }
    this.ref.close();
  }
}
