import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CouponStore } from './coupon.store';
import { COUPON_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Coupon } from '../../core/models';

const c: Coupon = { id: 'cp1', code: 'SUMMER10', type: 'percent', value: 10, validFrom: '2026-01-01', validTo: '2026-12-31' };
describe('CouponStore', () => {
  let store: CouponStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([c]) }]});
    store = TestBed.inject(CouponStore);
  });
  it('依 code 查詢（不分大小寫）', () => expect(store.findByCode('summer10')?.id).toBe('cp1'));
  it('查無 → undefined', () => expect(store.findByCode('NOPE')).toBeUndefined());
  it('新增', () => { store.create({ code: 'X', type: 'amount', value: 50, validFrom: '2026-01-01', validTo: '2026-12-31' }); expect(store.coupons()).toHaveLength(2); });
});
