import { VehicleStatus } from './enums';
import { InsurancePlan } from './insurance-plan';

export type VehicleCategory = 'car' | 'scooter' | 'ev';

/** 排檔方式：自排 / 手排 */
export type Transmission = 'auto' | 'manual';

/** 據點：機場 / 港口 / 店舖 */
export type RentalLocation = '機場' | '港口' | '店舖';

export const RENTAL_LOCATIONS: RentalLocation[] = ['機場', '港口', '店舖'];

/** 油量政策 */
export type FuelPolicy = 'full_to_full' | 'full_to_empty' | 'same_level';

/** 里程政策 */
export type MileagePolicy = 'unlimited' | 'limited';

/** 能源種類：汽油／燃油車（含機車）或電動車。決定還車能源讀數用油量八分格還是電量百分比。 */
export type EnergyType = 'gasoline' | 'electric';

/**
 * 依車輛分類推導能源種類的預設值：既有資料沒有 energyType 欄位時，'ev' 分類視為電動車，
 * 其餘（car／scooter）視為汽油車。呼叫端（例如 calculateReturnCharges）在讀到未設定
 * energyType 的舊資料時應套用這個 fallback，而不是直接視為 undefined。
 */
export function deriveEnergyTypeFallback(category: VehicleCategory): EnergyType {
  return category === 'ev' ? 'electric' : 'gasoline';
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  category: VehicleCategory;
  model: string;
  brand: string;
  displacement?: number;
  year: number;
  status: VehicleStatus;
  mileage: number;
  nextServiceMileage?: number;
  insuranceExpiry?: string;
  createdAt: string; // ISO

  // --- 前台車款卡片顯示用（皆為選填，後台未填時卡片會自動省略該欄） ---
  /** 車輛照片 URL；未提供時卡片顯示分類 icon 佔位 */
  imageUrl?: string;
  /** 車型分類標籤，例：小型轎車、休旅車；未提供時 fallback 到 category 標籤 */
  classLabel?: string;
  /** 乘載人數 */
  seats?: number;
  /** 可放行李件數 */
  luggage?: number;
  /** 是否有空調 */
  hasAirConditioner?: boolean;
  /** 排檔方式 */
  transmission?: Transmission;
  /** 是否為立即確認車款 */
  instantConfirm?: boolean;
  /** 提供此車款的供應商數量 */
  supplierCount?: number;
  /** 車輛所屬據點；未填時視為不確定，篩選特定據點時不會出現 */
  location?: RentalLocation;
  /** 可選購的保險方案 */
  insurancePlans?: InsurancePlan[];
  /** 油量政策 */
  fuelPolicy?: FuelPolicy;
  /** 里程政策 */
  mileagePolicy?: MileagePolicy;
  /** 能源種類；既有資料未填時，呼叫端以 deriveEnergyTypeFallback(category) 推導預設值。 */
  energyType?: EnergyType;
}
