import { VehicleCategory } from '../models/vehicle';

/**
 * 小客車訂金上限比例：設計文件「小客車訂金預設不得超過總租金 30%」（第 4.2 節）。
 * 機車／電動機車目前沒有訂金規則，一律預設 0（Task 3 review round 定案的規則，見
 * normalize-rental-booking.ts 的沿革註解）。
 */
export const PASSENGER_CAR_DEPOSIT_CAP_PERCENT = 0.3;

/**
 * 依車型分類計算訂金上限（同時也是預設值）：小客車為報價總額的 30%（四捨五入至整數 TWD）；
 * 機車／電動機車／查無車型（category 為 undefined）一律 0 —— 沒有查到車輛時保守預設 0，
 * 不猜測套用小客車規則（避免對機車/電動機車錯課訂金）。
 *
 * 這是 Task 3 修正 normalizeRentalBooking 舊資料遷移時定案的唯一規則來源，抽成這個純函式
 * 讓「舊資料遷移的預設訂金」與「Task 10 新增訂單精靈的訂金上限」共用同一套邏輯，
 * 不會各自實作出兩份可能各自飄移（drift）的數值。
 */
export function defaultDepositForCategory(
  category: VehicleCategory | undefined,
  total: number,
): number {
  return category === 'car' ? Math.round(total * PASSENGER_CAR_DEPOSIT_CAP_PERCENT) : 0;
}
