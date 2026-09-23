import { describe, it, expect } from 'vitest';
import { isBookingFlowLocale, localeInfo, matchBrowserLocale } from './booking-flow-locale';

describe('matchBrowserLocale', () => {
  it('繁體標籤（zh-TW／zh-Hant／zh-HK）對應到繁中', () => {
    expect(matchBrowserLocale(['zh-TW'])).toBe('zh-TW');
    expect(matchBrowserLocale(['zh-Hant-TW'])).toBe('zh-TW');
    expect(matchBrowserLocale(['zh-HK'])).toBe('zh-TW');
  });

  it('英文與日文的各地區標籤對應到 en／ja', () => {
    expect(matchBrowserLocale(['en-GB'])).toBe('en');
    expect(matchBrowserLocale(['ja-JP'])).toBe('ja');
  });

  it('簡體中文不當成繁中，繼續往下找下一個偏好語言', () => {
    expect(matchBrowserLocale(['zh-CN', 'en-US'])).toBe('en');
    expect(matchBrowserLocale(['zh-Hans'])).toBeUndefined();
  });

  it('依偏好順序取第一個支援的語言；都不支援時回 undefined', () => {
    expect(matchBrowserLocale(['ko-KR', 'ja', 'en'])).toBe('ja');
    expect(matchBrowserLocale(['ko-KR', 'fr'])).toBeUndefined();
    expect(matchBrowserLocale([])).toBeUndefined();
  });
});

describe('localeInfo', () => {
  it('繁中的 html lang 標 Hant，避免被當成簡中', () => {
    expect(localeInfo('zh-TW').htmlLang).toBe('zh-Hant-TW');
  });

  it('isBookingFlowLocale 只接受支援的語言', () => {
    expect(isBookingFlowLocale('ja')).toBe(true);
    expect(isBookingFlowLocale('ko')).toBe(false);
    expect(isBookingFlowLocale(null)).toBe(false);
  });
});
