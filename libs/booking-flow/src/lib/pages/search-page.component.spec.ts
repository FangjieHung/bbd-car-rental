import { describe, it, expect, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {
  AddOn,
  Coupon,
  Customer,
  Partner,
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
import { BOOKING_CONTEXT, providePartnerBookingContext } from '../booking-context';
import { SearchPageComponent } from './search-page.component';

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
const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 10,
  commission: { type: 'percent', value: 5 },
};

function setup(
  queryParams: Record<string, string>,
  opts: { partnerContext?: boolean } = {},
) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([]) },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: { queryParamMap: of(convertToParamMap(queryParams)) },
      },
      ...(opts.partnerContext
        ? [providePartnerBookingContext(signal(partner), signal('seaview'))]
        : []),
    ],
  });
  const component = TestBed.runInInjectionContext(() => new SearchPageComponent());
  return { component, navigate };
}

describe('SearchPageComponent', () => {
  it('無 query params 時車輛清單為空', () => {
    const { component } = setup({});
    expect(component.availableVehicles()).toEqual([]);
    expect(component.days()).toBe(0);
  });

  it('帶入 start/end/pickup/return 後列出可用車輛並算出天數', () => {
    const { component } = setup({
      start: '2026-08-20T10:00:00',
      end: '2026-08-23T10:00:00',
      pickup: '機場',
      return: '機場',
    });
    expect(component.availableVehicles()).toHaveLength(1);
    expect(component.days()).toBe(3);
    expect(component.priceForVehicle(makeVehicle())).toBeGreaterThan(0);
  });

  it('缺取還地點時視為租期不成立，車輛清單為空', () => {
    const { component } = setup({
      start: '2026-08-20T10:00:00',
      end: '2026-08-23T10:00:00',
    });
    expect(component.dateRange()).toBeNull();
    expect(component.availableVehicles()).toEqual([]);
  });

  it('日期變更寫回 query params 而不自行保存狀態', () => {
    const { component, navigate } = setup({});
    component.onDateRangeChange({
      startDateTime: '2026-09-01T10:00:00',
      endDateTime: '2026-09-04T10:00:00',
      pickupLocation: '機場',
      returnLocation: '港口',
      vehicleGroup: 'scooter',
    });
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: {
          start: '2026-09-01T10:00:00',
          end: '2026-09-04T10:00:00',
          pickup: '機場',
          return: '港口',
          group: 'scooter',
        },
        replaceUrl: true,
      }),
    );
  });

  it('consumer 情境選車導向 /order/:id 並帶著日期與取還地點', () => {
    const { component, navigate } = setup({
      start: '2026-08-20T10:00:00',
      end: '2026-08-23T10:00:00',
      pickup: '機場',
      return: '港口',
    });
    component.onVehicleSelect(makeVehicle({ id: 'v9' }));
    expect(navigate).toHaveBeenCalledWith(['/', 'order', 'v9'], {
      queryParams: {
        start: '2026-08-20T10:00:00',
        end: '2026-08-23T10:00:00',
        pickup: '機場',
        return: '港口',
        group: null,
      },
    });
  });

  it('夥伴情境選車導向 /p/:slug/order/:id', () => {
    const { component, navigate } = setup(
      {
        start: '2026-08-20T10:00:00',
        end: '2026-08-23T10:00:00',
        pickup: '機場',
        return: '港口',
      },
      { partnerContext: true },
    );
    component.onVehicleSelect(makeVehicle({ id: 'v9' }));
    expect(navigate).toHaveBeenCalledWith(['/p', 'seaview', 'order', 'v9'], {
      queryParams: {
        start: '2026-08-20T10:00:00',
        end: '2026-08-23T10:00:00',
        pickup: '機場',
        return: '港口',
        group: null,
      },
    });
  });

  describe('車輛類型（機車/汽車）篩選', () => {
    function setupWithMixedFleet(group?: 'car' | 'scooter') {
      TestBed.resetTestingModule();
      const navigate = vi.fn().mockResolvedValue(true);
      const vehicles = [
        makeVehicle({ id: 'v-car', category: 'car' }),
        makeVehicle({ id: 'v-scooter', category: 'scooter' }),
        makeVehicle({ id: 'v-ev', category: 'ev' }),
      ];
      TestBed.configureTestingModule({
        providers: [
          { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
          { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
          { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
          { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
          {
            provide: SEASON_CALENDAR_REPO,
            useValue: createInMemoryRepo<SeasonCalendar>([calendar]),
          },
          { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
          { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([]) },
          { provide: Router, useValue: { navigate } },
          {
            provide: ActivatedRoute,
            useValue: {
              queryParamMap: of(
                convertToParamMap({
                  start: '2026-08-20T10:00:00',
                  end: '2026-08-23T10:00:00',
                  pickup: '機場',
                  return: '機場',
                  ...(group ? { group } : {}),
                }),
              ),
            },
          },
        ],
      });
      return TestBed.runInInjectionContext(() => new SearchPageComponent());
    }

    it('沒有指定車輛類型時不篩選，回傳所有分類（含 ev 電動機車）', () => {
      const component = setupWithMixedFleet();
      const ids = component.availableVehicles().map((v) => v.id);
      expect(ids).toEqual(['v-car', 'v-scooter', 'v-ev']);
    });

    it('指定 car 只回傳汽車，不含機車與電動機車', () => {
      const component = setupWithMixedFleet('car');
      const ids = component.availableVehicles().map((v) => v.id);
      expect(ids).toEqual(['v-car']);
    });

    it('指定 scooter 回傳機車與電動機車（ev 對應到 scooter 大類）', () => {
      const component = setupWithMixedFleet('scooter');
      const ids = component.availableVehicles().map((v) => v.id);
      expect(ids).toEqual(['v-scooter', 'v-ev']);
    });
  });

  it('夥伴情境的報價低於 consumer 情境', () => {
    const consumerPage = setup({ start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' });
    const partnerPage = setup(
      { start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' },
      { partnerContext: true },
    );
    expect(partnerPage.component.priceForVehicle(makeVehicle())).toBeLessThan(
      consumerPage.component.priceForVehicle(makeVehicle())!,
    );
  });

  it('預設情境沒有夥伴 banner', () => {
    const { component } = setup({});
    expect(TestBed.inject(BOOKING_CONTEXT).partner()).toBeNull();
    expect(component.partner()).toBeNull();
  });
});
