import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  computeBlocks,
  laneCountOf,
  shortDateLabel,
  TimelineViewComponent,
} from './timeline-view/timeline-view.component';
import { Member, RENTAL_BRANCHES, RentalOrder, Vehicle } from '../../core/models';
import { VEHICLE_REPO, ORDER_REPO, MAINTENANCE_REPO, MEMBER_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { fmtDate, startOfDay } from '../../core/date-utils';
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
        pickupBranchId: '',
        overdue: false,
        needsDispatch: false,
        conflict: false,
        lane: 0,
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
      [mk({ status: 'reserved', pickupBranchId: airport.id })],
      'v1',
      store.id,
      rangeStart,
      14,
    );
    expect(blocks[0].needsDispatch).toBe(true);
  });

  it('reserved 且取車據點與車輛所在據點相同：needsDispatch 為 false', () => {
    const blocks = computeBlocks(
      [mk({ status: 'reserved', pickupBranchId: store.id })],
      'v1',
      store.id,
      rangeStart,
      14,
    );
    expect(blocks[0].needsDispatch).toBe(false);
  });

  it('in_progress（已取車）不標需調度，即使取車據點與車輛目前所在據點不同', () => {
    const blocks = computeBlocks(
      [mk({ status: 'in_progress', pickupBranchId: airport.id, endTime: new Date(2026, 6, 30).toISOString() })],
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
    // 打磨（3）：互相重疊時分到不同 lane，畫面上才會是上下兩條、兩筆都完整可讀。
    expect(overdue?.lane).toBe(0);
    expect(next?.lane).toBe(1);
    expect(laneCountOf(blocks)).toBe(2);
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
    // 沒有真的重疊（欄位不相交）：兩筆都留在 lane 0，不需要疊成兩條。
    expect(later?.lane).toBe(0);
    expect(laneCountOf(blocks)).toBe(1);
  });

  it('不同車輛的訂單不會互相標示 conflict', () => {
    const overdueBooking = mk({
      id: 'b-overdue',
      vehicleId: 'v1',
      status: 'in_progress',
      startTime: new Date(2026, 8, 20, 9).toISOString(),
      endTime: new Date(2026, 8, 22, 18).toISOString(),
    });
    // 呼叫端只會用同一台車的訂單呼叫 computeBlocks（見 blocksOf 只傳 orderStore 全部訂單但用 vehicleId 篩選），
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

describe('computeBlocks／laneCountOf：lane 分配（打磨 3，同一列重疊色塊改上下兩條）', () => {
  it('三筆互相重疊：分別拿到 0／1／2 三條不同的 lane', () => {
    const blocks = computeBlocks(
      [
        mk({ id: 'a', status: 'reserved', startTime: new Date(2026, 6, 20).toISOString(), endTime: new Date(2026, 6, 25).toISOString() }),
        mk({ id: 'b', status: 'reserved', startTime: new Date(2026, 6, 21).toISOString(), endTime: new Date(2026, 6, 26).toISOString() }),
        mk({ id: 'c', status: 'reserved', startTime: new Date(2026, 6, 22).toISOString(), endTime: new Date(2026, 6, 27).toISOString() }),
      ],
      'v1',
      undefined,
      rangeStart,
      14,
    );
    const lanes = blocks.map((b) => b.lane).sort();
    expect(lanes).toEqual([0, 1, 2]);
    expect(laneCountOf(blocks)).toBe(3);
  });

  it('先後兩筆不重疊（首尾相接）：都留在 lane 0，不會白白疊成兩條', () => {
    const blocks = computeBlocks(
      [
        mk({ id: 'a', startTime: new Date(2026, 6, 20).toISOString(), endTime: new Date(2026, 6, 22).toISOString() }),
        mk({ id: 'b', startTime: new Date(2026, 6, 23).toISOString(), endTime: new Date(2026, 6, 25).toISOString() }),
      ],
      'v1',
      undefined,
      rangeStart,
      14,
    );
    expect(blocks.map((b) => b.lane)).toEqual([0, 0]);
    expect(laneCountOf(blocks)).toBe(1);
  });

  it('laneCountOf([])：沒有色塊時仍回傳 1（不縮成 0，列高維持正常最小高度）', () => {
    expect(laneCountOf([])).toBe(1);
  });
});

function createFixture(
  options: {
    vehicles?: Vehicle[];
    orders?: RentalOrder[];
    members?: Member[];
    orderDetailOpen?: (id: string) => void;
  } = {},
) {
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo(options.vehicles ?? []) },
      { provide: ORDER_REPO, useValue: createInMemoryRepo(options.orders ?? []) },
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

describe('shortDateLabel（打磨 1：時間軸日期欄精簡標題）', () => {
  it('月份、日期都不補零，例如 9/20、9/5', () => {
    expect(shortDateLabel(new Date(2026, 8, 20))).toBe('9/20');
    expect(shortDateLabel(new Date(2026, 8, 5))).toBe('9/5');
  });

  it('跨月時自然看得出換月，例如 10 月 1 號寫「10/1」', () => {
    expect(shortDateLabel(new Date(2026, 9, 1))).toBe('10/1');
  });
});

describe('TimelineViewComponent 日期欄標題（打磨 1：精簡標題＋完整日期放 aria-label）', () => {
  it('標題分兩行：上行精簡日期、下行星期；完整日期改放 aria-label／title，不再重疊亂碼', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 20)); // 週一，範圍週日（7/19）起
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const headers = Array.from(el.querySelectorAll<HTMLElement>('.timeline-view__cell-header'));
    expect(headers).toHaveLength(14);

    const days = fixture.componentInstance.days();
    headers.forEach((header, i) => {
      const dateEl = header.querySelector('.timeline-view__cell-header-date');
      const weekdayEl = header.querySelector('.timeline-view__cell-header-weekday');
      expect(dateEl?.textContent?.trim()).toBe(shortDateLabel(days[i]));
      expect(weekdayEl?.textContent?.trim()).toBe(['日', '一', '二', '三', '四', '五', '六'][days[i].getDay()]);
      expect(header.getAttribute('aria-label')).toBe(fmtDate(days[i]));
      expect(header.title).toBe(fmtDate(days[i]));
    });
    // jsdom 不做真實排版（scrollWidth/clientWidth 恆為 0），標題會不會互相疊字要靠實機截圖
    // 用 Playwright 量測（見驗收流程），這裡只驗證內容與結構本身是正確的精簡格式。
  });

  it('範圍跨月（例如 9/30 → 10/1）：10 月 1 號的標題自然寫「10/1」，看得出換月', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('targetDate', new Date(2026, 8, 27)); // 週日，範圍含 9/27–10/10
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const days = fixture.componentInstance.days();
    const oct1Idx = days.findIndex((d) => d.getMonth() === 9 && d.getDate() === 1);
    expect(oct1Idx).toBeGreaterThanOrEqual(0);

    const headers = el.querySelectorAll<HTMLElement>('.timeline-view__cell-header');
    const dateEl = headers[oct1Idx].querySelector('.timeline-view__cell-header-date');
    expect(dateEl?.textContent?.trim()).toBe('10/1');
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
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1', branchId: airport.id })] });
    fixture.detectChanges();

    expect(fixture.componentInstance.locationLabel(fixture.componentInstance.rows()[0])).toBe(airport.name);
  });

  it('locationLabel：未設定據點時顯示「所在據點未設定」', () => {
    const fixture = createFixture({ vehicles: [mkVehicle({ id: 'v1', branchId: undefined })] });
    fixture.detectChanges();

    expect(fixture.componentInstance.locationLabel(fixture.componentInstance.rows()[0])).toBe('所在據點未設定');
  });

  it('DOM 上的列首會顯示車牌、車款與所在據點', () => {
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1', plateNumber: 'MNO-345', model: 'Ai-1', branchId: airport.id })],
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
      orders: [mk({ id: 'b1', memberId: 'c1', pickupBranchId: airport.id })],
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
      vehicles: [mkVehicle({ id: 'v1', branchId: store.id })],
      orders: [mk({ id: 'b1', status: 'reserved', pickupBranchId: airport.id })],
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
      vehicles: [mkVehicle({ id: 'v1', branchId: store.id })],
      orders: [mk({ id: 'b1', status: 'reserved', pickupBranchId: store.id })],
      members: [mkMember({ id: 'c1' })],
    });
    fixture.componentRef.setInput('targetDate', new Date(2026, 6, 21));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.timeline-view__dispatch-icon')).toBeFalsy();
  });
});

