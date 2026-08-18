import { VehicleStatus } from './enums';

export type VehicleCategory = 'car' | 'scooter' | 'ev';

/** 排檔方式：自排 / 手排 */
export type Transmission = 'auto' | 'manual';

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
}
