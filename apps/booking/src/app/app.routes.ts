import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  {
    path: 'search',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.SearchPageComponent),
  },
  {
    path: 'vehicle/:vehicleId/plan',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.PlanPageComponent),
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
  { path: 'book/done/:id', redirectTo: 'done/:id' },
];
