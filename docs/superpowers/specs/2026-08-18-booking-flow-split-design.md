# 預約流程拆頁重構設計（搜尋頁 + 下單頁 + 付款頁）

日期：2026-08-18
狀態：待實作

## 背景與目標

目前 consumer 與 partner 兩個預約入口共用同一個 `BookingFlowComponent`，它是一個五步 `mat-stepper`（租期 → 車款 → 配件 → 優惠券 → 確認），所有狀態（日期、選車、配件數量、優惠碼）都是掛在這一個元件上的 signal，五個 step 元件全是純展示。

三個問題：

1. **搜尋結果無法分享或重整**。使用者選好日期看到車單，網址仍是 `/book`，重整就回到第一步。
2. **選完車還要按三次「下一步」才付得了錢**，轉換路徑過長。
3. **金流無處可插**。送出鍵一按就直接建單並跳完成頁，沒有「付款」這個階段。

目標：把流程拆成「搜尋（原 step 1+2）」與「下單（原 step 3+4+5，單頁 checkout）」兩個獨立路由頁，並補上一個佔位付款頁，讓日後接金流只需替換單一元件。

## 範圍界線

**改**：`libs/booking-flow` 的頁面組成與路由、`apps/booking` 與 `apps/affiliate` 的路由。

**不改內部實作**（僅換位置引用）：`date-step`、`vehicle-step`、`dual-month-range-picker`、`plain-month-header`、`addon-step`、`coupon-step`、`confirm-step` 七個元件。前四者正由另一個 session 修改，本次一律不碰。

**唯一與他人重疊的檔案**：`libs/booking-flow/src/index.ts`。動它之前需確認另一 session 已收工。

**不在範圍**：真正的金流串接、後端 API、`catalog.store.ts` 既有方法的行為變更。

## 路由設計

搜尋條件走 URL query params，選定車輛走 route param。

```
consumer (apps/booking)              partner (apps/affiliate)
/                → redirect /search  /                → 既有 HomeComponent
/search?start=&end=                  /p/:slug/search?start=&end=
/order/:vehicleId?start=&end=        /p/:slug/order/:vehicleId?start=&end=
/pay/:bookingId                      /p/:slug/pay/:bookingId
/done/:id                            /p/:slug/done/:id
/book/done/:id → redirect /done/:id  /p/:slug → redirect /p/:slug/search
```

consumer 端 done 路徑由 `/book/done/:id` 改為 `/done/:id`，使兩側都能以 `[...basePath(), 'done', id]` 統一導頁；舊路徑保留一條 `redirectTo` 以免既有連結失效。

- `start` / `end` 為 ISO datetime 字串，與現有 `DateRange.startDateTime` / `endDateTime` 同格式。
- `/search` 無 query params 時正常顯示，只是車輛清單為空（等同現況 step 1 未選日期）。
- `/order/:vehicleId` 缺 `start`/`end`，或 `vehicleId` 查無車、或該車於區間內已被預約 → 導回同層級的 `search` 並保留原 query params。

### 夥伴身分的傳遞

不再用 `[mode]` input 逐層傳。改由路由層提供 `BookingContext`：

```ts
// libs/booking-flow/src/lib/booking-context.ts
@Injectable()
export class BookingContext {
  readonly partner: Signal<Partner | null>;   // consumer 版恆為 null
  readonly basePath: Signal<string[]>;        // ['/'] 或 ['/p', slug]，供頁面組導頁用
}
```

- `apps/booking`：不 provide，由 lib 提供 consumer 預設實作（partner 恆 null、basePath 為 `['/']`）。
- `apps/affiliate`：在 `/p/:slug` 這層 route 的 `providers` 加上 partner 版，讀 `:slug` 從 `PARTNER_REPO` 找出 partner。

頁面元件只讀 `context.partner()` 與 `context.basePath()`，不知道自己跑在哪個 app。所有 `router.navigate` 一律以 `basePath()` 為前綴。

`FlowMode` 型別與 `flow-mode.ts` 隨 `BookingFlowComponent` 一起移除。

## 元件

### 新增頁面 `libs/booking-flow/src/lib/pages/`

**`SearchPageComponent`**（`app-search-page`）

