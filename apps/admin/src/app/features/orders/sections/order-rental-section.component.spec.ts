import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { RentalOrder, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import {
  OrderForm,
  OrderFormInitial,
  connectOrderFormBehaviors,
  createOrderForm,
  orderFormInitialFromOrder,
  ORDER_FORM_DATA,
  OrderFormContext,
} from '@car-rental/order-form';
import { orderInitialFromQuery } from '../pages/order-create-page.component';
import { createOrderRepos, makeVehicle } from '../testing';
import { OrderRentalSectionComponent } from './order-rental-section.component';

const t = ZH_TW.rentalSearch;
const iso = (local: string) => new Date(local).toISOString();

const VEHICLES: Vehicle[] = [
  makeVehicle({ id: 'v1', plateNumber: 'ABC-123', model: 'Altis', branchId: 'mzg-airport' }),
  makeVehicle({ id: 'v2', plateNumber: 'BCD-234', model: 'Yaris', branchId: 'mzg-port' }),
  makeVehicle({ id: 'v3', plateNumber: 'CDE-345', model: 'Sienta', branchId: 'mzg-store', status: 'maintenance' }),
  makeVehicle({ id: 'v4', plateNumber: 'DEF-456', model: '勁戰', category: 'scooter', branchId: 'mzg-airport' }),
];

function order(partial: Partial<RentalOrder>): RentalOrder {
  return {
    id: 'b1',
    vehicleId: 'v2',
    memberId: 'm1',
    startTime: iso('2026-10-05T09:00'),
    endTime: iso('2026-10-07T09:00'),
    pickupBranchId: 'mzg-port',
    returnBranchId: 'mzg-port',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  };
}

interface SetupOptions {
  initial?: OrderFormInitial;
  /** 以 /orders/new 的網址參數預填（走建立訂單頁同一個 orderInitialFromQuery）。 */
  query?: Record<string, string>;
  orders?: RentalOrder[];
  context?: OrderFormContext;
}

function setup(options: SetupOptions = {}) {
  const repos = createOrderRepos({ vehicles: VEHICLES, orders: options.orders ?? [] });
  TestBed.configureTestingModule({
    providers: [...repos.providers, { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData }],
  });
  const data = TestBed.inject(ORDER_FORM_DATA);
  const initial = options.query
    ? orderInitialFromQuery(convertToParamMap(options.query), data.vehicles())
    : (options.initial ?? {});
  const form: OrderForm = createOrderForm(initial);
  // 與建立訂單頁／訂單詳情相同：頁面負責接上欄位連動（選車預帶取車據點、還車據點跟隨取車據點）。
  connectOrderFormBehaviors(form, data, { autoDeposit: !options.context?.editingBookingId });

  const fixture = TestBed.createComponent(OrderRentalSectionComponent);
  fixture.componentRef.setInput('form', form);
  if (options.context) fixture.componentRef.setInput('context', options.context);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, form, el, component: fixture.componentInstance, rental: () => form.getRawValue().rental };
}

const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
/** 清單上目前勾選的那一列的車牌（沒有勾選時為 undefined）。 */
const checkedPlate = (el: HTMLElement) => {
  const row = Array.from(el.querySelectorAll('label.avl__row')).find(
    (r) => (r.querySelector('input[type=radio]') as HTMLInputElement).checked,
  );
  return row ? text(row.querySelector('.avl__plate')) : undefined;
};
const notice = (el: HTMLElement) => text(el.querySelector('.rental-search__set-aside')) || undefined;

