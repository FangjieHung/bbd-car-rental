import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RentalBooking, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { createOrderRepos, makeVehicle } from '../../orders/testing';
import { AvailableVehicleListComponent } from './available-vehicle-list.component';

const t = ZH_TW.rentalSearch;
const iso = (local: string) => new Date(local).toISOString();

/** 查詢期間：10/5 09:00 – 10/7 09:00（2 天）。 */
const START = '2026-10-05T09:00';
const END = '2026-10-07T09:00';

function booking(partial: Partial<RentalBooking>): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v3',
    memberId: 'm1',
    startTime: iso('2026-10-06T09:00'),
    endTime: iso('2026-10-08T18:00'),
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  };
}

const VEHICLES: Vehicle[] = [
  makeVehicle({ id: 'v1', plateNumber: 'ABC-123', model: 'Altis', location: 'mzg-airport' }),
  makeVehicle({ id: 'v2', plateNumber: 'BCD-234', model: 'Yaris', location: 'mzg-port' }),
  makeVehicle({ id: 'v3', plateNumber: 'CDE-345', model: 'Vios', location: 'mzg-airport' }),
  makeVehicle({ id: 'v4', plateNumber: 'DEF-456', model: 'Sienta', status: 'maintenance', location: 'mzg-store' }),
  makeVehicle({ id: 'v5', plateNumber: 'EFG-567', category: 'scooter', model: '勁戰', location: 'mzg-store' }),
  makeVehicle({ id: 'v6', plateNumber: 'FGH-678', model: 'Wish', location: undefined }),
  makeVehicle({ id: 'v7', plateNumber: 'AAA-111', model: 'Corolla', location: 'mzg-airport' }),
];

interface SetupOptions {
  vehicles?: Vehicle[];
  bookings?: RentalBooking[];
  inputs?: Partial<Record<keyof AvailableVehicleListComponent, unknown>>;
}

function setup(options: SetupOptions = {}) {
  const repos = createOrderRepos({
    vehicles: options.vehicles ?? VEHICLES,
    bookings: options.bookings ?? [booking({})],
  });
  TestBed.configureTestingModule({ providers: [...repos.providers] });
  const fixture = TestBed.createComponent(AvailableVehicleListComponent);
  const inputs = { start: START, end: END, ...options.inputs };
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  const selected: Vehicle[] = [];
  fixture.componentInstance.vehicleSelected.subscribe((v) => selected.push(v));
  return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement, selected };
}

const plates = (el: HTMLElement, selector = '.avl__rows .avl__plate') =>
  Array.from(el.querySelectorAll(selector)).map((n) => n.textContent?.trim());
const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
/** 找出文字含 `needle` 的那個元素；找不到直接讓測試失敗。 */
function rowWith<T extends Element>(nodes: Iterable<T>, needle: string): T {
  const found = Array.from(nodes).find((n) => text(n).includes(needle));
  if (!found) throw new Error(`找不到含「${needle}」的列`);
  return found;
}

describe('AvailableVehicleListComponent 可租判斷', () => {
  it('只列整段期間可以租的車：扣掉有重疊訂單的、保養中的', () => {
    const { component } = setup();
    expect(component.rows().map((r) => r.vehicle.id).sort()).toEqual(['v1', 'v2', 'v5', 'v6', 'v7']);
    expect(component.blocked().map((b) => b.vehicle.id)).toEqual(['v3', 'v4']);
  });

  it('依車型篩選：可租與不能租兩邊都只留同車型', () => {
    const { component } = setup({ inputs: { category: 'scooter' } });
    expect(component.rows().map((r) => r.vehicle.id)).toEqual(['v5']);
    expect(component.blocked()).toEqual([]);
  });

  it('排除這筆訂單自己（編輯訂單）：自己的車照樣列為可租', () => {
    const { component } = setup({ inputs: { excludeBookingId: 'b1' } });
    expect(component.rows().map((r) => r.vehicle.id)).toContain('v3');
    expect(component.blocked().map((b) => b.vehicle.id)).toEqual(['v4']);
  });

  it('已完成、已取消的訂單不佔用車輛', () => {
    const { component } = setup({
      bookings: [booking({ id: 'x', status: 'completed' }), booking({ id: 'y', status: 'cancelled' })],
    });
    expect(component.rows().map((r) => r.vehicle.id)).toContain('v3');
  });
});

