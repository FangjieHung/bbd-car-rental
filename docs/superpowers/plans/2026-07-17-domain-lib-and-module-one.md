# libs/domain + B2B 模組一（基礎租車引擎）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立共用資料地基 `libs/domain`，並在其上實作模組一的「定價 + 配件 + 優惠券 + booking 前台預約到明細確認頁」垂直切片，全程純前端 mock。

**Architecture:** 共用 domain model / `Repository<T>` 介面 / localStorage 實作集中到新 buildable Angular lib `libs/domain`（別名 `@car-rental/domain`）。定價與時間重疊檢查是無副作用純函式，重測。admin 疊三個 CRUD 設定頁與訂單人工確認；booking 前台經同一組 localStorage key 讀 admin 設定的資料，走五步驟到明細確認頁。元件只經 Signal store，store 只依賴 `Repository<T>`。

**Tech Stack:** Angular 22 standalone、Nx 23.1、vitest（`@nx/angular:unit-test`）、Angular Material 22、localStorage mock。

## Global Constraints

- 純前端 mock：不接真金流、不接外部 API；明細確認頁付款方式僅 UI 選項。
- 架構鐵律：元件只經 Signal store；store 只依賴 `Repository<T>` 介面；車輛狀態只經 `VehicleStore.transition()`；apps 之間不互相 import，跨 app 資料共享經 `Repository<T>` mock 實作（共用 localStorage key）。
- 繁中單語系；金額一律整數 TWD，折扣用 `Math.round`。
- 測試守恆：搬遷不得減少既有測試（admin 46 + theme-pack 7 = 53）；新功能各自附測試。
- 共用 model 放 `libs/domain`；`MaintenanceRecord`/`MaintenanceAlert`/`MaintenanceType` 留在 admin。
- BookingStatus：`pending_payment | confirmed | in_progress | completed | cancelled`；前台送出寫 `pending_payment`。
- PaymentMethod：`credit_card | line_pay | on_site | bank_transfer`。
- VehicleCategory：`car | scooter | ev`（取代舊 `type: scooter|car`）。
- 定價疊加順序：日期定價 → 天數累折(折%) → 優惠券（施於租金小計）→ 加配件。租期為半開區間 `[start, end)`。
- localStorage keys：既有 `cr.vehicles / cr.customers / cr.bookings / cr.maintenance`；新增 `cr.pricingPlans / cr.seasonCalendar / cr.addOns / cr.coupons`。

---

### Task 1: 建立 libs/domain 空 lib 與別名

**Files:**
- Create: `libs/domain/**`（由 Nx generator 產生）
- Modify: `tsconfig.base.json`（paths 加 `@car-rental/domain`）
- Modify: `libs/domain/src/index.ts`（清空成空 barrel）

**Interfaces:**
- Produces: 別名 `@car-rental/domain` 指向 `libs/domain/src/index.ts`；`nx build domain` 可過。

- [ ] **Step 1: 用 generator 建 buildable Angular lib（比照 theme-pack）**

Run:
```bash
npx nx g @nx/angular:library domain \
  --directory=libs/domain \
  --buildable=true \
  --unitTestRunner=vitest-angular \
  --importPath=@car-rental/domain \
  --prefix=lib \
  --standalone \
  --no-interactive
```
Expected: 產生 `libs/domain/`（含 project.json、ng-package.json、tsconfig.lib*.json、src/index.ts），並自動在 `tsconfig.base.json` paths 加入 `@car-rental/domain`。

- [ ] **Step 2: 確認別名寫入**

Run: `grep -A3 '"paths"' tsconfig.base.json`
Expected: 同時看到 `@car-rental/theme-pack` 與 `@car-rental/domain`。若 generator 未自動加，手動加入：
```json
"@car-rental/domain": ["./libs/domain/src/index.ts"]
```

- [ ] **Step 3: 清空 generator 範例，barrel 留空**

把 `libs/domain/src/index.ts` 內容改為：
```ts
// libs/domain barrel — 逐 Task 補上 export
export {};
```
刪除 generator 產生的範例元件/檔案（`libs/domain/src/lib/*.ts` 範例）。

- [ ] **Step 4: 驗證 build 與 test 骨架**

Run: `npx nx build domain && npx nx test domain`
Expected: build 過；test 無測試或 0 失敗（空 lib）。

- [ ] **Step 5: Commit**

```bash
git add libs/domain tsconfig.base.json
git commit -m "feat(domain): 建立 libs/domain buildable lib 與 @car-rental/domain 別名"
```

---

### Task 2: 搬遷共用 model 與 Repository 到 libs/domain（admin 53 測試維持綠）

**Files:**
- Create: `libs/domain/src/lib/models/{enums.ts,vehicle.ts,customer.ts,rental-booking.ts,index.ts}`
- Create: `libs/domain/src/lib/repositories/{repository.ts,local-storage-repository.ts,testing.ts,tokens.ts,seed-data.ts,index.ts}`
- Modify: `libs/domain/src/index.ts`（export models + repositories）
- Modify: `apps/admin/src/app/core/models/index.ts`（只剩 maintenance 相關 + re-export domain）
- Modify: `apps/admin/src/app/core/repositories/*`（maintenance 專屬留下，其餘改用 domain）
- Modify: 全 admin 對 `../core/models`、`../core/repositories/*` 的 import
- Test: 沿用既有全部 admin 測試

**Interfaces:**
- Produces（自 `@car-rental/domain`）：
  - `Repository<T extends {id:string}>`、`LocalStorageRepository<T>`、`createInMemoryRepo<T>(initial?)`
  - Models：`Vehicle`（本 Task 尚未擴充，維持現欄位）、`Customer`、`RentalBooking`、`VehicleStatus`、`BookingStatus`
  - Tokens：`VEHICLE_REPO`、`CUSTOMER_REPO`、`BOOKING_REPO`
  - Seeds：`seedVehicles`、`seedCustomers`、`seedBookings`
- 註：`MAINTENANCE_REPO`、`seedMaintenanceRecords`、`MaintenanceRecord/Alert/Type` 仍留 admin，不進 domain。

- [ ] **Step 1: 建立 domain enums 與 models（沿用現值，BookingStatus 先含 pending_payment）**

`libs/domain/src/lib/models/enums.ts`：
```ts
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';
export type BookingStatus =
  | 'pending_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
```
`libs/domain/src/lib/models/vehicle.ts`（本 Task 維持現欄位，含舊 `type`；Task 3 再擴充）：
```ts
import { VehicleStatus } from './enums';
export type VehicleType = 'scooter' | 'car';
export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string;
  status: VehicleStatus;
  mileage: number;
  createdAt: string;
}
```
`libs/domain/src/lib/models/customer.ts`：
```ts
export interface Customer {
  id: string;
  name: string;
  phone: string;
  idNumber?: string;
  note?: string;
}
```
`libs/domain/src/lib/models/rental-booking.ts`：
```ts
import { BookingStatus } from './enums';
export interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;
}
```
`libs/domain/src/lib/models/index.ts`：
```ts
export * from './enums';
export * from './vehicle';
export * from './customer';
export * from './rental-booking';
```

- [ ] **Step 2: 搬 Repository 基礎設施到 domain**

把 admin 的 `repository.ts`、`local-storage-repository.ts`、`testing.ts` 內容原樣複製到 `libs/domain/src/lib/repositories/` 同名檔（import 路徑改為相對 domain）。
`libs/domain/src/lib/repositories/tokens.ts`（只含共用三個，import 自 domain models）：
```ts
import { InjectionToken } from '@angular/core';
import { Vehicle, Customer, RentalBooking } from '../models';
import { Repository } from './repository';
export const VEHICLE_REPO = new InjectionToken<Repository<Vehicle>>('VEHICLE_REPO');
export const CUSTOMER_REPO = new InjectionToken<Repository<Customer>>('CUSTOMER_REPO');
export const BOOKING_REPO = new InjectionToken<Repository<RentalBooking>>('BOOKING_REPO');
```
`libs/domain/src/lib/repositories/seed-data.ts`：把 `seedVehicles/seedCustomers/seedBookings` 三個函式（連同它們用到的 `isoAt`）搬入。`isoAt` 依賴 admin 的 `date-utils`——複製 `isoAt/startOfDay/addDays` 到 `libs/domain/src/lib/date-utils.ts` 並改 import。**不要**搬 `seedMaintenanceRecords`。
`libs/domain/src/lib/repositories/index.ts`：
```ts
export * from './repository';
export * from './local-storage-repository';
export * from './testing';
export * from './tokens';
export * from './seed-data';
```

