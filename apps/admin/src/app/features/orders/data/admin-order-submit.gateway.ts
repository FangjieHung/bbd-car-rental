import { Injectable, inject } from '@angular/core';
import { RentalOrder } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { MemberStore } from '../../../stores/member/member.store';
import { OrderStore } from '../../../stores/order/order.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { ReminderStore } from '../../../stores/reminder/reminder.store';
import { DocumentStore } from '../../../stores/document/document.store';
import {
  ORDER_FORM_DATA,
  OrderFormValue,
  computeOrderQuote,
  isInsuranceUnreconciled,
  selectedVehicleOf,
  driverCredentialDraftOf,
  sameDriverCredential,
  buildContractSnapshot,
  sameContractTerms,
  OrderSubmitGateway,
  OrderSubmitInput,
} from '@car-rental/order-form';
import { latestByVersion, requiredIdentityDocumentType } from '../incomplete/order-incomplete';

/** 本次寫入序列中「新建」的記錄 id——失敗時只補償清除這些，不動既有資料。 */
interface CreatedInThisAttempt {
  memberId?: string;
  bookingId?: string;
  paymentIds: string[];
  identityDocumentIds: string[];
  driverCredentialIds: string[];
}

/**
 * admin 的訂單送出實作：搬自舊建單 dialog 的 `submit()` 原子寫入序列，行為不變，只有兩處不同——
 * 不再以假簽名簽署；改為接受客人在建立前預先簽署的簽名資產，且只在正式快照與簽署當下條款一致時才簽署。
 *
 * 1. 再次驗證車輛可用性 → 2. 取得或新建會員 → 3. 建立／更新訂單（含報價快照與訂金）
 * → 4. 寫入本次排入的款項 → 5. 合約（核心條款有異動才產生新版本）＋預簽
 * → 6. 證件紀錄（4.2：身分證明文件、駕駛資格）→ 7. 排程還車提醒。
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
  private readonly documentStore = inject(DocumentStore);

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
    const created: CreatedInThisAttempt = { paymentIds: [], identityDocumentIds: [], driverCredentialIds: [] };

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
      const bookingPatch = {
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
        this.orderStore.updateOrder(bookingId, bookingPatch);
        const updated = this.orderStore.orders().find((b) => b.id === bookingId);
        if (!updated) throw new Error(`not found: ${bookingId}`);
        order = updated;
      } else {
        order = this.orderStore.create(bookingPatch);
        created.bookingId = order.id;
      }

      // 4. 寫入本次排入的款項紀錄。金額為 null／非正數理論上已被 orderFormProblems 擋在按下
      // 「建立訂單」之前；這裡仍再次守門，寧可整筆送出失敗（觸發下方補償）也不要把無效金額
      // 寫成一筆看似正常的付款紀錄。
      for (const draft of v.payments.drafts) {
        if (draft.amount == null || draft.amount <= 0) {
          throw new Error(this.t.orderForm.problems.paymentDraftAmountInvalid);
        }
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

      // 6. 證件紀錄：第 2 步填的內容存到會員層（可跨訂單重用），細節見 recordDocuments。
      await this.recordDocuments(memberId, v, created);

      // 7. 排程（或重新排程）還車提醒——一律呼叫，沒有 Email 的訂單也留下 missing_email 狀態紀錄；
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
   * 證件紀錄（4.2），沿用會員視窗的寫法：建立後由櫃檯人員當場確認（verified）。
   * - 身分證明文件：只有這次新建的承租人、且填了證件號碼才建立（既有會員的欄位是鎖定的，沒有人重新核對）。
   * - 駕駛資格：填了駕照號碼才建立；與這位會員最新一版的內容相同就沿用、不重複建立（查核狀態也沿用）。
   *   外國旅客建立後立即查核互惠資格；查核服務失敗不擋建立訂單，留下「駕駛資格未查核」的待補。
   * 編輯訂單的表單沒有這兩區（第 2 步只在建立訂單頁），所以更新訂單時這裡什麼都不做。
   */
  private async recordDocuments(memberId: string, v: OrderFormValue, created: CreatedInThisAttempt): Promise<void> {
    const verifiedBy = this.t.layout.adminUser;
    const idNumber = v.renter.idNumber.trim();
    if (created.memberId && idNumber) {
      const document = await this.documentStore.uploadIdentityDocument({
        memberId,
        type: requiredIdentityDocumentType(v.renter.kind),
        documentNumber: idNumber,
        issuingCountry: v.renter.kind === 'foreign_visitor' ? v.renter.nationality.trim() || 'UNKNOWN' : 'TW',
      });
      created.identityDocumentIds.push(document.id);
      this.documentStore.confirmIdentityDocument(document.id, verifiedBy);
    }

    const draft = driverCredentialDraftOf(v);
    if (!draft) return;
    // 理論上已被 orderFormProblems 擋在按下「建立訂單」之前；寧可整筆失敗，也不要存一筆沒有車種的駕駛資格。
    const standardizedVehicleClass = draft.standardizedVehicleClass;
    if (!standardizedVehicleClass) throw new Error(this.t.orderForm.problems.driverClassRequired);
    const existing = latestByVersion(this.documentStore.driverCredentialsFor(memberId));
    if (existing && sameDriverCredential(existing, draft)) return;

    const credential = await this.documentStore.uploadDriverCredential({
      memberId,
      type: draft.type,
      documentNumber: draft.documentNumber,
      issuingCountry: draft.issuingCountry,
      originalVehicleClassText: draft.originalVehicleClassText,
      standardizedVehicleClass,
      ...(draft.expiryDate ? { expiryDate: draft.expiryDate } : {}),
    });
    created.driverCredentialIds.push(credential.id);
    this.documentStore.confirmDriverCredential(credential.id, verifiedBy);
    if (v.renter.kind === 'foreign_visitor') {
      await this.documentStore.checkDriverEligibility(credential.id).catch(() => undefined);
    }
  }

  /**
   * 只補償清除「這次嘗試」新建的記錄：款項作廢（保留稽核軌跡，不硬刪除）、新建的證件紀錄刪除、
   * 新建的訂單刪除、新建的會員刪除。
   * 編輯既有訂單時 order 不在補償範圍——updateOrder() 已就地覆寫，OrderStore 沒有復原方法。
   */
  private compensate(created: CreatedInThisAttempt): void {
    for (const id of created.paymentIds) this.paymentStore.voidPayment(id);
    for (const id of created.identityDocumentIds) this.documentStore.removeIdentityDocument(id);
    for (const id of created.driverCredentialIds) this.documentStore.removeDriverCredential(id);
    if (created.bookingId) this.orderStore.remove(created.bookingId);
    if (created.memberId) this.memberStore.remove(created.memberId);
  }
}
