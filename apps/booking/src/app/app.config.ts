import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';

import { provideBookingFlowI18n } from '@car-rental/booking-flow';

import { routes } from './app.routes';
import {
  VEHICLE_REPO,
  ORDER_REPO,
  MEMBER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  PAYMENT_REPO,
  LocalStorageRepository,
  normalizeRentalOrder,
  normalizeVehicle,
  seedVehicles,
  seedOrders,
  seedMembers,
  seedPricingPlans,
  seedSeasonCalendar,
  seedAddOns,
  seedCoupons,
  seedPayments,
} from '@car-rental/domain';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNativeDateAdapter(),
    // 官網多語系：偵測瀏覽器語言、記住客人的選擇，並同步 <html lang> 與月曆的地區設定。
    provideBookingFlowI18n(),
    {
      provide: VEHICLE_REPO,
      // 舊資料可能還用更名前的 location 欄位、值是遷移前的據點類型文字/門市全名，用 normalizeVehicle 統一轉成 branchId。
      useFactory: () =>
        new LocalStorageRepository('cr.vehicles', seedVehicles, undefined, normalizeVehicle),
    },
    {
      provide: ORDER_REPO,
      // 舊資料可能還是遷移前的 schema，用 normalizeRentalOrder 統一轉成目前形狀；
      // 小客車的訂金安全預設值需要查車型，所以要能拿到 VEHICLE_REPO。
      useFactory: () => {
        const vehicleRepo = inject(VEHICLE_REPO);
        return new LocalStorageRepository('cr.bookings', seedOrders, undefined, (item) =>
          normalizeRentalOrder(item, (vehicleId) => vehicleRepo.getById(vehicleId)?.category),
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
      provide: PAYMENT_REPO,
      useFactory: () => new LocalStorageRepository('cr.payments', seedPayments),
    },
  ],
};
