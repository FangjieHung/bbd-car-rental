# libs/ 共用了什麼

三個 app（admin/booking/affiliate）不是各自獨立寫一份邏輯，而是共用 `libs/` 底下三個庫。
改 `libs/` 的東西會同時影響所有引用它的 app，這是這份文件存在的原因——先搞清楚
「這段邏輯是誰的」，再決定要改哪裡。

## libs/domain — 全系統共用的資料模型與純函式

別名 `@car-rental/domain`（見根目錄 `tsconfig.base.json` 的 `paths`）。這是**沒有 UI**、
不依賴任何特定 app 的一層，三個 app 都直接 import 它。

### Model（`libs/domain/src/lib/models/`）

| Model | 檔案 | 說明 |
|---|---|---|
| `Vehicle` | `vehicle.ts` | 車輛；`category` 是 `car\|scooter\|ev`，`status` 是狀態機（見下） |
| `Customer` | `customer.ts` | 客戶 |
| `RentalBooking` | `rental-booking.ts` | 訂單；`status` 是狀態機、`sourcePartnerId` 標記來源民宿（模組二新增） |
| `PricingPlan` / `SeasonCalendar` | `pricing-plan.ts` | 定價方案（依車型、依日型費率、天數累折級距）與假日/旺季日曆 |
| `AddOn` | `add-on.ts` | 配件（單價 + 計價單位 `per_rental`/`per_day`） |
| `Coupon` | `coupon.ts` | 優惠券（`percent`/`amount`，可限車型/最少天數/有效期） |
| `PriceBreakdown` | `price-breakdown.ts` | `calculatePrice()` 的輸出，見 `03-pricing-and-commission.md` |
| `Partner` | `partner.ts` | 合作民宿（模組二新增）；`discountPercent` 協議折扣、`commission` 退佣規則 |
| `CommissionRule` | `commission.ts` | 退佣規則（模組二新增）；`type: 'percent'\|'per_vehicle_day'` |
| `MonthlyPayout` | `monthly-payout.ts` | 月結撥款記錄（模組二新增）；`partnerId + month + status` |

**車輛狀態機**（`VehicleStatus`）：`available` → `rented` → `available`；隨時可轉 `maintenance`。
**訂單狀態機**（`BookingStatus`）：`pending_payment` → `confirmed` → `in_progress` → `completed`；
任何階段可轉 `cancelled`。只有 `pending_payment`/`confirmed`/`in_progress` 會佔用車輛時段
（見下方 `isVehicleAvailable`）。

`MaintenanceRecord`（保養紀錄）**不在這裡**，只有 admin 內部需要，定義在
`apps/admin/src/app/core/models/index.ts`。

### Repository 介面與 in-browser 實作（`libs/domain/src/lib/repositories/`）

```ts
export interface Repository<T extends { id: string }> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(item: T): T;
  update(id: string, patch: Partial<T>): T;
  remove(id: string): void;
  replaceAll(items: T[]): void;
}
```

`LocalStorageRepository<T>` 是目前唯一的實作：資料序列化進 `localStorage`，
key 統一 `cr.` 前綴（如 `cr.vehicles`、`cr.partners`）。**這是換真後端時唯一要換的地方**——
架構鐵律：元件只經 Store，Store 只依賴這個 `Repository<T>` 介面，不直接碰
`localStorage`；換成打 API 的 `HttpRepository` 實作，Store 跟元件都不用改。

每個 Repository 各自對應一個 `InjectionToken`（`tokens.ts`），app 在 `app.config.ts` 裡
`useFactory` 決定要注入哪個實作 + 哪個 seed 函式（`seed-data.ts`）。

### 純函式（沒有 Angular 依賴，可獨立單元測試）

| 函式 | 檔案 | 用途 |
|---|---|---|
| `calculatePrice()` | `pricing/calculate-price.ts` | 定價引擎，見 `03-pricing-and-commission.md` |
| `isCouponValid()` | `pricing/calculate-price.ts` | 優惠券是否可用（日期/最少天數/車型） |
| `classifyDay()` | `pricing/date-classify.ts` | 某天是 `weekday`/`weekend`/`holiday`/`peak` |
| `calculateCommission()` | `commission/calculate-commission.ts` | 退佣計算，見 `03-pricing-and-commission.md` |
| `isVehicleAvailable()` | `availability/is-vehicle-available.ts` | 某車在某時段是否可租（狀態 + 時間重疊） |
| `rangesOverlap()` | `availability/ranges-overlap.ts` | 兩個時間區間是否重疊（前單 end === 後單 start 視為不重疊，可無縫接續） |

## libs/booking-flow — 共用的五步預約流程

別名 `@car-rental/booking-flow`。這是**booking 和 affiliate 共用同一套 UI**的地方——
兩個 app 的「預約流程」長得一模一樣，只是套用的情境（`FlowMode`）不同。

```
libs/booking-flow/src/lib/
  booking-flow.component.ts   # 流程容器，五個 MatStepper 步驟
  catalog.store.ts            # CatalogStore：算價、驗優惠券、送出訂單
  flow-mode.ts                # FlowMode 型別（模組二新增）
  steps/
    date-step        # 1. 選租期
    vehicle-step      # 2. 選車款
    addon-step         # 3. 選配件
    coupon-step        # 4. 輸入優惠券
    confirm-step        # 5. 填資料確認送出
    done                 # 送出後的完成頁
```

### FlowMode：consumer 與 partner 兩種情境

```ts
export type FlowMode =
  | { kind: 'consumer' }
  | { kind: 'partner'; partner: Partner };
```

`BookingFlowComponent` 用 `mode = input<FlowMode>({ kind: 'consumer' })` 接這個情境，
**預設值是 consumer**，所以 booking app 不用特別傳、行為跟模組二之前完全一致。
affiliate 的 `PartnerBookingComponent` 找到 `Partner` 後傳 `{ kind: 'partner', partner }`：

- 頁首多顯示民宿名稱。
- 呼叫 `CatalogStore.price()`/`submitBooking()` 時多帶 `partnerDiscountPercent`
  （= `partner.discountPercent`），套進 `calculatePrice()` 的協議折扣。
- 送出的訂單多帶 `sourcePartnerId = partner.id`。
- 優惠券步驟兩種模式都保留——協議折扣跟消費者優惠券可以疊加使用。

`CatalogStore`（`catalog.store.ts`）是這個 lib 唯一的 Store，職責：
- `price()` — 包一層呼叫 `calculatePrice()`（domain 純函式）
- `validateCoupon()` — 查優惠券是否存在、是否符合條件
- `submitBooking()` — 檢查車輛可租用（`isVehicleAvailable()`）→ 算價 → 建 `Customer` →
  寫入 `pending_payment` 訂單

## libs/theme-pack — 雙軸主題系統（只有 admin 套用）

別名 `@car-rental/theme-pack`。範式（Paradigm，管造型：圓角/陰影/字體）×
配色（Color-theme，管顏色）兩軸可自由組合，目前提供 Material 範式與 Verdant/Midnight
兩套配色。booking 跟 affiliate **沒有套用**這套系統——它們是免登入的公開/合作夥伴頁面，
定位是資訊型頁面，不需要換膚。

詳細設計、樣式規則（禁止寫死顏色、`.ui-*` class 契約等）、新增配色/範式的步驟，
完整寫在根目錄 `README.md`「雙軸主題系統」一節與
`docs/superpowers/specs/2026-07-15-theme-pack-architecture-design.md`，這裡不重複。