- [ ] **Step 3: domain barrel 匯出**

`libs/domain/src/index.ts`：
```ts
export * from './lib/models';
export * from './lib/repositories';
export * from './lib/date-utils';
```

- [ ] **Step 4: admin 端改為消費 domain**

- `apps/admin/src/app/core/models/index.ts` 改成只留 maintenance + re-export domain：
```ts
export * from '@car-rental/domain';

export type MaintenanceType = 'oil_change' | 'tire' | 'brake' | 'inspection' | 'other';
export interface MaintenanceRecord {
  id: string; vehicleId: string; type: MaintenanceType;
  performedAt: string; mileageAtService: number;
  nextDueMileage?: number; nextDueDate?: string; cost: number; notes: string;
}
export interface MaintenanceAlert {
  vehicleId: string; ruleType: 'mileage' | 'date';
  threshold: number | string; status: 'upcoming' | 'overdue';
}
```
- admin `core/repositories/tokens.ts` 改為只留 maintenance token，其餘 re-export：
```ts
import { InjectionToken } from '@angular/core';
import { Repository } from '@car-rental/domain';
import { MaintenanceRecord } from '../models';
export { VEHICLE_REPO, CUSTOMER_REPO, BOOKING_REPO } from '@car-rental/domain';
export const MAINTENANCE_REPO = new InjectionToken<Repository<MaintenanceRecord>>('MAINTENANCE_REPO');
```
- admin `core/repositories/local-storage-repository.ts`、`repository.ts`、`testing.ts` 改為 re-export domain（保留檔案避免大量改 import）：
```ts
// repository.ts
export * from '@car-rental/domain';
```
（`local-storage-repository.ts`、`testing.ts` 同樣 `export * from '@car-rental/domain';`）
- admin `core/repositories/seed-data.ts` 改為：re-export 三個共用 seed，保留 `seedMaintenanceRecords` 本體：
```ts
export { seedVehicles, seedCustomers, seedBookings } from '@car-rental/domain';
import { MaintenanceRecord } from '../models';
import { isoAt } from '../date-utils';
export function seedMaintenanceRecords(): MaintenanceRecord[] { /* 原內容不動 */ }
```

- [ ] **Step 5: 跑 admin 全測試確認守恆**

Run: `npx nx test admin && npx nx test domain && npx nx test theme-pack`
Expected: admin 46 + theme-pack 7 全過；domain 若尚無測試則 0 失敗。任何紅燈必須修到綠才可 commit（多半是殘留的 `../models`/`../repositories` import 路徑，逐一改成透過上述 re-export 或直接 `@car-rental/domain`）。

- [ ] **Step 6: build 驗證**

Run: `npx nx build admin && npx nx build domain`
Expected: 皆 exit 0。

- [ ] **Step 7: Commit**

```bash
git add libs/domain apps/admin
git commit -m "refactor(domain): 共用 model 與 Repository 搬進 libs/domain，admin 改用 @car-rental/domain"
```

---

### Task 3: Vehicle 車籍模型擴充

**Files:**
- Modify: `libs/domain/src/lib/models/vehicle.ts`
- Modify: `libs/domain/src/lib/repositories/seed-data.ts`（seedVehicles 補新欄位、type→category）
- Modify: `apps/admin/src/app/stores/vehicle/vehicle.store.ts`（create/update 簽章、remove 加 pending_payment）
- Modify: `apps/admin/src/app/features/vehicles/dialogs/vehicle-form-dialog.component.ts`（表單欄位）
- Test: `apps/admin/src/app/stores/vehicle/vehicle.store.spec.ts`（更新 makeVehicle）

**Interfaces:**
- Produces：`VehicleCategory = 'car'|'scooter'|'ev'`；`Vehicle` 新增 `category/brand/year`（必填）、`displacement/nextServiceMileage/insuranceExpiry`（選填），移除 `type`。
- Consumes：Task 2 的 domain models。

- [ ] **Step 1: 改 Vehicle 模型**

`libs/domain/src/lib/models/vehicle.ts`：
```ts
import { VehicleStatus } from './enums';
export type VehicleCategory = 'car' | 'scooter' | 'ev';
export interface Vehicle {
  id: string;
  plateNumber: string;
  category: VehicleCategory;
  model: string;
  brand: string;
  displacement?: number;
  year: number;
  status: VehicleStatus;
  mileage: number;
  nextServiceMileage?: number;
  insuranceExpiry?: string;
  createdAt: string;
}
```

- [ ] **Step 2: 更新 seedVehicles（type→category + 新欄位），跑測試看它「因型別錯誤而紅」**

把 domain `seed-data.ts` 的六台車 `type: 'scooter'` → `category: 'scooter'`（car→car），並各補 `brand`、`year`，機車補 `displacement`。範例：
```ts
{ id: 'v1', plateNumber: 'ABC-123', category: 'scooter', model: 'Gogoro 3',
  brand: 'Gogoro', displacement: 0, year: 2022, status: 'available',
  mileage: 4800, insuranceExpiry: isoAt(120, 0), createdAt: isoAt(-90, 9) },
```
（其餘五台比照補齊；`ev` 可視需要把 Gogoro 改 category:'ev'，但保持測試對「可用車數」的既有假設不變——只改欄位不改 status。）

Run: `npx nx test admin`
Expected: 因 `type` 欄位消失，vehicle 相關測試/型別編譯出現錯誤（預期紅燈，證明改到了）。

- [ ] **Step 3: 更新 VehicleStore 簽章與 remove 佔用判定**

`vehicle.store.ts`：
- `create` 入參改為 `{ plateNumber; category: VehicleCategory; model; brand; year; displacement?; mileage; nextServiceMileage?; insuranceExpiry? }`，建物件時帶入這些欄位。
- `update` patch 允許 `plateNumber?/model?/brand?/year?/displacement?/mileage?/nextServiceMileage?/insuranceExpiry?`。
- `statusCounts`、`transition`、`ALLOWED` 不動。
- `remove` 的 active 判定補上 `pending_payment`：
```ts
.some((b) => b.vehicleId === id &&
  (b.status === 'pending_payment' || b.status === 'confirmed' || b.status === 'in_progress'));
```
- 匯入改 `import { Vehicle, VehicleStatus, VehicleCategory } from '../../core/models';`（移除 VehicleType）。

- [ ] **Step 4: 更新 vehicle-form dialog 表單**

`vehicle-form-dialog.component.ts`：把原 `type`（scooter/car）欄位換成 `category`（三選：汽車/機車/電動車），新增 `brand`、`year`、選填 `displacement`、`nextServiceMileage`、`insuranceExpiry`（date picker 或 text ISO）。沿用現有 reactive form 與 Material 欄位樣式。i18n 標籤加到 `core/i18n/zh-tw.ts`（車型/廠牌/年分/排氣量/定保里程/保險到期）。

- [ ] **Step 5: 更新測試 helper makeVehicle**

`vehicle.store.spec.ts` 的 `makeVehicle`：
```ts
function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1', plateNumber: 'ABC-123', category: 'scooter', model: 'Gogoro',
    brand: 'Gogoro', year: 2022, status: 'available', mileage: 100,
    createdAt: new Date().toISOString(), ...partial,
  };
}
```
若有測試直接呼叫 `store.create({ type: ... })`，改為新簽章。新增一條測試：`remove` 遇 `pending_payment` 訂單應擋（`expect(() => store.remove(id)).toThrow`）。

- [ ] **Step 6: 全測試綠 + build**

Run: `npx nx test admin && npx nx test domain && npx nx build admin`
Expected: 全綠、build 過。

