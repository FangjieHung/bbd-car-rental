import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import {
  VEHICLE_REPO,
  BOOKING_REPO,
  MEMBER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  PARTNER_REPO,
  PAYOUT_REPO,
  PAYMENT_REPO,
  LocalStorageRepository,
  normalizeRentalBooking,
  normalizeVehicle,
  seedVehicles,
  seedBookings,
  seedMembers,
  seedPricingPlans,
  seedSeasonCalendar,
  seedAddOns,
  seedCoupons,
  seedPartners,
  seedPayouts,
  seedPayments,
} from '@car-rental/domain';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNativeDateAdapter(),
    {
      provide: VEHICLE_REPO,
      // 舊資料的 location 可能還是遷移前的據點類型文字/門市全名，用 normalizeVehicle 統一轉成據點 id。
      useFactory: () =>
        new LocalStorageRepository('cr.vehicles', seedVehicles, undefined, normalizeVehicle),
    },
    {
      provide: BOOKING_REPO,
      // 舊資料可能還是遷移前的 schema，用 normalizeRentalBooking 統一轉成目前形狀；
      // 小客車的訂金安全預設值需要查車型，所以要能拿到 VEHICLE_REPO。
      useFactory: () => {
        const vehicleRepo = inject(VEHICLE_REPO);
        return new LocalStorageRepository('cr.bookings', seedBookings, undefined, (item) =>
          normalizeRentalBooking(item, (vehicleId) => vehicleRepo.getById(vehicleId)?.category),
        );
      },
    },
    {
      provide: MEMBER_REPO,
      useFactory: () => new LocalStorageRepository('cr.members', seedMembers),
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
    {
      provide: PAYMENT_REPO,
      useFactory: () => new LocalStorageRepository('cr.payments', seedPayments),
    },
  ],
};
