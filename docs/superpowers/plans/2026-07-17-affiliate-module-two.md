# B2B 模組二（民宿分銷 affiliate）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 民宿分銷——抽共用預約流程到 `libs/booking-flow`，新增 `apps/affiliate` 民宿代訂頁與對帳頁，domain 加民宿/協議折扣/退佣模型與純函式，admin 加民宿管理與退佣報表 CSV，全程純前端 mock。

**Architecture:** 把模組一的五步流程從 `apps/booking` 抽成 buildable lib `libs/booking-flow`（接受 consumer/partner 情境），兩個 app 共用。domain 加 `Partner`（協議折扣 + 退佣規則）、`RentalBooking.sourcePartnerId`、`calculatePrice` 選填協議折扣、`calculateCommission` 純函式。affiliate 經 `/p/:slug` 免登入代訂、`/p/:slug/account` 對帳；admin 管理民宿與出退佣報表。

**Tech Stack:** Angular 22 standalone、Nx 23.1、vitest、Angular Material 22、localStorage mock。

## Global Constraints

- 純前端 mock：不接真後端/金流/外部 API；付款方式純 UI。
- 架構鐵律：元件只經 store；store 只依賴 `Repository<T>` 介面；車輛狀態只經 `VehicleStore.transition()`；apps 之間不互相 import（共用邏輯經 `libs/*`，跨 app 資料經共用 localStorage key）。
- 繁中；金額整數 TWD；折扣/退佣用 `Math.round`。
- 定價疊加順序（不可改）：日期定價 → 天數累折 → **協議折扣（施於 rentalSubtotal）→ 優惠券（施於協議折扣後）** → 加配件。半開區間 `[start, end)`。
- 退佣基數固定為 `PriceBreakdown.rentalSubtotal`（累折後、協議/優惠券折扣前；配件不列入）。
- 測試守恆：抽取不得減少既有測試總數（現況 domain 25 + admin 58 + theme-pack 7 + booking 8 = 98）；新功能各自附測試。
- localStorage keys：既有 `cr.vehicles/customers/bookings/maintenance/pricingPlans/seasonCalendar/addOns/coupons`；新增 `cr.partners`、`cr.payouts`。
- 別名新增 `@car-rental/booking-flow` → `libs/booking-flow/src/index.ts`。

---

### Task 1: domain — Partner / CommissionRule / MonthlyPayout 模型與 repo

**Files:**
- Create: `libs/domain/src/lib/models/{commission.ts,partner.ts,monthly-payout.ts}`
- Modify: `libs/domain/src/lib/models/{index.ts,rental-booking.ts}`
- Modify: `libs/domain/src/lib/repositories/{tokens.ts,seed-data.ts}`
- Modify: `apps/admin` re-export 層 `core/repositories/{tokens.ts,seed-data.ts}`
- Test: `libs/domain/src/lib/repositories/seed-data.spec.ts`（新增或既有補充）

**Interfaces:**
- Produces：`Partner`、`CommissionRule`、`CommissionType`、`MonthlyPayout`；`PARTNER_REPO`、`PAYOUT_REPO` token；`seedPartners`、`seedPayouts`；`RentalBooking.sourcePartnerId?`。

- [ ] **Step 1: 新增模型**

`commission.ts`：
```ts
export type CommissionType = 'percent' | 'per_vehicle_day';
export interface CommissionRule { type: CommissionType; value: number; }
```
`partner.ts`：
```ts
import { CommissionRule } from './commission';
export interface Partner {
  id: string; name: string; slug: string;
  discountPercent: number; // 協議折扣 0–100
  commission: CommissionRule;
}
```
`monthly-payout.ts`：
```ts
export type PayoutStatus = 'pending' | 'paid';
export interface MonthlyPayout {
  id: string; partnerId: string; month: string; /* 'YYYY-MM' */ status: PayoutStatus;
}
```
`rental-booking.ts`：`RentalBooking` interface 加一行 `sourcePartnerId?: string;`。
`models/index.ts` 追加：
```ts
export * from './commission';
export * from './partner';
export * from './monthly-payout';
```

- [ ] **Step 2: tokens 與 seed**

domain `tokens.ts` 追加（import Partner/MonthlyPayout）：
```ts
export const PARTNER_REPO = new InjectionToken<Repository<Partner>>('PARTNER_REPO');
export const PAYOUT_REPO = new InjectionToken<Repository<MonthlyPayout>>('PAYOUT_REPO');
```
domain `seed-data.ts` 追加：
```ts
export function seedPartners(): Partner[] {
  return [
    { id: 'pt1', name: '海景民宿', slug: 'seaview', discountPercent: 8,
      commission: { type: 'percent', value: 10 } },
    { id: 'pt2', name: '陽光民宿', slug: 'sunshine', discountPercent: 5,
      commission: { type: 'per_vehicle_day', value: 100 } },
  ];
}
export function seedPayouts(): MonthlyPayout[] {
  return [{ id: 'po1', partnerId: 'pt1', month: '2026-07', status: 'pending' }];
}
```
並在既有 `seedBookings()` 內把其中 1–2 筆訂單加上 `sourcePartnerId: 'pt1'`（讓 admin 報表/對帳頁 demo 有資料）。

