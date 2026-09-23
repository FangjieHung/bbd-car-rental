import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { BookingFlowError } from '../booking-flow-error';
import { BookingFlowI18n, provideBookingFlowI18n } from './booking-flow-i18n';
import { ZH_TW_MESSAGES } from './booking-flow-messages';
import { EN_MESSAGES } from './booking-flow-messages.en';

describe('BookingFlowI18n', () => {
  let i18n: BookingFlowI18n;

  beforeEach(() => {
    i18n = new BookingFlowI18n();
  });

  it('預設為繁中，沒有呼叫 provideBookingFlowI18n 的 app（admin、affiliate）維持原本畫面', () => {
    expect(i18n.locale()).toBe('zh-TW');
    expect(i18n.t()).toBe(ZH_TW_MESSAGES);
  });

  it('切換語言後 t() 立即換成該語言的文案', () => {
    i18n.setLocale('en');
    expect(i18n.t()).toBe(EN_MESSAGES);
    expect(i18n.t().search.title).toBe('Book a rental');
    i18n.setLocale('ja');
    expect(i18n.t().search.title).toBe('レンタカー予約');
  });

  describe('money', () => {
    it('新台幣一律用 NT$ 前綴並加千分位，負數把負號放在最前面', () => {
      expect(i18n.money(1200)).toBe('NT$1,200');
      expect(i18n.money(-300)).toBe('-NT$300');
      expect(i18n.money(0)).toBe('NT$0');
    });

    it('日圓用 ¥，其他幣別退回幣別代碼', () => {
      expect(i18n.money(5000, 'JPY')).toBe('¥5,000');
      expect(i18n.money(10, 'USD')).toBe('USD 10');
    });

    it('換語言不改變新台幣的寫法（避免 zh-TW 的 Intl 印成易混淆的 $）', () => {
      i18n.setLocale('en');
      expect(i18n.money(1200)).toBe('NT$1,200');
      i18n.setLocale('ja');
      expect(i18n.money(1200)).toBe('NT$1,200');
    });
  });

  describe('date', () => {
    it('YYYY-MM-DD 當作當地日期，不因時區往前跳一天', () => {
      expect(i18n.date('2026-09-01')).toBe('2026/09/01');
      expect(i18n.date('2026-09-01T00:30')).toBe('2026/09/01');
    });

    it('依語言排列年月日', () => {
      i18n.setLocale('en');
      expect(i18n.date('2026-09-22')).toBe('09/22/2026');
      i18n.setLocale('ja');
      expect(i18n.date('2026-09-22')).toBe('2026/09/22');
    });

    it('空值或無法解讀的字串回空字串', () => {
      expect(i18n.date('')).toBe('');
      expect(i18n.date(null)).toBe('');
      expect(i18n.date('not-a-date')).toBe('');
    });
  });

  it('month 依語言產生月曆標題', () => {
    const september = new Date(2026, 8, 1);
    expect(i18n.month(september)).toBe('2026年9月');
    i18n.setLocale('en');
    expect(i18n.month(september)).toBe('September 2026');
    i18n.setLocale('ja');
    expect(i18n.month(september)).toBe('2026年9月');
  });

  describe('errorMessage', () => {
    it('BookingFlowError 依代碼顯示目前語言的文案', () => {
      const err = new BookingFlowError('vehicle_unavailable', '車輛已被預約');
      expect(i18n.errorMessage(err, 'fallback')).toBe('車輛已被預約');
      i18n.setLocale('en');
      expect(i18n.errorMessage(err, 'fallback')).toBe(EN_MESSAGES.errors.vehicle_unavailable);
    });

    it('其他例外不把技術訊息丟給客人，顯示呼叫端給的通用訊息', () => {
      expect(i18n.errorMessage(new Error('TypeError: x is undefined'), '送出失敗')).toBe('送出失敗');
      expect(i18n.errorMessage('boom', '送出失敗')).toBe('送出失敗');
    });
  });

  it('英文字典不殘留中日文字（抓漏翻或貼錯語言）', () => {
    const texts: string[] = [];
    const collect = (value: unknown): void => {
      if (typeof value === 'string') texts.push(value);
      else if (typeof value === 'function') texts.push(String((value as (...a: unknown[]) => string)('X', 'Y', 'Z', 1)));
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(EN_MESSAGES);
    expect(texts.filter((text) => /[぀-ヿ一-鿿]/.test(text))).toEqual([]);
  });
});

describe('provideBookingFlowI18n', () => {
  const STORAGE_KEY = 'cr.bookingLocale';
  let originalLanguages: PropertyDescriptor | undefined;

  function setBrowserLanguages(languages: string[]): void {
    Object.defineProperty(navigator, 'languages', { value: languages, configurable: true });
  }

  function setup(): { i18n: BookingFlowI18n; document: Document; adapter: DateAdapter<Date> } {
    TestBed.configureTestingModule({ providers: [provideNativeDateAdapter(), provideBookingFlowI18n()] });
    const i18n = TestBed.inject(BookingFlowI18n);
    TestBed.tick();
    return { i18n, document: TestBed.inject(DOCUMENT), adapter: TestBed.inject(DateAdapter) };
  }

  beforeEach(() => {
    localStorage.clear();
    originalLanguages = Object.getOwnPropertyDescriptor(navigator, 'languages');
  });

  afterEach(() => {
    if (originalLanguages) Object.defineProperty(navigator, 'languages', originalLanguages);
    else delete (navigator as unknown as Record<string, unknown>)['languages'];
    localStorage.clear();
  });

  it('沒有記錄時依瀏覽器偏好語言決定初始語言', () => {
    setBrowserLanguages(['ja-JP', 'en']);
    const { i18n } = setup();
    expect(i18n.locale()).toBe('ja');
  });

  it('客人上次選過的語言優先於瀏覽器語言', () => {
    setBrowserLanguages(['ja-JP']);
    localStorage.setItem(STORAGE_KEY, 'en');
    const { i18n } = setup();
    expect(i18n.locale()).toBe('en');
  });

  it('瀏覽器語言都不支援、也沒有記錄時用繁中', () => {
    setBrowserLanguages(['ko-KR']);
    const { i18n } = setup();
    expect(i18n.locale()).toBe('zh-TW');
  });

  it('切換語言會同步 <html lang>、月曆地區設定，並記住選擇', () => {
    setBrowserLanguages(['zh-TW']);
    const { i18n, document, adapter } = setup();
    const setLocaleSpy = vi.spyOn(adapter, 'setLocale');

    i18n.setLocale('ja');
    TestBed.tick();

    expect(document.documentElement.lang).toBe('ja');
    expect(setLocaleSpy).toHaveBeenCalledWith('ja-JP');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('ja');
  });
});
