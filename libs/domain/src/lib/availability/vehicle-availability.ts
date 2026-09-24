import { OrderStatus, RentalOrder, Vehicle } from '../models';
import { rangesOverlap } from './ranges-overlap';

/** 會佔用車輛的訂單狀態：已預訂、出租中。已完成、已取消的訂單不再佔用車輛。 */
const OCCUPYING: readonly OrderStatus[] = ['reserved', 'in_progress'];

/** 一台車在某段期間不能租的原因。 */
export type VehicleUnavailableReason =
  | { kind: 'maintenance' }
  /** 與這段期間重疊、會佔用車輛的訂單（已預訂／出租中）。 */
  | { kind: 'booked'; order: RentalOrder };

/**
 * 要查的期間與佔用資料。時間字串必須與訂單的 startTime／endTime 同一種格式（admin 一律是
 * `toISOString()`）：重疊判斷沿用 rangesOverlap 的字串比較。
 */
export interface AvailabilityPeriod {
  startTime: string;
  endTime: string;
  orders: readonly RentalOrder[];
  /** 編輯既有訂單時排除它自己，否則它的車會被自己佔住、顯示成不能租。 */
  excludeBookingId?: string;
}

export interface VehicleAvailability {
  vehicle: Vehicle;
  /** 不能租的原因；空陣列＝這段期間可以租。 */
  reasons: VehicleUnavailableReason[];
}

export interface VehicleAvailabilityResult {
  /** 這段期間可以租的車，維持傳入的順序。 */
  available: Vehicle[];
  /** 這段期間不能租的車與原因，維持傳入的順序。 */
  unavailable: VehicleAvailability[];
}

/**
 * 可租判斷的唯一來源：保養中的車不能租；有與這段期間重疊、會佔用車輛的訂單也不能租。
 * 月曆的單日可用數、建單第 1 步的可租清單、官網車款清單（isVehicleAvailable）都呼叫這裡，
 * 不各自再算一次。重疊的訂單依取車時間排序，方便畫面直接列出「已預訂 {起訖}」。
 */
export function vehicleUnavailableReasons(vehicle: Vehicle, period: AvailabilityPeriod): VehicleUnavailableReason[] {
  const reasons: VehicleUnavailableReason[] = [];
  if (vehicle.status === 'maintenance') reasons.push({ kind: 'maintenance' });
  const overlapping = period.orders
    .filter(
      (b) =>
        b.id !== period.excludeBookingId &&
        b.vehicleId === vehicle.id &&
        OCCUPYING.includes(b.status) &&
        rangesOverlap(period.startTime, period.endTime, b.startTime, b.endTime),
    )
    .sort((a, b) => (a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0));
  for (const order of overlapping) reasons.push({ kind: 'booked', order });
  return reasons;
}

/** 一批車在同一段期間分成「可以租」與「不能租（附原因）」兩組。 */
export function vehicleAvailability(vehicles: readonly Vehicle[], period: AvailabilityPeriod): VehicleAvailabilityResult {
  const result: VehicleAvailabilityResult = { available: [], unavailable: [] };
  for (const vehicle of vehicles) {
    const reasons = vehicleUnavailableReasons(vehicle, period);
    if (reasons.length === 0) result.available.push(vehicle);
    else result.unavailable.push({ vehicle, reasons });
  }
  return result;
}