describe('OrderRentalSectionComponent 搜尋列 → 表單欄位', () => {
  it('新增訂單、沒有預填：時間預設 09:00，清單提示先選租期，表單沒有被改動', () => {
    const { component, el, form } = setup();
    expect(component['startTime']()).toBe('09:00');
    expect(component['endTime']()).toBe('09:00');
    expect(text(el.querySelector('.avl__placeholder'))).toBe(t.choosePeriodFirst);
    expect(form.dirty).toBe(false);
    // 選完即時更新，沒有搜尋鈕
    expect(Array.from(el.querySelectorAll('button')).some((b) => text(b).includes(ZH_TW.common.search))).toBe(false);
  });

  it('選日期區間：日期＋時間組回 startLocal／endLocal（YYYY-MM-DDTHH:mm），清單立即列出', () => {
    const { component, el, fixture, form, rental } = setup();
    component['onRangeSelected']({ start: new Date(2026, 9, 5), end: new Date(2026, 9, 7) });
    fixture.detectChanges();

    expect(rental()).toMatchObject({ startLocal: '2026-10-05T09:00', endLocal: '2026-10-07T09:00' });
    expect(form.controls.rental.controls.startLocal.dirty).toBe(true);
    expect(el.querySelector('.avl__rows')).not.toBeNull();
  });

  it('改取車／還車時間只換時間；重選日期時沿用已選的時間', () => {
    const { component, fixture, rental } = setup();
    component['onRangeSelected']({ start: new Date(2026, 9, 5), end: new Date(2026, 9, 7) });
    component['onStartTimeChange']('10:30');
    component['onEndTimeChange']('18:00');
    fixture.detectChanges();
    expect(rental()).toMatchObject({ startLocal: '2026-10-05T10:30', endLocal: '2026-10-07T18:00' });

    component['onRangeSelected']({ start: new Date(2026, 9, 12), end: new Date(2026, 9, 13) });
    expect(rental()).toMatchObject({ startLocal: '2026-10-12T10:30', endLocal: '2026-10-13T18:00' });
  });

  it('還沒選日期前先選時間：先記住，選了日期時一起寫入', () => {
    const { component, rental } = setup();
    component['onStartTimeChange']('07:00');
    expect(rental().startLocal).toBe('');
    component['onRangeSelected']({ start: new Date(2026, 9, 5), end: new Date(2026, 9, 6) });
    expect(rental()).toMatchObject({ startLocal: '2026-10-05T07:00', endLocal: '2026-10-06T09:00' });
  });

  it('既有時間不在 30 分鐘時段上（例如 10:15）：選單照樣列出並選中它', () => {
    const { component } = setup({
      initial: { startTime: iso('2026-10-05T10:15'), endTime: iso('2026-10-07T09:00') },
    });
    expect(component['startTime']()).toBe('10:15');
    expect(component['startTimeOptions']()).toContain('10:15');
  });
});

describe('OrderRentalSectionComponent 網址帶入 vehicleId／start／end', () => {
  const query = (vehicleId: string) => ({
    vehicleId,
    start: iso('2026-10-05T10:00'),
    end: iso('2026-10-07T10:00'),
  });

  it('那台車可以租：搜尋列顯示預填的日期時間，清單上預選該車、沒有提示，表單不算改動', async () => {
    const { el, fixture, form, rental } = setup({ query: query('v1') });
    // mat-select 在下一個 microtask 才依 value 選出選項、更新觸發區文字。
    await fixture.whenStable();
    fixture.detectChanges();
    const range = el.querySelector('lib-dual-month-range-picker input') as HTMLInputElement;
    expect(range.value).toBe('2026/10/05 - 2026/10/07');
    expect(text(el.querySelector('.rental-search__start-time'))).toBe('10:00');
    expect(text(el.querySelector('.rental-search__end-time'))).toBe('10:00');
    expect(checkedPlate(el)).toBe('ABC-123');
    expect(notice(el)).toBeUndefined();
    expect(rental().vehicleId).toBe('v1');
    expect(form.dirty).toBe(false);
  });

  it('那台車這段期間已被訂走：取消選取，清單上方提示「原本選的 {車牌} 這段期間不能租」', () => {
    const { el, form, rental } = setup({ query: query('v2'), orders: [order({})] });
    expect(notice(el)).toBe('原本選的 BCD-234 這段期間不能租');
    expect(rental().vehicleId).toBe('');
    expect(checkedPlate(el)).toBeUndefined();
    expect(form.dirty).toBe(false);
  });

  it('保養中的車同樣提示不能租', () => {
    const { el, rental } = setup({ query: query('v3') });
    expect(notice(el)).toBe('原本選的 CDE-345 這段期間不能租');
    expect(rental().vehicleId).toBe('');
  });

  it('改到那台車可以租的日期：自動選回、提示消失', () => {
    const { component, el, fixture, rental } = setup({ query: query('v2'), orders: [order({})] });
    component['onRangeSelected']({ start: new Date(2026, 9, 10), end: new Date(2026, 9, 12) });
    fixture.detectChanges();
    expect(rental().vehicleId).toBe('v2');
    expect(notice(el)).toBeUndefined();
    expect(checkedPlate(el)).toBe('BCD-234');
  });
});

