import { describe, it, expect } from 'vitest';
import { Vehicle } from '@car-rental/domain';
import { VehicleStepComponent } from './vehicle-step.component';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: '勁戰',
    brand: 'Yamaha',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('VehicleStepComponent', () => {
  it('無定價方案（priceForVehicle 回傳 null）的車款視為 unpriced 且不可選取', () => {
    const component = new VehicleStepComponent();
    const priced = makeVehicle({ id: 'v1', category: 'scooter' });
    const unpriced = makeVehicle({ id: 'v2', category: 'ev' });
    component.priceForVehicle = (v) => (v.id === 'v1' ? 800 : null);

    expect(component['isUnpriced'](priced)).toBe(false);
    expect(component['isUnpriced'](unpriced)).toBe(true);

    let emitted: Vehicle | null = null;
    component.vehicleSelect.subscribe((v) => (emitted = v));

    component['select'](unpriced);
    expect(emitted).toBeNull();

    component['select'](priced);
    expect(emitted).toEqual(priced);
  });
});

describe('VehicleStepComponent 篩選', () => {
  function setup(vehicles: Vehicle[], priceByCategory: Record<string, number>) {
    const component = new VehicleStepComponent();
    component.priceForVehicle = (v) => priceByCategory[v.id] ?? null;
    component.vehicles = vehicles;
    return component;
  }

  it('車型 tabs 依 classLabel 分組，只顯示選中類型的車', () => {
    const sedan = makeVehicle({ id: 'v1', classLabel: '小型轎車' });
    const suv = makeVehicle({ id: 'v2', classLabel: '休旅車' });
    const component = setup([sedan, suv], { v1: 1000, v2: 2000 });

    component['onTypeChange']('小型轎車');
    expect(component['filteredVehicles']()).toEqual([sedan]);

    // 再點一次同一個 tab 取消篩選（回到全部）
    component['onTypeChange']('小型轎車');
    expect(component['filteredVehicles']()).toEqual([sedan, suv]);
  });

  it('價格區間只保留落在區間內的車；未定價的車不受價格篩選影響', () => {
    const cheap = makeVehicle({ id: 'v1' });
    const mid = makeVehicle({ id: 'v2' });
    const expensive = makeVehicle({ id: 'v3' });
    const unpriced = makeVehicle({ id: 'v4' });
    const component = setup([cheap, mid, expensive, unpriced], { v1: 500, v2: 1500, v3: 3000 });

    component['onPriceLowChange'](1000);
    component['onPriceHighChange'](2000);

    expect(component['filteredVehicles']()).toEqual([mid, unpriced]);
  });

  it('座位數分桶：沒有 seats 欄位的車在篩特定桶時不出現', () => {
    const two = makeVehicle({ id: 'v1', seats: 2 });
    const five = makeVehicle({ id: 'v2', seats: 5 });
    const seven = makeVehicle({ id: 'v3', seats: 7 });
    const unknown = makeVehicle({ id: 'v4' });
    const component = setup([two, five, seven, unknown], { v1: 1, v2: 1, v3: 1, v4: 1 });

    component['selectedSeatBucket'].set('mid');
    expect(component['filteredVehicles']()).toEqual([five]);
  });

  it('取車地點篩選只留下該據點的車', () => {
    const airport = makeVehicle({ id: 'v1', location: '機場' });
    const store = makeVehicle({ id: 'v2', location: '店舖' });
    const component = setup([airport, store], { v1: 1, v2: 1 });

    component['selectedLocation'].set('店舖');
    expect(component['filteredVehicles']()).toEqual([store]);
  });

  it('排序：價格低到高／高到低', () => {
    const a = makeVehicle({ id: 'v1' });
    const b = makeVehicle({ id: 'v2' });
    const c = makeVehicle({ id: 'v3' });
    const component = setup([a, b, c], { v1: 2000, v2: 500, v3: 1000 });

    component['sortOrder'].set('price-asc');
    expect(component['filteredVehicles']()).toEqual([b, c, a]);

    component['sortOrder'].set('price-desc');
    expect(component['filteredVehicles']()).toEqual([a, c, b]);
  });

  it('切換 vehicles（重新查詢）時，先前設定的篩選條件會重置', () => {
    const sedan = makeVehicle({ id: 'v1', classLabel: '小型轎車' });
    const component = setup([sedan], { v1: 1000 });
    component['onTypeChange']('小型轎車');
    expect(component['selectedType']()).toBe('小型轎車');

    component.vehicles = [makeVehicle({ id: 'v2', classLabel: '休旅車' })];

    expect(component['selectedType']()).toBeNull();
  });
});
