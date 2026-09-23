import { describe, it, expect } from 'vitest';
import { INSURANCE_PLANS_BY_CATEGORY, insurancePlansFor } from './insurance-catalog';
import { VehicleCategory } from './vehicle';

const CATEGORIES: VehicleCategory[] = ['scooter', 'car', 'ev'];

describe('保險方案示範資料', () => {
  it('每種車輛分類都有三個級距，方案頁才有東西可選', () => {
    for (const category of CATEGORIES) {
      expect(insurancePlansFor(category)).toHaveLength(3);
    }
  });

  it('同分類內保費由低到高排列', () => {
    for (const category of CATEGORIES) {
      const prices = insurancePlansFor(category).map((p) => p.dailyPriceFrom);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }
  });

  it('方案 id 全域唯一——同一筆訂單只靠 id 還原選到的方案', () => {
    const ids = Object.values(INSURANCE_PLANS_BY_CATEGORY).flatMap((plans) => plans.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('最高級距的每一項保障都是零自負額', () => {
    for (const category of CATEGORIES) {
      const plans = insurancePlansFor(category);
      const top = plans[plans.length - 1];
      for (const item of top.coverageItems) {
        expect([item.deductibleMin, item.deductibleMax]).toEqual([0, 0]);
      }
    }
  });

  it('電動車的方案含電池損壞，汽油車沒有這一項', () => {
    const names = (category: VehicleCategory) =>
      insurancePlansFor(category).flatMap((p) => p.coverageItems.map((i) => i.name));
    expect(names('ev')).toContain('電池損壞');
    expect(names('car')).not.toContain('電池損壞');
    expect(names('scooter')).not.toContain('電池損壞');
  });

  it('自付額一律以新台幣計價', () => {
    const currencies = Object.values(INSURANCE_PLANS_BY_CATEGORY)
      .flatMap((plans) => plans.flatMap((p) => p.coverageItems.map((i) => i.currency)));
    expect(new Set(currencies)).toEqual(new Set(['TWD']));
  });
});
