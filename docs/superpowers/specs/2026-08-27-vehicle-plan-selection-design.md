# 選車詳情／保險方案頁設計（plan 頁 + 付款分流）

日期：2026-08-27
狀態：待實作

## 背景與目標

目前 `search` → `order/:vehicleId` → `pay/:bookingId` → `done/:id` 四段路由已經存在（見 [2026-08-18-booking-flow-split-design.md](./2026-08-18-booking-flow-split-design.md)）。現在要在 `search` 與 `order/:vehicleId` 之間插入一個新頁面：使用者選定車輛後，先看到「車輛詳情 + 保險方案選擇 + 燃油/里程/付款方式資訊 + 費用試算」，按「下一步」才進入既有的 addon/coupon/confirm 單頁式 checkout。

同時要讓「送出訂單後導去哪裡」依付款方式分流：現場付款（現金）不必經過模擬金流頁，直接看訂單成立頁；其他付款方式維持現況先進 `pay/:bookingId`。

## 範圍界線

**改**：`libs/domain` 的 model 與 `calculate-price`；`libs/booking-flow` 新增一個頁面、`OrderSummaryCardComponent` 改版、`ConfirmStepComponent`／`OrderPageComponent` 的付款分流；`apps/booking` 與 `apps/affiliate` 的路由；`seed-data.ts` 補測試資料。

**不改**：`vehicle-step.component`（車輛列表卡片）、`addon-step`／`coupon-step`（維持現況）、`PaymentPageComponent`／`DoneComponent`（既有金流/完成頁邏輯不動，只是多一條不經過它們的路徑）。

**不在範圍**：真正金流串接、後台管理保險方案的 CRUD 介面（保險方案先當 seed data 寫死）。

## 路由設計

在 `search` 與 `order/:vehicleId` 之間插入 `vehicle/:vehicleId/plan`，query params 沿用 `start`/`end`/`group`：

```
consumer                                   partner
/vehicle/:vehicleId/plan?start=&end=       /p/:slug/vehicle/:vehicleId/plan?start=&end=
```

`SearchPageComponent` 選車後導頁目標從 `order/:vehicleId` 改成 `vehicle/:vehicleId/plan`（[search-page.component.ts](../../../libs/booking-flow/src/lib/pages/search-page.component.ts) 內的 `router.navigate` 呼叫）。

新頁 `PlanPageComponent` 按「下一步」導向既有 `order/:vehicleId`，額外帶 `planId` 這個 query param：

```ts
this.router.navigate([...this.context.basePath(), 'order', vehicle.id], {
  queryParams: { start, end, group, planId: selectedPlanId },
});
```

`vehicleId`/`start`/`end` 缺一，或該車查無資料 → 導回 `search`（比照 order-page 現有的 `ensureValidOrRedirect` 模式）。

## Domain model 異動（`libs/domain/src/lib/models/`）

**新檔 `insurance-plan.ts`**：

```ts
export interface InsuranceCoverageItem {
  name: string;              // 例：租車自負額、第三人責任險
  deductibleMin: number;
  deductibleMax: number;
  currency: string;          // 例：'JPY'
}

export interface InsurancePlan {
  id: string;
  name: string;               // 基本保障
  dailyPriceFrom: number;     // 662
  tags: string[];             // ['有自負額', '最低保障']
  coverageItems: InsuranceCoverageItem[];
  detailsUrl?: string;        // 「查看保險詳情」連結，無值時不渲染連結
}
```

`models/index.ts` 補一行 `export * from './insurance-plan';`。

**`vehicle.ts` 新增欄位**（比照既有 `Transmission` 的 union type + label map 慣例，唯讀展示用，不做互動）：

```ts
export type FuelPolicy = 'full_to_full' | 'full_to_empty' | 'same_to_same';
export type MileagePolicy = 'unlimited' | 'limited';
```

`Vehicle` interface 加：`insurancePlans?: InsurancePlan[]`、`fuelPolicy?: FuelPolicy`、`mileagePolicy?: MileagePolicy`。三者皆選填，缺值時 plan 頁對應區塊直接省略（沿用現有「後台未填卡片自動省略欄位」慣例）。

**`price-breakdown.ts`**：

```ts
export interface PriceLineInsurance { planId: string; name: string; amount: number; }
```

