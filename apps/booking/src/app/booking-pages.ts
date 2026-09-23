/**
 * 官網路由要 lazy load 的訂車頁面。
 *
 * App 殼層為了語言切換（LanguageSwitcherComponent、provideBookingFlowI18n）靜態引用了
 * @car-rental/booking-flow，若路由再直接 `import('@car-rental/booking-flow')`，同一個 lib 會同時被
 * 靜態與動態引用，違反 @nx/enforce-module-boundaries。改由路由動態載入這支本地檔案，
 * 頁面仍各自在 lazy chunk 裡。
 */
export {
  SearchPageComponent,
  PlanPageComponent,
  OrderPageComponent,
  PaymentPageComponent,
  DoneComponent,
} from '@car-rental/booking-flow';