- [ ] **Step 7: Commit**

```bash
git add libs/domain apps/admin
git commit -m "feat(domain): Vehicle 擴充 category/brand/year 等欄位，remove 納入 pending_payment"
```

---

### Task 4: 定價引擎純函式（含定價相關 model）

**Files:**
- Create: `libs/domain/src/lib/models/{pricing-plan.ts,add-on.ts,coupon.ts,price-breakdown.ts}`
- Modify: `libs/domain/src/lib/models/index.ts`
- Create: `libs/domain/src/lib/pricing/{date-classify.ts,calculate-price.ts,index.ts}`
- Modify: `libs/domain/src/index.ts`
- Test: `libs/domain/src/lib/pricing/{date-classify.spec.ts,calculate-price.spec.ts}`

**Interfaces:**
- Produces：
  - Models：`PricingPlan`、`DayType`、`DayTier`、`SeasonCalendar`、`DateRange`、`AddOn`、`AddOnUnit`、`Coupon`、`CouponType`、`PriceBreakdown`、`PriceLineDay`、`PriceLineAddOn`
  - `classifyDay(date: string, calendar: SeasonCalendar): DayType`
  - `calculatePrice(input): PriceBreakdown`
  - `isCouponValid(coupon, ctx): boolean`
- Consumes：`VehicleCategory`（Task 3）。

- [ ] **Step 1: 定義定價相關 model**

`libs/domain/src/lib/models/pricing-plan.ts`：
```ts
import { VehicleCategory } from './vehicle';
export type DayType = 'weekday' | 'weekend' | 'holiday' | 'peak';
export interface DayTier { minDays: number; discountPercent: number; }
export interface PricingPlan {
  id: string; name: string;
  appliesToCategory: VehicleCategory;
  dayTypeRates: Record<DayType, number>;
  tiers: DayTier[];
}
export interface DateRange { start: string; end: string; } // 'YYYY-MM-DD'（含當日）
export interface SeasonCalendar { id: string; holidays: DateRange[]; peakSeasons: DateRange[]; }
```
`add-on.ts`：
```ts
export type AddOnUnit = 'per_rental' | 'per_day';
export interface AddOn { id: string; name: string; unitPrice: number; unit: AddOnUnit; }
```
`coupon.ts`：
```ts
import { VehicleCategory } from './vehicle';
export type CouponType = 'percent' | 'amount';
export interface Coupon {
  id: string; code: string; type: CouponType; value: number;
  minDays?: number; applicableCategories?: VehicleCategory[];
  validFrom: string; validTo: string; // 'YYYY-MM-DD'
}
```
`price-breakdown.ts`：
```ts
import { DayType } from './pricing-plan';
export interface PriceLineDay { date: string; dayType: DayType; price: number; }
export interface PriceLineAddOn { addOnId: string; name: string; qty: number; amount: number; }
export interface PriceBreakdown {
  dailyLines: PriceLineDay[];
  rentalRaw: number; tierDiscountPercent: number; tierDiscountAmount: number;
  rentalSubtotal: number;
  addOnLines: PriceLineAddOn[]; addOnSubtotal: number;
  couponCode?: string; couponDiscount: number; total: number;
}
```
`models/index.ts` 追加：
```ts
export * from './pricing-plan';
export * from './add-on';
export * from './coupon';
export * from './price-breakdown';
```

- [ ] **Step 2: 寫 date-classify 失敗測試**

`libs/domain/src/lib/pricing/date-classify.spec.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { classifyDay } from './date-classify';
import { SeasonCalendar } from '../models';

const cal: SeasonCalendar = {
  id: 'default',
  holidays: [{ start: '2026-02-16', end: '2026-02-18' }],
  peakSeasons: [{ start: '2026-04-18', end: '2026-06-30' }],
};

describe('classifyDay', () => {
  it('平日（週三）→ weekday', () => expect(classifyDay('2026-01-07', cal)).toBe('weekday'));
  it('週六 → weekend', () => expect(classifyDay('2026-01-10', cal)).toBe('weekend'));
  it('連假日期 → holiday', () => expect(classifyDay('2026-02-17', cal)).toBe('holiday'));
  it('旺季日期 → peak（優先於週末）', () =>
    expect(classifyDay('2026-04-18', cal)).toBe('peak')); // 2026-04-18 為週六，peak 覆蓋
});
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npx nx test domain`
Expected: FAIL（`classifyDay` 未定義）。

- [ ] **Step 4: 實作 date-classify**

`libs/domain/src/lib/pricing/date-classify.ts`：
```ts
import { DayType, SeasonCalendar, DateRange } from '../models';
function inRange(date: string, r: DateRange): boolean { return date >= r.start && date <= r.end; }
export function classifyDay(date: string, calendar: SeasonCalendar): DayType {
  if (calendar.peakSeasons.some((r) => inRange(date, r))) return 'peak';
  if (calendar.holidays.some((r) => inRange(date, r))) return 'holiday';
  const dow = new Date(date + 'T00:00:00').getDay();
  return dow === 0 || dow === 6 ? 'weekend' : 'weekday';
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test domain`
Expected: date-classify 4 條全過。

- [ ] **Step 6: 寫 calculate-price 失敗測試（涵蓋累折/配件/優惠券/邊界）**

`libs/domain/src/lib/pricing/calculate-price.spec.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { calculatePrice, isCouponValid } from './calculate-price';
import { PricingPlan, SeasonCalendar, AddOn, Coupon } from '../models';

const plan: PricingPlan = {
  id: 'p1', name: '機車 125', appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
  tiers: [{ minDays: 3, discountPercent: 5 }, { minDays: 7, discountPercent: 10 }],
};
const cal: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };
const helmet: AddOn = { id: 'a1', name: '安全帽', unitPrice: 50, unit: 'per_rental' };
const seat: AddOn = { id: 'a2', name: '兒童座椅', unitPrice: 100, unit: 'per_day' };

describe('calculatePrice', () => {
  it('0 天（start===end）→ 全 0', () => {
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-05', addOns: [] });
    expect(r.total).toBe(0);
    expect(r.dailyLines).toHaveLength(0);
  });

  it('2 平日（一/二）無累折：400*2=800', () => {
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-07', addOns: [] });
    expect(r.rentalRaw).toBe(800);
    expect(r.tierDiscountPercent).toBe(0);
    expect(r.total).toBe(800);
  });

  it('3 天觸發 5% 累折', () => {
    // 2026-01-05(一)~08：一二三平日 400*3=1200；tier 5% → 60；小計 1140
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08', addOns: [] });
    expect(r.rentalRaw).toBe(1200);
    expect(r.tierDiscountPercent).toBe(5);
    expect(r.tierDiscountAmount).toBe(60);
    expect(r.rentalSubtotal).toBe(1140);
  });

  it('配件：一次性 + 每日（3 天）', () => {
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08',
      addOns: [{ addOn: helmet, qty: 2 }, { addOn: seat, qty: 1 }] });
    // helmet 50*2=100；seat 100*1*3=300 → addOnSubtotal 400
    expect(r.addOnSubtotal).toBe(400);
    expect(r.total).toBe(1140 + 400);
  });

  it('優惠券 percent 施於租金小計（累折後）', () => {
    const coupon: Coupon = { id: 'k1', code: 'SAVE10', type: 'percent', value: 10,
      validFrom: '2026-01-01', validTo: '2026-12-31' };
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-08', addOns: [], coupon });
    // rentalSubtotal 1140 → 10% = 114；total = 1140-114 = 1026
    expect(r.couponDiscount).toBe(114);
    expect(r.couponCode).toBe('SAVE10');
    expect(r.total).toBe(1026);
  });

  it('優惠券 amount 不超過租金小計', () => {
    const coupon: Coupon = { id: 'k2', code: 'BIG', type: 'amount', value: 99999,
      validFrom: '2026-01-01', validTo: '2026-12-31' };
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-07', addOns: [], coupon });
    expect(r.couponDiscount).toBe(800); // = rentalSubtotal
    expect(r.total).toBe(0);
  });

  it('優惠券過期 → 不折、不記 code', () => {
    const coupon: Coupon = { id: 'k3', code: 'OLD', type: 'percent', value: 10,
      validFrom: '2025-01-01', validTo: '2025-12-31' };
    const r = calculatePrice({ plan, calendar: cal, startDate: '2026-01-05', endDate: '2026-01-07', addOns: [], coupon });
    expect(r.couponDiscount).toBe(0);
    expect(r.couponCode).toBeUndefined();
  });
});

describe('isCouponValid', () => {
  const base: Coupon = { id: 'k', code: 'C', type: 'percent', value: 10, validFrom: '2026-01-01', validTo: '2026-12-31' };
  it('minDays 未達 → 無效', () =>
    expect(isCouponValid({ ...base, minDays: 3 }, { startDate: '2026-05-01', days: 2, category: 'scooter' })).toBe(false));
  it('車型不符 → 無效', () =>
    expect(isCouponValid({ ...base, applicableCategories: ['car'] }, { startDate: '2026-05-01', days: 5, category: 'scooter' })).toBe(false));
  it('全部符合 → 有效', () =>
    expect(isCouponValid(base, { startDate: '2026-05-01', days: 5, category: 'scooter' })).toBe(true));
});
```

