// 訂單表單積木層（見 docs/adr/0001）：表單定義、參考資料與送出介面、衍生狀態、合約快照、文案注入點，
// 以及建立訂單／編輯訂單共用的五個區塊元件。外層流程容器（admin 的 stepper 頁、官網的網址頁）不在這裡。
export * from './lib/order-form';
export * from './lib/order-form-data';
export * from './lib/order-form-derived';
export * from './lib/order-form-labels';
export * from './lib/order-submit-gateway';
export * from './lib/contract-snapshot';
export * from './lib/sections/order-rental-section.component';
export * from './lib/sections/order-renter-section.component';
export * from './lib/sections/order-pricing-section.component';
export * from './lib/sections/order-payment-drafts-section.component';
export * from './lib/sections/order-contract-section.component';
