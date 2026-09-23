import { InjectionToken } from '@angular/core';

/**
 * 訂單表單積木（表單檢查訊息、待補項目、五個區塊元件）用到的全部文案與日期格式。
 *
 * 這個 lib 刻意不帶任何預設文字：文案屬於使用它的 app（admin 由 `ZH_TW` 提供，官網日後由
 * booking-flow 的三語字典提供），各自注入 `ORDER_FORM_LABELS`，同一句話只維護一份。
 * 形狀沿用 admin `ZH_TW` 的分組（order／member／orderForm／contractPanel），admin 可以直接把
 * 對應的子物件交進來；對應表的型別用 `Record<string, string>`，與 `ZH_TW` 的寫法一致。
 */
export interface OrderFormLabels {
  order: {
    vehicle: string;
    startTime: string;
    endTime: string;
    pickupBranch: string;
    returnBranch: string;
  };
  member: {
    name: string;
    phone: string;
    email: string;
    kind: string;
    kindLabels: Record<string, string>;
    nationality: string;
    identityNumberLabel: Record<string, string>;
    changeMember: string;
  };
  orderForm: {
    required: string;
    vehicleConflict: string;
    quoteUnavailable: string;
    quotePending: string;
    quoteTotal: string;
    rentalSubtotal: string;
    insuranceSubtotal: string;
    addOnSubtotal: string;
    insurance: string;
    insuranceNone: string;
    insuranceUnreconciled: string;
    deposit: string;
    depositCap: string;
    depositExceedsCap: string;
    addOns: string;
    addOnQty: string;
    payments: string;
    noPaymentDrafts: string;
    addPayment: string;
    removePayment: string;
    paymentPurpose: string;
    paymentPurposeLabels: Record<string, string>;
    paymentMethod: string;
    paymentMethodLabels: Record<string, string>;
    paymentAmount: string;
    internalNote: string;
    problems: {
      rentalBaseline: string;
      endBeforeStart: string;
      branchesRequired: string;
      renterBaseline: string;
      depositInvalid: string;
    };
    contract: {
      summaryTitle: string;
      previewUnavailable: string;
      unsigned: string;
      signed: string;
      resign: string;
      signatureAlt: string;
    };
    incomplete: {
      missingEmail: string;
      depositNotCollected: string;
      contractNotSigned: string;
      contractNeedsResign: string;
      balanceNotCollected: string;
    };
  };
  contractPanel: {
    openSigningDialog: string;
  };
  /** 合約摘要顯示取還車時間用的格式（ISO 字串 → 顯示文字）。 */
  formatDateTime(iso: string): string;
}

export const ORDER_FORM_LABELS = new InjectionToken<OrderFormLabels>('ORDER_FORM_LABELS');
