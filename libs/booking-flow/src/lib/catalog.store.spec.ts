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
import { CatalogStore } from './catalog.store';

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

function setup(bookings: RentalBooking[] = []): CatalogStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([coupon]) },
    ],
  });
  return TestBed.inject(CatalogStore);
}

describe('CatalogStore', () => {
  it('availableVehicles 過濾掉重疊訂單的車', () => {
    const store = setup([
      {
        id: 'b1',
        vehicleId: 'v1',
        customerId: 'cust1',
        startTime: '2026-01-06T09:00:00',
        endTime: '2026-01-07T09:00:00',
        pickupLocation: '',
        returnLocation: '',
        status: 'confirmed',
      },
    ]);
    expect(
      store.availableVehicles('2026-01-06T09:00:00', '2026-01-07T09:00:00').map((v) => v.id),
    ).not.toContain('v1');
  });

  it('price 用對應車型 plan 算出 total', () => {
    const store = setup();
    const r = store.price({
      category: 'scooter',
      startDate: '2026-01-05',
      endDate: '2026-01-07',
      addOns: [],
    });
    expect(r.total).toBeGreaterThan(0);
  });

  it('price 找不到對應車型 plan 時應 throw', () => {
    const store = setup();
    expect(() =>
      store.price({
        category: 'car',
        startDate: '2026-01-05',
        endDate: '2026-01-07',
        addOns: [],
      }),
    ).toThrow();
  });

  it('validateCoupon 無效券回原因', () => {
    const store = setup();
    expect(
      store.validateCoupon('NOPE', { startDate: '2026-05-01', days: 3, category: 'scooter' }).ok,
    ).toBe(false);
  });

  it('submitBooking 寫入 pending_payment 訂單並帶 priceBreakdown', () => {
    const store = setup();
    const b = store.submitBooking({
      vehicleId: 'v1',
      startTime: '2026-01-05T09:00:00',
      endTime: '2026-01-07T09:00:00',
      pickupLocation: '馬公',
      returnLocation: '馬公',
      customer: { name: '測試', phone: '0900000000', email: 't@t.com' },
      category: 'scooter',
      startDate: '2026-01-05',
      endDate: '2026-01-07',
      addOns: [],
      couponCode: undefined,
      paymentMethod: 'on_site',
    });
    expect(b.status).toBe('pending_payment');
    expect(b.priceBreakdown?.total).toBeGreaterThan(0);
  });

  it('submitBooking 車已被佔用 → 丟錯', () => {
    const store = setup([
      {
        id: 'b1',
        vehicleId: 'v1',
        customerId: 'cust1',
        startTime: '2026-01-05T09:00:00',
        endTime: '2026-01-07T09:00:00',
        pickupLocation: '',
        returnLocation: '',
        status: 'confirmed',
      },
    ]);
    expect(() =>
      store.submitBooking({
        vehicleId: 'v1',
        startTime: '2026-01-05T09:00:00',
        endTime: '2026-01-07T09:00:00',
        pickupLocation: '馬公',
        returnLocation: '馬公',
        customer: { name: '測試', phone: '0900000000', email: 't@t.com' },
        category: 'scooter',
        startDate: '2026-01-05',
        endDate: '2026-01-07',
        addOns: [],
        couponCode: undefined,
        paymentMethod: 'on_site',
      }),
    ).toThrow();
  });

  it('submitBooking 帶 sourcePartnerId + partnerDiscountPercent → booking 帶 sourcePartnerId、priceBreakdown 反映協議折扣', () => {
    const store = setup();
    const withoutPartner = store.price({
      category: 'scooter',
      startDate: '2026-01-05',
      endDate: '2026-01-07',
      addOns: [],
    });
    const b = store.submitBooking({
      vehicleId: 'v1',
      startTime: '2026-01-05T09:00:00',
      endTime: '2026-01-07T09:00:00',
      pickupLocation: '馬公',
      returnLocation: '馬公',
      customer: { name: '測試', phone: '0900000000', email: 't@t.com' },
      category: 'scooter',
      startDate: '2026-01-05',
      endDate: '2026-01-07',
      addOns: [],
      couponCode: undefined,
      paymentMethod: 'on_site',
      partnerDiscountPercent: 10,
      sourcePartnerId: 'partner1',
    });
    expect(b.sourcePartnerId).toBe('partner1');
    expect(b.priceBreakdown?.partnerDiscountPercent).toBe(10);
    expect(b.priceBreakdown?.partnerDiscount).toBeGreaterThan(0);
    expect(b.priceBreakdown!.total).toBeLessThan(withoutPartner.total);
  });
});
