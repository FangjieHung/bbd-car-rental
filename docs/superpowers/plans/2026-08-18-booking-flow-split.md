# 預約流程拆頁重構 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把五步 stepper 的預約流程拆成「搜尋頁 → 單頁 checkout 下單頁 → 付款頁」三個獨立路由頁，並為日後串接金流預留單一替換點。

**Architecture:** 搜尋條件走 URL query params、選定車輛走 route param，讓每一頁都可分享可重整。原本集中在 `BookingFlowComponent` 的算價邏輯抽成 `QuoteService`；夥伴身分改由路由層的 shell 元件經 `BOOKING_CONTEXT` injection token 提供，頁面元件不需知道自己跑在哪個 app。既有的七個 step 元件內部實作一律不動，只是換位置引用。

**Tech Stack:** Angular（standalone + signals）、Angular Material、Nx monorepo、vitest + `@angular/core/testing` TestBed。

**Spec:** `docs/superpowers/specs/2026-08-18-booking-flow-split-design.md`

## Global Constraints

- **絕對不可修改**這四個檔案的內部實作：`libs/booking-flow/src/lib/steps/date-step.component.*`、`vehicle-step.component.*`、`dual-month-range-picker.component.*`、`plain-month-header.ts`。只能在新 template 中引用它們。
  - **唯一例外（Task 9 Step 6a）**：`date-step.component.ts` 第 6 行的 import 路徑必須改，因為它從即將被刪除的 `booking-flow.component.ts` 取用 `DateRange`。只改那一行的路徑字串，該檔其他部分一律不動。
- **絕對禁止**執行 `git checkout -- .`、`git restore`、`git stash`。工作區有其他 session 的未 commit 改動，這些指令會全部抹掉。
- Commit 前必跑 `git diff --cached --name-only` 確認暫存區只有本任務的檔案；有其他檔案先 `git reset <file>` 移出。
- 測試指令一律 `npx nx test booking-flow`（全 lib 約 3 秒，不需也無法過濾單檔）。
- 測試檔案用繁體中文寫 `it(...)` 描述，與 `catalog.store.spec.ts` / `vehicle-step.component.spec.ts` 既有慣例一致。
- 元件測試優先用 `TestBed.runInInjectionContext(() => new XxxComponent())` 直接建構，不用 `TestBed.createComponent` fixture。
- 金額一律整數（`PriceBreakdown` 各欄位皆為 number），不做小數處理。
- `libs/booking-flow/src/index.ts` 是唯一與其他 session 重疊的檔案。每次動它都只做「新增一行 export」或「刪除一行 export」，不重排既有內容。

## 檔案結構

新增：

| 檔案 | 責任 |
|---|---|
| `libs/booking-flow/src/lib/date-range.ts` | `DateRange` 型別的新家（原本寄生在 `booking-flow.component.ts`，admin 也在用） |
| `libs/booking-flow/src/lib/quote.service.ts` | 集中所有算價／優惠券驗證邏輯 |
| `libs/booking-flow/src/lib/quote.service.spec.ts` | 同上測試 |
| `libs/booking-flow/src/lib/booking-context.ts` | `BOOKING_CONTEXT` token、consumer 預設值、`providePartnerBookingContext()` |
| `libs/booking-flow/src/lib/booking-context.spec.ts` | 同上測試 |
| `libs/booking-flow/src/lib/components/order-summary-card.component.{ts,html,scss}` | 黏性金額摘要卡 |
| `libs/booking-flow/src/lib/components/search-criteria-bar.component.{ts,html,scss}` | 租期摘要條 +「修改」 |
| `libs/booking-flow/src/lib/pages/search-page.component.{ts,html,scss,spec.ts}` | 搜尋頁（原 step 1+2） |
| `libs/booking-flow/src/lib/pages/order-page.component.{ts,html,scss,spec.ts}` | 單頁 checkout（原 step 3+4+5） |
| `libs/booking-flow/src/lib/pages/payment-page.component.{ts,html,scss,spec.ts}` | 佔位付款頁 |
| `apps/affiliate/src/app/features/partner-booking/partner-shell.component.{ts,html}` | 夥伴路由 shell，提供 `BOOKING_CONTEXT` 與 banner |

修改：`catalog.store.ts`（加 `markBookingPaid`）、`confirm-step.component.{ts,html}`（暫時性 `showSummary` 開關 → 最終移除摘要區塊）、`done.component.{ts,html}`（改用 basePath）、`index.ts`、`apps/booking/src/app/app.routes.ts`、`apps/affiliate/src/app/app.routes.ts`。

刪除（Task 8）：`booking-flow.component.{ts,html,scss}`、`flow-mode.ts`、`partner-booking.component.{ts,html,scss}`。

---

### Task 1: 把 `DateRange` 搬出 `booking-flow.component.ts`

`DateRange` 目前定義在即將被刪除的 `booking-flow.component.ts` 裡，而 `apps/admin` 的兩個檔案在 import 它。先搬家，後續才能安全刪檔。

**Files:**
- Create: `libs/booking-flow/src/lib/date-range.ts`
- Modify: `libs/booking-flow/src/lib/booking-flow.component.ts`（移除型別定義，改為 import）
- Modify: `libs/booking-flow/src/index.ts`（新增一行 export）

**Interfaces:**
- Consumes: 無
- Produces: `DateRange { startDateTime: string; endDateTime: string }`，由 `@car-rental/booking-flow` 匯出。後續所有任務都用它。

- [ ] **Step 1: 建立新檔案**

`libs/booking-flow/src/lib/date-range.ts`：

```ts
/** 取還時間區間，ISO datetime 字串（例：2026-08-20T10:00:00） */
export interface DateRange {
  startDateTime: string;
  endDateTime: string;
}
```

- [ ] **Step 2: 從 `booking-flow.component.ts` 移除定義，改為 import**

刪掉這段（原檔第 14–17 行）：

```ts
export interface DateRange {
  startDateTime: string;
  endDateTime: string;
}
```

在既有的 import 區塊末尾加入（注意：**不要**再 `export` 它，否則 `index.ts` 會有兩處 `export *` 撞名）：

```ts
import { DateRange } from './date-range';
```

- [ ] **Step 3: 更新 `index.ts`**

在檔案最後新增一行（不要動既有幾行的順序）：

```ts
export * from './lib/date-range';
```

- [ ] **Step 4: 驗證三個專案都還編得起來**

```bash
npx nx test booking-flow
npx nx build admin
```

Expected: 測試 8 passed；admin build 成功（證明 `DateRange` 仍匯出得到）。

- [ ] **Step 5: Commit**

```bash
git diff --cached --name-only   # 應為空
git add libs/booking-flow/src/lib/date-range.ts libs/booking-flow/src/lib/booking-flow.component.ts libs/booking-flow/src/index.ts
git diff --cached --name-only   # 確認只有上面三個檔
git commit -m "refactor(booking-flow): move DateRange into its own module"
```

---

### Task 2: `QuoteService` — 抽出算價邏輯

目前 `BookingFlowComponent` 身上有三段算價：`priceForVehicle()`、`couponResult`、`priceBreakdown`，以及一段 `days` 天數計算。搜尋頁與下單頁都需要，先抽成 service。

**Files:**
- Create: `libs/booking-flow/src/lib/quote.service.ts`
- Test: `libs/booking-flow/src/lib/quote.service.spec.ts`
- Modify: `libs/booking-flow/src/index.ts`

**Interfaces:**
- Consumes: `CatalogStore.price()`、`CatalogStore.validateCoupon()`（皆已存在，不修改）
- Produces:
  - `CouponResult { ok: boolean; coupon?: Coupon; reason?: string }`
  - `QuoteService.daysBetween(startDate: string, endDate: string): number`
  - `QuoteService.vehicleTotal(vehicle: Vehicle, opts: { startDate: string; endDate: string; partnerDiscountPercent?: number }): number | null`
  - `QuoteService.validateCoupon(code: string, ctx: { startDate: string; days: number; category: VehicleCategory }): CouponResult | null`
  - `QuoteService.quote(input: { vehicle: Vehicle; startDate: string; endDate: string; addOnLines: { addOn: AddOn; qty: number }[]; coupon?: Coupon; partnerDiscountPercent?: number }): PriceBreakdown | null`

- [ ] **Step 1: 寫失敗的測試**

