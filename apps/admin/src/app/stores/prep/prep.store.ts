import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { PrepQueueItem, PrepTask, isPrepTaskOpen, prepQueue } from '@car-rental/domain';
import { PREP_TASK_REPO } from '../../core/repositories/tokens';
import { OrderStore } from '../order/order.store';

export interface OpenPrepTaskInput {
  vehicleId: string;
  bookingId: string;
  /** 實際還車時間（還車紀錄的 actualAt）。 */
  returnedAt: string;
  /** 還車據點 id（訂單的 returnBranchId）。 */
  returnBranchId: string;
}

/**
 * 4.3 待整備（CONTEXT.md「整備」）：還車後自動列入、按「整備完成」結案的待辦清單。
 *
 * 刻意只是一份清單——這裡不碰 VehicleStore：不改車輛狀態、不影響月曆可用數與可租清單、
 * 不擋取車（見 docs/owner-questions.md 第 11 條的暫定決定）。取車清單只拿 hasOpenTaskFor()
 * 顯示「尚未整備」提醒，不列入取車就緒判斷。
 */
@Injectable({ providedIn: 'root' })
export class PrepStore {
  private readonly repo = inject(PREP_TASK_REPO);
  private readonly orderStore = inject(OrderStore);

  private readonly _tasks = signal<PrepTask[]>(this.repo.getAll());
  readonly tasks: Signal<PrepTask[]> = this._tasks.asReadonly();

  /** 尚未結案的整備（沒按「整備完成」、也沒被同一台車之後的還車取代）。 */
  readonly openTasks = computed(() => this._tasks().filter(isPrepTaskOpen));

  /** 總覽頁首「待整備 N」的 N。 */
  readonly openCount = computed(() => this.openTasks().length);

  /** 待整備清單：依該車下一次取車時間排序，最急的在上面、沒有下一筆取車的排最後（見 prepQueue）。 */
  readonly queue: Signal<PrepQueueItem[]> = computed(() =>
    prepQueue(this._tasks(), this.orderStore.orders()),
  );

  private readonly openVehicleIds = computed(() => new Set(this.openTasks().map((t) => t.vehicleId)));

  /** 這台車目前有沒有還沒整備的待辦（取車清單的「尚未整備」提醒）。 */
  hasOpenTaskFor(vehicleId: string): boolean {
    return this.openVehicleIds().has(vehicleId);
  }

  /**
   * 還車完成後列入待整備（HandoverStore.performReturn 的 prep_task_create 步驟）。
   * - 同一筆訂單已經列過（例如還車流程重試）就直接回傳那一筆：一次還車只會有一筆整備。
   * - 同一台車還有沒整備完的舊待辦（上次還車後沒整備就又出車）：舊的標記為被這筆取代，
   *   不算完成（completedAt／completedBy 維持空白），清單上每台車只留最新這次還車。
   */
  openForReturn(input: OpenPrepTaskInput): PrepTask {
    const existing = this.repo.getAll().find((t) => t.bookingId === input.bookingId);
    if (existing) return existing;

    const task: PrepTask = { id: crypto.randomUUID(), ...input };
    for (const stale of this.repo.getAll().filter((t) => t.vehicleId === input.vehicleId && isPrepTaskOpen(t))) {
      this.repo.update(stale.id, { supersededBy: task.id });
    }
    this.repo.create(task);
    this.reload();
    return task;
  }

  /**
   * 「整備完成」：記錄完成時間與操作人，從待整備清單移除。已經結案的（重複點擊、或已被取代）
   * 原樣回傳，不改寫第一次留下的完成紀錄。
   */
  complete(id: string, completedBy: string, completedAt: string = new Date().toISOString()): PrepTask {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    if (!isPrepTaskOpen(current)) return current;
    const updated = this.repo.update(id, { completedAt, completedBy });
    this.reload();
    return updated;
  }

  private reload(): void {
    this._tasks.set(this.repo.getAll());
  }
}
