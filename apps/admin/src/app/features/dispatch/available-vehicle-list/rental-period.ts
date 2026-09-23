/**
 * 租期的本地日期時間小工具。租期在表單裡是 `<input type="datetime-local">` 的格式（YYYY-MM-DDTHH:mm，本地時間），
 * 建單第 1 步的搜尋列把它拆成「日期區間＋取／還車時間」兩種控制項，這裡負責拆開與組回，讓表單欄位本身不必改。
 */

const pad = (n: number) => String(n).padStart(2, '0');
const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;

function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** 取／還車時間可選的時段：06:00–22:00，每 30 分鐘一格。 */
export const RENTAL_TIME_SLOTS: readonly string[] = Array.from({ length: (22 - 6) * 2 + 1 }, (_, i) =>
  minutesToTime(6 * 60 + i * 30),
);

/** 取／還車時間的預設值。 */
export const DEFAULT_RENTAL_TIME = '09:00';

/** Date → 本地日期 YYYY-MM-DD。 */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 本地日期時間字串的日期部分；不是 YYYY-MM-DDTHH:mm 格式時回傳空字串。 */
export function dateKeyOf(local: string): string {
  return LOCAL_DATE_TIME.exec(local)?.[1] ?? '';
}

/** 本地日期時間字串的時間部分（HH:mm）；不是 YYYY-MM-DDTHH:mm 格式時回傳空字串。 */
export function timeOf(local: string): string {
  return LOCAL_DATE_TIME.exec(local)?.[2] ?? '';
}

/** 日期（YYYY-MM-DD）＋時間（HH:mm）組回表單用的本地日期時間字串。 */
export function composeLocal(dateKey: string, time: string): string {
  return `${dateKey}T${time}`;
}

/** 本地日期（YYYY-MM-DD）→ 當天 00:00 的 Date；空字串回傳 null。 */
export function dateFromKey(dateKey: string): Date | null {
  if (!dateKey) return null;
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 可選時段；目前的值不在時段內（例如舊訂單的 10:15）時也放進去並依時間排序，選單才顯示得出來。 */
export function timeSlotsWith(time: string): string[] {
  if (!time || RENTAL_TIME_SLOTS.includes(time)) return [...RENTAL_TIME_SLOTS];
  return [...RENTAL_TIME_SLOTS, time].sort();
}

export interface RentalPeriod {
  start: Date;
  end: Date;
}

/** 兩個本地日期時間字串 → 期間；任一未填、無法解析，或還車不晚於取車時回傳 undefined。 */
export function rentalPeriodOf(startLocal: string, endLocal: string): RentalPeriod | undefined {
  if (!dateKeyOf(startLocal) || !dateKeyOf(endLocal)) return undefined;
  const start = new Date(startLocal);
  const end = new Date(endLocal);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return undefined;
  return { start, end };
}

/** 兩個日期之間跨了幾個日曆日（與定價引擎計算晚數的方式一致：只看日期、不看時間）。 */
export function calendarDaysBetween(start: Date, end: Date): number {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endDay.getTime() - startDay.getTime()) / 86_400_000);
}
