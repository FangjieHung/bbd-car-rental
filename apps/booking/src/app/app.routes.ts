import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  {
    path: 'search',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.SearchPageComponent),
  },
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
