# libs/ 共用了什麼

三個 app（admin/booking/affiliate）不是各自獨立寫一份邏輯，而是共用 `libs/` 底下的幾個庫。
改 `libs/` 的東西會同時影響所有引用它的 app，這是這份文件存在的原因——先搞清楚
「這段邏輯是誰的」，再決定要改哪裡。

## libs/domain — 全系統共用的資料模型與純函式

別名 `@car-rental/domain`（見根目錄 `tsconfig.base.json` 的 `paths`）。這是**沒有 UI**、
不依賴任何特定 app 的一層，三個 app 都直接 import 它。

### Model（`libs/domain/src/lib/models/`）

| Model | 檔案 | 說明 |
|---|---|---|
| `Vehicle` | `vehicle.ts` | 車輛；`category` 是 `car\|scooter\|ev`，`status` 是狀態機（見下）、`branchId` 存所在據點 id |
| `Member` | `member.ts` | 承租人基本資料；`kind` 分本國人／外國旅客／持居留證者。刻意不存證件圖檔或驗證狀態，那是 `IdentityDocument`/`DriverCredential` 的責任（可跨訂單重用，經 `memberId` 反參照） |
| `RentalOrder` | `rental-order.ts` | 訂單；`status` 是狀態機、`pickupBranchId`/`returnBranchId` 存據點 id、`sourcePartnerId` 標記來源民宿（模組二新增） |
| `RentalBranch` / `BranchType` | `branch.ts` | 具體據點（機場櫃檯、馬公中正門市…），車輛所在據點、取車據點、還車據點共用同一份清單；`BranchType` 只是分類，不能當地址 |
| `PricingPlan` / `SeasonCalendar` | `pricing-plan.ts` | 定價方案（依車型、依日型費率、天數累折級距）與假日/旺季日曆 |
| `AddOn` | `add-on.ts` | 配件（單價 + 計價單位 `per_rental`/`per_day`） |
| `Coupon` | `coupon.ts` | 優惠券（`percent`/`amount`，可限車型/最少天數/有效期） |
| `InsurancePlan` | `insurance-plan.ts` | 保險方案（每日起價、保障項目），計入 `PriceBreakdown.insuranceSubtotal` |
| `PriceBreakdown` | `price-breakdown.ts` | `calculatePrice()` 的輸出，見 `03-pricing-and-commission.md` |
| `PaymentRecord` | `payment-record.ts` | 付款分類帳的單筆紀錄（`purpose: deposit\|balance\|adjustment`、`status` 有 `pending\|confirmed\|failed\|voided`）；訂單目前已付多少一律靠掃這本帳算，不看 `OrderStatus` |
| `ContractVersion` | `contract-version.ts` | 某一時點訂單條款的不可變快照（承租人、車輛、租期、費用皆存文字快照，不怕後續資料異動回頭改到舊合約） |
| `HandoverRecord` | `handover-record.ts` | 取車或還車的完整紀錄：時間、里程、能源讀數、照片、證件核對、雙方簽署確認 |
| `CancellationCase` | `cancellation-case.ts` | 取消案件：責任歸屬（顧客／不可抗力／業者過失／業者故意）、退費試算、最終了結方式 |
| `IdentityDocument` / `DriverCredential` | `identity-document.ts` | 身分證明文件與駕駛資格，存於會員層可跨訂單重用；`DriverCredential` 含外國旅客的駕照互惠資格查核狀態 |
| `CustomerCreditLedgerEntry` | `customer-credit.ts` | 會員購物金帳本，append-only，餘額由所有 entry 加總推導 |
| `OperatorRecoveryCase` | `operator-recovery-case.ts` | 業者責任救單案件：同級調車／免費升等／同業轉單三種補救方案依序嘗試的紀錄 |
| `AuditEntry` | `audit-entry.ts` | 操作稽核紀錄：誰、何時、對哪個實體做了什麼 |
| `ReminderStatus` | `reminder-status.ts` | 還車提醒（前 24 小時／前 2 小時）的排程狀態，實際寄送邏輯在後端 |
| `Partner` | `partner.ts` | 合作民宿（模組二新增）；`discountPercent` 協議折扣、`commission` 退佣規則 |
| `CommissionRule` | `commission.ts` | 退佣規則（模組二新增）；`type: 'percent'\|'per_vehicle_day'` |
| `MonthlyPayout` | `monthly-payout.ts` | 月結撥款記錄（模組二新增）；`partnerId + month + status` |
| `SelectOption<T>` | `select-option.ts` | 下拉選單共用的「值＋預設繁中標籤」形狀，本頁與各業務 model 的選項常數（`PAYMENT_PREFERENCE_OPTIONS`、`BRANCH_TYPE_OPTIONS`…）都用它 |

