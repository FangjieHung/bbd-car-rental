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
import { PlanPageComponent } from './plan-page.component';

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
    location: '機場',
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

function setup(
  params: { vehicleId: string; start: string; end: string },
  vehicle: Vehicle = makeVehicle(),
) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([vehicle]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([]) },
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
  const component = TestBed.runInInjectionContext(() => new PlanPageComponent());
  return { component, navigate };
}

const validParams = {
  vehicleId: 'v1',
  start: '2026-08-20T10:00:00',
  end: '2026-08-23T10:00:00',
};

const withPlans = makeVehicle({
  insurancePlans: [
    { id: 'ins1', name: '基本保障', dailyPriceFrom: 200, tags: ['有自負額'], coverageItems: [] },
    { id: 'ins2', name: '全險', dailyPriceFrom: 500, tags: [], coverageItems: [] },
  ],
});

describe('PlanPageComponent', () => {
  it('載入指定車輛與租期', () => {
    const { component } = setup(validParams);
    expect(component.vehicle()?.id).toBe('v1');
    expect(component.startDate()).toBe('2026-08-20');
    expect(component.endDate()).toBe('2026-08-23');
  });

  it('有保險方案時預設選第一個方案，priceBreakdown 反映其保費', () => {
    const { component } = setup(validParams, withPlans);
    expect(component.selectedPlan()?.id).toBe('ins1');
    // 3 天 x 200 = 600
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(600);
  });

  it('selectPlan 切換方案後 priceBreakdown 跟著換', () => {
    const { component } = setup(validParams, withPlans);
    component.selectPlan('ins2');
    expect(component.selectedPlan()?.id).toBe('ins2');
    // 3 天 x 500 = 1500
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(1500);
  });

  it('沒有保險方案時 selectedPlan 為 null，priceBreakdown 保費為 0', () => {
    const { component } = setup(validParams);
    expect(component.selectedPlan()).toBeNull();
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(0);
  });

  it('下一步導向 order/:vehicleId，帶上原本的日期與選定的 planId', () => {
    const { component, navigate } = setup(validParams, withPlans);
    component.onNext();
    expect(navigate).toHaveBeenCalledWith(['/', 'order', 'v1'], {
      queryParams: { start: validParams.start, end: validParams.end, group: null, planId: 'ins1' },
    });
  });

  it('沒有保險方案時下一步的 planId 帶 null', () => {
    const { component, navigate } = setup(validParams);
    component.onNext();
    expect(navigate).toHaveBeenCalledWith(['/', 'order', 'v1'], {
      queryParams: { start: validParams.start, end: validParams.end, group: null, planId: null },
    });
  });

  it('查無車輛時導回搜尋頁', () => {
    const { component, navigate } = setup({ ...validParams, vehicleId: 'nope' });
    expect(component.vehicle()).toBeNull();
    component.ensureValidOrRedirect();
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });

  it('缺日期時導回搜尋頁', () => {
    const { component, navigate } = setup({ vehicleId: 'v1', start: '', end: '' });
    component.ensureValidOrRedirect();
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });
});
