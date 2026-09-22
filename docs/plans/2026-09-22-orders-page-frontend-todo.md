# 訂單頁面化：前端與設計接續待辦

**日期：** 2026-09-22
**分支：** `feat/orders-page`
**給誰：** 設計＋前端接手的人（也就是下一次的自己）
**相關文件：** 術語 `CONTEXT.md`、決策 `docs/adr/0001-order-creation-not-shared-with-booking-site.md`、後端 `docs/plans/2026-09-22-orders-page-backend-handoff.md`、業主 `docs/owner-questions.md`

## 0. 這次做完了什麼

- 建立訂單改為 `/orders/new` 頁面，非線性 `mat-stepper`，「建立訂單」每一步都能按，錯誤在按下後才亮在步驟標題上。
- 訂單工作區改為 `/orders/:id`「訂單詳情」頁，總覽分頁「檢視 → 編輯 → 明確儲存」。
- 合約檢視＋簽署抽成共用 lib `libs/contract-signing`，建單第四步與合約分頁共用同一個 dialog。
- 據點統一：四個具體據點，車輛所在據點／取車／還車都存據點 id，舊值自動遷移。
- 調度行事曆的取車清單標示「需調度」並可篩選；車輛表單可設定所在據點。
- 付款方式選項與預設標籤下放 `libs/domain`；官網 `lang` 修正、付款標籤去重、官網標籤改為可覆寫的 token。

以下是**刻意沒做**、留給之後的事，依建議順序排列。

## 1. `bookings → orders` 全面更名

程式碼叫「booking（預約）」、畫面叫「訂單」，術語表已定案統一叫「訂單」。這次只新增了 `/orders/*` 路由，其餘沿用舊名。

- 路由：列表頁 `/bookings`、會員 `/bookings/members` → `/orders`、`/members`（或 `/orders/members`，看資訊架構）
- 資料夾：`apps/admin/src/app/features/bookings/` 併入 `features/orders/`
- 型別與 token：`RentalBooking`、`BookingStatus`、`BOOKING_REPO`、`stores/booking/`
- 欄位：`pickupLocation` / `returnLocation` / `Vehicle.location` 現在存的是據點 id，改名為 `pickupBranchId` / `returnBranchId` / `branchId` 才名副其實。**localStorage 已有舊欄位名的資料，改名要附遷移**（照 `libs/domain/src/lib/repositories/normalize-rental-booking.ts` 的模式）。
- `zh-tw.ts` 內 `booking`、`bookingForm` 等 key
- 側欄選單目前用 `matchPrefixes: ['/orders/']` 讓 `/orders/*` 亮「訂單管理」，更名後可拿掉

建議獨立一個分支做，純機械改名，不夾帶行為變更。

## 2. 官網多語系（i18n）

**規模（2026-09-22 實測）：** `libs/booking-flow` 正式碼 149 處硬編中文、spec 斷言 177 處、`libs/domain` 種子資料中會顯示在官網的 89 處，**共約 415 處**；基礎設施為零（無 i18n 套件、無 `LOCALE_ID`、無翻譯檔）。`apps/booking` 本身 0 處——它只是路由殼。

**已定案：**
- 語言：繁中、英文、日文（待業主 #8 確認）
- 只做官網；admin 維持靜態 `ZH_TW`，**兩邊機制刻意分岔**
- 界線：**會隨資料庫變動的是資料、不翻**（據點名稱、車款型號、客人姓名）；固定寫在程式裡的是文案、要翻（按鈕、欄位名、選項的分類標籤）

**已留好的接縫：**
- `libs/domain` 的 `SelectOption.label` 是「預設繁中標籤」，翻譯層以 `value` 為 key 查表、查不到落回 label
- `BOOKING_FLOW_LABELS`（`libs/booking-flow/src/lib/booking-flow-labels.ts`）
- `CONTRACT_SIGNING_LABELS`（`libs/contract-signing`）

**要從零做的：**
- 日期與金額目前全是手刻：`NT$` 字面量約 9 處、`.slice(0, 10)` 切 ISO 字串 3 處、自寫 `formatDate()` 與「2026年9月」月份標籤（`dual-month-range-picker.component.ts`）。要改用 locale-aware 的格式化。
- `plan-page.component.html` 已有 `currency === 'JPY' ? '¥' : 'NT$'` 的三元判斷，是多幣別的苗頭，一併處理。
- 三元式裡內嵌的文案最難抽（`plan-page.component.html:117,123,46`、`confirm-step.component.html:51`）。

## 3. 官網接上合約簽署

前提：**待業主 #3**（官網訂單的合約何時產生）。決定之前做了也無東西可簽。

決定後要做：
- `apps/booking/src/app/app.config.ts` 補上 `CONTRACT_VERSION_REPO` 與 `SIGNATURE_ASSET_STORE` 的 provider（目前只注入 8 個 repo）
- 官網目前**沒有載入 `libs/theme-pack` 樣式**，但簽署 lib 用到 `--app-warning-*` 等 token，要先補上主題樣式，否則「需重新簽署」提示會沒有顏色
- 簽署元件在手機上已是全螢幕，但未在官網實機驗證過

