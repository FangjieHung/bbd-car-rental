import { Routes } from '@angular/router';
import { provideAdminOrderForm } from './data/provide-admin-order-form';
import { confirmLeaveGuard } from './navigation/confirm-leave.guard';

/**
 * `/orders` 與 `/orders/*`。訂單表單的參考資料與送出實作（ORDER_FORM_DATA／ORDER_SUBMIT_GATEWAY）在這一層提供，
 * 範圍限定在 features/orders；建立訂單（`new`）與訂單詳情（`:id`）共用。
 * 這兩頁都有可能帶著未儲存的表單離開，因此都掛上離開前確認；訂單列表（`''`）沒有表單，不用。
 */
export const ORDER_ROUTES: Routes = [
  {
    path: '',
    providers: provideAdminOrderForm(),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/orders-page.component').then((m) => m.OrdersPageComponent),
      },
      {
        path: 'new',
        canDeactivate: [confirmLeaveGuard],
        loadComponent: () =>
          import('./pages/order-create-page.component').then((m) => m.OrderCreatePageComponent),
      },
      {
        path: ':id',
        canDeactivate: [confirmLeaveGuard],
        loadComponent: () =>
          import('./pages/order-detail-page.component').then((m) => m.OrderDetailPageComponent),
      },
    ],
  },
];
