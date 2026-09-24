import { Injectable, inject } from '@angular/core';
import { RentalOrder } from '../../../core/models';
import { MemberStore } from '../../../stores/member/member.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { OrderIncompleteItem, incompleteFactsFromOrder, orderIncompleteItems } from './order-incomplete';

/**
 * 已成立訂單的待補項目（訂單詳情總覽的待補卡、訂單列表的待補欄共用）。
 * 只負責從各 store 取出這筆訂單的紀錄，判斷規則全在 order-incomplete.ts（與建立訂單摘要欄同一套）。
 * 讀的都是 store 的 signal，在 computed 裡呼叫時，款項、合約、證件一有異動就會重算。
 */
@Injectable({ providedIn: 'root' })
export class OrderIncompleteService {
  private readonly memberStore = inject(MemberStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly contractStore = inject(ContractStore);
  private readonly documentStore = inject(DocumentStore);

  /** 已取消、已完成的訂單沒有待補（事情已經結束，補不補都不會再影響這筆訂單）。 */
  itemsFor(order: RentalOrder): OrderIncompleteItem[] {
    if (order.status === 'cancelled' || order.status === 'completed') return [];
    const member = this.memberStore.members().find((m) => m.id === order.memberId);
    return orderIncompleteItems(
      incompleteFactsFromOrder({
        order,
        member,
        payments: this.paymentStore.paymentsFor(order.id),
        paymentSummary: this.paymentStore.summaryFor(order.id),
        contractVersions: this.contractStore.versionsFor(order.id),
        identityDocuments: this.documentStore.identityDocumentsFor(order.memberId),
        driverCredentials: this.documentStore.driverCredentialsFor(order.memberId),
      }),
    );
  }
}
