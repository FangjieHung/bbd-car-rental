# 各 App 說明

## admin — 車行內部後台

**誰在用**：車行員工。**免登入**：定位上否，但目前**沒有任何路由守衛**——`/login` 只是
一顆「進入系統」按鈕（`AuthService.login()` 只在 `localStorage` 記一筆、不驗證帳密），
其餘路徑不經過它也能直接打開。
**本機網址**：http://localhost:4200/ ・**套 theme-pack**：是（雙軸主題，見 `02-libs.md`）。

路由（`apps/admin/src/app/app.routes.ts`）：

| 路徑 | 頁面 | 功能 |
|---|---|---|
| `/login` | 登入頁 | 佔位頁：按鈕直接呼叫 `AuthService.login()` 後導向 `/dashboard`，未做真正的帳密驗證 |
| `/settings` | 系統設定 | 目前只有外觀設定：切換 theme-pack 的質地與配色 |
| `/dashboard` | 儀表板 | 總覽 + 調度行事曆（`app-calendar-view`，取車清單標示「需調度」） |
| `/vehicles` | 車籍管理 | 車輛 CRUD、狀態機（available/rented/maintenance/reserved）；「時間軸」檢視模式是一列一台車的調度時間軸（`features/dispatch/timeline-view/`） |
| `/vehicles/:id` | 車輛詳情 | 車輛資料、保養紀錄（`MaintenanceRecord`，經對話框新增） |
| `/orders` | 訂單列表 | 列表、篩選、匯出；「建立訂單」導到 `/orders/new`，點列導到 `/orders/:id`（舊網址 `/bookings` 會轉址過來） |
| `/members` | 會員管理 | `Member` 清單；側欄歸在「訂單管理」下（舊網址 `/bookings/members` 會轉址過來） |
| `/orders/new` | 建立訂單 | 見下方「訂單頁面化」 |
| `/orders/:id` | 訂單詳情 | 見下方「訂單頁面化」 |
| `/pricing` | 定價方案 | `PricingPlan` CRUD（車型定價、日型費率、天數累折級距） |
| `/pricing/calendar` | 假日／旺季日曆 | `SeasonCalendar` 維護 |
| `/add-ons` | 配件管理 | `AddOn` CRUD |
| `/coupons` | 優惠券管理 | `Coupon` CRUD |
| `/partners` | **民宿管理**（模組二新增） | `Partner` CRUD（協議折扣、退佣規則）、複製代訂連結 |
| `/commission` | **退佣帳單**（模組二新增） | 選民宿＋月份出報表、CSV 匯出、標記已撥款 |

`/dispatch` 不是獨立路徑——調度相關的兩個檢視分別掛在 `/dashboard`（行事曆）與
`/vehicles`（時間軸），`MaintenanceRecord` 也不是獨立路徑，掛在 `/vehicles/:id`。
`MaintenanceRecord` **只有 admin 有**，定義在 `apps/admin/src/app/core/models/index.ts`，
不在共用的 `libs/domain`，因為只有內部才需要。

admin 是唯一同時 provide 全部 Repository token 的 app（`apps/admin/src/app/app.config.ts`），
包含前一段提到的 admin 專屬 `MAINTENANCE_REPO`（`apps/admin/src/app/core/repositories/tokens.ts`）。

### 訂單頁面化（2026-09-22）

建立訂單與訂單詳情原本是兩個 dialog（`booking-form-dialog`、`booking-workspace-dialog`），
已改成獨立頁面，程式碼在 `apps/admin/src/app/features/orders/`：

- **`/orders/new` 建立訂單**：非線性 `mat-stepper`，5 步驟（`OrderCreatePageComponent` 的
  `ORDER_CREATE_STEPS`）——租期與車輛 → 承租人 → 費用與付款 → 合約 → 確認建立。「建立訂單」
  在每一步都可以按，只有訂單底線（客人、車輛、租期三者齊備）與既有完整性規則會擋送出；
  按下之後才會在步驟標題亮錯誤。
- **`/orders/:id` 訂單詳情**：頁首是訂單識別資訊，下方七個分頁（`OrderDetailPageComponent`
  的 `ORDER_DETAIL_SECTIONS`），目前分頁以 `?section=` 表示，可分享、重整後回到同一分頁。
  只有「總覽」分頁可以編輯：預設唯讀，按「編輯」後同一頁切換成表單，明確按「儲存」才送出；
  編輯中其他分頁停用。收款、上傳文件、簽約、交還車、取消都是各分頁自己的作業，不算編輯訂單。
- 兩頁共用同一份表單定義（`order-form/`）與送出介面（`ORDER_SUBMIT_GATEWAY`），在路由層
  `provideAdminOrderForm()` 統一提供，範圍限定在 `features/orders`。
- 合約檢視與簽署已抽成共用 lib `@car-rental/contract-signing`（見 `02-libs.md`），建單第四步
  與訂單詳情的合約分頁共用同一個簽署 dialog。

## booking — 消費者訂車站

**誰在用**：一般消費者。**免登入**：是。
**本機網址**：http://localhost:4300/（預設 port 4200 會跟 admin 撞，需加 `--port 4300`，見根目錄 README）。
**套 theme-pack**：否（純資訊型頁面，不需要換膚）。

路由（`apps/booking/src/app/app.routes.ts`）：

| 路徑 | 頁面 |
|---|---|
| `/search` | 搜尋（`SearchPageComponent`）：選租期＋選車 |
| `/order/:vehicleId` | 下單（`OrderPageComponent`）：配件、優惠碼、填資料送出 |
| `/pay/:bookingId` | 付款（`PaymentPageComponent`，目前是佔位，見 `04-booking-flow.md`） |
| `/done/:id` | 完成頁（`DoneComponent`） |
| `/book/done/:id` | redirect 到 `/done/:id`，接住重構前發出去的舊連結 |

query params 的實際內容（只有 `start`／`end`／`group`，沒有取車／還車地點）見
`04-booking-flow.md`。這四頁都來自 `@car-rental/booking-flow`。這個 app 本身幾乎沒有
自己的業務邏輯——全部邏輯在 `libs/booking-flow`，booking 只是不提供 `BOOKING_CONTEXT`，
吃 lib 內建的 consumer 預設值去消費它，並提供八個共用 Repository 的 provider
（`apps/booking/src/app/app.config.ts`；官網目前不提供合約相關的 repo，這個缺口見
`04-booking-flow.md`「已知缺口」）。

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
