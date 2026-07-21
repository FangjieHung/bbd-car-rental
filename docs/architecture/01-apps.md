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

| 路徑 | 說明 |
|---|---|
| `/book` | 五步預約流程（`@car-rental/booking-flow` 的 `BookingFlowComponent`，`consumer` 模式，即不傳 `mode` 時的預設值） |
| `/book/done/:id` | 送出完成頁（`DoneComponent`） |

這個 app 本身幾乎沒有自己的業務邏輯——全部邏輯在 `libs/booking-flow`，booking 只是
「以消費者身分」去消費它，並提供六個共用 Repository 的 provider。

## affiliate — 民宿代訂＋對帳站（模組二新增）

**誰在用**：合作民宿業者。**免登入**：是。
**本機網址**：http://localhost:4400/（固定寫在 `apps/affiliate/project.json`）。
**套 theme-pack**：否。

路由（`apps/affiliate/src/app/app.routes.ts`）：

| 路徑 | 頁面 | 功能 |
|---|---|---|
| `/` | 首頁 | 純說明頁 |
| `/p/:slug` | 代訂頁 | 用網址的 `slug` 從 `PARTNER_REPO` 查 `Partner`；找不到顯示「連結無效」。找到則以 `partner` 模式渲染 `BookingFlowComponent`——頁首顯示民宿名、自動套協議折扣、送出訂單帶 `sourcePartnerId` |
| `/p/:slug/account` | 對帳頁 | 列出 `sourcePartnerId === partner.id` 的訂單、逐筆退佣金額、累計、各月撥款進度 |
| `/book/done/:id` | 完成頁 | `BookingFlowComponent` 送出後固定導到這個路徑（見 `libs/booking-flow/src/lib/booking-flow.component.ts`），affiliate 一定要提供這條路由，否則送單後會 404 |

对帳頁邏輯在 `apps/affiliate/src/app/stores/partner-account.store.ts`
（`PartnerAccountStore`），詳細計算方式見 `03-pricing-and-commission.md`。

**產品連結**：admin 的 `/partners` 頁「複製代訂連結」按鈕組出的網址就是指向這裡的
`http://localhost:4400/p/:slug`（含完整 origin，這樣才能直接貼到瀏覽器打開——
早期版本只給相對路徑 `/p/:slug`，貼到 admin 站會被導回 admin 首頁，是已修的 bug）。

## pos — 尚未開發

Nx 產生時的預設腳手架（`nx-welcome` 頁面），還沒有任何業務邏輯或路由規劃。
看到這個 app 名字先忽略，等實際排進開發計畫再補文件。
