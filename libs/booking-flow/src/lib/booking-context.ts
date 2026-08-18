import { InjectionToken, Provider, Signal, computed, signal } from '@angular/core';
import { Partner } from '@car-rental/domain';

/**
 * 預約流程的執行情境。頁面元件靠它決定要不要顯示夥伴折扣／banner，
 * 以及導頁時該加什麼路徑前綴 —— 因此同一組頁面能同時服務 consumer 與夥伴入口。
 */
export interface BookingContext {
  /** consumer 情境恆為 null */
  readonly partner: Signal<Partner | null>;
  /** router.navigate 的路徑前綴：['/'] 或 ['/p', slug] */
  readonly basePath: Signal<string[]>;
}

const CONSUMER_CONTEXT: BookingContext = {
  partner: signal(null),
  basePath: signal(['/']),
};

export const BOOKING_CONTEXT = new InjectionToken<BookingContext>('BOOKING_CONTEXT', {
  providedIn: 'root',
  factory: () => CONSUMER_CONTEXT,
});

/**
 * 組出夥伴情境。shell 元件的 useFactory 直接呼叫這支 ——
 * 它需要的是 BookingContext 物件本身，不是 Provider。
 */
export function createPartnerBookingContext(
  partner: Signal<Partner | null>,
  slug: Signal<string>,
): BookingContext {
  return {
    partner,
    basePath: computed(() => ['/p', slug()]),
  };
}

/** 測試與非路由情境使用；shell 元件請改用 createPartnerBookingContext */
export function providePartnerBookingContext(
  partner: Signal<Partner | null>,
  slug: Signal<string>,
): Provider {
  return { provide: BOOKING_CONTEXT, useValue: createPartnerBookingContext(partner, slug) };
}