`libs/booking-flow/src/lib/quote.service.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
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
import { QuoteService } from './quote.service';

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

const plan: PricingPlan = {
  id: 'p1',
  name: '機車',
  appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [],
};
const calendar: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };
const coupon: Coupon = {
  id: 'c1',
  code: 'SUMMER',
  type: 'percent',
  value: 10,
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
};
const helmet: AddOn = {
  id: 'a1',
  name: '安全帽',
  unitPrice: 100,
  unit: 'per_rental',
};

function setup(): QuoteService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([helmet]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([coupon]) },
    ],
  });
  return TestBed.inject(QuoteService);
}

describe('QuoteService', () => {
  it('daysBetween 算出租期天數，缺日期時回 0', () => {
    const svc = setup();
    expect(svc.daysBetween('2026-08-20', '2026-08-23')).toBe(3);
    expect(svc.daysBetween('', '2026-08-23')).toBe(0);
    expect(svc.daysBetween('2026-08-23', '2026-08-20')).toBe(0);
  });

  it('vehicleTotal 對有定價方案的車回總價，無方案的車回 null', () => {
    const svc = setup();
    const scooter = makeVehicle({ category: 'scooter' });
    const ev = makeVehicle({ id: 'v2', category: 'ev' });

    const total = svc.vehicleTotal(scooter, { startDate: '2026-08-20', endDate: '2026-08-23' });
    expect(total).toBeGreaterThan(0);
    expect(svc.vehicleTotal(ev, { startDate: '2026-08-20', endDate: '2026-08-23' })).toBeNull();
  });

  it('vehicleTotal 套用夥伴折扣後總價較低', () => {
    const svc = setup();
    const scooter = makeVehicle();
    const full = svc.vehicleTotal(scooter, { startDate: '2026-08-20', endDate: '2026-08-23' });
    const discounted = svc.vehicleTotal(scooter, {
      startDate: '2026-08-20',
      endDate: '2026-08-23',
      partnerDiscountPercent: 10,
    });
    expect(discounted).toBeLessThan(full!);
  });

  it('validateCoupon 空字串回 null，有效碼回 ok，無效碼回原因', () => {
    const svc = setup();
    const ctx = { startDate: '2026-08-20', days: 3, category: 'scooter' as const };
    expect(svc.validateCoupon('', ctx)).toBeNull();
    expect(svc.validateCoupon('  ', ctx)).toBeNull();
    expect(svc.validateCoupon('SUMMER', ctx)).toEqual({ ok: true, coupon });
    expect(svc.validateCoupon('NOPE', ctx)).toEqual({ ok: false, reason: '查無此優惠碼' });
  });

  it('quote 缺日期時回 null，配件會計入 addOnSubtotal', () => {
    const svc = setup();
    const vehicle = makeVehicle();
    expect(
      svc.quote({ vehicle, startDate: '', endDate: '2026-08-23', addOnLines: [] }),
    ).toBeNull();

    const withAddOn = svc.quote({
      vehicle,
      startDate: '2026-08-20',
      endDate: '2026-08-23',
      addOnLines: [{ addOn: helmet, qty: 2 }],
    });
    expect(withAddOn!.addOnSubtotal).toBe(200);
  });

  it('quote 對無定價方案的車回 null 而不是丟錯', () => {
    const svc = setup();
    const ev = makeVehicle({ id: 'v2', category: 'ev' });
    expect(
      svc.quote({ vehicle: ev, startDate: '2026-08-20', endDate: '2026-08-23', addOnLines: [] }),
    ).toBeNull();
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test booking-flow`
Expected: FAIL，錯誤訊息為找不到模組 `./quote.service`。

- [ ] **Step 3: 寫最小實作**

`libs/booking-flow/src/lib/quote.service.ts`：

```ts
import { Injectable, inject } from '@angular/core';
import { AddOn, Coupon, PriceBreakdown, Vehicle, VehicleCategory } from '@car-rental/domain';
import { CatalogStore } from './catalog.store';

export interface CouponResult {
  ok: boolean;
  coupon?: Coupon;
  reason?: string;
}

/** 集中所有報價計算。搜尋頁與下單頁共用，避免兩邊各算一次。 */
@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly catalog = inject(CatalogStore);

  daysBetween(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    const ms =
      new Date(endDate + 'T00:00:00').getTime() - new Date(startDate + 'T00:00:00').getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }

  /** 整段租期的總價；該車型無定價方案時回 null（給 vehicle-step 判斷不可選） */
  vehicleTotal(
    vehicle: Vehicle,
    opts: { startDate: string; endDate: string; partnerDiscountPercent?: number },
  ): number | null {
    if (!opts.startDate || !opts.endDate) return null;
    try {
      return this.catalog.price({
        category: vehicle.category,
        startDate: opts.startDate,
        endDate: opts.endDate,
        addOns: [],
        partnerDiscountPercent: opts.partnerDiscountPercent,
      }).total;
    } catch {
      return null;
    }
  }

  /** 尚未輸入優惠碼時回 null（代表「沒有結果可顯示」，而非「驗證失敗」） */
  validateCoupon(
    code: string,
    ctx: { startDate: string; days: number; category: VehicleCategory },
  ): CouponResult | null {
    const trimmed = code.trim();
    if (!trimmed) return null;
    return this.catalog.validateCoupon(trimmed, ctx);
  }

  quote(input: {
    vehicle: Vehicle;
    startDate: string;
    endDate: string;
    addOnLines: { addOn: AddOn; qty: number }[];
    coupon?: Coupon;
    partnerDiscountPercent?: number;
  }): PriceBreakdown | null {
    if (!input.startDate || !input.endDate) return null;
    try {
      return this.catalog.price({
        category: input.vehicle.category,
        startDate: input.startDate,
        endDate: input.endDate,
        addOns: input.addOnLines,
        coupon: input.coupon,
        partnerDiscountPercent: input.partnerDiscountPercent,
      });
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test booking-flow`
Expected: PASS，14 passed（原 8 + 新 6）。

若 `helmet` 的 `AddOn` 欄位與 `libs/domain/src/lib/models/add-on.ts` 對不上，以 model 定義為準修正測試資料，不要改 model。

- [ ] **Step 5: 更新 `index.ts` 並 commit**

`index.ts` 末尾新增：

```ts
export * from './lib/quote.service';
```

```bash
git add libs/booking-flow/src/lib/quote.service.ts libs/booking-flow/src/lib/quote.service.spec.ts libs/booking-flow/src/index.ts
git diff --cached --name-only
git commit -m "feat(booking-flow): extract QuoteService for shared pricing logic"
```

---

### Task 3: `BOOKING_CONTEXT` — 夥伴身分與導頁前綴

原本靠 `[mode]` input 逐層傳。拆頁後頁面元件彼此獨立，改用 injection token。

**與 spec 的一處修正：** spec 寫「在 `/p/:slug` 這層 route 的 `providers` 加上 partner 版」。實作上 route-level `providers` 建立的是 environment injector，取不到 `ActivatedRoute`（它是 node injector 提供的）。因此改用「route 掛一個 shell 元件、由元件的 `providers` 提供」，這是 Angular 的標準作法。Shell 元件在 Task 8 建立。

**Files:**
- Create: `libs/booking-flow/src/lib/booking-context.ts`
- Test: `libs/booking-flow/src/lib/booking-context.spec.ts`
- Modify: `libs/booking-flow/src/index.ts`

**Interfaces:**
- Consumes: 無
- Produces:
  - `BookingContext { readonly partner: Signal<Partner | null>; readonly basePath: Signal<string[]> }`
  - `BOOKING_CONTEXT: InjectionToken<BookingContext>`（`providedIn: 'root'`，預設為 consumer 版：partner 恆 null、basePath 為 `['/']`）
  - `createPartnerBookingContext(partner: Signal<Partner | null>, slug: Signal<string>): BookingContext`
  - `providePartnerBookingContext(partner: Signal<Partner | null>, slug: Signal<string>): Provider`（`createPartnerBookingContext` 的 provider 包裝）

- [ ] **Step 1: 寫失敗的測試**

`libs/booking-flow/src/lib/booking-context.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Partner } from '@car-rental/domain';
import { BOOKING_CONTEXT, providePartnerBookingContext } from './booking-context';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 10,
  commission: { type: 'percent', value: 5 },
};

describe('BOOKING_CONTEXT', () => {
  it('預設（consumer）版：無夥伴，basePath 為根路徑', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [] });
    const ctx = TestBed.inject(BOOKING_CONTEXT);
    expect(ctx.partner()).toBeNull();
    expect(ctx.basePath()).toEqual(['/']);
  });

  it('夥伴版：帶出夥伴與 /p/:slug 前綴', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [providePartnerBookingContext(signal(partner), signal('seaview'))],
    });
    const ctx = TestBed.inject(BOOKING_CONTEXT);
    expect(ctx.partner()).toEqual(partner);
    expect(ctx.basePath()).toEqual(['/p', 'seaview']);
  });
});
```

若 `Partner` 型別有額外必填欄位，以 `libs/domain/src/lib/models/partner.ts` 為準補齊測試資料。

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test booking-flow`
Expected: FAIL，找不到模組 `./booking-context`。

- [ ] **Step 3: 寫最小實作**

`libs/booking-flow/src/lib/booking-context.ts`：

```ts
import { InjectionToken, Provider, Signal, computed, signal } from '@angular/core';
import { Partner } from '@car-rental/domain';

/**
 * 預約流程的執行情境。頁面元件靠它決定要不要顯示夥伴折扣／banner，
 * 以及導頁時該加什麼路徑前綴 —— 因此同一組頁面能同時服務 consumer 與夥伴入口。
 */
export interface BookingContext {
  /** consumer 情境恆為 null */
  readonly partner: Signal<Partner | null>;
  /** router.navigate 的路徑前綴：['/'] 或 ['/p', slug] */
  readonly basePath: Signal<string[]>;
}

const CONSUMER_CONTEXT: BookingContext = {
  partner: signal(null),
  basePath: signal(['/']),
};

export const BOOKING_CONTEXT = new InjectionToken<BookingContext>('BOOKING_CONTEXT', {
  providedIn: 'root',
  factory: () => CONSUMER_CONTEXT,
});

/**
 * 組出夥伴情境。shell 元件的 useFactory 直接呼叫這支 ——
 * 它需要的是 BookingContext 物件本身，不是 Provider。
 */