- 版面：上段 `app-date-step`，下段 `app-vehicle-step`。
- 日期變更 → 寫回 query params（`router.navigate([], { queryParams, replaceUrl: true })`），不自行保存狀態。
- 由 query params 推導 `availableVehicles`（`CatalogStore.availableVehicles`）與每台車報價（`QuoteService.vehicleTotal`）。
- 選車 → `router.navigate([...basePath(), 'order', vehicle.id], { queryParams: { start, end } })`。
- 沿用 `BookingFlowComponent` 現有的 partner banner。

**`OrderPageComponent`**（`app-order-page`）

- 版面（單欄滾動，桌機寬度足夠時右側浮出摘要卡）：
  1. `app-search-criteria-bar`（租期摘要 +「修改」回搜尋頁）
  2. `app-addon-step`
  3. `app-coupon-step`
  4. `app-confirm-step`
  5. `app-order-summary-card`（桌機 sticky 於右欄；窄螢幕 sticky 於底部）
- 內部 signal：`addOnQty: Record<string, number>`、`couponCode: string`。不持久化。
- 由 route param 撈車、query params 取日期，餵給 `QuoteService` 算 `priceBreakdown`。
- `confirm` 事件 → `CatalogStore.submitBooking(...)`（行為與現況相同，訂單狀態仍為 `pending_payment`）→ `router.navigate([...basePath(), 'pay', booking.id])`。
- 錯誤處理沿用現有 `submitError` 顯示方式。

**`PaymentPageComponent`**（`app-payment-page`）

- 讀 `:bookingId` 從 `BOOKING_REPO` 撈訂單，顯示訂單編號、金額、付款方式。
- 訂單不存在，或狀態已非 `pending_payment` → 直接導向 done 頁。
- 佔位互動：兩顆按鈕「模擬付款成功」「模擬付款失敗」。
  - 成功 → `CatalogStore.markBookingPaid(bookingId)` → 導向 done 頁。
  - 失敗 → 頁內顯示錯誤訊息，可重試。
- 這是接真金流時唯一需要改的檔案。屆時內部換成 SDK 呼叫或 redirect，並新增回調路由 `pay/:bookingId/result`。

### 新增零件 `libs/booking-flow/src/lib/components/`

**`OrderSummaryCardComponent`**（`app-order-summary-card`）

- Inputs：`vehicle`、`startDate`、`endDate`、`selectedAddOnLines`、`priceBreakdown`。
- 純展示，無 output。內容取自現有 `confirm-step.component.html` 的摘要區塊。
- 抽出動機：單頁 checkout 滾動時金額必須恆可見。`confirm-step` 內原有的摘要區塊隨之移除，避免同頁重複顯示。

**`SearchCriteriaBarComponent`**（`app-search-criteria-bar`）

- Inputs：`startDate`、`endDate`、`days`。Output：`edit`。
- 顯示「馬公 · 3/4–3/7 · 共 3 天 ·〔修改〕」。取還地點目前在 `submitBooking` 中寫死為「馬公」，此處同樣寫死，不擴大範圍。

### 新增服務

**`QuoteService`**（`libs/booking-flow/src/lib/quote.service.ts`，`providedIn: 'root'`）

把目前散在 `BookingFlowComponent` 的三段算價邏輯集中，因為搜尋頁與下單頁都要算：

```ts
vehicleTotal(vehicle, { startDate, endDate, partnerDiscountPercent }): number | null
validateCoupon(code, { startDate, days, category }): CouponResult | null
quote({ vehicle, startDate, endDate, addOnLines, coupon, partnerDiscountPercent }): PriceBreakdown | null
```

內部呼叫既有的 `CatalogStore.price` / `CatalogStore.validateCoupon`，不改 `CatalogStore` 的既有方法。

### `CatalogStore` 新增方法

```ts
markBookingPaid(bookingId: string): RentalBooking
```

實作為 `bookingRepo.update(bookingId, { status: 'confirmed' })`（`Repository.update` 已存在於 `libs/domain/src/lib/repositories/repository.ts:5`）。查無訂單則丟 `Error('查無訂單')`。

### 移除

