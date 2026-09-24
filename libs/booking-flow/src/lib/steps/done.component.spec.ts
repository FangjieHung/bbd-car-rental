import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ORDER_REPO, Partner, RentalOrder, createInMemoryRepo } from '@car-rental/domain';
import { providePartnerBookingContext } from '../booking-context';
import { DoneComponent } from './done.component';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 10,
  commission: { type: 'percent', value: 5 },
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
    ...partial,
  };
}

function setup(opts: { partnerContext?: boolean; bookings?: RentalOrder[]; id?: string } = {}) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: ORDER_REPO, useValue: createInMemoryRepo<RentalOrder>(opts.bookings ?? []) },
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

  it('訂單狀態為 reserved 時顯示中性文案（履約狀態不代表已付款）', () => {
    const component = setup({ bookings: [makeOrder({ status: 'reserved' })] });
    expect(component['statusMessage']()).toBe(
      '您的訂單已成立，我們將盡快為您準備車輛，並確認後續付款事宜。',
    );
  });

  it('查無訂單時仍顯示同一段文案，不因找不到資料而出錯', () => {
    const component = setup({ bookings: [], id: 'nope' });
    expect(component['statusMessage']()).toBe(
      '您的訂單已成立，我們將盡快為您準備車輛，並確認後續付款事宜。',
    );
  });
});
