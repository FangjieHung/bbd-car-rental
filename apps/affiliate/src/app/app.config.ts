import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  VEHICLE_REPO,
  BOOKING_REPO,
  CUSTOMER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  PARTNER_REPO,
  PAYOUT_REPO,
  LocalStorageRepository,
  seedVehicles,
  seedBookings,
  seedCustomers,
  seedPricingPlans,
  seedSeasonCalendar,
  seedAddOns,
  seedCoupons,
  seedPartners,
  seedPayouts,
} from '@car-rental/domain';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: VEHICLE_REPO,
      useFactory: () => new LocalStorageRepository('cr.vehicles', seedVehicles),
    },
    {
      provide: BOOKING_REPO,
      useFactory: () => new LocalStorageRepository('cr.bookings', seedBookings),
    },
    {
      provide: CUSTOMER_REPO,
      useFactory: () => new LocalStorageRepository('cr.customers', seedCustomers),
    },
    {
      provide: PRICING_PLAN_REPO,
      useFactory: () => new LocalStorageRepository('cr.pricingPlans', seedPricingPlans),
    },
    {
      provide: SEASON_CALENDAR_REPO,
      useFactory: () => new LocalStorageRepository('cr.seasonCalendar', seedSeasonCalendar),
    },
    {
      provide: ADDON_REPO,
      useFactory: () => new LocalStorageRepository('cr.addOns', seedAddOns),
    },
    {
      provide: COUPON_REPO,
      useFactory: () => new LocalStorageRepository('cr.coupons', seedCoupons),
    },
    {
      provide: PARTNER_REPO,
      useFactory: () => new LocalStorageRepository('cr.partners', seedPartners),
    },
    {
      provide: PAYOUT_REPO,
      useFactory: () => new LocalStorageRepository('cr.payouts', seedPayouts),
    },
  ],
};
