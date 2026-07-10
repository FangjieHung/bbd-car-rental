# 澎湖租車後台 MVP 設計 spec

日期：2026-07-10
狀態：已與使用者確認（方案 A）

## 目標

為租車行建立內部後台系統 MVP：車輛管理、調度看板、訂單/客戶管理、保養提醒。
繁中單語系、純前端（localStorage 持久化）、部署 GitHub Pages。
消費者端（旅客預訂網站）不在本次範圍；架構須讓 model 與資料存取介面日後可搬用。

## 範圍界定

**做**：
- 車輛管理（CRUD、狀態、里程）
- 調度看板（自製時間軸 + 日曆瀏覽兩種模式）
- 訂單管理（CRUD、衝突偵測、狀態流轉）＋客戶管理（併入訂單模組）
- 保養管理（紀錄 CRUD、里程/日期雙規則到期提醒）
- 總覽 dashboard

**不做**（YAGNI，明確排除）：
- 登入/權限
- 真後端 API、多人同步
- 推播/簡訊通知（提醒只到後台紅點與清單）
- 多語系翻譯庫（僅預留字串集中結構）
- 甘特圖拖拉編輯
- 消費者端

## 技術棧

| 項目 | 選擇 |
|---|---|
| 框架 | Angular 22（standalone、Signals、預設 OnPush/zoneless） |
| Node | 24（專案內 `.nvmrc` 鎖版，不動全域；CLI v22 要求 Node ≥22.22 或 ≥24.15） |
| UI | Angular Material + Tailwind v4（`@tailwindcss/postcss`） |
| 樣式 | SCSS |
| 資料 | localStorage，經 repository 抽象層 |
| 測試 | 內建 unit test runner，核心邏輯 TDD |
| 部署 | GitHub Pages（base href 子路徑，部署後 curl 驗證） |

## 架構

單一 Angular CLI 專案。分層：

```
src/app/
  core/
    models/          # Vehicle, RentalBooking, Customer, MaintenanceRecord, MaintenanceAlert
    repositories/    # Repository<T> 介面 + LocalStorageRepository<T> 實作 + 種子資料
    i18n/zh-tw.ts    # 介面文字常數集中檔（日後上翻譯庫的搬移點）
  stores/            # VehicleStore, BookingStore, CustomerStore, MaintenanceStore（Signal-based）
  features/
    dashboard/
    vehicles/
    dispatch/
    bookings/        # 含客戶管理子頁/dialog
    maintenance/
  shared/            # 共用元件（狀態標籤、確認 dialog 等）
```

原則：
- 元件只讀 store 的 signal/computed，透過 store 方法改狀態。
- store 只依賴 repository **介面**，不直接碰 localStorage——日後換真後端只換實作。
- 車輛狀態轉換單一入口 `VehicleStore.transition()`，禁止元件各自改 `status`。

## 資料模型

```typescript
interface Vehicle {
  id: string;
  plateNumber: string;          // 唯一
  type: 'scooter' | 'car';
  model: string;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  mileage: number;              // 只能遞增
  createdAt: string;            // ISO string（localStorage 存 ISO，store 層轉 Date）
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  idNumber?: string;
  note?: string;
}

interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId: string;
  startTime: string;            // ISO
  endTime: string;              // ISO，必須晚於 startTime
  pickupLocation: string;
  returnLocation: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tire' | 'brake' | 'inspection' | 'other';
  performedAt: string;          // ISO
  mileageAtService: number;
  nextDueMileage?: number;
  nextDueDate?: string;         // ISO
  cost: number;
  notes: string;
}

interface MaintenanceAlert {     // 不落地，computed 即時算
  vehicleId: string;
  ruleType: 'mileage' | 'date';
  threshold: number | string;
  status: 'upcoming' | 'overdue';
}
```

## 功能模組

### `/dashboard` 總覽
- 今日取車/還車清單（依 booking start/end 落在今日）
- 保養警示摘要（overdue 紅、upcoming 黃）
- 車輛狀態統計（各狀態台數）

### `/vehicles` 車輛管理
- Material table：車牌、車型、狀態標籤、里程
- 新增/編輯 dialog；車牌唯一驗證；里程更新只能遞增
- 刪除前檢查：有未完成訂單（confirmed/in_progress）或保養紀錄 → 擋下並說明

### `/dispatch` 調度看板
- **時間軸模式**：CSS grid 自製，橫軸日期（預設今日起 14 天，可前後翻）、縱軸車輛；
  預訂畫色塊（confirmed/in_progress 藍、maintenance 期間灰）；點色塊開 dialog 看詳情
- **日曆瀏覽模式**：月曆格，每日顯示取/還車數與可用車數，點日期列該日明細
- 兩模式以 toggle 切換，狀態記在 URL query param

### `/bookings` 訂單管理
- 訂單 CRUD；建/改單時即時衝突偵測，衝突時列出衝突訂單編號與時段
- 狀態流轉：confirmed → in_progress（取車）→ completed（還車）；任一狀態可 → cancelled（completed 除外）
- 取車時同步車輛狀態 → rented、還車 → available（經 VehicleStore.transition）
- 客戶管理：訂單模組內子頁 `/bookings/customers`，CRUD + 建單時可即建客戶

### `/maintenance` 保養管理
- 保養紀錄 CRUD（含 nextDueMileage / nextDueDate）
- 送修/完修操作驅動車輛狀態 available ⇄ maintenance
- 提醒清單（computed）：
  - 里程規則：車輛里程 ≥ nextDueMileage − 300 → upcoming；≥ nextDueMileage → overdue
  - 日期規則：今日 ≥ nextDueDate − 7 天 → upcoming；≥ nextDueDate → overdue
  - 兩規則獨立判斷、都列出（取先到者呈現在 dashboard 摘要）

## 核心邏輯規格

### 衝突偵測
```
isVehicleAvailable(vehicleId, start, end, bookings):
  無任何 b 滿足：
    b.vehicleId === vehicleId
    && b.status !== 'cancelled' && b.status !== 'completed'
    && start < b.endTime && end > b.startTime
```
邊界：頭尾相接（end === b.startTime）不算衝突。

### 車輛狀態機
```
available → reserved   （訂單 confirmed 且時段臨近，或手動保留）
reserved  → rented     （取車）
rented    → available  （還車）
available → maintenance（送修）
maintenance → available（完修）
```
非法轉換（如 rented → maintenance）由 `transition()` 丟錯誤，UI 顯示訊息。

## 錯誤處理與邊界

- localStorage 解析失敗 → 清空該 key、重灌種子資料、snackbar 提示
- 首次載入自動注入種子資料（約 6 台車、8 筆訂單、4 筆保養紀錄，涵蓋各狀態與提醒情境）
- 表單驗證：必填、車牌唯一、endTime > startTime、里程遞增
- 空狀態：各清單無資料時顯示引導文字與建立按鈕

## 測試與驗收標準

1. 核心邏輯（衝突偵測含頭尾相接邊界、狀態機非法轉換、保養雙規則、LocalStorageRepository 序列化往返）單元測試全過
2. `ng build` exit 0
3. 主流程實跑：建車 → 建客戶 → 建單（含製造一次衝突被擋）→ 取車 → 還車 → 建保養紀錄 → 里程推進觸發提醒
4. 390px 手機寬抽查 dashboard 與調度看板不破版
5. GitHub Pages 部署：base href 等於子路徑、首頁 200、抽查 1 個 js 資源 200
