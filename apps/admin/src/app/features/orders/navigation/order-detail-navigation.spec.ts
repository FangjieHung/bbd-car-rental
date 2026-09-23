import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { OrderDetailNavigation } from './order-detail-navigation';
import { VISIBLE_ORDER_DETAIL_SECTIONS, parseOrderDetailSection } from './order-detail-sections';

@Component({ template: '' })
class BlankComponent {}

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: 'orders/:id', component: BlankComponent }])],
  });
  return { nav: TestBed.inject(OrderDetailNavigation), router: TestBed.inject(Router) };
}

describe('OrderDetailNavigation', () => {
  it('open() 沒帶分頁：導向 /orders/:id（總覽不帶 section 參數）', async () => {
    const { nav, router } = setup();
    await nav.open('b1');
    expect(router.url).toBe('/orders/b1');
  });

  it('open() 帶分頁：導向 /orders/:id?section=<分頁>', async () => {
    const { nav, router } = setup();
    await nav.open('b1', 'contract');
    expect(router.url).toBe('/orders/b1?section=contract');
  });

  it('open() 明確指定總覽時同樣不帶 section 參數', async () => {
    const { nav, router } = setup();
    await nav.open('b1', 'overview');
    expect(router.url).toBe('/orders/b1');
  });

  it('open() 指定目前隱藏的「文件」分頁：改開總覽（4.6，網址不帶不存在的分頁）', async () => {
    const { nav, router } = setup();
    await nav.open('b1', 'documents');
    expect(router.url).toBe('/orders/b1');
  });

  it('edit() 導向 /orders/:id?edit=1', async () => {
    const { nav, router } = setup();
    await nav.edit('b2');
    expect(router.url).toBe('/orders/b2?edit=1');
  });
});

describe('parseOrderDetailSection', () => {
  it('合法分頁原樣回傳；未知或空值回到總覽', () => {
    expect(parseOrderDetailSection('payments')).toBe('payments');
    expect(parseOrderDetailSection('nope')).toBe('overview');
    expect(parseOrderDetailSection(null)).toBe('overview');
  });

  it('「文件」分頁實作前先隱藏：section=documents 落回總覽', () => {
    expect(parseOrderDetailSection('documents')).toBe('overview');
    expect(VISIBLE_ORDER_DETAIL_SECTIONS).not.toContain('documents');
    expect(VISIBLE_ORDER_DETAIL_SECTIONS).toEqual(['overview', 'payments', 'contract', 'handover', 'cancellation', 'activity']);
  });
});
