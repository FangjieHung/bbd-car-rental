import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { computeBlocks, TimelineViewComponent } from './timeline-view/timeline-view.component';
import { Member, RENTAL_BRANCHES, RentalBooking, Vehicle } from '../../core/models';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO, MEMBER_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { startOfDay } from '../../core/date-utils';
import { OrderDetailNavigation } from '../orders/navigation/order-detail-navigation';

function requireBranch(id: string) {
  const branch = RENTAL_BRANCHES.find((b) => b.id === id);
  if (!branch) throw new Error(`fixture setup: unknown branch id ${id}`);
  return branch;
}

const airport = requireBranch('mzg-airport');
const store = requireBranch('mzg-store');

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

const mkMember = (partial: Partial<Member>): Member => ({
  id: 'c1',
  name: '林美惠',
  phone: '0900000000',
  kind: 'local',
  email: 'a@b.com',
  ...partial,
});

const rangeStart = new Date(2026, 6, 20); // 2026-07-20 local
const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
  id: 'b1',
  vehicleId: 'v1',
  memberId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupLocation: '',
  returnLocation: '',
  status: 'reserved',
  depositRequired: 0,
  ...partial,
});

describe('computeBlocks：範圍裁切（既有行為）', () => {
  it('範圍內的訂單：startCol 依日差、span 含首尾日', () => {
    const blocks = computeBlocks([mk({})], 'v1', undefined, rangeStart, 14);
    expect(blocks).toEqual([
      {
        startCol: 2,
        span: 3,
        kind: 'reserved',
        bookingId: 'b1',
        memberId: 'c1',
        pickupLocation: '',
        overdue: false,
        needsDispatch: false,
        conflict: false,
      },
    ]);
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
      undefined,
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
        undefined,
        rangeStart,
        14,
      ),
    ).toEqual([]);
    expect(computeBlocks([mk({ status: 'cancelled' })], 'v1', undefined, rangeStart, 14)).toEqual([]);
    expect(computeBlocks([mk({ vehicleId: 'v2' })], 'v1', undefined, rangeStart, 14)).toEqual([]);
  });
});

describe('computeBlocks：需調度標記', () => {
  it('reserved 且取車據點與車輛所在據點不同：needsDispatch 為 true', () => {
    const blocks = computeBlocks(
      [mk({ status: 'reserved', pickupLocation: airport.id })],
      'v1',
      store.id,
      rangeStart,
      14,
    );
    expect(blocks[0].needsDispatch).toBe(true);
  });

  it('reserved 且取車據點與車輛所在據點相同：needsDispatch 為 false', () => {
    const blocks = computeBlocks(
      [mk({ status: 'reserved', pickupLocation: store.id })],
      'v1',
      store.id,
      rangeStart,
      14,
    );
    expect(blocks[0].needsDispatch).toBe(false);
  });

  it('in_progress（已取車）不標需調度，即使取車據點與車輛目前所在據點不同', () => {
    const blocks = computeBlocks(
      [mk({ status: 'in_progress', pickupLocation: airport.id, endTime: new Date(2026, 6, 30).toISOString() })],
      'v1',
      store.id,
      rangeStart,
      14,
    );
    expect(blocks[0].needsDispatch).toBe(false);
  });
});

