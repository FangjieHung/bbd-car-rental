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
