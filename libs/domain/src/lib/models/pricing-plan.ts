import { VehicleCategory } from './vehicle';
export type DayType = 'weekday' | 'weekend' | 'holiday' | 'peak';
export interface DayTier { minDays: number; discountPercent: number; }
export interface PricingPlan {
  id: string; name: string;
  appliesToCategory: VehicleCategory;
  dayTypeRates: Record<DayType, number>;
  tiers: DayTier[];
}
export interface DateRange { start: string; end: string; } // 'YYYY-MM-DD'（含當日）
export interface SeasonCalendar { id: string; holidays: DateRange[]; peakSeasons: DateRange[]; }
