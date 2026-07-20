import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  ADDON_REPO,
  BOOKING_REPO,
  COUPON_REPO,
  CUSTOMER_REPO,
  Partner,
  PARTNER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  VEHICLE_REPO,
  createInMemoryRepo,
  seedAddOns,
  seedCoupons,
  seedPricingPlans,
  seedSeasonCalendar,
  seedVehicles,
} from '@car-rental/domain';
import { PartnerBookingComponent } from './partner-booking.component';

const partners: Partner[] = [
  { id: 'pt1', name: '海景民宿', slug: 'seaview', discountPercent: 8, commission: { type: 'percent', value: 10 } },
];

function setup(slug: string) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PartnerBookingComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(new Map([['slug', slug]])) },
      },
      { provide: PARTNER_REPO, useValue: createInMemoryRepo<Partner>(partners) },
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo(seedVehicles()) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo([]) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo(seedPricingPlans()) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo(seedSeasonCalendar()) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo(seedAddOns()) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo(seedCoupons()) },
    ],
  });
  const fixture = TestBed.createComponent(PartnerBookingComponent);
  fixture.detectChanges();
  return fixture;
}

describe('PartnerBookingComponent', () => {
  it('slug 找不到對應 partner 時顯示「連結無效」', () => {
    const fixture = setup('no-such-slug');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('連結無效');
    expect(fixture.componentInstance.partner()).toBeNull();
  });

  it('slug 對應到 partner 時顯示民宿名稱並以 partner 模式渲染', () => {
    const fixture = setup('seaview');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('海景民宿');
    expect(fixture.componentInstance.partner()?.id).toBe('pt1');
    expect(fixture.componentInstance.mode()).toEqual({
      kind: 'partner',
      partner: partners[0],
    });
  });
});
