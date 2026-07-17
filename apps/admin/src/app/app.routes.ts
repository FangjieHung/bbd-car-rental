import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./features/vehicles/pages/vehicles-page.component').then(
        (m) => m.VehiclesPageComponent,
      ),
  },
  {
    path: 'dispatch',
    loadComponent: () =>
      import('./features/dispatch/pages/dispatch-page.component').then(
        (m) => m.DispatchPageComponent,
      ),
  },
  {
    path: 'bookings/customers',
    loadComponent: () =>
      import('./features/bookings/pages/customers-page.component').then(
        (m) => m.CustomersPageComponent,
      ),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./features/bookings/pages/bookings-page.component').then(
        (m) => m.BookingsPageComponent,
      ),
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./features/maintenance/pages/maintenance-page.component').then(
        (m) => m.MaintenancePageComponent,
      ),
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./features/pricing/pages/pricing-page.component').then(
        (m) => m.PricingPageComponent,
      ),
  },
  {
    path: 'add-ons',
    loadComponent: () =>
      import('./features/add-ons/pages/add-ons-page.component').then(
        (m) => m.AddOnsPageComponent,
      ),
  },
  {
    path: 'coupons',
    loadComponent: () =>
      import('./features/coupons/pages/coupons-page.component').then(
        (m) => m.CouponsPageComponent,
      ),
  },
];
