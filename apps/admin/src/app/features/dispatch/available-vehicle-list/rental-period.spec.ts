import { describe, expect, it } from 'vitest';
import {
  RENTAL_TIME_SLOTS,
  calendarDaysBetween,
  composeLocal,
  dateFromKey,
  dateKeyOf,
  rentalPeriodOf,
  timeOf,
  timeSlotsWith,
  toDateKey,
} from './rental-period';

describe('rental-period 租期字串工具', () => {
  it('可選時段：06:00–22:00，每 30 分鐘一格', () => {
    expect(RENTAL_TIME_SLOTS[0]).toBe('06:00');
    expect(RENTAL_TIME_SLOTS.at(-1)).toBe('22:00');
    expect(RENTAL_TIME_SLOTS).toHaveLength(33);
    expect(RENTAL_TIME_SLOTS).toContain('09:00');
    expect(RENTAL_TIME_SLOTS).toContain('09:30');
  });

  it('目前的值不在時段上時一併列出並依時間排序', () => {
    const slots = timeSlotsWith('10:15');
    expect(slots.slice(slots.indexOf('10:00'), slots.indexOf('10:00') + 3)).toEqual(['10:00', '10:15', '10:30']);
    expect(timeSlotsWith('09:00')).toEqual([...RENTAL_TIME_SLOTS]);
  });

  it('拆開與組回 datetime-local 字串', () => {
    expect(dateKeyOf('2026-10-05T09:30')).toBe('2026-10-05');
    expect(timeOf('2026-10-05T09:30')).toBe('09:30');
    expect(dateKeyOf('')).toBe('');
    expect(timeOf('not-a-date')).toBe('');
    expect(composeLocal('2026-10-05', '18:00')).toBe('2026-10-05T18:00');
    expect(toDateKey(new Date(2026, 0, 3))).toBe('2026-01-03');
    expect(dateFromKey('2026-01-03')).toEqual(new Date(2026, 0, 3));
    expect(dateFromKey('')).toBeNull();
  });

  it('期間：任一未填或還車不晚於取車時為 undefined', () => {
    expect(rentalPeriodOf('', '2026-10-06T09:00')).toBeUndefined();
    expect(rentalPeriodOf('2026-10-06T09:00', '2026-10-06T09:00')).toBeUndefined();
    expect(rentalPeriodOf('2026-10-06T09:00', '2026-10-05T09:00')).toBeUndefined();
    expect(rentalPeriodOf('2026-10-05T09:00', '2026-10-06T08:00')).toEqual({
      start: new Date('2026-10-05T09:00'),
      end: new Date('2026-10-06T08:00'),
    });
  });

  it('天數只看日期（與定價引擎的晚數一致）', () => {
    expect(calendarDaysBetween(new Date('2026-10-05T09:00'), new Date('2026-10-07T09:00'))).toBe(2);
    expect(calendarDaysBetween(new Date('2026-10-05T22:00'), new Date('2026-10-06T06:00'))).toBe(1);
    expect(calendarDaysBetween(new Date('2026-10-05T09:00'), new Date('2026-10-05T18:00'))).toBe(0);
  });
});
