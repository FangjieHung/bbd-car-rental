# 各 App 說明

## admin — 車行內部後台

**誰在用**：車行員工。**免登入**：否（目前 demo 階段沒做登入頁，但定位是內部系統）。
**本機網址**：http://localhost:4200/ ・**套 theme-pack**：是（雙軸主題，見 `02-libs.md`）。

路由（`apps/admin/src/app/app.routes.ts`）：

| 路徑 | 頁面 | 功能 |
|---|---|---|
| `/dashboard` | 儀表板 | 總覽 |
| `/vehicles` | 車籍管理 | 車輛 CRUD、狀態機（available/rented/maintenance/reserved） |
| `/dispatch` | 派車 | 車輛調度 |
| `/bookings` | 訂單管理 | 列表、人工確認收款（`pending_payment` → `confirmed`） |
| `/bookings/customers` | 客戶管理 | 客戶清單 |
| `/maintenance` | 保養紀錄 | `MaintenanceRecord`（**只有 admin 有**，不在 `libs/domain`，因為只有內部才需要） |
| `/pricing` | 定價方案 | `PricingPlan` CRUD（車型定價、日型費率、天數累折級距） |
| `/add-ons` | 配件管理 | `AddOn` CRUD |
| `/coupons` | 優惠券管理 | `Coupon` CRUD |
| `/partners` | **民宿管理**（模組二新增） | `Partner` CRUD（協議折扣、退佣規則）、複製代訂連結 |
| `/commission` | **退佣帳單**（模組二新增） | 選民宿＋月份出報表、CSV 匯出、標記已撥款 |

admin 是唯一同時 provide 全部 Repository token 的 app（`apps/admin/src/app/app.config.ts`），
包含 admin 專屬的 `MAINTENANCE_REPO`（定義在 `apps/admin/src/app/core/repositories/tokens.ts`，
不在共用的 `libs/domain`）。

## booking — 消費者訂車站

**誰在用**：一般消費者。**免登入**：是。
**本機網址**：http://localhost:4300/（預設 port 4200 會跟 admin 撞，需加 `--port 4300`，見根目錄 README）。
**套 theme-pack**：否（純資訊型頁面，不需要換膚）。

路由（`apps/booking/src/app/app.routes.ts`）：

| 路徑 | 頁面 |
|---|---|
| `/search?start=&end=` | 搜尋（`SearchPageComponent`）：選租期＋選車 |
| `/order/:vehicleId?start=&end=` | 下單（`OrderPageComponent`）：配件、優惠碼、填資料送出 |
| `/pay/:bookingId` | 付款（`PaymentPageComponent`，目前是佔位，見 `04-booking-flow.md`） |
| `/done/:id` | 完成頁（`DoneComponent`） |
| `/book/done/:id` | redirect 到 `/done/:id`，接住重構前發出去的舊連結 |

這四頁都來自 `@car-rental/booking-flow`。這個 app 本身幾乎沒有自己的業務邏輯——
全部邏輯在 `libs/booking-flow`，booking 只是不提供 `BOOKING_CONTEXT`，吃 lib 內建的
consumer 預設值去消費它，並提供六個共用 Repository 的 provider。

## affiliate — 民宿代訂＋對帳站（模組二新增）

**誰在用**：合作民宿業者。**免登入**：是。
**本機網址**：http://localhost:4400/（固定寫在 `apps/affiliate/project.json`）。
**套 theme-pack**：否。

路由（`apps/affiliate/src/app/app.routes.ts`）：

| 路徑 | 頁面 | 功能 |
|---|---|---|
| `/` | 首頁 | 純說明頁 |
| `/p/:slug/account` | 對帳頁 | 列出 `sourcePartnerId === partner.id` 的訂單、逐筆退佣金額、累計、各月撥款進度。**必須宣告在 `/p/:slug` 之前**，否則 `account` 會被 `/p/:slug` 的子路由當成 `:slug` 值吃掉 |
| `/p/:slug` | 夥伴 shell（`PartnerShellComponent`） | 用網址的 `slug` 從 `PARTNER_REPO` 查 `Partner`，provide 夥伴版的 `BOOKING_CONTEXT`；找不到對應 `Partner` 顯示「連結無效」，否則渲染 `<router-outlet>` |
| `/p/:slug`（children） | 代訂四頁 | `search` / `order/:vehicleId` / `pay/:bookingId` / `done/:id`，即 `@car-rental/booking-flow` 的四個路由頁，繼承 shell 提供的夥伴情境——頁首顯示民宿名、自動套協議折扣、送出訂單帶 `sourcePartnerId`。空路徑 redirect 到 `search` |
| `/book/done/:id` | redirect 到 `/` | 接住重構前的舊連結；舊路徑不帶 `slug`，無法對應到特定夥伴的完成頁，所以導回首頁而非某個 `done` 頁 |

对帳頁邏輯在 `apps/affiliate/src/app/stores/partner-account.store.ts`
（`PartnerAccountStore`），詳細計算方式見 `03-pricing-and-commission.md`。

**產品連結**：admin 的 `/partners` 頁「複製代訂連結」按鈕組出的網址就是指向這裡的
`http://localhost:4400/p/:slug`（含完整 origin，這樣才能直接貼到瀏覽器打開——
早期版本只給相對路徑 `/p/:slug`，貼到 admin 站會被導回 admin 首頁，是已修的 bug）。

## pos — 尚未開發

Nx 產生時的預設腳手架（`nx-welcome` 頁面），還沒有任何業務邏輯或路由規劃。
看到這個 app 名字先忽略，等實際排進開發計畫再補文件。
