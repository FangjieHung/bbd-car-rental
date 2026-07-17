import { Injectable, inject } from '@angular/core';
import {
  AddOn,
  Coupon,
  PriceBreakdown,
  PricingPlan,
  VEHICLE_REPO,
  BOOKING_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  Vehicle,
  VehicleCategory,
  calculatePrice,
  isCouponValid,
  isVehicleAvailable,
} from '@car-rental/domain';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly vehicleRepo = inject(VEHICLE_REPO);
  private readonly bookingRepo = inject(BOOKING_REPO);
  private readonly planRepo = inject(PRICING_PLAN_REPO);
  private readonly calRepo = inject(SEASON_CALENDAR_REPO);
  private readonly addOnRepo = inject(ADDON_REPO);
  private readonly couponRepo = inject(COUPON_REPO);

  availableVehicles(startTime: string, endTime: string): Vehicle[] {
    const bookings = this.bookingRepo.getAll();
    return this.vehicleRepo
      .getAll()
      .filter((v) => isVehicleAvailable({ vehicle: v, startTime, endTime, bookings }));
  }

  planForCategory(cat: VehicleCategory): PricingPlan | undefined {
    return this.planRepo.getAll().find((p) => p.appliesToCategory === cat);
  }

  addOns(): AddOn[] {
    return this.addOnRepo.getAll();
  }

  price(input: {
    category: VehicleCategory;
    startDate: string;
    endDate: string;
    addOns: { addOn: AddOn; qty: number }[];
    coupon?: Coupon;
  }): PriceBreakdown {
    const plan = this.planForCategory(input.category);
    if (!plan) throw new Error('無此車型定價');
    return calculatePrice({ plan, calendar: this.calRepo.getAll()[0], ...input });
  }

  validateCoupon(
    code: string,
    ctx: { startDate: string; days: number; category: VehicleCategory },
  ): { ok: boolean; coupon?: Coupon; reason?: string } {
    const coupon = this.couponRepo
      .getAll()
      .find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!coupon) return { ok: false, reason: '查無此優惠碼' };
    return isCouponValid(coupon, ctx) ? { ok: true, coupon } : { ok: false, reason: '不符使用條件' };
  }
}
