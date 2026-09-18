import { describe, it, expect } from 'vitest';
import { quoteCancellation } from './quote-cancellation';

const PICKUP = '2026-10-15T09:00:00+08:00';

describe('quoteCancellation', () => {
  describe('passenger_car customer-cancellation day-boundary schedule (Asia/Taipei calendar days)', () => {
    // 取車前完整日曆天數 → 訂金退費比例，逐字對應設計文件第 9.1 節的級距表：
    // 10 日前(含)以上 100%／7～9 日前 50%／4～6 日前 40%／2～3 日前 30%／前 1 日 20%／當日或未通知 0%。
    // 測 9 個點是為了驗證每個級距的兩端（例如 9 與 7 同屬「7～9 日前」50%），
    // 不是 9 個各自獨立的比例。
    const tiers: Array<[days: number, ratePercent: number]> = [
      [10, 100],
      [9, 50],
      [7, 50],
      [6, 40],
      [4, 40],
      [3, 30],
      [2, 30],
      [1, 20],
      [0, 0],
    ];

    it.each(tiers)('%s calendar days before pickup refunds %s%% of the deposit', (days, ratePercent) => {
      const requestedAt = `2026-10-${String(15 - days).padStart(2, '0')}T10:00:00+08:00`;

      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'customer',
        cancellationRequestedAt: requestedAt,
        pickupAt: PICKUP,
        depositPaid: 1_000,
        otherPrepayment: 500,
        transferFee: 0,
      });

      expect(quote.daysBeforePickup).toBe(days);
      expect(quote.depositRefund).toBe((1_000 * ratePercent) / 100);
      expect(quote.otherPrepaymentRefund).toBe(500);
      expect(quote.totalCashDue).toBe((1_000 * ratePercent) / 100 + 500);
      expect(quote.status).toBe('quoted');
    });

    it('refunds all non-deposit prepayment separately from the deposit penalty', () => {
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-10-01T10:00:00+08:00',
        pickupAt: '2026-10-06T09:00:00+08:00',
        depositPaid: 900,
        otherPrepayment: 2_100,
        transferFee: 0,
      });

      expect(quote.depositRefund).toBe(360);
      expect(quote.otherPrepaymentRefund).toBe(2_100);
      expect(quote.totalCashDue).toBe(2_460);
    });

    it('uses Asia/Taipei calendar-date boundaries, not elapsed 24-hour blocks', () => {
      // 只差 10 小時（23:00 -> 隔天 09:00），但跨過一個日曆日分界，仍要算「1 天前」。
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-10-14T23:00:00+08:00',
        pickupAt: '2026-10-15T09:00:00+08:00',
        depositPaid: 1_000,
        otherPrepayment: 0,
        transferFee: 0,
      });

      expect(quote.daysBeforePickup).toBe(1);
      expect(quote.depositRefund).toBe(200); // 前 1 日 → 20%
    });

    it('deducts the transfer fee from the total cash due', () => {
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-10-05T10:00:00+08:00',
        pickupAt: PICKUP,
        depositPaid: 1_000,
        otherPrepayment: 500,
        transferFee: 80,
      });

      expect(quote.transferFee).toBe(80);
      expect(quote.totalCashDue).toBe(1_000 + 500 - 80);
    });

    it('rejects a transfer fee outside the 0-100 range', () => {
      expect(() =>
        quoteCancellation({
          contractKind: 'passenger_car',
          responsibility: 'customer',
          cancellationRequestedAt: '2026-10-05T10:00:00+08:00',
          pickupAt: PICKUP,
          depositPaid: 1_000,
          otherPrepayment: 500,
          transferFee: 150,
        }),
      ).toThrow();
    });

    it('rounds the deposit refund to the nearest whole TWD, never fractional NT dollars', () => {
      // 333 * 0.3 = 99.9 — 舊版 Math.round(x*100)/100 會留下 99.9 這種非整數結果，
      // 新版 Math.round(x) 才會正確捨入成整數元。
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-10-12T10:00:00+08:00', // 3 天前 → 2～3 日前級距 30%
        pickupAt: PICKUP,
        depositPaid: 333,
        otherPrepayment: 0,
        transferFee: 0,
      });

      expect(quote.depositRefund).toBe(100);
      expect(Number.isInteger(quote.depositRefund)).toBe(true);
    });

    it('rejects a non-integer transfer fee', () => {
      expect(() =>
        quoteCancellation({
          contractKind: 'passenger_car',
          responsibility: 'customer',
          cancellationRequestedAt: '2026-10-05T10:00:00+08:00',
          pickupAt: PICKUP,
          depositPaid: 1_000,
          otherPrepayment: 500,
          transferFee: 33.5,
        }),
      ).toThrow();
    });

    it('rejects non-integer money inputs (depositPaid, otherPrepayment, agreedRentalTotal)', () => {
      expect(() =>
        quoteCancellation({
          contractKind: 'passenger_car',
          responsibility: 'customer',
          cancellationRequestedAt: '2026-10-05T10:00:00+08:00',
          pickupAt: PICKUP,
          depositPaid: 900.5,
          otherPrepayment: 500,
          transferFee: 0,
        }),
      ).toThrow();

      expect(() =>
        quoteCancellation({
          contractKind: 'passenger_car',
          responsibility: 'customer',
          cancellationRequestedAt: '2026-10-05T10:00:00+08:00',
          pickupAt: PICKUP,
          depositPaid: 900,
          otherPrepayment: 500.25,
          transferFee: 0,
        }),
      ).toThrow();

      expect(() =>
        quoteCancellation({
          contractKind: 'passenger_car',
          responsibility: 'operator_fault',
          cancellationRequestedAt: '2026-10-14T10:00:00+08:00',
          pickupAt: PICKUP,
          depositPaid: 0,
          otherPrepayment: 2_100,
          transferFee: 0,
          agreedRentalTotal: 3_000.5,
        }),
      ).toThrow();
    });
  });

  it('force majeure refunds everything in full and zeroes the fee', () => {
    const quote = quoteCancellation({
      contractKind: 'passenger_car',
      responsibility: 'force_majeure',
      cancellationRequestedAt: '2026-10-14T10:00:00+08:00',
      pickupAt: PICKUP,
      depositPaid: 900,
      otherPrepayment: 2_100,
      transferFee: 50,
    });

    expect(quote.depositRefund).toBe(900);
    expect(quote.otherPrepaymentRefund).toBe(2_100);
    expect(quote.transferFee).toBe(0);
    expect(quote.totalCashDue).toBe(3_000);
    expect(quote.status).toBe('quoted');
    expect(quote.disposition).toBe('refund');
  });

  describe('operator_fault statutory compensation', () => {
    it('returns twice the deposit when a deposit was collected', () => {
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        cancellationRequestedAt: '2026-10-14T10:00:00+08:00',
        pickupAt: PICKUP,
        depositPaid: 900,
        otherPrepayment: 2_100,
        transferFee: 50,
      });

      expect(quote.depositRefund).toBe(1_800);
      expect(quote.otherPrepaymentRefund).toBe(2_100);
      expect(quote.statutoryCompensation).toBe(900);
      expect(quote.transferFee).toBe(0);
      expect(quote.totalCashDue).toBe(3_900);
      expect(quote.status).toBe('quoted');
    });

    it('uses one agreed rental total as statutory compensation when no deposit was collected', () => {
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        cancellationRequestedAt: '2026-10-14T10:00:00+08:00',
        pickupAt: PICKUP,
        depositPaid: 0,
        otherPrepayment: 2_100,
        transferFee: 0,
        agreedRentalTotal: 3_000,
      });

      expect(quote.depositRefund).toBe(0);
      expect(quote.otherPrepaymentRefund).toBe(2_100);
      expect(quote.statutoryCompensation).toBe(3_000);
      expect(quote.totalCashDue).toBe(5_100);
      expect(quote.status).toBe('quoted');
    });

    it('cannot compute the no-deposit statutory compensation without agreedRentalTotal, so it goes to manual_review', () => {
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'operator_fault',
        cancellationRequestedAt: '2026-10-14T10:00:00+08:00',
        pickupAt: PICKUP,
        depositPaid: 0,
        otherPrepayment: 2_100,
        transferFee: 0,
      });

      expect(quote.status).toBe('manual_review');
    });
  });

  describe('manual_review gates', () => {
    it('returns manual_review when the contract kind has no defined cancellation schedule (scooter)', () => {
      const quote = quoteCancellation({
        contractKind: 'scooter',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-10-14T10:00:00+08:00',
        pickupAt: PICKUP,
        depositPaid: 300,
        otherPrepayment: 700,
        transferFee: 0,
      });

      expect(quote.status).toBe('manual_review');
      expect(quote.disposition).toBeNull();
    });

    it('returns manual_review for intentional operator misconduct', () => {
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'operator_intentional',
        cancellationRequestedAt: '2026-10-14T10:00:00+08:00',
        pickupAt: PICKUP,
        depositPaid: 900,
        otherPrepayment: 2_100,
        transferFee: 0,
      });

      expect(quote.status).toBe('manual_review');
    });

    it('returns manual_review when additional customer damage is claimed, regardless of responsibility', () => {
      const quote = quoteCancellation({
        contractKind: 'passenger_car',
        responsibility: 'customer',
        cancellationRequestedAt: '2026-10-05T10:00:00+08:00',
        pickupAt: PICKUP,
        depositPaid: 900,
        otherPrepayment: 2_100,
        transferFee: 0,
        additionalCustomerDamageClaimed: true,
      });

      expect(quote.status).toBe('manual_review');
    });
  });
});
