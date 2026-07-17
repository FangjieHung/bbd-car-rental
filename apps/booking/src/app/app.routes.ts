import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'book', pathMatch: 'full' },
  {
    path: 'book',
    loadComponent: () =>
      import('./features/booking-flow/booking-flow.component').then(
        (m) => m.BookingFlowComponent,
      ),
  },
];
