import { describe, it, expect } from 'vitest';
import { classifyDay } from './date-classify';
import { SeasonCalendar } from '../models';

const cal: SeasonCalendar = {
  id: 'default',
  holidays: [{ start: '2026-02-16', end: '2026-02-18' }],
  peakSeasons: [{ start: '2026-04-18', end: '2026-06-30' }],
};

describe('classifyDay', () => {
  it('平日（週三）→ weekday', () => expect(classifyDay('2026-01-07', cal)).toBe('weekday'));
  it('週六 → weekend', () => expect(classifyDay('2026-01-10', cal)).toBe('weekend'));
  it('連假日期 → holiday', () => expect(classifyDay('2026-02-17', cal)).toBe('holiday'));
  it('旺季日期 → peak（優先於週末）', () =>
    expect(classifyDay('2026-04-18', cal)).toBe('peak')); // 2026-04-18 為週六，peak 覆蓋
});