- [ ] **Step 7: 跑測試確認失敗**

Run: `npx nx test domain`
Expected: FAIL（`calculatePrice`/`isCouponValid` 未定義）。

- [ ] **Step 8: 實作 calculate-price**

`libs/domain/src/lib/pricing/calculate-price.ts`：
```ts
import {
  PricingPlan, SeasonCalendar, AddOn, Coupon, DayTier,
  PriceBreakdown, PriceLineDay, PriceLineAddOn, VehicleCategory,
} from '../models';
import { classifyDay } from './date-classify';

function eachNight(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const cur = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cur < end) {
    const p = (n: number) => String(n).padStart(2, '0');
    out.push(`${cur.getFullYear()}-${p(cur.getMonth() + 1)}-${p(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function pickTierPercent(tiers: DayTier[], days: number): number {
  const applicable = tiers.filter((t) => days >= t.minDays).sort((a, b) => b.minDays - a.minDays);
  return applicable.length ? applicable[0].discountPercent : 0;
}

export function isCouponValid(
  coupon: Coupon,
  ctx: { startDate: string; days: number; category: VehicleCategory },
): boolean {
  if (ctx.startDate < coupon.validFrom || ctx.startDate > coupon.validTo) return false;
  if (coupon.minDays !== undefined && ctx.days < coupon.minDays) return false;
  if (coupon.applicableCategories && !coupon.applicableCategories.includes(ctx.category)) return false;
  return true;
}

export function calculatePrice(input: {
  plan: PricingPlan;
  calendar: SeasonCalendar;
  startDate: string;
  endDate: string;
  addOns: { addOn: AddOn; qty: number }[];
  coupon?: Coupon;
}): PriceBreakdown {
  const { plan, calendar, startDate, endDate, addOns, coupon } = input;
  const nights = eachNight(startDate, endDate);
  const days = nights.length;

  const dailyLines: PriceLineDay[] = nights.map((date) => {
    const dayType = classifyDay(date, calendar);
    return { date, dayType, price: plan.dayTypeRates[dayType] };
  });
  const rentalRaw = dailyLines.reduce((s, l) => s + l.price, 0);

  const tierDiscountPercent = pickTierPercent(plan.tiers, days);
  const tierDiscountAmount = Math.round((rentalRaw * tierDiscountPercent) / 100);
  const rentalSubtotal = rentalRaw - tierDiscountAmount;

  const addOnLines: PriceLineAddOn[] = addOns
    .filter((a) => a.qty > 0)
    .map(({ addOn, qty }) => ({
      addOnId: addOn.id, name: addOn.name, qty,
      amount: addOn.unitPrice * qty * (addOn.unit === 'per_day' ? days : 1),
    }));
  const addOnSubtotal = addOnLines.reduce((s, l) => s + l.amount, 0);

  let couponDiscount = 0;
  let couponCode: string | undefined;
  if (coupon && isCouponValid(coupon, { startDate, days, category: plan.appliesToCategory })) {
    couponDiscount = coupon.type === 'percent'
      ? Math.round((rentalSubtotal * coupon.value) / 100)
      : Math.min(coupon.value, rentalSubtotal);
    couponCode = coupon.code;
  }

  const total = rentalSubtotal - couponDiscount + addOnSubtotal;
  return {
    dailyLines, rentalRaw, tierDiscountPercent, tierDiscountAmount, rentalSubtotal,
    addOnLines, addOnSubtotal, couponCode, couponDiscount, total,
  };
}
```
`libs/domain/src/lib/pricing/index.ts`：
```ts
export * from './date-classify';
export * from './calculate-price';
```
`libs/domain/src/index.ts` 追加：`export * from './lib/pricing';`

- [ ] **Step 9: 跑測試確認全過**

Run: `npx nx test domain`
Expected: date-classify + calculate-price + isCouponValid 全過。

- [ ] **Step 10: Commit**

```bash
git add libs/domain
git commit -m "feat(domain): 定價引擎純函式（日期分類/累折/配件/優惠券）與定價 model"
```

---

### Task 5: 車輛可租時間重疊檢查純函式

**Files:**
- Create: `libs/domain/src/lib/availability/{ranges-overlap.ts,is-vehicle-available.ts,index.ts}`
- Modify: `libs/domain/src/index.ts`
- Test: `libs/domain/src/lib/availability/{ranges-overlap.spec.ts,is-vehicle-available.spec.ts}`

**Interfaces:**
- Produces：`rangesOverlap(s1,e1,s2,e2): boolean`；`isVehicleAvailable(input): boolean`
- Consumes：`Vehicle`、`RentalBooking`、`BookingStatus`（domain）。

- [ ] **Step 1: 寫失敗測試**

`libs/domain/src/lib/availability/ranges-overlap.spec.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { rangesOverlap } from './ranges-overlap';
describe('rangesOverlap', () => {
  it('重疊 → true', () =>
    expect(rangesOverlap('2026-01-05T09:00:00', '2026-01-08T09:00:00', '2026-01-07T09:00:00', '2026-01-10T09:00:00')).toBe(true));
  it('完全分離 → false', () =>
    expect(rangesOverlap('2026-01-05T09:00:00', '2026-01-06T09:00:00', '2026-01-07T09:00:00', '2026-01-08T09:00:00')).toBe(false));
  it('無縫接續（前 end === 後 start）→ false', () =>
    expect(rangesOverlap('2026-01-05T09:00:00', '2026-01-07T09:00:00', '2026-01-07T09:00:00', '2026-01-09T09:00:00')).toBe(false));
});
```
`libs/domain/src/lib/availability/is-vehicle-available.spec.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { isVehicleAvailable } from './is-vehicle-available';
import { Vehicle, RentalBooking } from '../models';

const v: Vehicle = { id: 'v1', plateNumber: 'A', category: 'scooter', model: 'G',
  brand: 'G', year: 2022, status: 'available', mileage: 0, createdAt: '' };
function bk(p: Partial<RentalBooking>): RentalBooking {
  return { id: 'b', vehicleId: 'v1', customerId: 'c', startTime: '2026-01-05T09:00:00',
    endTime: '2026-01-08T09:00:00', pickupLocation: '', returnLocation: '', status: 'confirmed', ...p };
}

describe('isVehicleAvailable', () => {
  const req = { startTime: '2026-01-06T09:00:00', endTime: '2026-01-07T09:00:00' };
  it('maintenance 車 → 不可租', () =>
    expect(isVehicleAvailable({ vehicle: { ...v, status: 'maintenance' }, ...req, bookings: [] })).toBe(false));
  it('confirmed 訂單重疊 → 不可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, bookings: [bk({})] })).toBe(false));
  it('pending_payment 訂單重疊 → 不可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, bookings: [bk({ status: 'pending_payment' })] })).toBe(false));
  it('cancelled 訂單不佔用 → 可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, bookings: [bk({ status: 'cancelled' })] })).toBe(true));
  it('completed 訂單不佔用 → 可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, bookings: [bk({ status: 'completed' })] })).toBe(true));
  it('別台車的訂單 → 可租', () =>
    expect(isVehicleAvailable({ vehicle: v, ...req, bookings: [bk({ vehicleId: 'v2' })] })).toBe(true));
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test domain`
Expected: FAIL（函式未定義）。

- [ ] **Step 3: 實作**

`libs/domain/src/lib/availability/ranges-overlap.ts`：
```ts
export function rangesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && s2 < e1;
}
```
`libs/domain/src/lib/availability/is-vehicle-available.ts`：
```ts
import { Vehicle, RentalBooking, BookingStatus } from '../models';
import { rangesOverlap } from './ranges-overlap';
const OCCUPYING: BookingStatus[] = ['pending_payment', 'confirmed', 'in_progress'];
export function isVehicleAvailable(input: {
  vehicle: Vehicle; startTime: string; endTime: string; bookings: RentalBooking[];
}): boolean {
  if (input.vehicle.status === 'maintenance') return false;
  return !input.bookings.some(
    (b) => b.vehicleId === input.vehicle.id &&
      OCCUPYING.includes(b.status) &&
      rangesOverlap(input.startTime, input.endTime, b.startTime, b.endTime),
  );
}
```
`libs/domain/src/lib/availability/index.ts`：
```ts
export * from './ranges-overlap';
export * from './is-vehicle-available';
```
`libs/domain/src/index.ts` 追加：`export * from './lib/availability';`

- [ ] **Step 4: 跑測試確認全過 + build**

Run: `npx nx test domain && npx nx build domain`
Expected: 全綠、build 過。

- [ ] **Step 5: Commit**

```bash
git add libs/domain
git commit -m "feat(domain): 車輛可租時間重疊檢查純函式（rangesOverlap/isVehicleAvailable）"
```

---

### Task 6: admin 定價規則設定頁（PricingPlan + SeasonCalendar）

**Files:**
- Create: `libs/domain/src/lib/repositories/tokens.ts`（追加 `PRICING_PLAN_REPO`、`SEASON_CALENDAR_REPO`）
- Create: `libs/domain/src/lib/repositories/seed-data.ts`（追加 `seedPricingPlans`、`seedSeasonCalendar`）
- Create: `apps/admin/src/app/stores/pricing/pricing.store.ts` + `.spec.ts`
- Create: `apps/admin/src/app/features/pricing/pages/pricing-page.component.ts`
- Create: `apps/admin/src/app/features/pricing/dialogs/pricing-plan-dialog.component.ts`
- Modify: `apps/admin/src/app/app.config.ts`（provide 兩個 repo）
- Modify: `apps/admin/src/app/app.routes.ts`（加 /pricing 路由）+ 導覽

**Interfaces:**
- Consumes：`PricingPlan`、`SeasonCalendar`、`Repository`、tokens、`LocalStorageRepository`（domain）。
- Produces：`PricingStore`（`plans: Signal<PricingPlan[]>`、`calendar: Signal<SeasonCalendar>`、`createPlan/updatePlan/removePlan/updateCalendar`）。

- [ ] **Step 1: 追加 tokens 與 seed**

domain `tokens.ts` 追加：
```ts
import { PricingPlan, SeasonCalendar } from '../models';
export const PRICING_PLAN_REPO = new InjectionToken<Repository<PricingPlan>>('PRICING_PLAN_REPO');
export const SEASON_CALENDAR_REPO = new InjectionToken<Repository<SeasonCalendar>>('SEASON_CALENDAR_REPO');
```
domain `seed-data.ts` 追加：
```ts
export function seedPricingPlans(): PricingPlan[] {
  return [
    { id: 'pp1', name: '機車 125', appliesToCategory: 'scooter',
      dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
      tiers: [{ minDays: 3, discountPercent: 5 }, { minDays: 7, discountPercent: 10 }] },
    { id: 'pp2', name: '小客車', appliesToCategory: 'car',
      dayTypeRates: { weekday: 1500, weekend: 1800, holiday: 2200, peak: 2600 },
      tiers: [{ minDays: 3, discountPercent: 5 }] },
  ];
}
export function seedSeasonCalendar(): SeasonCalendar[] {
  return [{ id: 'default', holidays: [], peakSeasons: [{ start: '2026-04-18', end: '2026-06-30' }] }];
}
```
（記得 import PricingPlan/SeasonCalendar，並在 domain barrel 已 export 這些函式。）

- [ ] **Step 2: 寫 PricingStore 失敗測試**

`pricing.store.spec.ts`（比照 vehicle.store.spec 的 TestBed + createInMemoryRepo pattern）：
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PricingStore } from './pricing.store';
import { PRICING_PLAN_REPO, SEASON_CALENDAR_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { PricingPlan, SeasonCalendar } from '../../core/models';

const plan: PricingPlan = { id: 'pp1', name: '機車', appliesToCategory: 'scooter',
  dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 }, tiers: [] };
const cal: SeasonCalendar = { id: 'default', holidays: [], peakSeasons: [] };

describe('PricingStore', () => {
  let store: PricingStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([plan]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([cal]) },
    ]});
    store = TestBed.inject(PricingStore);
  });
  it('讀取既有方案', () => expect(store.plans()).toHaveLength(1));
  it('新增方案', () => {
    store.createPlan({ name: '汽車', appliesToCategory: 'car',
      dayTypeRates: { weekday: 1500, weekend: 1800, holiday: 2200, peak: 2600 }, tiers: [] });
    expect(store.plans()).toHaveLength(2);
  });
  it('更新行事曆旺季', () => {
    store.updateCalendar({ holidays: [], peakSeasons: [{ start: '2026-07-01', end: '2026-07-31' }] });
    expect(store.calendar().peakSeasons).toHaveLength(1);
  });
});
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL（`PricingStore` 未定義）。

- [ ] **Step 4: 實作 PricingStore**

`pricing.store.ts`：
```ts
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { PricingPlan, SeasonCalendar } from '../../core/models';
import { PRICING_PLAN_REPO, SEASON_CALENDAR_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class PricingStore {
  private planRepo = inject(PRICING_PLAN_REPO);
  private calRepo = inject(SEASON_CALENDAR_REPO);
  private _plans = signal<PricingPlan[]>(this.planRepo.getAll());
  private _cal = signal<SeasonCalendar>(this.calRepo.getAll()[0]);
  readonly plans: Signal<PricingPlan[]> = this._plans.asReadonly();
  readonly calendar: Signal<SeasonCalendar> = this._cal.asReadonly();

  createPlan(input: Omit<PricingPlan, 'id'>): PricingPlan {
    const plan: PricingPlan = { id: crypto.randomUUID(), ...input };
    this.planRepo.create(plan);
    this._plans.set(this.planRepo.getAll());
    return plan;
  }
  updatePlan(id: string, patch: Partial<PricingPlan>): void {
    this.planRepo.update(id, patch);
    this._plans.set(this.planRepo.getAll());
  }
  removePlan(id: string): void {
    this.planRepo.remove(id);
    this._plans.set(this.planRepo.getAll());
  }
  updateCalendar(patch: Partial<SeasonCalendar>): void {
    const cur = this._cal();
    this.calRepo.update(cur.id, patch);
    this._cal.set(this.calRepo.getAll()[0]);
  }
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PricingStore 3 條全過。

- [ ] **Step 6: 建設定頁與 dialog、接路由與 app.config**

- `pricing-page.component.ts`：standalone、注入 `PricingStore`，用 Material table 列出 `plans()`（車型、四種每日價、累折級距摘要），新增/編輯開 `pricing-plan-dialog`，刪除用既有 `ConfirmDialog`。另一區塊編輯 `calendar()` 的 holidays/peakSeasons（DateRange 列表增刪）。沿用 Verdant 樣式與既有 page 結構（參考 `features/vehicles/pages/vehicles-page.component.ts`）。
- `pricing-plan-dialog.component.ts`：reactive form（name、appliesToCategory、四個 dayTypeRates、tiers 動態陣列 minDays+discountPercent）。
- `app.config.ts` providers 追加：
```ts
{ provide: PRICING_PLAN_REPO, useFactory: () =>
    new LocalStorageRepository('cr.pricingPlans', seedPricingPlans, notifyStorageReset(inject(MatSnackBar))) },
{ provide: SEASON_CALENDAR_REPO, useFactory: () =>
    new LocalStorageRepository('cr.seasonCalendar', seedSeasonCalendar, notifyStorageReset(inject(MatSnackBar))) },
```
（import `PRICING_PLAN_REPO, SEASON_CALENDAR_REPO` from tokens；`seedPricingPlans, seedSeasonCalendar` from seed-data。）
- `app.routes.ts` 加 `{ path: 'pricing', component: PricingPageComponent }`，並在主導覽（app shell）加入口。i18n 標籤加到 `zh-tw.ts`。

- [ ] **Step 7: 全測試 + build**

Run: `npx nx test admin && npx nx build admin`
Expected: 全綠、build 過。手動確認：`npx nx serve admin` 開 /pricing 能增刪改方案與旺季。

- [ ] **Step 8: Commit**

```bash
git add libs/domain apps/admin
git commit -m "feat(admin): 定價規則與旺季行事曆設定頁（PricingStore）"
```

---

### Task 7: admin 配件設定頁（AddOn）

**Files:**
- Modify: domain `tokens.ts`（+`ADDON_REPO`）、`seed-data.ts`（+`seedAddOns`）
- Create: `apps/admin/src/app/stores/addon/addon.store.ts` + `.spec.ts`
- Create: `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.ts`
- Create: `apps/admin/src/app/features/add-ons/dialogs/add-on-dialog.component.ts`
- Modify: `app.config.ts`、`app.routes.ts`、導覽、`zh-tw.ts`

**Interfaces:**
- Produces：`AddOnStore`（`addOns: Signal<AddOn[]>`、`create/update/remove`）。

- [ ] **Step 1: tokens + seed**

domain `tokens.ts` 追加 `export const ADDON_REPO = new InjectionToken<Repository<AddOn>>('ADDON_REPO');`（import AddOn）。
domain `seed-data.ts` 追加：
```ts
export function seedAddOns(): AddOn[] {
  return [
    { id: 'ao1', name: '安全帽', unitPrice: 0, unit: 'per_rental' },
    { id: 'ao2', name: '雨衣', unitPrice: 50, unit: 'per_rental' },
    { id: 'ao3', name: '兒童安全座椅', unitPrice: 100, unit: 'per_day' },
    { id: 'ao4', name: '手機支架', unitPrice: 30, unit: 'per_rental' },
  ];
}
```

- [ ] **Step 2: 寫 AddOnStore 失敗測試**

`addon.store.spec.ts`：
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AddOnStore } from './addon.store';
import { ADDON_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { AddOn } from '../../core/models';

describe('AddOnStore', () => {
  let store: AddOnStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>([
        { id: 'ao1', name: '雨衣', unitPrice: 50, unit: 'per_rental' }]) },
    ]});
    store = TestBed.inject(AddOnStore);
  });
  it('讀取', () => expect(store.addOns()).toHaveLength(1));
  it('新增', () => { store.create({ name: '座椅', unitPrice: 100, unit: 'per_day' }); expect(store.addOns()).toHaveLength(2); });
  it('刪除', () => { store.remove('ao1'); expect(store.addOns()).toHaveLength(0); });
});
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npx nx test admin`　Expected: FAIL。

- [ ] **Step 4: 實作 AddOnStore**

`addon.store.ts`（比照 PricingStore 精簡版）：
```ts
import { Injectable, Signal, inject, signal } from '@angular/core';
import { AddOn } from '../../core/models';
import { ADDON_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class AddOnStore {
  private repo = inject(ADDON_REPO);
  private _addOns = signal<AddOn[]>(this.repo.getAll());
  readonly addOns: Signal<AddOn[]> = this._addOns.asReadonly();
  create(input: Omit<AddOn, 'id'>): AddOn {
    const a: AddOn = { id: crypto.randomUUID(), ...input };
    this.repo.create(a); this._addOns.set(this.repo.getAll()); return a;
  }
  update(id: string, patch: Partial<AddOn>): void { this.repo.update(id, patch); this._addOns.set(this.repo.getAll()); }
  remove(id: string): void { this.repo.remove(id); this._addOns.set(this.repo.getAll()); }
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test admin`　Expected: PASS。

- [ ] **Step 6: 頁面 + dialog + 接線**

`add-ons-page.component.ts`（Material table：名稱/單價/計價單位，增刪改）；`add-on-dialog.component.ts`（form：name/unitPrice/unit）。`app.config.ts` 加：
```ts
{ provide: ADDON_REPO, useFactory: () =>
    new LocalStorageRepository('cr.addOns', seedAddOns, notifyStorageReset(inject(MatSnackBar))) },
```
路由 `/add-ons`、導覽、i18n 補上。

- [ ] **Step 7: 全測試 + build**

Run: `npx nx test admin && npx nx build admin`　Expected: 全綠、build 過。

- [ ] **Step 8: Commit**

```bash
git add libs/domain apps/admin
git commit -m "feat(admin): 配件設定頁（AddOnStore）"
```

---

### Task 8: admin 優惠券設定頁（Coupon）

**Files:**
- Modify: domain `tokens.ts`（+`COUPON_REPO`）、`seed-data.ts`（+`seedCoupons`）
- Create: `apps/admin/src/app/stores/coupon/coupon.store.ts` + `.spec.ts`
- Create: `apps/admin/src/app/features/coupons/pages/coupons-page.component.ts`
- Create: `apps/admin/src/app/features/coupons/dialogs/coupon-dialog.component.ts`
- Modify: `app.config.ts`、`app.routes.ts`、導覽、`zh-tw.ts`

**Interfaces:**
- Produces：`CouponStore`（`coupons: Signal<Coupon[]>`、`create/update/remove`、`findByCode(code): Coupon|undefined`）。

- [ ] **Step 1: tokens + seed**

domain `tokens.ts` 加 `export const COUPON_REPO = new InjectionToken<Repository<Coupon>>('COUPON_REPO');`。
domain `seed-data.ts` 加：
```ts
export function seedCoupons(): Coupon[] {
  return [
    { id: 'cp1', code: 'SUMMER10', type: 'percent', value: 10, minDays: 2,
      validFrom: '2026-06-01', validTo: '2026-08-31' },
    { id: 'cp2', code: 'CAR300', type: 'amount', value: 300, applicableCategories: ['car'],
      validFrom: '2026-01-01', validTo: '2026-12-31' },
  ];
}
```

- [ ] **Step 2: 寫 CouponStore 失敗測試**

`coupon.store.spec.ts`：
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CouponStore } from './coupon.store';
import { COUPON_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Coupon } from '../../core/models';

const c: Coupon = { id: 'cp1', code: 'SUMMER10', type: 'percent', value: 10, validFrom: '2026-01-01', validTo: '2026-12-31' };
describe('CouponStore', () => {
  let store: CouponStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: COUPON_REPO, useValue: createInMemoryRepo<Coupon>([c]) }]});
    store = TestBed.inject(CouponStore);
  });
  it('依 code 查詢（不分大小寫）', () => expect(store.findByCode('summer10')?.id).toBe('cp1'));
  it('查無 → undefined', () => expect(store.findByCode('NOPE')).toBeUndefined());
  it('新增', () => { store.create({ code: 'X', type: 'amount', value: 50, validFrom: '2026-01-01', validTo: '2026-12-31' }); expect(store.coupons()).toHaveLength(2); });
});
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npx nx test admin`　Expected: FAIL。

- [ ] **Step 4: 實作 CouponStore**

`coupon.store.ts`：
```ts
import { Injectable, Signal, inject, signal } from '@angular/core';
import { Coupon } from '../../core/models';
import { COUPON_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class CouponStore {
  private repo = inject(COUPON_REPO);
  private _coupons = signal<Coupon[]>(this.repo.getAll());
  readonly coupons: Signal<Coupon[]> = this._coupons.asReadonly();
  findByCode(code: string): Coupon | undefined {
    return this.repo.getAll().find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  }
  create(input: Omit<Coupon, 'id'>): Coupon {
    const c: Coupon = { id: crypto.randomUUID(), ...input };
    this.repo.create(c); this._coupons.set(this.repo.getAll()); return c;
  }
  update(id: string, patch: Partial<Coupon>): void { this.repo.update(id, patch); this._coupons.set(this.repo.getAll()); }
  remove(id: string): void { this.repo.remove(id); this._coupons.set(this.repo.getAll()); }
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test admin`　Expected: PASS。

- [ ] **Step 6: 頁面 + dialog + 接線**

`coupons-page.component.ts`（table：code/型別/值/期間/限制）；`coupon-dialog.component.ts`（form：code/type/value/minDays?/applicableCategories?/validFrom/validTo）。`app.config.ts` 加 `COUPON_REPO`（key `cr.coupons`, `seedCoupons`）；路由 `/coupons`、導覽、i18n。

- [ ] **Step 7: 全測試 + build**

Run: `npx nx test admin && npx nx build admin`　Expected: 全綠、build 過。

- [ ] **Step 8: Commit**

```bash
git add libs/domain apps/admin
git commit -m "feat(admin): 優惠券設定頁（CouponStore）"
```

---

### Task 9: admin 訂單頁人工確認（pending_payment → confirmed）

**Files:**
- Modify: `apps/admin/src/app/stores/booking/booking.store.ts`（+`confirmPayment`）
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.ts`（加動作 + 顯示 pending_payment）
- Modify: `apps/admin/src/app/shared/chips/status-chip.component.ts`（若有 booking 狀態對應，補 pending_payment 樣式）
- Test: `apps/admin/src/app/stores/booking/booking.store.spec.ts`

**Interfaces:**
- Produces：`BookingStore.confirmPayment(id): void`（只允許 `pending_payment` → `confirmed`）。

- [ ] **Step 1: 寫失敗測試**

在 `booking.store.spec.ts` 增：
```ts
it('confirmPayment 把 pending_payment 轉 confirmed', () => {
  // 假設 store 有一筆 pending_payment 訂單 id='bp'
  store.confirmPayment('bp');
  expect(store.bookings().find((b) => b.id === 'bp')?.status).toBe('confirmed');
});
it('confirmPayment 對非 pending_payment 應丟錯', () => {
  expect(() => store.confirmPayment('confirmedId')).toThrow();
});
```
（依現有 spec 的 seed/in-memory 供資方式補一筆 `status:'pending_payment'` 訂單與一筆 confirmed 訂單。）

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`　Expected: FAIL（`confirmPayment` 未定義）。

- [ ] **Step 3: 實作 confirmPayment**

在 `booking.store.ts` 加：
```ts
confirmPayment(id: string): void {
  const b = this.repo.getById(id);
  if (!b) throw new Error(`not found: ${id}`);
  if (b.status !== 'pending_payment') throw new Error(ZH_TW.booking.notPending);
  this.repo.update(id, { status: 'confirmed' });
  this.reload();
}
```
（`ZH_TW.booking.notPending` 加到 i18n；`reload()` 沿用既有 pattern，若無則 `this._bookings.set(this.repo.getAll())`。）

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test admin`　Expected: PASS。

- [ ] **Step 5: 訂單頁加動作**

`bookings-page.component.ts`：列表對 `status==='pending_payment'` 的列顯示「確認收款」按鈕，呼叫 `bookingStore.confirmPayment(id)`；狀態欄顯示 pending_payment（i18n：待付款）。status-chip 補 pending_payment 顏色（沿用既有 tone 對應，給「warn/pending」色）。

- [ ] **Step 6: 全測試 + build**

Run: `npx nx test admin && npx nx build admin`　Expected: 全綠、build 過。

- [ ] **Step 7: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): 訂單頁人工確認收款（pending_payment→confirmed）"
```

---

### Task 10: booking 前台 — 選租期→選車款→配件→優惠券（含即時試算）

**Files:**
- Modify: `apps/booking/src/app/app.config.ts`（provide 共用 repos，讀同一組 localStorage key）
- Create: `apps/booking/src/app/stores/catalog.store.ts` + `.spec.ts`
- Create: `apps/booking/src/app/features/booking-flow/booking-flow.component.ts`（狀態容器）
- Create: 步驟子元件 `steps/{date-step,vehicle-step,addon-step,coupon-step}.component.ts`
- Modify: `apps/booking/src/app/app.routes.ts`

**Interfaces:**
- Produces：`CatalogStore`（讀 vehicles/bookings/pricingPlans/seasonCalendar/addOns/coupons 六個 repo；`availableVehicles(startTime,endTime)`、`planForCategory(cat)`、`price(input)`、`validateCoupon(code, ctx)`）。
- 前台選車經 `isVehicleAvailable`；試算經 `calculatePrice`。

- [ ] **Step 1: booking app 接共用 repos**

`apps/booking/src/app/app.config.ts` providers 加入六個 `LocalStorageRepository`（key 與 admin 完全相同：`cr.vehicles / cr.bookings / cr.pricingPlans / cr.seasonCalendar / cr.addOns / cr.coupons`，seed 用 `@car-rental/domain` 的對應函式）。這是「跨 app 經共用 localStorage key 分享資料」的接點。

- [ ] **Step 2: 寫 CatalogStore 失敗測試**

`catalog.store.spec.ts`（用 createInMemoryRepo 灌入一台 available scooter + 一個對應 plan + 空行事曆 + 一張券），驗證：
```ts
it('availableVehicles 過濾掉重疊訂單的車', () => {
  // 灌入 v1(available) 與一筆 v1 的 confirmed 重疊訂單
  expect(store.availableVehicles('2026-01-06T09:00:00', '2026-01-07T09:00:00').map(v=>v.id)).not.toContain('v1');
});
it('price 用對應車型 plan 算出 total', () => {
  const r = store.price({ category: 'scooter', startDate: '2026-01-05', endDate: '2026-01-07', addOns: [] });
  expect(r.total).toBeGreaterThan(0);
});
it('validateCoupon 無效券回原因', () => {
  expect(store.validateCoupon('NOPE', { startDate: '2026-05-01', days: 3, category: 'scooter' }).ok).toBe(false);
});
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npx nx test booking`　Expected: FAIL。

- [ ] **Step 4: 實作 CatalogStore**

注入六個 repo token，方法：
```ts
availableVehicles(startTime: string, endTime: string): Vehicle[] {
  const bookings = this.bookingRepo.getAll();
  return this.vehicleRepo.getAll().filter((v) =>
    isVehicleAvailable({ vehicle: v, startTime, endTime, bookings }));
}
planForCategory(cat: VehicleCategory): PricingPlan | undefined {
  return this.planRepo.getAll().find((p) => p.appliesToCategory === cat);
}
price(input: { category: VehicleCategory; startDate: string; endDate: string;
  addOns: { addOn: AddOn; qty: number }[]; coupon?: Coupon }): PriceBreakdown {
  const plan = this.planForCategory(input.category);
  if (!plan) throw new Error('無此車型定價');
  return calculatePrice({ plan, calendar: this.calRepo.getAll()[0], ...input });
}
validateCoupon(code: string, ctx: { startDate: string; days: number; category: VehicleCategory }):
  { ok: boolean; coupon?: Coupon; reason?: string } {
  const coupon = this.couponRepo.getAll().find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!coupon) return { ok: false, reason: '查無此優惠碼' };
  return isCouponValid(coupon, ctx) ? { ok: true, coupon } : { ok: false, reason: '不符使用條件' };
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test booking`　Expected: PASS。

- [ ] **Step 6: 建流程元件（四步）**

`booking-flow.component.ts` 持有選取狀態（signal：dateRange、vehicle、addOns qty map、couponCode），用 Material stepper 串四步；各步驟元件用 `CatalogStore`：
1. date-step：起訖日期＋時間。
2. vehicle-step：`availableVehicles()` 依 category 分組，每台顯示 `price().total` 預覽。
3. addon-step：列 `addOns()`，數量輸入。
4. coupon-step：輸入 code，即時 `validateCoupon` 顯示結果與試算折抵。
不套 theme-pack，用 Material 預設樣式。路由 `/book` 指向 `booking-flow`。

- [ ] **Step 7: 全測試 + build**

Run: `npx nx test booking && npx nx build booking`　Expected: 全綠、build 過。手動：`npx nx serve booking` 走前三步能看到即時價格。

- [ ] **Step 8: Commit**

```bash
git add apps/booking
git commit -m "feat(booking): 前台選租期/車款/配件/優惠券與即時試算（CatalogStore）"
```

---

### Task 11: booking 前台 — 明細確認頁與送出（寫 pending_payment 訂單）

**Files:**
- Create: `apps/booking/src/app/features/booking-flow/steps/confirm-step.component.ts`
- Create: `apps/booking/src/app/features/booking-flow/steps/done.component.ts`
- Modify: `apps/booking/src/app/stores/catalog.store.ts`（+`submitBooking`）
- Test: `apps/booking/src/app/stores/catalog.store.spec.ts`

**Interfaces:**
- Produces：`CatalogStore.submitBooking(input): RentalBooking`（送出前以 `isVehicleAvailable` 覆核；建立/關聯 Customer；寫 `pending_payment` 訂單，帶 addOns/couponCode/priceBreakdown/paymentMethod）。

- [ ] **Step 1: 寫 submitBooking 失敗測試**

在 `catalog.store.spec.ts` 增：
```ts
it('submitBooking 寫入 pending_payment 訂單並帶 priceBreakdown', () => {
  const b = store.submitBooking({
    vehicleId: 'v1', startTime: '2026-01-05T09:00:00', endTime: '2026-01-07T09:00:00',
    pickupLocation: '馬公', returnLocation: '馬公',
    customer: { name: '測試', phone: '0900000000', email: 't@t.com' },
    category: 'scooter', startDate: '2026-01-05', endDate: '2026-01-07',
    addOns: [], couponCode: undefined, paymentMethod: 'on_site',
  });
  expect(b.status).toBe('pending_payment');
  expect(b.priceBreakdown?.total).toBeGreaterThan(0);
});
it('submitBooking 車已被佔用 → 丟錯', () => {
  // 先讓 v1 有重疊 confirmed 訂單
  expect(() => store.submitBooking({ /* 同租期 v1 */ } as any)).toThrow();
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test booking`　Expected: FAIL。

- [ ] **Step 3: 實作 submitBooking**

```ts
submitBooking(input: {
  vehicleId: string; startTime: string; endTime: string;
  pickupLocation: string; returnLocation: string;
  customer: { name: string; phone: string; email: string };
  category: VehicleCategory; startDate: string; endDate: string;
  addOns: { addOn: AddOn; qty: number }[]; couponCode?: string; paymentMethod: PaymentMethod;
}): RentalBooking {
  const vehicle = this.vehicleRepo.getById(input.vehicleId);
  if (!vehicle) throw new Error('查無車輛');
  if (!isVehicleAvailable({ vehicle, startTime: input.startTime, endTime: input.endTime, bookings: this.bookingRepo.getAll() }))
    throw new Error('車輛已被預約');
  const coupon = input.couponCode
    ? this.couponRepo.getAll().find((c) => c.code.toLowerCase() === input.couponCode!.toLowerCase())
    : undefined;
  const priceBreakdown = this.price({ category: input.category, startDate: input.startDate,
    endDate: input.endDate, addOns: input.addOns, coupon });
  const customer: Customer = { id: crypto.randomUUID(), name: input.customer.name,
    phone: input.customer.phone, note: input.customer.email };
  this.customerRepo.create(customer);
  const booking: RentalBooking = {
    id: crypto.randomUUID(), vehicleId: input.vehicleId, customerId: customer.id,
    startTime: input.startTime, endTime: input.endTime,
    pickupLocation: input.pickupLocation, returnLocation: input.returnLocation,
    status: 'pending_payment',
    addOns: input.addOns.filter((a) => a.qty > 0).map((a) => ({ addOnId: a.addOn.id, qty: a.qty })),
    couponCode: priceBreakdown.couponCode, priceBreakdown, paymentMethod: input.paymentMethod,
  };
  this.bookingRepo.create(booking);
  return booking;
}
```
（Email 暫存於 `Customer.note`；未來 Customer 加 email 欄位再遷。此決定寫入 spec 對應段落註記。）

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test booking`　Expected: PASS。

- [ ] **Step 5: 明細確認頁與完成頁**

`confirm-step.component.ts`：顯示 `PriceBreakdown` 全欄位（逐日/租金小計/累折/配件/優惠折抵/應付總計）＋購買內容摘要；表單收付款人姓名/電話/Email/付款方式（信用卡/LINE Pay/現場付款/轉帳，UI 選項）。「送出」呼叫 `submitBooking`，成功導到 `done.component`（顯示「訂單成立，待付款/待人工確認」＋訂單編號）。

- [ ] **Step 6: 全測試 + build**

Run: `npx nx test booking && npx nx build booking`　Expected: 全綠、build 過。手動：`npx nx serve booking` 完整走完五步，送出後 admin `/bookings` 出現一筆待付款訂單、可「確認收款」。

- [ ] **Step 7: Commit**

```bash
git add apps/booking
git commit -m "feat(booking): 明細確認頁與送出（寫 pending_payment 訂單）"
```

---

### Task 12: 整合驗收

**Files:** 無（純驗證）

- [ ] **Step 1: 全 build**

Run: `npx nx build domain && npx nx build admin && npx nx build booking && npx nx build pos`
Expected: 皆 exit 0。

- [ ] **Step 2: 全測試**

Run: `npx nx test domain && npx nx test admin && npx nx test theme-pack && npx nx test booking`
Expected: 全綠；admin ≥ 46（含新 store 測試）、theme-pack 7、domain 定價/可租/coupon 測試全過、booking store 測試全過。

- [ ] **Step 3: lint:theme**

Run: `npm run lint:theme`
Expected: 通過（booking 未套主題不受影響；domain 無寫死色）。

- [ ] **Step 4: 端到端手動走查**

`npx nx serve admin` 設定一組定價/配件/優惠券 → `npx nx serve booking` 前台走完五步送出 → admin 訂單頁出現 pending_payment、確認收款轉 confirmed → 該車在同租期於前台不再可選（時間重疊生效）。

- [ ] **Step 5: 完成**

進入 superpowers:finishing-a-development-branch 收尾（合併/PR 由使用者選）。

---

## Self-Review

**Spec coverage：**
- §2.1 搬遷 → Task 2；§2.2 定價 model → Task 4；§2.3 Vehicle 擴充 → Task 3；§2.4 RentalBooking/狀態機/PaymentMethod → Task 2（狀態機）+ Task 11（欄位使用）。
- §3.1–3.3 定價引擎 → Task 4；§3.4 時間重疊 → Task 5。
- §4 admin 設定頁（定價/配件/優惠券/車籍擴充/訂單人工確認）→ Task 6/7/8/3/9。
- §5 前台五步 → Task 10（步驟1–4）+ Task 11（步驟5–6送出）。
- §6 檔案結構 → 各 Task 對應。§7 測試 → 各 Task TDD + Task 12。§8 驗收 → Task 12。

**Placeholder scan：** 已移除 submitBooking 內未使用的 `days` 佔位變數（優惠券驗證在 `price()` 內完成，不需外層 days）。Email 暫存 Customer.note 已明確標註為權宜決定。無其他 TBD/TODO。

**Type consistency：** `VehicleCategory`（Task 3）貫穿 PricingPlan/Coupon/CatalogStore；`BookingStatus` 含 pending_payment 於 Task 2 定義，Task 5/9/11 一致使用；`calculatePrice`/`isVehicleAvailable`/`isCouponValid` 簽章在 Task 4/5 定義、Task 10/11 消費一致。localStorage keys 全案一致（cr.*）。
