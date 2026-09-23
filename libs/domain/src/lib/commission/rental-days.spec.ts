import { describe, it, expect } from 'vitest';
import { rentalDaysOf } from './rental-days';
import { RentalOrder } from '../models';

function bk(partial: Partial<RentalOrder>): RentalOrder {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'c1',
    startTime: '2026-07-05T09:00:00',
    endTime: '2026-07-08T09:00:00',
    pickupBranchId: '',
    returnBranchId: '',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  };
}

describe('rentalDaysOf', () => {
  it('有 priceBreakdown.dailyLines 時，用晚數（跟 calculatePrice 的天數定義一致）', () => {
    const order = bk({
      priceBreakdown: {
        dailyLines: [
          { date: '2026-07-05', dayType: 'weekday', price: 1000 },
          { date: '2026-07-06', dayType: 'weekday', price: 1000 },
        ],
        rentalRaw: 2000, tierDiscountPercent: 0, tierDiscountAmount: 0, rentalSubtotal: 2000,
        partnerDiscountPercent: 0, partnerDiscount: 0, addOnLines: [], addOnSubtotal: 0,
        insuranceSubtotal: 0,
        couponDiscount: 0, total: 2000,
      },
    });
    expect(rentalDaysOf(order)).toBe(2);
  });

  it('沒有 priceBreakdown 時，fallback 用 startTime/endTime 差幾天', () => {
    const order = bk({ startTime: '2026-07-05T09:00:00', endTime: '2026-07-08T09:00:00' });
    expect(rentalDaysOf(order)).toBe(3);
  });

  it('priceBreakdown.dailyLines 是空陣列時，也走 fallback（不是回傳 0）', () => {
    const order = bk({
      startTime: '2026-07-05T09:00:00',
      endTime: '2026-07-07T09:00:00',
      priceBreakdown: {
        dailyLines: [], rentalRaw: 0, tierDiscountPercent: 0, tierDiscountAmount: 0,
        rentalSubtotal: 0, partnerDiscountPercent: 0, partnerDiscount: 0, addOnLines: [],
        addOnSubtotal: 0, insuranceSubtotal: 0, couponDiscount: 0, total: 0,
      },
    });
    expect(rentalDaysOf(order)).toBe(2);
  });

  it('startTime 等於 endTime → 0 天', () => {
    const order = bk({ startTime: '2026-07-05T09:00:00', endTime: '2026-07-05T09:00:00' });
    expect(rentalDaysOf(order)).toBe(0);
  });
});