- [ ] **Step 3: admin re-export 層同步**

`apps/admin/src/app/core/repositories/tokens.ts` 追加 re-export `PARTNER_REPO, PAYOUT_REPO`；`seed-data.ts` 追加 re-export `seedPartners, seedPayouts`（比照現有 ADDON/COUPON 的 re-export 寫法）。

- [ ] **Step 4: 測試（seed 自洽）**

在 `seed-data.spec.ts` 補：
```ts
import { seedPartners, seedBookings } from './seed-data';
it('每個帶 sourcePartnerId 的 seed 訂單，其 partner 存在於 seedPartners', () => {
  const ids = new Set(seedPartners().map((p) => p.id));
  for (const b of seedBookings()) if (b.sourcePartnerId) expect(ids.has(b.sourcePartnerId)).toBe(true);
});
it('seedPartners slug 唯一', () => {
  const slugs = seedPartners().map((p) => p.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});
```

- [ ] **Step 5: 驗證 + commit**

Run: `npx nx test domain && npx nx test admin && npx nx build domain && npx nx build admin`
Expected: 全綠、build exit 0。
```bash
git add libs/domain apps/admin
git commit -m "feat(domain): Partner/CommissionRule/MonthlyPayout 模型與 seed，RentalBooking 加 sourcePartnerId"
```

---

### Task 2: domain — calculatePrice 加協議折扣

**Files:**
- Modify: `libs/domain/src/lib/models/price-breakdown.ts`
- Modify: `libs/domain/src/lib/pricing/calculate-price.ts`
- Test: `libs/domain/src/lib/pricing/calculate-price.spec.ts`

**Interfaces:**
- Produces：`calculatePrice` input 新增選填 `partnerDiscountPercent?: number`；`PriceBreakdown` 新增 `partnerDiscountPercent: number`、`partnerDiscount: number`。

- [ ] **Step 1: 寫失敗測試（協議折扣疊加）**

在 `calculate-price.spec.ts` 追加（沿用檔內既有 `plan`/`cal` fixtures：weekday 400、tiers 3天5%）：
```ts
it('協議折扣施於 rentalSubtotal，優惠券再施於協議折扣後', () => {
  // 3 平日 400*3=1200；tier5% → 1140；協議 10% → partnerDiscount 114、afterPartner 1026
  const coupon: Coupon = { id: 'k', code: 'C', type: 'percent', value: 10, validFrom: '2026-01-01', validTo: '2026-12-31' };
  const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08',
    addOns: [], coupon, partnerDiscountPercent: 10 });
  expect(r.rentalSubtotal).toBe(1140);
  expect(r.partnerDiscountPercent).toBe(10);
  expect(r.partnerDiscount).toBe(114);
  // 優惠券施於 afterPartner 1026 → 10% = 103（四捨五入）；total = 1026-103 = 923
  expect(r.couponDiscount).toBe(103);
  expect(r.total).toBe(923);
});
it('未帶 partnerDiscountPercent → partnerDiscount 0、結果與模組一一致', () => {
  const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08', addOns: [] });
  expect(r.partnerDiscount).toBe(0);
  expect(r.partnerDiscountPercent).toBe(0);
  expect(r.rentalSubtotal).toBe(1140);
  expect(r.total).toBe(1140);
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test domain`
Expected: FAIL（partnerDiscount 欄位不存在 / 未套用）。

- [ ] **Step 3: 改 PriceBreakdown 與 calculatePrice**

`price-breakdown.ts` 的 `PriceBreakdown` 在 `rentalSubtotal` 後加兩欄：
```ts
  rentalSubtotal: number;
  partnerDiscountPercent: number;
  partnerDiscount: number;
```
`calculate-price.ts`：input 型別加 `partnerDiscountPercent?: number;`；在 `rentalSubtotal` 之後、優惠券之前插入：
```ts
  const partnerDiscountPercent = input.partnerDiscountPercent ?? 0;
  const partnerDiscount = Math.round((rentalSubtotal * partnerDiscountPercent) / 100);
  const afterPartner = rentalSubtotal - partnerDiscount;
```
把後續優惠券計算的基數由 `rentalSubtotal` 改為 `afterPartner`：
```ts
  if (coupon && isCouponValid(coupon, { startDate, days, category: plan.appliesToCategory })) {
    couponDiscount = coupon.type === 'percent'
      ? Math.round((afterPartner * coupon.value) / 100)
      : Math.min(coupon.value, afterPartner);
    couponCode = coupon.code;
  }
  const total = afterPartner - couponDiscount + addOnSubtotal;
```
回傳物件加入 `partnerDiscountPercent, partnerDiscount`。