export function createPartnerBookingContext(
  partner: Signal<Partner | null>,
  slug: Signal<string>,
): BookingContext {
  return {
    partner,
    basePath: computed(() => ['/p', slug()]),
  };
}

/** 測試與非路由情境使用；shell 元件請改用 createPartnerBookingContext */
export function providePartnerBookingContext(
  partner: Signal<Partner | null>,
  slug: Signal<string>,
): Provider {
  return { provide: BOOKING_CONTEXT, useValue: createPartnerBookingContext(partner, slug) };
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test booking-flow`
Expected: PASS，16 passed。

- [ ] **Step 5: 更新 `index.ts` 並 commit**

`index.ts` 末尾新增：

```ts
export * from './lib/booking-context';
```

```bash
git add libs/booking-flow/src/lib/booking-context.ts libs/booking-flow/src/lib/booking-context.spec.ts libs/booking-flow/src/index.ts
git diff --cached --name-only
git commit -m "feat(booking-flow): add BOOKING_CONTEXT for partner-aware routing"
```

---

### Task 4: `OrderSummaryCardComponent` — 黏性金額摘要卡

單頁 checkout 滾動時金額必須恆可見。內容取自 `confirm-step.component.html` 現有的「購買內容」與「試算明細」兩區塊。

**同時**在 `confirm-step` 加上暫時性的 `@Input() showSummary = true`，讓下單頁能關掉它內建的摘要以免同頁重複顯示；舊的 `BookingFlowComponent` 不傳這個 input，行為完全不變。這個 input 會在 Task 8 連同摘要區塊一起刪除。

**Files:**
- Create: `libs/booking-flow/src/lib/components/order-summary-card.component.ts`
- Create: `libs/booking-flow/src/lib/components/order-summary-card.component.html`
- Create: `libs/booking-flow/src/lib/components/order-summary-card.component.scss`
- Modify: `libs/booking-flow/src/lib/steps/confirm-step.component.ts`（加一個 input）
- Modify: `libs/booking-flow/src/lib/steps/confirm-step.component.html`（兩個摘要區塊外包 `@if (showSummary)`）
- Modify: `libs/booking-flow/src/index.ts`

**Interfaces:**
- Consumes: `PriceBreakdown`、`Vehicle`、`AddOn`（皆來自 `@car-rental/domain`）
- Produces: `OrderSummaryCardComponent`，selector `app-order-summary-card`，inputs：`vehicle: Vehicle | null`、`startDate: string`、`endDate: string`、`selectedAddOnLines: { addOn: AddOn; qty: number }[]`、`priceBreakdown: PriceBreakdown | null`。無 output。
- Produces: `ConfirmStepComponent` 多一個 `@Input() showSummary = true`（暫時性）。

- [ ] **Step 1: 建立元件 class**

`libs/booking-flow/src/lib/components/order-summary-card.component.ts`：

```ts
import { Component, Input } from '@angular/core';
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
  @Input() selectedAddOnLines: { addOn: AddOn; qty: number }[] = [];
  @Input() priceBreakdown: PriceBreakdown | null = null;
}
```

- [ ] **Step 2: 建立 template**

`libs/booking-flow/src/lib/components/order-summary-card.component.html`（內容照搬自 `confirm-step.component.html` 的兩個區塊，僅把 `vehicle`／`priceBreakdown` 等改為同名 input，語意不變）：

```html
<div class="order-summary-card">
  <h3>購買內容</h3>
  @if (vehicle) {
    <div class="summary-block">
      <div class="line"><span>車款</span><span>{{ vehicle.brand }} {{ vehicle.model }}（{{ vehicle.plateNumber }}）</span></div>
      <div class="line"><span>租期</span><span>{{ startDate }} ～ {{ endDate }}</span></div>
      @if (selectedAddOnLines.length > 0) {
        <div class="line">
          <span>配件</span>
          <span>
            @for (line of selectedAddOnLines; track line.addOn.id) {
              <span class="add-on-item">{{ line.addOn.name }} x{{ line.qty }}</span>
            }
          </span>
        </div>
      }
    </div>
  }

  @if (priceBreakdown) {
    <div class="summary">
      <h3>試算明細</h3>
      @for (day of priceBreakdown.dailyLines; track day.date) {
        <div class="line"><span>{{ day.date }}（{{ day.dayType }}）</span><span>NT$ {{ day.price }}</span></div>
      }
      <div class="line"><span>租金原價</span><span>NT$ {{ priceBreakdown.rentalRaw }}</span></div>
      @if (priceBreakdown.tierDiscountAmount > 0) {
        <div class="line discount">
          <span>累租折扣（{{ priceBreakdown.tierDiscountPercent }}%）</span>
          <span>-NT$ {{ priceBreakdown.tierDiscountAmount }}</span>
        </div>
      }
      <div class="line"><span>租金小計</span><span>NT$ {{ priceBreakdown.rentalSubtotal }}</span></div>
      @if (priceBreakdown.partnerDiscount > 0) {
        <div class="line discount">
          <span>夥伴折扣（{{ priceBreakdown.partnerDiscountPercent }}%）</span>
          <span>-NT$ {{ priceBreakdown.partnerDiscount }}</span>
        </div>
      }
      @for (addOnLine of priceBreakdown.addOnLines; track addOnLine.addOnId) {
        <div class="line"><span>{{ addOnLine.name }} x{{ addOnLine.qty }}</span><span>NT$ {{ addOnLine.amount }}</span></div>
      }
      @if (priceBreakdown.addOnSubtotal > 0) {
        <div class="line"><span>配件費用小計</span><span>NT$ {{ priceBreakdown.addOnSubtotal }}</span></div>
      }
      @if (priceBreakdown.couponDiscount > 0) {
        <div class="line discount">
          <span>優惠折抵（{{ priceBreakdown.couponCode }}）</span>
          <span>-NT$ {{ priceBreakdown.couponDiscount }}</span>
        </div>
      }
      <div class="line total"><span>應付總計</span><span>NT$ {{ priceBreakdown.total }}</span></div>
    </div>
  }
</div>
```

（夥伴折扣那一列是新增的 —— 原 `confirm-step` 漏掉了 `partnerDiscount`，夥伴客人看不到自己的折扣。順手補上。）

- [ ] **Step 3: 建立 scss**

`libs/booking-flow/src/lib/components/order-summary-card.component.scss`。先照抄 `confirm-step.component.scss` 中 `.summary-block`、`.summary`、`.line`、`.discount`、`.total`、`.add-on-item` 這些 selector 的規則，外層改掛在 `.order-summary-card` 底下，並加上黏性定位：

```scss
.order-summary-card {
  position: sticky;
  top: 1rem;
  align-self: start;
}
```

窄螢幕的底部黏貼在 Task 6 由下單頁的版面負責，此元件不處理。

- [ ] **Step 4: 在 `confirm-step` 加上暫時性開關**

`confirm-step.component.ts` 的 inputs 區塊末尾新增：

```ts
  /** 暫時性：下單頁改用 app-order-summary-card 顯示摘要，此開關在舊 stepper 移除後一併刪除 */
  @Input() showSummary = true;
```

`confirm-step.component.html`：把現有的 `@if (vehicle) { ... } @else { ... }` 整段與其後的 `@if (priceBreakdown) { ... }` 整段（含最上方的 `<h3>購買內容</h3>`）包進：

```html
  @if (showSummary) {
    ... 原本那兩段原封不動 ...
  }
```

- [ ] **Step 5: 跑測試與 build 驗證**

```bash
npx nx test booking-flow
npx nx build booking
```

Expected: 16 passed；build 成功。舊流程行為不變（`showSummary` 預設 true）。

- [ ] **Step 6: 更新 `index.ts` 並 commit**

`index.ts` 末尾新增：

```ts
export * from './lib/components/order-summary-card.component';
```

```bash
git add libs/booking-flow/src/lib/components libs/booking-flow/src/lib/steps/confirm-step.component.ts libs/booking-flow/src/lib/steps/confirm-step.component.html libs/booking-flow/src/index.ts
git diff --cached --name-only
git commit -m "feat(booking-flow): add OrderSummaryCardComponent"
```

---

### Task 5: `SearchCriteriaBarComponent` — 租期摘要條

下單頁頂端顯示租期，並提供「修改」回搜尋頁。

**Files:**
- Create: `libs/booking-flow/src/lib/components/search-criteria-bar.component.ts`
- Create: `libs/booking-flow/src/lib/components/search-criteria-bar.component.html`
- Create: `libs/booking-flow/src/lib/components/search-criteria-bar.component.scss`
- Modify: `libs/booking-flow/src/index.ts`

**Interfaces:**
- Consumes: 無
- Produces: `SearchCriteriaBarComponent`，selector `app-search-criteria-bar`，inputs：`startDate: string`、`endDate: string`、`days: number`；output：`edit: EventEmitter<void>`。

- [ ] **Step 1: 建立元件**

`libs/booking-flow/src/lib/components/search-criteria-bar.component.ts`：

```ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

/**
 * 下單頁頂端的租期摘要。取還地點目前全站固定為「馬公」（見 CatalogStore.submitBooking），
 * 故此處寫死；多據點取還是另一個題目。
 */
