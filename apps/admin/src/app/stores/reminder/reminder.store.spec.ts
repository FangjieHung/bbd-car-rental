import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReminderStatus } from '@car-rental/domain';
import { REMINDER_STATUS_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import {
  ReminderDispatchResult,
  ReminderGateway,
  ScheduleReminderInput,
} from '../../core/services/reminder.gateway';
import {
  ReminderNotScheduledError,
  ReminderStore,
  isRetryableReminderFailure,
  reminderScheduledFor,
} from './reminder.store';

const T_END = '2026-07-22T18:00:00.000Z';
const T_END_MOVED = '2026-07-24T12:00:00.000Z';

/**
 * 可觀測的 fake gateway：記錄每次 schedule／cancel 呼叫，行為與 MockReminderGateway 一致
 * （沒有 Email 回報 missing_email，否則 scheduled；絕不回報 sent），但額外留下呼叫紀錄
 * 供測試直接斷言「取消舊排程再重排」「取消/完成後真的呼叫了 cancel」這類行為。
 */
class FakeReminderGateway implements ReminderGateway {
  readonly scheduleCalls: ScheduleReminderInput[] = [];
  readonly cancelCalls: Array<{ bookingId: string; offset: ScheduleReminderInput['offset'] }> = [];

  async schedule(input: ScheduleReminderInput): Promise<ReminderDispatchResult> {
    this.scheduleCalls.push(input);
    if (!input.email || input.email.trim() === '') return { state: 'missing_email' };
    return { state: 'scheduled' };
  }

  async cancel(bookingId: string, offset: ScheduleReminderInput['offset']): Promise<void> {
    this.cancelCalls.push({ bookingId, offset });
  }
}

describe('ReminderStore', () => {
  let gateway: FakeReminderGateway;
  let repo: ReturnType<typeof createInMemoryRepo<ReminderStatus>>;

  function configure(initial: ReminderStatus[] = []) {
    gateway = new FakeReminderGateway();
    repo = createInMemoryRepo<ReminderStatus>(initial);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: REMINDER_STATUS_REPO, useValue: repo },
        { provide: ReminderGateway, useValue: gateway },
      ],
    });
    return TestBed.inject(ReminderStore);
  }

  beforeEach(() => configure());

  describe('reminderScheduledFor（純函式）', () => {
    it('依還車時間反推指定小時數之前的 ISO 時間', () => {
      expect(reminderScheduledFor(T_END, 24)).toBe('2026-07-21T18:00:00.000Z');
      expect(reminderScheduledFor(T_END, 2)).toBe('2026-07-22T16:00:00.000Z');
    });
  });

  describe('scheduleForOrder：初次排程', () => {
    it('有 Email：24 小時前與 2 小時前兩則都寫入 scheduled 狀態，scheduledFor 正確反推，且真的持久化到 REMINDER_STATUS_REPO', async () => {
      const store = configure();
      const results = await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END, email: 'a@b.com' });

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.state === 'scheduled')).toBe(true);

      // 這是本任務要修補的缺口：直接讀 REMINDER_STATUS_REPO（不是只讀 store 的記憶體 signal）
      // 才能證明真的寫回了持久層，不是只停在 gateway 自己的私有 Map。
      const persisted = repo.getAll();
      expect(persisted).toHaveLength(2);
      const byOffset = Object.fromEntries(persisted.map((s) => [s.offset, s]));
      expect(byOffset['24h_before_return']).toMatchObject({
        bookingId: 'b1',
        state: 'scheduled',
        scheduledFor: '2026-07-21T18:00:00.000Z',
      });
      expect(byOffset['2h_before_return']).toMatchObject({
        bookingId: 'b1',
        state: 'scheduled',
        scheduledFor: '2026-07-22T16:00:00.000Z',
      });

      expect(gateway.scheduleCalls).toHaveLength(2);
      expect(gateway.scheduleCalls.map((c) => c.offset).sort()).toEqual(
        ['24h_before_return', '2h_before_return'].sort(),
      );
    });

    it('沒有 Email：兩則都回報 missing_email，不帶 scheduledFor 欄位，但仍然持久化（不能因為沒有 Email 就什麼都不寫）', async () => {
      const store = configure();
      const results = await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END });

      expect(results).toHaveLength(2);
      for (const r of results) {
        expect(r.state).toBe('missing_email');
        expect(r.scheduledFor).toBeUndefined();
      }
      expect(repo.getAll()).toHaveLength(2);
    });
  });

  describe('scheduleForOrder：修改還車時間後重新排程', () => {
    it('取消舊排程、依新時間重排，且不會產生重複紀錄（同一 offset 沿用同一筆紀錄的 id）', async () => {
      const store = configure();
      const first = await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END, email: 'a@b.com' });
      const firstIds = Object.fromEntries(first.map((s) => [s.offset, s.id]));

      const second = await store.scheduleForOrder({
        bookingId: 'b1',
        endTime: T_END_MOVED,
        email: 'a@b.com',
      });

      // 舊排程真的被取消過——兩個 offset 各自呼叫了一次 gateway.cancel。
      expect(gateway.cancelCalls).toHaveLength(2);
      expect(gateway.cancelCalls.every((c) => c.bookingId === 'b1')).toBe(true);
      expect(gateway.cancelCalls.map((c) => c.offset).sort()).toEqual(
        ['24h_before_return', '2h_before_return'].sort(),
      );

      // 重排後的時間反映新的還車時間，不是舊的。
      const byOffset = Object.fromEntries(second.map((s) => [s.offset, s]));
      expect(byOffset['24h_before_return'].scheduledFor).toBe(reminderScheduledFor(T_END_MOVED, 24));
      expect(byOffset['2h_before_return'].scheduledFor).toBe(reminderScheduledFor(T_END_MOVED, 2));

      // 沒有產生重複紀錄：repo 仍只有 2 筆，且同一 offset 的 id 前後一致（就地更新，不是新增一筆）。
      expect(repo.getAll()).toHaveLength(2);
      expect(byOffset['24h_before_return'].id).toBe(firstIds['24h_before_return']);
      expect(byOffset['2h_before_return'].id).toBe(firstIds['2h_before_return']);
    });

    it('已經 sent 的 offset 不會被重新取消／重排：信已經寄出去了，無法收回', async () => {
      const now = '2026-07-20T09:00:00.000Z';
      const store = configure([
        {
          id: 'rem-24h',
          bookingId: 'b1',
          offset: '24h_before_return',
          state: 'sent',
          sentAt: now,
          scheduledFor: reminderScheduledFor(T_END, 24),
          updatedAt: now,
        },
      ]);

      await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END_MOVED, email: 'a@b.com' });

      // 24h 這則已經 sent，不該出現在 cancel 呼叫裡，內容也完全不變。
      expect(gateway.cancelCalls.some((c) => c.offset === '24h_before_return')).toBe(false);
      const sentRecord = repo.getById('rem-24h');
      expect(sentRecord?.state).toBe('sent');
      expect(sentRecord?.scheduledFor).toBe(reminderScheduledFor(T_END, 24));

      // 2h 這則沒有 sent 過，正常被排程。
      const twoHour = store.statusesFor('b1').find((s) => s.offset === '2h_before_return');
      expect(twoHour?.state).toBe('scheduled');
    });
  });

  describe('suppressForOrder：訂單取消或完成後不寄', () => {
    it('取消所有尚未 sent 的排程並移除紀錄，已 sent 的紀錄保留作為歷程', async () => {
      const store = configure();
      await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END, email: 'a@b.com' });
      store.recordMockDispatchOutcome({ bookingId: 'b1', offset: '24h_before_return', outcome: 'sent' });

      await store.suppressForOrder('b1');

      // 只有還沒 sent 的 2h 排程需要真的取消；已經 sent 的 24h 不需要（也不應該）被取消。
      expect(gateway.cancelCalls).toEqual([{ bookingId: 'b1', offset: '2h_before_return' }]);

      const remaining = store.statusesFor('b1');
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toMatchObject({ offset: '24h_before_return', state: 'sent' });
      expect(repo.getAll()).toHaveLength(1);
    });

    it('對沒有任何提醒紀錄的訂單是安全的 no-op', async () => {
      const store = configure();
      await expect(store.suppressForOrder('no-such-order')).resolves.toBeUndefined();
      expect(gateway.cancelCalls).toHaveLength(0);
    });
  });

  describe('recordMockDispatchOutcome：誠實保證——只有這個明確標示的模擬掛勾能寫入 sent／failed', () => {
    it('scheduleForOrder 本身永遠不會寫入 sent：排程流程的結果只會是 scheduled 或 missing_email', async () => {
      const store = configure();
      const results = await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END, email: 'a@b.com' });
      expect(results.some((r) => r.state === 'sent')).toBe(false);
      expect(repo.getAll().some((r) => r.state === 'sent')).toBe(false);
    });

    it('標記已寄送：state 轉為 sent、寫入 sentAt，且不影響另一個 offset', async () => {
      const store = configure();
      await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END, email: 'a@b.com' });

      const updated = store.recordMockDispatchOutcome({
        bookingId: 'b1',
        offset: '24h_before_return',
        outcome: 'sent',
        at: '2026-07-21T18:00:05.000Z',
      });

      expect(updated.state).toBe('sent');
      expect(updated.sentAt).toBe('2026-07-21T18:00:05.000Z');
      const other = store.statusesFor('b1').find((s) => s.offset === '2h_before_return');
      expect(other?.state).toBe('scheduled');
    });

    it('標記寄送失敗：state 轉為 failed、寫入 failureReason，並保留原本的 scheduledFor 供事後判斷是否可重試', async () => {
      const store = configure();
      await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END, email: 'a@b.com' });

      const updated = store.recordMockDispatchOutcome({
        bookingId: 'b1',
        offset: '2h_before_return',
        outcome: 'failed',
        failureReason: 'smtp_timeout',
      });

      expect(updated.state).toBe('failed');
      expect(updated.failureReason).toBe('smtp_timeout');
      expect(updated.scheduledFor).toBe(reminderScheduledFor(T_END, 2));
    });

    it('對尚未排程（或已經是 missing_email／sent）的提醒呼叫時擲出 ReminderNotScheduledError', async () => {
      const store = configure();
      // 完全沒有任何紀錄。
      expect(() =>
        store.recordMockDispatchOutcome({ bookingId: 'b1', offset: '24h_before_return', outcome: 'sent' }),
      ).toThrow(ReminderNotScheduledError);

      // missing_email 狀態也不該能標記寄送結果——根本沒有寄送對象。
      await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END });
      expect(() =>
        store.recordMockDispatchOutcome({ bookingId: 'b1', offset: '24h_before_return', outcome: 'sent' }),
      ).toThrow(ReminderNotScheduledError);
    });
  });

  describe('isRetryableReminderFailure：可重試 vs 永久失敗', () => {
    const now = new Date('2026-07-22T00:00:00.000Z');

    function failedStatus(scheduledFor?: string): ReminderStatus {
      return {
        id: 'r1',
        bookingId: 'b1',
        offset: '24h_before_return',
        state: 'failed',
        ...(scheduledFor ? { scheduledFor } : {}),
        failureReason: 'smtp_timeout',
        updatedAt: '2026-07-21T00:00:00.000Z',
      };
    }

    it('排定寄送時間尚未到——可重試', () => {
      expect(isRetryableReminderFailure(failedStatus('2026-07-23T00:00:00.000Z'), now)).toBe(true);
    });

    it('排定寄送時間已過——永久失敗，不再視為可重試', () => {
      expect(isRetryableReminderFailure(failedStatus('2026-07-21T00:00:00.000Z'), now)).toBe(false);
    });

    it('沒有 scheduledFor 可比較時，保守視為可重試', () => {
      expect(isRetryableReminderFailure(failedStatus(undefined), now)).toBe(true);
    });

    it('非 failed 狀態一律不是「可重試的失敗」', () => {
      const scheduled: ReminderStatus = {
        id: 'r2',
        bookingId: 'b1',
        offset: '24h_before_return',
        state: 'scheduled',
        scheduledFor: '2026-07-23T00:00:00.000Z',
        updatedAt: '2026-07-20T00:00:00.000Z',
      };
      expect(isRetryableReminderFailure(scheduled, now)).toBe(false);
    });
  });

  describe('statusesFor', () => {
    it('依 24h／2h 固定順序回傳，且只回傳該訂單自己的紀錄', async () => {
      const store = configure();
      await store.scheduleForOrder({ bookingId: 'b1', endTime: T_END, email: 'a@b.com' });
      await store.scheduleForOrder({ bookingId: 'b2', endTime: T_END, email: 'c@d.com' });

      const forB1 = store.statusesFor('b1');
      expect(forB1.map((s) => s.offset)).toEqual(['24h_before_return', '2h_before_return']);
      expect(forB1.every((s) => s.bookingId === 'b1')).toBe(true);
    });
  });
});
