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
| `/dashboard` | 儀表板 | 總覽 + 調度行事曆（`app-calendar-view`）。卡片標題列可切「月曆｜時間軸」兩種檢視（2026-09-23 批次 3.5，狀態存在網址 `?view=`），共用同一個右側面板（取車／還車／可用三分頁）；頁首另有「待整備 N」「待保養 N」徽章與搜尋框 |
| `/vehicles` | 車籍管理 | 車輛 CRUD、狀態機（available/rented/maintenance/reserved）；表格另有「所在據點」欄與篩選（2026-09-23 後台流程審查批次 3.6）。原本這頁還有「表格／時間軸」切換，時間軸移到 `/dashboard` 後（見下方調度小節）這裡只剩表格 |
| `/vehicles/:id` | 車輛詳情 | 車輛資料、保養紀錄（`MaintenanceRecord`，經對話框新增） |
| `/orders` | 訂單列表 | 列表、篩選（含取車日期今天／本週／自訂區間、只看有待補）、匯出；「建立訂單」導到 `/orders/new`，**整列可點**開 `/orders/:id`（2026-09-23 批次 4.4，之前只有列尾一顆小圖示按鈕；舊網址 `/bookings` 會轉址過來） |
| `/members` | 會員管理 | `Member` 清單；側欄歸在「訂單管理」下（舊網址 `/bookings/members` 會轉址過來） |
| `/orders/new` | 建立訂單 | 見下方「訂單頁面化」 |
| `/orders/:id` | 訂單詳情 | 見下方「訂單頁面化」 |
| `/pricing` | 定價方案 | `PricingPlan` CRUD（車型定價、日型費率、天數累折級距） |
| `/pricing/calendar` | 假日／旺季日曆 | `SeasonCalendar` 維護 |
| `/add-ons` | 配件管理 | `AddOn` CRUD |
| `/coupons` | 優惠券管理 | `Coupon` CRUD |
| `/partners` | **民宿管理**（模組二新增） | `Partner` CRUD（協議折扣、退佣規則）、複製代訂連結 |
| `/commission` | **退佣帳單**（模組二新增） | 選民宿＋月份出報表、CSV 匯出、標記已撥款 |

`/dispatch` 不是獨立路徑——調度相關的檢視（行事曆、時間軸、待整備）都掛在 `/dashboard`，
`MaintenanceRecord` 也不是獨立路徑，掛在 `/vehicles/:id`。時間軸原本另外掛在 `/vehicles`
（一列一台車的調度時間軸，`features/dispatch/timeline-view/`），2026-09-23 批次 3.5 把它
搬進 `/dashboard` 跟行事曆共用同一張卡片與右側面板（月曆｜時間軸切換），`/vehicles` 那份
時間軸切換隨之拿掉（批次 3.6，`/vehicles` 現在只剩表格）；`timeline-view` 元件本身的檔案
位置沒有變，變的只是誰在用它。待整備（見下方「整備」小節）的清單 dialog 也掛在
`/dashboard`。`MaintenanceRecord` **只有 admin 有**，定義在 `apps/admin/src/app/core/
models/index.ts`，不在共用的 `libs/domain`，因為只有內部才需要。

側欄（`apps/admin/src/app/layout/side-nav/`，資料在 `app.ts` 的 `navItems`）分「群組」
（`NavGroup`：有子項、本身沒有路由）與「葉節點」（`NavLeaf`：有路由，可選 `matchPrefixes`
讓子路徑也算亮這個項目，例如 `/orders/*` 算「訂單列表」）兩種。2026-09-23 批次 4.5 把
「商品管理」改名「車輛與配件」，並把原本只在訂單列表工具列裡的「會員」連結，跟訂單列表
一起收進新群組「訂單管理」（訂單列表 `/bookings` ＋ 會員 `/bookings/members`）。

admin 是唯一同時 provide 全部 Repository token 的 app（`apps/admin/src/app/app.config.ts`），
包含前一段提到的 admin 專屬 `MAINTENANCE_REPO`（`apps/admin/src/app/core/repositories/tokens.ts`）。

### 頁首標題／麵包屑（2026-09-23，後台流程審查批次 2.1）

