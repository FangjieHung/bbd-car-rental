import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AddOn, InsurancePlan } from '@car-rental/domain';
import {
  OrderFormLabels,
  ORDER_FORM_DATA,
  NO_INSURANCE_VALUE,
  OrderForm,
  computeOrderQuote,
  createOrderForm,
  OrderPricingSectionComponent,
  ORDER_FORM_LABELS,
} from '@car-rental/order-form';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import { createOrderRepos, makeVehicle } from '../testing';
import { ADMIN_ORDER_FORM_LABELS } from '../data/provide-admin-order-form';

const t = ADMIN_ORDER_FORM_LABELS;

const s = t.orderSummary;

const coverage = (min: number, max: number) => [
  { name: '租車自負額', deductibleMin: min, deductibleMax: max, currency: 'TWD' },
  { name: '第三人責任險', deductibleMin: min, deductibleMax: max, currency: 'TWD' },
];
const PLANS: InsurancePlan[] = [
  { id: 'basic', name: '基本保障', dailyPriceFrom: 200, tags: [], coverageItems: coverage(30000, 60000) },
  { id: 'standard', name: '安心保障', dailyPriceFrom: 400, tags: [], coverageItems: coverage(10000, 10000) },
  { id: 'full', name: '全額保障', dailyPriceFrom: 600, tags: [], coverageItems: coverage(0, 0) },
];
const ADD_ONS: AddOn[] = [
  { id: 'raincoat', name: '雨衣', unitPrice: 50, unit: 'per_rental' },
  { id: 'child-seat', name: '兒童安全座椅', unitPrice: 100, unit: 'per_day' },
];

