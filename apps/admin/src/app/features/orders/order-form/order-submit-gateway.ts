import { InjectionToken } from '@angular/core';
import { ContractSnapshot } from '../../../core/models';
import type { OrderFormValue } from './order-form';

/**
 * 訂單建立前客人預先簽署的結果。`snapshot` 是簽署當下用表單內容組出的預覽快照
 * （`buildContractSnapshot`）；送出時只有正式快照與它的合約條款一致（`sameContractTerms`）才會套用簽名。
 */
export interface OrderPresignature {
  assetId: string;
  snapshot: ContractSnapshot;
}

export interface OrderSubmitInput {
  /** `OrderForm.getRawValue()`。 */
  value: OrderFormValue;
  presignature?: OrderPresignature;
}

/**
 * 訂單送出介面（見 docs/adr/0001）：頁面只負責收集表單與簽名，寫入序列由實作端負責。
 * 失敗時實作端須自行補償本次新建的記錄，並以 Error（message 可直接顯示）拒絕。
 */
export interface OrderSubmitGateway {
  /** 建立訂單，回傳新訂單 id。 */
  create(input: OrderSubmitInput): Promise<string>;
  /** 更新既有訂單（合約核心條款有異動才產生新合約版本、重排提醒），回傳訂單 id。 */
  update(bookingId: string, input: OrderSubmitInput): Promise<string>;
}

export const ORDER_SUBMIT_GATEWAY = new InjectionToken<OrderSubmitGateway>('ORDER_SUBMIT_GATEWAY');
