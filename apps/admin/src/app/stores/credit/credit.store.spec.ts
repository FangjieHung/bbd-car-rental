import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CustomerCreditLedgerEntry } from '@car-rental/domain';
import { CUSTOMER_CREDIT_LEDGER_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { CreditStore } from './credit.store';

describe('CreditStore', () => {
  let store: CreditStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>() },
      ],
    });
    store = TestBed.inject(CreditStore);
  });

  it('核發、折抵、展延購物金後，餘額由帳本加總正確推導', () => {
    store.issue({ memberId: 'c1', amount: 500, occurredAt: '2026-07-01T09:00:00.000Z', handledBy: 'staff1' });
    expect(store.balanceFor('c1')).toBe(500);

    store.redeem({ memberId: 'c1', amount: 200, occurredAt: '2026-07-05T09:00:00.000Z', handledBy: 'staff1' });
    expect(store.balanceFor('c1')).toBe(300);

    store.extend({
      memberId: 'c1',
      amount: 100,
      occurredAt: '2026-07-06T09:00:00.000Z',
      handledBy: 'staff1',
      reason: '效期展延加碼',
    });
    expect(store.balanceFor('c1')).toBe(400);
    expect(store.entriesFor('c1')).toHaveLength(3);
  });

  it('折抵金額超過餘額時丟錯，帳本不寫入該筆', () => {
    store.issue({ memberId: 'c1', amount: 100, occurredAt: '2026-07-01T09:00:00.000Z', handledBy: 'staff1' });

    expect(() =>
      store.redeem({ memberId: 'c1', amount: 200, occurredAt: '2026-07-02T09:00:00.000Z', handledBy: 'staff1' }),
    ).toThrow('購物金餘額不足');
    expect(store.entriesFor('c1')).toHaveLength(1);
  });
});
