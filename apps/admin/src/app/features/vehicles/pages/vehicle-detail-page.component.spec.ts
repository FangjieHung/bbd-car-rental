import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { VehicleDetailPageComponent } from './vehicle-detail-page.component';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { HeaderTitleSlot } from '../../../layout/header/header-title';
import {
  MaintenanceRecordDialogComponent,
  RecordFormResult,
} from '../../maintenance/dialogs/maintenance-record-dialog.component';

function makeVehicle(partial: Partial<Vehicle>): Vehicle {
  return {
    id: partial.id ?? 'v1',
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

function makeRecord(partial: Partial<MaintenanceRecord>): MaintenanceRecord {
  return {
    id: partial.id ?? 'r1',
    vehicleId: partial.vehicleId ?? 'v1',
    type: 'oil_change',
    performedAt: new Date().toISOString(),
    mileageAtService: 100,
    cost: 200,
    notes: '',
    ...partial,
  };
}

describe('VehicleDetailPageComponent', () => {
  let dialogOpen: ReturnType<typeof vi.fn>;

  function createComponent(
    routeId: string,
    vehicles: Vehicle[],
    records: MaintenanceRecord[] = [],
  ) {
    dialogOpen = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: { open: dialogOpen } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: routeId }) },
            paramMap: of(convertToParamMap({ id: routeId })),
          },
        },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>(records) },
      ],
    });
    return TestBed.createComponent(VehicleDetailPageComponent).componentInstance;
  }

  function createFixture(routeId: string, vehicles: Vehicle[], records: MaintenanceRecord[] = []) {
    dialogOpen = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: { open: dialogOpen } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: routeId }) },
            paramMap: of(convertToParamMap({ id: routeId })),
          },
        },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>(records) },
      ],
    });
    return TestBed.createComponent(VehicleDetailPageComponent);
  }

  it('2.1／4.5：頁首標題（HeaderTitleSlot）是車牌，麵包屑是車輛與配件 › 車輛清單；頁面自己不再渲染 h1', () => {
    const fixture = createFixture('v1', [
      makeVehicle({ id: 'v1', model: 'Gogoro 2', plateNumber: 'AAA-111' }),
    ]);
    fixture.detectChanges();

    const slot = TestBed.inject(HeaderTitleSlot);
    expect(slot.entry()?.value).toEqual({
      title: 'AAA-111',
      breadcrumbs: [{ label: ZH_TW.nav.productGroup }, { label: ZH_TW.nav.vehicles, route: '/vehicles' }],
    });
    // 4.5：群組改名後，麵包屑的字面也跟著變（群組沒有自己的頁面，不可點；車輛清單可點回列表）。
    expect(slot.entry()?.value.breadcrumbs).toEqual([
      { label: '車輛與配件' },
      { label: '車輛清單', route: '/vehicles' },
    ]);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('h1')).toHaveLength(0);
  });

  it('找不到車輛時標題退回 em dash', () => {
    const fixture = createFixture('nope', [makeVehicle({ id: 'v1', plateNumber: 'AAA-111' })]);
    fixture.detectChanges();

    expect(TestBed.inject(HeaderTitleSlot).entry()?.value.title).toBe('—');
  });

  it('依路由參數 id 解析出對應的車輛', () => {
    const component = createComponent('v2', [
      makeVehicle({ id: 'v1', plateNumber: 'AAA-111' }),
      makeVehicle({ id: 'v2', plateNumber: 'BBB-222' }),
    ]);

    expect(component.vehicleId()).toBe('v2');
    expect(component.vehicle()?.plateNumber).toBe('BBB-222');
  });

  it('只顯示該車輛的保養紀錄，其他車輛的紀錄不列入', () => {
    const component = createComponent(
      'v1',
      [makeVehicle({ id: 'v1' }), makeVehicle({ id: 'v2' })],
      [makeRecord({ id: 'r1', vehicleId: 'v1' }), makeRecord({ id: 'r2', vehicleId: 'v2' })],
    );

    expect(component.records().map((r) => r.id)).toEqual(['r1']);
  });

  it('欄位定義不含車輛欄（同頁已鎖定單一車輛，無需重複顯示）', () => {
    const component = createComponent('v1', [makeVehicle({ id: 'v1' })]);

    expect(component.columns.some((c) => c.key === 'vehicleId')).toBe(false);
  });

  it('addRecord 開啟保養紀錄對話框並預帶目前車輛 id，儲存後呼叫 store 新增紀錄', async () => {
    const component = createComponent('v1', [makeVehicle({ id: 'v1' })]);
    const result: RecordFormResult = {
      vehicleId: 'v1',
      type: 'tire',
      performedAt: new Date().toISOString(),
      mileageAtService: 300,
      cost: 500,
      notes: '',
    };
    dialogOpen.mockReturnValue({ afterClosed: () => of(result) });

    await component.addRecord();

    expect(dialogOpen).toHaveBeenCalledWith(
      MaintenanceRecordDialogComponent,
      expect.objectContaining({ data: 'v1' }),
    );
    expect(component.maintenanceStore.records()).toHaveLength(1);
    expect(component.records()).toHaveLength(1);
  });

  it('addRecord 取消對話框時不新增紀錄', async () => {
    const component = createComponent('v1', [makeVehicle({ id: 'v1' })]);
    dialogOpen.mockReturnValue({ afterClosed: () => of(undefined) });

    await component.addRecord();

    expect(component.maintenanceStore.records()).toHaveLength(0);
  });
});
