import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'p/:slug',
    loadComponent: () =>
      import('./features/partner-booking/partner-booking.component').then(
        (m) => m.PartnerBookingComponent,
      ),
  },
  {
    path: 'p/:slug/account',
    loadComponent: () =>
      import('./features/partner-account/partner-account.component').then(
        (m) => m.PartnerAccountComponent,
      ),
  },
  {
    path: 'book/done/:id',
    loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent),
  },
  { path: '**', redirectTo: '' },
];
