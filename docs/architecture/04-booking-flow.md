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
| 搜尋 | `/search?start=&end=&group=` | `/p/:slug/search?start=&end=&group=` |
| 下單 | `/order/:vehicleId?start=&end=&group=` | `/p/:slug/order/:vehicleId?start=&end=&group=` |
| 付款 | `/pay/:bookingId` | `/p/:slug/pay/:bookingId` |
| 完成 | `/done/:id` | `/p/:slug/done/:id` |

`group` 是車輛大類（`car`／`scooter`，缺省不篩選）。**網址上沒有取車／還車地點的 query
param**——兩個地點都已改成資料庫查得到的據點 id（見 `RENTAL_BRANCHES`，`02-libs.md`），
不再是使用者手動輸入、適合放進網址的機場／港口／店舖三選一：

- **取車據點不讓使用者選**，直接吃選定那台車的 `vehicle.location`（`order-page.component.ts`
  的 `pickupLocation`）。這是刻意的產品決定，不是漏做欄位——車輛所在據點就是它能被取走的
  地方，讓使用者另外選一個不同的取車據點在這個 prototype 沒有意義。
- **還車據點**在下單頁的 `confirm-step` 表單裡選（`RentalBranch` 下拉），送出訂單時寫進
  `returnLocation`，同樣不經過網址。

**兩個頁面對缺參數的寬鬆度刻意不同**：

- **搜尋頁寬容** —— 只要有 `start`／`end` 就成立，日期缺省時查詢結果就是空的，並不會替
  使用者猜地點或補值。這讓加入車輛篩選之前發出的連結仍然可用。
- **訂單頁嚴格** —— 車輛或租期任一缺一就導回搜尋頁，不替使用者猜。那一頁即將寫入跟金額與
  履約有關的訂單資料，讓畫面帶著空車輛或空日期渲染是不能接受的。

`group` 來自使用者可編輯的網址字串，一律經 `toVehicleGroup()` 驗證；不認得的值當成未指定
而非拿去查表，否則 `/search?group=truck` 會讓整頁渲染失敗。

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
| 取還日期、車輛類型（機車/汽車） | query params | 保留 |
| 選定車輛 | route param | 保留 |
| 取車地點 | 衍生值，不單獨存（`vehicle.location`） | 保留（隨選定車輛而定） |
| 還車地點、配件數量、優惠碼 | 下單頁元件內 signal | 遺失 |
| 訂單 | `BOOKING_REPO`（localStorage） | 保留 |

配件與優惠碼刻意不放網址：那一頁不是拿來分享的，重填的成本低於把整個購物車塞進網址的複雜度。

**因為網址可以被貼、被存、被過期**，兩個頁面都在載入時自我修正而不是渲染壞掉的畫面：
`OrderPageComponent` 的 `guardEffect` 在車輛或日期不成立時導回搜尋頁，
`PaymentPageComponent` 的 `guardEffect` 在訂單不存在或已離開可付款的 `reserved` 狀態時導向
完成頁（`reserved` 只代表尚未交車，不代表付款與否，見下方第三個設計決定）。
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
送出 → submitBooking() 建立 status: 'reserved' 的訂單 → 導向 /pay/:bookingId
     → markBookingPaid() 在付款分類帳追加一筆 confirmed 的 balance PaymentRecord → 導向 /done/:id
