import { describe, it, expect } from 'vitest';
import { calculateCommission } from './calculate-commission';
import { CommissionRule } from '../models';

describe('calculateCommission', () => {
  it('percent：抽 10% of rentalSubtotal', () => {
    const rule: CommissionRule = { type: 'percent', value: 10 };
    expect(calculateCommission({ rule, rentalSubtotal: 1140, days: 3 })).toBe(114);
  });
  it('per_vehicle_day：每天固定額 × 天數', () => {
    const rule: CommissionRule = { type: 'per_vehicle_day', value: 100 };
    expect(calculateCommission({ rule, rentalSubtotal: 1140, days: 3 })).toBe(300);
  });
  it('days 0 且 per_vehicle_day → 0', () => {
    expect(calculateCommission({ rule: { type: 'per_vehicle_day', value: 100 }, rentalSubtotal: 0, days: 0 })).toBe(0);
  });
  it('rentalSubtotal 0 且 percent → 0', () => {
    expect(calculateCommission({ rule: { type: 'percent', value: 10 }, rentalSubtotal: 0, days: 3 })).toBe(0);
  });
});
