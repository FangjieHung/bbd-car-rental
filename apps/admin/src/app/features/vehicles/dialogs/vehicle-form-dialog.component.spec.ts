import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Vehicle } from '@car-rental/domain';
import { VehicleFormDialogComponent, VehicleFormResult } from './vehicle-form-dialog.component';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: 'Gogoro',
    brand: 'Gogoro',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('VehicleFormDialogComponent 保險到期日', () => {
  function create(data: Vehicle) {
    const closed: VehicleFormResult[] = [];
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: (r?: VehicleFormResult) => r && closed.push(r) } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const fixture = TestBed.createComponent(VehicleFormDialogComponent);
    fixture.detectChanges();
    return { fixture, closed };
  }

  it('既有完整 ISO 時間會轉成日期輸入框可顯示的 yyyy-MM-dd，而不是空白', () => {
    const iso = new Date(2027, 0, 15, 0, 0).toISOString();
    const { fixture } = create(makeVehicle({ insuranceExpiry: iso }));
    expect(fixture.componentInstance.form.controls.insuranceExpiry.value).toBe('2027-01-15');
  });

  it('沒改動保險到期日就儲存（例如只改據點），原值原樣保留', () => {
    const iso = new Date(2027, 0, 15, 0, 0).toISOString();
    const { fixture, closed } = create(makeVehicle({ insuranceExpiry: iso }));
    fixture.componentInstance.form.controls.branchId.setValue('mzg-port');
    fixture.componentInstance.save();
    expect(closed[0].insuranceExpiry).toBe(iso);
  });

  it('改了保險到期日就寫入新日期', () => {
    const { fixture, closed } = create(makeVehicle({ insuranceExpiry: new Date(2027, 0, 15).toISOString() }));
    fixture.componentInstance.form.controls.insuranceExpiry.setValue('2027-03-01');
    fixture.componentInstance.save();
    expect(closed[0].insuranceExpiry).toBe('2027-03-01');
  });
});

describe('VehicleFormDialogComponent 所在據點', () => {
  let closedWith: VehicleFormResult[];
  let closeSpy: (result?: VehicleFormResult) => void;

  function createFixture(data: Vehicle | null = null) {
    closedWith = [];
    closeSpy = (result?: VehicleFormResult) => {
      if (result) closedWith.push(result);
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const fixture = TestBed.createComponent(VehicleFormDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('選擇據點後儲存，結果會寫入 branchId', () => {
    const fixture = createFixture(makeVehicle({ branchId: undefined }));

    fixture.componentInstance.form.controls.branchId.setValue('mzg-airport');
    fixture.componentInstance.save();

    expect(closedWith).toHaveLength(1);
    expect(closedWith[0].branchId).toBe('mzg-airport');
  });

  it('選「未指定」（空字串）儲存，結果不含 branchId（視為 undefined）', () => {
    const fixture = createFixture(makeVehicle({ branchId: 'mzg-airport' }));

    fixture.componentInstance.form.controls.branchId.setValue('');
    fixture.componentInstance.save();

    expect(closedWith).toHaveLength(1);
    expect(closedWith[0].branchId).toBeUndefined();
  });

  it('編輯既有車輛時，表單帶入原本的所在據點', () => {
    const fixture = createFixture(makeVehicle({ branchId: 'mzg-port' }));

    expect(fixture.componentInstance.form.controls.branchId.value).toBe('mzg-port');
  });

  it('新增車輛（無 data）時，所在據點預設未指定（空字串）', () => {
    const fixture = createFixture(null);

    expect(fixture.componentInstance.form.controls.branchId.value).toBe('');
  });
});