@Component({
  selector: 'app-search-criteria-bar',
  imports: [MatButtonModule],
  templateUrl: './search-criteria-bar.component.html',
  styleUrl: './search-criteria-bar.component.scss',
})
export class SearchCriteriaBarComponent {
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() days = 0;
  @Output() edit = new EventEmitter<void>();

  protected readonly location = '馬公';
}
```

- [ ] **Step 2: 建立 template 與 scss**

`search-criteria-bar.component.html`：

```html
<div class="search-criteria-bar">
  <span class="criteria">
    {{ location }} · {{ startDate }} ～ {{ endDate }} · 共 {{ days }} 天
  </span>
  <button mat-stroked-button type="button" (click)="edit.emit()">修改</button>
</div>
```

`search-criteria-bar.component.scss`：

```scss
.search-criteria-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--mat-sys-corner-medium, 12px);
  background: var(--mat-sys-surface-container);
  color: var(--mat-sys-on-surface);

  .criteria {
    font: var(--mat-sys-body-medium);
  }
}
```

- [ ] **Step 3: 驗證 build**

Run: `npx nx build booking`
Expected: 成功（此元件尚未被引用，只驗證編譯與 SCSS token 可解析）。

- [ ] **Step 4: 更新 `index.ts` 並 commit**

`index.ts` 末尾新增：

```ts
export * from './lib/components/search-criteria-bar.component';
```

```bash
git add libs/booking-flow/src/lib/components/search-criteria-bar.component.ts libs/booking-flow/src/lib/components/search-criteria-bar.component.html libs/booking-flow/src/lib/components/search-criteria-bar.component.scss libs/booking-flow/src/index.ts
git diff --cached --name-only
git commit -m "feat(booking-flow): add SearchCriteriaBarComponent"
```

---

### Task 6: `SearchPageComponent` — 搜尋頁

原 step 1 + step 2 合併成一頁，狀態走 URL query params。

**Files:**
- Create: `libs/booking-flow/src/lib/pages/search-page.component.ts`
- Create: `libs/booking-flow/src/lib/pages/search-page.component.html`
- Create: `libs/booking-flow/src/lib/pages/search-page.component.scss`
- Test: `libs/booking-flow/src/lib/pages/search-page.component.spec.ts`
- Modify: `apps/booking/src/app/app.routes.ts`
- Modify: `libs/booking-flow/src/index.ts`

**Interfaces:**
- Consumes: `QuoteService`（Task 2）、`BOOKING_CONTEXT`（Task 3）、`DateRange`（Task 1）、`CatalogStore.availableVehicles()`、既有的 `DateStepComponent`（inputs `dateRange`，output `dateRangeChange`）與 `VehicleStepComponent`（inputs `vehicles` / `selectedVehicle` / `priceForVehicle` / `days`，output `vehicleSelect`）
- Produces: `SearchPageComponent`，selector `app-search-page`。無 input/output（狀態全在 URL）。

- [ ] **Step 1: 寫失敗的測試**

`libs/booking-flow/src/lib/pages/search-page.component.spec.ts`：

```ts
import { describe, it, expect, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {
  AddOn,
  Coupon,
  Customer,
  Partner,
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
import { BOOKING_CONTEXT, providePartnerBookingContext } from '../booking-context';
import { SearchPageComponent } from './search-page.component';

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

const plan: PricingPlan = {
  id: 'p1',
  name: '機車',
  appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [],
};
const calendar: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };
const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 10,
  commission: { type: 'percent', value: 5 },
};

function setup(
  queryParams: Record<string, string>,
  opts: { partnerContext?: boolean } = {},
) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([]) },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: { queryParamMap: of(convertToParamMap(queryParams)) },
      },
      ...(opts.partnerContext
        ? [providePartnerBookingContext(signal(partner), signal('seaview'))]
        : []),
    ],
  });
  const component = TestBed.runInInjectionContext(() => new SearchPageComponent());
  return { component, navigate };
}

