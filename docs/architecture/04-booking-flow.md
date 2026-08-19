# 預約流程（booking-flow）

給要修改預約流程的人看。這份文件回答：流程現在長什麼樣、為什麼這樣設計、動它之前要知道什麼、
以及接金流時實際要改哪些地方。

`libs/booking-flow` 被 `booking`（消費者）與 `affiliate`（民宿代訂）兩個 app 共用，
`admin` 也借用其中兩個元件。改這個 lib 會同時影響三個 app。

## 流程長什麼樣

四個獨立路由頁，不是精靈式的單一元件：

```
搜尋 ──選車──> 下單 ──送出──> 付款 ──付款成功──> 完成
```

| | 消費者（`apps/booking`） | 民宿代訂（`apps/affiliate`） |
|---|---|---|
| 搜尋 | `/search?start=&end=&pickup=&return=&group=` | `/p/:slug/search?start=&end=&pickup=&return=&group=` |
| 下單 | `/order/:vehicleId?start=&end=&pickup=&return=&group=` | `/p/:slug/order/:vehicleId?start=&end=&pickup=&return=&group=` |
| 付款 | `/pay/:bookingId` | `/p/:slug/pay/:bookingId` |
| 完成 | `/done/:id` | `/p/:slug/done/:id` |

`pickup`／`return` 是取車／還車地點，`group` 是車輛大類（`car`／`scooter`，缺省不篩選）。
`start`／`end`／`pickup`／`return` 四者缺一，該頁就視為租期不成立（`dateRange` 回傳 `null`），
車輛清單淨空或導回搜尋頁重來 —— 與原本只看 `start`／`end` 的判斷邏輯一致，只是條件擴大了。

`booking` 另有 `/book/done/:id → /done/:id` 的 redirect，接住重構前發出去的舊連結。
`affiliate` 的 `/p/:slug` 本身 redirect 到 `/p/:slug/search`。

**`/p/:slug/account`（對帳頁）必須宣告在 `/p/:slug` 之前**，否則會被後者的子路由吃掉。

### 檔案對應

```
libs/booking-flow/src/lib/
  pages/                        # 四個路由頁，各自獨立
    search-page.component.*     # 租期 + 選車（原 step 1+2）
    order-page.component.*      # 單頁結帳（原 step 3+4+5）
    payment-page.component.*    # 付款（佔位，見下方「接金流」）
  components/
    order-summary-card.*        # 金額摘要卡（下單頁右側／手機底部）
    search-criteria-bar.*       # 租期摘要條 +「修改」
  steps/                        # 被頁面組合的展示元件，本身不含流程知識
    date-step / vehicle-step / dual-month-range-picker
    addon-step / coupon-step / confirm-step
    done.component.*            # 完成頁（歷史因素放在 steps/，實際是路由頁）
  booking-context.ts            # BOOKING_CONTEXT：夥伴身分與導頁前綴
  quote.service.ts              # 所有報價計算
  catalog.store.ts              # 資料存取與訂單寫入
  date-range.ts                 # DateRange／VehicleGroup 型別（admin 也在用）
```

## 三個設計決定

### 一、狀態放在網址，不放在元件

搜尋條件走 query params、選定車輛走 route param。這讓搜尋結果**可分享、可重整、可按上一頁** ——
這是拆頁的主要目的，不是附帶效果。

| 資料 | 位置 | 重整後 |
|---|---|---|
| 取還日期 | query params | 保留 |
| 取車／還車地點、車輛類型（機車/汽車） | query params | 保留 |
| 選定車輛 | route param | 保留 |
| 配件數量、優惠碼 | 下單頁元件內 signal | 遺失 |
| 訂單 | `BOOKING_REPO`（localStorage） | 保留 |

配件與優惠碼刻意不放網址：那一頁不是拿來分享的，重填的成本低於把整個購物車塞進網址的複雜度。

**因為網址可以被貼、被存、被過期**，兩個頁面都在載入時自我修正而不是渲染壞掉的畫面：
`OrderPageComponent` 的 `guardEffect` 在車輛或日期不成立時導回搜尋頁，
`PaymentPageComponent` 的 `guardEffect` 在訂單不存在或已非待付款時導向完成頁。
**新增頁面時要記得比照辦理** —— 這在拆頁架構下不是防禦性程式設計，是必要行為。

### 二、夥伴身分靠注入，不靠層層傳遞

重構前是 `[mode]` input 一路往下傳。拆頁之後頁面彼此獨立，沒有東西可以傳，
改成 `BOOKING_CONTEXT` injection token：

```ts
interface BookingContext {
  partner: Signal<Partner | null>;   // 消費者情境恆為 null
  basePath: Signal<string[]>;        // ['/'] 或 ['/p', slug]
}
```

- `booking` app 不提供，吃 root 預設值（消費者）。
- `affiliate` 的 `PartnerShellComponent` 在自己的 `providers` 提供夥伴版本。

