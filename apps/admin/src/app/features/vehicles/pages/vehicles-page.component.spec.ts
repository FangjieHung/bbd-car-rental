import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { VehiclesPageComponent } from './vehicles-page.component';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord } from '../../../core/models';
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

describe('VehiclesPageComponent filtering', () => {
  let component: VehiclesPageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: VEHICLE_REPO,
          useValue: createInMemoryRepo<Vehicle>([
            makeVehicle({
              id: 'v1',
              plateNumber: 'ABC-123',
              model: 'Gogoro',
              category: 'scooter',
              status: 'available',
            }),
            makeVehicle({
              id: 'v2',
              plateNumber: 'XYZ-999',
              model: 'Toyota Altis',
              category: 'car',
              status: 'rented',
            }),
            makeVehicle({
              id: 'v3',
              plateNumber: 'DEF-456',
              model: 'Gogoro 2',
              category: 'scooter',
              status: 'maintenance',
            }),
          ]),
        },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    component = TestBed.createComponent(VehiclesPageComponent).componentInstance;
  });

  it('沒有任何篩選時顯示全部', () => {
    expect(component.filteredVehicles()).toHaveLength(3);
  });

  it('依車牌或車型關鍵字搜尋（不分大小寫）', () => {
    component.searchQuery.set('gogoro');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v1', 'v3']);

    component.searchQuery.set('xyz');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v2']);
  });

  it('依車種篩選', () => {
    component.typeFilter.set('car');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v2']);
  });

  it('依狀態篩選', () => {
    component.statusFilter.set('maintenance');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v3']);
  });

  it('搜尋與篩選可同時套用', () => {
    component.searchQuery.set('gogoro');
    component.statusFilter.set('maintenance');
    expect(component.filteredVehicles().map((v) => v.id)).toEqual(['v3']);
  });

  it('activeFilterCount 反映已套用的篩選數量', () => {
    expect(component.activeFilterCount()).toBe(0);
    component.typeFilter.set('scooter');
    expect(component.activeFilterCount()).toBe(1);
    component.statusFilter.set('available');
    expect(component.activeFilterCount()).toBe(2);
  });

  it('clearFilters 只清除篩選，不清除搜尋文字', () => {
    component.searchQuery.set('gogoro');
    component.typeFilter.set('scooter');
    component.statusFilter.set('available');
    component.clearFilters();
    expect(component.typeFilter()).toBeNull();
    expect(component.statusFilter()).toBeNull();
    expect(component.searchQuery()).toBe('gogoro');
  });

  it('vehicles 頁面提供批次選取狀態，預設沒有已選車輛', () => {
    expect(component.selectedVehicles()).toEqual([]);
  });

  it('viewMode 預設為 table，可切換為 timeline', () => {
    expect(component.viewMode()).toBe('table');
    component.viewMode.set('timeline');
    expect(component.viewMode()).toBe('timeline');
  });
});

describe('VehiclesPageComponent 保養整合（送修／完修／查看紀錄）', () => {
  let dialogOpen: ReturnType<typeof vi.fn>;

  function createComponent(vehicles: Vehicle[], records: MaintenanceRecord[] = []) {
    dialogOpen = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>(records) },
      ],
    });
    return TestBed.createComponent(VehiclesPageComponent).componentInstance;
  }

  it('狀態為 available 的車輛呼叫 send 會直接送修，不開啟對話框', () => {
    const component = createComponent([makeVehicle({ id: 'v1', status: 'available' })]);

    component.send(component.store.vehicles()[0]);

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(component.store.vehicles().find((v) => v.id === 'v1')?.status).toBe('maintenance');
  });

  it('completeFix 開啟保養紀錄對話框並預帶 vehicleId，儲存後車輛狀態改回可租借並新增紀錄', async () => {
    const component = createComponent([makeVehicle({ id: 'v1', status: 'maintenance' })]);
    const result: RecordFormResult = {
      vehicleId: 'v1',
      type: 'oil_change',
      performedAt: new Date().toISOString(),
      mileageAtService: 500,
      cost: 300,
      notes: '',
    };
    dialogOpen.mockReturnValue({ afterClosed: () => of(result) });

    await component.completeFix(component.store.vehicles()[0]);

    expect(dialogOpen).toHaveBeenCalledWith(
      MaintenanceRecordDialogComponent,
      expect.objectContaining({ data: 'v1' }),
    );
    expect(component.store.vehicles().find((v) => v.id === 'v1')?.status).toBe('available');
    expect(component.maintenanceStore.records()).toHaveLength(1);
  });

  it('completeFix 取消對話框時不呼叫 completeMaintenance', async () => {
    const component = createComponent([makeVehicle({ id: 'v1', status: 'maintenance' })]);
    dialogOpen.mockReturnValue({ afterClosed: () => of(undefined) });

    await component.completeFix(component.store.vehicles()[0]);

    expect(component.store.vehicles().find((v) => v.id === 'v1')?.status).toBe('maintenance');
    expect(component.maintenanceStore.records()).toHaveLength(0);
  });

  it('vehicleDetailLink 產生對應車輛詳細頁的路由陣列，供整列點擊導航使用', () => {
    const component = createComponent([makeVehicle({ id: 'v3' })]);

    expect(component.vehicleDetailLink('v3')).toEqual(['/vehicles', 'v3']);
  });
});

