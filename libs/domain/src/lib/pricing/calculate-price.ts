import {
  PricingPlan, SeasonCalendar, AddOn, Coupon, DayTier,
  PriceBreakdown, PriceLineDay, PriceLineAddOn, VehicleCategory,
} from '../models';
import { classifyDay } from './date-classify';

function eachNight(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const cur = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cur < end) {
    const p = (n: number) => String(n).padStart(2, '0');
    out.push(`${cur.getFullYear()}-${p(cur.getMonth() + 1)}-${p(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function pickTierPercent(tiers: DayTier[], days: number): number {
  const applicable = tiers.filter((t) => days >= t.minDays).sort((a, b) => b.minDays - a.minDays);
  return applicable.length ? applicable[0].discountPercent : 0;
}

export function isCouponValid(
  coupon: Coupon,
  ctx: { startDate: string; days: number; category: VehicleCategory },
): boolean {
  if (ctx.startDate < coupon.validFrom || ctx.startDate > coupon.validTo) return false;
  if (coupon.minDays !== undefined && ctx.days < coupon.minDays) return false;
  if (coupon.applicableCategories && !coupon.applicableCategories.includes(ctx.category)) return false;
  return true;
}

export function calculatePrice(input: {
  plan: PricingPlan;
  calendar: SeasonCalendar;
  startDate: string;
  endDate: string;
  addOns: { addOn: AddOn; qty: number }[];
  coupon?: Coupon;
}): PriceBreakdown {
  const { plan, calendar, startDate, endDate, addOns, coupon } = input;
  const nights = eachNight(startDate, endDate);
  const days = nights.length;

  const dailyLines: PriceLineDay[] = nights.map((date) => {
    const dayType = classifyDay(date, calendar);
    return { date, dayType, price: plan.dayTypeRates[dayType] };
  });
  const rentalRaw = dailyLines.reduce((s, l) => s + l.price, 0);

  const tierDiscountPercent = pickTierPercent(plan.tiers, days);
  const tierDiscountAmount = Math.round((rentalRaw * tierDiscountPercent) / 100);
  const rentalSubtotal = rentalRaw - tierDiscountAmount;

  const addOnLines: PriceLineAddOn[] = addOns
    .filter((a) => a.qty > 0)
    .map(({ addOn, qty }) => ({
      addOnId: addOn.id, name: addOn.name, qty,
      amount: addOn.unitPrice * qty * (addOn.unit === 'per_day' ? days : 1),
    }));
  const addOnSubtotal = addOnLines.reduce((s, l) => s + l.amount, 0);

  let couponDiscount = 0;
  let couponCode: string | undefined;
  if (coupon && isCouponValid(coupon, { startDate, days, category: plan.appliesToCategory })) {
    couponDiscount = coupon.type === 'percent'
      ? Math.round((rentalSubtotal * coupon.value) / 100)
      : Math.min(coupon.value, rentalSubtotal);
    couponCode = coupon.code;
  }

  const total = rentalSubtotal - couponDiscount + addOnSubtotal;
  return {
    dailyLines, rentalRaw, tierDiscountPercent, tierDiscountAmount, rentalSubtotal,
    addOnLines, addOnSubtotal, couponCode, couponDiscount, total,
  };
}
