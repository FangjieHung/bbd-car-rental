import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./features/vehicles/vehicles-page.component').then(m => m.VehiclesPageComponent),
  },
  {
    path: 'dispatch',
    loadComponent: () =>
      import('./features/dispatch/dispatch-page.component').then(m => m.DispatchPageComponent),
  },
  {
    path: 'bookings/customers',
    loadComponent: () =>
      import('./features/bookings/customers-page.component').then(m => m.CustomersPageComponent),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./features/bookings/bookings-page.component').then(m => m.BookingsPageComponent),
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./features/maintenance/maintenance-page.component').then(m => m.MaintenancePageComponent),
  },
];
