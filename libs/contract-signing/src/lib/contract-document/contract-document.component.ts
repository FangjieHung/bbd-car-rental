import { Component, computed, inject, input } from '@angular/core';
import { ContractSnapshot, ContractVersion, formatTwd } from '@car-rental/domain';
import { CONTRACT_SIGNING_LABELS } from '../contract-signing-labels';
import { TaipeiDateTimePipe } from './taipei-date-time.pipe';

/**
 * 合約版本的顯示用資訊。`ContractVersion` 本身即符合這個型別，可直接傳入；
 * 尚未存成版本的情境（只有快照）則可省略。
 */
export type ContractVersionInfo = Pick<ContractVersion, 'version' | 'createdAt'> &
  Partial<Pick<ContractVersion, 'signedAt'>>;

/**
 * 渲染一份合約快照（`ContractSnapshot`）的純展示元件：無副作用、不注入任何 store、不含簽名。
 * 一律只從傳入的不可變快照渲染——即使對應會員或車輛之後被改過，畫面顯示的也必須是
 * 該版本鎖定的文字快照。
 *
 * - `snapshot`（必要）：要顯示的合約內容。
 * - `version`（選填）：提供時額外顯示建立時間／簽署時間。
 */
@Component({
  selector: 'lib-contract-document',
  imports: [TaipeiDateTimePipe],
  templateUrl: './contract-document.component.html',
  styleUrl: './contract-document.component.scss',
})
export class ContractDocumentComponent {
  protected readonly l = inject(CONTRACT_SIGNING_LABELS).document;
  /** 全站金額格式（1.8）：合約文件上的租金、保險、配件、訂金、逾時／能源費率一律用這份格式。 */
  protected readonly twd = formatTwd;

  readonly snapshot = input.required<ContractSnapshot>();
  readonly version = input<ContractVersionInfo | undefined>(undefined);

  protected readonly sameDriverAsRenter = computed(() => {
    const snapshot = this.snapshot();
    return snapshot.driver.memberId === snapshot.renter.memberId;
  });
}