describe('computeBlocks：逾時延伸與衝突（MNO-345 情境：出租中逾時＋同車下一筆預訂）', () => {
  // 2026-09-20 為週日；「現在」固定在 2026-09-23 12:00（週三），todayIdx = 3。
  const od = new Date(2026, 8, 20);
  const now = new Date(2026, 8, 23, 12);

  it('出租中且預定還車時間已過：overdue 為 true，色塊延伸到今天', () => {
    const overdueBooking = mk({
      id: 'b-overdue',
      status: 'in_progress',
      startTime: new Date(2026, 8, 20, 9).toISOString(),
      endTime: new Date(2026, 8, 22, 18).toISOString(), // 已過 now
    });
    const blocks = computeBlocks([overdueBooking], 'v1', undefined, od, 14, now);
    expect(blocks[0].overdue).toBe(true);
    expect(blocks[0].startCol).toBe(1);
    expect(blocks[0].span).toBe(4); // 原本到 idx2，延伸到 todayIdx=3 → span 4
  });

  it('出租中但還沒到預定還車時間：overdue 為 false，span 不延伸', () => {
    const futureBooking = mk({
      id: 'b-future',
      status: 'in_progress',
      startTime: new Date(2026, 8, 20, 9).toISOString(),
      endTime: new Date(2026, 8, 25, 18).toISOString(), // 還沒到
    });
    const blocks = computeBlocks([futureBooking], 'v1', undefined, od, 14, now);
    expect(blocks[0].overdue).toBe(false);
    expect(blocks[0].span).toBe(6); // idx0..idx5，未延伸
  });

  it('reserved 訂單即使還車時間已過也不算 overdue（逾時只適用出租中）', () => {
    const blocks = computeBlocks(
      [mk({ id: 'b-r', status: 'reserved', endTime: new Date(2026, 8, 21).toISOString() })],
      'v1',
      undefined,
      od,
      14,
      now,
    );
    expect(blocks[0].overdue).toBe(false);
  });

  it('延伸後與同車下一筆預訂重疊：下一筆被標示 conflict', () => {
    const overdueBooking = mk({
      id: 'b-overdue',
      vehicleId: 'v1',
      status: 'in_progress',
      startTime: new Date(2026, 8, 20, 9).toISOString(),
      endTime: new Date(2026, 8, 22, 18).toISOString(),
    });
    const nextBooking = mk({
      id: 'b-next',
      vehicleId: 'v1',
      status: 'reserved',
      startTime: new Date(2026, 8, 23, 9).toISOString(), // 今天，落在延伸段內
      endTime: new Date(2026, 8, 25, 18).toISOString(),
    });
    const blocks = computeBlocks([overdueBooking, nextBooking], 'v1', undefined, od, 14, now);
    const next = blocks.find((b) => b.bookingId === 'b-next');
    const overdue = blocks.find((b) => b.bookingId === 'b-overdue');
    expect(overdue?.conflict).toBe(false); // 逾時本身不需要再標自己衝突
    expect(next?.conflict).toBe(true);
  });

  it('下一筆預訂沒有真的與延伸段重疊：不標示 conflict', () => {
    const overdueBooking = mk({
      id: 'b-overdue',
      vehicleId: 'v1',
      status: 'in_progress',
      startTime: new Date(2026, 8, 20, 9).toISOString(),
      endTime: new Date(2026, 8, 22, 18).toISOString(),
    });
    const laterBooking = mk({
      id: 'b-later',
      vehicleId: 'v1',
      status: 'reserved',
      startTime: new Date(2026, 8, 26, 9).toISOString(), // todayIdx=3 之後才開始，沒有重疊
      endTime: new Date(2026, 8, 28, 18).toISOString(),
    });
    const blocks = computeBlocks([overdueBooking, laterBooking], 'v1', undefined, od, 14, now);
    const later = blocks.find((b) => b.bookingId === 'b-later');
    expect(later?.conflict).toBe(false);
  });

  it('不同車輛的訂單不會互相標示 conflict', () => {
    const overdueBooking = mk({
      id: 'b-overdue',
      vehicleId: 'v1',
      status: 'in_progress',
      startTime: new Date(2026, 8, 20, 9).toISOString(),
      endTime: new Date(2026, 8, 22, 18).toISOString(),
    });
    // 呼叫端只會用同一台車的訂單呼叫 computeBlocks（見 blocksOf 只傳 bookingStore 全部訂單但用 vehicleId 篩選），
    // 這裡直接驗證 v2 的訂單即使日期重疊，也因為 vehicleId 篩選而完全不會出現在 v1 的 blocks 裡。
    const otherVehicleBooking = mk({
      id: 'b-other',
      vehicleId: 'v2',
      status: 'reserved',
      startTime: new Date(2026, 8, 23, 9).toISOString(),
      endTime: new Date(2026, 8, 25, 18).toISOString(),
    });
    const blocks = computeBlocks([overdueBooking, otherVehicleBooking], 'v1', undefined, od, 14, now);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].bookingId).toBe('b-overdue');
  });
});

function createFixture(
  options: {
    vehicles?: Vehicle[];
    bookings?: RentalBooking[];
    members?: Member[];
    orderDetailOpen?: (id: string) => void;
  } = {},
) {
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo(options.vehicles ?? []) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo(options.bookings ?? []) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo([]) },
      { provide: MEMBER_REPO, useValue: createInMemoryRepo(options.members ?? []) },
      { provide: OrderDetailNavigation, useValue: { open: options.orderDetailOpen ?? (() => undefined) } },
    ],
  });
  return TestBed.createComponent(TimelineViewComponent);
}