- [ ] **Step 4: 跑測試確認全過**

Run: `npx nx test domain`
Expected: 新兩條 + 既有 calculate-price 測試全過（既有測試只驗特定欄位，不受新欄位影響）。

- [ ] **Step 5: commit**

```bash
git add libs/domain
git commit -m "feat(domain): calculatePrice 加協議折扣（partnerDiscountPercent），優惠券施於協議折扣後"
```

---

### Task 3: domain — calculateCommission 純函式

**Files:**
- Create: `libs/domain/src/lib/commission/{calculate-commission.ts,index.ts}`
- Modify: `libs/domain/src/index.ts`
- Test: `libs/domain/src/lib/commission/calculate-commission.spec.ts`

**Interfaces:**
- Produces：`calculateCommission(input: { rule: CommissionRule; rentalSubtotal: number; days: number }): number`

- [ ] **Step 1: 寫失敗測試**

```ts
import { describe, it, expect } from 'vitest';
import { calculateCommission } from './calculate-commission';
import { CommissionRule } from '../models';

describe('calculateCommission', () => {
  it('percent：抽 10% of rentalSubtotal', () => {
    const rule: CommissionRule = { type: 'percent', value: 10 };
    expect(calculateCommission({ rule, rentalSubtotal: 1140, days: 3 })).toBe(114);
  });
  it('per_vehicle_day：每天固定額 × 天數', () => {
    const rule: CommissionRule = { type: 'per_vehicle_day', value: 100 };
    expect(calculateCommission({ rule, rentalSubtotal: 1140, days: 3 })).toBe(300);
  });
  it('days 0 且 per_vehicle_day → 0', () => {
    expect(calculateCommission({ rule: { type: 'per_vehicle_day', value: 100 }, rentalSubtotal: 0, days: 0 })).toBe(0);
  });
  it('rentalSubtotal 0 且 percent → 0', () => {
    expect(calculateCommission({ rule: { type: 'percent', value: 10 }, rentalSubtotal: 0, days: 3 })).toBe(0);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test domain`　Expected: FAIL（未定義）。

- [ ] **Step 3: 實作**

`calculate-commission.ts`：
```ts
import { CommissionRule } from '../models';
export function calculateCommission(input: {
  rule: CommissionRule; rentalSubtotal: number; days: number;
}): number {
  return input.rule.type === 'percent'
    ? Math.round((input.rentalSubtotal * input.rule.value) / 100)
    : input.rule.value * input.days;
}
```
`commission/index.ts`：`export * from './calculate-commission';`
`libs/domain/src/index.ts` 追加：`export * from './lib/commission';`

- [ ] **Step 4: 跑測試確認全過 + build**

Run: `npx nx test domain && npx nx build domain`　Expected: 全綠、build 過。

- [ ] **Step 5: commit**

```bash
git add libs/domain
git commit -m "feat(domain): calculateCommission 純函式（percent / per_vehicle_day）"
```

---

### Task 4: 建立 libs/booking-flow 空 lib 與別名

**Files:**
- Create: `libs/booking-flow/**`（Nx generator）
- Modify: `tsconfig.base.json`
- Modify: `libs/booking-flow/src/index.ts`

- [ ] **Step 1: 產生 buildable lib（比照 domain/theme-pack）**

Run:
```bash
npx nx g @nx/angular:library booking-flow \
  --name=booking-flow --directory=libs/booking-flow \
  --buildable=true --unitTestRunner=vitest-angular \
  --importPath=@car-rental/booking-flow --prefix=lib --standalone --no-interactive
```

- [ ] **Step 2: 確認別名、清空範例**

`grep -A4 '"paths"' tsconfig.base.json` 應含 `@car-rental/booking-flow`；把 `libs/booking-flow/src/index.ts` 清成 `export {};`，刪除 generator 範例元件與其 spec。

- [ ] **Step 3: build/test 骨架**

Run: `npx nx build booking-flow && npx nx test booking-flow`
Expected: build 過；若空 lib 無 spec 導致 test 報錯，加一支暫時 placeholder spec（`libs/booking-flow/src/lib/scaffold.spec.ts`，`it('scaffold', () => expect(true).toBe(true))`，Task 5 移入真檔後刪除）。

- [ ] **Step 4: commit**

```bash
git add libs/booking-flow tsconfig.base.json
git commit -m "feat(booking-flow): 建立 libs/booking-flow buildable lib 與別名"
```

---

### Task 5: 把五步流程與 CatalogStore 搬進 libs/booking-flow（booking 8 測試維持綠）

