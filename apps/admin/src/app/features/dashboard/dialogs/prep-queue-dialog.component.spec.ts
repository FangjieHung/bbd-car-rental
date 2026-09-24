import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MaintenanceRecord, PrepTask, RentalOrder, Repository, Vehicle } from '../../../core/models';
import { ORDER_REPO, MAINTENANCE_REPO, PREP_TASK_REPO, VEHICLE_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { fmtDateTime } from '../../../core/date-utils';
import { PrepQueueDialogComponent } from './prep-queue-dialog.component';

const today = new Date();
const at = (dayOffset: number, hour: number) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, hour).toISOString();

function vehicle(id: string, plateNumber: string, model: string): Vehicle {
  return {
    id, plateNumber, model, category: 'scooter', brand: 'Gogoro', year: 2022,
    status: 'available', mileage: 0, createdAt: '',
  };
}

function prepTask(partial: Partial<PrepTask>): PrepTask {
  return {
    id: 'p1',
    vehicleId: 'v1',
    bookingId: 'b0',
    returnedAt: at(-1, 18),
    returnBranchId: 'mzg-store',
    ...partial,
  };
}

function reserved(partial: Partial<RentalOrder>): RentalOrder {
  return {
    id: 'b1', vehicleId: 'v1', memberId: 'c1',
    startTime: at(2, 9), endTime: at(4, 9),
    pickupBranchId: 'mzg-store', returnBranchId: 'mzg-store', status: 'reserved', depositRequired: 0,
    ...partial,
  };
}

function setup(options: { tasks?: PrepTask[]; orders?: RentalOrder[] } = {}) {
  const prepRepo: Repository<PrepTask> = createInMemoryRepo<PrepTask>(options.tasks ?? []);
  TestBed.configureTestingModule({
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: PREP_TASK_REPO, useValue: prepRepo },
      {
        provide: VEHICLE_REPO,
        useValue: createInMemoryRepo<Vehicle>([
          vehicle('v1', 'ABC-123', 'Gogoro 3'),
          vehicle('v2', 'GHI-789', 'Yaris'),
          vehicle('v3', 'PQR-678', 'Corolla Cross'),
        ]),
      },
      { provide: ORDER_REPO, useValue: createInMemoryRepo<RentalOrder>(options.orders ?? []) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
    ],
  });
  const fixture = TestBed.createComponent(PrepQueueDialogComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const bodyRows = () => Array.from(el.querySelectorAll<HTMLTableRowElement>('tbody tr'));
  const cellTexts = (row: HTMLTableRowElement) =>
    Array.from(row.querySelectorAll('td')).map((td) => td.textContent?.trim() ?? '');
  return { fixture, el, prepRepo, bodyRows, cellTexts };
}

describe('PrepQueueDialogComponent（4.3 待整備清單）', () => {
  it('每列：車牌、車款、還車時間、還車據點、下次取車；依該車下一次取車排序，沒有下一筆的排最後', () => {
    const { bodyRows, cellTexts } = setup({
      tasks: [
        prepTask({ id: 'p-none', vehicleId: 'v3', bookingId: 'b-3', returnedAt: at(-2, 10), returnBranchId: 'mzg-port' }),
        prepTask({ id: 'p-later', vehicleId: 'v2', bookingId: 'b-2', returnedAt: at(-1, 17), returnBranchId: 'mzg-airport' }),
        prepTask({ id: 'p-sooner', vehicleId: 'v1', bookingId: 'b-1', returnedAt: at(-1, 18) }),
      ],
      orders: [
        reserved({ id: 'next-v2', vehicleId: 'v2', startTime: at(5, 9) }),
        reserved({ id: 'next-v1', vehicleId: 'v1', startTime: at(0, 14) }),
      ],
    });

    const rows = bodyRows().map(cellTexts);
    expect(rows.map((cells) => cells[0])).toEqual(['ABC-123', 'GHI-789', 'PQR-678']);
    expect(rows[0].slice(0, 5)).toEqual([
      'ABC-123',
      'Gogoro 3',
      fmtDateTime(at(-1, 18)),
      '馬公中正門市',
      fmtDateTime(at(0, 14)),
    ]);
    expect(rows[1][4]).toBe(fmtDateTime(at(5, 9)));
    expect(rows[2][3]).toBe('馬公港櫃檯');
    expect(rows[2][4]).toBe('尚未排定');
  });

  it('按「整備完成」記錄時間與操作人（目前登入的後台使用者），那一列從清單消失', () => {
    const { fixture, el, prepRepo, bodyRows } = setup({
      tasks: [
        prepTask({ id: 'p1', vehicleId: 'v1', bookingId: 'b-1' }),
        prepTask({ id: 'p2', vehicleId: 'v2', bookingId: 'b-2' }),
      ],
    });
    const before = Date.now();
    const button = el.querySelector<HTMLButtonElement>('button[aria-label="ABC-123 整備完成"]');
    expect(button?.textContent).toContain('整備完成');

    button?.click();
    fixture.detectChanges();

    const done = prepRepo.getById('p1');
    expect(done?.completedBy).toBe('管理員');
    expect(new Date(done?.completedAt ?? '').getTime()).toBeGreaterThanOrEqual(before);
    expect(bodyRows().map((row) => row.querySelector('td')?.textContent?.trim())).toEqual(['GHI-789']);
  });

  it('沒有待整備時顯示「目前沒有待整備的車」', () => {
    const { el, bodyRows } = setup({
      tasks: [prepTask({ id: 'done', completedAt: at(0, 9), completedBy: '管理員' })],
    });

    expect(bodyRows()).toHaveLength(0);
    expect(el.textContent).toContain('目前沒有待整備的車');
  });

  it('說明寫出不擋交車，並有關閉按鈕', () => {
    const { el } = setup();

    expect(el.querySelector('[mat-dialog-title]')?.textContent?.trim()).toBe('待整備');
    expect(el.querySelector('.prep-queue__hint')?.textContent).toContain('不擋交車');
    expect(el.querySelector('[mat-dialog-actions] button')?.textContent?.trim()).toBe('關閉');
  });
});
