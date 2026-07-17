import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'book', pathMatch: 'full' },
  {
    path: 'book',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.BookingFlowComponent),
  },
  {
    path: 'book/done/:id',
    loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent),
  },
];
