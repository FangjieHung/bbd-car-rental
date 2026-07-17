import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AddOnStore } from './addon.store';
import { ADDON_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { AddOn } from '../../core/models';

describe('AddOnStore', () => {
  let store: AddOnStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([
        { id: 'ao1', name: '雨衣', unitPrice: 50, unit: 'per_rental' }]) },
    ]});
    store = TestBed.inject(AddOnStore);
  });
  it('讀取', () => expect(store.addOns()).toHaveLength(1));
  it('新增', () => { store.create({ name: '座椅', unitPrice: 100, unit: 'per_day' }); expect(store.addOns()).toHaveLength(2); });
  it('刪除', () => { store.remove('ao1'); expect(store.addOns()).toHaveLength(0); });
});
