import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PartnerStore } from './partner.store';
import { PARTNER_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Partner } from '../../core/models';

const p1: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 8,
  commission: { type: 'percent', value: 10 },
};

describe('PartnerStore', () => {
  let store: PartnerStore;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PARTNER_REPO, useValue: createInMemoryRepo<Partner>([p1]) }],
    });
    store = TestBed.inject(PartnerStore);
  });

  it('初始載入既有民宿', () => {
    expect(store.partners()).toHaveLength(1);
  });

  it('新增民宿', () => {
    store.create({
      name: '陽光民宿',
      slug: 'sunshine',
      discountPercent: 5,
      commission: { type: 'per_vehicle_day', value: 100 },
    });
    expect(store.partners()).toHaveLength(2);
  });

  it('編輯民宿', () => {
    store.update('pt1', { name: '海景民宿（改）' });
    expect(store.partners().find((p) => p.id === 'pt1')?.name).toBe('海景民宿（改）');
  });

  it('刪除民宿', () => {
    store.remove('pt1');
    expect(store.partners()).toHaveLength(0);
  });

  describe('isSlugUnique', () => {
    it('已存在的 slug → false', () => {
      expect(store.isSlugUnique('seaview')).toBe(false);
    });

    it('不存在的 slug → true', () => {
      expect(store.isSlugUnique('newslug')).toBe(true);
    });

    it('排除自己時，自己的 slug 仍算唯一', () => {
      expect(store.isSlugUnique('seaview', 'pt1')).toBe(true);
    });

    it('不分大小寫比對', () => {
      expect(store.isSlugUnique('SeaView')).toBe(false);
    });
  });

  it('產生代訂連結（含 affiliate app 完整 origin，才能直接貼到瀏覽器打開）', () => {
    expect(store.bookingLink(p1)).toBe('http://localhost:4400/p/seaview');
  });
});
