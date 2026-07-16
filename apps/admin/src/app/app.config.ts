import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import {
  VEHICLE_REPO,
  CUSTOMER_REPO,
  BOOKING_REPO,
  MAINTENANCE_REPO,
} from './core/repositories/tokens';
import { LocalStorageRepository } from './core/repositories/local-storage-repository';
import {
  seedVehicles,
  seedCustomers,
  seedBookings,
  seedMaintenanceRecords,
} from './core/repositories/seed-data';
import { ZH_TW } from './core/i18n/zh-tw';
import { ThemeService } from './core/theme/theme.service';

function notifyStorageReset(snackBar: MatSnackBar): () => void {
  return () => snackBar.open(ZH_TW.common.storageReset, undefined, { duration: 4000 });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => inject(ThemeService).init()),
    {
      provide: VEHICLE_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.vehicles',
          seedVehicles,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: CUSTOMER_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.customers',
          seedCustomers,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: BOOKING_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.bookings',
          seedBookings,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: MAINTENANCE_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.maintenance',
          seedMaintenanceRecords,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
  ],
};
