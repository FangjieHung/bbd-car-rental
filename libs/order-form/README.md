# order-form

櫃檯建立訂單／編輯訂單共用的「積木層」（見 `docs/adr/0001-order-creation-not-shared-with-booking-site.md`）：

- `createOrderForm()` 等表單定義、`createOrderFormDerived()` 衍生狀態、`orderFormProblems()`／`orderIncompleteItems()`
- 注入點：`ORDER_FORM_DATA`（參考資料）、`ORDER_SUBMIT_GATEWAY`（送出）、`ORDER_FORM_LABELS`（文案與日期格式）
- 五個區塊元件：`lib-order-rental-section`、`lib-order-renter-section`、`lib-order-pricing-section`、`lib-order-payment-drafts-section`、`lib-order-contract-section`

這個 lib 不帶文案，使用端必須提供上述三個 token（admin 見 `apps/admin/src/app/features/orders/data/provide-admin-order-form.ts`）。
外層流程容器不共用：admin 是 stepper 單頁，官網是可分享的網址頁。

執行測試：`nx test order-form`。
