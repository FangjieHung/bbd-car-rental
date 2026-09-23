/**
 * 訂單詳情（`/orders/:id`）的分頁。網址以 `?section=<分頁>` 表示，沒帶就是總覽。
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

/**
 * 目前顯示在分頁列上的分頁。「文件」分頁還沒實作（只有置中的「文件」兩字），先隱藏（4.6）；
 * 型別仍保留 'documents'，讓既有的入口（例如總覽取車清單的「前往處理」）不必改，導過來時落回總覽——
 * 總覽的待補卡列著「證件未查核」「駕駛資格未查核」，能從那裡開承租人的會員資料處理。
 */
export const VISIBLE_ORDER_DETAIL_SECTIONS: readonly OrderDetailSection[] = ORDER_DETAIL_SECTIONS.filter(
  (section) => section !== 'documents',
);

export function isVisibleOrderDetailSection(section: OrderDetailSection): boolean {
  return VISIBLE_ORDER_DETAIL_SECTIONS.includes(section);
}

/** 網址上的分頁參數；未知、空值或目前隱藏的分頁一律回到總覽。 */
export function parseOrderDetailSection(raw: string | null | undefined): OrderDetailSection {
  return (VISIBLE_ORDER_DETAIL_SECTIONS as readonly string[]).includes(raw ?? '')
    ? (raw as OrderDetailSection)
    : DEFAULT_ORDER_DETAIL_SECTION;
}
