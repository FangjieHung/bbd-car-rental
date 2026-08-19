import { VehicleCategory } from '@car-rental/domain';

/** 車輛大類：對客顯示只分機車/汽車，實際車輛分類（含 ev 電動機車）再往下對應 */
export type VehicleGroup = 'car' | 'scooter';

export const VEHICLE_GROUP_CATEGORIES: Record<VehicleGroup, VehicleCategory[]> = {
  car: ['car'],
  scooter: ['scooter', 'ev'],
};

/** 取還時間區間，ISO datetime 字串（例：2026-08-20T10:00:00） */
export interface DateRange {
  startDateTime: string;
  endDateTime: string;
  pickupLocation: string;
  returnLocation: string;
  /** 預設汽車；缺省時視為不篩選（相容舊資料） */
  vehicleGroup?: VehicleGroup;
}
