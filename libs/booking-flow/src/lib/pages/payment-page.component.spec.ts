import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {
  AddOn,
  Coupon,
  Customer,
  PriceBreakdown,
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
import { PaymentPageComponent } from './payment-page.component';

const emptyBreakdown: PriceBreakdown = {
  dailyLines: [],
  rentalRaw: 1300,
  tierDiscountPercent: 0,
  tierDiscountAmount: 0,
  rentalSubtotal: 1300,
  partnerDiscountPercent: 0,
  partnerDiscount: 0,
  addOnLines: [],
  addOnSubtotal: 0,
  couponDiscount: 0,
  total: 1300,
};

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    customerId: 'c1',
    startTime: '2026-08-20T10:00:00',
    endTime: '2026-08-23T10:00:00',
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'pending_payment',
    addOns: [],
    priceBreakdown: emptyBreakdown,
    paymentMethod: 'credit_card',
    ...partial,
  };
}

function setup(bookingId: string, bookings: RentalBooking[]) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  const bookingRepo = createInMemoryRepo<RentalBooking>(bookings);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
      { provide: BOOKING_REPO, useValue: bookingRepo },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([]) },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ bookingId })) },
      },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new PaymentPageComponent());
  return { component, navigate, bookingRepo };
}

describe('PaymentPageComponent', () => {
  it('顯示待付款訂單的金額', () => {
    const { component } = setup('b1', [makeBooking()]);
    expect(component.booking()?.id).toBe('b1');
    expect(component.amount()).toBe(1300);
  });

  it('模擬付款成功後訂單轉為 confirmed 並導向完成頁', () => {
    const { component, navigate, bookingRepo } = setup('b1', [makeBooking()]);
    component.onPaySuccess();
    expect(bookingRepo.getById('b1')!.status).toBe('confirmed');
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });

  it('模擬付款失敗時狀態不變且顯示錯誤，可重試', () => {
    const { component, bookingRepo } = setup('b1', [makeBooking()]);
    component.onPayFailure();
    expect(bookingRepo.getById('b1')!.status).toBe('pending_payment');
    expect(component.payError()).not.toBe('');

    component.onPaySuccess();
    expect(bookingRepo.getById('b1')!.status).toBe('confirmed');
    expect(component.payError()).toBe('');
  });

  it('查無訂單時導向完成頁', () => {
    const { component, navigate } = setup('nope', []);
    component.redirectIfNotPayable();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'nope']);
  });

  it('訂單已非待付款時導向完成頁', () => {
    const { component, navigate } = setup('b1', [makeBooking({ status: 'confirmed' })]);
    component.redirectIfNotPayable();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });
});
