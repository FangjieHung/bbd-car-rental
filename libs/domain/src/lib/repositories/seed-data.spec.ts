import { seedPricingPlans, seedVehicles, seedPartners, seedOrders, seedPrepTasks } from './seed-data';
import { isPrepTaskOpen, prepQueue } from '../prep';

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
    for (const b of seedOrders()) if (b.sourcePartnerId) expect(ids.has(b.sourcePartnerId)).toBe(true);
  });

  it('seedPartners slug 唯一', () => {
    const slugs = seedPartners().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('4.3：示範的待整備掛在最近一筆已完成的還車上，車輛與還車據點一致；該車還有下一次取車', () => {
    const orders = seedOrders();
    const tasks = seedPrepTasks();
    const latestCompleted = orders
      .filter((b) => b.status === 'completed')
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0];

    expect(tasks).toHaveLength(1);
    const [task] = tasks;
    expect(isPrepTaskOpen(task)).toBe(true);
    expect(task.bookingId).toBe(latestCompleted.id);
    expect(task.vehicleId).toBe(latestCompleted.vehicleId);
    expect(task.returnBranchId).toBe(latestCompleted.returnBranchId);
    expect(task.returnedAt).toBe(latestCompleted.endTime);
    expect(seedVehicles().some((v) => v.id === task.vehicleId)).toBe(true);
    // 清單示範時「下一次取車」欄不是空的。
    expect(prepQueue(tasks, orders)[0].nextPickup).toBeDefined();
  });
});
