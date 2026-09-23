import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  {
    path: 'search',
    loadComponent: () =>
      import('./booking-pages').then((m) => m.SearchPageComponent),
  },
  {
    path: 'vehicle/:vehicleId/plan',
    loadComponent: () =>
      import('./booking-pages').then((m) => m.PlanPageComponent),
  },
  {
    path: 'order/:vehicleId',
    loadComponent: () =>
      import('./booking-pages').then((m) => m.OrderPageComponent),
  },
  {
    path: 'pay/:bookingId',
    loadComponent: () =>
      import('./booking-pages').then((m) => m.PaymentPageComponent),
  },
  {
    path: 'done/:id',
    loadComponent: () => import('./booking-pages').then((m) => m.DoneComponent),
  },
  { path: 'book/done/:id', redirectTo: 'done/:id' },
];
