import { describe, it, expect } from 'vitest';
import { DateStepComponent } from './date-step.component';

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
    };
    component.ngOnChanges();

    expect(component['vehicleGroup']).toBe('car');
  });
});

describe('DateStepComponent 確認租期按鈕的啟用條件', () => {
  it('未選日期前仍不可搜尋', () => {
    const component = new DateStepComponent();
    expect(component['isValid']).toBe(false);
  });

  it('只選了日期範圍就可以搜尋', () => {
    const component = new DateStepComponent();
    component['onRangeSelected']({
      start: new Date(2026, 7, 20),
      end: new Date(2026, 7, 22),
    });

    expect(component['isValid']).toBe(true);
  });

  it('選好日期後 confirm 會帶著預設時間送出', () => {
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
        vehicleGroup: 'car',
      }),
    ]);
  });
});
