import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  BOOKING_REPO,
  MonthlyPayout,
  PARTNER_REPO,
  PAYOUT_REPO,
  Partner,
  RentalBooking,
  createInMemoryRepo,
} from '@car-rental/domain';
import { PartnerAccountStore } from './partner-account.store';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 8,
  commission: { type: 'percent', value: 10 },
};

const perDayPartner: Partner = {
  id: 'pt2',
  name: '陽光民宿',
  slug: 'sunshine',
  discountPercent: 5,
  commission: { type: 'per_vehicle_day', value: 100 },
};

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    customerId: 'c1',
    startTime: '2026-07-05T09:00:00',
    endTime: '2026-07-07T09:00:00',
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'confirmed',
    priceBreakdown: {
      dailyLines: [],
      rentalRaw: 1000,
      tierDiscountPercent: 0,
      tierDiscountAmount: 0,
      rentalSubtotal: 1000,
      partnerDiscountPercent: 0,
      partnerDiscount: 0,
      addOnLines: [],
      addOnSubtotal: 0,
      couponDiscount: 0,
      total: 1000,
    },
    sourcePartnerId: 'pt1',
    ...partial,
  };
}

function setup(bookings: RentalBooking[], payouts: MonthlyPayout[] = [], partners: Partner[] = [partner, perDayPartner]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: PARTNER_REPO, useValue: createInMemoryRepo<Partner>(partners) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
      { provide: PAYOUT_REPO, useValue: createInMemoryRepo<MonthlyPayout>(payouts) },
    ],
  });
  return TestBed.inject(PartnerAccountStore);
}

describe('PartnerAccountStore', () => {
  it('slug 找不到 partner 時回傳 null', () => {
    const store = setup([]);
    expect(store.getAccount('no-such-slug')).toBeNull();
  });

  it('只列出 sourcePartnerId 相符的訂單，並用 percent 佣金規則算出每筆與合計', () => {
    const store = setup([
      makeBooking({ id: 'b1', sourcePartnerId: 'pt1' }),
      makeBooking({ id: 'b2', sourcePartnerId: 'pt2' }),
      makeBooking({ id: 'b3', sourcePartnerId: undefined }),
    ]);
    const account = store.getAccount('seaview');
    expect(account).not.toBeNull();
    expect(account!.commissionLines.map((l) => l.booking.id)).toEqual(['b1']);
    // rentalSubtotal 1000 * 10% = 100
    expect(account!.commissionLines[0].commission).toBe(100);
    expect(account!.totalCommission).toBe(100);
  });

  it('per_vehicle_day 佣金規則用天數計算', () => {
    const store = setup([
      makeBooking({
        id: 'b1',
        sourcePartnerId: 'pt2',
        startTime: '2026-07-05T09:00:00',
        endTime: '2026-07-08T09:00:00', // 3 days
      }),
    ]);
    const account = store.getAccount('sunshine');
    expect(account!.commissionLines[0].days).toBe(3);
    // 100/day * 3 days = 300
    expect(account!.commissionLines[0].commission).toBe(300);
    expect(account!.totalCommission).toBe(300);
  });

  it('多筆訂單佣金加總為累計合計', () => {
    const store = setup([
      makeBooking({ id: 'b1', sourcePartnerId: 'pt1' }),
      makeBooking({ id: 'b2', sourcePartnerId: 'pt1' }),
    ]);
    const account = store.getAccount('seaview');
    expect(account!.commissionLines).toHaveLength(2);
    expect(account!.totalCommission).toBe(200);
  });

  it('有撥款紀錄的月份顯示該紀錄的狀態', () => {
    const store = setup(
      [makeBooking({ id: 'b1', sourcePartnerId: 'pt1', startTime: '2026-07-05T09:00:00' })],
      [{ id: 'po1', partnerId: 'pt1', month: '2026-07', status: 'paid' }],
    );
    const account = store.getAccount('seaview');
    expect(account!.payoutsByMonth).toEqual([{ month: '2026-07', status: 'paid' }]);
  });

  it('沒有撥款紀錄的月份視為 pending', () => {
    const store = setup([
      makeBooking({ id: 'b1', sourcePartnerId: 'pt1', startTime: '2026-07-05T09:00:00' }),
    ]);
    const account = store.getAccount('seaview');
    expect(account!.payoutsByMonth).toEqual([{ month: '2026-07', status: 'pending' }]);
  });
});
