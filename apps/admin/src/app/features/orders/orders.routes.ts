import { Routes } from '@angular/router';
import { provideAdminOrderForm } from './data/provide-admin-order-form';

/**
 * `/orders/*`。訂單表單的參考資料與送出實作（ORDER_FORM_DATA／ORDER_SUBMIT_GATEWAY）在這一層提供，
 * 範圍限定在 features/orders；之後的訂單詳情頁（`:id`）掛在同一層即可共用。
 */
export const ORDER_ROUTES: Routes = [
  {
    path: '',
    providers: provideAdminOrderForm(),
    children: [
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/order-create-page.component').then((m) => m.OrderCreatePageComponent),
      },
    ],
  },
];
