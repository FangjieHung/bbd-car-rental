/**
 * 官網支援的語言（待業主 #8 確認；目前暫定繁中、英文、日文）。
 * 後台（admin）只用繁中、走自己的 ZH_TW 字典，兩邊機制刻意分岔，這裡只管官網訂車流程。
 */
export type BookingFlowLocale = 'zh-TW' | 'en' | 'ja';

export const DEFAULT_BOOKING_FLOW_LOCALE: BookingFlowLocale = 'zh-TW';

export interface BookingFlowLocaleInfo {
  locale: BookingFlowLocale;
  /** 語言切換器上顯示的名稱，一律用該語言自己的寫法，不隨目前語言翻譯。 */
  nativeName: string;
  /** 給 Intl 與 Material DateAdapter 的 BCP 47 地區設定。 */
  intl: string;
  /** 寫進 `<html lang>` 的值（繁中要標 Hant，螢幕報讀與字型選擇才不會當成簡中）。 */
  htmlLang: string;
}

export const BOOKING_FLOW_LOCALES: readonly BookingFlowLocaleInfo[] = [
  { locale: 'zh-TW', nativeName: '繁體中文', intl: 'zh-TW', htmlLang: 'zh-Hant-TW' },
  { locale: 'en', nativeName: 'English', intl: 'en-US', htmlLang: 'en' },
  { locale: 'ja', nativeName: '日本語', intl: 'ja-JP', htmlLang: 'ja' },
];

export function localeInfo(locale: BookingFlowLocale): BookingFlowLocaleInfo {
  return BOOKING_FLOW_LOCALES.find((info) => info.locale === locale) ?? BOOKING_FLOW_LOCALES[0];
}

export function isBookingFlowLocale(value: unknown): value is BookingFlowLocale {
  return BOOKING_FLOW_LOCALES.some((info) => info.locale === value);
}

/**
 * 把瀏覽器語言標籤（navigator.languages）對應到支援的語言：
 * zh-TW／zh-Hant／zh-HK 這類繁體標籤 → zh-TW；en-* → en；ja-* → ja。
 * 簡體中文（zh-CN／zh-Hans）刻意不對應到繁中——與其給看不慣繁體的客人繁中，不如往下找下一個偏好語言。
 * 都對不上時回 undefined，由呼叫端決定預設值。
 */
export function matchBrowserLocale(tags: readonly string[]): BookingFlowLocale | undefined {
  for (const raw of tags) {
    const tag = raw.toLowerCase();
    if (tag === 'zh' || tag.startsWith('zh-tw') || tag.startsWith('zh-hant') || tag.startsWith('zh-hk') || tag.startsWith('zh-mo')) {
      return 'zh-TW';
    }
    if (tag === 'en' || tag.startsWith('en-')) return 'en';
    if (tag === 'ja' || tag.startsWith('ja-')) return 'ja';
  }
  return undefined;
}