以上列的是目前規模較大的 model；完整、隨時最新的清單以 `libs/domain/src/index.ts` 的實際匯出
內容為準，改動前務必核對。表中偏後段那批（`PaymentRecord` 到 `ReminderStatus`）主要支援 admin
訂單詳情頁的收款／合約／交車／取消／稽核等分頁（見 `01-apps.md`「訂單頁面化」）。

**車輛狀態機**（`VehicleStatus`）：`available` → `rented` → `available`；隨時可轉 `maintenance`。
**訂單狀態機**（`OrderStatus`）：只有 `reserved`／`in_progress`／`completed`／`cancelled`
四個值，只描述車輛交接進度，**不代表付款是否完成**——付款狀態改由 `PaymentRecord` 分類帳獨立
追蹤（見上表）。只有 `reserved`/`in_progress` 會佔用車輛時段（見下方 `isVehicleAvailable`）。
舊資料裡的 `pending_payment`/`confirmed` 是已淘汰的 legacy 值，讀取時由
`normalize-rental-order.ts` 統一遷移為 `reserved`，不會出現在應用程式邏輯裡；完整設計脈絡見
`04-booking-flow.md`。

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
| `rentalDaysOf()` | `commission/rental-days.ts` | 租期天數（優先用報價明細的晚數，缺報價才 fallback 算時間差），admin 與 affiliate 對帳共用 |
| `isVehicleAvailable()` | `availability/is-vehicle-available.ts` | 某車在某時段是否可租（狀態 + 時間重疊） |
| `rangesOverlap()` | `availability/ranges-overlap.ts` | 兩個時間區間是否重疊（前單 end === 後單 start 視為不重疊，可無縫接續） |
| `needsDispatch()` | `models/branch.ts` | 取車據點與車輛所在據點是否不同（任一邊未知時保守回傳 false） |
| `evaluateContractChange()` | `contracts/contract-versioning.ts` | 比對合約快照前後版本，判斷是否構成重大異動（須產生新版本、使已簽署版本失效） |
| `contractSigningState()` | `contracts/contract-signing-state.ts` | 一筆訂單的合約簽署狀態：`none`/`unsigned`/`signed`/`needs_resign` |
| `evaluatePickupReadiness()` | `handover/evaluate-pickup-readiness.ts` | 取車前檢查（訂金門檻、合約簽署、證件、互惠資格、車輛狀態），分類一般人員不得放行的阻擋原因 |
| `calculateReturnCharges()` | `handover/calculate-return-charges.ts` | 還車逾時費與能源補繳費試算，可由主管手動調整金額 |
| `quoteCancellation()` | `cancellation/quote-cancellation.ts` | 依責任歸屬（顧客／不可抗力／業者過失／業者故意）試算取消退費 |
| `calculatePaymentSummary()` | `payments/calculate-payment-summary.ts` | 掃過付款分類帳＋退款＋加收，算出應收總額、已付淨額、餘額與付款狀態 |

## libs/booking-flow — 共用的預約流程

別名 `@car-rental/booking-flow`。這是**booking 和 affiliate 共用同一套 UI**的地方——
兩個 app 的「預約流程」長得一模一樣，只是套用的情境不同。流程本身是四個獨立路由頁
（搜尋 → 下單 → 付款 → 完成），不是單一元件裡的精靈步驟；完整設計決策見
[`04-booking-flow.md`](./04-booking-flow.md)，這裡只列這個 lib 裝了什麼、誰在用。

```
libs/booking-flow/src/lib/
  pages/               # 五個路由頁：search / plan / order / payment / done
  components/          # 頁面用的展示元件：order-summary-card、search-criteria-bar
  steps/               # 被頁面組合的展示元件（date-step、vehicle-step、addon-step、
                        # coupon-step、confirm-step），以及 done（完成頁，實際是路由頁）
  i18n/                 # 官網多語系（BookingFlowI18n、三語字典、語言切換器）
  booking-context.ts    # BOOKING_CONTEXT：夥伴身分與導頁前綴
  quote.service.ts      # QuoteService：報價計算
  catalog.store.ts      # CatalogStore：資料存取與訂單寫入
  date-range.ts         # DateRange 型別
```

**夥伴身分靠 `BOOKING_CONTEXT` injection token 注入**，不是 input：

```ts
interface BookingContext {
  partner: Signal<Partner | null>;   // 消費者情境恆為 null
  basePath: Signal<string[]>;        // ['/'] 或 ['/p', slug]
}
```

booking app 不提供，吃 root 預設值（consumer）；affiliate 的 `PartnerShellComponent`
在元件層 `providers` 提供夥伴版本，讓子路由的四個頁面都能讀到 `Partner` 與正確的導頁前綴。

