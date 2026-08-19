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

/** 取還地點選項。網址未帶地點時（例如重構前發出的連結）以此為預設，等同重新進站的行為 */
export const LOCATIONS = ['機場', '港口', '店舖'] as const;
// 刻意不寫成 LOCATIONS[0]：那會是不可拓寬的字面型別，
// date-step 用它初始化可變欄位時會被鎖死成 '機場' 而無法指派其他地點。
export const DEFAULT_LOCATION = '機場';

/** 取還時間區間，ISO datetime 字串（例：2026-08-20T10:00:00） */
export interface DateRange {
  startDateTime: string;
  endDateTime: string;
  pickupLocation: string;
  returnLocation: string;
  /** 預設汽車；缺省時視為不篩選（相容舊資料） */
  vehicleGroup?: VehicleGroup;
}
