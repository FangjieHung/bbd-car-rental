import { describe, it, expect } from 'vitest';
import { DateStepComponent } from './date-step.component';

describe('DateStepComponent 還車地點預帶', () => {
  it('選了取車地點後，還車地點自動帶同一個，且之後仍跟著連動', () => {
    const component = new DateStepComponent();

    component['onPickupLocationChange']('機場');
    expect(component['returnLocation']).toBe('機場');

    // 使用者沒動過還車地點 → 改取車地點時繼續同步
    component['onPickupLocationChange']('港口');
    expect(component['returnLocation']).toBe('港口');
  });

  it('使用者自己改過還車地點後，再改取車地點不會覆蓋掉', () => {
    const component = new DateStepComponent();

    component['onPickupLocationChange']('機場');
    component['onReturnLocationChange']('港口');
    expect(component['returnLocation']).toBe('港口');

    component['onPickupLocationChange']('店舖');
    expect(component['pickupLocation']).toBe('店舖');
    expect(component['returnLocation']).toBe('港口');
  });

  it('從上一步帶回兩地不同的資料，視為使用者指定過，不再被覆蓋', () => {
    const component = new DateStepComponent();
    component.dateRange = {
      startDateTime: '2026-08-20T10:00',
      endDateTime: '2026-08-22T10:00',
      pickupLocation: '機場',
      returnLocation: '港口',
    };
    component.ngOnChanges();

    component['onPickupLocationChange']('店舖');
    expect(component['returnLocation']).toBe('港口');
  });

  it('從上一步帶回兩地相同的資料，仍維持連動', () => {
    const component = new DateStepComponent();
    component.dateRange = {
      startDateTime: '2026-08-20T10:00',
      endDateTime: '2026-08-22T10:00',
      pickupLocation: '機場',
      returnLocation: '機場',
    };
    component.ngOnChanges();

    component['onPickupLocationChange']('店舖');
    expect(component['returnLocation']).toBe('店舖');
  });
});