`PriceBreakdown` 加 `insurance?: PriceLineInsurance; insuranceSubtotal: number;`。

**`calculate-price.ts`**：input 加 `insurancePlan?: InsurancePlan`。算法比照 `addOnLines`／`addOnSubtotal`——保費是天數 × `dailyPriceFrom` 的固定費用，不吃 tier/partner 折扣（這兩個折扣只作用在 `rentalRaw`／`rentalSubtotal`）：

```ts
const insuranceSubtotal = input.insurancePlan ? input.insurancePlan.dailyPriceFrom * days : 0;
const insurance = input.insurancePlan
  ? { planId: input.insurancePlan.id, name: input.insurancePlan.name, amount: insuranceSubtotal }
  : undefined;
const total = afterPartner - couponDiscount + addOnSubtotal + insuranceSubtotal;
```

**`rental-booking.ts`**：`RentalBooking` 加 `insurancePlanId?: string`。

**`catalog.store.ts`**：`submitBooking` 與 `price`（內部呼叫 `calculatePrice` 的那層）的 input 都加 `insurancePlanId?: string`，內部用它從 `vehicleRepo` 拿到的 `vehicle.insurancePlans` 找出對應 `InsurancePlan` 物件再傳給 `calculatePrice`。找不到對應方案時視為未選保險（`insuranceSubtotal = 0`），不丟例外。

**`quote.service.ts`**：`quote()` input 加 `insurancePlan?: InsurancePlan`，透傳給 `catalog.price(...)`。

## 新頁面 `PlanPageComponent`

位置：`libs/booking-flow/src/lib/pages/plan-page.component.{ts,html,scss}`，selector `app-plan-page`。狀態讀法比照 `OrderPageComponent`（`vehicleId`/`start`/`end`/`group` 走 `toSignal` + `ActivatedRoute`）。

頁面本地狀態：`selectedPlanId = signal<string | null>(null)`（預設選第一個方案）。

版面：

- 左欄：車輛詳情（照片＋「實拍照」標籤、車型類別、車款名稱＋「或同級」徽章、規格列、逾時取車提醒文字＋連結）＋「選擇方案」保險卡（`insurancePlans` 為空陣列時整塊不渲染，`detailsUrl` 有值才渲染「查看保險詳情」連結，`target="_blank"` 開新分頁）＋燃油規定／里程政策／付款方式三個**唯讀**設定列（`fuelPolicy`/`mileagePolicy` 缺值時該列省略；付款方式列固定顯示靜態文字「線上付款」，跟另外兩列同一種 chip 樣式，不可互動——真正的付款方式選擇留給 confirm-step 既有的 radio group，這裡純粹是視覺預告，不產生任何狀態或 query param）。
- 右欄：`OrderSummaryCardComponent`，`[showVehicleHeader]="false"`（見下節），`priceBreakdown` 用 `quote.quote({..., insurancePlan: selectedPlan()})` 算（此時還沒有 addOns，所以「加購項目」金額固定是 0）。
- 底部（或右欄卡片內）「下一步」按鈕：呼叫路由設計節提到的導頁。

## 付款方式與送出後導頁分流

不新增 `PaymentMethod` 列舉值，沿用既有 `'credit_card' | 'line_pay' | 'on_site' | 'bank_transfer'`。plan 頁那顆「線上付款」chip 只是靜態文案（見上節），不影響任何狀態。真正的付款方式選擇仍在 `ConfirmStepComponent` 既有的 radio group，維持現況不改。

**送出後導頁分流**（`OrderPageComponent.onConfirmSubmit`）：

```ts
const booking = this.catalog.submitBooking({ ..., insurancePlanId: this.planId() });
const target = form.paymentMethod === 'on_site'
  ? [...this.context.basePath(), 'done', booking.id]
  : [...this.context.basePath(), 'pay', booking.id];
this.router.navigate(target);
```

`planId` 從 `order-page` 的 query param `planId` 讀出（同一套 `toSignal` 模式），透傳進 `submitBooking`。

`PaymentPageComponent`／`DoneComponent` 本身不用改；`done/:id` 現有邏輯已經會依 `booking.status`（這條分流走過去時仍是 `pending_payment`，因為現金沒有線上扣款這回事）顯示「待人工確認」文案，語意本來就對。

