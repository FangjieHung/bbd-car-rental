import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  ContractSigningDialogComponent,
  ContractSigningDialogData,
  ContractSigningDialogResult,
} from './contract-signing-dialog.component';

/** 窄螢幕（手機）改用全螢幕；斷點與 admin 既有 dialog 的手機全螢幕規則一致。 */
export const CONTRACT_SIGNING_DIALOG_NARROW_QUERY = '(max-width: 768px)';

export const CONTRACT_SIGNING_DIALOG_PANEL_CLASS = 'lib-contract-signing-dialog-panel';
export const CONTRACT_SIGNING_DIALOG_FULLSCREEN_PANEL_CLASS = 'lib-contract-signing-dialog-panel--fullscreen';

function isNarrowViewport(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(CONTRACT_SIGNING_DIALOG_NARROW_QUERY).matches
    : false;
}

/**
 * 產生簽署 dialog 的 MatDialogConfig：寬螢幕用大尺寸（條文好讀、簽名區夠大），窄螢幕全螢幕。
 * `disableClose`：避免客人在平板／手機上誤觸背景或按 Esc 把簽到一半的畫面關掉，一律透過「取消」離開。
 */
export function contractSigningDialogConfig(
  data: ContractSigningDialogData,
  narrow: boolean = isNarrowViewport(),
): MatDialogConfig<ContractSigningDialogData> {
  const base: MatDialogConfig<ContractSigningDialogData> = {
    data,
    disableClose: true,
    autoFocus: 'dialog',
    restoreFocus: true,
  };
  return narrow
    ? {
        ...base,
        width: '100vw',
        height: '100dvh',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        panelClass: [CONTRACT_SIGNING_DIALOG_PANEL_CLASS, CONTRACT_SIGNING_DIALOG_FULLSCREEN_PANEL_CLASS],
      }
    : {
        ...base,
        width: 'min(960px, 92vw)',
        height: 'min(92dvh, 1080px)',
        maxWidth: '92vw',
        maxHeight: '92dvh',
        panelClass: [CONTRACT_SIGNING_DIALOG_PANEL_CLASS],
      };
}

/**
 * 開啟簽署 dialog。回傳 `afterClosed()`：確認簽署時送出簽名資產紀錄，取消時送出 undefined，之後即 complete。
 * 要用 await 時可包 `firstValueFrom(openContractSigningDialog(dialog, data))`。
 *
 * 呼叫端必須已 provide `SIGNATURE_ASSET_STORE`；拿到資產紀錄後自行完成簽署（例如 admin 的 `ContractStore.sign`）。
 */
export function openContractSigningDialog(
  dialog: MatDialog,
  data: ContractSigningDialogData,
): Observable<ContractSigningDialogResult> {
  const ref = dialog.open<ContractSigningDialogComponent, ContractSigningDialogData, ContractSigningDialogResult>(
    ContractSigningDialogComponent,
    contractSigningDialogConfig(data),
  );
  return ref.afterClosed();
}