- `booking-flow.component.ts` / `.html` / `.scss`
- `flow-mode.ts`
- `PartnerBookingComponent`（含 `.html` / `.scss`）。改以 route config 處理：`{ path: 'p/:slug', redirectTo: 'p/:slug/search', pathMatch: 'full' }`，Angular 的 `redirectTo` 支援保留路徑參數。

### 既有元件的連帶調整

- `confirm-step.component.html`：移除摘要區塊（已抽到 `OrderSummaryCardComponent`）；送出鍵文案由「送出預約」改為「前往付款」。
- `done.component.html`：`routerLink="/book"` 為寫死路徑，partner 情境會導錯。改為讀 `BookingContext.basePath()`。

## 資料流

```
URL (?start&end)
   ↓
SearchPage ──(選車)──> URL (/order/:vehicleId?start&end)
                            ↓
                       OrderPage ──(內部 signal: addOnQty, couponCode)
                            ↓ submitBooking → status: pending_payment
                       URL (/pay/:bookingId)
                            ↓
                     PaymentPage ──(markBookingPaid → status: confirmed)
                            ↓
                       URL (/done/:id)
```

真相來源歸屬：

| 資料 | 位置 | 重整後是否存活 |
|---|---|---|
| 取還日期 | URL query params | 是 |
| 選定車輛 | URL route param | 是 |
| 配件數量、優惠碼 | OrderPage 內部 signal | 否（可接受，該頁不會被分享） |
| 訂單 | `BOOKING_REPO`（localStorage） | 是 |

## 錯誤處理

| 情境 | 行為 |
|---|---|
| `/search` 無 query params | 正常顯示，車輛清單為空 |
| `/order/:vehicleId` 缺日期 | 導回 `search`（保留既有 query params） |
| `/order/:vehicleId` 查無車或該車已被預約 | 導回 `search`，顯示提示 |
| 送出時車輛已被搶訂 | `submitBooking` 已丟錯，維持現有 `submitError` 顯示 |
| `/pay/:bookingId` 查無訂單 | 導向 done 頁（由 done 頁處理查無訂單） |
| `/pay/:bookingId` 訂單非 `pending_payment` | 導向 done 頁 |
| 模擬付款失敗 | 頁內錯誤訊息，訂單狀態不變，可重試 |

## 測試

不動：`catalog.store.spec.ts`、`vehicle-step.component.spec.ts`（後者屬另一 session）。

新增：

- `quote.service.spec.ts` — 報價、優惠券驗證、夥伴折扣三條路徑。
- `search-page.component.spec.ts` — query params 進來後車輛清單正確；日期變更寫回 query params；點車導向正確路徑（consumer 與 partner 兩種 basePath）。
- `order-page.component.spec.ts` — 配件與優惠碼影響總價；送出後建立 `pending_payment` 訂單並導向 `pay/:id`；缺日期時導回 search。
- `payment-page.component.spec.ts` — 模擬成功後訂單轉 `confirmed` 並導向 done；失敗時狀態不變。

## 實作階段

1. **抽取，行為不變**：`QuoteService`、`OrderSummaryCardComponent`、`SearchCriteriaBarComponent`、`CatalogStore.markBookingPaid`。既有測試須全綠。
2. **搜尋頁**：`SearchPageComponent` + `BookingContext` + `apps/booking` 路由。
3. **下單頁**：`OrderPageComponent` 單頁 checkout + `confirm-step` 摘要區塊移除。
4. **付款頁**：`PaymentPageComponent` + `done.component` basePath 修正。
5. **收尾**：`apps/affiliate` 路由切換、刪除 `BookingFlowComponent` 與 `flow-mode.ts`、更新 `index.ts` 匯出。

階段 5 動到 `index.ts`，需先確認另一 session 收工。

## 已知風險

- **`index.ts` 衝突**：唯一與另一 session 重疊的檔案，排在最後一階段處理。
- **step 元件介面變動**：另一 session 若更動 `date-step` / `vehicle-step` 的 input/output 名稱，新頁面 template 需跟著調整。每階段結束跑 build 驗證。
- **`app-vehicle-step` 的重用者**：admin 的 `vehicle-picker-dialog` 也在用它，本次不改該元件內部，故不受影響。