## `OrderSummaryCardComponent` 調整

**`showVehicleHeader` 開關**：加 `@Input() showVehicleHeader = true`。預設 `true`，`order-page` 不用改任何呼叫端就維持現況；`plan-page` 傳 `false`，隱藏 `trip-card__header`（照片＋車名＋車牌）那一塊，只留時間軸。這是對「不再內嵌車輛資訊」的落地方式——用開關做到「plan 頁不重複顯示」，而不是整個拔掉、影響到本來就靠這張卡顯示車輛的 order-page。

**時間軸**：`@Input() returnLocation?: string` 新增（目前只有取車站有 location，還車站沒有）。每個節點補一行固定文字「24小時個人租車」，以及「地圖」連結——用 Google Maps 搜尋連結組字串，不新增 domain 欄位：

```ts
mapUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}
```

卡片加 `ui-card-header`，標題「取車＆還車詳情」。

**付款詳情卡**：標題從「試算明細」改「付款詳情」，卡內第一行「價格」顯示 `priceBreakdown.total`。原本攤平的 line 清單改成兩個可收合分組（用 `signal<boolean>` 控制展開狀態，不用新元件）：

- **基本費用**（金額 = `rentalSubtotal - partnerDiscount + insuranceSubtotal`，即 `calculate-price.ts` 內部 `afterPartner + insuranceSubtotal` 的等價算法——`PriceBreakdown` 沒有直接暴露 `afterPartner`，元件層用既有欄位重算即可，不用改 `PriceBreakdown` 形狀）：展開後是純說明性 bullet list，**沒有個別金額**：「租車費＆保險費」固定文字、`fuelPolicy` 對應 label（沒有就省略）、`mileagePolicy` 對應 label（沒有就省略）、「當地稅費」固定文字。
- **加購項目**（金額 = `addOnSubtotal`）：展開後沿用現有 `addOnLines` 逐項金額顯示，邏輯不變。

`couponDiscount` 繼續獨立一行顯示在兩個分組下方，不併入分組。

總計那行加「Sale N% OFF」徽章，`discountTotal > 0` 才顯示，`N = Math.round((discountTotal / originalTotal) * 100)`（沿用既有 `discountTotal`／`originalTotal` getter，只是現在 `originalTotal` 要一併加回 `insuranceSubtotal`）。

## 路由檔與 barrel export

`apps/booking/src/app/app.routes.ts` 與 `apps/affiliate/src/app/app.routes.ts`（`p/:slug` children 內）都要插入：

```ts
{
  path: 'vehicle/:vehicleId/plan',
  loadComponent: () => import('@car-rental/booking-flow').then((m) => m.PlanPageComponent),
},
```

`libs/booking-flow/src/index.ts` 加 `export * from './lib/pages/plan-page.component';`。

## Seed data

`seed-data.ts` 的 `seedVehicles()` 至少給 1-2 台車補上 `insurancePlans`（含截圖那組「基本保障」範例資料）、`fuelPolicy: 'full_to_full'`、`mileagePolicy: 'unlimited'`，其餘車輛保持不填（驗證「缺值時區塊省略」這條路徑仍正常）。

## 測試計畫

- `calculate-price.spec.ts` 補案例：有/無 `insurancePlan` 時 `insuranceSubtotal`／`total` 正確，且保費不受 tier/partner 折扣影響。
- `catalog.store` 或既有 booking-flow spec：`submitBooking` 帶 `insurancePlanId` 時，`RentalBooking.insurancePlanId` 與 `priceBreakdown.insurance` 正確落地。
- `order-page` 相關 spec（若既有測試涵蓋 `onConfirmSubmit`）：分別驗證 `on_site` 導向 `done/:id`、其他方式導向 `pay/:bookingId`。
- `order-summary-card`：`showVehicleHeader=false` 時不渲染 `trip-card__header`；折扣徽章百分比計算正確。
- Plan 頁：無 `insurancePlans`/`fuelPolicy`/`mileagePolicy` 時對應區塊不渲染；「下一步」導頁帶對的 query params。

視覺驗收比照既有慣例（`npx sass` 編譯 + 靜態 DOM 截圖，或跑 dev server 用 headless Chrome 截圖比對截圖稿）。
