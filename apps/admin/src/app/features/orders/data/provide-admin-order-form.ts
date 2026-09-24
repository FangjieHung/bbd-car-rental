import { Provider } from '@angular/core';
import { ORDER_FORM_DATA, ORDER_FORM_LABELS, ORDER_SUBMIT_GATEWAY, OrderFormLabels } from '@car-rental/order-form';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { AdminOrderFormData } from './admin-order-form-data';
import { AdminOrderSubmitGateway } from './admin-order-submit.gateway';

/** admin 的訂單表單文案：直接取 ZH_TW 對應的分組，不另外維護一份。 */
export const ADMIN_ORDER_FORM_LABELS: OrderFormLabels = {
  order: ZH_TW.order,
  member: ZH_TW.member,
  orderForm: ZH_TW.orderForm,
  orderSummary: ZH_TW.orderSummary,
  contractPanel: ZH_TW.contractPanel,
  formatDateTime: fmtDateTime,
};

/** 在 features/orders 的路由範圍內提供訂單表單的參考資料、送出實作與文案（admin 版）。 */
export function provideAdminOrderForm(): Provider[] {
  return [
    { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData },
    { provide: ORDER_SUBMIT_GATEWAY, useClass: AdminOrderSubmitGateway },
    { provide: ORDER_FORM_LABELS, useValue: ADMIN_ORDER_FORM_LABELS },
  ];
}
