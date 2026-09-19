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

  it('核發購物金未指定到期日時，預設為核發時間起算 12 個月後', () => {
    const entry = store.issue({
      memberId: 'c1',
      amount: 500,
      occurredAt: '2026-07-01T09:00:00.000Z',
      handledBy: 'staff1',
    });
    expect(entry.expiresAt).toBe('2027-07-01T09:00:00.000Z');
  });

  it('核發購物金可明確覆寫到期日，不套用 12 個月預設值', () => {
    const entry = store.issue({
      memberId: 'c1',
      amount: 500,
      occurredAt: '2026-07-01T09:00:00.000Z',
      expiresAt: '2026-08-01T00:00:00.000Z',
      handledBy: 'staff1',
    });
    expect(entry.expiresAt).toBe('2026-08-01T00:00:00.000Z');
  });

  it('展延購物金未填理由時丟錯，帳本不寫入該筆', () => {
    store.issue({ memberId: 'c1', amount: 500, occurredAt: '2026-07-01T09:00:00.000Z', handledBy: 'staff1' });

    expect(() =>
      store.extend({
        memberId: 'c1',
        amount: 0,
        occurredAt: '2026-07-06T09:00:00.000Z',
        handledBy: 'staff1',
        expiresAt: '2027-08-01T00:00:00.000Z',
      }),
    ).toThrow('展延保留金必須填寫理由');
    expect(store.entriesFor('c1')).toHaveLength(1);
  });

  it('展延購物金填了理由才會寫入帳本', () => {
    store.issue({ memberId: 'c1', amount: 500, occurredAt: '2026-07-01T09:00:00.000Z', handledBy: 'staff1' });

    const entry = store.extend({
      memberId: 'c1',
      amount: 0,
      occurredAt: '2026-07-06T09:00:00.000Z',
      handledBy: 'staff1',
      reason: '顧客申請展延',
      expiresAt: '2027-08-01T00:00:00.000Z',
    });
    expect(entry.reason).toBe('顧客申請展延');
    expect(store.entriesFor('c1')).toHaveLength(2);
  });

  it('expiringWithin 只回傳到期前 30 天內、尚未過期的 issued／extended 紀錄', () => {
    const asOf = '2026-07-01T00:00:00.000Z';
    // 20 天後到期：在提醒範圍內
    store.issue({
      memberId: 'c1',
      amount: 100,
      occurredAt: '2026-06-01T00:00:00.000Z',
      expiresAt: '2026-07-21T00:00:00.000Z',
      handledBy: 'staff1',
    });
    // 90 天後到期：不在提醒範圍內
    store.issue({
      memberId: 'c1',
      amount: 100,
      occurredAt: '2026-06-01T00:00:00.000Z',
      expiresAt: '2026-09-29T00:00:00.000Z',
      handledBy: 'staff1',
    });
    // 已於 asOf 之前到期：不應提醒（已過期，非「即將到期」）
    store.issue({
      memberId: 'c1',
      amount: 100,
      occurredAt: '2026-05-01T00:00:00.000Z',
      expiresAt: '2026-06-01T00:00:00.000Z',
      handledBy: 'staff1',
    });
    // redeemed 類型不具到期日語意，即使 expiresAt 落在範圍內也不列入
    store.redeem({ memberId: 'c1', amount: 50, occurredAt: '2026-07-01T00:00:00.000Z', handledBy: 'staff1' });

    const reminders = store.expiringWithin('c1', 30, asOf);
    expect(reminders).toHaveLength(1);
    expect(reminders[0].expiresAt).toBe('2026-07-21T00:00:00.000Z');
  });
});