describe('TimelineViewComponent 範圍計算（週日起 14 天／±7／targetDate 移動）', () => {
  it('以 targetDate 所在週的週日為起點，共 14 天', () => {
    const fixture = createFixture();
    const suppliedDate = new Date(2026, 6, 23, 15); // 週四

    fixture.componentRef.setInput('targetDate', suppliedDate);
    fixture.detectChanges();

    const days = fixture.componentInstance.days();
    expect(days[0]).toEqual(new Date(2026, 6, 19)); // 該週週日
    expect(days).toHaveLength(14);
    expect(days[13]).toEqual(new Date(2026, 7, 1));
  });

  it('左右切換以 7 天為單位移動範圍', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 23, 15));
    fixture.detectChanges();
    const start = fixture.componentInstance.rangeStart();

    fixture.componentInstance.shift(7);
    expect(fixture.componentInstance.rangeStart()).toEqual(new Date(2026, 6, 26));

    fixture.componentInstance.shift(-7);
    expect(fixture.componentInstance.rangeStart()).toEqual(start);
  });

  it('targetDate 改變且新日期不在目前範圍內：範圍移到新日期所在週的週日', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 23, 15));
    fixture.detectChanges();

    fixture.componentRef.setInput('targetDate', new Date(2026, 7, 15)); // 2026-08-15，超出目前範圍
    fixture.detectChanges();

    expect(fixture.componentInstance.rangeStart()).toEqual(new Date(2026, 7, 9)); // 該週週日
  });

  it('targetDate 改變但新日期仍在目前範圍內：範圍不動，保留手動切換的結果', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 23, 15));
    fixture.detectChanges();
    fixture.componentInstance.shift(7); // rangeStart -> 2026-07-26
    const shiftedStart = fixture.componentInstance.rangeStart();

    fixture.componentRef.setInput('targetDate', new Date(2026, 7, 5)); // 落在 07-26~08-08 內
    fixture.detectChanges();

    expect(fixture.componentInstance.rangeStart()).toEqual(shiftedStart);
  });
});

describe('TimelineViewComponent dateSelect 輸出', () => {
  it('selectDate() 透過 dateSelect 送出那一天', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const emitted: Date[] = [];
    fixture.componentInstance.dateSelect.subscribe((d) => emitted.push(d));

    const day = new Date(2026, 6, 25);
    fixture.componentInstance.selectDate(day);

    expect(emitted).toEqual([day]);
  });

  it('點日期欄標題會送出那一欄對應的日期', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 23, 15));
    fixture.detectChanges();
    const emitted: Date[] = [];
    fixture.componentInstance.dateSelect.subscribe((d) => emitted.push(d));

    const el = fixture.nativeElement as HTMLElement;
    const headerButtons = el.querySelectorAll('.timeline-view__cell-header');
    expect(headerButtons.length).toBe(14);
    (headerButtons[2] as HTMLElement).click();

    expect(emitted).toEqual([fixture.componentInstance.days()[2]]);
  });
});

describe('TimelineViewComponent vehicles input', () => {
  it('未提供 vehicles input 時，rows 落回 VehicleStore 的全部車輛', () => {
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1' }), mkVehicle({ id: 'v2' })] });
    fixture.detectChanges();

    expect(fixture.componentInstance.rows().map((v) => v.id)).toEqual(['v1', 'v2']);
  });

  it('提供 vehicles input 時，rows 改用傳入的清單而非 store', () => {
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1' }), mkVehicle({ id: 'v2' })] });
    fixture.componentRef.setInput('vehicles', [mkVehicle({ id: 'v3' })]);
    fixture.detectChanges();

    expect(fixture.componentInstance.rows().map((v) => v.id)).toEqual(['v3']);
  });
});

describe('TimelineViewComponent 列首所在據點', () => {
  it('locationLabel：有設定據點時顯示據點名稱', () => {
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1', location: airport.id })] });
    fixture.detectChanges();

    expect(fixture.componentInstance.locationLabel(fixture.componentInstance.rows()[0])).toBe(airport.name);
  });

  it('locationLabel：未設定據點時顯示「所在據點未設定」', () => {
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1', location: undefined })] });
    fixture.detectChanges();

    expect(fixture.componentInstance.locationLabel(fixture.componentInstance.rows()[0])).toBe('所在據點未設定');
  });

  it('DOM 上的列首會顯示車牌、車款與所在據點', () => {
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1', plateNumber: 'MNO-345', model: 'Ai-1', location: airport.id })],
    });
    fixture.detectChanges();

    const rowHead = (fixture.nativeElement as HTMLElement).querySelector('.timeline-view__row-head');
    expect(rowHead?.textContent).toContain('MNO-345');
    expect(rowHead?.textContent).toContain('Ai-1');
    expect(rowHead?.textContent).toContain(airport.name);
  });
});

