import { Injectable, inject } from '@angular/core';
import { AddOn, Coupon, PriceBreakdown, Vehicle, VehicleCategory } from '@car-rental/domain';
import { CatalogStore } from './catalog.store';

export interface CouponResult {
  ok: boolean;
  coupon?: Coupon;
  reason?: string;
}

/** 集中所有報價計算。搜尋頁與下單頁共用，避免兩邊各算一次。 */
@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly catalog = inject(CatalogStore);

  daysBetween(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    const ms =
      new Date(endDate + 'T00:00:00').getTime() - new Date(startDate + 'T00:00:00').getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }

  /** 整段租期的總價；該車型無定價方案時回 null（給 vehicle-step 判斷不可選） */
  vehicleTotal(
    vehicle: Vehicle,
    opts: { startDate: string; endDate: string; partnerDiscountPercent?: number },
  ): number | null {
    if (!opts.startDate || !opts.endDate) return null;
    try {
      return this.catalog.price({
        category: vehicle.category,
        startDate: opts.startDate,
        endDate: opts.endDate,
        addOns: [],
        partnerDiscountPercent: opts.partnerDiscountPercent,
      }).total;
    } catch {
      return null;
    }
  }

  /** 尚未輸入優惠碼時回 null（代表「沒有結果可顯示」，而非「驗證失敗」） */
  validateCoupon(
    code: string,
    ctx: { startDate: string; days: number; category: VehicleCategory },
  ): CouponResult | null {
    const trimmed = code.trim();
    if (!trimmed) return null;
    return this.catalog.validateCoupon(trimmed, ctx);
  }

  quote(input: {
    vehicle: Vehicle;
    startDate: string;
    endDate: string;
    addOnLines: { addOn: AddOn; qty: number }[];
    coupon?: Coupon;
    partnerDiscountPercent?: number;
  }): PriceBreakdown | null {
    if (!input.startDate || !input.endDate) return null;
    try {
      return this.catalog.price({
        category: input.vehicle.category,
        startDate: input.startDate,
        endDate: input.endDate,
        addOns: input.addOnLines,
        coupon: input.coupon,
        partnerDiscountPercent: input.partnerDiscountPercent,
      });
    } catch {
      return null;
    }
  }
}