## 4. 建單流程共用給官網

依 ADR 0001，**不共用外層流程容器**，只共用積木層。admin 端已經寫成可搬移的形狀：

- 表單定義 `createOrderForm()`、區塊元件 `app-order-rental-section` 等、`ORDER_FORM_DATA`、`ORDER_SUBMIT_GATEWAY`，都在 `apps/admin/src/app/features/orders/order-form/`
- 搬到 lib 時注意：區塊元件目前引用 admin 的 `ZH_TW`，要改成 token 注入（同 `BOOKING_FLOW_LABELS` 的做法）
- 官網需要的欄位只有約 6/20 重疊，別硬把 admin 專屬欄位（身分別、國籍、訂金、款項、內部備註）塞進官網

## 5. mock 資料彙整的剩餘項目

這次只收了據點與付款方式。還剩：

| 重複項目 | 位置 |
|---|---|
| 車型中文標籤（三份） | `zh-tw.ts` 的 `vehicle.typeLabels`、`booking-flow-labels.ts` 的車型標籤、`date-step` 的車輛類型 |
| 佔用車位的訂單狀態（三份） | `libs/domain` 的 `OCCUPYING`、`calendar-view.component.ts` 的 `ACTIVE`、`stores/booking/booking.store.ts` 的 `ACTIVE` |
| 各種 statusLabels | `zh-tw.ts` 內十幾組，只有 admin 有；官網需要時各自在元件裡長出 Record |
| 寫死在模板的選項值 | `member-form-dialog`、`vehicle-form-dialog`、`pricing-plan-dialog`、`coupon-dialog`、`add-on-dialog` 的 HTML |

做法照這次的模式：值＋預設標籤放 `libs/domain`，admin 用 `optionLabelMap()` 塞回 `ZH_TW` 原位，49 個消費端零改動。

## 6. 調度相關

- **甘特圖的資訊架構**：真正「一列一台車」的時間軸（`features/dispatch/timeline-view/`）躲在車輛管理頁的「時間軸」檢視裡，而調度人員看的卻是儀表板月曆。考慮把時間軸移到調度相關的位置，並在上面也標示需調度。
- 月曆格子只顯示「取 N／還 N／可用 N」，沒有「需調度 N」。要加得改 `dayStats()` 的簽名（被儀表板與 spec 直接引用）。
- 車輛列表表格沒有「所在據點」欄。
- 還車後的車輛歸屬：**待業主 #1**。
- 調度負責人與時限：**待業主 #2**。

## 7. 這次發現、沒處理的小問題

- **首屏 bundle**：`mat-stepper` 帶進約 17 kB（壓縮後約 4 kB）——`@angular/material/stepper` 發佈檔有一行無條件的 `import '@angular/common/http'`，打包工具無法剔除。不是我們的程式問題，且接上後端後這段本來就需要。**預算門檻已重訂**（原本是 Angular 新專案預設的 500 kB，長年在響）：admin 720/850 kB、booking 420/500 kB、affiliate 430/500 kB，現在全部零警告——之後再看到警告就是真的有東西變胖了。
- **孤兒簽名**：客人在建單第四步簽了名、但最後沒建立訂單就離開，簽名檔會留在 IndexedDB，沒有合約引用它，也沒有清理機制。
- **外國旅客國籍**：建單時不擋也沒列入待補項目（舊精靈會擋「下一步」）。要不要列為待補項目？
- **內部備註建立後無法修改**：它只存在合約快照裡、不是訂單欄位，所以訂單詳情的「編輯」沒有放它（放了會變成改了卻存不進去）。若需要可事後修改，得先決定它屬於訂單還是合約。
- **未簽署的合約草稿會被就地更新**：改訂單時，若目前版本還是草稿就直接覆寫、不產生新版本（`apps/admin/src/app/stores/contract/contract.store.ts` 的 `reviseIfChanged`）。這符合「只有已簽署版本不可覆寫」的規則，但活動紀錄看不出草稿被改過幾次。
- **交車阻擋訊息**：`libs/domain/src/lib/handover/evaluate-pickup-readiness.ts` 擋下取車時一律顯示「最新版本合約尚未簽署」，未區分「需重新簽署」。
- **lint 只剩元件前綴這一類**（booking-flow 13、theme-pack 1 個 error）：規則要求 lib 的元件 selector 以 `lib-` 開頭，實際是 `app-`。要改就是十幾個元件連同所有使用處一起改名，**建議併入第 1 節的更名任務**；或先確認這些 lib 的元件到底該不該用 `lib-`，若不該，要改的是規則設定而非程式碼。其餘 error（依賴宣告、無障礙、空介面）已於 2026-09-22 修掉，測試也已全綠。

## 8. 過時的文件

以程式碼為準，下列文件需要改寫：

- `docs/architecture/02-libs.md`：訂單狀態機仍寫 `pending_payment` → `confirmed`；列了已不存在的 `Customer` model（現為 `Member`）；沒有 `libs/contract-signing`
- `docs/architecture/04-booking-flow.md`：仍寫 `pickup` / `return` query params；實際是取車據點直接吃車輛所在據點，且據點已從「機場／港口／店舖」三個分類改為具體據點 id
