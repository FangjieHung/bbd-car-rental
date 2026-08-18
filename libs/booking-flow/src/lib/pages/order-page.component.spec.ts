import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
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
import { OrderPageComponent } from './order-page.component';

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
const helmet: AddOn = { id: 'a1', name: '安全帽', unitPrice: 100, unit: 'per_rental' };

function setup(params: { vehicleId: string; start: string; end: string }) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  const bookingRepo = createInMemoryRepo<RentalBooking>([]);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: BOOKING_REPO, useValue: bookingRepo },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([helmet]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([coupon]) },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ vehicleId: params.vehicleId })),
          queryParamMap: of(convertToParamMap({ start: params.start, end: params.end })),
        },
      },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new OrderPageComponent());
  return { component, navigate, bookingRepo };
}

const validParams = { vehicleId: 'v1', start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' };

describe('OrderPageComponent', () => {
  it('載入指定車輛與租期', () => {
    const { component } = setup(validParams);
    expect(component.vehicle()?.id).toBe('v1');
    expect(component.days()).toBe(3);
    expect(component.priceBreakdown()).not.toBeNull();
  });

  it('加購配件會提高總價', () => {
    const { component } = setup(validParams);
    const before = component.priceBreakdown()!.total;
    component.onAddOnQtyChange('a1', 2);
    expect(component.priceBreakdown()!.total).toBe(before + 200);
  });

  it('輸入有效優惠碼會降低總價', () => {
    const { component } = setup(validParams);
    const before = component.priceBreakdown()!.total;
    component.onCouponCodeChange('SUMMER');
    expect(component.couponResult()).toEqual({ ok: true, coupon });
    expect(component.priceBreakdown()!.total).toBeLessThan(before);
  });

  it('無效優惠碼回報原因且不改變總價', () => {
    const { component } = setup(validParams);
    const before = component.priceBreakdown()!.total;
    component.onCouponCodeChange('NOPE');
    expect(component.couponResult()).toEqual({ ok: false, reason: '查無此優惠碼' });
    expect(component.priceBreakdown()!.total).toBe(before);
  });

  it('送出後建立 pending_payment 訂單並導向付款頁', () => {
    const { component, navigate, bookingRepo } = setup(validParams);
    component.onConfirmSubmit({
      name: '王小明',
      phone: '0912345678',
      email: 'a@b.c',
      paymentMethod: 'credit_card',
    });
    const created = bookingRepo.getAll();
    expect(created).toHaveLength(1);
    expect(created[0].status).toBe('pending_payment');
    expect(navigate).toHaveBeenCalledWith(['/', 'pay', created[0].id]);
  });

  it('缺日期時導回搜尋頁且不建立訂單', () => {
    const { component, navigate, bookingRepo } = setup({ vehicleId: 'v1', start: '', end: '' });
    expect(component.priceBreakdown()).toBeNull();
    component.onConfirmSubmit({
      name: '王小明',
      phone: '0912345678',
      email: 'a@b.c',
      paymentMethod: 'credit_card',
    });
    expect(bookingRepo.getAll()).toHaveLength(0);
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });

  it('查無車輛時導回搜尋頁', () => {
    const { component, navigate } = setup({ ...validParams, vehicleId: 'nope' });
    expect(component.vehicle()).toBeNull();
    component.ensureValidOrRedirect();
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });
});
