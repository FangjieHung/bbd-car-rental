# 計費與退佣的業務邏輯

這份文件只講「錢怎麼算」——租金怎麼算給消費者看、退佣怎麼算給民宿看。程式碼位置、
呼叫關係見 `02-libs.md`。

## 一、租金怎麼算：`calculatePrice()`

檔案：`libs/domain/src/lib/pricing/calculate-price.ts`。輸入一段租期、一個定價方案、
選配的配件/優惠券/協議折扣，輸出一份 `PriceBreakdown`（逐項明細）。

### 疊加順序（這是唯一正確的順序，改動前要很確定）

```
1. 逐日定價加總
   dailyLines：每一晚依「日型」（平日/假日/國定假日/旺季，見 classifyDay()）查 PricingPlan.dayTypeRates
   rentalRaw = Σ dailyLines[].price

2. 天數累折（依租期天數查 PricingPlan.tiers，取符合的最高級距）
   tierDiscountAmount = round(rentalRaw × tierDiscountPercent / 100)
   rentalSubtotal = rentalRaw − tierDiscountAmount        ← 退佣的計算基數就是這一格，見下方第二節

3. 協議折扣（只有 partner 模式才有值，consumer 模式恆為 0）
   partnerDiscount = round(rentalSubtotal × partnerDiscountPercent / 100)
   afterPartner = rentalSubtotal − partnerDiscount

4. 優惠券（施加在協議折扣「之後」——民宿折扣跟消費者優惠券可以疊加）
   percent 型：couponDiscount = round(afterPartner × value / 100)
   amount 型： couponDiscount = min(value, afterPartner)   ← 不會扣成負數

5. 配件（不算日型、不算折扣，per_day 才乘天數）
   addOnSubtotal = Σ addOn.unitPrice × qty × (per_day ? days : 1)

6. 總金額
   total = afterPartner − couponDiscount + addOnSubtotal
```

### 例子

3 個平日、單日 400 元、天數累折 5%、協議折扣 10%、優惠券 amount 型 50 元：

```
rentalRaw        = 400 × 3 = 1200
tierDiscountAmount = round(1200 × 5%) = 60
rentalSubtotal    = 1200 − 60 = 1140
partnerDiscount   = round(1140 × 10%) = 114
afterPartner      = 1140 − 114 = 1026
couponDiscount    = min(50, 1026) = 50
total（不含配件）  = 1026 − 50 = 976
```

（實際測試案例見 `libs/domain/src/lib/pricing/calculate-price.spec.ts`。）

### 消費者版跟民宿版是同一個函式

`partnerDiscountPercent` 是選填參數，consumer 模式（booking app）不帶這個參數，
`calculatePrice()` 內部會當成 0 處理，第 3 步等於跳過——這保證了模組二上線後，
booking app 原本的計價結果完全不變，不用擔心退佣功能上線影響到既有消費者訂單金額。

## 二、退佣怎麼算：`calculateCommission()`

檔案：`libs/domain/src/lib/commission/calculate-commission.ts`。

```ts
function calculateCommission(input: {
  rule: CommissionRule;      // 這間民宿的退佣規則（Partner.commission）
  rentalSubtotal: number;    // 退佣基數
  days: number;
}): number {
  return rule.type === 'percent'
    ? round(rentalSubtotal × rule.value / 100)
    : rule.value × days;     // per_vehicle_day：每台每天固定金額
}
```

**退佣基數固定用 `rentalSubtotal`**（上面公式的第 2 步結果：天數累折後、
**協議折扣與優惠券折扣之前**）。這是刻意的業務規則，不是算錯：

- 配件金額不算進退佣——民宿介紹的是「租車」這件事，配件是加購，車行不用為加購付民宿佣金。
- 協議折扣、優惠券都不影響退佣基數——退佣是車行給民宿的獨立回饋，不因為車行自己給消費者
  折扣或民宿自己談的協議折扣而縮水，民宿介紹一筆訂單該拿多少退佣是固定的。

