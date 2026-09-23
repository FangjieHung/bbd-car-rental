/**
 * 整備（CONTEXT.md「整備」）：還車之後、下一次交車之前的清潔與檢查。
 *
 * 每次還車完成產生一筆（admin 的 `HandoverStore.performReturn()`，步驟 `prep_task_create`），
 * 按「整備完成」結案。它只是一份待辦清單：不改變車輛狀態、不影響可用數、不擋交車——
 * 同一台車還沒整備就又要交車時，只在取車清單上提醒（暫定，見 docs/owner-questions.md 第 11 條）。
 */
export interface PrepTask {
  id: string;
  vehicleId: string;
  /** 觸發這筆整備的訂單（剛辦完還車的那一筆）。 */
  bookingId: string;
  /** 實際還車時間（還車紀錄的 actualAt，不是訂單約定的還車時間）。 */
  returnedAt: string; // ISO
  /** 還車據點 id（該筆訂單的 returnLocation，見 RENTAL_BRANCHES）。 */
  returnLocation: string;
  /** 按下「整備完成」的時間；尚未完成時為 undefined。 */
  completedAt?: string; // ISO
  /** 按下「整備完成」的操作人（與稽核紀錄同一個來源：目前登入的後台使用者名稱）。 */
  completedBy?: string;
  /**
   * 還沒整備完，同一台車又辦了一次還車：舊的這筆由新的那筆取代（值為新那筆的 id）。
   * 取代不是完成——completedAt／completedBy 維持空白，留下「這次沒整備就出車」的紀錄；
   * 待整備清單因此每台車最多一筆（最新那次還車）。
   */
  supersededBy?: string;
}
