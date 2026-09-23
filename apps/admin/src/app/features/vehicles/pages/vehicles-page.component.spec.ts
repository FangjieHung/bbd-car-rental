import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { LOCATION_FILTER_UNSET, VehiclesPageComponent } from './vehicles-page.component';
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

/**
 * 1.4：總覽「待保養 N」帶 ?maintenance=due 進來，車輛清單只顯示有保養警示（逾期或即將
 * 到期）的車，並顯示可移除的篩選標籤「只看待保養」。
 */
describe('VehiclesPageComponent 待保養篩選（?maintenance=due）', () => {
  function createComponent(vehicles: Vehicle[], records: MaintenanceRecord[], maintenanceParam: string | null) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(maintenanceParam ? { maintenance: maintenanceParam } : {}),
            },
          },
        },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>(records) },
      ],
    });
    return TestBed.createComponent(VehiclesPageComponent);
  }

  it('網址帶 ?maintenance=due 時，只顯示有保養警示（逾期或即將到期）的車', () => {
    const vehicles = [
      makeVehicle({ id: 'none', mileage: 100 }),
      makeVehicle({ id: 'overdue', mileage: 1000 }),
      makeVehicle({ id: 'upcoming', mileage: 800 }),
    ];
    const records = [
      makeMaintenanceRecord({ id: 'r-overdue', vehicleId: 'overdue', nextDueMileage: 900 }),
      makeMaintenanceRecord({ id: 'r-upcoming', vehicleId: 'upcoming', nextDueMileage: 900 }),
    ];
    const fixture = createComponent(vehicles, records, 'due');

    expect(fixture.componentInstance.maintenanceOnlyFilter()).toBe(true);
    expect(fixture.componentInstance.filteredVehicles().map((v) => v.id).sort()).toEqual([
      'overdue',
      'upcoming',
    ]);
  });

  it('沒有帶參數時不套用這個篩選，顯示全部車輛', () => {
    const vehicles = [makeVehicle({ id: 'none' }), makeVehicle({ id: 'overdue', mileage: 1000 })];
    const records = [makeMaintenanceRecord({ vehicleId: 'overdue', nextDueMileage: 900 })];
    const fixture = createComponent(vehicles, records, null);

    expect(fixture.componentInstance.maintenanceOnlyFilter()).toBe(false);
    expect(fixture.componentInstance.filteredVehicles()).toHaveLength(2);
  });

  // 畫面上的「只看待保養」標籤（.maintenance-only-filter-chip，樣板 vehicles-page.component.html）
  // 是透過 HeaderToolbarSlot 登記到 HeaderComponent 渲染（見 header-toolbar-slot.ts），
  // 不在這個頁面元件自己的 fixture DOM 裡，所以這裡驗證 clearMaintenanceOnlyFilter() 本身
  // 的行為——按鈕點擊只是呼叫它，樣板已用 @if (maintenanceOnlyFilter()) 控制顯示。
  it('clearMaintenanceOnlyFilter 清除篩選狀態，車輛清單恢復顯示全部', () => {
    const vehicles = [makeVehicle({ id: 'none' }), makeVehicle({ id: 'overdue', mileage: 1000 })];
    const records = [makeMaintenanceRecord({ vehicleId: 'overdue', nextDueMileage: 900 })];
    const fixture = createComponent(vehicles, records, 'due');
    const component = fixture.componentInstance;
    expect(component.maintenanceOnlyFilter()).toBe(true);
    expect(component.filteredVehicles()).toHaveLength(1);

    component.clearMaintenanceOnlyFilter();

    expect(component.maintenanceOnlyFilter()).toBe(false);
    expect(component.filteredVehicles()).toHaveLength(2);
  });

  it('保養警示以外的一般篩選（車種／狀態／搜尋）可以跟待保養篩選同時套用', () => {
    const vehicles = [
      makeVehicle({ id: 'overdue-car', category: 'car', mileage: 1000 }),
      makeVehicle({ id: 'overdue-scooter', category: 'scooter', mileage: 1000 }),
    ];
    const records = [
      makeMaintenanceRecord({ id: 'r1', vehicleId: 'overdue-car', nextDueMileage: 900 }),
      makeMaintenanceRecord({ id: 'r2', vehicleId: 'overdue-scooter', nextDueMileage: 900 }),
    ];
    const fixture = createComponent(vehicles, records, 'due');

    fixture.componentInstance.typeFilter.set('car');

    expect(fixture.componentInstance.filteredVehicles().map((v) => v.id)).toEqual(['overdue-car']);
  });
});

