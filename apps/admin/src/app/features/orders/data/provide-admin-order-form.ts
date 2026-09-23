import { Provider } from '@angular/core';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { ORDER_SUBMIT_GATEWAY } from '../order-form/order-submit-gateway';
import { AdminOrderFormData } from './admin-order-form-data';
import { AdminOrderSubmitGateway } from './admin-order-submit.gateway';

/** 在 features/orders 的路由範圍內提供訂單表單的參考資料與送出實作（admin 版）。 */
export function provideAdminOrderForm(): Provider[] {
  return [
    { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData },
    { provide: ORDER_SUBMIT_GATEWAY, useClass: AdminOrderSubmitGateway },
  ];
}
