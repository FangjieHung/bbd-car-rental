import { describe, it, expect } from 'vitest';
import { TwdPipe } from './twd.pipe';

describe('TwdPipe', () => {
  const pipe = new TwdPipe();

  it('格式化為 NT$ 千分位', () => expect(pipe.transform(10545)).toBe('NT$10,545'));
  it('0 → NT$0', () => expect(pipe.transform(0)).toBe('NT$0'));
  it('負數用全形減號', () => expect(pipe.transform(-700)).toBe('−NT$700'));
  it('null/undefined 顯示 —', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});
