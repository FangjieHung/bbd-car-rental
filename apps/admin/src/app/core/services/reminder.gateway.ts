import { ReminderOffset, ReminderState } from '@car-rental/domain';

export interface ScheduleReminderInput {
  bookingId: string;
  offset: ReminderOffset;
  scheduledFor: string;
  email?: string;
}

/**
 * 排程呼叫可能得到的狀態，刻意排除 'sent'／'failed' ——
 * 這兩個狀態代表「真的寄出去了」或「後端真的嘗試寄送但失敗」，只有真正接了寄信服務、
 * 或收到後端回報後才能回報，前端的排程呼叫本身回答不了「有沒有真的寄出去」。
 */
export type ReminderScheduleState = Extract<ReminderState, 'scheduled' | 'missing_email'>;

export interface ReminderDispatchResult {
  state: ReminderScheduleState;
}

/**
 * 還車提醒排程介面。實際排程、寄送與重試邏輯由後端負責（見 ReminderStatus 的模型註解），
 * 前端這個 adapter 只負責「告知後端要排程」與「取消排程」。
 */
export abstract class ReminderGateway {
  abstract schedule(input: ScheduleReminderInput): Promise<ReminderDispatchResult>;
  abstract cancel(bookingId: string, offset: ReminderOffset): Promise<void>;
}
