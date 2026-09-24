import { Injectable, Signal, inject, signal } from '@angular/core';
import { ReminderOffset, ReminderState, ReminderStatus } from '@car-rental/domain';
import { REMINDER_STATUS_REPO } from '../../core/repositories/tokens';
import { ReminderGateway } from '../../core/services/reminder.gateway';

/** 兩種預設排程 offset，依設計文件第 8 節固定順序：先 24 小時前，再 2 小時前。 */
export const REMINDER_OFFSETS: readonly ReminderOffset[] = ['24h_before_return', '2h_before_return'];

const REMINDER_OFFSET_HOURS: Record<ReminderOffset, number> = {
  '24h_before_return': 24,
  '2h_before_return': 2,
};

/** 還車前 hoursBefore 小時的排程時間（ISO），由還車時間反推——設計文件第 8 節。 */
export function reminderScheduledFor(endTimeIso: string, hoursBefore: number): string {
  return new Date(new Date(endTimeIso).getTime() - hoursBefore * 60 * 60 * 1000).toISOString();
}

/**
 * 是否為「可重試」的失敗：以排定寄送時間是否已過作依據——時間未到就失敗，代表還有機會在期限內
 * 重試；時間已過仍失敗，代表這次提醒的時機已經錯過，重試已無意義（永久失敗）。真正的寄送與
 * 重試邏輯由後端負責（設計文件第 8 節），這個函式只是前端顯示用的判斷，不代表任何真的重試行為。
 * 沒有 scheduledFor 可比較時保守視為可重試（不主動宣告一件連排定時間都不知道的事已經無法挽回）。
 */
export function isRetryableReminderFailure(status: ReminderStatus, now: Date = new Date()): boolean {
  if (status.state !== 'failed') return false;
  if (!status.scheduledFor) return true;
  return new Date(status.scheduledFor).getTime() > now.getTime();
}

export interface ScheduleRemindersForOrderInput {
  bookingId: string;
  /** 還車時間（ISO），兩個 offset 都由此反推排程時間。 */
  endTime: string;
  email?: string;
}

export interface RecordMockDispatchOutcomeInput {
  bookingId: string;
  offset: ReminderOffset;
  outcome: Extract<ReminderState, 'sent' | 'failed'>;
  failureReason?: string;
  /** 模擬後端回報的時間（ISO），預設為呼叫當下。 */
  at?: string;
}

/** 對一筆不是 'scheduled' 狀態的提醒呼叫 recordMockDispatchOutcome 時擲出——只有已排程的提醒才可能有寄送結果。 */
export class ReminderNotScheduledError extends Error {
  constructor(
    readonly bookingId: string,
    readonly offset: ReminderOffset,
  ) {
    super(`提醒尚未排程（bookingId=${bookingId}, offset=${offset}），無法記錄寄送結果。`);
    this.name = 'ReminderNotScheduledError';
  }
}

/**
 * 還車提醒狀態的持久層——設計文件第 8 節「Email 還車提醒」：
 * 還車前 24 小時（完整內容）與還車前 2 小時（短版提醒）兩則預設排程、缺少 Email 時回報
 * missing_email、修改還車時間後取消舊排程並重排、訂單取消或完成後不寄。
 *
 * 這是唯一負責把 ReminderStatus 寫入 REMINDER_STATUS_REPO 的地方——修補 Task 7 遺留、
 * Task 10 覆核確認「correctly scoped to Task 17」的已知缺口：MockReminderGateway.schedule()
 * 只寫自己私有的記憶體 Map，從不寫回這個 repository，呼叫端過去看不到任何持久化的提醒狀態。
 *
 * 實際排程模擬呼叫委派給 ReminderGateway（Task 7 的 mock adapter，型別上保證 schedule() 絕不會
 * 回報 'sent'——見 ReminderScheduleState 的排除設計），這裡只負責「呼叫 gateway 模擬 → 把結果
 * 轉存成一筆持久化的 ReminderStatus 紀錄」。'sent'／'failed' 這兩個只有真正後端才會知道的終態，
 * 只能透過 recordMockDispatchOutcome() 這個明確標示為開發期模擬用途的方法寫入；scheduleForOrder
 * 與 suppressForOrder 這兩個正常流程永遠不會產生、也不會宣稱 'sent'。
 */
@Injectable({ providedIn: 'root' })
export class ReminderStore {
  private readonly repo = inject(REMINDER_STATUS_REPO);
  private readonly gateway = inject(ReminderGateway);

  private readonly _statuses = signal<ReminderStatus[]>(this.repo.getAll());
  readonly statuses: Signal<ReminderStatus[]> = this._statuses.asReadonly();

  statusesFor(bookingId: string): ReminderStatus[] {
    return this._statuses()
      .filter((s) => s.bookingId === bookingId)
      .sort((a, b) => REMINDER_OFFSETS.indexOf(a.offset) - REMINDER_OFFSETS.indexOf(b.offset));
  }

