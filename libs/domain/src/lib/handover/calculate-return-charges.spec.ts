import { describe, it, expect } from 'vitest';
import { calculateReturnCharges } from './calculate-return-charges';
import { LateReturnPolicy, EnergyReturnPolicy } from '../models';

const SCHEDULED_RETURN = '2026-10-05T10:00:00+08:00';

/** 測試用逾時規則：15 分鐘免費寬限、每 30 分鐘一個計費單位、每單位 NT$200、單日上限 NT$1,000。 */
const LATE_POLICY: LateReturnPolicy = {
  graceMinutes: 15,
  unitMinutes: 30,
  feePerUnit: 200,
  dailyCap: 1_000,
};

/** 測試用汽油車能源規則：每缺一格 NT$150，另加 NT$100 固定處理費。 */
const FUEL_POLICY: EnergyReturnPolicy = {
  measure: 'eighths',
  feePerUnit: 150,
  serviceFee: 100,
};

/** 測試用電動車能源規則：每缺 1% NT$20，另加 NT$150 固定處理費。 */
const EV_POLICY: EnergyReturnPolicy = {
  measure: 'percent',
  feePerUnit: 20,
  serviceFee: 150,
};

function minutesLate(mins: number): string {
  const d = new Date(SCHEDULED_RETURN);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

describe('calculateReturnCharges', () => {
  describe('late fee', () => {
    it('charges nothing when returned exactly at the due time', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: SCHEDULED_RETURN,
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 8,
      });

      expect(result.quote.lateFee).toBe(0);
      expect(result.finalLateFee).toBe(0);
    });

    it('charges nothing when returned inside the grace period', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: minutesLate(10),
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 8,
      });

      expect(result.quote.lateFee).toBe(0);
    });

    it('charges one unit for one minute past the grace period', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: minutesLate(16), // 15 分鐘寬限 + 1 分鐘
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 8,
      });

      expect(result.quote.lateUnits).toBe(1);
      expect(result.quote.lateFee).toBe(200);
    });

    it('rounds a partial unit up to a full unit', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: minutesLate(46), // 寬限後 31 分鐘 → 2 個 30 分鐘單位
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 8,
      });

      expect(result.quote.lateUnits).toBe(2);
      expect(result.quote.lateFee).toBe(400);
    });

    it('caps the late fee at the daily cap', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: minutesLate(500), // 遠超上限
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 8,
      });

      expect(result.quote.lateFee).toBe(1_000);
    });
  });

  describe('energy fee', () => {
    it('charges for a gasoline vehicle dropping from 8/8 to 5/8', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: SCHEDULED_RETURN,
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 5,
      });

      expect(result.quote.energyDeficit).toBe(3);
      expect(result.quote.energyFee).toBe(3 * 150 + 100);
    });

    it('charges for an EV dropping from 80% to 62%', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: SCHEDULED_RETURN,
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: EV_POLICY,
        pickupEnergyLevel: 80,
        returnEnergyLevel: 62,
      });

      expect(result.quote.energyDeficit).toBe(18);
      expect(result.quote.energyFee).toBe(18 * 20 + 150);
    });

    it('charges nothing when the energy level did not drop', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: SCHEDULED_RETURN,
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 5,
        returnEnergyLevel: 8,
      });

      expect(result.quote.energyDeficit).toBe(0);
      expect(result.quote.energyFee).toBe(0);
    });
  });

  describe('manual adjustment', () => {
    it('throws when a manual adjustment differs from the quote but has no reason', () => {
      expect(() =>
        calculateReturnCharges({
          scheduledReturnAt: SCHEDULED_RETURN,
          actualReturnAt: minutesLate(16),
          lateReturnPolicy: LATE_POLICY,
          energyReturnPolicy: FUEL_POLICY,
          pickupEnergyLevel: 8,
          returnEnergyLevel: 8,
          manualAdjustment: { lateFee: 0 },
        }),
      ).toThrow();
    });

    it('applies a manual adjustment with a reason and marks the result as manually adjusted', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: minutesLate(16),
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 8,
        manualAdjustment: { lateFee: 0, reason: '客戶提前致電告知延誤，主管同意免收' },
      });

      expect(result.quote.lateFee).toBe(200); // 原始試算仍保留
      expect(result.finalLateFee).toBe(0);
      expect(result.manuallyAdjusted).toBe(true);
      expect(result.adjustmentReason).toBe('客戶提前致電告知延誤，主管同意免收');
    });

    it('does not require a reason when the manual adjustment matches the quote', () => {
      const result = calculateReturnCharges({
        scheduledReturnAt: SCHEDULED_RETURN,
        actualReturnAt: minutesLate(16),
        lateReturnPolicy: LATE_POLICY,
        energyReturnPolicy: FUEL_POLICY,
        pickupEnergyLevel: 8,
        returnEnergyLevel: 8,
        manualAdjustment: { lateFee: 200 },
      });

      expect(result.finalLateFee).toBe(200);
      expect(result.manuallyAdjusted).toBe(false);
    });
  });
});
