import { Injectable, inject } from '@angular/core';
import { RentalOrder } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { MemberStore } from '../../../stores/member/member.store';
import { OrderStore } from '../../../stores/order/order.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { ReminderStore } from '../../../stores/reminder/reminder.store';
import {
  ORDER_FORM_DATA,
  computeOrderQuote,
  isInsuranceUnreconciled,
  selectedVehicleOf,
  buildContractSnapshot,
  sameContractTerms,
  OrderSubmitGateway,
  OrderSubmitInput,
} from '@car-rental/order-form';

/** 本次寫入序列中「新建」的記錄 id——失敗時只補償清除這些，不動既有資料。 */
interface CreatedInThisAttempt {
  memberId?: string;
  bookingId?: string;
  paymentIds: string[];
}

/**
 * admin 的訂單送出實作：搬自舊建單 dialog 的 `submit()` 原子寫入序列，行為不變，只有兩處不同——
 * 不再以假簽名簽署；改為接受客人在建立前預先簽署的簽名資產，且只在正式快照與簽署當下條款一致時才簽署。
 *
 * 1. 再次驗證車輛可用性 → 2. 取得或新建會員 → 3. 建立／更新訂單（含報價快照與訂金）
 * → 4. 寫入本次排入的款項 → 5. 合約（核心條款有異動才產生新版本）＋預簽 → 6. 排程還車提醒。
 * local repository 沒有真正的 transaction，任何一步失敗都會補償清除「這次嘗試」新建的記錄
 * （編輯模式下被 updateOrder 就地更新的欄位無法回復，見 compensate()）。
 */
@Injectable()
export class AdminOrderSubmitGateway implements OrderSubmitGateway {
  private readonly t = ZH_TW;
  private readonly data = inject(ORDER_FORM_DATA);
  private readonly memberStore = inject(MemberStore);
  private readonly orderStore = inject(OrderStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly contractStore = inject(ContractStore);
  private readonly reminderStore = inject(ReminderStore);

  create(input: OrderSubmitInput): Promise<string> {
    return this.submit(undefined, input);
  }

  update(bookingId: string, input: OrderSubmitInput): Promise<string> {
    return this.submit(bookingId, input);
  }

  private async submit(bookingId: string | undefined, input: OrderSubmitInput): Promise<string> {
    const v = input.value;
    const vehicle = selectedVehicleOf(v, this.data);
    const quote = computeOrderQuote(v, this.data);
    if (!vehicle || !quote) throw new Error(this.t.orderForm.quoteUnavailable);

    // 保險方案尚未確認就在任何寫入之前中止，避免拿「沒選保險」的報價覆寫既有訂單的 priceBreakdown。
    if (bookingId) {
      const original = this.orderStore.orders().find((b) => b.id === bookingId);
      if (isInsuranceUnreconciled(original?.priceBreakdown, vehicle, v.pricing.insurancePlanId)) {
        throw new Error(this.t.orderForm.insuranceUnreconciled);
      }
    }

    const startIso = new Date(v.rental.startLocal).toISOString();
    const endIso = new Date(v.rental.endLocal).toISOString();
    const created: CreatedInThisAttempt = { paymentIds: [] };

    try {
      // 1. 再次驗證車輛可用性——避免填寫期間同一台車被別筆訂單搶先鎖定。
      const conflicts = this.orderStore.findConflicts(v.rental.vehicleId, startIso, endIso, bookingId);
      if (conflicts.length > 0) {
        throw new Error(`${this.t.order.conflict} ${conflicts.map((c) => c.id).join(', ')}`);
      }

      // 2. 取得或新建會員。
      let memberId = v.renter.memberId;
      if (!memberId) {
        const r = v.renter;
        const member = this.memberStore.create({
          name: r.name,
          phone: r.phone,
          kind: r.kind,
          ...(r.idNumber ? { idNumber: r.idNumber } : {}),
          ...(r.email ? { email: r.email } : {}),
          ...(r.kind !== 'local' && r.nationality ? { nationality: r.nationality } : {}),
        });
        memberId = member.id;
        created.memberId = memberId;
      }

      // 3. 建立（或更新）訂單，帶上報價快照與訂金。
      const orderPatch = {
        vehicleId: v.rental.vehicleId,
        memberId,
        startTime: startIso,
        endTime: endIso,
        pickupBranchId: v.rental.pickupBranchId,
        returnBranchId: v.rental.returnBranchId,
        priceBreakdown: quote,
        depositRequired: v.pricing.depositRequired,
      };
      let order: RentalOrder;
      if (bookingId) {
        this.orderStore.updateOrder(bookingId, orderPatch);
        const updated = this.orderStore.orders().find((b) => b.id === bookingId);
        if (!updated) throw new Error(`not found: ${bookingId}`);
        order = updated;
      } else {
        order = this.orderStore.create(orderPatch);
        created.bookingId = order.id;
      }

      // 4. 寫入本次排入的款項紀錄。
      for (const draft of v.payments.drafts) {
        const payment = this.paymentStore.recordPayment({
          bookingId: order.id,
          amount: draft.amount,
          method: draft.method,
          purpose: draft.purpose,
          status: 'confirmed',
          receivedAt: new Date().toISOString(),
          handledBy: this.t.layout.adminUser,
        });
        created.paymentIds.push(payment.id);
      }

      // 5. 合約：核心條款有異動才由 reviseIfChanged 產生新版本；沒有既有版本時等同建立第 1 版草稿。
      // 客人已預先簽署、且正式快照與簽署當下的條款一致時，以該簽名資產簽署這個版本；
      // 條款不一致（簽完又改了租期等）一律不套用舊簽名，合約維持未簽署。
      const snapshot = buildContractSnapshot(vehicle, quote, memberId, v);
      const contractVersion = this.contractStore.reviseIfChanged(order.id, snapshot);
      const presignature = input.presignature;
      if (presignature && contractVersion.status === 'draft' && sameContractTerms(presignature.snapshot, snapshot)) {
        this.contractStore.sign(contractVersion.id, [presignature.assetId]);
      }

      // 6. 排程（或重新排程）還車提醒——一律呼叫，沒有 Email 的訂單也留下 missing_email 狀態紀錄；
      // ReminderStore 內部會視需要先取消舊排程再依（可能已編輯過的）還車時間重排。
      await this.reminderStore.scheduleForOrder({
        bookingId: order.id,
        endTime: endIso,
        ...(v.renter.email ? { email: v.renter.email } : {}),
      });

      return order.id;
    } catch (e) {
      this.compensate(created);
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  /**
   * 只補償清除「這次嘗試」新建的記錄：款項作廢（保留稽核軌跡，不硬刪除）、新建的訂單刪除、新建的會員刪除。
   * 編輯既有訂單時 order 不在補償範圍——updateOrder() 已就地覆寫，OrderStore 沒有復原方法。
   */
  private compensate(created: CreatedInThisAttempt): void {
    for (const id of created.paymentIds) this.paymentStore.voidPayment(id);
    if (created.bookingId) this.orderStore.remove(created.bookingId);
    if (created.memberId) this.memberStore.remove(created.memberId);
  }
}
