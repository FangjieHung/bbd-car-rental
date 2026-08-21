import { VehicleCategory } from '@car-rental/domain';

/** 車輛大類：對客顯示只分機車/汽車，實際車輛分類（含 ev 電動機車）再往下對應 */
export type VehicleGroup = 'car' | 'scooter';

export const VEHICLE_GROUP_CATEGORIES: Record<VehicleGroup, VehicleCategory[]> = {
  car: ['car'],
  scooter: ['scooter', 'ev'],
};

/** 網址帶進來的 group 是使用者可編輯的字串，用不到的值一律當成「未指定」而非讓查表炸掉 */
export function toVehicleGroup(value: string | null): VehicleGroup | undefined {
  return value && value in VEHICLE_GROUP_CATEGORIES ? (value as VehicleGroup) : undefined;
}

/** 取還時間區間，ISO datetime 字串（例：2026-08-20T10:00:00） */
export interface DateRange {
  startDateTime: string;
  endDateTime: string;
  /** 預設汽車；缺省時視為不篩選（相容舊資料） */
  vehicleGroup?: VehicleGroup;
}
