import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { BOOKING_REPO, Partner, RentalBooking, createInMemoryRepo } from '@car-rental/domain';
import { providePartnerBookingContext } from '../booking-context';
import { DoneComponent } from './done.component';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 10,
  commission: { type: 'percent', value: 5 },
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
    ...partial,
  };
}

function setup(opts: { partnerContext?: boolean; bookings?: RentalBooking[]; id?: string } = {}) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(opts.bookings ?? []) },
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ id: opts.id ?? 'b1' })) },
      },
      ...(opts.partnerContext
        ? [providePartnerBookingContext(signal(partner), signal('seaview'))]
        : []),
    ],
  });
  return TestBed.runInInjectionContext(() => new DoneComponent());
}

describe('DoneComponent', () => {
  it('consumer 情境下返回首頁連結為 [\'/\']，不會把客人踢出當前品牌網址', () => {
    const component = setup();
    expect(component['homeLink']()).toEqual(['/']);
  });

  it('夥伴情境下返回首頁連結帶夥伴 slug，不會把客人踢出夥伴品牌網址', () => {
    const component = setup({ partnerContext: true });
    expect(component['homeLink']()).toEqual(['/p', 'seaview']);
  });

  it('訂單狀態為 confirmed 時顯示已確認文案，不再說待付款', () => {
    const component = setup({ bookings: [makeBooking({ status: 'confirmed' })] });
    expect(component['statusMessage']()).toBe('您的訂單已成立並確認，我們將盡快為您準備車輛。');
  });

  it('訂單狀態仍是 pending_payment 時（例如舊版 /book/done/:id 連結）維持待付款文案', () => {
    const component = setup({ bookings: [makeBooking({ status: 'pending_payment' })] });
    expect(component['statusMessage']()).toBe(
      '您的訂單已成立，狀態為「待付款/待人工確認」，我們將盡快為您處理。',
    );
  });

  it('查無訂單時仍顯示待付款文案，不因找不到資料而出錯', () => {
    const component = setup({ bookings: [], id: 'nope' });
    expect(component['statusMessage']()).toBe(
      '您的訂單已成立，狀態為「待付款/待人工確認」，我們將盡快為您處理。',
    );
  });
});
