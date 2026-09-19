import { describe, it, expect } from 'vitest';
import { defaultDepositForCategory } from './deposit-cap';

describe('defaultDepositForCategory', () => {
  it('小客車為報價總額的 30%，四捨五入至整數', () => {
    expect(defaultDepositForCategory('car', 3000)).toBe(900);
    expect(defaultDepositForCategory('car', 1001)).toBe(300); // 300.3 -> 300
  });

  it('機車／電動機車一律 0，即使報價非零', () => {
    expect(defaultDepositForCategory('scooter', 3000)).toBe(0);
    expect(defaultDepositForCategory('ev', 3000)).toBe(0);
  });

  it('查無車型（undefined）保守預設 0', () => {
    expect(defaultDepositForCategory(undefined, 3000)).toBe(0);
  });

  it('小客車但報價總額為 0 時仍是 0', () => {
    expect(defaultDepositForCategory('car', 0)).toBe(0);
  });
});