describe('AvailableVehicleListComponent 排序與需調度', () => {
  it('有取車據點：已在取車據點的排前面，其餘依據點順序、車牌；小字說明排序', () => {
    const { el } = setup({ inputs: { pickupLocation: 'mzg-port' } });
    // 馬公港（取車據點）→ 馬公機場（AAA、ABC）→ 馬公中正門市 → 所在據點未設定
    expect(plates(el)).toEqual(['BCD-234', 'AAA-111', 'ABC-123', 'EFG-567', 'FGH-678']);
    expect(text(el.querySelector('.avl__hint'))).toBe(t.pickupFirstHint);
  });

  it('沒有取車據點：依據點順序、車牌排序，不顯示排序說明', () => {
    const { el } = setup();
    expect(plates(el)).toEqual(['AAA-111', 'ABC-123', 'BCD-234', 'EFG-567', 'FGH-678']);
    expect(el.querySelector('.avl__hint')).toBeNull();
  });

  it('在取車據點的車顯示「免調度」、其他寫出路線「需調度 {所在據點}→{取車據點}」', () => {
    const { component, el } = setup({ inputs: { pickupLocation: 'mzg-port' } });
    const byId = (id: string) => component.rows().find((r) => r.vehicle.id === id);
    expect(byId('v2')?.dispatch).toEqual({ status: 'success', label: t.noDispatch });
    expect(byId('v1')?.dispatch).toEqual({ status: 'warning', label: '需調度 馬公機場櫃檯→馬公港櫃檯' });

    const rows = Array.from(el.querySelectorAll('.avl__rows .avl__row'));
    expect(text(rows[0].querySelector('.avl__branch'))).toBe('在 馬公港櫃檯');
    expect(text(rows[0].querySelector('.ui-chip--positive'))).toBe(t.noDispatch);
    expect(text(rows[1].querySelector('.avl__branch'))).toBe('在 馬公機場櫃檯');
    expect(text(rows[1].querySelector('.ui-chip--warning'))).toBe('需調度 馬公機場櫃檯→馬公港櫃檯');
  });

  it('所在據點未設定：淡色寫「所在據點未設定」，不猜需不需要調度', () => {
    const { component, el } = setup({ inputs: { pickupLocation: 'mzg-port' } });
    expect(component.rows().find((r) => r.vehicle.id === 'v6')?.dispatch).toBeUndefined();
    const row = rowWith(el.querySelectorAll('.avl__rows .avl__row'), 'FGH-678');
    expect(text(row.querySelector('.avl__muted'))).toBe(t.locationUnset);
    expect(row.querySelector('.ui-chip')).toBeNull();
  });

  it('還沒選取車據點：只寫「在 {所在據點}」，不顯示調度 chip', () => {
    const { el } = setup();
    expect(el.querySelectorAll('.avl__rows .ui-chip')).toHaveLength(0);
  });
});