describe('SearchPageComponent', () => {
  it('無 query params 時車輛清單為空', () => {
    const { component } = setup({});
    expect(component.availableVehicles()).toEqual([]);
    expect(component.days()).toBe(0);
  });

  it('帶入 start/end 後列出可用車輛並算出天數', () => {
    const { component } = setup({
      start: '2026-08-20T10:00:00',
      end: '2026-08-23T10:00:00',
    });
    expect(component.availableVehicles()).toHaveLength(1);
    expect(component.days()).toBe(3);
    expect(component.priceForVehicle(makeVehicle())).toBeGreaterThan(0);
  });

  it('日期變更寫回 query params 而不自行保存狀態', () => {
    const { component, navigate } = setup({});
    component.onDateRangeChange({
      startDateTime: '2026-09-01T10:00:00',
      endDateTime: '2026-09-04T10:00:00',
    });
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { start: '2026-09-01T10:00:00', end: '2026-09-04T10:00:00' },
        replaceUrl: true,
      }),
    );
  });

  it('consumer 情境選車導向 /order/:id 並帶著日期', () => {
    const { component, navigate } = setup({
      start: '2026-08-20T10:00:00',
      end: '2026-08-23T10:00:00',
    });
    component.onVehicleSelect(makeVehicle({ id: 'v9' }));
    expect(navigate).toHaveBeenCalledWith(['/', 'order', 'v9'], {
      queryParams: { start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' },
    });
  });

  it('夥伴情境選車導向 /p/:slug/order/:id', () => {
    const { component, navigate } = setup(
      { start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' },
      { partnerContext: true },
    );
    component.onVehicleSelect(makeVehicle({ id: 'v9' }));
    expect(navigate).toHaveBeenCalledWith(['/p', 'seaview', 'order', 'v9'], {
      queryParams: { start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' },
    });
  });

  it('夥伴情境的報價低於 consumer 情境', () => {
    const consumerPage = setup({ start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' });
    const partnerPage = setup(
      { start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' },
      { partnerContext: true },
    );
    expect(partnerPage.component.priceForVehicle(makeVehicle())).toBeLessThan(
      consumerPage.component.priceForVehicle(makeVehicle())!,
    );
  });

  it('預設情境沒有夥伴 banner', () => {
    const { component } = setup({});
    expect(TestBed.inject(BOOKING_CONTEXT).partner()).toBeNull();
    expect(component.partner()).toBeNull();
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test booking-flow`
Expected: FAIL，找不到模組 `./search-page.component`。

- [ ] **Step 3: 寫最小實作**

`libs/booking-flow/src/lib/pages/search-page.component.ts`：

```ts
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Vehicle } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { CatalogStore } from '../catalog.store';
import { DateRange } from '../date-range';
import { QuoteService } from '../quote.service';
import { DateStepComponent } from '../steps/date-step.component';
import { VehicleStepComponent } from '../steps/vehicle-step.component';

/**
 * 搜尋頁：選租期 + 挑車。
 * 租期是 URL query params 的投影，元件本身不保存狀態 —— 使用者才能分享網址、重整、按上一頁。
 */
@Component({
  selector: 'app-search-page',
  imports: [DateStepComponent, VehicleStepComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogStore);
  private readonly quote = inject(QuoteService);
  private readonly context = inject(BOOKING_CONTEXT);

  readonly partner = this.context.partner;

  private readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => ({ start: p.get('start') ?? '', end: p.get('end') ?? '' })),
    ),
    { initialValue: { start: '', end: '' } },
  );

  readonly dateRange = computed<DateRange | null>(() => {
    const { start, end } = this.params();
    return start && end ? { startDateTime: start, endDateTime: end } : null;
  });

  readonly startDate = computed(() => this.params().start.slice(0, 10));
  readonly endDate = computed(() => this.params().end.slice(0, 10));
  readonly days = computed(() => this.quote.daysBetween(this.startDate(), this.endDate()));

  readonly selectedVehicle = signal<Vehicle | null>(null);

  readonly availableVehicles = computed<Vehicle[]>(() => {
    const range = this.dateRange();
    if (!range) return [];
    return this.catalog.availableVehicles(range.startDateTime, range.endDateTime);
  });

  priceForVehicle = (vehicle: Vehicle): number | null =>
    this.quote.vehicleTotal(vehicle, {
      startDate: this.startDate(),
      endDate: this.endDate(),
      partnerDiscountPercent: this.partner()?.discountPercent,
    });

  onDateRangeChange(range: DateRange): void {
    this.selectedVehicle.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { start: range.startDateTime, end: range.endDateTime },
      replaceUrl: true,
    });
  }

  onVehicleSelect(vehicle: Vehicle): void {
    const range = this.dateRange();
    if (!range) return;
    this.router.navigate([...this.context.basePath(), 'order', vehicle.id], {
      queryParams: { start: range.startDateTime, end: range.endDateTime },
    });
  }
}
```

注意 `priceForVehicle` 寫成 arrow function property 而非 method，因為它會被當作 input 傳給 `VehicleStepComponent`，需要綁定的 `this`（原 `BookingFlowComponent` 是靠 `.bind(this)` 處理的）。

- [ ] **Step 4: 建立 template 與 scss**

`search-page.component.html`：

```html
<div class="search-page">
  @if (partner(); as p) {
    <div class="partner-banner">{{ p.name }} 專屬預約</div>
  }
  <h1>租車預約</h1>

  <section class="date-section">
    <app-date-step
      [dateRange]="dateRange()"
      (dateRangeChange)="onDateRangeChange($event)"
    ></app-date-step>
  </section>

  <section class="vehicle-section">
    <app-vehicle-step
      [vehicles]="availableVehicles()"
      [selectedVehicle]="selectedVehicle()"
      [priceForVehicle]="priceForVehicle"
      [days]="days()"
      (vehicleSelect)="onVehicleSelect($event)"
    ></app-vehicle-step>
  </section>
</div>
```

`search-page.component.scss`：把 `booking-flow.component.scss` 中 `.booking-flow` 的規則搬過來，外層 selector 改為 `.search-page`，並加上兩個 section 的間距。（**更正**：`.partner-banner` 在 repo 中沒有任何樣式規則，舊流程的 banner 本來就是裸 div，因此無規則可搬。）

```scss
.search-page {
  .date-section {
    margin-bottom: 2rem;
  }
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test booking-flow`
Expected: PASS，23 passed。

若 `onDateRangeChange` 的測試因 `relativeTo` 造成 `expect.objectContaining` 比對失敗，那是預期內的 —— `objectContaining` 只檢查列出的欄位，`relativeTo` 多出來不影響。若仍失敗請印出實際呼叫參數再調整測試期望值，不要為了過測試而拿掉 `relativeTo`。

- [ ] **Step 6: 掛上 `apps/booking` 路由**

`apps/booking/src/app/app.routes.ts` 改為（保留 `/book` 讓舊流程在 Task 8 之前仍可運作）：

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  {
    path: 'search',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.SearchPageComponent),
  },
  {
    path: 'book',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.BookingFlowComponent),
  },
  {
    path: 'book/done/:id',
    loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent),
  },
];
```

- [ ] **Step 7: 驗證 build 並 commit**

```bash
npx nx build booking
```

Expected: 成功。

`index.ts` 末尾新增：

```ts
export * from './lib/pages/search-page.component';
```

```bash
git add libs/booking-flow/src/lib/pages libs/booking-flow/src/index.ts apps/booking/src/app/app.routes.ts
git diff --cached --name-only
git commit -m "feat(booking-flow): add SearchPageComponent with URL-driven state"
```

---

### Task 7: `OrderPageComponent` — 單頁 checkout

原 step 3 + 4 + 5 合併成一頁滾動，右側／底部黏著金額摘要卡。

**Files:**
- Create: `libs/booking-flow/src/lib/pages/order-page.component.ts`
- Create: `libs/booking-flow/src/lib/pages/order-page.component.html`
- Create: `libs/booking-flow/src/lib/pages/order-page.component.scss`
- Test: `libs/booking-flow/src/lib/pages/order-page.component.spec.ts`
- Modify: `apps/booking/src/app/app.routes.ts`
- Modify: `libs/booking-flow/src/index.ts`

**Interfaces:**
- Consumes: `QuoteService`、`BOOKING_CONTEXT`、`OrderSummaryCardComponent`、`SearchCriteriaBarComponent`、`CatalogStore.submitBooking()`、既有的 `AddonStepComponent`（inputs `addOns` / `addOnQty`，output `addOnQtyChange: { addOnId, qty }`）、`CouponStepComponent`（inputs `couponCode` / `couponResult` / `priceBreakdown`，output `couponCodeChange: string`）、`ConfirmStepComponent`（inputs `vehicle` / `startDate` / `endDate` / `selectedAddOnLines` / `priceBreakdown` / `submitting` / `submitError` / `showSummary`，output `confirm: ConfirmFormValue`）
- Produces: `OrderPageComponent`，selector `app-order-page`。無 input/output。

- [ ] **Step 1: 寫失敗的測試**

`libs/booking-flow/src/lib/pages/order-page.component.spec.ts`：

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
import { OrderPageComponent } from './order-page.component';

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

const plan: PricingPlan = {
  id: 'p1',
  name: '機車',
  appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [],
};
const calendar: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };
const coupon: Coupon = {
  id: 'c1',
  code: 'SUMMER',
  type: 'percent',
  value: 10,
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
};
const helmet: AddOn = { id: 'a1', name: '安全帽', unitPrice: 100, unit: 'per_rental' };

function setup(params: { vehicleId: string; start: string; end: string }) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  const bookingRepo = createInMemoryRepo<RentalBooking>([]);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: BOOKING_REPO, useValue: bookingRepo },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([calendar]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([helmet]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([coupon]) },
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
  const component = TestBed.runInInjectionContext(() => new OrderPageComponent());
  return { component, navigate, bookingRepo };
}

const validParams = { vehicleId: 'v1', start: '2026-08-20T10:00:00', end: '2026-08-23T10:00:00' };

describe('OrderPageComponent', () => {
  it('載入指定車輛與租期', () => {
    const { component } = setup(validParams);
    expect(component.vehicle()?.id).toBe('v1');
    expect(component.days()).toBe(3);
    expect(component.priceBreakdown()).not.toBeNull();
  });

  it('加購配件會提高總價', () => {
    const { component } = setup(validParams);
    const before = component.priceBreakdown()!.total;
    component.onAddOnQtyChange('a1', 2);
    expect(component.priceBreakdown()!.total).toBe(before + 200);
  });

  it('輸入有效優惠碼會降低總價', () => {
    const { component } = setup(validParams);
    const before = component.priceBreakdown()!.total;
    component.onCouponCodeChange('SUMMER');
    expect(component.couponResult()).toEqual({ ok: true, coupon });
    expect(component.priceBreakdown()!.total).toBeLessThan(before);
  });

  it('無效優惠碼回報原因且不改變總價', () => {
    const { component } = setup(validParams);
    const before = component.priceBreakdown()!.total;
    component.onCouponCodeChange('NOPE');
    expect(component.couponResult()).toEqual({ ok: false, reason: '查無此優惠碼' });
    expect(component.priceBreakdown()!.total).toBe(before);
  });

  it('送出後建立 pending_payment 訂單並導向付款頁', () => {
    const { component, navigate, bookingRepo } = setup(validParams);
    component.onConfirmSubmit({
      name: '王小明',
      phone: '0912345678',
      email: 'a@b.c',
      paymentMethod: 'credit_card',
    });
    const created = bookingRepo.getAll();
    expect(created).toHaveLength(1);
    expect(created[0].status).toBe('pending_payment');
    expect(navigate).toHaveBeenCalledWith(['/', 'pay', created[0].id]);
  });

  it('缺日期時導回搜尋頁且不建立訂單', () => {
    const { component, navigate, bookingRepo } = setup({ vehicleId: 'v1', start: '', end: '' });
    expect(component.priceBreakdown()).toBeNull();
    component.onConfirmSubmit({
      name: '王小明',
      phone: '0912345678',
      email: 'a@b.c',
      paymentMethod: 'credit_card',
    });
    expect(bookingRepo.getAll()).toHaveLength(0);
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });

  it('查無車輛時導回搜尋頁', () => {
    const { component, navigate } = setup({ ...validParams, vehicleId: 'nope' });
    expect(component.vehicle()).toBeNull();
    component.ensureValidOrRedirect();
    expect(navigate).toHaveBeenCalledWith(['/', 'search'], expect.anything());
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test booking-flow`
Expected: FAIL，找不到模組 `./order-page.component`。

- [ ] **Step 3: 寫最小實作**

`libs/booking-flow/src/lib/pages/order-page.component.ts`：

```ts
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AddOn, PriceBreakdown, Vehicle, VEHICLE_REPO } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { CatalogStore } from '../catalog.store';
import { CouponResult, QuoteService } from '../quote.service';
import { OrderSummaryCardComponent } from '../components/order-summary-card.component';
import { SearchCriteriaBarComponent } from '../components/search-criteria-bar.component';
import { AddonStepComponent } from '../steps/addon-step.component';
import { CouponStepComponent } from '../steps/coupon-step.component';
import { ConfirmFormValue, ConfirmStepComponent } from '../steps/confirm-step.component';

/**
 * 下單頁：單頁 checkout。車與租期來自 URL，配件與優惠碼只活在這一頁。
 * 送出後訂單狀態為 pending_payment，實際扣款由付款頁負責。
 */
@Component({
  selector: 'app-order-page',
  imports: [
    SearchCriteriaBarComponent,
    AddonStepComponent,
    CouponStepComponent,
    ConfirmStepComponent,
    OrderSummaryCardComponent,
  ],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss',
})
export class OrderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogStore);
  private readonly quote = inject(QuoteService);
  private readonly context = inject(BOOKING_CONTEXT);
  private readonly vehicleRepo = inject(VEHICLE_REPO);

  readonly partner = this.context.partner;

  private readonly vehicleId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('vehicleId') ?? '')),
    { initialValue: '' },
  );
  private readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => ({ start: p.get('start') ?? '', end: p.get('end') ?? '' })),
    ),
    { initialValue: { start: '', end: '' } },
  );

  readonly vehicle = computed<Vehicle | null>(
    () => this.vehicleRepo.getById(this.vehicleId()) ?? null,
  );
  readonly startDate = computed(() => this.params().start.slice(0, 10));
  readonly endDate = computed(() => this.params().end.slice(0, 10));
  readonly days = computed(() => this.quote.daysBetween(this.startDate(), this.endDate()));

  readonly addOnQty = signal<Record<string, number>>({});
  readonly couponCode = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal('');

  readonly addOns = computed<AddOn[]>(() => this.catalog.addOns());

  readonly selectedAddOnLines = computed<{ addOn: AddOn; qty: number }[]>(() => {
    const qtyMap = this.addOnQty();
    return this.addOns()
      .map((addOn) => ({ addOn, qty: qtyMap[addOn.id] ?? 0 }))
      .filter((line) => line.qty > 0);
  });

  readonly couponResult = computed<CouponResult | null>(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return null;
    return this.quote.validateCoupon(this.couponCode(), {
      startDate: this.startDate(),
      days: this.days(),
      category: vehicle.category,
    });
  });

  readonly priceBreakdown = computed<PriceBreakdown | null>(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return null;
    const result = this.couponResult();
    return this.quote.quote({
      vehicle,
      startDate: this.startDate(),
      endDate: this.endDate(),
      addOnLines: this.selectedAddOnLines(),
      coupon: result?.ok ? result.coupon : undefined,
      partnerDiscountPercent: this.partner()?.discountPercent,
    });
  });

  /** 車或租期不成立就沒有可下單的內容，導回搜尋頁重來 */
  ensureValidOrRedirect(): boolean {
    if (this.vehicle() && this.startDate() && this.endDate()) return true;
    this.goToSearch();
    return false;
  }

  goToSearch(): void {
    const { start, end } = this.params();
    this.router.navigate([...this.context.basePath(), 'search'], {
      queryParams: start && end ? { start, end } : {},
    });
  }

  onAddOnQtyChange(addOnId: string, qty: number): void {
    this.addOnQty.update((map) => ({ ...map, [addOnId]: qty }));
  }

  onCouponCodeChange(code: string): void {
    this.couponCode.set(code);
  }

  onConfirmSubmit(form: ConfirmFormValue): void {
    if (!this.ensureValidOrRedirect()) return;
    const vehicle = this.vehicle()!;
    const { start, end } = this.params();
    this.submitting.set(true);
    this.submitError.set('');
    try {
      const result = this.couponResult();
      const booking = this.catalog.submitBooking({
        vehicleId: vehicle.id,
        startTime: start,
        endTime: end,
        pickupLocation: '馬公',
        returnLocation: '馬公',
        customer: { name: form.name, phone: form.phone, email: form.email },
        category: vehicle.category,
        startDate: this.startDate(),
        endDate: this.endDate(),
        addOns: this.selectedAddOnLines(),
        couponCode: result?.ok ? result.coupon?.code : undefined,
        paymentMethod: form.paymentMethod,
        partnerDiscountPercent: this.partner()?.discountPercent,
        sourcePartnerId: this.partner()?.id,
      });
      this.router.navigate([...this.context.basePath(), 'pay', booking.id]);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : '送出失敗，請稍後再試');
    } finally {
      this.submitting.set(false);
    }
  }
}
```

- [ ] **Step 4: 建立 template 與 scss**

`order-page.component.html`：

```html
<div class="order-page">
  @if (partner(); as p) {
    <div class="partner-banner">{{ p.name }} 專屬預約</div>
  }
  <h1>填寫訂單</h1>

  <app-search-criteria-bar
    [startDate]="startDate()"
    [endDate]="endDate()"
    [days]="days()"
    (edit)="goToSearch()"
  ></app-search-criteria-bar>

  <div class="checkout-layout">
    <div class="checkout-main">
      <section>
        <h2>加購配件</h2>
        <app-addon-step
          [addOns]="addOns()"
          [addOnQty]="addOnQty()"
          (addOnQtyChange)="onAddOnQtyChange($event.addOnId, $event.qty)"
        ></app-addon-step>
      </section>

      <section>
        <h2>優惠券</h2>
        <app-coupon-step
          [couponCode]="couponCode()"
          [couponResult]="couponResult()"
          [priceBreakdown]="priceBreakdown()"
          (couponCodeChange)="onCouponCodeChange($event)"
        ></app-coupon-step>
      </section>

      <section>
        <app-confirm-step
          [vehicle]="vehicle()"
          [startDate]="startDate()"
          [endDate]="endDate()"
          [selectedAddOnLines]="selectedAddOnLines()"
          [priceBreakdown]="priceBreakdown()"
          [submitting]="submitting()"
          [submitError]="submitError()"
          [showSummary]="false"
          (confirm)="onConfirmSubmit($event)"
        ></app-confirm-step>
      </section>
    </div>

    <aside class="checkout-aside">
      <app-order-summary-card
        [vehicle]="vehicle()"
        [startDate]="startDate()"
        [endDate]="endDate()"
        [selectedAddOnLines]="selectedAddOnLines()"
        [priceBreakdown]="priceBreakdown()"
      ></app-order-summary-card>
    </aside>
  </div>
