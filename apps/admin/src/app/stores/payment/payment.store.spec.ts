import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ChargeAdjustment, PaymentRecord, RefundRecord, RentalBooking } from '@car-rental/domain';
import {
  BOOKING_REPO,
  CHARGE_ADJUSTMENT_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { PaymentStore } from './payment.store';

const BOOKING: RentalBooking = {
  id: 'b1',
  vehicleId: 'v1',
  memberId: 'c1',
  startTime: '2026-07-20T09:00:00.000Z',
  endTime: '2026-07-22T18:00:00.000Z',
  pickupLocation: '馬公',
  returnLocation: '馬公',
  status: 'reserved',
  depositRequired: 500,
  priceBreakdown: {
    dailyLines: [],
    rentalRaw: 2000,
    tierDiscountPercent: 0,
    tierDiscountAmount: 0,
    rentalSubtotal: 2000,
    partnerDiscountPercent: 0,
    partnerDiscount: 0,
    addOnLines: [],
    addOnSubtotal: 0,
    insuranceSubtotal: 0,
    couponDiscount: 0,
    total: 2000,
  },
};

describe('PaymentStore', () => {
  let store: PaymentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([BOOKING]) },
        { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>() },
        { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>() },
        { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>() },
      ],
    });
    store = TestBed.inject(PaymentStore);
  });

  it('新增一筆已確認付款後，摘要立即反映最新已付金額與狀態', () => {
    expect(store.summaryFor('b1').status).toBe('deposit_due');

    store.recordPayment({
      bookingId: 'b1',
      amount: 500,
      method: 'cash',
      purpose: 'deposit',
      status: 'confirmed',
      receivedAt: '2026-07-19T10:00:00.000Z',
      handledBy: 'staff1',
    });

    const summary = store.summaryFor('b1');
    expect(summary.confirmedPayments).toBe(500);
    expect(summary.netPaid).toBe(500);
    expect(summary.status).toBe('deposit_paid');
    expect(store.paymentsFor('b1')).toHaveLength(1);
  });

  it('summaryFor 查無訂單時丟錯', () => {
    expect(() => store.summaryFor('nope')).toThrow('not found: nope');
  });
});
