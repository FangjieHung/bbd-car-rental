import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'p/:slug/account',
    loadComponent: () =>
      import('./features/partner-account/partner-account.component').then(
        (m) => m.PartnerAccountComponent,
      ),
  },
  {
    path: 'p/:slug',
    loadComponent: () =>
      import('./features/partner-booking/partner-shell.component').then(
        (m) => m.PartnerShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      {
        path: 'search',
        loadComponent: () =>
          import('@car-rental/booking-flow').then((m) => m.SearchPageComponent),
      },
      {
        path: 'order/:vehicleId',
        loadComponent: () =>
          import('@car-rental/booking-flow').then((m) => m.OrderPageComponent),
      },
      {
        path: 'pay/:bookingId',
        loadComponent: () =>
          import('@car-rental/booking-flow').then((m) => m.PaymentPageComponent),
      },
      {
        path: 'done/:id',
        loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent),
      },
    ],
  },
  { path: 'book/done/:id', redirectTo: '' },
  { path: '**', redirectTo: '' },
];