</div>
```

`order-page.component.scss`：

```scss
.order-page {
  .checkout-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .checkout-main section + section {
    margin-top: 2rem;
  }

  @media (min-width: 900px) {
    .checkout-layout {
      grid-template-columns: minmax(0, 1fr) 20rem;
      align-items: start;
    }
  }
}
```

（**更正**：`.partner-banner` 在 repo 中沒有任何樣式規則可複製，舊流程即是如此。banner 維持無樣式，與舊流程一致。）

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test booking-flow`
Expected: PASS，30 passed。

- [ ] **Step 6: 掛路由並驗證 build**

`apps/booking/src/app/app.routes.ts` 在 `search` 之後新增：

```ts
  {
    path: 'order/:vehicleId',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.OrderPageComponent),
  },
```

```bash
npx nx build booking
```

Expected: 成功。

- [ ] **Step 7: 更新 `index.ts` 並 commit**

`index.ts` 末尾新增：

```ts
export * from './lib/pages/order-page.component';
```

```bash
git add libs/booking-flow/src/lib/pages libs/booking-flow/src/index.ts apps/booking/src/app/app.routes.ts
git diff --cached --name-only
git commit -m "feat(booking-flow): add OrderPageComponent single-page checkout"
```

---

### Task 8: `PaymentPageComponent` + `markBookingPaid` + done 路徑統一

佔位付款頁。接真金流時只會動這一個元件的內部。同時把 done 頁改成情境感知，修掉夥伴客人會被導離夥伴品牌頁的既有 bug。

**Files:**
- Modify: `libs/booking-flow/src/lib/catalog.store.ts`（新增 `markBookingPaid`）
- Modify: `libs/booking-flow/src/lib/catalog.store.spec.ts`（新增一個測試）
- Create: `libs/booking-flow/src/lib/pages/payment-page.component.ts`
- Create: `libs/booking-flow/src/lib/pages/payment-page.component.html`
- Create: `libs/booking-flow/src/lib/pages/payment-page.component.scss`
- Test: `libs/booking-flow/src/lib/pages/payment-page.component.spec.ts`
- Modify: `libs/booking-flow/src/lib/steps/done.component.ts`、`done.component.html`
- Modify: `apps/booking/src/app/app.routes.ts`
- Modify: `libs/booking-flow/src/index.ts`

**Interfaces:**
- Consumes: `BOOKING_CONTEXT`、`BOOKING_REPO`、`OrderSummaryCardComponent` 不使用（付款頁只需總金額）
- Produces:
  - `CatalogStore.markBookingPaid(bookingId: string): RentalBooking` —— 把狀態改為 `'confirmed'`，查無訂單丟 `Error('查無訂單')`
  - `PaymentPageComponent`，selector `app-payment-page`
  - `DoneComponent` 多一個 `protected readonly homeLink: Signal<string[]>`

- [ ] **Step 1: 為 `markBookingPaid` 寫失敗的測試**

在 `libs/booking-flow/src/lib/catalog.store.spec.ts` 的 `describe('CatalogStore', ...)` 內新增（沿用該檔既有的 `setup()` helper）：

```ts
  it('markBookingPaid 把待付款訂單轉為已確認，查無訂單則丟錯', () => {
    const store = setup();
    const booking = store.submitBooking({
      vehicleId: 'v1',
      startTime: '2026-08-20T10:00:00',
      endTime: '2026-08-23T10:00:00',
      pickupLocation: '馬公',
      returnLocation: '馬公',
      customer: { name: '王小明', phone: '0912345678', email: 'a@b.c' },
      category: 'scooter',
      startDate: '2026-08-20',
      endDate: '2026-08-23',
      addOns: [],
      paymentMethod: 'credit_card',
    });
    expect(booking.status).toBe('pending_payment');

    const paid = store.markBookingPaid(booking.id);
    expect(paid.status).toBe('confirmed');
    expect(() => store.markBookingPaid('nope')).toThrow('查無訂單');
  });
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test booking-flow`
Expected: FAIL，`store.markBookingPaid is not a function`。

- [ ] **Step 3: 實作 `markBookingPaid`**

在 `libs/booking-flow/src/lib/catalog.store.ts` 的 `submitBooking` 方法之後新增：

```ts
  /** 付款成功後呼叫。目前由佔位付款頁觸發，日後改由金流回調觸發。 */
  markBookingPaid(bookingId: string): RentalBooking {
    const booking = this.bookingRepo.getById(bookingId);
    if (!booking) throw new Error('查無訂單');
    return this.bookingRepo.update(bookingId, { status: 'confirmed' });
  }
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test booking-flow`
Expected: PASS，31 passed。

- [ ] **Step 5: 為付款頁寫失敗的測試**

`libs/booking-flow/src/lib/pages/payment-page.component.spec.ts`：

