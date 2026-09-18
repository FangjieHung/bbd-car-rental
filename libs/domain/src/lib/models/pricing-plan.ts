import { VehicleCategory } from './vehicle';
export type DayType = 'weekday' | 'weekend' | 'holiday' | 'peak';
export interface DayTier { minDays: number; discountPercent: number; }

/**
 * 逾時還車規則（設計文件第 4.5 節「逾時規則放在定價方案」）：免費寬限分鐘數、
 * 計費單位分鐘數（逾時超過寬限後，每滿一個單位收一次費，不足一單位也算一單位）、
 * 每單位逾時費、單日費用上限。具體數值屬各方案自行設定，不是固定的營運常數。
 */
export interface LateReturnPolicy {
  graceMinutes: number;
  unitMinutes: number;
  feePerUnit: number;
  dailyCap: number;
}

/**
 * 能源補繳規則（設計文件第 4.5 節「能源補繳規則依車輛或車型設定」）：
 * measure 決定讀數單位是油量八分格（'eighths'）還是電量百分比（'percent'）；
 * feePerUnit 是每缺一格油量／每缺 1% 電量的費率；serviceFee 是有虧缺時另收的固定處理費。
 */
export interface EnergyReturnPolicy {
  measure: 'eighths' | 'percent';
  feePerUnit: number;
  serviceFee: number;
}

export interface PricingPlan {
  id: string; name: string;
  appliesToCategory: VehicleCategory;
  dayTypeRates: Record<DayType, number>;
  tiers: DayTier[];
  /** 選填：未設定的既有方案沒有逾時／能源補繳規則，還車試算時視為無此類收費。 */
  lateReturnPolicy?: LateReturnPolicy;
  energyReturnPolicy?: EnergyReturnPolicy;
}
export interface DateRange { start: string; end: string; } // 'YYYY-MM-DD'（含當日）
export interface SeasonCalendar { id: string; holidays: DateRange[]; peakSeasons: DateRange[]; }
