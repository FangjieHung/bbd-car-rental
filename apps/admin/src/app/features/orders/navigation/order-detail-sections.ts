/**
 * 訂單詳情（`/orders/:id`）的七個分頁。網址以 `?section=<分頁>` 表示，沒帶就是總覽。
 * 刻意放在頁面元件之外：各入口（訂單列表、行事曆、甘特圖）只需要分頁名稱與導頁，
 * 不應因此把詳情頁本身拉進它們的 chunk。
 */
export const ORDER_DETAIL_SECTIONS = [
  'overview',
  'documents',
  'payments',
  'contract',
  'handover',
  'cancellation',
  'activity',
] as const;

export type OrderDetailSection = (typeof ORDER_DETAIL_SECTIONS)[number];

export const DEFAULT_ORDER_DETAIL_SECTION: OrderDetailSection = 'overview';

/** 網址上的分頁參數；未知或空值一律回到總覽。 */
export function parseOrderDetailSection(raw: string | null | undefined): OrderDetailSection {
  return (ORDER_DETAIL_SECTIONS as readonly string[]).includes(raw ?? '')
    ? (raw as OrderDetailSection)
    : DEFAULT_ORDER_DETAIL_SECTION;
}
