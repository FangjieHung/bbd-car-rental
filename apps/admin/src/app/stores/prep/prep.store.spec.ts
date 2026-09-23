import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MaintenanceRecord, PrepTask, RentalBooking, Repository, Vehicle } from '../../core/models';
import { BOOKING_REPO, MAINTENANCE_REPO, PREP_TASK_REPO, VEHICLE_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { PrepStore } from './prep.store';

const iso = (local: string) => new Date(local).toISOString();

function task(p: Partial<PrepTask> = {}): PrepTask {
  return {
    id: 'p1',
    vehicleId: 'v1',
    bookingId: 'b0',
    returnedAt: iso('2026-09-20T18:00'),
    returnLocation: 'mzg-store',
    ...p,
  };
}

function booking(p: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1', vehicleId: 'v1', memberId: 'c1',
    startTime: iso('2026-09-25T09:00'), endTime: iso('2026-09-27T09:00'),
    pickupLocation: 'mzg-store', returnLocation: 'mzg-store', status: 'reserved', depositRequired: 0, ...p,
  };
}

function setup(options: { tasks?: PrepTask[]; bookings?: RentalBooking[] } = {}) {
  const repo: Repository<PrepTask> = createInMemoryRepo<PrepTask>(options.tasks ?? []);
  TestBed.configureTestingModule({
    providers: [
      { provide: PREP_TASK_REPO, useValue: repo },
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(options.bookings ?? []) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
    ],
  });
  return { store: TestBed.inject(PrepStore), repo };
}

describe('PrepStore', () => {
  it('openForReturn：還車後列入一筆未完成的整備（車輛、觸發它的訂單、還車時間、還車據點）', () => {
    const { store, repo } = setup();

    const created = store.openForReturn({
      vehicleId: 'v1',
      bookingId: 'b5',
      returnedAt: iso('2026-09-21T18:30'),
      returnLocation: 'mzg-port',
    });

    expect(repo.getAll()).toEqual([created]);
    expect(created).toEqual({
      id: expect.any(String),
      vehicleId: 'v1',
      bookingId: 'b5',
      returnedAt: iso('2026-09-21T18:30'),
      returnLocation: 'mzg-port',
    });
    expect(store.openCount()).toBe(1);
    expect(store.hasOpenTaskFor('v1')).toBe(true);
    expect(store.hasOpenTaskFor('v2')).toBe(false);
  });

  it('同一筆訂單重複列入（還車流程重試）不會多出第二筆', () => {
    const { store, repo } = setup();
    const input = { vehicleId: 'v1', bookingId: 'b5', returnedAt: iso('2026-09-21T18:30'), returnLocation: 'mzg-port' };

    const first = store.openForReturn(input);
    const second = store.openForReturn(input);

    expect(second.id).toBe(first.id);
    expect(repo.getAll()).toHaveLength(1);
  });

  it('同一台車上次還車後還沒整備就又還車：舊的被新的取代（不算完成），清單每台車只留一筆', () => {
    const { store, repo } = setup({ tasks: [task({ id: 'old', bookingId: 'b-prev' })] });

    const latest = store.openForReturn({
      vehicleId: 'v1',
      bookingId: 'b-latest',
      returnedAt: iso('2026-09-23T10:00'),
      returnLocation: 'mzg-airport',
    });

    const old = repo.getById('old');
    expect(old?.supersededBy).toBe(latest.id);
    expect(old?.completedAt).toBeUndefined();
    expect(old?.completedBy).toBeUndefined();
    expect(store.openTasks().map((t) => t.id)).toEqual([latest.id]);
    expect(store.openCount()).toBe(1);
  });

  it('整備完成：記錄完成時間與操作人，從待整備移除；其他車的待辦不受影響', () => {
    const { store } = setup({ tasks: [task({ id: 'p1' }), task({ id: 'p2', vehicleId: 'v2', bookingId: 'b9' })] });

    const done = store.complete('p1', '管理員', iso('2026-09-22T10:15'));

    expect(done.completedAt).toBe(iso('2026-09-22T10:15'));
    expect(done.completedBy).toBe('管理員');
    expect(store.openTasks().map((t) => t.id)).toEqual(['p2']);
    expect(store.openCount()).toBe(1);
    expect(store.hasOpenTaskFor('v1')).toBe(false);
    // 結案的紀錄保留（不刪除），留得住誰在什麼時候整備的。
    expect(store.tasks().find((t) => t.id === 'p1')?.completedBy).toBe('管理員');
  });

  it('整備完成不帶時間時用現在；已結案的再按一次不改寫第一次的紀錄', () => {
    const { store } = setup({ tasks: [task()] });
    const before = Date.now();

    const first = store.complete('p1', '管理員');
    const again = store.complete('p1', '店長乙', iso('2030-01-01T00:00'));

    expect(new Date(first.completedAt ?? '').getTime()).toBeGreaterThanOrEqual(before);
    expect(again).toEqual(first);
  });

  it('找不到的整備擲錯', () => {
    const { store } = setup();
    expect(() => store.complete('nope', '管理員')).toThrow();
  });

  it('queue：依該車下一次取車時間排序（最急的在上），沒有下一筆取車的排最後，已完成的不列', () => {
    const { store } = setup({
      tasks: [
        task({ id: 'p-none', vehicleId: 'v3', bookingId: 'b-3' }),
        task({ id: 'p-later', vehicleId: 'v2', bookingId: 'b-2' }),
        task({ id: 'p-sooner', vehicleId: 'v1', bookingId: 'b-1' }),
        task({ id: 'p-done', vehicleId: 'v4', bookingId: 'b-4', completedAt: iso('2026-09-21T09:00'), completedBy: '管理員' }),
      ],
      bookings: [
        booking({ id: 'next-v2', vehicleId: 'v2', startTime: iso('2026-09-28T09:00') }),
        booking({ id: 'next-v1', vehicleId: 'v1', startTime: iso('2026-09-24T14:00') }),
        booking({ id: 'next-v4', vehicleId: 'v4', startTime: iso('2026-09-23T09:00') }),
      ],
    });

    expect(store.queue().map((item) => [item.task.id, item.nextPickup?.id])).toEqual([
      ['p-sooner', 'next-v1'],
      ['p-later', 'next-v2'],
      ['p-none', undefined],
    ]);
  });
});