```ts
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {
  AddOn,
  Coupon,
  Customer,
  PriceBreakdown,
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
import { PaymentPageComponent } from './payment-page.component';

const emptyBreakdown: PriceBreakdown = {
  dailyLines: [],
  rentalRaw: 1300,
  tierDiscountPercent: 0,
  tierDiscountAmount: 0,
  rentalSubtotal: 1300,
  partnerDiscountPercent: 0,
  partnerDiscount: 0,
  addOnLines: [],
  addOnSubtotal: 0,
  couponDiscount: 0,
  total: 1300,
};

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    customerId: 'c1',
    startTime: '2026-08-20T10:00:00',
    endTime: '2026-08-23T10:00:00',
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'pending_payment',
    addOns: [],
    priceBreakdown: emptyBreakdown,
    paymentMethod: 'credit_card',
    ...partial,
  };
}

function setup(bookingId: string, bookings: RentalBooking[]) {
  TestBed.resetTestingModule();
  const navigate = vi.fn().mockResolvedValue(true);
  const bookingRepo = createInMemoryRepo<RentalBooking>(bookings);
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
      { provide: BOOKING_REPO, useValue: bookingRepo },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([]) },
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([]) },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ bookingId })) },
      },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new PaymentPageComponent());
  return { component, navigate, bookingRepo };
}

describe('PaymentPageComponent', () => {
  it('顯示待付款訂單的金額', () => {
    const { component } = setup('b1', [makeBooking()]);
    expect(component.booking()?.id).toBe('b1');
    expect(component.amount()).toBe(1300);
  });

  it('模擬付款成功後訂單轉為 confirmed 並導向完成頁', () => {
    const { component, navigate, bookingRepo } = setup('b1', [makeBooking()]);
    component.onPaySuccess();
    expect(bookingRepo.getById('b1')!.status).toBe('confirmed');
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });

  it('模擬付款失敗時狀態不變且顯示錯誤，可重試', () => {
    const { component, bookingRepo } = setup('b1', [makeBooking()]);
    component.onPayFailure();
    expect(bookingRepo.getById('b1')!.status).toBe('pending_payment');
    expect(component.payError()).not.toBe('');

    component.onPaySuccess();
    expect(bookingRepo.getById('b1')!.status).toBe('confirmed');
    expect(component.payError()).toBe('');
  });

  it('查無訂單時導向完成頁', () => {
    const { component, navigate } = setup('nope', []);
    component.redirectIfNotPayable();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'nope']);
  });

  it('訂單已非待付款時導向完成頁', () => {
    const { component, navigate } = setup('b1', [makeBooking({ status: 'confirmed' })]);
    component.redirectIfNotPayable();
    expect(navigate).toHaveBeenCalledWith(['/', 'done', 'b1']);
  });
});
```

- [ ] **Step 6: 跑測試確認失敗**

Run: `npx nx test booking-flow`
Expected: FAIL，找不到模組 `./payment-page.component`。

- [ ] **Step 7: 實作付款頁**

`libs/booking-flow/src/lib/pages/payment-page.component.ts`：

```ts
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { BOOKING_REPO, PaymentMethod, RentalBooking } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { CatalogStore } from '../catalog.store';

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  credit_card: '信用卡',
  line_pay: 'LINE Pay',
  on_site: '現場付款',
  bank_transfer: '轉帳',
};

/**
 * 佔位付款頁。目前用兩顆按鈕模擬金流結果。
 * 串接真金流時，只需把 onPaySuccess/onPayFailure 換成 SDK 呼叫或 redirect，
 * 並新增回調路由 pay/:bookingId/result —— 流程結構不必再動。
 */
@Component({
  selector: 'app-payment-page',
  imports: [MatButtonModule],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogStore);
  private readonly context = inject(BOOKING_CONTEXT);
  private readonly bookingRepo = inject(BOOKING_REPO);

  private readonly reloadTick = signal(0);

  readonly bookingId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('bookingId') ?? '')),
    { initialValue: '' },
  );

  readonly booking = computed<RentalBooking | null>(() => {
    this.reloadTick();
    return this.bookingRepo.getById(this.bookingId()) ?? null;
  });

  readonly amount = computed(() => this.booking()?.priceBreakdown?.total ?? 0);
  readonly paymentMethodLabel = computed(() => {
    const method = this.booking()?.paymentMethod;
    return method ? PAYMENT_METHOD_LABEL[method] : '未指定';
  });

  readonly payError = signal('');
  readonly paying = signal(false);

  /** 訂單不存在或已付過款，就沒有付款這件事可做，直接看結果頁 */
  redirectIfNotPayable(): boolean {
    const booking = this.booking();
    if (booking && booking.status === 'pending_payment') return true;
    this.goToDone();
    return false;
  }

  onPaySuccess(): void {
    this.paying.set(true);
    this.payError.set('');
    try {
      this.catalog.markBookingPaid(this.bookingId());
      this.reloadTick.update((n) => n + 1);
      this.goToDone();
    } catch (err) {
      this.payError.set(err instanceof Error ? err.message : '付款失敗，請稍後再試');
    } finally {
      this.paying.set(false);
    }
  }

  onPayFailure(): void {
    this.payError.set('付款未完成，請重新嘗試或改用其他付款方式。');
  }

  private goToDone(): void {
    this.router.navigate([...this.context.basePath(), 'done', this.bookingId()]);
  }
}
```

`payment-page.component.html`：

```html
<div class="payment-page">
  <h1>付款</h1>

  @if (booking(); as b) {
    <div class="pay-summary">
      <div class="line"><span>訂單編號</span><span>{{ b.id }}</span></div>
      <div class="line"><span>付款方式</span><span>{{ paymentMethodLabel() }}</span></div>
      <div class="line total"><span>應付金額</span><span>NT$ {{ amount() }}</span></div>
    </div>

    @if (payError()) {
      <p class="pay-error">{{ payError() }}</p>
    }

    <div class="actions">
      <button mat-flat-button color="primary" [disabled]="paying()" (click)="onPaySuccess()">
        模擬付款成功
      </button>
      <button mat-stroked-button [disabled]="paying()" (click)="onPayFailure()">
        模擬付款失敗
      </button>
    </div>
    <p class="placeholder-note">此為佔位付款頁，尚未串接金流。</p>
  } @else {
    <p>查無此訂單。</p>
  }
</div>
```

`payment-page.component.scss`：

```scss
.payment-page {
  .pay-summary {
    margin: 1.5rem 0;

    .line {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .total {
      font: var(--mat-sys-title-medium);
    }
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  .pay-error {
    color: var(--mat-sys-error);
  }

  .placeholder-note {
    margin-top: 1rem;
    color: var(--mat-sys-on-surface-variant);
    font: var(--mat-sys-body-small);
  }
}
```

- [ ] **Step 8: 跑測試確認通過**

Run: `npx nx test booking-flow`
Expected: PASS，36 passed。

- [ ] **Step 9: 讓 done 頁認得情境**

`done.component.ts`：加入 `BOOKING_CONTEXT` 並改用 `RouterLink` 的陣列形式。

```ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BOOKING_CONTEXT } from '../booking-context';

@Component({
  selector: 'app-booking-done',
  imports: [RouterLink],
  templateUrl: './done.component.html',
  styleUrl: './done.component.scss',
})
export class DoneComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly context = inject(BOOKING_CONTEXT);

  readonly bookingId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  /** 夥伴情境要回到夥伴的搜尋頁，不能把客人踢出夥伴品牌的網址 */
  protected readonly homeLink = this.context.basePath;
}
```

`done.component.html` 最後一行改為：

```html
  <a [routerLink]="homeLink()">返回首頁</a>
```

- [ ] **Step 10: 掛路由並驗證**

`apps/booking/src/app/app.routes.ts` 新增付款與 done 路由（`book/done/:id` 改為 redirect 保留舊連結）：

```ts
  {
    path: 'pay/:bookingId',
    loadComponent: () =>
      import('@car-rental/booking-flow').then((m) => m.PaymentPageComponent),
  },
  {
    path: 'done/:id',
    loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent),
  },
  { path: 'book/done/:id', redirectTo: 'done/:id' },
```

同時把原本的 `book/done/:id` loadComponent 那條刪掉（被上面的 redirect 取代）。

```bash
npx nx test booking-flow
npx nx build booking
```

Expected: 36 passed；build 成功。

- [ ] **Step 11: 更新 `index.ts` 並 commit**

`index.ts` 末尾新增：

```ts
export * from './lib/pages/payment-page.component';
```

```bash
git add libs/booking-flow/src/lib apps/booking/src/app/app.routes.ts libs/booking-flow/src/index.ts
git diff --cached --name-only
git commit -m "feat(booking-flow): add placeholder payment page and markBookingPaid"
```

---

### Task 9: affiliate 切換 + 刪除舊 stepper 流程

最後一步。**動 `index.ts` 前必須先確認另一個 session 已收工** —— 這一步要從 `index.ts` 刪除 export，與新增 export 不同，衝突風險較高。

