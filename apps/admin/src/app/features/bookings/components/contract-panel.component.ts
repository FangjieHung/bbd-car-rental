import { Component, computed, inject, input, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ContractVersion } from '@car-rental/domain';
import { StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { ContractStore } from '../../../stores/contract/contract.store';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { SignaturePadComponent } from './signature-pad.component';

/**
 * 訂單工作區「合約」分頁。設計文件第 4.4 節：
 * - 從 ContractStore 讀出這筆訂單的所有版本，預設顯示最新版本；可切換檢視舊版本。
 * - 一律只從選定版本的不可變 snapshot 渲染內容——不注入 MemberStore／VehicleStore／
 *   BookingStore 讀「現在」的會員或車輛資料，即使查看的是舊版本、對應會員或車輛之後
 *   被改過，畫面顯示的也必須是簽署當下鎖定的文字快照（見類別頂端的設計文件引用）。
 * - 只有「最新版本且狀態為 draft」才顯示簽名元件；已簽署或已被取代的版本一律唯讀，
 *   對應 ContractStore.sign() 本身也會拒絕對非 draft 版本簽署（雙重防線）。
 * - 建立合約草稿／因核心欄位異動而產生新版本，是 booking-form-dialog（Task 10）既有職責，
 *   本元件刻意不做「一鍵建立合約」——沒有任何版本時只顯示空狀態提示。
 */
@Component({
  selector: 'app-contract-panel',
  imports: [SlicePipe, SignaturePadComponent],
  templateUrl: './contract-panel.component.html',
  styleUrl: './contract-panel.component.scss',
})
export class ContractPanelComponent {
  protected readonly t = ZH_TW;

  private readonly contractStore = inject(ContractStore);

  readonly bookingId = input.required<string>();

  protected readonly versions = computed(() => this.contractStore.versionsFor(this.bookingId()));
  protected readonly latestVersion = computed<ContractVersion | undefined>(() => {
    const all = this.versions();
    return all.length > 0 ? all[all.length - 1] : undefined;
  });

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

  protected readonly sameDriverAsRenter = computed(() => {
    const snapshot = this.selectedVersion()?.snapshot;
    return !!snapshot && snapshot.driver.memberId === snapshot.renter.memberId;
  });

  protected selectVersion(id: string): void {
    this.manuallySelectedId.set(id);
  }

  protected onSigned(asset: StoredDocumentAsset): void {
    const version = this.selectedVersion();
    if (!version) return;
    this.contractStore.sign(version.id, [asset.assetId]);
  }
}