  /**
   * 排程（或重新排程）這筆訂單的兩個 offset。已存在且尚未進入 sent 終態的舊排程，會先透過
   * gateway.cancel() 取消，再依新的還車時間重新呼叫 gateway.schedule()——這就是設計文件
   * 「修改還車時間後取消舊排程並重排」的實作：同一個方法無論是初次建立還是編輯後重打，
   * 行為完全一致，呼叫端不需要自己分辨「這是第一次還是第幾次」。
   *
   * 沒有 Email 時仍會照常呼叫（一律排程兩個 offset），讓 missing_email 也留下一筆持久化紀錄
   * 供畫面顯示（設計文件要求前端顯示這個狀態，不能因為沒有 Email 就什麼都不寫）。
   *
   * 已經 sent 的 offset 不會被動到：信已經寄出去了，無法收回，這裡的判斷是「沒有必要為了
   * 還車時間變動重寄一次」——設計文件未細述這個邊界情況，是本任務的實作判斷。
   */
  async scheduleForOrder(input: ScheduleRemindersForOrderInput): Promise<ReminderStatus[]> {
    const results: ReminderStatus[] = [];

    for (const offset of REMINDER_OFFSETS) {
      const existing = this.findStatus(input.bookingId, offset);
      if (existing?.state === 'sent') {
        results.push(existing);
        continue;
      }
      if (existing) {
        await this.gateway.cancel(input.bookingId, offset);
      }

      const scheduledFor = reminderScheduledFor(input.endTime, REMINDER_OFFSET_HOURS[offset]);
      const dispatch = await this.gateway.schedule({
        bookingId: input.bookingId,
        offset,
        scheduledFor,
        ...(input.email ? { email: input.email } : {}),
      });

      const status: ReminderStatus = {
        id: existing?.id ?? crypto.randomUUID(),
        bookingId: input.bookingId,
        offset,
        state: dispatch.state,
        ...(dispatch.state === 'scheduled' ? { scheduledFor } : {}),
        updatedAt: new Date().toISOString(),
      };
      this.upsert(status);
      results.push(status);
    }

    return results;
  }

  /**
   * 訂單取消或完成後不寄——設計文件第 8 節。取消所有尚未進入 sent 終態的排程，並直接移除紀錄
   * （ReminderStatus 模型註解：本模型不強制規定用哪個 state 表示「已終止」，交由呼叫端決定，
   * 這裡選擇直接刪除，行為等同「這筆訂單從此不會再有這個 offset 的提醒」）。已經 sent 的紀錄
   * 保留下來，作為活動歷程的一部分——那是真的發生過的事，不因訂單後來取消或完成而消失。
   */
  async suppressForOrder(bookingId: string): Promise<void> {
    for (const offset of REMINDER_OFFSETS) {
      const existing = this.findStatus(bookingId, offset);
      if (!existing || existing.state === 'sent') continue;
      await this.gateway.cancel(bookingId, offset);
      this.repo.remove(existing.id);
    }
    this.reload();
  }

  /**
   * 模擬後端回報的寄送結果。真正的寄送與重試邏輯屬於後端（設計文件第 8 節），前端沒有、
   * 也不會假裝有能力知道信真的寄出去了沒有——這個方法明確標示為開發期模擬掛勾，等同 seed
   * 資料手動指定 'sent'／'failed' 狀態的「執行期」版本，只供 demo 與測試使用。只有目前狀態
   * 是 'scheduled' 的提醒才可能有寄送結果（missing_email／已終止的紀錄不會有後端寄送嘗試）。
   */
  recordMockDispatchOutcome(input: RecordMockDispatchOutcomeInput): ReminderStatus {
    const existing = this.findStatus(input.bookingId, input.offset);
    if (!existing || existing.state !== 'scheduled') {
      throw new ReminderNotScheduledError(input.bookingId, input.offset);
    }

    const at = input.at ?? new Date().toISOString();
    const status: ReminderStatus = {
      ...existing,
      state: input.outcome,
      updatedAt: at,
      ...(input.outcome === 'sent' ? { sentAt: at } : {}),
      ...(input.outcome === 'failed' ? { failureReason: input.failureReason ?? '未提供原因' } : {}),
    };
    this.upsert(status);
    return status;
  }

  private findStatus(bookingId: string, offset: ReminderOffset): ReminderStatus | undefined {
    return this._statuses().find((s) => s.bookingId === bookingId && s.offset === offset);
  }

  private upsert(status: ReminderStatus): void {
    const current = this.repo.getById(status.id);
    if (current) {
      this.repo.update(status.id, status);
    } else {
      this.repo.create(status);
    }
    this.reload();
  }

  private reload(): void {
    this._statuses.set(this.repo.getAll());
  }
}