**Files:**
- Create: `apps/affiliate/src/app/features/partner-booking/partner-shell.component.ts`
- Create: `apps/affiliate/src/app/features/partner-booking/partner-shell.component.html`
- Modify: `apps/affiliate/src/app/app.routes.ts`
- Modify: `apps/booking/src/app/app.routes.ts`（移除 `/book`）
- Modify: `libs/booking-flow/src/lib/steps/date-step.component.ts`（**僅第 6 行 import 路徑**，見 Step 6a）
- Modify: `libs/booking-flow/src/lib/steps/confirm-step.component.ts`、`confirm-step.component.html`（移除 `showSummary` 與摘要區塊）
- Modify: `libs/booking-flow/src/index.ts`
- Delete: `libs/booking-flow/src/lib/booking-flow.component.{ts,html,scss}`
- Delete: `libs/booking-flow/src/lib/flow-mode.ts`
- Delete: `apps/affiliate/src/app/features/partner-booking/partner-booking.component.{ts,html,scss,spec.ts}`

**Interfaces:**
- Consumes: `providePartnerBookingContext`（Task 3）、`SearchPageComponent`、`OrderPageComponent`、`PaymentPageComponent`、`DoneComponent`
- Produces: `PartnerShellComponent`（affiliate app 內部，不對外匯出）

- [ ] **Step 1: 確認可以動 `index.ts`**

```bash
git status --short libs/booking-flow/src/index.ts
```

若顯示 `M`，代表有未 commit 的改動可能來自另一個 session。**先向使用者確認**再繼續，不要自行 commit 或還原他人的改動。

- [ ] **Step 2: 建立夥伴 shell 元件**

`apps/affiliate/src/app/features/partner-booking/partner-shell.component.ts`：

```ts
import { Component, Signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PARTNER_REPO, Partner } from '@car-rental/domain';
import { BOOKING_CONTEXT, BookingContext, createPartnerBookingContext } from '@car-rental/booking-flow';

/**
 * 夥伴入口的路由 shell。存在的理由是提供 BOOKING_CONTEXT ——
 * route 層的 providers 建立的是 environment injector，拿不到 ActivatedRoute，
 * 元件層的 providers 才可以。子路由的頁面元件由此繼承到夥伴情境。
 */
@Component({
  selector: 'app-partner-shell',
  imports: [RouterOutlet],
  templateUrl: './partner-shell.component.html',
  providers: [
    {
      provide: BOOKING_CONTEXT,
      useFactory: (): BookingContext => {
        const route = inject(ActivatedRoute);
        const partnerRepo = inject(PARTNER_REPO);
        const slug: Signal<string> = toSignal(
          route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
          { initialValue: '' },
        );
        const partner = computed<Partner | null>(
          () => partnerRepo.getAll().find((p) => p.slug === slug()) ?? null,
        );
        return createPartnerBookingContext(partner, slug);
      },
    },
  ],
})
export class PartnerShellComponent {}
```

`partner-shell.component.html`：

```html
<router-outlet></router-outlet>
```

注意：這裡呼叫 `createPartnerBookingContext()` 而非 `providePartnerBookingContext()`，因為 `useFactory` 要回傳的是 `BookingContext` 物件本身，不是 `Provider`；且 slug signal 必須在 injection context 中才建得出來。兩支函式共用同一段 basePath 邏輯，沒有重複。

- [ ] **Step 3: 改寫 affiliate 路由**

`apps/affiliate/src/app/app.routes.ts`：

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'p/:slug/account',
    loadComponent: () =>
      import('./features/partner-account/partner-account.component').then(
        (m) => m.PartnerAccountComponent,
      ),
  },
  {
    path: 'p/:slug',
    loadComponent: () =>
      import('./features/partner-booking/partner-shell.component').then(
        (m) => m.PartnerShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      {
        path: 'search',
        loadComponent: () =>
          import('@car-rental/booking-flow').then((m) => m.SearchPageComponent),
      },
      {
        path: 'order/:vehicleId',
        loadComponent: () =>
          import('@car-rental/booking-flow').then((m) => m.OrderPageComponent),
      },
      {
        path: 'pay/:bookingId',
        loadComponent: () =>
          import('@car-rental/booking-flow').then((m) => m.PaymentPageComponent),
      },
      {
        path: 'done/:id',
        loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent),
      },
    ],
  },
  { path: 'book/done/:id', redirectTo: '' },
  { path: '**', redirectTo: '' },
];
```

`p/:slug/account` 必須排在 `p/:slug` 之前，否則會被後者的 children 攔截。

- [ ] **Step 4: 驗證 affiliate build**

```bash
npx nx build affiliate
```

Expected: 成功。此時 affiliate 已不再使用 `BookingFlowComponent`。

- [ ] **Step 5: 移除 `confirm-step` 的暫時性摘要**

`confirm-step.component.ts`：刪除

```ts
  /** 暫時性：下單頁改用 app-order-summary-card 顯示摘要，此開關在舊 stepper 移除後一併刪除 */
  @Input() showSummary = true;
```

`confirm-step.component.html`：刪除 Task 4 加上的 `@if (showSummary) { ... }` 包裝**以及它包住的整段內容**（`<h3>購買內容</h3>`、`@if (vehicle)` 那段、`@if (priceBreakdown)` 那段），只保留「付款人資訊」以下的部分。

`order-page.component.html`：移除 `[showSummary]="false"` 這一行。

同時把送出鍵文案改為付款語意 —— `confirm-step.component.html` 最後的按鈕：

```html
    <button mat-flat-button color="primary" [disabled]="!canSubmit" (click)="onSubmit()">
      {{ submitting ? '處理中…' : '前往付款' }}
    </button>
```

`canSubmit` 判斷式中的 `!!this.priceBreakdown` 仍需要 `priceBreakdown` input，因此該 input **不可刪除**，只是不再用於畫面渲染。

- [ ] **Step 6a: 修正 `date-step` 的 import 路徑（刪檔前必做）**

`date-step.component.ts` 第 6 行目前是：

```ts
import { DateRange } from '../booking-flow.component';
```

改為：

```ts
import { DateRange } from '../date-range';
```

**只改這一行的路徑字串。** 該檔案其他任何部分都不得更動 —— 它屬於另一條工作線，這是刪除 `booking-flow.component.ts` 所必需的最小改動。

改完立刻驗證：

```bash
unset NX_WORKSPACE_ROOT_PATH && npx nx test booking-flow
```

Expected: 仍為 36 passed。

- [ ] **Step 6: 刪除舊 stepper 流程**

```bash
git rm libs/booking-flow/src/lib/booking-flow.component.ts \
       libs/booking-flow/src/lib/booking-flow.component.html \
       libs/booking-flow/src/lib/booking-flow.component.scss \
       libs/booking-flow/src/lib/flow-mode.ts \
       apps/affiliate/src/app/features/partner-booking/partner-booking.component.ts \
       apps/affiliate/src/app/features/partner-booking/partner-booking.component.html \
       apps/affiliate/src/app/features/partner-booking/partner-booking.component.scss \
       apps/affiliate/src/app/features/partner-booking/partner-booking.component.spec.ts
```

- [ ] **Step 7: 清理 `index.ts` 與 booking 路由**

`index.ts` 刪除這兩行：

```ts
export * from './lib/booking-flow.component';
export type { FlowMode } from './lib/flow-mode';
```

`apps/booking/src/app/app.routes.ts` 刪除 `path: 'book'` 那一整條 route（`book/done/:id` 的 redirect 保留）。

- [ ] **Step 8: 全專案驗證**

```bash
npx nx test booking-flow
npx nx build booking
npx nx build affiliate
npx nx build admin
```

Expected: 36 passed；三個 app build 全數成功。admin build 成功即證明 Task 1 搬走的 `DateRange` 與未被更動的 `DateStepComponent` / `VehicleStepComponent` 仍正常匯出。

- [ ] **Step 9: Commit**

```bash
git diff --cached --name-only
git add libs/booking-flow apps/booking/src/app/app.routes.ts apps/affiliate/src/app
git diff --cached --name-only   # 確認沒有其他 session 的檔案混入
git commit -m "refactor(booking-flow): switch affiliate to split pages, remove legacy stepper"
```

- [ ] **Step 10: 手動驗收**

啟動 dev server（Angular 預設 port 易衝突，改用 5200+）：

```bash
npx nx serve booking --port 5200 > /tmp/booking-serve.log 2>&1 &
```

用 curl 確認回應（不要 curl 整頁，避免塞爆 context）：

```bash
curl -s -o /dev/null -w "%{http_code}\n" --max-time 5 http://localhost:5200/search
```

Expected: 200。

接著在瀏覽器手動走一次：`/search` 選日期 → 選車 → `/order/:id` 加配件與優惠碼、金額卡即時更新 → 送出 → `/pay/:id` 模擬付款成功 → `/done/:id`。夥伴版走 `/p/<某個存在的 slug>/search` 同樣一輪，確認 banner 顯示、折扣生效、完成頁的「返回首頁」回到 `/p/<slug>`。

驗收完關掉 server：

```bash
lsof -ti:5200 | xargs -r kill
```

---

## 完成標準

- `npx nx test booking-flow` 全綠（預期 36 passed）
- `npx nx build booking`、`npx nx build affiliate`、`npx nx build admin` 三者皆成功
- consumer 與夥伴兩條路徑手動走完整流程無誤
- `libs/booking-flow` 內不再有 `BookingFlowComponent`、`flow-mode.ts`
- `date-step`、`vehicle-step`、`dual-month-range-picker`、`plain-month-header` 四個檔案的 `git log` 中沒有本次任務的 commit
