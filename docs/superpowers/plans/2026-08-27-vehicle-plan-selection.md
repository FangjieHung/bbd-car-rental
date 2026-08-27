# 選車詳情／保險方案頁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `search` 與 `order/:vehicleId` 之間插入新頁 `vehicle/:vehicleId/plan`，讓使用者在下單前先看到車輛詳情、選擇保險方案、確認燃油/里程/付款方式，並讓保費正確併入既有計價與訂單；送出訂單後依付款方式分流到既有的模擬金流頁或訂單成立頁。

**Architecture:** 純前端擴充，不動後端（本專案沒有真正後端，資料層是 in-memory/localStorage repository）。`libs/domain` 補 `InsurancePlan` model 與計價邏輯；`libs/booking-flow` 新增一個頁面元件、改一個既有共用元件（`OrderSummaryCardComponent`）、在既有 `OrderPageComponent`/`SearchPageComponent` 做最小改動銜接新頁。

**Tech Stack:** Angular 22（zoneless, signals, `@if`/`@for` control flow）、Angular Material、Nx monorepo、Vitest（`@nx/angular:unit-test`）。

**Spec:** [docs/superpowers/specs/2026-08-27-vehicle-plan-selection-design.md](../specs/2026-08-27-vehicle-plan-selection-design.md)

## Global Constraints

- 保費（`insuranceSubtotal`）比照 `addOnLines`/`addOnSubtotal` 的算法：天數 × `dailyPriceFrom`，不吃 tier/partner 折扣。
- `PaymentMethod` 列舉不新增值，沿用 `'credit_card' | 'line_pay' | 'on_site' | 'bank_transfer'`。
- plan 頁的「付款方式」列是純靜態展示（固定文字「線上付款」），不產生任何狀態，不透過 query param 傳遞——真正的付款方式選擇仍在 `ConfirmStepComponent` 既有 radio group。
- `fuelPolicy`/`mileagePolicy` 是唯讀展示欄位，不做互動選單。
- `OrderSummaryCardComponent` 新增的 `showVehicleHeader` Input 預設 `true`，`order-page` 現有呼叫端不用改就維持原行為。
- 所有新 component-level 測試遵循本專案既有慣例：需要 DI 的元件用 `TestBed.runInInjectionContext(() => new XxxComponent())`（見 `order-page.component.spec.ts`）；不需要 DI 的純展示元件直接 `new XxxComponent()` 並用 `component['protectedMember']` 存取 `protected` 成員（見 `vehicle-step.component.spec.ts`）。不寫 `TestBed.createComponent`/fixture DOM 測試——這個 repo 目前完全沒有這種測試，保持一致。
- 每個 task 完成後才 commit；commit message 用這個 repo 慣用的 `feat(booking-flow): ...` / `feat(domain): ...` 格式（可從 `git log --oneline -10` 確認慣例）。

---

## Task 1: `InsurancePlan` domain model + `Vehicle` 新欄位

**Files:**
- Create: `libs/domain/src/lib/models/insurance-plan.ts`
- Modify: `libs/domain/src/lib/models/index.ts`
- Modify: `libs/domain/src/lib/models/vehicle.ts`

**Interfaces:**
- Produces: `InsuranceCoverageItem { name: string; deductibleMin: number; deductibleMax: number; currency: string }`、`InsurancePlan { id: string; name: string; dailyPriceFrom: number; tags: string[]; coverageItems: InsuranceCoverageItem[]; detailsUrl?: string }`、`FuelPolicy = 'full_to_full' | 'full_to_empty' | 'same_to_same'`、`MileagePolicy = 'unlimited' | 'limited'`、`Vehicle.insurancePlans?: InsurancePlan[]`、`Vehicle.fuelPolicy?: FuelPolicy`、`Vehicle.mileagePolicy?: MileagePolicy`。

這是純型別新增，沒有執行期邏輯可測，用 `nx build domain`（跑完整 TS 編譯）當驗收，取代寫測試。

- [ ] **Step 1: 新增 `insurance-plan.ts`**

```ts
export interface InsuranceCoverageItem {
  name: string;
  deductibleMin: number;
  deductibleMax: number;
  currency: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
  dailyPriceFrom: number;
  tags: string[];
  coverageItems: InsuranceCoverageItem[];
  detailsUrl?: string;
}
```

- [ ] **Step 2: 在 `libs/domain/src/lib/models/index.ts` 加 barrel export**

在 `export * from './vehicle';` 這行下面加一行：

```ts
export * from './insurance-plan';
```

- [ ] **Step 3: 修改 `libs/domain/src/lib/models/vehicle.ts`**

檔案開頭 import 加一行：

```ts
import { InsurancePlan } from './insurance-plan';
```

在 `export const RENTAL_LOCATIONS: RentalLocation[] = ['機場', '港口', '店舖'];` 這行下面加：

```ts

/** 燃油規定；唯讀展示用，plan 頁不做互動選單 */
export type FuelPolicy = 'full_to_full' | 'full_to_empty' | 'same_to_same';
/** 里程政策；唯讀展示用 */
export type MileagePolicy = 'unlimited' | 'limited';
```

在 `Vehicle` interface 內、`location?: RentalLocation;` 這行下面加：

```ts
  /** 保險方案清單；未提供時 plan 頁不顯示「選擇方案」區塊 */
  insurancePlans?: InsurancePlan[];
  /** 燃油規定；未提供時 plan 頁不顯示該列 */
  fuelPolicy?: FuelPolicy;
  /** 里程政策；未提供時 plan 頁不顯示該列 */
  mileagePolicy?: MileagePolicy;
```

- [ ] **Step 4: 編譯驗證**

Run: `npx nx build domain`
Expected: 編譯成功，無 TS 錯誤。

- [ ] **Step 5: Commit**

```bash
git add libs/domain/src/lib/models/insurance-plan.ts libs/domain/src/lib/models/index.ts libs/domain/src/lib/models/vehicle.ts
git commit -m "feat(domain): 新增 InsurancePlan model 與 Vehicle 的 fuelPolicy/mileagePolicy 欄位"
```

---

## Task 2: `PriceBreakdown` / `RentalBooking` 新欄位

**Files:**
- Modify: `libs/domain/src/lib/models/price-breakdown.ts`
- Modify: `libs/domain/src/lib/models/rental-booking.ts`

**Interfaces:**
- Consumes: `InsurancePlan`（Task 1）
- Produces: `PriceLineInsurance { planId: string; name: string; amount: number }`、`PriceBreakdown.insurance?: PriceLineInsurance`、`PriceBreakdown.insuranceSubtotal: number`、`RentalBooking.insurancePlanId?: string`

同樣是純型別異動，用 `nx build domain` 驗收。

- [ ] **Step 1: 修改 `price-breakdown.ts`**

完整內容改成：

```ts
import { DayType } from './pricing-plan';
export interface PriceLineDay { date: string; dayType: DayType; price: number; }
export interface PriceLineAddOn { addOnId: string; name: string; qty: number; amount: number; }
export interface PriceLineInsurance { planId: string; name: string; amount: number; }
export interface PriceBreakdown {
  dailyLines: PriceLineDay[];
  rentalRaw: number; tierDiscountPercent: number; tierDiscountAmount: number;
  rentalSubtotal: number;
  partnerDiscountPercent: number;
  partnerDiscount: number;
  addOnLines: PriceLineAddOn[]; addOnSubtotal: number;
  insurance?: PriceLineInsurance; insuranceSubtotal: number;
  couponCode?: string; couponDiscount: number; total: number;
}
```

- [ ] **Step 2: 修改 `rental-booking.ts`**

在 `paymentMethod?: PaymentMethod;` 這行下面加：

```ts
  insurancePlanId?: string;
```

- [ ] **Step 3: 編譯驗證**

Run: `npx nx build domain`
Expected: 出現 TS 錯誤——因為 Task 3 之前 `calculate-price.ts` 還沒補上 `insuranceSubtotal`/`insurance` 兩個必填欄位（`insuranceSubtotal` 是必填 `number`），`calculatePrice()` 回傳物件現在缺這個欄位會編譯失敗。這是預期中的失敗，留給 Task 3 修。

- [ ] **Step 4: Commit**

```bash
git add libs/domain/src/lib/models/price-breakdown.ts libs/domain/src/lib/models/rental-booking.ts
git commit -m "feat(domain): PriceBreakdown/RentalBooking 補保險相關欄位"
```

---

## Task 3: `calculate-price.ts` 保費計算

**Files:**
- Modify: `libs/domain/src/lib/pricing/calculate-price.ts`
- Modify: `libs/domain/src/lib/pricing/calculate-price.spec.ts`

**Interfaces:**
- Consumes: `InsurancePlan`（Task 1）、`PriceLineInsurance`（Task 2）
- Produces: `calculatePrice(input: { ...; insurancePlan?: InsurancePlan })`——`insurancePlan` 是可選新參數。

- [ ] **Step 1: 寫失敗測試**

在 `calculate-price.spec.ts` 的 `import` 那行下面加一個 fixture：

