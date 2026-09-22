import { Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ContractVersion, contractSigningState } from '@car-rental/domain';
import {
  CONTRACT_SIGNING_LABELS,
  ContractDocumentComponent,
  openContractSigningDialog,
} from '@car-rental/contract-signing';
import { ContractStore } from '../../../stores/contract/contract.store';
import { ZH_TW } from '../../../core/i18n/zh-tw';

/**
 * 訂單工作區「合約」分頁。設計文件第 4.4 節：
 * - 從 ContractStore 讀出這筆訂單的所有版本，預設顯示最新版本；可切換檢視舊版本。
 * - 一律只從選定版本的不可變 snapshot 渲染內容（交給共用 lib 的 ContractDocumentComponent）——
 *   不注入 MemberStore／VehicleStore／BookingStore 讀「現在」的會員或車輛資料，即使查看的是舊版本、
 *   對應會員或車輛之後被改過，畫面顯示的也必須是簽署當下鎖定的文字快照。
 * - 只有「最新版本且狀態為 draft」才顯示「檢視合約並簽署」按鈕，點擊開啟共用的簽署 dialog
 *   （把螢幕轉給客人看條文、簽名、確認）；已簽署或已被取代的版本一律唯讀，
 *   對應 ContractStore.sign() 本身也會拒絕對非 draft 版本簽署（雙重防線）。
 * - 簽署狀態（含「需重新簽署」）一律由領域規則 contractSigningState 判定，與取車判斷共用同一套邏輯。
 * - 建立合約草稿／因核心欄位異動而產生新版本，是 booking-form-dialog（Task 10）既有職責，
 *   本元件刻意不做「一鍵建立合約」——沒有任何版本時只顯示空狀態提示。
 */
@Component({
  selector: 'app-contract-panel',
  imports: [MatButtonModule, ContractDocumentComponent],
  templateUrl: './contract-panel.component.html',
  styleUrl: './contract-panel.component.scss',
})
export class ContractPanelComponent {
  protected readonly t = ZH_TW;
  protected readonly signingLabels = inject(CONTRACT_SIGNING_LABELS);

  private readonly contractStore = inject(ContractStore);
  private readonly dialog = inject(MatDialog);

  readonly bookingId = input.required<string>();

  protected readonly versions = computed(() => this.contractStore.versionsFor(this.bookingId()));
  protected readonly latestVersion = computed<ContractVersion | undefined>(() => {
    const all = this.versions();
    return all.length > 0 ? all[all.length - 1] : undefined;
  });

  /** 這筆訂單的合約簽署狀態（none／unsigned／signed／needs_resign）。 */
  protected readonly signingState = computed(() => contractSigningState(this.versions()));

  /**
   * 使用者手動選擇的版本 id（未選擇時為 undefined）。用 id 而非直接存版本物件，
   * 是因為簽署後同一個 id 的版本內容（status／signedAt）會更新，選取狀態要跟著
   * id 走、重新從 versions() 找出「目前」的那筆記錄，而不是持有一份舊的快照參照。
   */
  private readonly manuallySelectedId = signal<string | undefined>(undefined);

  protected readonly selectedVersion = computed<ContractVersion | undefined>(() => {
    const manualId = this.manuallySelectedId();
    if (manualId) {
      const found = this.versions().find((v) => v.id === manualId);
      if (found) return found;
    }
    return this.latestVersion();
  });

  protected readonly isLatestSelected = computed(
    () => !!this.selectedVersion() && this.selectedVersion()?.id === this.latestVersion()?.id,
  );
  protected readonly canSign = computed(
    () => this.isLatestSelected() && this.selectedVersion()?.status === 'draft',
  );

  protected selectVersion(id: string): void {
    this.manuallySelectedId.set(id);
  }

  /** 開啟共用簽署 dialog；確認後以回傳的簽名資產紀錄完成簽署，取消則不做任何事。 */
  protected openSigningDialog(): void {
    const version = this.selectedVersion();
    if (!version || !this.canSign()) return;

    openContractSigningDialog(this.dialog, {
      snapshot: version.snapshot,
      version,
      needsResign: this.signingState() === 'needs_resign',
    }).subscribe((asset) => {
      if (!asset) return;
      // dialog 開著的期間，這個版本可能已被其他操作取代（例如另一個分頁改了訂單核心欄位），
      // 這時不能再簽它——ContractStore.sign 會對非 draft 版本丟錯，這裡先擋下。
      const current = this.contractStore.versionsFor(this.bookingId()).find((v) => v.id === version.id);
      if (current?.status !== 'draft') return;
      this.contractStore.sign(version.id, [asset.assetId]);
    });
  }
}
