import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CommissionStore } from './commission.store';
import { BOOKING_REPO, PARTNER_REPO, PAYOUT_REPO, VEHICLE_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Partner, RentalBooking, Vehicle, MonthlyPayout } from '../../core/models';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 8,
  commission: { type: 'percent', value: 10 },
};

const vehicle: Vehicle = {
  id: 'v1',
  plateNumber: 'ABC-123',
  category: 'car',
  model: 'Yaris',
  brand: 'Toyota',
  year: 2023,
  status: 'available',
  mileage: 1000,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const bookingInMonth: RentalBooking = {
  id: 'b1',
  vehicleId: 'v1',
  customerId: 'c1',
  startTime: '2026-07-05T09:00:00.000Z',
  endTime: '2026-07-08T09:00:00.000Z',
  pickupLocation: '馬公門市',
  returnLocation: '馬公門市',
  status: 'completed',
  sourcePartnerId: 'pt1',
  priceBreakdown: {
    dailyLines: [
      { date: '2026-07-05', dayType: 'weekday', price: 1000 },
      { date: '2026-07-06', dayType: 'weekday', price: 1000 },
      { date: '2026-07-07', dayType: 'weekday', price: 1000 },
    ],
    rentalRaw: 3000,
    tierDiscountPercent: 0,
    tierDiscountAmount: 0,
    rentalSubtotal: 3000,
    partnerDiscountPercent: 8,
    partnerDiscount: 240,
    addOnLines: [],
    addOnSubtotal: 0,
    couponDiscount: 0,
    total: 2760,
  },
};

const bookingOtherMonth: RentalBooking = {
  ...bookingInMonth,
  id: 'b2',
  startTime: '2026-08-05T09:00:00.000Z',
  endTime: '2026-08-08T09:00:00.000Z',
};

const bookingOtherPartner: RentalBooking = {
  ...bookingInMonth,
  id: 'b3',
  sourcePartnerId: 'pt2',
};

const bookingNoSource: RentalBooking = {
  ...bookingInMonth,
  id: 'b4',
  sourcePartnerId: undefined,
};

describe('CommissionStore', () => {
  let store: CommissionStore;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([
            bookingInMonth,
            bookingOtherMonth,
            bookingOtherPartner,
            bookingNoSource,
          ]),
        },
        { provide: PARTNER_REPO, useValue: createInMemoryRepo<Partner>([partner]) },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([vehicle]) },
        { provide: PAYOUT_REPO, useValue: createInMemoryRepo<MonthlyPayout>([]) },
      ],
    });
    store = TestBed.inject(CommissionStore);
  });

  describe('monthlyReport', () => {
    it('只列出該民宿該月的訂單，且退佣以 percent 規則計算', () => {
      const report = store.monthlyReport('pt1', '2026-07');
      expect(report.rows).toHaveLength(1);
      expect(report.rows[0].bookingId).toBe('b1');
      expect(report.rows[0].vehicleLabel).toContain('Yaris');
      expect(report.rows[0].rentalSubtotal).toBe(3000);
      expect(report.rows[0].commission).toBe(300); // 10% of 3000
      expect(report.total).toBe(300);
    });

    it('查無訂單 → rows 空、total 0', () => {
      const report = store.monthlyReport('pt1', '2026-09');
      expect(report.rows).toHaveLength(0);
      expect(report.total).toBe(0);
    });

    it('查無此民宿 → rows 空', () => {
      const report = store.monthlyReport('nope', '2026-07');
      expect(report.rows).toHaveLength(0);
    });
  });

  describe('toCsv', () => {
    it('含 UTF-8 BOM 與欄位標題', () => {
      const report = store.monthlyReport('pt1', '2026-07');
      const csv = store.toCsv(report.rows);
      expect(csv.startsWith('﻿')).toBe(true);
      expect(csv).toContain('訂單編號');
      expect(csv).toContain('車款');
      expect(csv).toContain('租期起訖');
      expect(csv).toContain('租金小計');
      expect(csv).toContain('退佣');
      expect(csv).toContain('b1');
    });
  });

  describe('payout 狀態', () => {
    it('無記錄視為 pending', () => {
      expect(store.getPayoutStatus('pt1', '2026-07')).toBe('pending');
    });

    it('markPaid 後狀態變 paid', () => {
      store.markPaid('pt1', '2026-07');
      expect(store.getPayoutStatus('pt1', '2026-07')).toBe('paid');
    });

    it('markPaid 對已存在的 payout 記錄更新而非重複新增', () => {
      store.markPaid('pt1', '2026-07');
      store.markPaid('pt1', '2026-07');
      expect(store.getPayoutStatus('pt1', '2026-07')).toBe('paid');
    });
  });
});