**為什麼要一個 shell 元件？** route 層的 `providers` 建立的是 environment injector，
拿不到 `ActivatedRoute`（那是 node injector 提供的），所以讀不到 `:slug`。
元件層的 `providers` 可以。shell 的模板就是一個 `<router-outlet>` 加上失效連結畫面。

**所有 `router.navigate` 都必須以 `basePath()` 開頭。** 寫死 `/search` 或 `/order`
會讓夥伴客人跳出夥伴網址空間，而且不會有任何錯誤 —— 這是靜默失效，
測試裡有 consumer 與 partner 兩組導頁斷言就是在防這件事。

### 三、付款是一個獨立階段

重構前送出鍵直接建單並跳完成頁，沒有付款這回事。現在：

```
送出 → submitBooking() 建立 status: 'pending_payment' 的訂單 → 導向 /pay/:bookingId
     → markBookingPaid() 轉為 'confirmed' → 導向 /done/:id
```

`CatalogStore.submitBooking` 本來就寫 `pending_payment`，所以資料模型早就對了，
這次補上的是 UI 流程與 `markBookingPaid` 這個轉移。

## 動它之前要知道的事

**`QuoteService` 是唯一算價入口。** 搜尋頁與下單頁都用它，內部包 `CatalogStore.price()`。
無定價方案的車型回 `null` 而不是丟例外 —— `vehicle-step` 用 `null` 判斷車輛不可選，
`order-page` 的守衛也依賴它。**改成丟例外會讓所有車變成不可選**。

**使用者看到的金額與實際送出的金額必須一致。** 兩者都終結在 `calculatePrice()`、輸入相同，
所以目前一致。修改計價路徑時要維持這個性質。

**`booking` computed 不會因為資料被改動而重算。** `createInMemoryRepo` 是包在陣列外的
閉包，不是 signal 驅動的，`payment-page` 的 `booking` computed 只追蹤 `bookingId()`。
付款成功後畫面能更新，是因為**導頁**離開了那一頁，不是因為資料重讀。
接真金流時不能假設狀態改變畫面就會跟著更新。

**`date-step` / `vehicle-step` / `dual-month-range-picker` 有其他工作線在維護。**
`admin` 的 dashboard 與選車 dialog 也直接使用 `DateStepComponent`、`VehicleStepComponent`、
`DateRange`，所以改它們的 input/output 會同時影響 admin 與預約流程。

**`confirm-step` 仍宣告 `vehicle`/`startDate`/`endDate`/`selectedAddOnLines` 四個 input，
但元件內部已經不讀它們**（摘要移到 `order-summary-card` 之後只剩 `priceBreakdown` 給
`canSubmit` 用）。下單頁仍然綁著它們。要清理的話兩邊一起，不要只刪一邊。

## 接金流時實際要改什麼

`PaymentPageComponent` 是主要的替換點，但**不是唯一** —— 這點原始 spec 講得太滿，
以下是誠實的清單：

1. **`payment-page.component.ts`** — 把兩顆模擬按鈕換成金流 SDK 呼叫或轉址。
2. **`apps/booking/src/app/app.routes.ts`** — 新增回調路由 `pay/:bookingId/result`。
3. **`apps/affiliate/src/app/app.routes.ts`** — 同一條回調路由要在 `p/:slug` 的
   children 底下再加一次，否則夥伴客人付完款會掉回首頁。
4. **`CatalogStore.markBookingPaid()`** — 目前只收 `bookingId`。真實金流需要記錄
   交易編號、實付金額等，簽章很可能要擴充，`RentalBooking` 可能要加欄位。

`markBookingPaid` 已經會在訂單非 `pending_payment` 時丟錯，這是刻意的：
真實金流回調會遲到、重送、亂序，store 層必須拒絕不合理的狀態轉移，不能只靠 UI 擋。

## 已知缺口

**付款頁與完成頁對 `bookingId` 沒有任何權限檢查。** 拿到網址就能把別人的待付款訂單
標成已付款。這與整個 app 目前免登入的架構一致，但「標記付款」是拆頁後新增的公開可達動作，
**上線收真錢之前必須處理**。

**夥伴 banner 沒有樣式。** `.partner-banner` 在 repo 中從未有過對應的 CSS 規則，
重構前後都是裸 `div`。不是回歸，但夥伴通路的門面值得補。

**`done.component` 只分「已確認」與「其他」兩種文案。** 已取消的訂單落到完成頁會顯示
待付款字樣。

**`confirm-step.component.scss` 有一批孤兒規則**（`.summary-block`、`.summary`、`.line`
等），對應的 HTML 已在拆除時刪掉。

## 相關文件

- 設計決策的完整推導：`docs/superpowers/specs/2026-08-18-booking-flow-split-design.md`
- 逐步實作紀錄：`docs/superpowers/plans/2026-08-18-booking-flow-split.md`
- 定價與退佣公式：[`03-pricing-and-commission.md`](./03-pricing-and-commission.md)
- 各 app 路由總表：[`01-apps.md`](./01-apps.md)
