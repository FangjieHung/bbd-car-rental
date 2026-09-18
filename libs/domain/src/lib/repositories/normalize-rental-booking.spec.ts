import { describe, it, expect } from 'vitest';
import { normalizeRentalBooking } from './normalize-rental-booking';
import { PriceBreakdown } from '../models/price-breakdown';

const breakdown: PriceBreakdown = {
  dailyLines: [],
  rentalRaw: 3000,
  tierDiscountPercent: 0,
  tierDiscountAmount: 0,
  rentalSubtotal: 3000,
  partnerDiscountPercent: 0,
  partnerDiscount: 0,
  addOnLines: [],
  addOnSubtotal: 0,
  insuranceSubtotal: 0,
  couponDiscount: 0,
  total: 3000,
};

/** 舊版資料：status 還在用 pending_payment/confirmed，付款方式欄位叫 paymentMethod，且沒有 depositRequired。 */
const legacy = {
  id: 'b1',
  vehicleId: 'v1',
  memberId: 'c1',
  startTime: '2026-01-01T09:00:00',
  endTime: '2026-01-03T09:00:00',
  pickupLocation: '機場',
  returnLocation: '機場',
  status: 'pending_payment',
  paymentMethod: 'credit_card',
  priceBreakdown: breakdown,
};

/** 現行資料：schema 已經是遷移後的樣子（paymentPreference + depositRequired 都在）。 */
const current = {
  id: 'b2',
  vehicleId: 'v2',
  memberId: 'c2',
  startTime: '2026-02-01T09:00:00',
  endTime: '2026-02-03T09:00:00',
  pickupLocation: '馬公門市',
  returnLocation: '馬公門市',
  status: 'in_progress',
  paymentPreference: 'line_pay',
  depositRequired: 500,
  priceBreakdown: breakdown,
};

describe('normalizeRentalBooking', () => {
  it('遷移 pending_payment 為 reserved', () => {
    expect(normalizeRentalBooking({ ...legacy, status: 'pending_payment' }).status).toBe(
      'reserved',
    );
  });

  it('遷移 confirmed 為 reserved', () => {
    expect(normalizeRentalBooking({ ...legacy, status: 'confirmed' }).status).toBe('reserved');
  });

  it('現行狀態不受影響', () => {
    expect(normalizeRentalBooking({ ...current, status: 'in_progress' }).status).toBe(
      'in_progress',
    );
  });

  it('cancelled/completed 狀態原樣保留', () => {
    expect(normalizeRentalBooking({ ...legacy, status: 'cancelled' }).status).toBe('cancelled');
    expect(normalizeRentalBooking({ ...legacy, status: 'completed' }).status).toBe('completed');
  });

  it('舊欄位 paymentMethod 改名為 paymentPreference', () => {
    const result = normalizeRentalBooking(legacy);
    expect(result.paymentPreference).toBe('credit_card');
    expect((result as unknown as Record<string, unknown>)['paymentMethod']).toBeUndefined();
  });

  it('已經是 paymentPreference 的現行資料維持不變', () => {
    expect(normalizeRentalBooking(current).paymentPreference).toBe('line_pay');
  });

  it('舊資料沒有 depositRequired 時，用報價總額的 30% 當安全預設值', () => {
    expect(normalizeRentalBooking(legacy).depositRequired).toBe(900);
  });

  it('沒有 priceBreakdown 的舊資料，安全預設訂金為 0', () => {
    const { priceBreakdown, ...withoutBreakdown } = legacy;
    expect(normalizeRentalBooking(withoutBreakdown).depositRequired).toBe(0);
  });

  it('現行資料已有 depositRequired 時保留原值，不重新計算', () => {
    expect(normalizeRentalBooking(current).depositRequired).toBe(500);
  });

  it('保留未知的選填欄位（couponCode、sourcePartnerId）', () => {
    const result = normalizeRentalBooking({
      ...legacy,
      couponCode: 'SUMMER10',
      sourcePartnerId: 'pt1',
    });
    expect(result.couponCode).toBe('SUMMER10');
    expect(result.sourcePartnerId).toBe('pt1');
  });

  it('reserved 訂單佔用車輛庫存，cancelled/completed 不佔用', () => {
    const reserved = normalizeRentalBooking({ ...legacy, status: 'pending_payment' });
    const cancelled = normalizeRentalBooking({ ...legacy, status: 'cancelled' });
    const completed = normalizeRentalBooking({ ...legacy, status: 'completed' });
    const OCCUPYING: string[] = ['reserved', 'in_progress'];
    expect(OCCUPYING.includes(reserved.status)).toBe(true);
    expect(OCCUPYING.includes(cancelled.status)).toBe(false);
    expect(OCCUPYING.includes(completed.status)).toBe(false);
  });
});