**Files:**
- Move → `libs/booking-flow/src/lib/`：`apps/booking/src/app/features/booking-flow/`（`booking-flow.component.{ts,html,scss}` 與 `steps/*`）、`apps/booking/src/app/stores/catalog.store.ts` 與 `catalog.store.spec.ts`
- Modify: `libs/booking-flow/src/index.ts`（barrel export）
- Modify: `apps/booking/src/app/app.routes.ts`（改 import 自 `@car-rental/booking-flow`）
- Delete: `apps/booking` 內已搬走的檔、Task 4 的 placeholder spec

**Interfaces:**
- Produces：`@car-rental/booking-flow` 匯出 `BookingFlowComponent`、`DoneComponent`、`CatalogStore`。
- 不變式：這是行為不變的搬遷，`apps/booking` 既有測試（8）維持綠，CatalogStore 測試移入 lib 計入 booking-flow。

- [ ] **Step 1: 搬檔**

把上列檔案原樣移到 `libs/booking-flow/src/lib/`（保持 `booking-flow.component.*` 與 `steps/` 子目錄結構；`catalog.store.ts`/`.spec.ts` 放 `libs/booking-flow/src/lib/`）。刪除 Task 4 placeholder spec。

- [ ] **Step 2: 修 import 路徑**

- `booking-flow.component.ts`：`import { CatalogStore } from '../../stores/catalog.store'` → `'./catalog.store'`；`./steps/...` 相對路徑不變。
- `catalog.store.spec.ts`：對 CatalogStore 的相對 import 改為 `./catalog.store`；對 domain 的 import 維持 `@car-rental/domain`。
- 其餘元件對 `@car-rental/domain` 的 import 不變。

- [ ] **Step 3: barrel**

`libs/booking-flow/src/index.ts`：
```ts
export * from './lib/booking-flow.component';
export * from './lib/steps/done.component';
export * from './lib/catalog.store';
```

- [ ] **Step 4: apps/booking 改用 lib**

`apps/booking/src/app/app.routes.ts`：
```ts
import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'book', pathMatch: 'full' },
  { path: 'book', loadComponent: () => import('@car-rental/booking-flow').then((m) => m.BookingFlowComponent) },
  { path: 'book/done/:id', loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent) },
];
```
刪除 `apps/booking/src/app/features/booking-flow/` 與 `apps/booking/src/app/stores/`（已搬走）。app.config 不動（六個 repo provider 留著）。

- [ ] **Step 5: 驗證守恆**

Run: `npx nx test booking-flow && npx nx test booking && npx nx build booking && npx nx build booking-flow`
Expected: booking-flow 承接原 CatalogStore 8 測試全綠；booking build 過；`nx test booking` 若已無自有 spec 則 0 或僅 app spec，總測試數不減（CatalogStore 測試移到 booking-flow）。

- [ ] **Step 6: commit**

```bash
git add libs/booking-flow apps/booking tsconfig.base.json
git commit -m "refactor(booking-flow): 五步流程與 CatalogStore 搬進 libs/booking-flow，apps/booking 改用之"
```

---

### Task 6: booking-flow 加 partner 模式

**Files:**
- Create: `libs/booking-flow/src/lib/flow-mode.ts`
- Modify: `libs/booking-flow/src/lib/catalog.store.ts`（price/submitBooking 加 partner 參數）
- Modify: `libs/booking-flow/src/lib/booking-flow.component.{ts,html}`（mode input、套協議折扣、頁首民宿名）
- Modify: `libs/booking-flow/src/index.ts`
- Test: `libs/booking-flow/src/lib/catalog.store.spec.ts`

**Interfaces:**
- Produces：`FlowMode`；`CatalogStore.price` 與 `submitBooking` 各加選填 `partnerDiscountPercent?`（price）、`sourcePartnerId?` + `partnerDiscountPercent?`（submitBooking）；`BookingFlowComponent` 有 `mode = input<FlowMode>({ kind: 'consumer' })`。

- [ ] **Step 1: FlowMode 型別**

`flow-mode.ts`：
```ts
import { Partner } from '@car-rental/domain';
export type FlowMode = { kind: 'consumer' } | { kind: 'partner'; partner: Partner };
```
barrel 追加 `export * from './lib/flow-mode';`。

- [ ] **Step 2: 寫失敗測試（partner 送出帶 sourcePartnerId 與協議折扣）**

