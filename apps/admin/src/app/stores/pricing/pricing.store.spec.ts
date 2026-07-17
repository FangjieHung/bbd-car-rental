import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PricingStore } from './pricing.store';
import { PRICING_PLAN_REPO, SEASON_CALENDAR_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { PricingPlan, SeasonCalendar } from '../../core/models';

const plan: PricingPlan = {
  id: 'pp1',
  name: '機車',
  appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [],
};
const cal: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };

describe('PricingStore', () => {
  let store: PricingStore;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
        { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([cal]) },
      ],
    });
    store = TestBed.inject(PricingStore);
  });

  it('讀取既有方案', () => expect(store.plans()).toHaveLength(1));

  it('新增方案', () => {
    store.createPlan({
      name: '汽車',
      appliesToCategory: 'car',
      dayTypeRates: { weekday: 1500, weekend: 1800, holiday: 2200, peak: 2600 },
      tiers: [],
    });
    expect(store.plans()).toHaveLength(2);
  });

  it('更新行事曆旺季', () => {
    store.updateCalendar({ holidays: [], peakSeasons: [{ start: '2026-07-01', end: '2026-07-31' }] });
    expect(store.calendar().peakSeasons).toHaveLength(1);
  });
});
