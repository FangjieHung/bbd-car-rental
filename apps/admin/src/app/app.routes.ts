import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/pages/settings-page.component').then(
        (m) => m.SettingsPageComponent,
      ),
  },
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
    path: 'vehicles/:id',
    loadComponent: () =>
      import('./features/vehicles/pages/vehicle-detail-page.component').then(
        (m) => m.VehicleDetailPageComponent,
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
  {
    path: 'partners',
    loadComponent: () =>
      import('./features/partners/pages/partners-page.component').then(
        (m) => m.PartnersPageComponent,
      ),
  },
  {
    path: 'commission',
    loadComponent: () =>
      import('./features/commission/pages/commission-page.component').then(
        (m) => m.CommissionPageComponent,
      ),
  },
];