在 `catalog.store.spec.ts` 追加（沿用檔內既有 in-memory 供資 helper；需有一個 scooter plan 與一台 available scooter）：
```ts
it('partner 模式 submitBooking 寫入 sourcePartnerId 且套協議折扣', () => {
  const b = store.submitBooking({
    vehicleId: 'v1', startTime: '2026-01-05T09:00:00', endTime: '2026-01-08T09:00:00',
    pickupLocation: '馬公', returnLocation: '馬公',
    customer: { name: '房客', phone: '0900', email: 'g@g.com' },
    category: 'scooter', startDate: '2026-01-05', endDate: '2026-01-08',
    addOns: [], paymentMethod: 'on_site',
    sourcePartnerId: 'pt1', partnerDiscountPercent: 10,
  });
  expect(b.sourcePartnerId).toBe('pt1');
  expect(b.priceBreakdown?.partnerDiscount).toBeGreaterThan(0);
});
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npx nx test booking-flow`　Expected: FAIL（參數/欄位未支援）。

- [ ] **Step 4: 擴充 CatalogStore**

`price` input 加 `partnerDiscountPercent?: number;`，並傳入 calculatePrice：
```ts
  price(input: { category: VehicleCategory; startDate: string; endDate: string;
    addOns: { addOn: AddOn; qty: number }[]; coupon?: Coupon; partnerDiscountPercent?: number;
  }): PriceBreakdown {
    const plan = this.planForCategory(input.category);
    if (!plan) throw new Error('無此車型定價');
    return calculatePrice({ plan, calendar: this.calRepo.getAll()[0], ...input });
  }
```
`submitBooking` input 加 `sourcePartnerId?: string; partnerDiscountPercent?: number;`；`this.price({...})` 呼叫帶入 `partnerDiscountPercent: input.partnerDiscountPercent`；建立 booking 物件加 `sourcePartnerId: input.sourcePartnerId`。

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test booking-flow`　Expected: PASS。

- [ ] **Step 6: BookingFlowComponent 接 mode**

`booking-flow.component.ts`：加 `import { input } from '@angular/core';` 與 `import { FlowMode } from './flow-mode';`
```ts
  readonly mode = input<FlowMode>({ kind: 'consumer' });
  readonly partnerDiscountPercent = computed(() =>
    this.mode().kind === 'partner' ? (this.mode() as { partner: { discountPercent: number } }).partner.discountPercent : undefined);
  readonly partnerName = computed(() =>
    this.mode().kind === 'partner' ? (this.mode() as { partner: { name: string } }).partner.name : null);
```
把 price 預覽與 submit 呼叫帶上 `partnerDiscountPercent: this.partnerDiscountPercent()`，submit 另帶 `sourcePartnerId`（partner 模式時取 `mode().partner.id`）。`booking-flow.component.html`：頂部 `@if (partnerName()) { <p>代訂民宿：{{ partnerName() }}</p> }`。優惠券步驟維持顯示（協議折扣與優惠券並用）。

**完成導向依 mode 決定（避免寫死 book/done）**：把送出成功後的 `router.navigate(...)` 改為依模式組路徑，consumer → `['/book/done', id]`；partner → `['/p', mode().partner.slug, 'done', id]`：
```ts
  private navigateDone(id: string): void {
    const m = this.mode();
    if (m.kind === 'partner') this.router.navigate(['/p', m.partner.slug, 'done', id]);
    else this.router.navigate(['/book/done', id]);
  }
