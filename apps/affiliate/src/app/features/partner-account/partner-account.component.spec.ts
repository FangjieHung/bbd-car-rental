import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  BOOKING_REPO,
  MonthlyPayout,
  PARTNER_REPO,
  PAYOUT_REPO,
  Partner,
  RentalBooking,
  createInMemoryRepo,
} from '@car-rental/domain';
import { PartnerAccountComponent } from './partner-account.component';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 8,
  commission: { type: 'percent', value: 10 },
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

function setup(slug: string, bookings: RentalBooking[] = [], payouts: MonthlyPayout[] = []) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PartnerAccountComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: of(new Map([['slug', slug]])) } },
      { provide: PARTNER_REPO, useValue: createInMemoryRepo<Partner>([partner]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
      { provide: PAYOUT_REPO, useValue: createInMemoryRepo<MonthlyPayout>(payouts) },
    ],
  });
  const fixture = TestBed.createComponent(PartnerAccountComponent);
  fixture.detectChanges();
  return fixture;
}

describe('PartnerAccountComponent', () => {
  it('slug 找不到 partner 時顯示「連結無效」', () => {
    const fixture = setup('no-such-slug');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('連結無效');
  });

  it('顯示退佣明細與累計合計', () => {
    const fixture = setup('seaview', [makeBooking({ id: 'b1' }), makeBooking({ id: 'b2' })]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('海景民宿');
    expect(text).toContain('累計佣金合計：200');
  });

  it('顯示各月撥款進度，無記錄視為待撥款', () => {
    const fixture = setup('seaview', [makeBooking({ id: 'b1' })]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('2026-07：待撥款');
  });

  it('有撥款紀錄時顯示已撥款', () => {
    const fixture = setup(
      'seaview',
      [makeBooking({ id: 'b1' })],
      [{ id: 'po1', partnerId: 'pt1', month: '2026-07', status: 'paid' }],
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('2026-07：已撥款');
  });
});
