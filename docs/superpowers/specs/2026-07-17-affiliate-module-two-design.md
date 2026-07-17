# B2B 模組二（民宿/渠道分銷 affiliate）設計 Spec

**日期**：2026-07-17
**範圍**：民宿分銷——① 民宿專屬免登入代訂頁（協議價、訂單標記來源）＋② 自動退佣結算（退佣規則、月底帳單、CSV、民宿對帳頁）。
**前提**：純前端 mock（localStorage）、繁中、延續現有 car-rental monorepo（libs/domain + apps/admin + apps/booking 模組一已完成）。
**上游**：`docs/superpowers/plans/0715-B2B租車管理系統system_spec.md` §2（模組二原始規格）；`docs/superpowers/specs/2026-07-17-domain-lib-and-module-one-design.md`（模組一，被本模組複用）。

---

## 1. 目標與範圍

### 這輪要做

- **`libs/booking-flow`（新建 buildable lib）**：把模組一在 `apps/booking` 的五步預約流程（元件 + `CatalogStore`）抽出成共用庫，接受 `mode` 情境參數（consumer / partner）。
- **`apps/booking`**：改為薄殼，消費 `libs/booking-flow`（consumer 模式）。
- **`apps/affiliate`（新建 app）**：民宿代訂頁（partner 模式）＋民宿對帳頁。
- **`libs/domain` 擴充**：`Partner`（含協議折扣 + 退佣規則）、`RentalBooking` 加 `sourcePartnerId`、`calculatePrice` 加選填 `partnerDiscountPercent`、新純函式 `calculateCommission`。
- **`apps/admin` 擴充**：民宿管理（Partner CRUD）＋退佣帳單報表＋CSV 匯出。

### 這輪不做（延後）

真後端（跨 app 即時資料共享）、真金流、LINE LIFF、二維碼產生（連結即可）、多租戶權限、模組三～六。

### 架構鐵律（沿用）

元件只經 store；store 只依賴 `Repository<T>` 介面；車輛狀態只經 `VehicleStore.transition()`；apps 之間不互相 import（共用邏輯經 `libs/*`，跨 app 資料經共用 localStorage key）。

---

## 2. libs/booking-flow 抽取

把 `apps/booking/src/app/features/booking-flow/`（date/vehicle/addon/coupon/confirm/done 元件與容器）與 `apps/booking/src/app/stores/catalog.store.ts` 搬進 `libs/booking-flow/src/lib/`。

### 2.1 mode 情境參數

流程容器接受一個輸入：

```ts
export type FlowMode =
  | { kind: 'consumer' }
  | { kind: 'partner'; partner: Partner };
```

- **consumer 模式**：公開牌價；顯示優惠券步驟；送出的訂單 `sourcePartnerId` 為空。
- **partner 模式**：套 `partner.discountPercent` 協議折扣；**仍顯示優惠券步驟（協議折扣與消費者優惠券可並用）**；頁首顯示民宿名稱；送出的訂單帶 `sourcePartnerId = partner.id`。

### 2.2 對現有 booking 的影響（風險控制）

抽取為行為不變的重構。`apps/booking` 保留自己的 app.config（六個共用 repo 的 provider 不動）與路由，只把 feature/store 改為 import 自 `@car-rental/booking-flow`，並以 consumer 模式呼叫。**驗收檢查點：搬完後 `apps/booking` 既有 8 測試維持綠**（CatalogStore 測試隨檔案搬到 lib，計入 booking-flow lib 的測試數，總測試數不得減少）。

tsconfig 別名 `@car-rental/booking-flow` → `libs/booking-flow/src/index.ts`（比照 `@car-rental/domain`）。

---

## 3. libs/domain 擴充

### 3.1 Partner 與 CommissionRule