```
這樣兩個 app 都用 `loadComponent` 直接掛 BookingFlowComponent 即可，無需父層綁事件。

- [ ] **Step 7: 全驗證 + commit**

Run: `npx nx test booking-flow && npx nx test booking && npx nx build booking-flow && npx nx build booking`
Expected: 全綠、build 過（consumer 預設模式，booking 行為不變）。
```bash
git add libs/booking-flow
git commit -m "feat(booking-flow): 加 partner 模式（協議折扣、sourcePartnerId、頁首民宿名）"
```

---

### Task 7: apps/affiliate 代訂頁（/p/:slug，partner 模式）

**Files:**
- Create: `apps/affiliate/**`（Nx generator application）
- Modify: `apps/affiliate/src/app/app.config.ts`（8 個共用 repo，含 PARTNER_REPO）
- Create: `apps/affiliate/src/app/features/partner-booking/partner-booking.component.ts`
- Modify: `apps/affiliate/src/app/app.routes.ts`

**Interfaces:**
- Consumes：`@car-rental/booking-flow`（BookingFlowComponent、DoneComponent）、`@car-rental/domain`（PARTNER_REPO、Partner）。
- Produces：`/p/:slug` 代訂、`/p/:slug/done/:id` 完成頁。

- [ ] **Step 1: 產生 app**

Run:
```bash
npx nx g @nx/angular:application affiliate \
  --name=affiliate --directory=apps/affiliate \
  --unitTestRunner=vitest-angular --routing=true --prefix=app --standalone --no-interactive
```
在 `apps/affiliate/project.json` 的 build options 加 `"stylePreprocessorOptions": { "includePaths": ["libs"] }`（比照 admin）。不套 theme-pack。

- [ ] **Step 2: app.config 接 8 個共用 repo**

`app.config.ts` 比照 booking 的 app.config（同 key、同 seed），另加：
```ts
{ provide: PARTNER_REPO, useFactory: () => new LocalStorageRepository('cr.partners', seedPartners) },
```
（import 自 `@car-rental/domain`；booking-flow 的 CatalogStore 需要的六個 repo 全部提供。）

- [ ] **Step 3: PartnerBookingComponent 包裝**

`partner-booking.component.ts`（standalone，讀 :slug、查 Partner、以 partner 模式渲染流程）：
```ts
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PARTNER_REPO } from '@car-rental/domain';
import { BookingFlowComponent, FlowMode } from '@car-rental/booking-flow';

@Component({
  selector: 'app-partner-booking',
  imports: [BookingFlowComponent],
  template: `
    @if (mode(); as m) { <app-booking-flow [mode]="m" /> }
    @else { <p>連結無效或民宿不存在。</p> }
  `,
})
export class PartnerBookingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly partnerRepo = inject(PARTNER_REPO);
  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), { initialValue: '' });
  readonly mode = computed<FlowMode | null>(() => {
    const partner = this.partnerRepo.getAll().find((p) => p.slug === this.slug());
    return partner ? { kind: 'partner', partner } : null;
  });
}
```

- [ ] **Step 4: 路由**

`app.routes.ts`：
```ts
import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: 'p/:slug', loadComponent: () => import('./features/partner-booking/partner-booking.component').then((m) => m.PartnerBookingComponent) },
  { path: 'p/:slug/done/:id', loadComponent: () => import('@car-rental/booking-flow').then((m) => m.DoneComponent) },
];
```
注意：Task 6 已把 BookingFlowComponent 的完成導向改為依 mode 組路徑（partner → `/p/:slug/done/:id`），因此這裡 affiliate 只要提供對應的 `p/:slug/done/:id` 路由指向 DoneComponent 即可，無需額外處理。

- [ ] **Step 5: 驗證 + commit**

Run: `npx nx build affiliate && npx nx serve affiliate`（curl `/p/seaview` 應 200 且顯示代訂流程；log 導檔，port 自選，做完關掉）
```bash
git add apps/affiliate tsconfig.base.json libs/booking-flow
git commit -m "feat(affiliate): 民宿代訂頁 /p/:slug（partner 模式消費 booking-flow）"
```

---

### Task 8: apps/affiliate 民宿對帳頁（/p/:slug/account）

**Files:**
- Create: `apps/affiliate/src/app/features/partner-account/partner-account.component.ts`
- Create: `apps/affiliate/src/app/stores/account.store.ts` + `.spec.ts`
- Modify: `apps/affiliate/src/app/app.routes.ts`

**Interfaces:**
- Produces：`AccountStore`（`ordersFor(partnerId)`、`commissionFor(booking, partner)`、`totalCommission(partnerId)`、`payoutStatus(partnerId, month)`）。

- [ ] **Step 1: 寫 AccountStore 失敗測試**

`account.store.spec.ts`（TestBed + createInMemoryRepo 灌 partner + 兩筆帶 sourcePartnerId 的 booking + payout）：
```ts
it('ordersFor 只回該民宿來源訂單', () => {
  expect(store.ordersFor('pt1').every((b) => b.sourcePartnerId === 'pt1')).toBe(true);
});
it('totalCommission 加總該民宿所有來源訂單退佣', () => {
  expect(store.totalCommission('pt1')).toBeGreaterThan(0);
});
```

- [ ] **Step 2: 跑失敗**

Run: `npx nx test affiliate`　Expected: FAIL。

- [ ] **Step 3: 實作 AccountStore**

注入 `BOOKING_REPO`、`PARTNER_REPO`、`PAYOUT_REPO`；用 `calculateCommission` 算每筆退佣（days 由 `priceBreakdown.dailyLines.length` 取、rentalSubtotal 由 `priceBreakdown.rentalSubtotal` 取；找不到 breakdown 的舊單以 0 計）。方法：
```ts
ordersFor(partnerId: string): RentalBooking[] {
  return this.bookingRepo.getAll().filter((b) => b.sourcePartnerId === partnerId);
}
commissionFor(b: RentalBooking, partner: Partner): number {
  const pb = b.priceBreakdown;
  if (!pb) return 0;
  return calculateCommission({ rule: partner.commission, rentalSubtotal: pb.rentalSubtotal, days: pb.dailyLines.length });
}
totalCommission(partnerId: string): number {
  const partner = this.partnerRepo.getAll().find((p) => p.id === partnerId);
  if (!partner) return 0;
  return this.ordersFor(partnerId).reduce((s, b) => s + this.commissionFor(b, partner), 0);
}
payoutStatus(partnerId: string, month: string): PayoutStatus | undefined {
  return this.payoutRepo.getAll().find((p) => p.partnerId === partnerId && p.month === month)?.status;
}
```

- [ ] **Step 4: 跑通過**

Run: `npx nx test affiliate`　Expected: PASS。

- [ ] **Step 5: 對帳頁元件 + 路由**

`partner-account.component.ts`（讀 :slug 找 partner，用 AccountStore 列訂單/退佣/累計/撥款狀態）；`app.routes.ts` 加 `{ path: 'p/:slug/account', loadComponent: ... }`。

- [ ] **Step 6: 驗證 + commit**

Run: `npx nx test affiliate && npx nx build affiliate`
```bash
git add apps/affiliate
git commit -m "feat(affiliate): 民宿對帳頁 /p/:slug/account（退佣累計與撥款進度）"
```

---

### Task 9: admin 民宿管理頁（/partners）

**Files:**
- Create: `apps/admin/src/app/stores/partner/partner.store.ts` + `.spec.ts`
- Create: `apps/admin/src/app/features/partners/pages/partners-page.component.ts`
- Create: `apps/admin/src/app/features/partners/dialogs/partner-dialog.component.ts`
- Modify: `apps/admin/src/app/app.config.ts`、`app.routes.ts`、導覽、`zh-tw.ts`

**Interfaces:**
- Produces：`PartnerStore`（`partners`、`create/update/remove`、`slug 唯一性檢查`、`bookingLink(slug)`）。

- [ ] **Step 1: 寫 PartnerStore 失敗測試**

`partner.store.spec.ts`（TestBed + createInMemoryRepo）：
```ts
it('新增民宿', () => { store.create({ name: 'X', slug: 'x', discountPercent: 5, commission: { type: 'percent', value: 10 } }); expect(store.partners()).toHaveLength(2); });
it('slug 重複應丟錯', () => {
  expect(() => store.create({ name: 'Y', slug: 'seaview', discountPercent: 0, commission: { type: 'percent', value: 0 } })).toThrow();
});
```
（seed 一筆 slug='seaview'。）

- [ ] **Step 2: 跑失敗**

Run: `npx nx test admin`　Expected: FAIL。

- [ ] **Step 3: 實作 PartnerStore**

比照 CouponStore（Signal + inject `PARTNER_REPO`）；`create`/`update` 前檢查 slug 唯一（`assertSlugUnique`，重複丟 `ZH_TW.partner.slugDuplicate`）；`bookingLink(slug)` 回 `/p/${slug}` 字串（供複製）。

- [ ] **Step 4: 跑通過**

Run: `npx nx test admin`　Expected: PASS。

- [ ] **Step 5: 頁面 + dialog + 接線**

`partners-page.component.ts`（Material table：名稱/slug/協議折扣/退佣規則摘要 + 「複製代訂連結」動作 = 複製 `bookingLink`）；`partner-dialog.component.ts`（form：name/slug/discountPercent/commission.type/commission.value）。`app.config.ts` 加 `PARTNER_REPO`（key `cr.partners`, `seedPartners`）與 `PAYOUT_REPO`（key `cr.payouts`, `seedPayouts`，Task 10 用）；路由 `/partners`、導覽、i18n。

- [ ] **Step 6: 驗證 + commit**

Run: `npx nx test admin && npx nx build admin`
```bash
git add apps/admin
git commit -m "feat(admin): 民宿管理頁（PartnerStore CRUD + 複製代訂連結）"
```

---

### Task 10: admin 退佣帳單報表（/commission）+ CSV

**Files:**
- Create: `apps/admin/src/app/stores/commission/commission.store.ts` + `.spec.ts`
- Create: `apps/admin/src/app/features/commission/pages/commission-page.component.ts`
- Modify: `apps/admin/src/app/app.routes.ts`、導覽、`zh-tw.ts`

**Interfaces:**
- Consumes：`BOOKING_REPO`、`PARTNER_REPO`、`PAYOUT_REPO`、`calculateCommission`。
- Produces：`CommissionStore`（`report(partnerId, month)`、`toCsv(rows)`、`markPaid(partnerId, month)`、`payoutStatus`）。

- [ ] **Step 1: 寫 CommissionStore 失敗測試**

```ts
it('report 只納入該民宿該月的來源訂單並算退佣', () => {
  const rows = store.report('pt1', '2026-07');
  expect(rows.every((r) => r.commission >= 0)).toBe(true);
});
it('toCsv 產出含 BOM 與表頭的字串', () => {
  const csv = store.toCsv([{ bookingId: 'b1', vehicleModel: 'G', period: '07/05-07/08', rentalSubtotal: 1140, commission: 114 }]);
  expect(csv.startsWith('﻿')).toBe(true);
  expect(csv).toContain('退佣');
});
it('markPaid 後 payoutStatus 為 paid', () => {
  store.markPaid('pt1', '2026-07');
  expect(store.payoutStatus('pt1', '2026-07')).toBe('paid');
});
```

- [ ] **Step 2: 跑失敗**

Run: `npx nx test admin`　Expected: FAIL。

- [ ] **Step 3: 實作 CommissionStore**

- `report(partnerId, month)`：取該 partner，過濾 `sourcePartnerId===partnerId` 且 `startTime` 之 `YYYY-MM===month` 的訂單，每筆用 `calculateCommission({ rule: partner.commission, rentalSubtotal: pb.rentalSubtotal, days: pb.dailyLines.length })`，回 `{ bookingId, vehicleModel, period, rentalSubtotal, commission }[]`（vehicleModel 由 VEHICLE_REPO 查、period 由 startTime/endTime 格式化）。
- `toCsv(rows)`：`'﻿' + 表頭 + 各列`，欄位＝訂單編號/車款/租期/租金小計/退佣，逗號分隔、值含逗號用引號包。
- `markPaid(partnerId, month)`：upsert `PAYOUT_REPO`（有則 update status='paid'，無則 create）。
- `payoutStatus(partnerId, month)`：查 PAYOUT_REPO。

- [ ] **Step 4: 跑通過**

Run: `npx nx test admin`　Expected: PASS。

- [ ] **Step 5: 報表頁 + CSV 下載 + 接線**

`commission-page.component.ts`（選民宿下拉 + 月份輸入 → 呼 `report` 顯示表格與合計；「匯出 CSV」用 `toCsv` + Blob 下載：`new Blob([csv], { type: 'text/csv;charset=utf-8' })` → a[download]；「標記已撥款」呼 `markPaid`）。路由 `/commission`、導覽、i18n。

- [ ] **Step 6: 驗證 + commit**

Run: `npx nx test admin && npx nx build admin`
```bash
git add apps/admin
git commit -m "feat(admin): 退佣帳單報表頁 + CSV 匯出 + 撥款標記"
```

---

### Task 11: 整合驗收

**Files:** 無（純驗證）

- [ ] **Step 1: 全 build**

Run: `npx nx run-many -t build -p domain booking-flow admin booking affiliate pos`
Expected: 皆 exit 0。

- [ ] **Step 2: 全測試**

Run: `npx nx run-many -t test -p domain booking-flow admin theme-pack booking affiliate`
Expected: 全綠；domain 含新 calculatePrice/calculateCommission 測試、booking-flow 含移入的 CatalogStore + partner 測試、admin 含 Partner/Commission store 測試、affiliate 含 AccountStore 測試。測試總數不少於原 98 + 新增。

- [ ] **Step 3: lint:theme**

Run: `npm run lint:theme`
Expected: 通過（booking/affiliate 未套主題、domain/booking-flow 無寫死色）。

- [ ] **Step 4: 端到端手動走查（per-origin）**

`npx nx serve admin` 設一家民宿（協議折扣+退佣規則）、複製代訂連結；`npx nx serve affiliate` 開 `/p/:slug` 走完代訂送出（明細應含協議折扣行），`/p/:slug/account` 看退佣累計；`/commission`（admin）選該民宿+月份出報表、匯 CSV、標記已撥款。注意跨 app localStorage per-origin 限制（demo 靠共同 seed）。

- [ ] **Step 5: 完成**

進入 superpowers:finishing-a-development-branch 收尾。

---

## Self-Review

**Spec coverage：** §2 抽 lib → Task 4/5；§2.1 mode → Task 6；§3.1 Partner → Task 1；§3.2 sourcePartnerId → Task 1；§3.3 calculatePrice 協議折扣 → Task 2；§3.4 calculateCommission → Task 3；§4.1 代訂頁 → Task 7；§4.2 對帳頁 → Task 8；§5.1 民宿管理 → Task 9；§5.2 退佣報表+CSV+撥款 → Task 10；§7 測試 → 各 Task + Task 11；§8 限制 → Task 11 Step 4 註記；§9 驗收 → Task 11。

**Placeholder scan：** 無 TBD/TODO。完成頁導向的跨 app 問題已在 Task 6 Step 6 以「依 mode 組路徑」解決（consumer→`/book/done/:id`、partner→`/p/:slug/done/:id`），與 `loadComponent` 直掛路由相容，無需父層綁事件。

**Type consistency：** `Partner`/`CommissionRule`/`MonthlyPayout`（Task 1）貫穿 Task 3/6/8/9/10；`calculateCommission` 簽章（Task 3）與 Task 8/10 呼叫一致；`calculatePrice` 加 `partnerDiscountPercent`（Task 2）與 Task 6 CatalogStore 傳參一致；`FlowMode`（Task 6）與 Task 7 wrapper 一致；完成導向依 mode（Task 6）與 Task 7 的 `p/:slug/done/:id` 路由一致。