```ts
const basicInsurance = { id: 'ins1', name: '基本保障', dailyPriceFrom: 200, tags: [], coverageItems: [] };
```

在 `describe('calculatePrice', ...)` 內、最後一個 `it(...)`（`'未帶 partnerDiscountPercent → ...'`）後面加兩個測試：

```ts
  it('帶保險方案：保費 = 天數 x dailyPriceFrom，計入 total，且不受 tier/partner 折扣影響', () => {
    // 3 天，200/天 → insuranceSubtotal 600
    const r = calculatePrice({
      plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08', addOns: [],
      partnerDiscountPercent: 10, insurancePlan: basicInsurance,
    });
    expect(r.insuranceSubtotal).toBe(600);
    expect(r.insurance).toEqual({ planId: 'ins1', name: '基本保障', amount: 600 });
    // rentalSubtotal 1140，partnerDiscount 10%=114 → afterPartner 1026；+ 保費 600 → total 1626
    expect(r.total).toBe(1626);
  });

  it('未帶保險方案：insuranceSubtotal 為 0，insurance 為 undefined', () => {
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08', addOns: [] });
    expect(r.insuranceSubtotal).toBe(0);
    expect(r.insurance).toBeUndefined();
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx nx test domain -- calculate-price.spec.ts`
Expected: FAIL（`insurancePlan` 參數不存在於型別、或 `r.insuranceSubtotal` 為 `undefined`）。

- [ ] **Step 3: 修改 `calculate-price.ts` 實作**

`import` 那行加 `InsurancePlan, PriceLineInsurance`：

```ts
import {
  PricingPlan, SeasonCalendar, AddOn, Coupon, DayTier,
  PriceBreakdown, PriceLineDay, PriceLineAddOn, PriceLineInsurance, VehicleCategory,
  InsurancePlan,
} from '../models';
```

`calculatePrice` 的 input 型別加一個欄位：

```ts
export function calculatePrice(input: {
  plan: PricingPlan;
  calendar: SeasonCalendar;
  startDate: string;
  endDate: string;
  addOns: { addOn: AddOn; qty: number }[];
  coupon?: Coupon;
  partnerDiscountPercent?: number;
  insurancePlan?: InsurancePlan;
}): PriceBreakdown {
```

在 `const addOnSubtotal = addOnLines.reduce((s, l) => s + l.amount, 0);` 這行下面加：

```ts

  const insuranceSubtotal = input.insurancePlan ? input.insurancePlan.dailyPriceFrom * days : 0;
  const insurance: PriceLineInsurance | undefined = input.insurancePlan
    ? { planId: input.insurancePlan.id, name: input.insurancePlan.name, amount: insuranceSubtotal }
    : undefined;
```

把 `const total = afterPartner - couponDiscount + addOnSubtotal;` 改成：

```ts
  const total = afterPartner - couponDiscount + addOnSubtotal + insuranceSubtotal;
```

把 `return` 的物件加上兩個欄位：

```ts
  return {
    dailyLines, rentalRaw, tierDiscountPercent, tierDiscountAmount, rentalSubtotal,
    partnerDiscountPercent, partnerDiscount,
    addOnLines, addOnSubtotal, insurance, insuranceSubtotal, couponCode, couponDiscount, total,
  };
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx nx test domain -- calculate-price.spec.ts`
Expected: PASS，全部測試（含既有的）都過。

- [ ] **Step 5: 編譯整個 domain lib 確認 Task 2 遺留的型別錯誤已修好**

Run: `npx nx build domain`
Expected: 編譯成功。

- [ ] **Step 6: Commit**

```bash
git add libs/domain/src/lib/pricing/calculate-price.ts libs/domain/src/lib/pricing/calculate-price.spec.ts
git commit -m "feat(domain): calculatePrice 支援保險方案，保費併入 total 但不吃 tier/partner 折扣"
```

---

## Task 4: `CatalogStore`／`QuoteService` 保險方案透傳

**Files:**
- Modify: `libs/booking-flow/src/lib/catalog.store.ts`
- Modify: `libs/booking-flow/src/lib/catalog.store.spec.ts`
- Modify: `libs/booking-flow/src/lib/quote.service.ts`

**Interfaces:**
- Consumes: `calculatePrice`（Task 3，新參數 `insurancePlan?: InsurancePlan`）
- Produces: `CatalogStore.price(input: { ...; insurancePlan?: InsurancePlan }): PriceBreakdown`、`CatalogStore.submitBooking(input: { ...; insurancePlanId?: string }): RentalBooking`（回傳的 `RentalBooking.insurancePlanId` 對應帶入的值）、`QuoteService.quote(input: { ...; insurancePlan?: InsurancePlan }): PriceBreakdown | null`

`price()` 目前不接 `vehicleId`，只接 `category`，所以它拿 `InsurancePlan` 物件（呼叫端已經解析好），不是 `insurancePlanId`。`submitBooking()` 有 `vehicleId`，可以自己從 `vehicleRepo` 查出 `vehicle.insurancePlans` 解析 id，所以它收 `insurancePlanId: string`。

- [ ] **Step 1: 寫失敗測試**

在 `catalog.store.spec.ts` 頂部 `makeVehicle` 定義後面加一個保險方案 fixture：

```ts
const insurancePlan = { id: 'ins1', name: '基本保障', dailyPriceFrom: 200, tags: [], coverageItems: [] };
```

在 `describe('CatalogStore', ...)` 內，`it('price 用對應車型 plan 算出 total', ...)` 後面加：

```ts
  it('price 帶 insurancePlan 時，total 併入保費', () => {
    const store = setup();
    const without = store.price({ category: 'scooter', startDate: '2026-01-05', endDate: '2026-01-07', addOns: [] });
    const withIns = store.price({
      category: 'scooter', startDate: '2026-01-05', endDate: '2026-01-07', addOns: [], insurancePlan: insurancePlan,
    });
    expect(withIns.insuranceSubtotal).toBe(400); // 2 天 x 200
    expect(withIns.total).toBe(without.total + 400);
  });
```

在 `it('submitBooking 寫入 pending_payment 訂單並帶 priceBreakdown', ...)` 後面加：

```ts
  it('submitBooking 帶 insurancePlanId 對應到車輛的方案時，booking 與 priceBreakdown 都記下保費', () => {
    const store = setup([], [{ ...makeVehicle(), insurancePlans: [insurancePlan] }]);
    const b = store.submitBooking({
      vehicleId: 'v1',
      startTime: '2026-01-05T09:00:00',
      endTime: '2026-01-07T09:00:00',
      pickupLocation: '馬公',
      returnLocation: '馬公',
      customer: { name: '測試', phone: '0900000000', email: 't@t.com' },
      category: 'scooter',
      startDate: '2026-01-05',
      endDate: '2026-01-07',
      addOns: [],
      couponCode: undefined,
      paymentMethod: 'on_site',
      insurancePlanId: 'ins1',
    });
    expect(b.insurancePlanId).toBe('ins1');
    expect(b.priceBreakdown?.insuranceSubtotal).toBe(400);
  });

  it('submitBooking 帶不存在的 insurancePlanId 時，視為未選保險，不丟例外', () => {
    const store = setup();
    const b = store.submitBooking({
      vehicleId: 'v1',
      startTime: '2026-01-05T09:00:00',
      endTime: '2026-01-07T09:00:00',
      pickupLocation: '馬公',
      returnLocation: '馬公',
      customer: { name: '測試', phone: '0900000000', email: 't@t.com' },
      category: 'scooter',
      startDate: '2026-01-05',
      endDate: '2026-01-07',
      addOns: [],
      couponCode: undefined,
      paymentMethod: 'on_site',
      insurancePlanId: 'not-exist',
    });
    expect(b.priceBreakdown?.insuranceSubtotal).toBe(0);
  });
```

`setup()` 目前簽章是 `setup(bookings: RentalBooking[] = [])`，固定塞一台 `makeVehicle()`。改成可以自訂車輛清單：

```ts
function setup(bookings: RentalBooking[] = [], vehicles: Vehicle[] = [makeVehicle()]): CatalogStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([coupon]) },
    ],
  });
  return TestBed.inject(CatalogStore);
}
```

（既有呼叫 `setup()`、`setup([...])` 的地方不用改，因為 `vehicles` 有預設值。）

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx nx test booking-flow -- catalog.store.spec.ts`
Expected: FAIL（`price`/`submitBooking` 型別上還沒有 `insurancePlan`/`insurancePlanId`）。

- [ ] **Step 3: 修改 `catalog.store.ts`**

`import` 加 `InsurancePlan`：

```ts
import {
  AddOn,
  Coupon,
  Customer,
  InsurancePlan,
  PaymentMethod,
  PriceBreakdown,
  PricingPlan,
  RentalBooking,
  VEHICLE_REPO,
  BOOKING_REPO,
  CUSTOMER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  Vehicle,
  VehicleCategory,
  calculatePrice,
  isCouponValid,
  isVehicleAvailable,
} from '@car-rental/domain';
```

`price()` 方法簽章與呼叫都加 `insurancePlan`：

```ts
  price(input: {
    category: VehicleCategory;
    startDate: string;
    endDate: string;
    addOns: { addOn: AddOn; qty: number }[];
    coupon?: Coupon;
    partnerDiscountPercent?: number;
    insurancePlan?: InsurancePlan;
  }): PriceBreakdown {
    const plan = this.planForCategory(input.category);
    if (!plan) throw new Error('無此車型定價');
    return calculatePrice({ plan, calendar: this.calRepo.getAll()[0], ...input });
  }
