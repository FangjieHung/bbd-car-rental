import { describe, it, expect } from 'vitest';
import { normalizeRentalOrder } from './normalize-rental-order';
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

/**
 * 舊版資料：status 還在用 pending_payment/confirmed，付款方式欄位叫 paymentMethod，沒有 depositRequired，
 * 據點欄位還叫 pickupLocation／returnLocation、值是據點類型文字。
 */
const legacy = {
  id: 'b1',
  vehicleId: 'v1',
  memberId: 'c1',
  startTime: '2026-01-01T09:00:00',
  endTime: '2026-01-03T09:00:00',
  pickupLocation: '機場',
  returnLocation: '港口',
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
  pickupBranchId: '馬公門市',
  returnBranchId: '馬公門市',
  status: 'in_progress',
  paymentPreference: 'line_pay',
  depositRequired: 500,
  priceBreakdown: breakdown,
};

describe('normalizeRentalOrder', () => {
  it('遷移 pending_payment 為 reserved', () => {
    expect(normalizeRentalOrder({ ...legacy, status: 'pending_payment' }).status).toBe(
      'reserved',
    );
  });

  it('遷移 confirmed 為 reserved', () => {
    expect(normalizeRentalOrder({ ...legacy, status: 'confirmed' }).status).toBe('reserved');
  });

  it('現行狀態不受影響', () => {
    expect(normalizeRentalOrder({ ...current, status: 'in_progress' }).status).toBe(
      'in_progress',
    );
  });

  it('cancelled/completed 狀態原樣保留', () => {
    expect(normalizeRentalOrder({ ...legacy, status: 'cancelled' }).status).toBe('cancelled');
    expect(normalizeRentalOrder({ ...legacy, status: 'completed' }).status).toBe('completed');
  });

  it('舊欄位 paymentMethod 改名為 paymentPreference', () => {
    const result = normalizeRentalOrder(legacy);
    expect(result.paymentPreference).toBe('credit_card');
    expect((result as unknown as Record<string, unknown>)['paymentMethod']).toBeUndefined();
  });

  it('已經是 paymentPreference 的現行資料維持不變', () => {
    expect(normalizeRentalOrder(current).paymentPreference).toBe('line_pay');
  });

  it('舊資料沒有 depositRequired 時，確認是小客車才用報價總額的 30% 當安全預設值', () => {
    const carLookup = () => 'car' as const;
    expect(normalizeRentalOrder(legacy, carLookup).depositRequired).toBe(900);
  });

  it('確認是機車/電動機車時，即使有報價也不套用小客車的 30% 上限，安全預設為 0', () => {
    const scooterLookup = () => 'scooter' as const;
    const evLookup = () => 'ev' as const;
    expect(normalizeRentalOrder(legacy, scooterLookup).depositRequired).toBe(0);
    expect(normalizeRentalOrder(legacy, evLookup).depositRequired).toBe(0);
  });

  it('沒有提供車型查詢函式時，無法確認是否為小客車，安全預設為 0（不對機車/電動機車錯課訂金）', () => {
    expect(normalizeRentalOrder(legacy).depositRequired).toBe(0);
  });

  it('車型查詢函式查不到該車輛時，安全預設為 0', () => {
    const notFoundLookup = () => undefined;
    expect(normalizeRentalOrder(legacy, notFoundLookup).depositRequired).toBe(0);
  });

  it('沒有 priceBreakdown 的舊資料，即使是小客車，安全預設訂金也是 0', () => {
    const { priceBreakdown, ...withoutBreakdown } = legacy;
    const carLookup = () => 'car' as const;
    expect(normalizeRentalOrder(withoutBreakdown, carLookup).depositRequired).toBe(0);
  });

  it('現行資料已有 depositRequired 時保留原值，不重新計算、也不查車型', () => {
    const lookupThatMustNotBeCalled = () => {
      throw new Error('depositRequired 已存在時不該查車型');
    };
    expect(normalizeRentalOrder(current, lookupThatMustNotBeCalled).depositRequired).toBe(500);
  });

  it('保留未知的選填欄位（couponCode、sourcePartnerId）', () => {
    const result = normalizeRentalOrder({
      ...legacy,
      couponCode: 'SUMMER10',
      sourcePartnerId: 'pt1',
    });
    expect(result.couponCode).toBe('SUMMER10');
    expect(result.sourcePartnerId).toBe('pt1');
  });

  it('reserved 訂單佔用車輛庫存，cancelled/completed 不佔用', () => {
    const reserved = normalizeRentalOrder({ ...legacy, status: 'pending_payment' });
    const cancelled = normalizeRentalOrder({ ...legacy, status: 'cancelled' });
    const completed = normalizeRentalOrder({ ...legacy, status: 'completed' });
    const OCCUPYING: string[] = ['reserved', 'in_progress'];
    expect(OCCUPYING.includes(reserved.status)).toBe(true);
    expect(OCCUPYING.includes(cancelled.status)).toBe(false);
    expect(OCCUPYING.includes(completed.status)).toBe(false);
  });

  it('舊欄位 pickupLocation／returnLocation 改名為 pickupBranchId／returnBranchId，值一併遷移成據點 id', () => {
    const result = normalizeRentalOrder(legacy) as unknown as Record<string, unknown>;
    expect(result['pickupBranchId']).toBe('mzg-airport');
    expect(result['returnBranchId']).toBe('mzg-port');
    expect('pickupLocation' in result).toBe(false);
    expect('returnLocation' in result).toBe(false);
  });

  it('新舊欄位並存時以新欄位為準', () => {
    const result = normalizeRentalOrder({ ...legacy, pickupBranchId: 'mzg-store' });
    expect(result.pickupBranchId).toBe('mzg-store');
    expect(result.returnBranchId).toBe('mzg-port');
  });

  it('現行欄位名的舊值（門市全名）也遷移成據點 id', () => {
    const result = normalizeRentalOrder(current);
    expect(result.pickupBranchId).toBe('mzg-store');
    expect(result.returnBranchId).toBe('mzg-store');
  });
});
