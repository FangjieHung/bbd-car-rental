# libs/domain + B2B 模組一（基礎租車引擎）設計 Spec

**日期**：2026-07-17
**範圍**：建立共用資料地基 `libs/domain`，並在其上實作 B2B 模組一的「定價 + 配件 + 優惠券 + booking 前台預約到明細確認頁」垂直切片。
**前提**：純前端 mock（localStorage）、延續現有 car-rental admin MVP、繁中單語系。
**上游**：`docs/superpowers/plans/0715-B2B租車管理系統system_spec.md`（模組一原始規格）、`scratchpad/b2b-roadmap.md`（六模組拆解 roadmap）。

---

## 1. 目標與範圍

### 這輪要做

- **`libs/domain`（新建 buildable lib）**：把 booking 與 admin 共用的 domain model + `Repository<T>` 介面 + localStorage 實作集中於此。
- **`apps/admin` 擴充**：Vehicle 車籍模型擴充；新增三個設定頁——定價規則、配件、優惠券。
- **`apps/booking` 前台**：預約流程 `選租期 → 選車款 → 選配件 → 優惠券 → 明細確認頁 → 送出`（不套 theme-pack，用預設樣式）。

### 這輪不做（延後）

真金流串接、CMS 官網設定（另開 spec）、多租戶權限、模組二～六全部功能。明細確認頁的付款方式僅為 UI 選項，不觸發任何金流 API。

### 架構鐵律（沿用現有專案）

- 元件只經 Signal store；store 只依賴 `Repository<T>` 介面（換真後端只換實作，不動 UI）。
- 車輛狀態只經 `VehicleStore.transition()`。
- 跨 app 資料共享一律經 `Repository<T>` 的 mock 實作（共用 localStorage key），apps 之間不互相 import。

---

## 2. libs/domain：搬遷與新增

### 2.1 從 admin 搬進 libs/domain（共用 model）

| Model | 現況 | 這輪處理 |
|---|---|---|
| `Vehicle` | admin/core/models | 搬入 + 擴充（見 2.3） |
| `Customer` | admin/core/models | 原樣搬入 |
| `RentalBooking` | admin/core/models | 搬入 + 擴充價格欄位（見 2.4） |
| `Repository<T>` 介面 | admin/core/repositories/repository.ts | 搬入 |
| localStorage 實作 | admin/core/repositories/local-storage-repository.ts | 搬入 |
| repository tokens / seed-data / testing helper | admin/core/repositories | 搬入（seed-data 併入新 model 的種子） |

**留在 admin（不共用）**：`MaintenanceRecord`、`MaintenanceAlert`、`MaintenanceType`（僅後台保養用）。

**遷移風險與檢查點**：搬 model 會改動 admin 現有 46 個測試的 import 路徑。實作計畫必須以「搬完 model → 全域改 import → 跑測試確認 admin 46 + theme-pack 7 = 53 全綠」作為獨立可驗收的第一個 task，未綠不得往下。

### 2.2 libs/domain 新增 model（模組一定價相關）

```ts
// 車款定價方案（後台維護，前台計價讀取）
export type DayType = 'weekday' | 'weekend' | 'holiday' | 'peak';

export interface PricingPlan {
  id: string;
  name: string;                 // 車款名，如「SYM 機車 125」
  appliesToCategory: VehicleCategory; // 綁定車型分類（見 2.3）
  dayTypeRates: Record<DayType, number>; // 四種每日價（TWD）
  tiers: DayTier[];             // 天數累折級距（見下）
}

// 天數累折：以折扣百分比施加在日期類型計價之上
// 設計取捨：用折扣% 而非絕對每日價，避免與日期類型定價衝突
export interface DayTier {
  minDays: number;              // 達此天數起適用
  discountPercent: number;      // 0–100，如 5 表示打 95 折
}

// 特殊日期行事曆（後台維護；決定某天屬 holiday / peak）
export interface SeasonCalendar {
  id: string;
  holidays: DateRange[];        // 國定連假等
  peakSeasons: DateRange[];     // 旺季，如花火節期間
}
export interface DateRange { start: string; end: string; } // ISO date（含當日）

// 配件加購
export type AddOnUnit = 'per_rental' | 'per_day';
export interface AddOn {
  id: string;
  name: string;                 // 安全帽 / 雨衣 / 兒童安全座椅…
  unitPrice: number;
  unit: AddOnUnit;              // per_rental=一次性；per_day=每日
}

// 優惠券
export type CouponType = 'percent' | 'amount';
export interface Coupon {
  id: string;
  code: string;
  type: CouponType;             // percent=折%；amount=折固定金額
  value: number;
  minDays?: number;             // 最少租用天數
  applicableCategories?: VehicleCategory[]; // 限特定車型，未設=不限
  validFrom: string;            // ISO date
  validTo: string;              // ISO date
}
```

