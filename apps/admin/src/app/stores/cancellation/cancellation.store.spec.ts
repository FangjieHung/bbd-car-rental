import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CancellationCase } from '@car-rental/domain';
import { CANCELLATION_CASE_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { CancellationStore } from './cancellation.store';

describe('CancellationStore', () => {
  let store: CancellationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>() }],
    });
    store = TestBed.inject(CancellationStore);
  });

  it('試算報價後建立取消案件，refundLines 與 disposition 依報價結果轉存', () => {
    const quote = store.quote({
      contractKind: 'passenger_car',
      responsibility: 'customer',
      cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 1000,
      otherPrepayment: 0,
    });
    expect(quote.status).toBe('quoted');
    expect(quote.depositRefund).toBe(500); // 8 天前 → 7-9 日前級距 50%

    const kase = store.createCase({
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: '2026-07-10T10:00:00+08:00',
      ruleVersion: '2026.1',
      originalDepositPaid: 1000,
      originalOtherPrepayment: 0,
      quote,
    });

    expect(kase.status).toBe('quoted');
    expect(kase.disposition).toBe('refund');
    expect(kase.refundLines).toEqual([{ label: 'deposit', amount: 500 }]);
    expect(store.casesFor('b1')).toHaveLength(1);
  });

  it('manual_review 報價建立的案件狀態為 manual_review', () => {
    const quote = store.quote({
      contractKind: 'scooter',
      responsibility: 'customer',
      cancellationRequestedAt: '2026-07-10T10:00:00+08:00',
      pickupAt: '2026-07-18T09:00:00+08:00',
      depositPaid: 0,
      otherPrepayment: 0,
    });
    expect(quote.status).toBe('manual_review');

    const kase = store.createCase({
      bookingId: 'b2',
      contractKind: 'scooter',
      responsibility: 'customer',
      reason: 'scooter_cancellation_schedule_not_defined',
      requestedAt: '2026-07-10T10:00:00+08:00',
      ruleVersion: '2026.1',
      originalDepositPaid: 0,
      originalOtherPrepayment: 0,
      quote,
    });
    expect(kase.status).toBe('manual_review');
    expect(kase.refundLines).toEqual([]);
  });
});