/** 車 v1、Jan 5 09:00 → Jan 7 09:00：2 天 × 1000/日＝租金 2000。 */
function setup(options: { showQuote?: boolean; withVehicle?: boolean } = {}) {
  const repos = createOrderRepos({ vehicles: [makeVehicle({ id: 'v1', insurancePlans: PLANS })], addOns: ADD_ONS });
  TestBed.configureTestingModule({
    providers: [...repos.providers, { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData }, { provide: ORDER_FORM_LABELS, useValue: ADMIN_ORDER_FORM_LABELS }],
  });
  const form: OrderForm = createOrderForm({
    ...(options.withVehicle === false ? {} : { vehicleId: 'v1' }),
    startTime: new Date('2026-01-05T09:00').toISOString(),
    endTime: new Date('2026-01-07T09:00').toISOString(),
    pickupBranchId: 'mzg-airport',
    returnBranchId: 'mzg-airport',
  });
  const fixture = TestBed.createComponent(OrderPricingSectionComponent);
  fixture.componentRef.setInput('form', form);
  if (options.showQuote !== undefined) fixture.componentRef.setInput('showQuote', options.showQuote);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const quote = () => computeOrderQuote(form.getRawValue(), TestBed.inject(ORDER_FORM_DATA));
  return { fixture, form, el, quote, component: fixture.componentInstance };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

function insuranceRows(el: HTMLElement): HTMLTableRowElement[] {
  return Array.from(el.querySelectorAll('.pricing-table--insurance tbody tr'));
}

function addOnRow(el: HTMLElement, name: string): HTMLTableRowElement {
  const row = Array.from(el.querySelectorAll<HTMLTableRowElement>('.pricing-table--add-ons tbody tr')).find((r) =>
    text(r.querySelector('th')).includes(name),
  );
  if (!row) throw new Error(`找不到配件列：${name}`);
  return row;
}

describe('OrderPricingSectionComponent 報價明細的顯示開關（showQuote）', () => {
  it('預設顯示報價明細（訂單詳情的「編輯」沒有摘要欄，仍需要這份清單）', () => {
    const { el } = setup();
    const dl = el.querySelector('.order-section__dl');
    expect(dl).not.toBeNull();
    expect(text(dl)).toContain(t.orderForm.quoteTotal);
    expect(text(dl)).toContain('NT$2,000');
  });

  it('showQuote=false（建立訂單頁）不列報價明細，保險與配件表格照常顯示', () => {
    const { el } = setup({ showQuote: false });
    expect(el.querySelector('.order-section__dl')).toBeNull();
    expect(el.querySelector('.pricing-table--insurance')).not.toBeNull();
    expect(el.querySelector('.pricing-table--add-ons')).not.toBeNull();
  });
});

describe('OrderPricingSectionComponent 保險方案表格（2.4）', () => {
  it('列出「不加保」＋該車的各級方案；欄位為方案｜事故自負額｜每日｜{天數} 天小計', () => {
    const { el } = setup();
    const headers = Array.from(el.querySelectorAll('.pricing-table--insurance thead th')).map((th) => text(th));
    expect(headers.slice(1)).toEqual([
      s.insuranceTable.plan,
      s.insuranceTable.deductible,
      s.insuranceTable.daily,
      `2${s.insuranceTable.subtotalDaysSuffix}`,
    ]);

    const rows = insuranceRows(el).map((r) => Array.from(r.querySelectorAll('td')).slice(1).map((td) => text(td)));
    expect(rows).toEqual([
      [t.orderForm.insuranceNone, '—', 'NT$0', 'NT$0'],
      ['基本保障', 'NT$30,000–NT$60,000', 'NT$200', 'NT$400'],
      ['安心保障', 'NT$10,000', 'NT$400', 'NT$800'],
      ['全額保障', 'NT$0', 'NT$600', 'NT$1,200'],
    ]);
  });

  it('預設選「不加保」；點整列就選那個方案，報價的保險小計跟著變', () => {
    const { el, form, fixture, quote } = setup();
    expect(insuranceRows(el)[0].classList.contains('is-selected')).toBe(true);
    expect(quote()?.insuranceSubtotal).toBe(0);

    insuranceRows(el)[2].click(); // 安心保障
    fixture.detectChanges();

    expect(form.getRawValue().pricing.insurancePlanId).toBe('standard');
    expect(form.controls.pricing.controls.insurancePlanId.dirty).toBe(true);
    expect(insuranceRows(el)[2].classList.contains('is-selected')).toBe(true);
    expect(quote()?.insuranceSubtotal).toBe(800);
    expect(quote()?.total).toBe(2800);
    // 報價明細（showQuote 預設開）同步更新
    expect(text(el.querySelector('.order-section__dl'))).toContain('NT$2,800');

    insuranceRows(el)[0].click(); // 改回不加保
    fixture.detectChanges();
    expect(form.getRawValue().pricing.insurancePlanId).toBe(NO_INSURANCE_VALUE);
    expect(quote()?.total).toBe(2000);
  });

  it('還沒選車：沒有可選的方案，不顯示保險表格', () => {
    const { el } = setup({ withVehicle: false });
    expect(el.querySelector('.pricing-table--insurance')).toBeNull();
  });
});

describe('OrderPricingSectionComponent 加購配件表格（2.4）', () => {
  it('單價依計價單位寫「／次」或「／日」', () => {
    const { el } = setup();
    expect(text(addOnRow(el, '雨衣').querySelectorAll('td')[0])).toBe(`NT$50${s.addOnTable.unitSuffix['per_rental']}`);
    expect(text(addOnRow(el, '兒童安全座椅').querySelectorAll('td')[0])).toBe(
      `NT$100${s.addOnTable.unitSuffix['per_day']}`,
    );
  });

  it('數量步進器：＋ 加一、− 減一；數量 0 時 − 停用，不會小於 0', () => {
    const { el, form, fixture, component } = setup();
    const row = () => addOnRow(el, '雨衣');
    const qty = () => text(row().querySelector('.qty-stepper__value'));
    const decrease = () => row().querySelector('.qty-stepper__decrease') as HTMLButtonElement;
    const increase = () => row().querySelector('.qty-stepper__increase') as HTMLButtonElement;

    expect(qty()).toBe('0');
    expect(decrease().disabled).toBe(true);

    increase().click();
    increase().click();
    fixture.detectChanges();
    expect(qty()).toBe('2');
    expect(form.getRawValue().pricing.addOnQty['raincoat']).toBe(2);
    expect(decrease().disabled).toBe(false);

    decrease().click();
    decrease().click();
    fixture.detectChanges();
    expect(qty()).toBe('0');
    expect(decrease().disabled).toBe(true);

    // 就算繞過停用的按鈕直接呼叫，也不會變成負數
    component['stepAddOn']('raincoat', -1);
    fixture.detectChanges();
    expect(form.getRawValue().pricing.addOnQty['raincoat']).toBe(0);
    expect(qty()).toBe('0');
  });

  it('小計取自報價：按次＝單價×數量、按日＝單價×數量×天數；最後一列是配件小計', () => {
    const { el, fixture, quote } = setup();
    (addOnRow(el, '雨衣').querySelector('.qty-stepper__increase') as HTMLButtonElement).click();
    const seatPlus = addOnRow(el, '兒童安全座椅').querySelector('.qty-stepper__increase') as HTMLButtonElement;
    seatPlus.click();
    seatPlus.click();
    fixture.detectChanges();

    expect(text(addOnRow(el, '雨衣').querySelector('.pricing-table__subtotal'))).toBe('NT$50');
    expect(text(addOnRow(el, '兒童安全座椅').querySelector('.pricing-table__subtotal'))).toBe('NT$400'); // 100 × 2 × 2 天
    expect(text(el.querySelector('.pricing-table__total'))).toBe('NT$450');
    expect(quote()?.addOnSubtotal).toBe(450);
    expect(text(el.querySelector('.pricing-table--add-ons tfoot th'))).toBe(s.addOnTable.total);
  });

  it('還試算不出報價（沒選車）時，小計與配件小計顯示「—」，步進器照常可用', () => {
    const { el, fixture, form } = setup({ withVehicle: false });
    (addOnRow(el, '雨衣').querySelector('.qty-stepper__increase') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(form.getRawValue().pricing.addOnQty['raincoat']).toBe(1);
    expect(text(addOnRow(el, '雨衣').querySelector('.pricing-table__subtotal'))).toBe('—');
    expect(text(el.querySelector('.pricing-table__total'))).toBe('—');
  });
});