```ts
export type CommissionType = 'percent' | 'per_vehicle_day';
export interface CommissionRule {
  type: CommissionType;
  value: number; // percent：百分比（10 = 抽 10%）；per_vehicle_day：每台每天固定額（TWD）
}
export interface Partner {
  id: string;
  name: string;         // 民宿名稱
  slug: string;         // 專屬連結用（/p/:slug），唯一
  discountPercent: number; // 協議折扣（0–100，10 = 打 9 折）
  commission: CommissionRule;
}
```

### 3.2 RentalBooking 加來源

`RentalBooking` 新增選填 `sourcePartnerId?: string`（既有直客單為空，維持相容）。

### 3.3 calculatePrice 加協議折扣

`calculatePrice` 的 input 新增選填 `partnerDiscountPercent?: number`；`PriceBreakdown` 新增 `partnerDiscountPercent`、`partnerDiscount` 兩欄。**疊加順序（不可改）**：

1. 逐日日期定價加總 = `rentalRaw`
2. 天數累折 → `rentalSubtotal = rentalRaw - tierDiscountAmount`
3. **協議折扣**：`partnerDiscount = round(rentalSubtotal × partnerDiscountPercent/100)`；`afterPartner = rentalSubtotal - partnerDiscount`
4. **優惠券**（施於協議折扣後）：`percent` → `round(afterPartner × value/100)`；`amount` → `min(value, afterPartner)`
5. `total = afterPartner - couponDiscount + addOnSubtotal`

未帶 `partnerDiscountPercent` 時 `partnerDiscount = 0`、`afterPartner = rentalSubtotal`（consumer 模式與模組一行為完全一致，既有測試不受影響）。

### 3.4 calculateCommission 純函式

```ts
export function calculateCommission(input: {
  rule: CommissionRule;
  rentalSubtotal: number; // 退佣基數＝PriceBreakdown.rentalSubtotal（累折後、協議/優惠券折扣前）
  days: number;
}): number;
```

- `percent` → `round(rentalSubtotal × value/100)`
- `per_vehicle_day` → `value × days`（一張單一台車）
- 邊界：days 0 → per_vehicle_day 得 0；rentalSubtotal 0 → percent 得 0。

**退佣基數固定用 `rentalSubtotal`**（配件不列入退佣；協議折扣與優惠券不影響退佣基數——退佣是車行對民宿的獨立回饋）。

---

## 4. apps/affiliate（新 app，不套 theme-pack）

app.config 提供與 admin 同 key 的共用 repo（含新增的 `PARTNER_REPO`，key `cr.partners`），讓它讀得到 admin 設定的民宿/車輛/定價。

### 4.1 代訂頁 `/p/:slug`

- 用路由 `slug` 從 `PARTNER_REPO` 找 Partner；找不到顯示「連結無效」。
- 以 partner 模式跑 `libs/booking-flow`（頁首顯示民宿名、套協議折扣、送出訂單帶 `sourcePartnerId`）。
- 送出後同模組一：寫 `pending_payment` 訂單、關聯 Customer、到完成頁。免登入。

### 4.2 民宿對帳頁 `/p/:slug/account`

- 列出 `sourcePartnerId === partner.id` 的訂單、每筆 `calculateCommission` 退佣、累計佣金合計。
- 顯示撥款進度（mock）：見 §5 的月結撥款狀態。

---

## 5. apps/admin 擴充

### 5.1 民宿管理頁 `/partners`

Partner CRUD（name/slug/協議折扣/退佣規則），經 `PartnerStore` → `PARTNER_REPO`。slug 唯一性檢查。提供「複製代訂連結」動作（組出 `/p/:slug` 字串供貼給民宿；純字串，不產二維碼）。

### 5.2 退佣帳單報表 `/commission`

- 選民宿 + 月份 → 列出該月（依訂單 `startTime` 或建立時間歸月，取 `startTime`）該來源民宿的訂單：車款、租期、租金小計、退佣金額；合計退佣。
- **CSV 匯出**：純前端組 CSV 字串 + Blob 下載（UTF-8 BOM 以利 Excel 開繁中），欄位＝訂單編號/車款/租期起訖/租金小計/退佣。
- **撥款進度（mock）**：以 `MonthlyPayout` 記錄（partnerId + yyyy-mm + status: 'pending'|'paid'），admin 可標記某民宿某月「已撥款」。對帳頁讀此狀態顯示進度。key `cr.payouts`。

