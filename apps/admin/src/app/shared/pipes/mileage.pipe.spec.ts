import { describe, it, expect } from 'vitest';
import { MileagePipe } from './mileage.pipe';

describe('MileagePipe', () => {
  const pipe = new MileagePipe();

  it('加千分位', () => expect(pipe.transform(45200)).toBe('45,200'));
  it('0 → 0', () => expect(pipe.transform(0)).toBe('0'));
  it('大數字', () => expect(pipe.transform(1234567)).toBe('1,234,567'));
  it('null/undefined/非有限數顯示 —', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(NaN)).toBe('—');
  });
});
