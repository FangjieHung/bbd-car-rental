import { Component, ViewEncapsulation, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ContractSnapshot } from '@car-rental/domain';
import { CONTRACT_SIGNING_LABELS } from '../contract-signing-labels';
import { ContractDocumentComponent, ContractVersionInfo } from '../contract-document/contract-document.component';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { SignatureAsset } from '../signature-asset-store';

/** 開啟簽署 dialog 時傳入的資料。 */
export interface ContractSigningDialogData {
  /** 要讓客人檢視並簽署的合約快照（通常是目前有效版本的 snapshot）。 */
  snapshot: ContractSnapshot;
  /** 版本資訊；提供時標題顯示版本號，內容顯示建立時間。`ContractVersion` 可直接傳入。 */
  version?: ContractVersionInfo;
  /** 客人簽過較早版本、目前版本尚未簽署時設為 true，會在條文上方顯示「條款已變更，需重新簽署」。 */
  needsResign?: boolean;
}

/** dialog 關閉結果：確認簽署 → 簽名板存檔後的資產紀錄；取消／關閉 → undefined。 */
export type ContractSigningDialogResult = SignatureAsset | undefined;

/**
 * 簽署合約用的 MatDialog 內容元件，模擬門市櫃檯「把螢幕轉給客人看完條文、簽名、按確認」：
 * 由上而下是「完整合約條文（可捲動）→ 簽名板 → 取消／確認簽署」。
 * 同一個畫面同時用於櫃檯（admin）與官網客人手機（booking），不區分現場／線上模式。
 *
 * 本元件只負責擷取簽名並回傳資產紀錄，不呼叫任何合約 store——拿到結果後完成簽署是呼叫端的職責。
 * 請用 `openContractSigningDialog()` 開啟，它會套好大尺寸／手機全螢幕的 dialog 設定。
 *
 * 樣式使用 `ViewEncapsulation.None`：全螢幕時要把 dialog 外框圓角歸零，而外框
 * （`.mat-mdc-dialog-surface`）是本元件的祖先節點，emulated 封裝選不到；所有選擇器都以
 * `lib-contract-signing-dialog` 前綴限定範圍，不會外溢影響其他畫面。
 */
@Component({
  selector: 'lib-contract-signing-dialog',
  imports: [MatDialogModule, MatButtonModule, ContractDocumentComponent, SignaturePadComponent],
  templateUrl: './contract-signing-dialog.component.html',
  styleUrl: './contract-signing-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'lib-contract-signing-dialog' },
})
export class ContractSigningDialogComponent {
  protected readonly labels = inject(CONTRACT_SIGNING_LABELS);
  protected readonly data = inject<ContractSigningDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<ContractSigningDialogComponent, ContractSigningDialogResult>>(MatDialogRef);

  private readonly pad = viewChild.required(SignaturePadComponent);

  /** 簽名完成（有簽名內容且已勾選確認同意）且不在存檔中，確認鈕才可按。 */
  protected readonly canConfirm = computed(() => this.pad().canConfirm());
  protected readonly submitting = computed(() => this.pad().submitting());

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }

  protected async confirm(): Promise<void> {
    const asset = await this.pad().confirm();
    if (asset) this.dialogRef.close(asset);
  }
}