```

`submitBooking()` 輸入型別加 `insurancePlanId?: string`：

```ts
  submitBooking(input: {
    vehicleId: string;
    startTime: string;
    endTime: string;
    pickupLocation: string;
    returnLocation: string;
    customer: { name: string; phone: string; email: string };
    category: VehicleCategory;
    startDate: string;
    endDate: string;
    addOns: { addOn: AddOn; qty: number }[];
    couponCode?: string;
    paymentMethod: PaymentMethod;
    partnerDiscountPercent?: number;
    sourcePartnerId?: string;
    insurancePlanId?: string;
  }): RentalBooking {
```

在 `const coupon = input.couponCode ? ... : undefined;` 這段後面（呼叫 `this.price(...)` 之前）加：

```ts
    const insurancePlan = input.insurancePlanId
      ? vehicle.insurancePlans?.find((p) => p.id === input.insurancePlanId)
      : undefined;
```

`this.price({...})` 呼叫加一行 `insurancePlan,`：

```ts
    const priceBreakdown = this.price({
      category: input.category,
      startDate: input.startDate,
      endDate: input.endDate,
      addOns: input.addOns,
      coupon,
      partnerDiscountPercent: input.partnerDiscountPercent,
      insurancePlan,
    });
```

`booking` 物件的 `...(input.sourcePartnerId ? ... : {})` 這行下面加（比照既有選填欄位的 spread 寫法）：

```ts
      ...(input.insurancePlanId ? { insurancePlanId: input.insurancePlanId } : {}),
```

- [ ] **Step 4: 修改 `quote.service.ts`**

`import` 加 `InsurancePlan`：

```ts
import { AddOn, Coupon, InsurancePlan, PriceBreakdown, Vehicle, VehicleCategory } from '@car-rental/domain';
```

`quote()` 方法簽章與呼叫都加 `insurancePlan`：

```ts
  quote(input: {
    vehicle: Vehicle;
    startDate: string;
    endDate: string;
    addOnLines: { addOn: AddOn; qty: number }[];
    coupon?: Coupon;
    partnerDiscountPercent?: number;
    insurancePlan?: InsurancePlan;
  }): PriceBreakdown | null {
    if (!input.startDate || !input.endDate) return null;
    if (!this.catalog.planForCategory(input.vehicle.category)) return null;
    try {
      return this.catalog.price({
        category: input.vehicle.category,
        startDate: input.startDate,
        endDate: input.endDate,
        addOns: input.addOnLines,
        coupon: input.coupon,
        partnerDiscountPercent: input.partnerDiscountPercent,
        insurancePlan: input.insurancePlan,
      });
    } catch (err) {
      console.error('[QuoteService] quote 試算失敗', err);
      return null;
    }
  }
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx nx test booking-flow -- catalog.store.spec.ts`
Expected: PASS。

- [ ] **Step 6: 跑整個 booking-flow 測試，確認沒有波及既有測試**

Run: `npx nx test booking-flow`
Expected: 全數 PASS（這一步之後，`order-page.component.spec.ts` 仍應全過，因為 Task 4 沒改它用到的介面預設行為）。

- [ ] **Step 7: Commit**

```bash
git add libs/booking-flow/src/lib/catalog.store.ts libs/booking-flow/src/lib/catalog.store.spec.ts libs/booking-flow/src/lib/quote.service.ts
git commit -m "feat(booking-flow): CatalogStore/QuoteService 透傳保險方案到計價與訂單"
```

---

## Task 5: Seed data 補保險方案／燃油／里程範例

**Files:**
- Modify: `libs/domain/src/lib/repositories/seed-data.ts`

**Interfaces:**
- Consumes: `InsurancePlan`、`Vehicle.insurancePlans`/`fuelPolicy`/`mileagePolicy`（Task 1）

沒有新邏輯，純資料，用既有 `seed-data.spec.ts` 驗收不會壞（它只斷言「每台車的 category 都有對應定價方案」之類的規則，不鎖欄位值）。

- [ ] **Step 1: 修改 `seedVehicles()` 的第一台車（`id: 'v1'`，Gogoro 3）**

在 `location: '機場',` 這行後面加：

```ts
      insurancePlans: [
        {
          id: 'ins-basic',
          name: '基本保障',
          dailyPriceFrom: 662,
          tags: ['有自負額', '最低保障'],
          coverageItems: [
            { name: '租車自負額', deductibleMin: 100000, deductibleMax: 800000, currency: 'JPY' },
            { name: '第三人責任險', deductibleMin: 100000, deductibleMax: 800000, currency: 'JPY' },
          ],
        },
      ],
      fuelPolicy: 'full_to_full',
      mileagePolicy: 'unlimited',
```

其餘車輛（v2、v3 及之後）保持不動——維持沒有這三個欄位，用來驗證「缺值時 plan 頁對應區塊省略」這條路徑。

- [ ] **Step 2: 跑既有 seed-data 測試確認沒壞**

Run: `npx nx test domain -- seed-data.spec.ts`
Expected: PASS。

- [ ] **Step 3: 編譯確認**

Run: `npx nx build domain`
Expected: 成功。

- [ ] **Step 4: Commit**

```bash
git add libs/domain/src/lib/repositories/seed-data.ts
git commit -m "feat(domain): seed data 補一台車的保險方案/燃油/里程範例資料"
```

---

## Task 6: `OrderSummaryCardComponent` — `showVehicleHeader` 開關與時間軸補欄位

**Files:**
- Modify: `libs/booking-flow/src/lib/components/order-summary-card.component.ts`
- Modify: `libs/booking-flow/src/lib/components/order-summary-card.component.html`
- Modify: `libs/booking-flow/src/lib/components/order-summary-card.component.scss`
- Create: `libs/booking-flow/src/lib/components/order-summary-card.component.spec.ts`

**Interfaces:**
- Produces: `OrderSummaryCardComponent.showVehicleHeader: boolean`（新 `@Input`，預設 `true`）、`OrderSummaryCardComponent.returnLocation: string`（新 `@Input`，預設 `''`）、`OrderSummaryCardComponent.mapUrl(location: string): string`（`protected`）

這個元件目前沒有 spec 檔，這個 task 順便補上（用 `new OrderSummaryCardComponent()` 直接建立，比照 `vehicle-step.component.spec.ts` 的模式，不用 TestBed）。

- [ ] **Step 1: 寫失敗測試**

新建 `order-summary-card.component.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { Vehicle } from '@car-rental/domain';
import { OrderSummaryCardComponent } from './order-summary-card.component';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: '勁戰',
    brand: 'Yamaha',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('OrderSummaryCardComponent', () => {
  it('showVehicleHeader 預設為 true', () => {
    const component = new OrderSummaryCardComponent();
    expect(component.showVehicleHeader).toBe(true);
  });

  it('mapUrl 依地點組出 Google Maps 搜尋連結', () => {
    const component = new OrderSummaryCardComponent();
    expect(component['mapUrl']('機場')).toBe(
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('機場'),
    );
  });

  it('originalTotal 併入 insuranceSubtotal', () => {
    const component = new OrderSummaryCardComponent();
    component.vehicle = makeVehicle();
    component.priceBreakdown = {
      dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0,
      rentalSubtotal: 1000, partnerDiscountPercent: 0, partnerDiscount: 0,
      addOnLines: [], addOnSubtotal: 200, insuranceSubtotal: 400,
      couponDiscount: 0, total: 1600,
    };
    expect(component.originalTotal).toBe(1600); // 1000 + 200 + 400
  });

  it('discountPercent 依折扣總額佔原價的比例四捨五入', () => {
    const component = new OrderSummaryCardComponent();
    component.priceBreakdown = {
      dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 300,
      rentalSubtotal: 700, partnerDiscountPercent: 0, partnerDiscount: 0,
      addOnLines: [], addOnSubtotal: 0, insuranceSubtotal: 0,
      couponCode: undefined, couponDiscount: 0, total: 700,
    };
    // originalTotal = 1000+0+0 = 1000；discountTotal = 300；300/1000 = 30%
    expect(component.discountPercent).toBe(30);
  });

  it('baseFareAmount = rentalSubtotal - partnerDiscount + insuranceSubtotal', () => {
    const component = new OrderSummaryCardComponent();
    component.priceBreakdown = {
      dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0,
      rentalSubtotal: 1000, partnerDiscountPercent: 10, partnerDiscount: 100,
      addOnLines: [], addOnSubtotal: 0, insuranceSubtotal: 400,
      couponDiscount: 0, total: 1300,
    };
    expect(component.baseFareAmount).toBe(1300); // 1000 - 100 + 400
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx nx test booking-flow -- order-summary-card.component.spec.ts`
Expected: FAIL（`showVehicleHeader`/`mapUrl`/`discountPercent`/`baseFareAmount` 都還不存在；`priceBreakdown` 型別缺 `insuranceSubtotal` 會編譯失敗）。

- [ ] **Step 3: 修改 `order-summary-card.component.ts`**

完整內容改成：

```ts
import { Component, Input, signal } from '@angular/core';
import { AddOn, PriceBreakdown, Vehicle } from '@car-rental/domain';

/** 純展示的金額摘要。下單頁滾動時固定在視野內，讓使用者隨時看得到總價。 */
@Component({
  selector: 'app-order-summary-card',
  imports: [],
  templateUrl: './order-summary-card.component.html',
  styleUrl: './order-summary-card.component.scss',
})
export class OrderSummaryCardComponent {
  @Input() vehicle: Vehicle | null = null;
  @Input() startDate = '';
  @Input() endDate = '';
  /** 還車站；order-page 目前沒有把 confirm-step 選的還車地點往上抬，這裡先用取車站當預覽值 */
  @Input() returnLocation = '';
  /** plan 頁自己的車輛詳情卡已經顯示過照片/名稱，這裡要關掉避免重複 */
  @Input() showVehicleHeader = true;
  @Input() selectedAddOnLines: { addOn: AddOn; qty: number }[] = [];
  @Input() priceBreakdown: PriceBreakdown | null = null;

  protected readonly baseFareExpanded = signal(true);
  protected readonly addOnsExpanded = signal(false);

  protected toggleBaseFare(): void {
    this.baseFareExpanded.update((v) => !v);
  }

  protected toggleAddOns(): void {
    this.addOnsExpanded.update((v) => !v);
  }

  /** 三種折扣的合計，用來判斷是否需要顯示劃線的原價 */
  get discountTotal(): number {
    if (!this.priceBreakdown) return 0;
    const { tierDiscountAmount, partnerDiscount, couponDiscount } = this.priceBreakdown;
    return tierDiscountAmount + partnerDiscount + couponDiscount;
  }

  /** 完全沒有任何折扣時的應付總計（租金原價 + 配件小計 + 保費），供劃線價對照 */
  get originalTotal(): number {
    if (!this.priceBreakdown) return 0;
    return this.priceBreakdown.rentalRaw + this.priceBreakdown.addOnSubtotal + this.priceBreakdown.insuranceSubtotal;
  }

  /** 折扣佔原價的百分比，供「Sale N% OFF」徽章顯示；沒有折扣或原價為 0 時回 0（不顯示徽章） */
  get discountPercent(): number {
    if (!this.priceBreakdown || this.originalTotal <= 0) return 0;
    return Math.round((this.discountTotal / this.originalTotal) * 100);
  }

  /** 「基本費用」分組金額：租金（已扣 tier/partner 折扣）+ 保費，不含加購／優惠券 */
  get baseFareAmount(): number {
    if (!this.priceBreakdown) return 0;
    const { rentalSubtotal, partnerDiscount, insuranceSubtotal } = this.priceBreakdown;
    return rentalSubtotal - partnerDiscount + insuranceSubtotal;
  }

  protected fuelPolicyLabel(policy?: string): string | null {
    const labels: Record<string, string> = {
      full_to_full: '滿油取還車',
      full_to_empty: '滿油取車、可空車還車',
      same_to_same: '原油量還車',
    };
    return policy ? (labels[policy] ?? null) : null;
  }

  protected mileagePolicyLabel(policy?: string): string | null {
    const labels: Record<string, string> = { unlimited: '無限里程', limited: '有里程限制' };
    return policy ? (labels[policy] ?? null) : null;
  }

  protected mapUrl(location: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx nx test booking-flow -- order-summary-card.component.spec.ts`
Expected: PASS。

- [ ] **Step 5: 改 `order-summary-card.component.html`**

完整內容改成：

```html
<div class="order-summary-card">
  @if (vehicle && showVehicleHeader) {
    <div class="ui-card trip-card">
      <div class="trip-card__header">
        @if (vehicle.imageUrl) {
          <img class="trip-card__thumb" [src]="vehicle.imageUrl" [alt]="vehicle.brand + ' ' + vehicle.model" />
        }
        <div class="trip-card__vehicle">
          <span class="ui-text-title trip-card__model">{{ vehicle.brand }} {{ vehicle.model }}</span>
          <span class="ui-text-caption">{{ vehicle.plateNumber }}</span>
        </div>
      </div>
    </div>
  }

  @if (vehicle) {
    <div class="ui-card trip-card">
      <div class="ui-card-header">
        <h3 class="ui-card-title ui-text-title">取車＆還車詳情</h3>
      </div>

      <ol class="trip-timeline">
        <li class="trip-timeline__stop">
          <span class="trip-timeline__dot"></span>
          <div class="trip-timeline__body">
            <span class="ui-text-caption">取車</span>
            <span class="trip-timeline__date">{{ startDate }}</span>
            <span class="ui-text-caption">24小時個人租車</span>
            @if (vehicle.location) {
              <span class="ui-text-caption trip-timeline__location">
                {{ vehicle.location }}
                <a [href]="mapUrl(vehicle.location)" target="_blank" rel="noopener">地圖</a>
              </span>
            }
          </div>
        </li>
        <li class="trip-timeline__stop">
          <span class="trip-timeline__dot"></span>
          <div class="trip-timeline__body">
            <span class="ui-text-caption">還車</span>
            <span class="trip-timeline__date">{{ endDate }}</span>
            <span class="ui-text-caption">24小時個人租車</span>
            @if (returnLocation) {
              <span class="ui-text-caption trip-timeline__location">
                {{ returnLocation }}
                <a [href]="mapUrl(returnLocation)" target="_blank" rel="noopener">地圖</a>
              </span>
            }
          </div>
        </li>
      </ol>

      @if (selectedAddOnLines.length > 0) {
        <div class="trip-card__addons">
          <span class="ui-text-caption">加購配件</span>
          <div class="trip-card__addon-list">
            @for (line of selectedAddOnLines; track line.addOn.id) {
              <span class="ui-chip ui-chip--neutral">{{ line.addOn.name }} × {{ line.qty }}</span>
            }
          </div>
        </div>
      }
    </div>
  } @else {
    <div class="ui-card trip-card">
      <p class="empty-state">尚未選擇車輛。</p>
    </div>
  }

  @if (priceBreakdown) {
    <div class="ui-card price-card">
      <div class="ui-card-header">
        <h3 class="ui-card-title ui-text-title">付款詳情</h3>
      </div>

      <div class="price-card__price-row">
        <span class="ui-text-caption">價格</span>
        <span>NT$ {{ priceBreakdown.total }}</span>
      </div>

      <div class="price-card__group">
        <button type="button" class="price-card__group-toggle" (click)="toggleBaseFare()">
          <span>基本費用</span>
          <span class="price-card__group-amount">
            NT$ {{ baseFareAmount }}
            <span class="material-symbols-rounded" aria-hidden="true">{{
              baseFareExpanded() ? 'expand_less' : 'expand_more'
            }}</span>
          </span>
        </button>
        @if (baseFareExpanded()) {
          <ul class="price-card__group-detail">
            <li>租車費＆保險費</li>
            @if (fuelPolicyLabel(vehicle?.fuelPolicy); as label) {
              <li>{{ label }}</li>
            }
            @if (mileagePolicyLabel(vehicle?.mileagePolicy); as label) {
              <li>{{ label }}</li>
            }
            <li>當地稅費</li>
          </ul>
        }
      </div>

      <div class="price-card__group">
        <button type="button" class="price-card__group-toggle" (click)="toggleAddOns()">
          <span>加購項目</span>
          <span class="price-card__group-amount">
            NT$ {{ priceBreakdown.addOnSubtotal }}
            <span class="material-symbols-rounded" aria-hidden="true">{{
              addOnsExpanded() ? 'expand_less' : 'expand_more'
            }}</span>
          </span>
        </button>
        @if (addOnsExpanded() && priceBreakdown.addOnLines.length > 0) {
          <ul class="price-card__group-detail">
            @for (addOnLine of priceBreakdown.addOnLines; track addOnLine.addOnId) {
              <li><span>{{ addOnLine.name }} x{{ addOnLine.qty }}</span><span>NT$ {{ addOnLine.amount }}</span></li>
            }
          </ul>
        }
      </div>

      @if (priceBreakdown.couponDiscount > 0) {
        <div class="line discount">
          <span class="ui-text-caption">優惠折抵（{{ priceBreakdown.couponCode }}）</span>
          <span>-NT$ {{ priceBreakdown.couponDiscount }}</span>
        </div>
      }

      <div class="price-card__total">
        <span class="ui-text-title">應付總計</span>
        <span class="price-card__total-amount">
          @if (discountPercent > 0) {
            <span class="price-card__badge">Sale {{ discountPercent }}% OFF</span>
          }
          @if (discountTotal > 0) {
            <span class="price-card__original">NT$ {{ originalTotal }}</span>
          }
          <span class="ui-text-title price-card__final">NT$ {{ priceBreakdown.total }}</span>
        </span>
      </div>
    </div>
  }
</div>
```

- [ ] **Step 6: 改 `order-summary-card.component.scss`**

完整內容改成：

```scss
.order-summary-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: start;

  @media (min-width: 900px) {
    position: sticky;
    top: 1rem;
  }
}

.trip-card {
  padding: 1.25rem;

  &__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  &__thumb {
    width: 64px;
    height: 48px;
    object-fit: cover;
    border-radius: var(--mat-sys-corner-small);
    flex-shrink: 0;
  }

  &__vehicle {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  &__model {
    font-size: 1rem;
  }

  &__addons {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--mat-sys-outline-variant);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__addon-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
}

.trip-timeline {
  list-style: none;
  margin: 0;
  padding: 0;

  &__stop {
    position: relative;
    display: flex;
    gap: 0.75rem;
    padding-bottom: 1.25rem;

    &:last-child {
      padding-bottom: 0;
    }

    &:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 14px;
      bottom: -4px;
      width: 2px;
      background: var(--app-viz-3);
    }
  }

  &__dot {
    width: 12px;
    height: 12px;
    margin-top: 2px;
    border-radius: 999px;
    background: var(--app-viz-1);
    flex-shrink: 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__date {
    font-weight: 600;
  }

  &__location a {
    margin-left: 0.375rem;
    color: var(--mat-sys-primary);
  }
}

.empty-state {
  margin: 0;
  color: var(--mat-sys-on-surface-variant);
}

.price-card {
  padding: 1.25rem;

  .line {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
  }

  .discount {
    color: var(--app-positive-fg);
  }

  &__price-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0 0.75rem;
  }

  &__group {
    border-top: 1px solid var(--mat-sys-outline-variant);
    padding: 0.5rem 0;

    &:last-of-type {
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
  }

  &__group-toggle {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    padding: 4px 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  &__group-amount {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__group-detail {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: var(--mat-sys-on-surface-variant);
    font-size: 0.875rem;

    li {
      display: flex;
      justify-content: space-between;
    }
  }

  &__badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--app-positive-fg);
    color: var(--app-positive-fg);
  }

  &__total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--mat-sys-outline-variant);

    @media (max-width: 899.98px) {
      position: sticky;
      bottom: 0;
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
      background: var(--mat-sys-surface);
    }
  }

  &__total-amount {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__original {
    font-size: 0.85em;
    color: var(--mat-sys-on-surface-variant);
    text-decoration: line-through;
  }

  &__final {
    color: var(--mat-sys-primary);
  }
}
```

- [ ] **Step 7: 跑整個 booking-flow 測試確認沒有波及既有使用端**

Run: `npx nx test booking-flow`
Expected: 全數 PASS（`order-page.component.spec.ts` 不直接測 `OrderSummaryCardComponent` 的 DOM，應該不受影響）。

- [ ] **Step 8: Commit**

```bash
git add libs/booking-flow/src/lib/components/order-summary-card.component.ts libs/booking-flow/src/lib/components/order-summary-card.component.html libs/booking-flow/src/lib/components/order-summary-card.component.scss libs/booking-flow/src/lib/components/order-summary-card.component.spec.ts
git commit -m "feat(booking-flow): OrderSummaryCard 支援隱藏車輛標頭、費用分組收合與折扣徽章"
```

---

## Task 7: `OrderPageComponent` 呼叫端補 `returnLocation`

**Files:**
- Modify: `libs/booking-flow/src/lib/pages/order-page.component.html`

**Interfaces:**
- Consumes: `OrderSummaryCardComponent.returnLocation`（Task 6）

Task 6 的 `returnLocation` 預設 `''`，order-page 不改也不會壞，但補上能讓還車站的地圖連結正常顯示。

- [ ] **Step 1: 修改 `order-page.component.html`**

`<app-order-summary-card>` 那段加一個 binding：

```html
      <app-order-summary-card
        [vehicle]="vehicle()"
        [startDate]="startDate()"
        [endDate]="endDate()"
        [returnLocation]="vehicle()?.location ?? ''"
        [selectedAddOnLines]="selectedAddOnLines()"
        [priceBreakdown]="priceBreakdown()"
      ></app-order-summary-card>
```

- [ ] **Step 2: 跑 booking-flow 測試確認沒壞**

Run: `npx nx test booking-flow`
Expected: 全數 PASS。

- [ ] **Step 3: Commit**

```bash
git add libs/booking-flow/src/lib/pages/order-page.component.html
git commit -m "feat(booking-flow): order-page 摘要卡補還車站，地圖連結才有值可用"
```

---

## Task 8: 新頁 `PlanPageComponent`（骨架 + 車輛詳情 + 保險方案選擇 + 導頁）

**Files:**
- Create: `libs/booking-flow/src/lib/pages/plan-page.component.ts`
- Create: `libs/booking-flow/src/lib/pages/plan-page.component.html`
- Create: `libs/booking-flow/src/lib/pages/plan-page.component.scss`
- Create: `libs/booking-flow/src/lib/pages/plan-page.component.spec.ts`

**Interfaces:**
- Consumes: `BOOKING_CONTEXT`、`QuoteService`（透過 `insurancePlan` 參數，Task 4）、`VEHICLE_REPO`、`OrderSummaryCardComponent`（Task 6）
- Produces: `PlanPageComponent`（selector `app-plan-page`）——`vehicle`/`startDate`/`endDate`/`selectedPlan`/`priceBreakdown` 唯讀 signal；`selectPlan(planId: string): void`；`onNext(): void`；`ensureValidOrRedirect(): boolean`（public，測試直接呼叫，比照 `OrderPageComponent` 慣例）。

只測元件類別邏輯，不測 DOM（比照本專案既有慣例，見 Global Constraints）。

- [ ] **Step 1: 寫失敗測試**

新建 `plan-page.component.spec.ts`：

```ts
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {
  AddOn,
  Coupon,
  Customer,
  PricingPlan,
  RentalBooking,
  SeasonCalendar,
  Vehicle,
  VEHICLE_REPO,
  BOOKING_REPO,
  CUSTOMER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  createInMemoryRepo,
} from '@car-rental/domain';
import { PlanPageComponent } from './plan-page.component';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: '勁戰',
    brand: 'Yamaha',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    location: '機場',
    ...partial,
  };
}

const plan: PricingPlan = {
  id: 'p1',
  name: '機車',
  appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [],
};
const calendar: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };

function setup(
  params: { vehicleId: string; start: string; end: string },
  vehicle: Vehicle = makeVehicle(),
) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([vehicle]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([]) },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ vehicleId: params.vehicleId })),
          queryParamMap: of(convertToParamMap({ start: params.start, end: params.end })),
        },
      },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new PlanPageComponent());
  return { component, navigate };
}

