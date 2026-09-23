import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_ORDER_DETAIL_SECTION, OrderDetailSection, isVisibleOrderDetailSection } from './order-detail-sections';

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

  /** 目前隱藏的分頁（「文件」，見 VISIBLE_ORDER_DETAIL_SECTIONS）改開總覽，網址不帶一個不存在的分頁。 */
  open(bookingId: string, section: OrderDetailSection = DEFAULT_ORDER_DETAIL_SECTION): Promise<boolean> {
    const target = isVisibleOrderDetailSection(section) ? section : DEFAULT_ORDER_DETAIL_SECTION;
    return this.router.navigate(
      ['/orders', bookingId],
      target === DEFAULT_ORDER_DETAIL_SECTION ? {} : { queryParams: { [ORDER_DETAIL_SECTION_PARAM]: target } },
    );
  }

  /** 開啟訂單詳情並直接進入總覽的編輯狀態。 */
  edit(bookingId: string): Promise<boolean> {
    return this.router.navigate(['/orders', bookingId], { queryParams: { [ORDER_DETAIL_EDIT_PARAM]: 1 } });
  }
}