/** 3.6：車輛清單加「所在據點」欄與據點篩選（全部／各據點／未設定）。 */
describe('VehiclesPageComponent 所在據點欄與篩選', () => {
  function createComponent(vehicles: Vehicle[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    return TestBed.createComponent(VehiclesPageComponent);
  }

  const vehicles = [
    makeVehicle({ id: 'v-airport', plateNumber: 'AAA-111', location: 'mzg-airport' }),
    makeVehicle({ id: 'v-store', plateNumber: 'BBB-222', location: 'mzg-store' }),
    makeVehicle({ id: 'v-unset', plateNumber: 'CCC-333' }), // location 未設定
  ];

  it('沒有套用據點篩選時顯示全部', () => {
    const fixture = createComponent(vehicles);
    expect(fixture.componentInstance.filteredVehicles()).toHaveLength(3);
  });

  it('依所在據點篩選：只留該據點的車', () => {
    const fixture = createComponent(vehicles);
    fixture.componentInstance.locationFilter.set('mzg-airport');
    expect(fixture.componentInstance.filteredVehicles().map((v) => v.id)).toEqual(['v-airport']);
  });

  it('據點篩選「未設定」：只留所在據點未設定的車', () => {
    const fixture = createComponent(vehicles);
    fixture.componentInstance.locationFilter.set(LOCATION_FILTER_UNSET);
    expect(fixture.componentInstance.filteredVehicles().map((v) => v.id)).toEqual(['v-unset']);
  });

  it('activeFilterCount 納入據點篩選', () => {
    const fixture = createComponent(vehicles);
    expect(fixture.componentInstance.activeFilterCount()).toBe(0);
    fixture.componentInstance.locationFilter.set('mzg-store');
    expect(fixture.componentInstance.activeFilterCount()).toBe(1);
  });

  it('clearFilters 一併清除據點篩選', () => {
    const fixture = createComponent(vehicles);
    fixture.componentInstance.locationFilter.set('mzg-store');

    fixture.componentInstance.clearFilters();

    expect(fixture.componentInstance.locationFilter()).toBeNull();
    expect(fixture.componentInstance.filteredVehicles()).toHaveLength(3);
  });

  it('據點篩選可與車種／狀態／搜尋等既有篩選同時套用（AND，不是 OR）', () => {
    const mixed = [
      makeVehicle({ id: 'airport-scooter', category: 'scooter', location: 'mzg-airport' }),
      makeVehicle({ id: 'airport-car', category: 'car', location: 'mzg-airport' }),
      makeVehicle({ id: 'store-scooter', category: 'scooter', location: 'mzg-store' }),
    ];
    const fixture = createComponent(mixed);
    fixture.componentInstance.locationFilter.set('mzg-airport');
    fixture.componentInstance.typeFilter.set('scooter');

    // 同時符合「所在據點＝機場」與「車種＝機車」的只有 airport-scooter 一台；
    // 若兩個篩選被誤實作成 OR，store-scooter／airport-car 也會被算進來。
    expect(fixture.componentInstance.filteredVehicles().map((v) => v.id)).toEqual(['airport-scooter']);
  });

  it('資料表顯示所在據點欄：已設定顯示據點名稱、未設定顯示「—」', async () => {
    const fixture = createComponent(vehicles);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('馬公機場櫃檯');
    expect(el.textContent).toContain('馬公中正門市');
    expect(fixture.componentInstance.branchName(undefined)).toBe('—');
  });
});

/** 3.5：時間軸搬到總覽，車輛清單頁移除「表格／時間軸」切換，只留表格。 */
describe('VehiclesPageComponent 時間軸切換已移除', () => {
  it('頁面上不再有表格／時間軸切換，也不會渲染時間軸元件', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle({ id: 'v1' })]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const fixture = TestBed.createComponent(VehiclesPageComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-timeline-view')).toBeNull();
    expect(el.querySelector('.ui-card-titleNav')).toBeNull();
    expect(el.textContent).not.toContain('時間軸');
  });
});