const validParams = {
  vehicleId: 'v1',
  start: '2026-08-20T10:00:00',
  end: '2026-08-23T10:00:00',
};

const withPlans = makeVehicle({
  insurancePlans: [
    { id: 'ins1', name: '基本保障', dailyPriceFrom: 200, tags: ['有自負額'], coverageItems: [] },
    { id: 'ins2', name: '全險', dailyPriceFrom: 500, tags: [], coverageItems: [] },
  ],
});

describe('PlanPageComponent', () => {
  it('載入指定車輛與租期', () => {
    const { component } = setup(validParams);
    expect(component.vehicle()?.id).toBe('v1');
    expect(component.startDate()).toBe('2026-08-20');
    expect(component.endDate()).toBe('2026-08-23');
  });

  it('有保險方案時預設選第一個方案，priceBreakdown 反映其保費', () => {
    const { component } = setup(validParams, withPlans);
    expect(component.selectedPlan()?.id).toBe('ins1');
    // 3 天 x 200 = 600
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(600);
  });

  it('selectPlan 切換方案後 priceBreakdown 跟著換', () => {
    const { component } = setup(validParams, withPlans);
    component.selectPlan('ins2');
    expect(component.selectedPlan()?.id).toBe('ins2');
    // 3 天 x 500 = 1500
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(1500);
  });

  it('沒有保險方案時 selectedPlan 為 null，priceBreakdown 保費為 0', () => {
    const { component } = setup(validParams);
    expect(component.selectedPlan()).toBeNull();
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(0);
  });

  it('下一步導向 order/:vehicleId，帶上原本的日期與選定的 planId', () => {
    const { component, navigate } = setup(validParams, withPlans);
    component.onNext();
    expect(navigate).toHaveBeenCalledWith(['/', 'order', 'v1'], {
      queryParams: { start: validParams.start, end: validParams.end, group: null, planId: 'ins1' },
    });
  });

  it('沒有保險方案時下一步的 planId 帶 null', () => {
    const { component, navigate } = setup(validParams);
    component.onNext();
    expect(navigate).toHaveBeenCalledWith(['/', 'order', 'v1'], {
      queryParams: { start: validParams.start, end: validParams.end, group: null, planId: null },
    });
  });

  it('查無車輛時導回搜尋頁', () => {
    const { component, navigate } = setup({ ...validParams, vehicleId: 'nope' });
    expect(component.vehicle()).toBeNull();
    component.ensureValidOrRedirect();
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });

  it('缺日期時導回搜尋頁', () => {
    const { component, navigate } = setup({ vehicleId: 'v1', start: '', end: '' });
    component.ensureValidOrRedirect();
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx nx test booking-flow -- plan-page.component.spec.ts`
Expected: FAIL（`PlanPageComponent` 檔案還不存在）。

- [ ] **Step 3: 建立 `plan-page.component.ts`**

```ts
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { InsurancePlan, PriceBreakdown, Vehicle, VEHICLE_REPO } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { toVehicleGroup } from '../date-range';
import { QuoteService } from '../quote.service';
import { OrderSummaryCardComponent } from '../components/order-summary-card.component';

/**
 * 選車詳情／保險方案頁：search 選完車、order 填配件送出之間的中繼頁。
 * 只做「選保險方案」這一件事，不動 order-page 現有的單頁式 checkout。
 */
@Component({
  selector: 'app-plan-page',
  imports: [DecimalPipe, MatButtonModule, OrderSummaryCardComponent],
  templateUrl: './plan-page.component.html',
  styleUrl: './plan-page.component.scss',
})
export class PlanPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quote = inject(QuoteService);
  private readonly context = inject(BOOKING_CONTEXT);
  private readonly vehicleRepo = inject(VEHICLE_REPO);

  private readonly vehicleId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('vehicleId') ?? '')),
    { initialValue: '' },
  );
  private readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => ({
        start: p.get('start') ?? '',
        end: p.get('end') ?? '',
        group: toVehicleGroup(p.get('group')),
      })),
    ),
    { initialValue: { start: '', end: '', group: undefined } },
  );

  readonly vehicle = computed<Vehicle | null>(() => this.vehicleRepo.getById(this.vehicleId()) ?? null);
  readonly startDate = computed(() => this.params().start.slice(0, 10));
  readonly endDate = computed(() => this.params().end.slice(0, 10));

  readonly selectedPlanId = signal<string | null>(null);

  readonly selectedPlan = computed<InsurancePlan | null>(() => {
    const plans = this.vehicle()?.insurancePlans ?? [];
    if (plans.length === 0) return null;
    const id = this.selectedPlanId();
    return plans.find((p) => p.id === id) ?? plans[0];
  });

  readonly priceBreakdown = computed<PriceBreakdown | null>(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return null;
    return this.quote.quote({
      vehicle,
      startDate: this.startDate(),
      endDate: this.endDate(),
      addOnLines: [],
      insurancePlan: this.selectedPlan() ?? undefined,
    });
  });

  private readonly guardEffect = effect(() => {
    this.ensureValidOrRedirect();
  });

  ensureValidOrRedirect(): boolean {
    if (this.vehicle() && this.startDate() && this.endDate()) return true;
    this.goToSearch();
    return false;
  }

  private goToSearch(): void {
    const { start, end, group } = this.params();
    this.router.navigate([...this.context.basePath(), 'search'], {
      queryParams: start && end ? { start, end, group: group ?? null } : {},
    });
  }

  selectPlan(planId: string): void {
    this.selectedPlanId.set(planId);
  }

  onNext(): void {
    if (!this.ensureValidOrRedirect()) return;
    const vehicle = this.vehicle()!;
    const { start, end, group } = this.params();
    this.router.navigate([...this.context.basePath(), 'order', vehicle.id], {
      queryParams: { start, end, group: group ?? null, planId: this.selectedPlan()?.id ?? null },
    });
  }
}
```

- [ ] **Step 4: 建立 `plan-page.component.html`**

```html
<div class="plan-page max-w-xl">
  @if (vehicle(); as v) {
    <div class="plan-layout">
      <div class="plan-main">
        <article class="ui-card vehicle-detail">
          <div class="vehicle-detail__media">
            @if (v.imageUrl) {
              <img [src]="v.imageUrl" [alt]="v.brand + ' ' + v.model" />
              <span class="vehicle-detail__media-tag">實拍照</span>
            } @else {
              <span class="material-symbols-rounded vehicle-detail__placeholder" aria-hidden="true">directions_car</span>
            }
          </div>

          <div class="vehicle-detail__body">
            @if (v.classLabel) {
              <p class="ui-text-caption">{{ v.classLabel }}</p>
            }
            <h1 class="vehicle-detail__title ui-text-title">
              {{ v.brand }} {{ v.model }}
              <span class="vehicle-detail__similar">
                或同級
                <span
                  class="material-symbols-rounded"
                  aria-hidden="true"
                  title="實際車輛以現場配車為準，將提供同等級或以上車款"
                  >info</span
                >
              </span>
            </h1>

            <ul class="vehicle-detail__specs">
              @if (v.seats) {
                <li><span class="material-symbols-rounded" aria-hidden="true">airline_seat_recline_normal</span>{{ v.seats }}人座</li>
              }
              @if (v.luggage) {
                <li><span class="material-symbols-rounded" aria-hidden="true">luggage</span>{{ v.luggage }}件行李</li>
              }
              @if (v.hasAirConditioner) {
                <li><span class="material-symbols-rounded" aria-hidden="true">ac_unit</span>空調</li>
              }
              @if (v.transmission) {
                <li>{{ v.transmission === 'manual' ? '手排' : '自排' }}</li>
              }
            </ul>

            <p class="vehicle-detail__notice ui-text-caption">
              特別提醒 如超過預約的時間，於額外收費時段取車，需額外支付服務費
            </p>
          </div>
        </article>

        @if (v.insurancePlans && v.insurancePlans.length > 0) {
          <section class="ui-card plan-select">
            <div class="ui-card-header">
              <h2 class="ui-card-title ui-text-title">選擇方案</h2>
            </div>

            @for (plan of v.insurancePlans; track plan.id) {
              <label class="plan-option" [class.plan-option--selected]="selectedPlan()?.id === plan.id">
                <div class="plan-option__head">
                  <div>
                    <p class="plan-option__name">{{ plan.name }}</p>
                    <p class="plan-option__price">NT$ {{ plan.dailyPriceFrom | number }}起 / 天</p>
                  </div>
                  <input
                    type="radio"
                    name="insurancePlan"
                    [value]="plan.id"
                    [checked]="selectedPlan()?.id === plan.id"
                    (change)="selectPlan(plan.id)"
                  />
                </div>

                @if (plan.tags.length > 0) {
                  <div class="plan-option__tags">
                    @for (tag of plan.tags; track tag) {
                      <span class="ui-chip ui-chip--neutral">{{ tag }}</span>
                    }
                  </div>
                }

                @if (plan.coverageItems.length > 0) {
                  <div class="plan-option__coverage">
                    @for (item of plan.coverageItems; track item.name) {
                      <div class="plan-option__coverage-item">
                        <span class="material-symbols-rounded" aria-hidden="true">check_circle</span>
                        <div>
                          <p>{{ item.name }}</p>
                          <p class="ui-text-caption">
                            自付額 {{ item.currency === 'JPY' ? '¥' : 'NT$' }}{{ item.deductibleMin | number }} -
                            {{ item.currency === 'JPY' ? '¥' : 'NT$' }}{{ item.deductibleMax | number }}
                          </p>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (plan.detailsUrl) {
                  <a class="plan-option__details-link" [href]="plan.detailsUrl" target="_blank" rel="noopener"
                    >查看保險詳情</a
                  >
                }
              </label>
            }
          </section>
        }

        <section class="plan-settings">
          @if (v.fuelPolicy) {
            <div class="plan-settings__row">
              <span>燃油規定</span>
              <span class="ui-chip ui-chip--neutral">{{ v.fuelPolicy === 'full_to_full' ? '滿油取還車' : v.fuelPolicy === 'full_to_empty' ? '滿油取車、可空車還車' : '原油量還車' }}</span>
            </div>
          }
          @if (v.mileagePolicy) {
            <div class="plan-settings__row">
              <span>里程政策</span>
              <span class="ui-chip ui-chip--neutral">{{ v.mileagePolicy === 'unlimited' ? '無限里程' : '有里程限制' }}</span>
            </div>
          }
          <div class="plan-settings__row">
            <span>付款方式</span>
            <span class="ui-chip ui-chip--neutral">線上付款</span>
          </div>
        </section>
      </div>

      <aside class="plan-aside">
        <app-order-summary-card
          [vehicle]="v"
          [startDate]="startDate()"
          [endDate]="endDate()"
          [returnLocation]="v.location ?? ''"
          [showVehicleHeader]="false"
          [priceBreakdown]="priceBreakdown()"
        ></app-order-summary-card>

        <button type="button" mat-flat-button color="primary" class="plan-page__next" (click)="onNext()">下一步</button>
      </aside>
    </div>
  }
</div>
```

- [ ] **Step 5: 建立 `plan-page.component.scss`**

```scss
.plan-page {
  @apply mx-auto;

  .plan-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 1.5rem;
  }

  @media (min-width: 900px) {
    .plan-layout {
      grid-template-columns: minmax(0, 1fr) 20rem;
      align-items: start;
    }
  }

  .plan-main > * + * {
    margin-top: 1.5rem;
  }

  .plan-aside {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: 900px) {
      position: sticky;
      top: 1rem;
    }
  }

  .plan-page__next {
    width: 100%;
  }
}

