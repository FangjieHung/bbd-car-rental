/**
 * 夥伴入口子路由要 lazy load 的官網訂車頁面。
 *
 * partner-shell 已經靜態引用 @car-rental/booking-flow（為了提供 BOOKING_CONTEXT），
 * 若路由再直接 `import('@car-rental/booking-flow')`，同一個 lib 會同時被靜態與動態引用，
 * 違反 @nx/enforce-module-boundaries。改由路由動態載入這支本地檔案，打包結果不變
 * （頁面仍在夥伴入口的 lazy chunk 裡）。
 */
export {
  SearchPageComponent,
  PlanPageComponent,
  OrderPageComponent,
  PaymentPageComponent,
  DoneComponent,
} from '@car-rental/booking-flow';
