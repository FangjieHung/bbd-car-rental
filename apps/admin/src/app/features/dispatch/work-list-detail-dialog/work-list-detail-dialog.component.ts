import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import {
  WorkListDetailAction,
  WorkListDetailChip,
  WorkListDetailData,
  WorkListDetailResult,
  WorkListDetailSeverity,
} from './work-list-detail-dialog';

/**
 * 總覽右側工作清單的「取車／還車明細」視窗。
 *
 * 原本明細是掛在每一列的 mat-expansion-panel 裡就地展開，一列展開就把整份清單推到畫面外
 * （明細 6 列 ＋ 阻擋提醒 ＋ 5 顆按鈕），看一筆的代價是失去其他筆的位置感。改成點列開視窗：
 * 清單本身維持「一列一筆、掃得完」，明細集中在視窗裡一次看清楚。
 *
 * 這個元件只負責排版：內容由月曆工作清單組好（WorkListDetailData），按鈕按下去要開哪一頁
 * 也交還給它決定（close 出 WorkListDetailResult），視窗自己不碰 store 與路由。
 */
@Component({
  selector: 'app-work-list-detail-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './work-list-detail-dialog.component.html',
  styleUrl: './work-list-detail-dialog.component.scss',
})
export class WorkListDetailDialogComponent {
  protected readonly t = ZH_TW;
  protected readonly data = inject<WorkListDetailData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<WorkListDetailDialogComponent, WorkListDetailResult>>(MatDialogRef);

  /** 一顆徽章的完整 class 串：基礎 .ui-chip ＋ tone 修飾 ＋ 清單列共用的辨識 class。 */
  protected chipClass(chip: WorkListDetailChip): string {
    return ['ui-chip', 'work-list-row__status-chip', chip.tone ? `ui-chip--${chip.tone}` : '', chip.className ?? '']
      .filter(Boolean)
      .join(' ');
  }

  protected runAction(action: WorkListDetailAction): void {
    this.dialogRef.close({ kind: 'action', key: action.key });
  }

  protected goHandle(severity: WorkListDetailSeverity): void {
    this.dialogRef.close({ kind: 'severity', severity });
  }
}