describe('VehiclesPageComponent 整列點擊導航', () => {
  function createComponent(vehicles: Vehicle[], dialogOpen: ReturnType<typeof vi.fn>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const fixture = TestBed.createComponent(VehiclesPageComponent);
    return fixture;
  }

  it('點擊資料列（非按鈕/checkbox 區域）會導向該車輛的詳細頁', async () => {
    const dialogOpen = vi.fn();
    const fixture = createComponent(
      [makeVehicle({ id: 'v1', plateNumber: 'AAA-111' }), makeVehicle({ id: 'v2', plateNumber: 'BBB-222' })],
      dialogOpen,
    );
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    (rows[1] as HTMLElement).click();

    expect(navigateSpy).toHaveBeenCalledWith(['/vehicles', 'v2']);
  });

  it('點擊編輯／刪除／送修／完修按鈕都不會觸發列點擊導航', async () => {
    const dialogOpen = vi.fn().mockReturnValue({ afterClosed: () => of(undefined) });
    const fixture = createComponent(
      [makeVehicle({ id: 'v1', status: 'available' }), makeVehicle({ id: 'v2', status: 'maintenance' })],
      dialogOpen,
    );
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const el = fixture.nativeElement as HTMLElement;
    const buttons = [...el.querySelectorAll('.action-cell button')] as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => btn.click());

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('操作欄不再顯示查看保養紀錄連結（整列點擊已取代其功能）', async () => {
    const dialogOpen = vi.fn();
    const fixture = createComponent([makeVehicle({ id: 'v1' })], dialogOpen);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('查看保養紀錄');
  });
});

function makeMaintenanceRecord(partial: Partial<MaintenanceRecord>): MaintenanceRecord {
  return {
    id: partial.id ?? 'r1',
    vehicleId: partial.vehicleId ?? 'v1',
    type: 'oil_change',
    performedAt: new Date().toISOString(),
    mileageAtService: 0,
    cost: 0,
    notes: '',
    ...partial,
  };
}

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

describe('VehiclesPageComponent 保養提醒釘選與徽章', () => {
  function createComponent(vehicles: Vehicle[], records: MaintenanceRecord[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>(records) },
      ],
    });
    return TestBed.createComponent(VehiclesPageComponent);
  }

  it('displayVehicles 排序：逾期車輛在前，即將到期次之，無提醒的殿後', () => {
    const vehicles = [
      makeVehicle({ id: 'none', mileage: 100 }),
      makeVehicle({ id: 'overdue', mileage: 1000 }),
      makeVehicle({ id: 'upcoming', mileage: 800 }),
    ];
    const records = [
      makeMaintenanceRecord({ id: 'r-none', vehicleId: 'none', nextDueMileage: 900 }),
      makeMaintenanceRecord({ id: 'r-overdue', vehicleId: 'overdue', nextDueMileage: 900 }),
      makeMaintenanceRecord({ id: 'r-upcoming', vehicleId: 'upcoming', nextDueMileage: 900 }),
    ];
    const fixture = createComponent(vehicles, records);

    expect(fixture.componentInstance.displayVehicles().map((v) => v.id)).toEqual([
      'overdue',
      'upcoming',
      'none',
    ]);
  });

  it('逾期車輛的資料列套用 dt-row--danger class 並顯示逾期徽章', async () => {
    const vehicles = [makeVehicle({ id: 'v1', mileage: 1000 })];
    const records = [makeMaintenanceRecord({ vehicleId: 'v1', nextDueMileage: 900 })];
    const fixture = createComponent(vehicles, records);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const row = el.querySelector('tbody tr');
    expect(row?.classList.contains('dt-row--danger')).toBe(true);
    expect(el.querySelector('.mtn-badge--danger')).toBeTruthy();
  });

  it('同時有逾期（里程）與即將到期（日期）提醒的車輛，兩個徽章會同時疊加顯示', async () => {
    const vehicles = [makeVehicle({ id: 'v1', mileage: 1000 })];
    const records = [
      makeMaintenanceRecord({
        vehicleId: 'v1',
        nextDueMileage: 900, // 里程 1000 >= 900 → 逾期
        nextDueDate: daysFromNow(3), // 7 天警示窗內、尚未到期 → 即將到期
      }),
    ];
    const fixture = createComponent(vehicles, records);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.mtn-badge--danger')).toBeTruthy();
    expect(el.querySelector('.mtn-badge--warning')).toBeTruthy();
  });
});
