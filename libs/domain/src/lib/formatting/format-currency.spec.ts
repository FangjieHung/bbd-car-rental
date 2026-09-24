import { describe, it, expect } from 'vitest';
import { formatTwd } from './format-currency';

describe('formatTwd', () => {
  it('0 → NT$0', () => expect(formatTwd(0)).toBe('NT$0'));

  it('負數用全形減號（U+2212），不是連字號', () => {
    expect(formatTwd(-700)).toBe('−NT$700');
    expect(formatTwd(-700)).not.toContain('-NT$'); // 連字號版本不應出現
  });

  it('大數字加千分位', () => expect(formatTwd(1234567)).toBe('NT$1,234,567'));

  it('小數四捨五入到整數', () => {
    expect(formatTwd(10545.4)).toBe('NT$10,545');
    expect(formatTwd(10545.6)).toBe('NT$10,546');
    expect(formatTwd(10545.5)).toBe('NT$10,546');
  });

  it('負數小數也先四捨五入再取絕對值顯示', () => {
    expect(formatTwd(-0.4)).toBe('NT$0'); // 四捨五入到 -0，不顯示成「−NT$0」
    expect(formatTwd(-2.6)).toBe('−NT$3');
  });

  it('非有限數（NaN、Infinity）回傳 —', () => {
    expect(formatTwd(NaN)).toBe('—');
    expect(formatTwd(Infinity)).toBe('—');
    expect(formatTwd(-Infinity)).toBe('—');
  });
});