Topbar 只有一個 `<h1>`（這一頁自己的名字）＋一排麵包屑（上層路徑，有對應頁面的才可點），
側欄品牌不再是 `<h1>`。預設值由 `App`（`apps/admin/src/app/app.ts`）依側欄選單算出；標題
含動態資料（訂單詳情的承租人姓名、車輛詳情的車牌）或路由根本不在側欄裡（設定頁、登入頁）
的頁面，在自己 component 的 constructor 呼叫 `provideHeaderTitle()`
（`layout/header/header-title.ts`）登記覆寫，離開頁面時自動清空。標題旁的自訂內容（例如
訂單詳情的狀態 chip、逾時徽章）經另一個插槽 `appHeaderTitleExtra`
（`layout/header/header-title-extra-slot.ts`）由頁面模板自己投影進去。

麵包屑節點沒有 `route` 就顯示成不可點的純文字——側欄「群組」本身沒有對應頁面，預設情況下
會是這樣。但訂單詳情、建立訂單、會員頁三處手動登記的麵包屑，把「訂單管理」這個節點的
`route` 指到 `/bookings`（借用「訂單列表」的路由，讓它看起來可點）；車輛詳情頁的「車輛與
配件」群組節點則沒有這樣借用、維持不可點，只有其後的「車輛清單」節點可點。`/bookings`
（訂單列表）頁本身沒有另外登記，走預設值，於是「訂單管理」在它自己的列表頁不可點、在
訂單詳情／建立訂單／會員頁反而可點——同一個字樣兩種行為，是目前一個尚未處理的小不一致
（見 `docs/plans/2026-09-23-admin-flow-review.md`「完成紀錄」的後續待辦）。

### 滿版頁（fill page）

`/orders/new` 在路由的 `data` 屬性標記為「滿版頁」（`layout/fill-page.ts` 定義的 key，
目前唯一使用這個標記的路由），搭配共用條件（`layout/_fill-page.scss`：視窗寬度 ≥1024px
且高度 ≥600px，shell 與頁面各自的樣式共用同一個媒體查詢）讓主內容區精確撐滿頁首與頁尾
之間、卡片內只有內容自己捲動、操作列固定在卡片底部；不滿足條件時（含手機寬度）退回自然
排版，操作列改用 `position: sticky`。

### 訂單頁面化（2026-09-22 建頁面；2026-09-23～24 後台流程審查再改版）

建立訂單與訂單詳情原本是兩個 dialog（`booking-form-dialog`、`booking-workspace-dialog`），
已改成獨立頁面，程式碼在 `apps/admin/src/app/features/orders/`：

- **`/orders/new` 建立訂單**：非線性 `mat-stepper`，**4 步驟**（`OrderCreatePageComponent`
  的 `ORDER_CREATE_STEPS`）——租期與車輛 → 承租人與駕駛資格 → 費用與付款 → 合約。「建立
  訂單」在每一步都可以按，只有訂單底線（客人、車輛、租期三者齊備）與既有完整性規則會擋
  送出；按下之後才會在步驟標題亮錯誤。原本的第 5 步「確認建立」已拿掉（批次 2.2）：它
  唯一的內容（建立後待補清單）併入下面的左側摘要欄，不再需要獨立一步。
  - 第 1 步（`libs/order-form/src/lib/sections/order-rental-section.component.ts`）是「先選租期、
    再列可租的車」：搜尋列（車型、雙月日期區間、取還車時間 30 分鐘一格、取還車據點）即時
    更新、不需按鈕；可租清單是 `app-available-vehicle-list`
    （`features/dispatch/available-vehicle-list/`，內部靠 `RENTAL_AVAILABILITY` token
    讀資料，預設實作呼叫 `02-libs.md` 列的 `vehicleAvailability()`），只列整段期間可租、
    依「已在取車據點的車優先」排序，同一元件也被總覽的「可用」分頁（見下方調度小節）以
    「不可單選、整列點擊」模式共用。日期區間選擇器是 `libs/ui` 的
    `lib-dual-month-range-picker`（見 `02-libs.md`）。
  - 第 2 步同時收承租人資料與駕駛資格（`order-driver-section`：駕照號碼、效期、准駕類別、
    外國旅客互惠查核），整組可以留白，留白時列入待補「駕駛資格未查核」。
  - 桌機（≥1280px）在卡片上半部左側常駐一欄「訂單摘要」（`app-order-summary`，
    `features/orders/order-summary/`），與步驟內容並排；窄螢幕收成卡片頂端一條可展開的
    摘要列。內容包含車輛／租期／據點（需調度時附路線）／承租人／保險、各項金額與應收
    訂金／本次收款／建立後待收、「建立訂單需要」（車輛／租期／**據點**／承租人——共 4 項
    打勾，`order-form-derived.ts` 的 `orderRequirements()`；`CONTEXT.md`「訂單底線」定義的
    是車輛／租期／承租人三項，據點是實作時另外補上的必要條件，回報時一併說明）與「建立後
    待補」（`orderIncompleteItems()`，見下方）兩份檢查清單。動作列（取消／上一步／下一步／
    建立訂單）固定在卡片下半部、橫跨摘要欄與步驟內容兩欄的寬度，跨步驟切換時位置不變。