describe('TimelineViewComponent 保養中整列標示', () => {
  it('保養中的車輛整列加上 modifier class，列首顯示「保養中」', () => {
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1', status: 'maintenance' })] });
    fixture.detectChanges();

    const row = (fixture.nativeElement as HTMLElement).querySelector('.timeline-view__vehicle-row');
    expect(row?.classList.contains('timeline-view__vehicle-row--maintenance')).toBe(true);
    expect(row?.textContent).toContain('保養中');
  });

  it('非保養中的車輛列不加上 modifier class', () => {
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1', status: 'available' })] });
    fixture.detectChanges();

    const row = (fixture.nativeElement as HTMLElement).querySelector('.timeline-view__vehicle-row');
    expect(row?.classList.contains('timeline-view__vehicle-row--maintenance')).toBe(false);
    expect(row?.textContent).not.toContain('保養中');
  });
});

describe('TimelineViewComponent 色塊文字與需調度標記', () => {
  it('色塊文字為「承租人姓名・取車據點」', () => {
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1' })],
      bookings: [mk({ id: 'b1', memberId: 'c1', pickupLocation: airport.id })],
      members: [mkMember({ id: 'c1', name: '林美惠' })],
    });
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 21));
    fixture.detectChanges();

    const block = fixture.componentInstance.blocksOf(fixture.componentInstance.rows()[0])[0];
    expect(fixture.componentInstance.blockLabel(block)).toBe(`林美惠・${airport.name}`);

    const bookingButton = (fixture.nativeElement as HTMLElement).querySelector('.timeline-view__booking');
    expect(bookingButton?.textContent).toContain('林美惠');
    expect(bookingButton?.textContent).toContain(airport.name);
  });

  it('需調度時色塊標示調度圖示與 aria-label／title 含完整資訊', () => {
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1', location: store.id })],
      bookings: [mk({ id: 'b1', status: 'reserved', pickupLocation: airport.id })],
      members: [mkMember({ id: 'c1', name: '林美惠' })],
    });
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 21));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.timeline-view__dispatch-icon')).toBeTruthy();

    const bookingButton = el.querySelector('.timeline-view__booking') as HTMLElement;
    expect(bookingButton.title).toContain('林美惠');
    expect(bookingButton.title).toContain(airport.name);
    expect(bookingButton.getAttribute('aria-label')).toBe(bookingButton.title);
  });

  it('取車據點與車輛所在據點相同時不標示調度圖示', () => {
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1', location: store.id })],
      bookings: [mk({ id: 'b1', status: 'reserved', pickupLocation: store.id })],
      members: [mkMember({ id: 'c1' })],
    });
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 21));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.timeline-view__dispatch-icon')).toBeFalsy();
  });
});

describe('TimelineViewComponent 逾時延伸（透過真正的元件，相對「現在」計算，非固定 now）', () => {
  it('出租中且已過預定還車時間的訂單套用 overdue 樣式並延伸到今天；重疊的下一筆訂單套用 conflict 樣式', () => {
    const today = startOfDay(new Date());
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1' })],
      bookings: [
        mk({
          id: 'b-overdue',
          status: 'in_progress',
          startTime: new Date(Date.now() - 5 * 86_400_000).toISOString(),
          endTime: new Date(Date.now() - 2 * 86_400_000).toISOString(), // 兩天前已到期，仍出租中＝逾時未還
        }),
        mk({
          id: 'b-next',
          status: 'reserved',
          startTime: today.toISOString(),
          endTime: new Date(Date.now() + 2 * 86_400_000).toISOString(),
        }),
      ],
      members: [mkMember({ id: 'c1' })],
    });
    // targetDate 維持預設（今天），範圍自然涵蓋今天那一欄。
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.timeline-view__booking--overdue')).toBeTruthy();
    expect(el.querySelector('.timeline-view__booking--conflict')).toBeTruthy();
  });
});

describe('TimelineViewComponent openDetail', () => {
  it('點擊區塊前往訂單詳情，不再開簡化版的 booking-detail dialog', () => {
    const workspaceOpen = vi.fn();
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1' })],
      bookings: [mk({ id: 'b1' })],
      orderDetailOpen: workspaceOpen,
    });
    fixture.componentInstance.openDetail('b1');

    expect(workspaceOpen).toHaveBeenCalledWith('b1');
  });
});