.vehicle-detail {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;

  &__media {
    position: relative;
    width: 8rem;
    flex-shrink: 0;
    border-radius: var(--mat-sys-corner-small);
    overflow: hidden;
    background: var(--mat-sys-surface-container-high);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__media-tag {
    position: absolute;
    left: 0.375rem;
    bottom: 0.375rem;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
  }

  &__placeholder {
    font-size: 2.5rem;
    color: var(--mat-sys-on-surface-variant);
  }

  &__body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  &__title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__similar {
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--mat-sys-on-surface-variant);
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;

    .material-symbols-rounded {
      font-size: 1rem;
    }
  }

  &__specs {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    color: var(--mat-sys-on-surface-variant);
    font-size: 0.875rem;

    li {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .material-symbols-rounded {
      font-size: 1.1rem;
    }
  }

  &__notice {
    margin: 0;
  }
}

.plan-select {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plan-option {
  display: block;
  border: 1px solid var(--mat-sys-outline-variant);
  border-radius: var(--mat-sys-corner-medium);
  padding: 1rem;
  cursor: pointer;

  &--selected {
    border-color: var(--mat-sys-primary);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  &__name {
    margin: 0;
    font-weight: 600;
  }

  &__price {
    margin: 0.125rem 0 0;
    color: var(--mat-sys-on-surface-variant);
    font-size: 0.875rem;
  }

  &__tags {
    display: flex;
    gap: 0.375rem;
    margin-top: 0.5rem;
  }

  &__coverage {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--mat-sys-outline-variant);
  }

  &__coverage-item {
    display: flex;
    gap: 0.5rem;

    p {
      margin: 0;
    }

    .material-symbols-rounded {
      color: var(--app-positive-fg);
      font-size: 1.1rem;
    }
  }

  &__details-link {
    display: inline-block;
    margin-top: 0.5rem;
    color: var(--mat-sys-primary);
    font-size: 0.875rem;
  }
}

.plan-settings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
```

- [ ] **Step 6: 執行測試確認通過**

Run: `npx nx test booking-flow -- plan-page.component.spec.ts`
Expected: PASS。

- [ ] **Step 7: 編譯整個 booking-flow lib**

Run: `npx nx build booking-flow`
Expected: 成功（這一步會連 `.html` template 一起做型別檢查，抓出模板裡任何存取到不存在成員的錯誤）。

- [ ] **Step 8: Commit**

```bash
git add libs/booking-flow/src/lib/pages/plan-page.component.ts libs/booking-flow/src/lib/pages/plan-page.component.html libs/booking-flow/src/lib/pages/plan-page.component.scss libs/booking-flow/src/lib/pages/plan-page.component.spec.ts
git commit -m "feat(booking-flow): 新增選車詳情/保險方案頁 PlanPageComponent"
```

---

## Task 9: 路由與 barrel export 接上新頁

**Files:**
- Modify: `libs/booking-flow/src/index.ts`
- Modify: `apps/booking/src/app/app.routes.ts`
- Modify: `apps/affiliate/src/app/app.routes.ts`
- Modify: `libs/booking-flow/src/lib/pages/search-page.component.ts`
- Modify: `libs/booking-flow/src/lib/pages/search-page.component.spec.ts`

**Interfaces:**
- Consumes: `PlanPageComponent`（Task 8）

- [ ] **Step 1: 寫失敗測試（先改 search-page 的測試期望值）**

`search-page.component.spec.ts` 第 152-165 行、`it('consumer 情境選車導向 /order/:id 並帶著日期', ...)` 整段改成：

```ts
  it('consumer 情境選車導向 /vehicle/:id/plan 並帶著日期', () => {
    const { component, navigate } = setup({
      start: '2026-08-20T10:00:00',
      end: '2026-08-23T10:00:00',
    });
    component.onVehicleSelect(makeVehicle({ id: 'v9' }));
    expect(navigate).toHaveBeenCalledWith(['/', 'vehicle', 'v9', 'plan'], {
      queryParams: {
        start: '2026-08-20T10:00:00',
        end: '2026-08-23T10:00:00',
        group: null,
      },
    });
  });
```

第 167-183 行、`it('夥伴情境選車導向 /p/:slug/order/:id', ...)` 整段改成：

```ts
  it('夥伴情境選車導向 /p/:slug/vehicle/:id/plan', () => {
    const { component, navigate } = setup(
      {
        start: '2026-08-20T10:00:00',
        end: '2026-08-23T10:00:00',
      },
      { partnerContext: true },
    );
    component.onVehicleSelect(makeVehicle({ id: 'v9' }));
    expect(navigate).toHaveBeenCalledWith(['/p', 'seaview', 'vehicle', 'v9', 'plan'], {
      queryParams: {
        start: '2026-08-20T10:00:00',
        end: '2026-08-23T10:00:00',
        group: null,
      },
    });
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx nx test booking-flow -- search-page.component.spec.ts`
Expected: FAIL（`onVehicleSelect` 目前還是導去 `order`，不是 `vehicle/:id/plan`）。

- [ ] **Step 3: 修改 `search-page.component.ts`**

`onVehicleSelect` 方法內的 `router.navigate` 目標改掉：

```ts
  onVehicleSelect(vehicle: Vehicle): void {
    const range = this.dateRange();
    if (!range) return;
    this.router.navigate([...this.context.basePath(), 'vehicle', vehicle.id, 'plan'], {
      queryParams: {
        start: range.startDateTime,
        end: range.endDateTime,
        group: range.vehicleGroup ?? null,
      },
    });
  }
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx nx test booking-flow -- search-page.component.spec.ts`
Expected: PASS。

- [ ] **Step 5: 加 barrel export**

`libs/booking-flow/src/index.ts` 加一行（放在 `export * from './lib/pages/order-page.component';` 上面，維持 search→plan→order 的閱讀順序）：

```ts
export * from './lib/pages/plan-page.component';
```

- [ ] **Step 6: 修改 `apps/booking/src/app/app.routes.ts`**

在 `path: 'search'` 那個路由物件後面（`order/:vehicleId` 之前）插入：

```ts
  {
    path: 'vehicle/:vehicleId/plan',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.PlanPageComponent),
  },
```

- [ ] **Step 7: 修改 `apps/affiliate/src/app/app.routes.ts`**

在 `p/:slug` 底下 `children` 陣列裡，`path: 'search'` 那個路由物件後面（`order/:vehicleId` 之前）插入同樣的區塊：

```ts
      {
        path: 'vehicle/:vehicleId/plan',
        loadComponent: () =>
          import('@car-rental/booking-flow').then((m) => m.PlanPageComponent),
      },
```

- [ ] **Step 8: 跑整個 booking-flow 測試**

Run: `npx nx test booking-flow`
Expected: 全數 PASS。

- [ ] **Step 9: 編譯兩個 app 確認路由設定沒有型別錯誤**

Run: `npx nx build booking && npx nx build affiliate`
Expected: 兩個都編譯成功。

- [ ] **Step 10: Commit**

```bash
git add libs/booking-flow/src/index.ts apps/booking/src/app/app.routes.ts apps/affiliate/src/app/app.routes.ts libs/booking-flow/src/lib/pages/search-page.component.ts libs/booking-flow/src/lib/pages/search-page.component.spec.ts
git commit -m "feat(booking-flow): search 選車後先進 plan 頁，兩個 app 路由與 barrel export 都接上"
```

---

## Task 10: `OrderPageComponent` 承接 `planId` + 付款方式導頁分流

**Files:**
- Modify: `libs/booking-flow/src/lib/pages/order-page.component.ts`
- Modify: `libs/booking-flow/src/lib/pages/order-page.component.spec.ts`

**Interfaces:**
- Consumes: `CatalogStore.submitBooking`（Task 4，`insurancePlanId?: string`）、`QuoteService.quote`（Task 4，`insurancePlan?: InsurancePlan`）

- [ ] **Step 1: 寫失敗測試**

`order-page.component.spec.ts` 的 `setup()` 函式簽章（第 58-61 行）改成可帶 `planId`：

```ts
function setup(
  params: { vehicleId: string; start: string; end: string; planId?: string },
  vehicle: Vehicle = makeVehicle(),
) {
```

`queryParamMap` 那段（原本第 79-84 行）改成：

```ts
          queryParamMap: of(
            convertToParamMap({
              start: params.start,
              end: params.end,
              ...(params.planId ? { planId: params.planId } : {}),
            }),
          ),
```

在 `describe('OrderPageComponent', ...)` 內、`it('送出後建立 pending_payment 訂單並導向付款頁', ...)` 後面加三個測試：

```ts
  it('現場付款送出後直接導向訂單成立頁，不經過付款頁', () => {
    const { component, navigate, bookingRepo } = setup(validParams);
    component.onConfirmSubmit({ ...confirmForm, paymentMethod: 'on_site' });
    const created = bookingRepo.getAll();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', created[0].id]);
  });

  it('planId 對應到車輛的保險方案時，priceBreakdown 反映保費，送出的訂單也記下 insurancePlanId', () => {
    const vehicleWithPlan = makeVehicle({
      insurancePlans: [{ id: 'ins1', name: '基本保障', dailyPriceFrom: 100, tags: [], coverageItems: [] }],
    });
    const { component, bookingRepo } = setup({ ...validParams, planId: 'ins1' }, vehicleWithPlan);
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(100 * component.days());
    component.onConfirmSubmit(confirmForm);
    expect(bookingRepo.getAll()[0].insurancePlanId).toBe('ins1');
  });

  it('沒有 planId 時 priceBreakdown 保費為 0，送出的訂單不記 insurancePlanId', () => {
    const { component, bookingRepo } = setup(validParams);
    expect(component.priceBreakdown()?.insuranceSubtotal).toBe(0);
    component.onConfirmSubmit(confirmForm);
    expect(bookingRepo.getAll()[0].insurancePlanId).toBeUndefined();
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx nx test booking-flow -- order-page.component.spec.ts`
Expected: FAIL（現場付款目前還是導去 `pay`；`planId` 目前沒被讀取，`insuranceSubtotal` 恆為 0 且不會反映在 `insurancePlanId`）。

- [ ] **Step 3: 修改 `order-page.component.ts`**

`params` 這個 `toSignal` 加 `planId` 欄位：

```ts
  private readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => ({
        start: p.get('start') ?? '',
        end: p.get('end') ?? '',
        group: toVehicleGroup(p.get('group')),
        planId: p.get('planId') ?? undefined,
      })),
    ),
    { initialValue: { start: '', end: '', group: undefined, planId: undefined } },
  );
```

`priceBreakdown` 這個 `computed` 改成會解析 `planId` 對應的方案並傳給 `quote.quote`：

```ts
  readonly priceBreakdown = computed<PriceBreakdown | null>(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return null;
    const result = this.couponResult();
    const insurancePlan = vehicle.insurancePlans?.find((p) => p.id === this.params().planId);
    return this.quote.quote({
      vehicle,
      startDate: this.startDate(),
      endDate: this.endDate(),
      addOnLines: this.selectedAddOnLines(),
      coupon: result?.ok ? result.coupon : undefined,
      partnerDiscountPercent: this.partner()?.discountPercent,
      insurancePlan,
    });
  });
```

`onConfirmSubmit` 整個方法改成：

```ts
  onConfirmSubmit(form: ConfirmFormValue): void {
    if (!this.ensureValidOrRedirect()) return;
    const vehicle = this.vehicle()!;
    const { start, end, planId } = this.params();
    this.submitting.set(true);
    this.submitError.set('');
    try {
      const result = this.couponResult();
      const booking = this.catalog.submitBooking({
        vehicleId: vehicle.id,
        startTime: start,
        endTime: end,
        pickupLocation: this.pickupLocation() || '機場',
        returnLocation: form.returnLocation,
        customer: { name: form.name, phone: form.phone, email: form.email },
        category: vehicle.category,
        startDate: this.startDate(),
        endDate: this.endDate(),
        addOns: this.selectedAddOnLines(),
        couponCode: result?.ok ? result.coupon?.code : undefined,
        paymentMethod: form.paymentMethod,
        partnerDiscountPercent: this.partner()?.discountPercent,
        sourcePartnerId: this.partner()?.id,
        insurancePlanId: planId,
      });
      const target =
        form.paymentMethod === 'on_site'
          ? [...this.context.basePath(), 'done', booking.id]
          : [...this.context.basePath(), 'pay', booking.id];
      this.router.navigate(target);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : '送出失敗，請稍後再試');
    } finally {
      this.submitting.set(false);
    }
  }
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx nx test booking-flow -- order-page.component.spec.ts`
Expected: PASS，含既有測試（例如 `'送出後建立 pending_payment 訂單並導向付款頁'` 用的是 `paymentMethod: 'credit_card'`，走的還是 `pay` 分支，應維持通過）。

- [ ] **Step 5: 跑整個 booking-flow 測試**

Run: `npx nx test booking-flow`
Expected: 全數 PASS。

- [ ] **Step 6: Commit**

```bash
git add libs/booking-flow/src/lib/pages/order-page.component.ts libs/booking-flow/src/lib/pages/order-page.component.spec.ts
git commit -m "feat(booking-flow): order-page 承接 planId 帶入計價與訂單，現場付款送出後直接到訂單成立頁"
```

---

## Task 11: 全流程驗收

**Files:** 無新改動，純驗收。

- [ ] **Step 1: 跑全部相關 lib 的測試**

Run: `npx nx run-many -t test -p domain,booking-flow`
Expected: 全數 PASS。

- [ ] **Step 2: 跑兩個 app 的 build**

Run: `npx nx run-many -t build -p booking,affiliate`
Expected: 兩個都編譯成功。

- [ ] **Step 3: 起 dev server，手動走一次 consumer 端全流程**

Run: `npx nx serve booking --port 5230 > /tmp/booking-serve.log 2>&1 &`（背景執行，避免 SIGPIPE；跑完記得 `lsof -ti:5230 | xargs -r kill`）

用瀏覽器（或 headless Chrome + `--screenshot`）依序操作：
1. `/search`：選日期、選一台「有 insurancePlans」的車（seed data 目前是 `v1` Gogoro 3）→ 應該導到 `/vehicle/v1/plan?...`。
2. Plan 頁：確認看得到車輛詳情、「選擇方案」卡（基本保障，NT$662起/天，自付額 ¥100,000.00 - ¥800,000.00 x2）、燃油/里程/付款方式三個 chip、右側「取車＆還車詳情」＋「付款詳情」卡（基本費用可展開/收合、加購項目顯示 NT$0）。點「下一步」→ 應該導到 `/order/v1?...&planId=ins-basic`。
3. Order 頁：確認右側摘要卡總價已經比沒選保險時多了保費；加購配件、輸入優惠碼都正常運作；填完確認頁資訊，付款方式選「現場付款」送出 → 應該直接導到 `/done/:id`，頁面顯示「待人工確認」類的文案（因為 `pending_payment`，不是 `confirmed`）。
4. 重新走一次，這次付款方式選「信用卡」送出 → 應該導到 `/pay/:id`，點「模擬付款成功」→ 導到 `/done/:id`，這次應顯示「已付款/已確認」類文案。

Expected: 四步都跟描述一致，特別是第 3、4 步的分流結果不同（現場付款跳過 pay 頁）。

- [ ] **Step 4: 確認沒有殘留 debug 產物**

Run: `git status --short`
Expected: 只有本計畫涉及的檔案有改動，沒有多餘的 console.log 或 `.bak` 檔。

- [ ] **Step 5: 最終 commit（若 Step 3 手動驗收過程中有修正任何小問題）**

若驗收過程沒有再改任何程式碼，這個 task 不需要 commit；若有修正，比照前面的 commit 慣例個別提交。

---

## Self-Review 紀錄

**Spec coverage：** 逐節比對 spec 後，Task 1-2 對應「Domain model 異動」；Task 3 對應「calculate-price.ts」；Task 4 對應「catalog.store.ts」/「quote.service.ts」；Task 5 對應「Seed data」；Task 6-7 對應「OrderSummaryCardComponent 調整」；Task 8 對應「新頁面 PlanPageComponent」；Task 9 對應「路由設計」/「路由檔與 barrel export」；Task 10 對應「付款方式與送出後導頁分流」；Task 11 對應「測試計畫」的手動視覺驗收部分。全部覆蓋，無缺口。

**Placeholder scan：** 通篇檢查過，沒有 TBD/TODO，每個程式碼區塊都是可以直接貼上的完整內容，沒有「比照 Task N」這種需要讀者自己回頭找的省略寫法。

**Type consistency：** 核對過 `InsurancePlan`/`PriceLineInsurance`/`FuelPolicy`/`MileagePolicy` 在 Task 1-2 定義後，Task 3-10 所有用到的地方（`calculatePrice`、`CatalogStore.price`/`submitBooking`、`QuoteService.quote`、`OrderSummaryCardComponent`、`PlanPageComponent`、`OrderPageComponent`）欄位名稱與型別一致，`selectedPlan()`/`selectPlan()`/`onNext()`/`ensureValidOrRedirect()` 這些方法名稱在 Task 8 定義後，Task 11 手動驗收沒有再用到別的名字。