describe('OrderRentalSectionComponent 選車', () => {
  const period = { startTime: iso('2026-10-05T09:00'), endTime: iso('2026-10-07T09:00') };

  it('點清單上的車：寫入 vehicleId；取車據點還空著時預帶該車所在據點，還車據點跟著', () => {
    const { el, fixture, form, rental } = setup({ initial: period });
    const row = Array.from(el.querySelectorAll<HTMLElement>('label.avl__row')).find((r) => text(r).includes('BCD-234'));
    row?.click();
    fixture.detectChanges();

    expect(rental()).toMatchObject({ vehicleId: 'v2', pickupBranchId: 'mzg-port', returnBranchId: 'mzg-port' });
    expect(form.controls.rental.controls.vehicleId.dirty).toBe(true);
    expect(checkedPlate(el)).toBe('BCD-234');
  });

  it('取車據點已經手動選過：選車不覆蓋，清單標出需調度路線', () => {
    const { component, el, fixture, form, rental } = setup({ initial: period });
    const pickup = form.controls.rental.controls.pickupBranchId;
    pickup.setValue('mzg-port');
    pickup.markAsDirty();
    fixture.detectChanges();

    component['pickVehicle'](VEHICLES[0]);
    fixture.detectChanges();

    expect(rental()).toMatchObject({ vehicleId: 'v1', pickupBranchId: 'mzg-port' });
    const selectedRow = el.querySelector('label.avl__row.is-selected');
    expect(text(selectedRow?.querySelector('.ui-chip--warning') ?? null)).toBe('需調度 馬公機場櫃檯→馬公港櫃檯');
  });

  it('車型篩選掉已選的車：先放下選取（不提示），篩選改回來後自動選回', () => {
    const { component, el, fixture, rental } = setup({ initial: { ...period, vehicleId: 'v1' } });
    component['category'].set('scooter');
    fixture.detectChanges();
    expect(rental().vehicleId).toBe('');
    expect(notice(el)).toBeUndefined();

    component['category'].set('');
    fixture.detectChanges();
    expect(rental().vehicleId).toBe('v1');
  });
});

describe('OrderRentalSectionComponent 編輯訂單（訂單詳情）', () => {
  const own = order({ id: 'own', vehicleId: 'v1', pickupBranchId: 'mzg-airport', returnBranchId: 'mzg-airport' });
  const other = order({ id: 'other', vehicleId: 'v1', startTime: iso('2026-10-10T09:00'), endTime: iso('2026-10-12T09:00') });

  it('排除這筆訂單自己：自己的車照樣列為可租並維持選取，不會顯示成已預訂', () => {
    const { el, rental } = setup({
      initial: orderFormInitialFromOrder(own),
      orders: [own, other],
      context: { editingBookingId: 'own' },
    });
    expect(checkedPlate(el)).toBe('ABC-123');
    expect(notice(el)).toBeUndefined();
    expect(rental().vehicleId).toBe('v1');
  });

  it('改租期撞到別筆訂單：提示原本選的車不能租，但不自動換掉訂單上的車（儲存時由衝突檢查把關）', () => {
    const { component, el, fixture, rental } = setup({
      initial: orderFormInitialFromOrder(own),
      orders: [own, other],
      context: { editingBookingId: 'own' },
    });
    component['onRangeSelected']({ start: new Date(2026, 9, 9), end: new Date(2026, 9, 11) });
    fixture.detectChanges();

    expect(notice(el)).toBe('原本選的 ABC-123 這段期間不能租');
    expect(rental().vehicleId).toBe('v1');
    expect(component['derived'].conflicts().map((b) => b.id)).toEqual(['other']);
  });
});
