import {
  DOCUMENT,
  EnvironmentProviders,
  Injectable,
  Injector,
  computed,
  effect,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
} from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { BookingFlowError } from '../booking-flow-error';
import {
  BookingFlowLocale,
  DEFAULT_BOOKING_FLOW_LOCALE,
  isBookingFlowLocale,
  localeInfo,
  matchBrowserLocale,
} from './booking-flow-locale';
import { BookingFlowMessages, ZH_TW_MESSAGES } from './booking-flow-messages';
import { EN_MESSAGES } from './booking-flow-messages.en';
import { JA_MESSAGES } from './booking-flow-messages.ja';

const MESSAGES: Record<BookingFlowLocale, BookingFlowMessages> = {
  'zh-TW': ZH_TW_MESSAGES,
  en: EN_MESSAGES,
  ja: JA_MESSAGES,
};

/** 金額前綴。新台幣沿用在地習慣的 NT$（Intl 的 zh-TW 會印成容易跟美元混淆的 $）。 */
const CURRENCY_PREFIX: Record<string, string> = { TWD: 'NT$', JPY: '¥' };

/** `YYYY-MM-DD`（可帶時間）當作當地日期解讀；直接 `new Date('2026-09-22')` 會被當成 UTC 午夜，在 UTC 以西會變前一天。 */
function toLocalDate(value: string | Date): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * 官網訂車流程的語言狀態、文案與格式化。
 *
 * 預設固定繁中且不做任何偵測或保存——admin 與 affiliate 也會用到 booking-flow 的元件，
 * 它們不呼叫 provideBookingFlowI18n()，畫面就維持原本的繁中。只有官網 app 啟用語言偵測與切換。
 *
 * 語言是 signal：元件在模板裡讀 `i18n.t()`、在 computed 裡讀也會跟著重算，切換語言不必重新整理頁面。
 * 這裡刻意不用 inject()，讓 spec 直接 `new Component()` 時也能拿到可用的實例（見 injectBookingFlowI18n）。
 */
@Injectable({ providedIn: 'root' })
export class BookingFlowI18n {
  private readonly _locale = signal<BookingFlowLocale>(DEFAULT_BOOKING_FLOW_LOCALE);
  readonly locale = this._locale.asReadonly();

  /** 目前語言的全部文案。 */
  readonly t = computed<BookingFlowMessages>(() => MESSAGES[this._locale()]);

  private readonly intlLocale = computed(() => localeInfo(this._locale()).intl);
  private readonly numberFormat = computed(
    () => new Intl.NumberFormat(this.intlLocale(), { maximumFractionDigits: 0 }),
  );
  private readonly dateFormat = computed(
    () => new Intl.DateTimeFormat(this.intlLocale(), { year: 'numeric', month: '2-digit', day: '2-digit' }),
  );
  private readonly monthFormat = computed(
    () => new Intl.DateTimeFormat(this.intlLocale(), { year: 'numeric', month: 'long' }),
  );

  setLocale(locale: BookingFlowLocale): void {
    this._locale.set(locale);
  }

  /** 金額：`NT$1,200`、負數 `-NT$300`。千分位依語言；不帶小數（新台幣與日圓都沒有輔幣實務）。 */
  money(amount: number, currency = 'TWD'): string {
    const prefix = CURRENCY_PREFIX[currency] ?? `${currency} `;
    const sign = amount < 0 ? '-' : '';
    return `${sign}${prefix}${this.numberFormat().format(Math.abs(amount))}`;
  }

  /** 日期（不含時間）：繁中／日文 `2026/09/22`，英文 `09/22/2026`。無法解讀時回空字串。 */
  date(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = toLocalDate(value);
    return date ? this.dateFormat().format(date) : '';
  }

  /** 月曆標題：繁中／日文 `2026年9月`，英文 `September 2026`。 */
  month(value: Date): string {
    return this.monthFormat().format(value);
  }

  /**
   * 把例外轉成要顯示給客人的訊息：BookingFlowError 依代碼查目前語言的文案；
   * 其他錯誤（未預期的程式錯誤）不把技術訊息丟給客人，一律顯示呼叫端給的通用訊息。
   */
  errorMessage(err: unknown, fallback: string): string {
    return err instanceof BookingFlowError ? this.t().errors[err.code] : fallback;
  }
}

let fallbackInstance: BookingFlowI18n | undefined;

/**
 * 元件取得 BookingFlowI18n 的共用入口。既有 spec 以 `new Component()` 直接建立元件（沒有 injection
 * context），這時 inject() 會丟 NG0203——接住它、改用一個固定繁中的共用實例，畫面行為與 DI 建立時一致。
 */
export function injectBookingFlowI18n(): BookingFlowI18n {
  try {
    return inject(BookingFlowI18n);
  } catch {
    fallbackInstance ??= new BookingFlowI18n();
    return fallbackInstance;
  }
}

export interface BookingFlowI18nOptions {
  /** 記住客人選擇的 localStorage key；預設 `cr.bookingLocale`。 */
  storageKey?: string;
}

function readStoredLocale(key: string): BookingFlowLocale | undefined {
  try {
    const stored = localStorage.getItem(key);
    return isBookingFlowLocale(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredLocale(key: string, locale: BookingFlowLocale): void {
  try {
    localStorage.setItem(key, locale);
  } catch {
    // 無痕模式或儲存空間被封鎖時記不住選擇，不影響當下的顯示。
  }
}

/**
 * 官網 app 專用：啟用語言偵測、記住客人的選擇，並把語言同步到 `<html lang>` 與 Material 的
 * DateAdapter（月曆的星期標題、時間選擇器的上午／下午格式）。
 *
 * 初始語言：先看客人上次選的，再看瀏覽器偏好語言，都沒有就用繁中。
 */
export function provideBookingFlowI18n(options: BookingFlowI18nOptions = {}): EnvironmentProviders {
  const storageKey = options.storageKey ?? 'cr.bookingLocale';
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const i18n = inject(BookingFlowI18n);
      const document = inject(DOCUMENT);
      const dateAdapter = inject(DateAdapter, { optional: true });
      const browserTags = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language]);

      i18n.setLocale(
        readStoredLocale(storageKey) ?? matchBrowserLocale(browserTags) ?? DEFAULT_BOOKING_FLOW_LOCALE,
      );

      effect(
        () => {
          const locale = i18n.locale();
          const info = localeInfo(locale);
          document.documentElement.lang = info.htmlLang;
          dateAdapter?.setLocale(info.intl);
          writeStoredLocale(storageKey, locale);
        },
        { injector: inject(Injector) },
      );
    }),
  ]);
}
