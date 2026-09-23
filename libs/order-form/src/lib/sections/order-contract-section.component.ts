import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CONTRACT_SIGNING_LABELS } from '@car-rental/contract-signing';
import { ContractSnapshot } from '@car-rental/domain';
import { ORDER_FORM_LABELS } from '../order-form-labels';
import { OrderForm } from '../order-form';
import { OrderContractSigning } from '../order-form-derived';

/**
 * 建立訂單的「合約」區塊：以目前表單內容組出的預覽快照顯示合約摘要，
 * 提供「檢視合約並簽署」（實際開 dialog 與暫存簽名由頁面負責）、簽署狀態與簽名縮圖，以及內部備註。
 */
@Component({
  selector: 'lib-order-contract-section',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './order-contract-section.component.html',
  styleUrls: ['./order-section.scss', './order-contract-section.component.scss'],
})
export class OrderContractSectionComponent {
  protected readonly t = inject(ORDER_FORM_LABELS);
  protected readonly signingLabels = inject(CONTRACT_SIGNING_LABELS);

  readonly form = input.required<OrderForm>();
  /** 用目前表單內容組出的預覽快照；車輛／租期未齊或無法試算報價時為 undefined（不能簽署）。 */
  readonly preview = input<ContractSnapshot | undefined>(undefined);
  readonly signing = input<OrderContractSigning>('unsigned');
  /** 已暫存簽名的顯示用 URL。 */
  readonly signatureUrl = input<string | undefined>(undefined);

  readonly signRequested = output<void>();
}
