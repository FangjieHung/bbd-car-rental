import { Component, computed, inject, input } from '@angular/core';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { BookingStore } from '../../../stores/booking/booking.store';
import { CancellationPanelComponent } from '../../bookings/components/cancellation-panel.component';
import { CustomerCreditPanelComponent } from '../../bookings/components/customer-credit-panel.component';
import { OperatorRecoveryPanelComponent } from '../../bookings/components/operator-recovery-panel.component';

let nextId = 0;

/**
 * 訂單詳情「取消/退款」分頁（4.6）：原本五種表單與說明擠在同一頁，改依流程分三段、各有小標——
 * 1. 取消：建立取消案件（顧客取消、不可抗力…）與取消案件清單；業者無法交車時先走下方的業者復原。
 * 2. 退款：取消案件試算完成後的撥付（原方式退款／轉保留金／拆分）與這筆訂單的退款紀錄。
 * 3. 保留金：承租人的保留金餘額、異動紀錄與展延。
 *
 * 只改呈現、不改背後規則與 store：每一段只顯示目前能做的動作，不能做的收成一行淡色說明，
 * 判斷沿用各 panel 既有的條件（只有已預訂的訂單可以取消；有待撥付的案件才能撥付；有保留金才能展延）。
 * 業者復原的「開立案件」同樣只給已預訂的訂單——復原失敗的結局是業者責任取消，而取消只允許已預訂的訂單。
 */
@Component({
  selector: 'app-order-cancellation-tab',
  imports: [CancellationPanelComponent, OperatorRecoveryPanelComponent, CustomerCreditPanelComponent],
  templateUrl: './order-cancellation-tab.component.html',
  styleUrl: './order-cancellation-tab.component.scss',
})
export class OrderCancellationTabComponent {
  protected readonly t = ZH_TW;
  private readonly bookingStore = inject(BookingStore);

  readonly bookingId = input.required<string>();

  protected readonly canCancel = computed(
    () => this.bookingStore.bookings().find((b) => b.id === this.bookingId())?.status === 'reserved',
  );

  private readonly id = nextId++;
  protected readonly titleIds = {
    cancel: `cancellation-stage-cancel-${this.id}`,
    refund: `cancellation-stage-refund-${this.id}`,
    credit: `cancellation-stage-credit-${this.id}`,
  };
}
