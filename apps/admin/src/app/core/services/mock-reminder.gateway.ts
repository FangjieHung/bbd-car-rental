import { Injectable } from '@angular/core';
import { ReminderOffset } from '@car-rental/domain';
import {
  ReminderDispatchResult,
  ReminderGateway,
  ScheduleReminderInput,
} from './reminder.gateway';

function microtaskBoundary(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function key(bookingId: string, offset: ReminderOffset): string {
  return `${bookingId}:${offset}`;
}

/**
 * 開發期 Mock 還車提醒服務：只記錄「已排程」這個狀態本身，不寄送任何 Email，
 * 也絕不會回報 'sent' —— 沒有接上真正的寄信服務時，系統不能宣稱信真的寄出去了。
 * 缺少 Email 時直接回報 missing_email，不建立排程。
 */
@Injectable()
export class MockReminderGateway implements ReminderGateway {
  private readonly scheduled = new Map<string, ScheduleReminderInput>();

  async schedule(input: ScheduleReminderInput): Promise<ReminderDispatchResult> {
    await microtaskBoundary();
    if (!input.email || input.email.trim() === '') {
      return { state: 'missing_email' };
    }
    this.scheduled.set(key(input.bookingId, input.offset), input);
    return { state: 'scheduled' };
  }

  async cancel(bookingId: string, offset: ReminderOffset): Promise<void> {
    await microtaskBoundary();
    this.scheduled.delete(key(bookingId, offset));
  }

  /** 測試／展示情境查詢目前記錄了哪些排程，僅供驗證用，不代表任何真實寄送狀態。 */
  scheduledFor(bookingId: string, offset: ReminderOffset): ScheduleReminderInput | undefined {
    return this.scheduled.get(key(bookingId, offset));
  }
}