describe('AvailableVehicleListComponent 標題、租金、不能租', () => {
  it('標題寫出可租台數與車型；每列右側是這段期間的租金與天數', () => {
    const { el } = setup({ inputs: { category: 'car' } });
    expect(text(el.querySelector('.avl__title'))).toBe('這段期間可租 4 台汽車');
    const firstPrice = el.querySelector('.avl__rows .avl__price');
    expect(text(firstPrice?.querySelector('.avl__amount') ?? null)).toBe('NT$2,000');
    expect(text(firstPrice?.querySelector('.avl__days') ?? null)).toBe('2 天');
  });

  it('全部車型時標題用「車」', () => {
    const { el } = setup();
    expect(text(el.querySelector('.avl__title'))).toBe('這段期間可租 5 台車');
  });

  it('不能租的車收在「另有 N 台這段期間不能租」，預設收合；展開後寫出原因', () => {
    const { el, fixture } = setup();
    const toggle = el.querySelector('.avl__blocked-toggle') as HTMLButtonElement;
    expect(text(toggle)).toContain('另有 2 台這段期間不能租');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.avl__blocked')).toBeNull();

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const rows = Array.from(el.querySelectorAll('.avl__blocked-row')).map((r) => [
      text(r.querySelector('.avl__plate')),
      text(r.querySelector('.avl__model')),
      text(r.querySelector('.avl__reason')),
    ]);
    const b = booking({});
    expect(rows).toEqual([
      ['CDE-345', 'Vios', `已預訂 ${fmtDateTime(b.startTime)}–${fmtDateTime(b.endTime)}`],
      ['DEF-456', 'Sienta', t.maintenance],
    ]);
  });

  // 打磨（5）：閱讀順序要跟可租列一致——車牌（主字）＋車款在前，用專屬的 .avl__blocked-vehicle
  // 包住（不是重用可租列兩行堆疊、grid-area 綁定 'vehicle' 的 .avl__vehicle），原因在後、淡化。
  it('「不能租」清單每列：車牌＋車款在前用專屬 wrapper 包住、原因在後面淡化呈現，不是可點擊元素', () => {
    const { el, fixture } = setup();
    (el.querySelector('.avl__blocked-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();

    const row = rowWith(el.querySelectorAll('.avl__blocked-row'), 'CDE-345');
    const vehicleWrap = row.querySelector('.avl__blocked-vehicle');
    const reasonEl = row.querySelector('.avl__reason');
    expect(vehicleWrap).toBeTruthy();
    expect(reasonEl).toBeTruthy();
    expect(vehicleWrap?.querySelector('.avl__plate')?.textContent?.trim()).toBe('CDE-345');
    expect(vehicleWrap?.querySelector('.avl__model')?.textContent?.trim()).toBe('Vios');
    // 車牌在前、原因在後——DOM 順序即畫面上由左到右／由上到下的閱讀順序。
    if (vehicleWrap && reasonEl) {
      const position = vehicleWrap.compareDocumentPosition(reasonEl);
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    // 整列不是按鈕／連結，不可點擊、不可選。
    expect(row.tagName).toBe('LI');
    expect(row.querySelector('button, a')).toBeNull();
  });

  it('整段期間都沒有可租的車：寫「這段期間沒有可租的{車型}」，不能租清單預設展開', () => {
    const { el } = setup({
      vehicles: [
        makeVehicle({ id: 'v3', plateNumber: 'CDE-345', model: 'Vios' }),
        makeVehicle({ id: 'v4', plateNumber: 'DEF-456', model: 'Sienta', status: 'maintenance' }),
      ],
      inputs: { category: 'car' },
    });
    expect(el.querySelector('.avl__rows')).toBeNull();
    expect(text(el.querySelector('.avl__empty'))).toBe('這段期間沒有可租的汽車');
    expect(el.querySelector('.avl__blocked-toggle')?.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelectorAll('.avl__blocked-row')).toHaveLength(2);
  });

  it('租期還沒選齊：提示先選租期；還車不晚於取車：顯示時間錯誤', () => {
    const empty = setup({ inputs: { start: '', end: '' } });
    expect(text(empty.el.querySelector('.avl__placeholder'))).toBe(t.choosePeriodFirst);
    TestBed.resetTestingModule();

    const invalid = setup({ inputs: { start: END, end: START } });
    expect(text(invalid.el.querySelector('.avl__placeholder'))).toBe(ZH_TW.orderForm.problems.endBeforeStart);
    expect(invalid.el.querySelector('.avl__rows')).toBeNull();
  });
});

describe('AvailableVehicleListComponent 單選／按鈕模式', () => {
  it('單選模式：選中的列單選圈勾選、有框線；點別列（整列）回報那台車', () => {
    const { el, selected } = setup({ inputs: { selectable: true, selectedVehicleId: 'v1' } });
    const rows = el.querySelectorAll<HTMLLabelElement>('label.avl__row');
    const selectedRow = rowWith(rows, 'ABC-123');
    expect(selectedRow.classList).toContain('is-selected');
    expect((selectedRow.querySelector('input[type=radio]') as HTMLInputElement).checked).toBe(true);
    expect(el.querySelector('[role=radiogroup]')?.getAttribute('aria-label')).toBe('這段期間可租 5 台車');

    // 點列上的任何地方（這裡點車牌文字）都等於點單選圈
    const plate = rowWith(rows, 'BCD-234').querySelector('.avl__plate') as HTMLElement;
    plate.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(selected.map((v) => v.id)).toEqual(['v2']);
  });

  it('按鈕模式（總覽可用分頁）：沒有單選圈，整列是按鈕，點了回報那台車', () => {
    const { el, selected } = setup();
    expect(el.querySelector('input[type=radio]')).toBeNull();
    rowWith(el.querySelectorAll<HTMLButtonElement>('button.avl__row'), 'FGH-678').click();
    expect(selected.map((v) => v.id)).toEqual(['v6']);
  });
});
