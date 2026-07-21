import { RentalBooking } from '../models';

/**
 * 一筆訂單的租期天數，供 calculateCommission() 的 days 參數使用。
 * 優先用 priceBreakdown.dailyLines.length（跟 calculatePrice() 內部的晚數定義一致）；
 * 沒有 priceBreakdown（或 dailyLines 是空陣列）時 fallback 用 startTime/endTime 差幾天。
 * admin 的退佣報表與 affiliate 的對帳頁都要用這個函式，避免兩邊各自實作出不一致的天數。
 */
export function rentalDaysOf(booking: RentalBooking): number {
  if (booking.priceBreakdown?.dailyLines.length) {
    return booking.priceBreakdown.dailyLines.length;
  }
  const ms = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}
