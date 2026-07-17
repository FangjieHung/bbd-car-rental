import { seedPricingPlans, seedVehicles, seedPartners, seedBookings } from './seed-data';

describe('seed-data', () => {
  it('每一台 seed 車輛的 category 都有對應的 seed 定價方案', () => {
    const vehicles = seedVehicles();
    const plans = seedPricingPlans();
    const planCategories = new Set(plans.map((p) => p.appliesToCategory));

    for (const vehicle of vehicles) {
      expect(planCategories.has(vehicle.category)).toBe(true);
    }
  });

  it('ev 車輛（如 Gogoro）有可用的定價方案', () => {
    const plans = seedPricingPlans();
    const evPlan = plans.find((p) => p.appliesToCategory === 'ev');
    expect(evPlan).toBeDefined();
    expect(evPlan?.dayTypeRates.weekday).toBeGreaterThan(0);
  });

  it('每個帶 sourcePartnerId 的 seed 訂單，其 partner 存在於 seedPartners', () => {
    const ids = new Set(seedPartners().map((p) => p.id));
    for (const b of seedBookings()) if (b.sourcePartnerId) expect(ids.has(b.sourcePartnerId)).toBe(true);
  });

  it('seedPartners slug 唯一', () => {
    const slugs = seedPartners().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
