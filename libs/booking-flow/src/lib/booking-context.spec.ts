import { describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Partner } from '@car-rental/domain';
import { BOOKING_CONTEXT, providePartnerBookingContext } from './booking-context';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 10,
  commission: { type: 'percent', value: 5 },
};

describe('BOOKING_CONTEXT', () => {
  it('預設（consumer）版：無夥伴，basePath 為根路徑', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [] });
    const ctx = TestBed.inject(BOOKING_CONTEXT);
    expect(ctx.partner()).toBeNull();
    expect(ctx.basePath()).toEqual(['/']);
  });

  it('夥伴版：帶出夥伴與 /p/:slug 前綴', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [providePartnerBookingContext(signal(partner), signal('seaview'))],
    });
    const ctx = TestBed.inject(BOOKING_CONTEXT);
    expect(ctx.partner()).toEqual(partner);
    expect(ctx.basePath()).toEqual(['/p', 'seaview']);
  });
});
