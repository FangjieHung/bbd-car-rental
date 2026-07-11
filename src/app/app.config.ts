import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { VEHICLE_REPO, CUSTOMER_REPO, BOOKING_REPO, MAINTENANCE_REPO } from './core/repositories/tokens';
import { LocalStorageRepository } from './core/repositories/local-storage-repository';
import { seedVehicles, seedCustomers, seedBookings, seedMaintenanceRecords } from './core/repositories/seed-data';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: VEHICLE_REPO, useFactory: () => new LocalStorageRepository('cr.vehicles', seedVehicles) },
    { provide: CUSTOMER_REPO, useFactory: () => new LocalStorageRepository('cr.customers', seedCustomers) },
    { provide: BOOKING_REPO, useFactory: () => new LocalStorageRepository('cr.bookings', seedBookings) },
    { provide: MAINTENANCE_REPO, useFactory: () => new LocalStorageRepository('cr.maintenance', seedMaintenanceRecords) },
  ],
};