兩種退佣規則對照民宿管理頁的欄位（`/partners`）：

| `CommissionRule.type` | 意思 | 範例（seed 資料） |
|---|---|---|
| `percent` | 抽 `rentalSubtotal` 的百分比 | 海景民宿（`pt1`）：10% |
| `per_vehicle_day` | 每台車每天固定金額 × 租期天數 | 陽光民宿（`pt2`）：每台每天 100 元 |

## 三、對帳／報表怎麼組出來

退佣公式本身很單純，真正的邏輯在「怎麼從一堆訂單篩出該算的那幾筆、怎麼歸月、
怎麼組報表」，這段邏輯**在兩個地方各寫了一份**（admin 給員工看、affiliate 給民宿看），
邏輯應該一致但目前是兩份獨立程式碼：

| | admin `/commission`（員工視角） | affiliate `/p/:slug/account`（民宿視角） |
|---|---|---|
| 檔案 | `apps/admin/src/app/stores/commission/commission.store.ts` | `apps/affiliate/src/app/stores/partner-account.store.ts` |
| 篩選 | 選定 `partnerId` + `yyyy-mm`，`booking.sourcePartnerId === partnerId && booking.startTime` 落在該月 | 該 partner 的**全部**訂單（不分月，前端自己依 `month` 分組顯示） |
| 歸月依據 | `booking.startTime.slice(0, 7)` | 同左：`booking.startTime.slice(0, 7)` |
| 天數怎麼算 | `rentalDays()`：優先用 `priceBreakdown.dailyLines.length`（等於 `calculatePrice()` 算出的晚數），沒有才 fallback 用 `Math.ceil((endTime−startTime)/一天)` | `daysBetween()`：**固定**用 `Math.round((endTime−startTime)/一天)`，不看 `priceBreakdown` |
| 撥款狀態 | `getPayoutStatus(partnerId, yyyyMm)` 查 `PAYOUT_REPO`，無記錄視為 `pending` | 同一份 `PAYOUT_REPO`，邏輯相同 |
| 額外功能 | CSV 匯出（`toCsv()`，UTF-8 BOM）、`markPaid()` 標記已撥款 | 無（唯讀對帳頁） |

> **已知的小落差（尚未修）**：admin 那份的天數計算優先用 `priceBreakdown.dailyLines.length`
> （跟計價時用的晚數定義一致），affiliate 那份直接用時間戳算天數，兩者在
> `startTime`/`endTime` 不是整日邊界（例如取車 09:00、還車隔天 09:00 屬正常，
> 但若時間再更複雜）時可能有 1 天以內的差異，進而讓 `per_vehicle_day` 類型的
> 退佣金額兩邊算出不同數字。目前 seed 資料的時間都是簡單案例，看不出差異，
> 但如果要做「兩邊金額對得起來」的驗收，這是第一個該查的地方。理想修法是抽成
> 同一個共用函式（例如放進 `libs/domain`），而不是兩處各自實作。

CSV 欄位（`CommissionStore.toCsv()`）：`訂單編號 / 車款 / 租期起訖 / 租金小計 / 退佣`，
UTF-8 BOM 開頭，確保用 Excel 開啟繁體中文不亂碼。

## 四、撥款狀態怎麼管理

`MonthlyPayout`（`partnerId + month('YYYY-MM') + status('pending'|'paid')`）是獨立於
訂單之外的「這個民宿這個月的錢撥了沒」記錄，存在 `PAYOUT_REPO`（key `cr.payouts`）。
沒有記錄視為 `pending`（第一次結算前不用手動建立 pending 記錄）。admin 在 `/commission`
頁按「標記已撥款」才會真的寫入一筆 `status: 'paid'` 的記錄；affiliate 對帳頁純讀這份資料，
不能改。**沒有「取消已撥款」的操作**——目前 UI 沒做這個，需要更正的話要直接改 `localStorage`
或之後補功能。