describe('TimelineViewComponent 逾時延伸（透過真正的元件，相對「現在」計算，非固定 now）', () => {
  function setupOverdueWithConflict() {
    const today = startOfDay(new Date());
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1' })],
      orders: [
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
    return fixture;
  }

  it('出租中且已過預定還車時間的訂單套用 overdue 樣式並延伸到今天；重疊的下一筆訂單套用 conflict 樣式', () => {
    const fixture = setupOverdueWithConflict();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.timeline-view__booking--overdue')).toBeTruthy();
    expect(el.querySelector('.timeline-view__booking--conflict')).toBeTruthy();
  });

  // 打磨（2）：逾時未還在畫面上要有常駐可見的警示圖示＋「逾時」文字，不能只在 title／aria-label 裡
  // （先前跟「需調度」不一致：需調度有常駐圖示，逾時沒有）。
  it('逾時色塊常駐顯示警示圖示與「逾時」文字，不只在 title／aria-label 裡', () => {
    const fixture = setupOverdueWithConflict();
    const el = fixture.nativeElement as HTMLElement;
    const overdueBlock = el.querySelector('.timeline-view__booking--overdue') as HTMLElement;
    expect(overdueBlock.querySelector('.timeline-view__overdue-icon')).toBeTruthy();
    expect(overdueBlock.querySelector('.timeline-view__overdue-label')?.textContent?.trim()).toBe('逾時');
  });

  // 打磨（3）：逾時延伸段跟同車下一筆預訂重疊時，改成上下兩條（不同 grid-row），該列的日期欄
  // 也跟著加高（modifier class），兩筆訂單才都完整可讀，不會互相蓋住。
  it('重疊的兩筆訂單分成上下兩條：grid-row 不同，該列的日期欄加上長高的 modifier class', () => {
    const fixture = setupOverdueWithConflict();
    const el = fixture.nativeElement as HTMLElement;

    const bookingButtons = Array.from(el.querySelectorAll<HTMLElement>('.timeline-view__booking'));
    expect(bookingButtons).toHaveLength(2);
    const gridRows = bookingButtons.map((b) => b.style.gridRow);
    expect(new Set(gridRows).size).toBe(2); // 兩筆各自佔一條，不是同一個 grid-row

    const dayCells = el.querySelectorAll('.timeline-view__day');
    expect(dayCells.length).toBeGreaterThan(0);
    dayCells.forEach((cell) => expect(cell.classList.contains('timeline-view__day--tall')).toBe(true));
  });
});

describe('TimelineViewComponent openDetail', () => {
  it('點擊區塊前往訂單詳情，不再開簡化版的 order-detail dialog', () => {
    const workspaceOpen = vi.fn();
    const fixture = createFixture({
      vehicles: [mkVehicle({ id: 'v1' })],
      orders: [mk({ id: 'b1' })],
      orderDetailOpen: workspaceOpen,
    });
    fixture.componentInstance.openDetail('b1');

    expect(workspaceOpen).toHaveBeenCalledWith('b1');
  });
});
