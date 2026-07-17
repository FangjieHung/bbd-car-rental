import { VehicleCategory } from './vehicle';
export type CouponType = 'percent' | 'amount';
export interface Coupon {
  id: string; code: string; type: CouponType; value: number;
  minDays?: number; applicableCategories?: VehicleCategory[];
  validFrom: string; validTo: string; // 'YYYY-MM-DD'
}