- **`/orders/:id` 訂單詳情**：頁首是訂單識別資訊，下方分頁（`OrderDetailPageComponent`
  的 `ORDER_DETAIL_SECTIONS`，定義 7 種，目前顯示 6 種——「文件」尚未實作，分頁列上先隱藏，
  網址帶 `?section=documents` 或程式導頁過來會落回總覽，批次 4.6），分頁以 `?section=`
  表示，可分享、重整後回到同一分頁。總覽分頁最上方在有待補時顯示待補卡
  （`order-incomplete-card`），每項可點到對應分頁；其中「會員未提供 Email」「證件未查核」
  「駕駛資格未查核」這三項屬於會員資料、沒有自己的分頁可跳（訂單的「編輯」只改訂單本身
  欄位，不含這三者），點了改開承租人的會員資料 dialog（批次 4.1／4.2）。只有「總覽」分頁
  可以編輯：預設唯讀，按「編輯」後同一頁切換成表單，明確按「儲存」才送出；編輯中其他分頁
  停用。收款、上傳文件、簽約、交還車、取消都是各分頁自己的作業，不算編輯訂單；「取消／
  退款」分頁依「取消 → 退款 → 保留金」三段呈現，每段只列目前訂單狀態能做的動作，其餘收成
  一行說明（批次 4.6）。
- 兩頁共用同一份表單定義（`order-form/`）與送出介面（`ORDER_SUBMIT_GATEWAY`），在路由層
  `provideAdminOrderForm()` 統一提供，範圍限定在 `features/orders`。
- **共用待補規則**：`features/orders/incomplete/order-incomplete.ts`——建立訂單頁摘要欄、
  訂單詳情、訂單列表三處共用同一套判斷（`orderIncompleteKinds()`／`orderIncompleteItems()`）。
  兩種資料來源先各自整理成同一份 `OrderIncompleteFacts`：`incompleteFactsFromForm()`（建單
  頁，吃表單目前的值）、`incompleteFactsFromOrder()`（訂單詳情／列表，吃已成立訂單的實際
  紀錄），保證同樣情況兩邊列出同樣的項目。注意這個檔案**不是** `order-form/
  order-form-derived.ts`（那裡現在只留「建立訂單需要」用的 `orderFormProblems()`／
  `orderRequirements()`，是另一套判斷，別搞混）。
- 合約檢視與簽署已抽成共用 lib `@car-rental/contract-signing`（見 `02-libs.md`），建單第四步
  與訂單詳情的合約分頁共用同一個簽署 dialog。

### 整備待辦（2026-09-24，後台流程審查批次 4.3）

「整備」＝還車之後、下一次交車之前的清潔與檢查（`CONTEXT.md`「整備」）；系統把它做成**不擋
交車的待辦清單**，不是狀態機。`PrepStore`（`apps/admin/src/app/stores/prep/prep.store.ts`）
在 `HandoverStore.performReturn()` 的 `prep_task_create` 步驟（緊接在 3.7 的所在據點更新
之後）幫每次完成的還車開一筆 `PrepTask`（見 `02-libs.md` 的 model 表），同一台車若已有未
結案的舊筆就標記為被取代（`supersededBy` 指向新那筆，取代不算完成）；按「整備完成」
（`PrepStore.complete()`）記錄時間與操作人，不刪資料。這個 store 刻意完全不碰
`VehicleStore`：不改車輛狀態、不影響可用數與可租清單、不擋取車。

畫面上兩處：總覽頁首「待整備 N」徽章，點開 `PrepQueueDialogComponent`
（`features/dashboard/dialogs/prep-queue-dialog.component.ts`）列出所有未結案項目（依
`02-libs.md` 的 `prepQueue()` 排序）與逐筆「整備完成」按鈕；行事曆取車清單對「有未結案
整備」的車顯示「尚未整備」提醒 chip（非阻擋，判斷式見 `calendar-view.component.ts` 的
`needsPrep()`）。

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

**多語系**：官網是唯一啟用語言切換的 app（繁中／英文／日文），殼層放語言切換器並呼叫
`provideBookingFlowI18n()`；頁面經本地的 `booking-pages.ts` lazy load。細節見
`04-booking-flow.md`「多語系」。

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
