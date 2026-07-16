import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CustomerStore } from './customer.store';
import { CUSTOMER_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Customer } from '../../core/models';

describe('CustomerStore', () => {
  let store: CustomerStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>() }],
    });
    store = TestBed.inject(CustomerStore);
  });

  it('CRUD 與 nameOf', () => {
    const c = store.create({ name: '王小明', phone: '0912' });
    expect(store.customers()).toHaveLength(1);
    expect(store.nameOf(c.id)).toBe('王小明');
    expect(store.nameOf('nope')).toBe('—');
    store.update(c.id, { phone: '0999' });
    expect(store.customers()[0].phone).toBe('0999');
    store.remove(c.id);
    expect(store.customers()).toEqual([]);
  });
});