---

## 6. 檔案結構

```
libs/booking-flow/src/
  index.ts
  lib/booking-flow.component.ts + steps/*         # 從 apps/booking 搬入
  lib/catalog.store.ts                            # 從 apps/booking 搬入，加 partner 模式支援
  lib/flow-mode.ts                                # FlowMode 型別

libs/domain/src/lib/
  models/partner.ts, commission.ts, monthly-payout.ts   # 新增
  models/rental-booking.ts                        # 加 sourcePartnerId
  pricing/calculate-price.ts                       # 加 partnerDiscountPercent
  commission/calculate-commission.ts               # 新增純函式
  repositories/{tokens,seed-data}.ts               # 加 PARTNER_REPO/PAYOUT_REPO + seed

apps/booking/src/app/                              # 薄殼，consumer 模式消費 booking-flow
apps/affiliate/src/app/
  app.config.ts, app.routes.ts
  features/partner-booking/                        # /p/:slug 代訂（partner 模式）
  features/partner-account/                        # /p/:slug/account 對帳頁
  stores/                                          # 讀共用 repo

apps/admin/src/app/
  features/partners/                               # 民宿管理 CRUD
  features/commission/                             # 退佣帳單報表 + CSV
  stores/partner/, stores/commission/
```

tsconfig 別名新增 `@car-rental/booking-flow`。

---

## 7. 測試策略

| 對象 | 方式 |
|---|---|
| `calculatePrice` 加協議折扣 | 補測試：帶 partnerDiscountPercent 的疊加（協議折扣→優惠券順序）、未帶時與模組一結果一致 |
| `calculateCommission` | 純函式重測：percent、per_vehicle_day、days 0、rentalSubtotal 0 |
| booking-flow 抽取 | 搬完 booking 8 測試維持綠（CatalogStore 測試移入 lib）；partner 模式 CatalogStore 送出帶 sourcePartnerId 的測試 |
| PartnerStore / CommissionStore | CRUD 與 slug 唯一性；報表歸月與合計；CSV 字串格式（含 BOM、欄位）測試 |
| affiliate 流程 | happy path：/p/:slug 走完送出一筆帶 sourcePartnerId 的 pending_payment 單 |

測試守恆：抽取不得減少既有測試總數；新功能各自附測試。

---

## 8. 已知限制（純前端 mock，延續模組一）

admin / booking / affiliate 為三個獨立 app（三個 port＝三個 origin），localStorage per-origin，**不跨 app 即時共享**。demo 時各 app 各自 seed 同一份資料；「partner 於 affiliate 下單即時進 admin 退佣報表」要待真後端（換 Repository 實作）。seed 會放數筆帶 `sourcePartnerId` 的訂單，讓 admin 退佣報表與對帳頁有資料可展示。

---

## 9. 驗收條件

1. `libs/booking-flow` 建立、別名可用；`apps/booking` 改用後既有 8 測試維持綠。
2. `calculatePrice` 協議折扣疊加測試通過；未帶 partner 時與模組一結果一致（既有 domain 測試不變）。
3. `calculateCommission` 兩型態 + 邊界測試通過。
4. `apps/affiliate` 可經 `/p/:slug` 走完代訂送出帶 `sourcePartnerId` 的 pending_payment 單；`/p/:slug/account` 列出退佣與累計。
5. admin `/partners` 可 CRUD 民宿；`/commission` 可選民宿+月份出報表、匯出 CSV、標記撥款。
6. `nx build domain/admin/booking/affiliate/booking-flow` 全過；`npm run lint:theme` 通過（booking/affiliate 未套主題不受影響）；全專案測試全綠。