### 2.3 Vehicle 擴充

```ts
export type VehicleCategory = 'car' | 'scooter' | 'ev'; // 汽車 / 機車 / 電動車

export interface Vehicle {
  id: string;
  plateNumber: string;
  category: VehicleCategory;     // 新，取代舊 type
  model: string;
  brand: string;                // 新，廠牌
  displacement?: number;        // 新，排氣量（cc；ev 可空）
  year: number;                 // 新，年分
  status: VehicleStatus;        // 沿用狀態機
  mileage: number;
  nextServiceMileage?: number;  // 新，定保里程預警
  insuranceExpiry?: string;     // 新，保險到期日 ISO
  createdAt: string;
}
```

**舊 `type: 'scooter'|'car'` → `category` 遷移**：seed-data 與現有測試資料的 `type` 值對應到 `category`（scooter→scooter、car→car），新欄位給合理預設值。VehicleStatus 狀態機不變。

### 2.4 RentalBooking 擴充

```ts
export interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;        // 沿用
  // 新增（前台預約產生；admin 既有單這些欄位可空以維持相容）
  addOns?: BookedAddOn[];
  couponCode?: string;
  priceBreakdown?: PriceBreakdown;
  paymentMethod?: PaymentMethod; // UI 選項紀錄，非真實金流
}
export interface BookedAddOn { addOnId: string; qty: number; }
export type PaymentMethod = 'credit_card' | 'line_pay' | 'on_site';
```

---

## 3. 定價引擎（libs/domain 核心）

### 3.1 介面

```ts
export interface PriceLineDay { date: string; dayType: DayType; price: number; }
export interface PriceLineAddOn { addOnId: string; name: string; qty: number; amount: number; }

export interface PriceBreakdown {
  dailyLines: PriceLineDay[];
  rentalRaw: number;            // 逐日原價加總
  tierDiscountPercent: number;  // 命中的累折%
  tierDiscountAmount: number;
  rentalSubtotal: number;       // 累折後租金
  addOnLines: PriceLineAddOn[];
  addOnSubtotal: number;
  couponCode?: string;
  couponDiscount: number;       // 施加在 rentalSubtotal 上
  total: number;                // 應付總計
}

export function calculatePrice(input: {
  plan: PricingPlan;
  calendar: SeasonCalendar;
  startDate: string; endDate: string;   // ISO date，租期 [start, end)
  addOns: { addOn: AddOn; qty: number }[];
  coupon?: Coupon;
}): PriceBreakdown;
```

### 3.2 計價規則（純函式，無副作用）

1. **逐日日期分類**：對租期內每一天判定 `dayType`，優先序 `peak > holiday > weekend > weekday`（旺季與連假由 `SeasonCalendar` 覆蓋；否則週六日為 weekend，其餘 weekday）。取 `plan.dayTypeRates[dayType]` 為當日價，記入 `dailyLines`。
2. **租金原價** `rentalRaw` = 所有 `dailyLines.price` 加總。
3. **天數累折**：以總租期天數，取 `tiers` 中 `minDays <= days` 的最大 `minDays` 那一級的 `discountPercent`；`tierDiscountAmount = round(rentalRaw * pct/100)`；`rentalSubtotal = rentalRaw - tierDiscountAmount`。
4. **配件**：每項 `amount = unitPrice * qty * (unit==='per_day' ? days : 1)`；加總為 `addOnSubtotal`。
5. **優惠券**（施加在 `rentalSubtotal`）：先驗證有效（日期在 validFrom~validTo、days >= minDays、車型在 applicableCategories）；有效才計 `couponDiscount`：`percent` → `round(rentalSubtotal * value/100)`；`amount` → `min(value, rentalSubtotal)`。無效則 `couponDiscount=0` 且不記 couponCode。
6. **總計** `total = rentalSubtotal - couponDiscount + addOnSubtotal`。

### 3.3 邊界

- 租期 0 天（start===end）：回傳全 0 的 breakdown，不報錯。
- 跨月/跨年租期：逐日分類自然處理。
- 金額一律整數 TWD，折扣用 `Math.round`。

---

