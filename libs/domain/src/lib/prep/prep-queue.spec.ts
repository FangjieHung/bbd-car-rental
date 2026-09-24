import { describe, it, expect } from 'vitest';
import { isPrepTaskOpen, nextPickupOf, prepQueue } from './prep-queue';
import { PrepTask, RentalOrder } from '../models';

const iso = (local: string) => new Date(local).toISOString();

function task(p: Partial<PrepTask> = {}): PrepTask {
  return {
    id: 'p1',
    vehicleId: 'v1',
    bookingId: 'b0',
    returnedAt: iso('2026-09-20T18:00'),
    returnBranchId: 'mzg-store',
    ...p,
  };
}

function order(p: Partial<RentalOrder> = {}): RentalOrder {
  return {
    id: 'b1', vehicleId: 'v1', memberId: 'm1',
    startTime: iso('2026-09-25T09:00'), endTime: iso('2026-09-27T09:00'),
    pickupBranchId: 'mzg-store', returnBranchId: 'mzg-store', status: 'reserved', depositRequired: 0, ...p,
  };
}

describe('isPrepTaskOpen', () => {
  it('沒有完成、也沒有被取代＝未結案', () => {
    expect(isPrepTaskOpen(task())).toBe(true);
  });

  it('按過「整備完成」或被同車下一次還車取代＝已結案', () => {
    expect(isPrepTaskOpen(task({ completedAt: iso('2026-09-21T09:00'), completedBy: '管理員' }))).toBe(false);
    expect(isPrepTaskOpen(task({ supersededBy: 'p2' }))).toBe(false);
  });
});

describe('nextPickupOf', () => {
  it('同一台車尚未取車（reserved）的訂單中取車時間最早的那一筆', () => {
    const orders = [
      order({ id: 'later', startTime: iso('2026-09-28T09:00') }),
      order({ id: 'sooner', startTime: iso('2026-09-25T09:00') }),
      order({ id: 'other-car', vehicleId: 'v2', startTime: iso('2026-09-22T09:00') }),
    ];
    expect(nextPickupOf('v1', orders)?.id).toBe('sooner');
  });

  it('出租中、已完成、已取消的訂單都不是「下一次取車」', () => {
    const orders = [
      order({ id: 'out', status: 'in_progress', startTime: iso('2026-09-21T09:00') }),
      order({ id: 'done', status: 'completed', startTime: iso('2026-09-10T09:00') }),
      order({ id: 'gone', status: 'cancelled', startTime: iso('2026-09-22T09:00') }),
    ];
    expect(nextPickupOf('v1', orders)).toBeUndefined();
  });

  it('取車時間已過、但還沒取車的預訂仍算（客人在等車，是最急的情況）', () => {
    const late = order({ id: 'waiting', startTime: iso('2026-09-20T09:00') });
    expect(nextPickupOf('v1', [late, order({ id: 'next-week' })])?.id).toBe('waiting');
  });
});

describe('prepQueue', () => {
  it('依該車下一次取車時間排序（最急的在上），沒有下一筆取車的排最後', () => {
    const tasks = [
      task({ id: 'p-none', vehicleId: 'v3' }),
      task({ id: 'p-later', vehicleId: 'v2' }),
      task({ id: 'p-sooner', vehicleId: 'v1' }),
    ];
    const orders = [
      order({ id: 'b-v1', vehicleId: 'v1', startTime: iso('2026-09-24T14:00') }),
      order({ id: 'b-v2', vehicleId: 'v2', startTime: iso('2026-09-26T09:00') }),
    ];

    const queue = prepQueue(tasks, orders);

    expect(queue.map((item) => item.task.id)).toEqual(['p-sooner', 'p-later', 'p-none']);
    expect(queue.map((item) => item.nextPickup?.id)).toEqual(['b-v1', 'b-v2', undefined]);
  });

  it('都沒有下一筆取車時，先還車的排前面', () => {
    const tasks = [
      task({ id: 'p-recent', vehicleId: 'v1', returnedAt: iso('2026-09-22T18:00') }),
      task({ id: 'p-old', vehicleId: 'v2', returnedAt: iso('2026-09-19T18:00') }),
    ];
    expect(prepQueue(tasks, []).map((item) => item.task.id)).toEqual(['p-old', 'p-recent']);
  });

  it('已完成或被取代的整備不列入', () => {
    const tasks = [
      task({ id: 'open' }),
      task({ id: 'done', vehicleId: 'v2', completedAt: iso('2026-09-21T09:00'), completedBy: '管理員' }),
      task({ id: 'replaced', vehicleId: 'v3', supersededBy: 'p9' }),
    ];
    expect(prepQueue(tasks, []).map((item) => item.task.id)).toEqual(['open']);
  });
});