```

**`BookingStatus` 不再有 `pending_payment`／`confirmed` 這兩個值**（見
`libs/domain/src/lib/models/enums.ts`）。履約狀態只剩 `reserved`／`in_progress`／
`completed`／`cancelled`，只描述車輛交接進度；付款是否完成改由 Task 7 建立的付款分類帳
（`PaymentRecord` 系列，`libs/domain/src/lib/models/payment-record.ts`）獨立追蹤，`PaymentRecordStatus`
才有 `pending`／`confirmed`／`failed`／`voided`。`CatalogStore.submitBooking` 建單時
直接寫 `status: 'reserved'`，`markBookingPaid` 完全不碰 `booking.status`，只在
`paymentRepo` 追加一筆 `purpose: 'balance'`、`status: 'confirmed'` 的付款紀錄；
`PaymentStore.summaryFor` 之後靠掃這本分類帳算出已付金額，而不是看訂單狀態欄位。

舊資料裡真正還在用 `pending_payment`／`confirmed` 這兩個 legacy booking status 值的，
由 `libs/domain/src/lib/repositories/normalize-rental-booking.ts` 在讀取時統一遷移為
`reserved`（`normalize-rental-booking.spec.ts` 有遷移測試），不會在應用程式邏輯裡出現。
`markBookingPaid` 的冪等性怎麼做，見下方「接金流時實際要改什麼」。

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

`markBookingPaid` 目前的冪等性只靠「該訂單是否已有 confirmed 的 balance 付款紀錄」判斷，
不再檢查 `booking.status`（因為履約狀態已經不代表付款進度）。真實金流回調會遲到、重送、
亂序，接手時仍要在 store 層擋重複記帳，只是判斷依據要改成查付款分類帳，不能只靠 UI 擋，
也不能倒退回「靠 booking 狀態擋」的舊模式。

## 已知缺口

**付款頁與完成頁對 `bookingId` 沒有任何權限檢查。** 拿到網址就能把別人尚未付款的訂單
標成已付款。這與整個 app 目前免登入的架構一致，但「標記付款」是拆頁後新增的公開可達動作，
**上線收真錢之前必須處理**。

**官網下單目前不會產生合約版本。** 櫃檯（admin）建單時會同時建立 `ContractVersion`，
但 `apps/booking/src/app/app.config.ts` 目前只 provide 八個共用 Repository（見
`01-apps.md`「booking」一節），其中不含 `CONTRACT_VERSION_REPO` 或
`SIGNATURE_ASSET_STORE`，官網訂單流程也從未寫入合約。結果是官網客人送出訂單後沒有東西可簽——就算之後把 `@car-rental/contract-signing`
接到官網，也要先有合約版本才有得簽。合約該在哪個時間點產生（送出當下／付款完成後／櫃檯
確認後）待業主決定，見 `docs/owner-questions.md` 第 3 條；接手步驟見
`docs/plans/2026-09-22-orders-page-backend-handoff.md`。

**夥伴 banner 沒有樣式。** `.partner-banner` 在 repo 中從未有過對應的 CSS 規則，
重構前後都是裸 `div`。不是回歸，但夥伴通路的門面值得補。

**`confirm-step.component.scss` 有一批孤兒規則**（`.summary-block`、`.summary`、`.line`
等），對應的 HTML 已在拆除時刪掉。

**業者復原的替代車不能只看「目前可用」。** 同級調車必須同車種，且載客數、行李數與空調能力
完全相同；免費升等也必須同車種、不得降低這三項能力，並至少提升一項。這是現有資料模型能驗證的
交付能力，不以 `classLabel` 的人類可讀文字猜測等級順序。任一能力資料缺漏時，系統保守地不列為
可選替代車；正式後端需要把這些能力欄位設為可驗證的車隊主檔資料。

**訂單清單不能直接批次取消。** 仍可批次選取及匯出，但取消必須逐筆開啟工作區，才能收集責任、
試算、退款／保留金同意與稽核資料；批次取消按鈕刻意不顯示。

**業者責任取消尚可從一般取消表單直接建立。** 工作區會明確引導人員先嘗試同級調車、免費
升等與同業轉單，但目前尚未在一般取消表單強制驗證已完成這些救單步驟；因此遺失的是流程稽核
與順序保護，而非退款金額計算。正式導入前應讓 `operator_fault` 取消只接受已升級為取消的
`OperatorRecoveryCase`。

## 相關文件

- 定價與退佣公式：[`03-pricing-and-commission.md`](./03-pricing-and-commission.md)
- 各 app 路由總表：[`01-apps.md`](./01-apps.md)
- 訂單頁面化（2026-09-22）前端待辦：`docs/plans/2026-09-22-orders-page-frontend-todo.md`
- 為什麼建單流程不與官網共用：`docs/adr/0001-order-creation-not-shared-with-booking-site.md`