## 4. apps/admin 新增設定頁

沿用現有 feature/store/repository 分層與 Verdant 樣式。各頁皆為 CRUD，經各自 store → Repository：

- **定價規則頁**：`PricingPlan` 的 CRUD（四種每日價、累折級距編輯）＋ `SeasonCalendar` 特殊日期維護。
- **配件頁**：`AddOn` CRUD。
- **優惠券頁**：`Coupon` CRUD（含有效期間、最少天數、車型限制）。
- **車籍頁擴充**：既有 vehicle-form 加入新欄位（category/brand/displacement/year/保險到期/定保里程）。

---

## 5. apps/booking 前台流程

不套 theme-pack，用 Angular Material 預設樣式。單一 feature「booking-flow」，經 booking 自己的 store 讀共用 Repository（同一組 localStorage key，讀得到 admin 設定的定價/配件/優惠券/車輛）。

**步驟**：

1. **選租期**：起訖日期 + 時間。
2. **選車款**：顯示該租期內 `status==='available'` 的車款（依 category 分組），呼叫 `calculatePrice` 即時預覽各車款租金。
3. **選配件**：勾選 `AddOn` 與數量。
4. **輸入優惠券**：輸入 code，即時驗證與試算折抵（無效顯示原因）。
5. **明細確認頁**（本輪前台終點）：
   - 購買內容：車款、租期（起訖）、取/還車地點、配件清單
   - 應付金額：`PriceBreakdown` 全欄位（租金小計、配件、優惠折抵、應付總計）
   - 付款人姓名、聯絡電話、Email
   - 付款方式：信用卡 / LINE Pay / 現場付款（UI 選項，不觸發金流）
6. **送出**：寫一筆 `RentalBooking`（status=`confirmed`，帶 addOns/couponCode/priceBreakdown/paymentMethod）進 localStorage，並在需要時建立/關聯 `Customer`。顯示完成頁。無金流。

---

## 6. 檔案結構

```
libs/domain/src/
  index.ts                       # barrel
  lib/models/                    # vehicle, customer, rental-booking, pricing-plan, add-on, coupon, price-breakdown, enums
  lib/repositories/              # repository.ts, local-storage-repository.ts, tokens.ts, seed-data.ts, testing.ts
  lib/pricing/                   # calculate-price.ts + date-classify.ts（純函式）

apps/admin/src/app/
  core/models/                   # 只剩 maintenance 相關
  features/pricing/              # PricingPlan + SeasonCalendar 設定頁
  features/add-ons/              # AddOn 設定頁
  features/coupons/              # Coupon 設定頁
  stores/pricing|addon|coupon/   # 對應 store
  （features/vehicles 既有頁擴充表單欄位）

apps/booking/src/app/
  features/booking-flow/         # 五步驟前台 + 明細確認 + 完成頁
  stores/                        # 讀共用 Repository
```

tsconfig 路徑別名 `@car-rental/domain` 指向 `libs/domain/src/index.ts`（比照現有 `@car-rental/theme-pack`）。

---

## 7. 測試策略

| 對象 | 方式 |
|---|---|
| `calculatePrice` / 日期分類 | 純函式單元測試為重點：日期類型優先序、累折級距邊界（1天/剛好3天/超過）、配件 per_day vs per_rental、優惠券 percent/amount/過期/車型限制/最少天數、疊加順序、0 天邊界、金額四捨五入 |
| model 搬遷 | 搬完即跑：admin 46 + theme-pack 7 = 53 全綠（第一個 task 的驗收） |
| 新設定頁 store | 比照現有 store 測試 pattern（CRUD 經 mock Repository） |
| booking 前台 | happy path 走一次（選租期→車款→加購→優惠券→明細→送出寫入一筆 booking） |

測試守恆原則：搬遷不得減少既有測試數；新功能各自附測試。

---

## 8. 驗收條件（whole-slice）

1. `libs/domain` 建立且 `@car-rental/domain` 別名可用；admin 改用共用 model 後 53 測試全綠。
2. 定價引擎單元測試涵蓋第 7 節所列全部情境並通過。
3. admin 三個設定頁 + 車籍擴充可 CRUD，資料進 localStorage。
4. booking 前台可從選租期一路走到明細確認頁，金額與 admin 設定的定價/配件/優惠券一致，送出後 localStorage 多一筆 confirmed booking。
5. `nx build admin`、`nx build booking`、`nx build` 全過；`npm run lint:theme` 通過（booking 未套主題不受影響）。
