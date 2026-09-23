import { PrepTask, RentalBooking } from '../models';

/** 尚未結案：沒有按「整備完成」，也沒有被同一台車之後的還車取代（見 PrepTask.supersededBy）。 */
export function isPrepTaskOpen(task: PrepTask): boolean {
  return !task.completedAt && !task.supersededBy;
}

/**
 * 這台車的下一次取車：尚未取車（reserved）的訂單中，取車時間最早的那一筆。
 * 刻意不排除「取車時間已經過了」的預訂——前一位客人晚還、下一位客人已經在等，
 * 正是最需要先整備的情況，應該排在清單最上面。
 */
export function nextPickupOf(
  vehicleId: string,
  bookings: readonly RentalBooking[],
): RentalBooking | undefined {
  let next: RentalBooking | undefined;
  for (const booking of bookings) {
    if (booking.vehicleId !== vehicleId || booking.status !== 'reserved') continue;
    if (!next || timeOf(booking.startTime) < timeOf(next.startTime)) next = booking;
  }
  return next;
}

export interface PrepQueueItem {
  task: PrepTask;
  /** 該車下一次取車（見 nextPickupOf）；沒有排定就是 undefined。 */
  nextPickup: RentalBooking | undefined;
}

/**
 * 待整備清單：只列尚未結案的整備，依「該車下一次取車時間」由近到遠排序（最急的在上面），
 * 沒有下一筆取車的排最後；下一次取車時間相同（或都沒有）時，先還車的排前面。
 */
export function prepQueue(
  tasks: readonly PrepTask[],
  bookings: readonly RentalBooking[],
): PrepQueueItem[] {
  return tasks
    .filter(isPrepTaskOpen)
    .map((task) => ({ task, nextPickup: nextPickupOf(task.vehicleId, bookings) }))
    .sort(comparePrepQueueItems);
}

function comparePrepQueueItems(a: PrepQueueItem, b: PrepQueueItem): number {
  const aNext = a.nextPickup ? timeOf(a.nextPickup.startTime) : Number.POSITIVE_INFINITY;
  const bNext = b.nextPickup ? timeOf(b.nextPickup.startTime) : Number.POSITIVE_INFINITY;
  // 兩邊都沒有下一筆（都是 Infinity）時不能直接相減（Infinity - Infinity 是 NaN），改比還車時間。
  if (aNext !== bNext) return aNext < bNext ? -1 : 1;
  return timeOf(a.task.returnedAt) - timeOf(b.task.returnedAt);
}

function timeOf(iso: string): number {
  return new Date(iso).getTime();
}
