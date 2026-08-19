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

describe('DateStepComponent 車輛類型（機車/汽車）', () => {
  it('預設為汽車', () => {
    const component = new DateStepComponent();
    expect(component['vehicleGroup']).toBe('car');
  });

  it('切換後更新 vehicleGroup', () => {
    const component = new DateStepComponent();
    component['onVehicleGroupChange']('scooter');
    expect(component['vehicleGroup']).toBe('scooter');
  });

  it('從上一步帶回 vehicleGroup 時據以還原', () => {
    const component = new DateStepComponent();
    component.dateRange = {
      startDateTime: '2026-08-20T10:00',
      endDateTime: '2026-08-22T10:00',
      pickupLocation: '機場',
      returnLocation: '機場',
      vehicleGroup: 'scooter',
    };
    component.ngOnChanges();

    expect(component['vehicleGroup']).toBe('scooter');
  });

  it('上一步沒帶 vehicleGroup（舊資料）時，還原成預設汽車', () => {
    const component = new DateStepComponent();
    component['vehicleGroup'] = 'scooter';
    component.dateRange = {
      startDateTime: '2026-08-20T10:00',
      endDateTime: '2026-08-22T10:00',
      pickupLocation: '機場',
      returnLocation: '機場',
    };
    component.ngOnChanges();

    expect(component['vehicleGroup']).toBe('car');
  });
});

describe('DateStepComponent 確認租期按鈕的啟用條件', () => {
  it('取車/還車地點與時間預設帶好，未選日期前仍不可搜尋', () => {
    const component = new DateStepComponent();
    expect(component['pickupLocation']).toBe('機場');
    expect(component['returnLocation']).toBe('機場');
    expect(component['isValid']).toBe(false);
  });

  it('只選了日期範圍（沒動時間/地點欄位）就可以搜尋', () => {
    const component = new DateStepComponent();
    component['onRangeSelected']({
      start: new Date(2026, 7, 20),
      end: new Date(2026, 7, 22),
    });

    expect(component['isValid']).toBe(true);
  });

  it('選好日期後 confirm 會帶著預設地點與時間送出', () => {
    const component = new DateStepComponent();
    const emitted: unknown[] = [];
    component.dateRangeChange.subscribe((range) => emitted.push(range));

    component['onRangeSelected']({
      start: new Date(2026, 7, 20),
      end: new Date(2026, 7, 22),
    });
    component['confirm']();

    expect(emitted).toEqual([
      expect.objectContaining({
        pickupLocation: '機場',
        returnLocation: '機場',
        vehicleGroup: 'car',
      }),
    ]);
  });
});
