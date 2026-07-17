import { describe, it, expect } from 'vitest';
import { calculatePrice, isCouponValid } from './calculate-price';
import { PricingPlan, SeasonCalendar, AddOn, Coupon } from '../models';

const plan: PricingPlan = {
  id: 'p1', name: '機車 125', appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [{ minDays: 3, discountPercent: 5 }, { minDays: 7, discountPercent: 10 }],
};
const cal: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };
const helmet: AddOn = { id: 'a1', name: '安全帽', unitPrice: 50, unit: 'per_rental' };
const seat: AddOn = { id: 'a2', name: '兒童座椅', unitPrice: 100, unit: 'per_day' };

describe('calculatePrice', () => {
  it('0 天（start===end）→ 全 0', () => {
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-05', addOns: [] });
    expect(r.total).toBe(0);
    expect(r.dailyLines).toHaveLength(0);
  });

  it('2 平日（一/二）無累折：400*2=800', () => {
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-07', addOns: [] });
    expect(r.rentalRaw).toBe(800);
    expect(r.tierDiscountPercent).toBe(0);
    expect(r.total).toBe(800);
  });

  it('3 天觸發 5% 累折', () => {
    // 2026-01-05(一)~08：一二三平日 400*3=1200；tier 5% → 60；小計 1140
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08', addOns: [] });
    expect(r.rentalRaw).toBe(1200);
    expect(r.tierDiscountPercent).toBe(5);
    expect(r.tierDiscountAmount).toBe(60);
    expect(r.rentalSubtotal).toBe(1140);
  });

  it('配件：一次性 + 每日（3 天）', () => {
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08',
      addOns: [{ addOn: helmet, qty: 2 }, { addOn: seat, qty: 1 }] });
    // helmet 50*2=100；seat 100*1*3=300 → addOnSubtotal 400
    expect(r.addOnSubtotal).toBe(400);
    expect(r.total).toBe(1140 + 400);
  });

  it('優惠券 percent 施於租金小計（累折後）', () => {
    const coupon: Coupon = { id: 'k1', code: 'SAVE10', type: 'percent', value: 10,
      validFrom: '2026-01-01', validTo: '2026-12-31' };
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08', addOns: [], coupon });
    // rentalSubtotal 1140 → 10% = 114；total = 1140-114 = 1026
    expect(r.couponDiscount).toBe(114);
    expect(r.couponCode).toBe('SAVE10');
    expect(r.total).toBe(1026);
  });

  it('優惠券 amount 不超過租金小計', () => {
    const coupon: Coupon = { id: 'k2', code: 'BIG', type: 'amount', value: 99999,
      validFrom: '2026-01-01', validTo: '2026-12-31' };
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-07', addOns: [], coupon });
    expect(r.couponDiscount).toBe(800); // = rentalSubtotal
    expect(r.total).toBe(0);
  });

  it('優惠券過期 → 不折、不記 code', () => {
    const coupon: Coupon = { id: 'k3', code: 'OLD', type: 'percent', value: 10,
      validFrom: '2025-01-01', validTo: '2025-12-31' };
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-07', addOns: [], coupon });
    expect(r.couponDiscount).toBe(0);
    expect(r.couponCode).toBeUndefined();
  });
});

describe('isCouponValid', () => {
  const base: Coupon = { id: 'k', code: 'C', type: 'percent', value: 10, validFrom: '2026-01-01', validTo: '2026-12-31' };
  it('minDays 未達 → 無效', () =>
    expect(isCouponValid({ ...base, minDays: 3 }, { startDate: '2026-05-01', days: 2, category: 'scooter' })).toBe(false));
  it('車型不符 → 無效', () =>
    expect(isCouponValid({ ...base, applicableCategories: ['car'] }, { startDate: '2026-05-01', days: 5, category: 'scooter' })).toBe(false));
  it('全部符合 → 有效', () =>
    expect(isCouponValid(base, { startDate: '2026-05-01', days: 5, category: 'scooter' })).toBe(true));
});
