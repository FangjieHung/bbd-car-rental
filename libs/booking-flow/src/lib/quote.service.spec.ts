import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AddOn,
  Coupon,
  Customer,
  PricingPlan,
  RentalBooking,
  SeasonCalendar,
  Vehicle,
  VEHICLE_REPO,
  BOOKING_REPO,
  CUSTOMER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  createInMemoryRepo,
} from '@car-rental/domain';
import { QuoteService } from './quote.service';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: '勁戰',
    brand: 'Yamaha',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

const plan: PricingPlan = {
  id: 'p1',
  name: '機車',
  appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [],
};
const calendar: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };
const coupon: Coupon = {
  id: 'c1',
  code: 'SUMMER',
  type: 'percent',
  value: 10,
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
};
const helmet: AddOn = {
  id: 'a1',
  name: '安全帽',
  unitPrice: 100,
  unit: 'per_rental',
};

function setup(): QuoteService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([helmet]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([coupon]) },
    ],
  });
  return TestBed.inject(QuoteService);
}

describe('QuoteService', () => {
  it('daysBetween 算出租期天數，缺日期時回 0', () => {
    const svc = setup();
    expect(svc.daysBetween('2026-08-20', '2026-08-23')).toBe(3);
    expect(svc.daysBetween('', '2026-08-23')).toBe(0);
    expect(svc.daysBetween('2026-08-23', '2026-08-20')).toBe(0);
  });

  it('vehicleTotal 對有定價方案的車回總價，無方案的車回 null', () => {
    const svc = setup();
    const scooter = makeVehicle({ category: 'scooter' });
    const ev = makeVehicle({ id: 'v2', category: 'ev' });

    const total = svc.vehicleTotal(scooter, { startDate: '2026-08-20', endDate: '2026-08-23' });
    expect(total).toBeGreaterThan(0);
    expect(svc.vehicleTotal(ev, { startDate: '2026-08-20', endDate: '2026-08-23' })).toBeNull();
  });

  it('vehicleTotal 套用夥伴折扣後總價較低', () => {
    const svc = setup();
    const scooter = makeVehicle();
    const full = svc.vehicleTotal(scooter, { startDate: '2026-08-20', endDate: '2026-08-23' });
    const discounted = svc.vehicleTotal(scooter, {
      startDate: '2026-08-20',
      endDate: '2026-08-23',
      partnerDiscountPercent: 10,
    });
    expect(discounted).toBeLessThan(full!);
  });

  it('validateCoupon 空字串回 null，有效碼回 ok，無效碼回原因', () => {
    const svc = setup();
    const ctx = { startDate: '2026-08-20', days: 3, category: 'scooter' as const };
    expect(svc.validateCoupon('', ctx)).toBeNull();
    expect(svc.validateCoupon('  ', ctx)).toBeNull();
    expect(svc.validateCoupon('SUMMER', ctx)).toEqual({ ok: true, coupon });
    expect(svc.validateCoupon('NOPE', ctx)).toEqual({ ok: false, reason: '查無此優惠碼' });
  });

  it('quote 缺日期時回 null，配件會計入 addOnSubtotal', () => {
    const svc = setup();
    const vehicle = makeVehicle();
    expect(
      svc.quote({ vehicle, startDate: '', endDate: '2026-08-23', addOnLines: [] }),
    ).toBeNull();

    const withAddOn = svc.quote({
      vehicle,
      startDate: '2026-08-20',
      endDate: '2026-08-23',
      addOnLines: [{ addOn: helmet, qty: 2 }],
    });
    expect(withAddOn!.addOnSubtotal).toBe(200);
  });

  it('quote 對無定價方案的車回 null 而不是丟錯', () => {
    const svc = setup();
    const ev = makeVehicle({ id: 'v2', category: 'ev' });
    expect(
      svc.quote({ vehicle: ev, startDate: '2026-08-20', endDate: '2026-08-23', addOnLines: [] }),
    ).toBeNull();
  });
});
