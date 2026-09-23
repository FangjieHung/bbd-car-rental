import { beforeEach, describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { computeBlocks, TimelineViewComponent } from './timeline-view/timeline-view.component';
import { RentalOrder, Vehicle } from '../../core/models';
import { VEHICLE_REPO, ORDER_REPO, MAINTENANCE_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { OrderDetailNavigation } from '../orders/navigation/order-detail-navigation';

const mkVehicle = (partial: Partial<Vehicle>): Vehicle => ({
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
});

const rangeStart = new Date(2026, 6, 20); // 2026-07-20 local
const mk = (partial: Partial<RentalOrder>): RentalOrder => ({
  id: 'b1',
  vehicleId: 'v1',
  memberId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupBranchId: '',
  returnBranchId: '',
  status: 'reserved',
  depositRequired: 0,
  ...partial,
});

describe('computeBlocks', () => {
  it('範圍內的訂單：startCol 依日差、span 含首尾日', () => {
    const blocks = computeBlocks([mk({})], 'v1', rangeStart, 14);
    expect(blocks).toEqual([{ startCol: 2, span: 3, kind: 'reserved', bookingId: 'b1' }]);
  });

  it('跨範圍起點的訂單被裁切到第 1 欄', () => {
    const blocks = computeBlocks(
      [
        mk({
          startTime: new Date(2026, 6, 15, 9).toISOString(),
          endTime: new Date(2026, 6, 21, 18).toISOString(),
        }),
      ],
      'v1',
      rangeStart,
      14,
    );
    expect(blocks[0].startCol).toBe(1);
    expect(blocks[0].span).toBe(2);
  });

  it('完全在範圍外或 cancelled/completed 不產生 block', () => {
    expect(
      computeBlocks(
        [
          mk({
            startTime: new Date(2026, 7, 20).toISOString(),
            endTime: new Date(2026, 7, 22).toISOString(),
          }),
        ],
        'v1',
        rangeStart,
        14,
      ),
    ).toEqual([]);
    expect(computeBlocks([mk({ status: 'cancelled' })], 'v1', rangeStart, 14)).toEqual([]);
    expect(computeBlocks([mk({ vehicleId: 'v2' })], 'v1', rangeStart, 14)).toEqual([]);
  });
});

describe('TimelineViewComponent supplied date', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TimelineViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo([]) },
        { provide: ORDER_REPO, useValue: createInMemoryRepo([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo([]) },
        { provide: OrderDetailNavigation, useValue: { open: () => undefined } },
      ],
    });
    fixture = TestBed.createComponent(TimelineViewComponent);
  });

  it('以 supplied date 作為第一個可見日', () => {
    const suppliedDate = new Date(2026, 6, 23, 15);

    fixture.componentRef.setInput('targetDate', suppliedDate);
    fixture.detectChanges();

    expect(fixture.componentInstance.days()[0]).toEqual(new Date(2026, 6, 23));
  });

  it('前後移動後，未變更 supplied date 時保留 rangeStart', () => {
    const suppliedDate = new Date(2026, 6, 23, 15);

    fixture.componentRef.setInput('targetDate', suppliedDate);
    fixture.detectChanges();
    fixture.componentInstance.shift(14);
    const shiftedStart = fixture.componentInstance.rangeStart();

    fixture.detectChanges();

    expect(fixture.componentInstance.rangeStart()).toEqual(shiftedStart);
  });
});

describe('TimelineViewComponent vehicles input', () => {
  function createFixture(storeVehicles: Vehicle[]) {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo(storeVehicles) },
        { provide: ORDER_REPO, useValue: createInMemoryRepo([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo([]) },
        { provide: OrderDetailNavigation, useValue: { open: () => undefined } },
      ],
    });
    return TestBed.createComponent(TimelineViewComponent);
  }

  it('未提供 vehicles input 時，rows 落回 VehicleStore 的全部車輛', () => {
    const fixture = createFixture([mkVehicle({ id: 'v1' }), mkVehicle({ id: 'v2' })]);
    fixture.detectChanges();

    expect(fixture.componentInstance.rows().map((v) => v.id)).toEqual(['v1', 'v2']);
  });

  it('提供 vehicles input 時，rows 改用傳入的清單而非 store', () => {
    const fixture = createFixture([mkVehicle({ id: 'v1' }), mkVehicle({ id: 'v2' })]);
    fixture.componentRef.setInput('vehicles', [mkVehicle({ id: 'v3' })]);
    fixture.detectChanges();

    expect(fixture.componentInstance.rows().map((v) => v.id)).toEqual(['v3']);
  });
});

describe('TimelineViewComponent openDetail', () => {
  it('點擊區塊前往訂單詳情，不再開簡化版的 order-detail dialog', () => {
    const workspaceOpen = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo([mkVehicle({ id: 'v1' })]) },
        { provide: ORDER_REPO, useValue: createInMemoryRepo([mk({ id: 'b1' })]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo([]) },
        { provide: OrderDetailNavigation, useValue: { open: workspaceOpen } },
      ],
    });
    const component = TestBed.createComponent(TimelineViewComponent).componentInstance;

    component.openDetail('b1');

    expect(workspaceOpen).toHaveBeenCalledWith('b1');
  });
});
