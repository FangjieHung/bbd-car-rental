import { CommissionRule } from '../models';

export function calculateCommission(input: {
  rule: CommissionRule;
  rentalSubtotal: number;
  days: number;
}): number {
  return input.rule.type === 'percent'
    ? Math.round((input.rentalSubtotal * input.rule.value) / 100)
    : input.rule.value * input.days;
}
