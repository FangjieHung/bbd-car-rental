import { seedPricingPlans, seedVehicles } from './seed-data';

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
});
