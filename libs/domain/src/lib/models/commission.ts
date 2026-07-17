export type CommissionType = 'percent' | 'per_vehicle_day';

export interface CommissionRule {
  type: CommissionType;
  value: number;
}
