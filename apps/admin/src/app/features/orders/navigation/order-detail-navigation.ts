import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_ORDER_DETAIL_SECTION, OrderDetailSection } from './order-detail-sections';

/** 進入編輯狀態的 query param（`/orders/:id?edit=1`）；詳情頁讀到後會把它從網址拿掉。 */
export const ORDER_DETAIL_EDIT_PARAM = 'edit';
export const ORDER_DETAIL_SECTION_PARAM = 'section';

/**
 * 前往訂單詳情頁的唯一入口。各呼叫端只說「哪一筆、哪個分頁」，網址格式集中在這裡：
 * `/orders/:id`（總覽）、`/orders/:id?section=contract`、`/orders/:id?edit=1`（直接進入編輯訂單）。
 */
@Injectable({ providedIn: 'root' })
export class OrderDetailNavigation {
  private readonly router = inject(Router);

  open(bookingId: string, section: OrderDetailSection = DEFAULT_ORDER_DETAIL_SECTION): Promise<boolean> {
    return this.router.navigate(
      ['/orders', bookingId],
      section === DEFAULT_ORDER_DETAIL_SECTION ? {} : { queryParams: { [ORDER_DETAIL_SECTION_PARAM]: section } },
    );
  }

  /** 開啟訂單詳情並直接進入總覽的編輯狀態。 */
  edit(bookingId: string): Promise<boolean> {
    return this.router.navigate(['/orders', bookingId], { queryParams: { [ORDER_DETAIL_EDIT_PARAM]: 1 } });
  }
}
