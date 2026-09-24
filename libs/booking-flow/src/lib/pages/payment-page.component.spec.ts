import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {
  AddOn,
  Coupon,
  Member,
  PaymentRecord,
  PriceBreakdown,
  PricingPlan,
  RentalOrder,
  SeasonCalendar,
  Vehicle,
  VEHICLE_REPO,
  ORDER_REPO,
  MEMBER_REPO,
  PAYMENT_REPO,
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
  insuranceSubtotal: 0,
  couponDiscount: 0,
  total: 1300,
};

function makeOrder(partial: Partial<RentalOrder> = {}): RentalOrder {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'c1',
    startTime: '2026-08-20T10:00:00',
    endTime: '2026-08-23T10:00:00',
    pickupBranchId: '馬公',
    returnBranchId: '馬公',
    status: 'reserved',
    depositRequired: 0,
    addOns: [],
    priceBreakdown: emptyBreakdown,
    paymentPreference: 'credit_card',
    ...partial,
  };
}

function setup(bookingId: string, bookings: RentalOrder[]) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  const orderRepo = createInMemoryRepo<RentalOrder>(bookings);
  const paymentRepo = createInMemoryRepo<PaymentRecord>([]);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
      { provide: ORDER_REPO, useValue: orderRepo },
      { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([]) },
      { provide: PAYMENT_REPO, useValue: paymentRepo },
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
  return { component, navigate, orderRepo, paymentRepo };
}

describe('PaymentPageComponent', () => {
  it('顯示待付款訂單的金額', () => {
    const { component } = setup('b1', [makeOrder()]);
    expect(component.booking()?.id).toBe('b1');
    expect(component.amount()).toBe(1300);
  });

  it('模擬付款成功後訂單履約狀態維持 reserved（付款不影響履約狀態）並導向完成頁', () => {
    const { component, navigate, orderRepo } = setup('b1', [makeOrder()]);
    component.onPaySuccess();
    expect(orderRepo.getById('b1')!.status).toBe('reserved');
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });

  it('模擬付款失敗時狀態不變且顯示錯誤，可重試', () => {
    const { component, orderRepo } = setup('b1', [makeOrder()]);
    component.onPayFailure();
    expect(orderRepo.getById('b1')!.status).toBe('reserved');
    expect(component.payError()).not.toBe('');

    component.onPaySuccess();
    expect(orderRepo.getById('b1')!.status).toBe('reserved');
    expect(component.payError()).toBe('');
  });

  it('查無訂單時導向完成頁', () => {
    const { component, navigate } = setup('nope', []);
    component.redirectIfNotPayable();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'nope']);
  });

  it('訂單已離開 reserved 履約狀態時導向完成頁', () => {
    const { component, navigate } = setup('b1', [makeOrder({ status: 'in_progress' })]);
    component.redirectIfNotPayable();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });

  it('訂單已離開 reserved 履約狀態時，一載入就自動導向完成頁，不必等使用者操作', () => {
    const { navigate } = setup('b1', [makeOrder({ status: 'in_progress' })]);
    TestBed.flushEffects();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });

  it('查無訂單時，一載入就自動導向完成頁', () => {
    const { navigate } = setup('nope', []);
    TestBed.flushEffects();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'nope']);
  });

  it('訂單為 reserved 時，載入不會被自動導向', () => {
    const { navigate } = setup('b1', [makeOrder()]);
    TestBed.flushEffects();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('付款成功後即使 guardEffect 隨後 flush，也只導頁一次', () => {
    const { component, navigate } = setup('b1', [makeOrder()]);
    TestBed.flushEffects();
    component.onPaySuccess();
    TestBed.flushEffects();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });
});
