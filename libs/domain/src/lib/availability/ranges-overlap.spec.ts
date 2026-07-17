import { describe, it, expect } from 'vitest';
import { rangesOverlap } from './ranges-overlap';
describe('rangesOverlap', () => {
  it('重疊 → true', () =>
    expect(rangesOverlap('2026-01-05T09:00:00', '2026-01-08T09:00:00', '2026-01-07T09:00:00', '2026-01-10T09:00:00')).toBe(true));
  it('完全分離 → false', () =>
    expect(rangesOverlap('2026-01-05T09:00:00', '2026-01-06T09:00:00', '2026-01-07T09:00:00', '2026-01-08T09:00:00')).toBe(false));
  it('無縫接續（前 end === 後 start）→ false', () =>
    expect(rangesOverlap('2026-01-05T09:00:00', '2026-01-07T09:00:00', '2026-01-07T09:00:00', '2026-01-09T09:00:00')).toBe(false));
});