**`QuoteService` 與 `CatalogStore` 分工**：`QuoteService`（`quote.service.ts`）是唯一算價
入口，搜尋頁與下單頁都靠它試算，內部包一層 `CatalogStore.price()`；`CatalogStore`
（`catalog.store.ts`）負責資料存取與寫入，職責：
- `price()` — 包一層呼叫 `calculatePrice()`（domain 純函式）
- `validateCoupon()` — 查優惠券是否存在、是否符合條件
- `submitBooking()` — 檢查車輛可租用（`isVehicleAvailable()`）→ 算價 → 建 `Member` →
  寫入 `status: 'reserved'` 的訂單
- `markBookingPaid()` — 付款成功後呼叫，**不改動** `booking.status`（履約狀態本來就不代表
  付款進度），只在付款分類帳（`PAYMENT_REPO`）追加一筆 `purpose: 'balance'`、
  `status: 'confirmed'` 的付款紀錄；冪等性靠查有無該訂單的 confirmed balance 紀錄判斷，
  完整脈絡見 `04-booking-flow.md`

`admin` 也直接引用這個 lib 的 `DateStepComponent`、`VehicleStepComponent`、`DateRange`
（分別用在 dashboard 與選車 dialog），所以改這三者的 input/output 會同時影響 admin。

`plan-page.component.ts`（選保險方案）掛在 `vehicle/:vehicleId/plan`，是 search 與 order
之間的一步；它在 2026-09-18 到 09-23 之間曾被暫時從路由拿掉，期間官網的保費一律算成 0。

## libs/contract-signing — 合約檢視與簽署（admin 使用，設計上供官網共用）

別名 `@car-rental/contract-signing`。從 admin 的建單／訂單詳情流程抽出來的「看合約條文＋簽
名」共用元件庫，只依賴 `@car-rental/domain` 與 Angular／Material，**不依賴任何 apps/\* 的
程式碼**，因此官網日後要接上時可以直接引用（目前尚未接，見 `04-booking-flow.md`「已知缺
口」）。只負責顯示合約與擷取簽名，不呼叫任何合約 store——拿到簽名資產紀錄後完成簽署是呼叫端
的職責。

| 匯出 | 用途 |
|---|---|
| `ContractSigningDialogComponent` / `openContractSigningDialog()` | 簽署用 dialog：合約條文（可捲動）→ 簽名板 → 取消／確認簽署，寬螢幕大尺寸、手機全螢幕 |
| `ContractDocumentComponent` | 純展示一份 `ContractSnapshot` |
| `SignaturePadComponent` | 手寫（canvas）／打字簽名，存檔後只 emit 不透明的資產紀錄 |

admin 的建單第四步（`/orders/new` 的「合約」步驟）與訂單詳情的合約分頁共用同一個
簽署 dialog。完整匯出清單與消費端需提供的 token 見 `libs/contract-signing/README.md`。

## libs/order-form — 建單積木層（admin 使用，設計上供官網共用）

別名 `@car-rental/order-form`。依 ADR 0001，官網與櫃檯**不共用外層流程**（admin 是 stepper 單頁、官網是可分享的
網址頁），只共用這一層積木：

| 匯出 | 用途 |
|---|---|
| `createOrderForm()`、`orderFormInitialFromOrder()` 等 | 型別化 FormGroup 定義、初始值、欄位連動 |
| `createOrderFormDerived()`、`orderFormProblems()`、`orderIncompleteItems()` | 報價、衝突、訂金上限等衍生狀態；送出前檢查與待補項目 |
| `buildContractSnapshot()`、`sameContractTerms()` | 由表單組合約快照、比對條款（先簽後建） |
| `lib-order-rental-section` 等五個區塊元件 | 租期與車輛、承租人、費用、款項、合約 |
| `ORDER_FORM_DATA`、`ORDER_SUBMIT_GATEWAY`、`ORDER_FORM_LABELS` | 使用端必須提供的參考資料、送出實作、文案與日期格式 |

這個 lib **不帶任何文案**：admin 以 `ZH_TW` 的對應分組提供 `ORDER_FORM_LABELS`
（`apps/admin/src/app/features/orders/data/provide-admin-order-form.ts`），官網日後接上時由它自己的字典提供。
只依賴 `domain`、`contract-signing` 與 Angular／Material，不依賴任何 apps/\* 的程式碼。

## libs/theme-pack — 雙軸主題系統（只有 admin 套用）

別名 `@car-rental/theme-pack`。質地（Paradigm，管造型：圓角/陰影/字體）×
配色（Color-theme，管顏色）兩軸可自由組合，目前提供 Material 質地與 Verdant/Midnight
兩套配色。booking 跟 affiliate **沒有套用**這套系統——它們是免登入的公開/合作夥伴頁面，
定位是資訊型頁面，不需要換膚。

詳細設計、樣式規則（禁止寫死顏色、`.ui-*` class 契約等）、新增配色/質地的步驟，
完整寫在根目錄 `README.md`「雙軸主題系統」一節，class 契約完整列表見
`libs/theme-pack/src/lib/styles/CONTRACT.md`，這裡不重複。
