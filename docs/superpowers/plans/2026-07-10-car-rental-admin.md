# 澎湖租車後台 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立租車行內部後台：車輛管理、調度看板（時間軸+日曆）、訂單/客戶管理、保養提醒；純前端 localStorage、繁中單語系、部署 GitHub Pages。

**Architecture:** 單一 Angular 22 專案（standalone + Signals + 預設 OnPush）。資料經 `Repository<T>` 介面 + `LocalStorageRepository<T>` 實作；四個 Signal-based store（Vehicle/Customer/Booking/Maintenance）是狀態唯一入口；五個 lazy route 頁面只讀 store signal、呼叫 store 方法。

**Tech Stack:** Angular 22、Angular Material、Tailwind v4（`@tailwindcss/postcss`）、SCSS、vitest（`ng test` 內建）、Node 24（`.nvmrc`）。

**Spec:** `docs/superpowers/specs/2026-07-10-car-rental-admin-design.md`

## Global Constraints

- Node 24（Angular CLI 22 要求 Node ≥22.22 或 ≥24.15）；專案根放 `.nvmrc`，內容 `24`。不動全域 nvm default。
- 專案名 `penghu-rental-admin`，建在 repo 根（`--directory .`），沿用既有 git repo。
- 所有介面文字取自 `src/app/core/i18n/zh-tw.ts` 的 `ZH_TW` 常數，元件內以 `protected readonly t = ZH_TW;` 使用；**不得**在 template 出現硬寫的中文字串（HTML 屬性除外）。
- 日期欄位在 model 層一律 ISO string；比較時轉 `Date`。
- 元件不得直接讀寫 localStorage 或 repository；一律經 store。
- 車輛 `status` 只能經 `VehicleStore.transition()` 改變。
- macOS 環境：不用 `sed -i` 做批次改檔；長駐程序輸出導檔不接 `| head`。
- 每個 task 結尾 commit，訊息格式 `feat|test|chore: <描述>`。
- 測試指令：`ng test`（vitest，單次執行）。若 CLI 版本行為是 watch 模式，改用 `ng test --watch=false`。

---

### Task 1: 專案骨架（Angular 22 + Material + Tailwind + 路由 shell）

**Files:**
- Create: 專案骨架（`ng new` 產生）、`.nvmrc`、`.postcssrc.json`
- Modify: `src/styles.scss`、`src/app/app.config.ts`、`src/app/app.routes.ts`、`src/app/app.ts`（或 `app.component.ts`，以 CLI 產出為準）

**Interfaces:**
- Produces: 可 build 的 app shell，含 toolbar 導覽與 5 個 lazy route 佔位。後續 task 的路由掛在 `app.routes.ts`。

- [ ] **Step 1: 確認 Node 24 並建立專案**

```bash
cd /Users/fangjiemini/bbd-projects/car-rental
nvm install 24 --no-use 2>/dev/null; nvm use 24
node -v   # 預期 v24.x
echo "24" > .nvmrc
npx @angular/cli@22 new penghu-rental-admin --directory . --skip-git --style=scss --ssr=false --routing
```

預期：`ng new` 成功產出專案（若有互動提問：SSR 選 No、zoneless 用預設）。若因 `docs/` 已存在報 non-empty 錯誤，改為在暫存目錄 `ng new` 後把產出檔案搬進 repo 根（`docs/` 與 `.git` 不動）。

- [ ] **Step 2: 加入 Angular Material**

```bash
ng add @angular/material --skip-confirmation --theme=azure-blue --typography --animations=enabled
```

預期：`package.json` 出現 `@angular/material`；`styles.scss` 或 `angular.json` 引入 prebuilt theme。若旗標不被支援就跑互動模式，選 azure-blue / 啟用 typography / 啟用 animations。

- [ ] **Step 3: 加入 Tailwind v4**

```bash
npm install tailwindcss @tailwindcss/postcss postcss --save-dev
```

Create `.postcssrc.json`:
```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

`src/styles.scss` 最上方加：
```scss
@use "tailwindcss";
```

- [ ] **Step 4: 建立路由與 shell**

`src/app/app.routes.ts`:
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./features/vehicles/vehicles-page.component').then(m => m.VehiclesPageComponent),
  },
  {
    path: 'dispatch',
    loadComponent: () =>
      import('./features/dispatch/dispatch-page.component').then(m => m.DispatchPageComponent),
  },
  {
    path: 'bookings/customers',
    loadComponent: () =>
      import('./features/bookings/customers-page.component').then(m => m.CustomersPageComponent),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./features/bookings/bookings-page.component').then(m => m.BookingsPageComponent),
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./features/maintenance/maintenance-page.component').then(m => m.MaintenancePageComponent),
  },
];
```

本 task 先為 6 個頁面各建最小佔位元件（後續 task 逐一實作），範例（其餘 5 個同型，改 selector/class/文字）：

`src/app/features/dashboard/dashboard-page.component.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  template: `<p class="p-4">dashboard placeholder</p>`,
})
export class DashboardPageComponent {}
```

root 元件（CLI 產出的 `app.ts` / `app.component.ts`）改為 shell：
```typescript
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule],
  template: `
    <mat-toolbar color="primary" class="gap-4 !flex-wrap">
      <span class="font-bold">澎湖租車後台</span>
      <nav class="flex gap-3 text-sm">
        <a routerLink="/dashboard" routerLinkActive="underline">總覽</a>
        <a routerLink="/vehicles" routerLinkActive="underline">車輛管理</a>
        <a routerLink="/dispatch" routerLinkActive="underline">調度看板</a>
        <a routerLink="/bookings" routerLinkActive="underline">訂單管理</a>
        <a routerLink="/maintenance" routerLinkActive="underline">保養管理</a>
      </nav>
    </mat-toolbar>
    <main class="max-w-6xl mx-auto">
      <router-outlet />
    </main>
  `,
})
export class App {}
```
（shell 的中文字串於 Task 2 建立 `ZH_TW` 後回頭改用常數。）

- [ ] **Step 5: 驗證 build 與 serve**

```bash
ng build
```
預期：exit 0。

```bash
ng serve --port 4400 > /tmp/cr-serve.log 2>&1 &
sleep 8
curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:4400/
```
預期：`200`。驗完 `lsof -ti:4400 | xargs -r kill`。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: Angular 22 專案骨架 + Material + Tailwind + 路由 shell"
```

---

### Task 2: Models + i18n 常數

**Files:**
- Create: `src/app/core/models/index.ts`、`src/app/core/i18n/zh-tw.ts`
- Modify: root 元件（shell 文字改用 `ZH_TW`）

**Interfaces:**
- Produces: 全部 domain 型別與 `ZH_TW` 常數。後續所有 task import 這兩個檔案，名稱以下方為準。

- [ ] **Step 1: 建立 models**

`src/app/core/models/index.ts`:
```typescript
export type VehicleType = 'scooter' | 'car';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string;
  status: VehicleStatus;
  mileage: number;
  createdAt: string; // ISO
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idNumber?: string;
  note?: string;
}

export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;
}

export type MaintenanceType = 'oil_change' | 'tire' | 'brake' | 'inspection' | 'other';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  performedAt: string; // ISO
  mileageAtService: number;
  nextDueMileage?: number;
  nextDueDate?: string; // ISO
  cost: number;
  notes: string;
}

export interface MaintenanceAlert {
  vehicleId: string;
  ruleType: 'mileage' | 'date';
  threshold: number | string;
  status: 'upcoming' | 'overdue';
}
```

- [ ] **Step 2: 建立 ZH_TW 常數**

`src/app/core/i18n/zh-tw.ts`:
```typescript
export const ZH_TW = {
  app: { title: '澎湖租車後台' },
  nav: {
    dashboard: '總覽',
    vehicles: '車輛管理',
    dispatch: '調度看板',
    bookings: '訂單管理',
    maintenance: '保養管理',
  },
  common: {
    create: '新增',
    edit: '編輯',
    delete: '刪除',
    save: '儲存',
    cancel: '取消',
    confirm: '確認',
    actions: '操作',
    empty: '目前沒有資料',
    deleteConfirm: '確定要刪除嗎？',
    storageReset: '本機資料格式異常，已重設為示範資料',
  },
  vehicle: {
    title: '車輛管理',
    plateNumber: '車牌',
    type: '車種',
    model: '車型',
    status: '狀態',
    mileage: '里程 (km)',
    typeLabels: { scooter: '機車', car: '汽車' } as Record<string, string>,
    statusLabels: {
      available: '可租借',
      rented: '出租中',
      maintenance: '保養中',
      reserved: '已保留',
    } as Record<string, string>,
    plateDuplicate: '車牌已存在',
    mileageDecrease: '里程不可小於現有值',
    deleteBlocked: '此車輛尚有未完成訂單或保養紀錄，無法刪除',
    invalidTransition: '車輛狀態不允許此操作',
  },
  customer: {
    title: '客戶管理',
    name: '姓名',
    phone: '電話',
    idNumber: '證件號',
    note: '備註',
    newInline: '＋ 新增客戶',
  },
  booking: {
    title: '訂單管理',
    vehicle: '車輛',
    customer: '客戶',
    startTime: '開始時間',
    endTime: '結束時間',
    pickupLocation: '取車地點',
    returnLocation: '還車地點',
    status: '狀態',
    statusLabels: {
      confirmed: '已確認',
      in_progress: '出租中',
      completed: '已完成',
      cancelled: '已取消',
    } as Record<string, string>,
    pickUp: '取車',
    complete: '還車',
    cancelBooking: '取消訂單',
    conflict: '時段衝突，與下列訂單重疊：',
    endBeforeStart: '結束時間必須晚於開始時間',
    invalidTransition: '訂單狀態不允許此操作',
    goCustomers: '客戶管理',
  },
  dispatch: {
    title: '調度看板',
    timeline: '時間軸',
    calendar: '日曆',
    prevRange: '← 前 14 天',
    nextRange: '後 14 天 →',
    prevMonth: '← 上月',
    nextMonth: '下月 →',
    pickups: '取',
    returns: '還',
    available: '可用',
    dayDetail: '當日明細',
    maintenanceBlock: '保養中',
  },
  maintenance: {
    title: '保養管理',
    alerts: '保養提醒',
    records: '保養紀錄',
    type: '項目',
    typeLabels: {
      oil_change: '換機油',
      tire: '輪胎',
      brake: '煞車',
      inspection: '定檢',
      other: '其他',
    } as Record<string, string>,
    performedAt: '保養日期',
    mileageAtService: '保養時里程',
    nextDueMileage: '下次保養里程',
    nextDueDate: '下次保養日期',
    cost: '費用',
    notes: '備註',
    overdue: '已逾期',
    upcoming: '即將到期',
    byMileage: '里程',
    byDate: '日期',
    sendToMaintenance: '送修',
    completeMaintenance: '完修',
    noAlerts: '目前沒有到期提醒',
  },
  dashboard: {
    title: '總覽',
    todayPickups: '今日取車',
    todayReturns: '今日還車',
    alerts: '保養警示',
    statusCounts: '車輛狀態',
    none: '無',
  },
} as const;
```

- [ ] **Step 3: shell 改用常數**

root 元件加 `protected readonly t = ZH_TW;`（import 自 `./core/i18n/zh-tw`），template 中 `澎湖租車後台` → `{{ t.app.title }}`、五個 nav 文字 → `{{ t.nav.dashboard }}` 等。

- [ ] **Step 4: 驗證與 commit**

```bash
ng build   # 預期 exit 0
git add -A && git commit -m "feat: domain models 與 zh-TW 介面文字常數"
```

---

### Task 3: Repository 介面 + LocalStorageRepository（TDD）

**Files:**
- Create: `src/app/core/repositories/repository.ts`、`src/app/core/repositories/local-storage-repository.ts`、`src/app/core/repositories/local-storage-repository.spec.ts`

**Interfaces:**
- Produces:
  - `interface Repository<T extends { id: string }>`：`getAll(): T[]`、`getById(id: string): T | undefined`、`create(item: T): T`、`update(id: string, patch: Partial<T>): T`、`remove(id: string): void`、`replaceAll(items: T[]): void`
  - `class LocalStorageRepository<T> implements Repository<T>`，建構子 `(key: string, seed: () => T[], onReset?: () => void)`

- [ ] **Step 1: 寫失敗測試**

`src/app/core/repositories/local-storage-repository.spec.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageRepository } from './local-storage-repository';

interface Item { id: string; name: string; }
const seed = (): Item[] => [{ id: 's1', name: 'seeded' }];

describe('LocalStorageRepository', () => {
  beforeEach(() => localStorage.clear());

  it('空 storage 時回傳種子資料並寫入', () => {
    const repo = new LocalStorageRepository<Item>('test.items', seed);
    expect(repo.getAll()).toEqual([{ id: 's1', name: 'seeded' }]);
    expect(JSON.parse(localStorage.getItem('test.items')!)).toHaveLength(1);
  });

  it('CRUD 往返', () => {
    const repo = new LocalStorageRepository<Item>('test.items', () => []);
    repo.create({ id: 'a', name: 'A' });
    expect(repo.getById('a')?.name).toBe('A');
    repo.update('a', { name: 'B' });
    expect(repo.getById('a')?.name).toBe('B');
    repo.remove('a');
    expect(repo.getAll()).toEqual([]);
  });

  it('壞 JSON 時重設為種子並呼叫 onReset', () => {
    localStorage.setItem('test.items', '{not json');
    let resetCalled = false;
    const repo = new LocalStorageRepository<Item>('test.items', seed, () => (resetCalled = true));
    expect(repo.getAll()).toEqual(seed());
    expect(resetCalled).toBe(true);
  });

  it('非陣列內容也重設為種子', () => {
    localStorage.setItem('test.items', '{"a":1}');
    const repo = new LocalStorageRepository<Item>('test.items', seed);
    expect(repo.getAll()).toEqual(seed());
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

```bash
ng test
```
預期：FAIL（`local-storage-repository` 模組不存在）。

- [ ] **Step 3: 實作**

`src/app/core/repositories/repository.ts`:
```typescript
export interface Repository<T extends { id: string }> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(item: T): T;
  update(id: string, patch: Partial<T>): T;
  remove(id: string): void;
  replaceAll(items: T[]): void;
}
```

`src/app/core/repositories/local-storage-repository.ts`:
```typescript
import { Repository } from './repository';

export class LocalStorageRepository<T extends { id: string }> implements Repository<T> {
  constructor(
    private readonly key: string,
    private readonly seed: () => T[],
    private readonly onReset?: () => void,
  ) {}

  getAll(): T[] {
    const raw = localStorage.getItem(this.key);
    if (raw === null) return this.reset(false);
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return this.reset(true);
      return parsed as T[];
    } catch {
      return this.reset(true);
    }
  }

  getById(id: string): T | undefined {
    return this.getAll().find(item => item.id === id);
  }

  create(item: T): T {
    this.replaceAll([...this.getAll(), item]);
    return item;
  }

  update(id: string, patch: Partial<T>): T {
    const items = this.getAll();
    const idx = items.findIndex(item => item.id === id);
    if (idx < 0) throw new Error(`not found: ${id}`);
    const updated = { ...items[idx], ...patch };
    items[idx] = updated;
    this.replaceAll(items);
    return updated;
  }

  remove(id: string): void {
    this.replaceAll(this.getAll().filter(item => item.id !== id));
  }

  replaceAll(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  private reset(notify: boolean): T[] {
    const items = this.seed();
    this.replaceAll(items);
    if (notify) this.onReset?.();
    return items;
  }
}
```

- [ ] **Step 4: 跑測試確認通過**

```bash
ng test
```
預期：PASS（4 tests）。

- [ ] **Step 5: Commit**

```bash
git add src/app/core/repositories
git commit -m "feat: Repository 介面與 LocalStorageRepository（含壞資料重設）"
```

---

### Task 4: 種子資料 + injection tokens + app providers

**Files:**
- Create: `src/app/core/repositories/seed-data.ts`、`src/app/core/repositories/tokens.ts`、`src/app/core/repositories/testing.ts`、`src/app/core/date-utils.ts`
- Modify: `src/app/app.config.ts`

**Interfaces:**
- Produces:
  - tokens：`VEHICLE_REPO: InjectionToken<Repository<Vehicle>>`、`CUSTOMER_REPO`、`BOOKING_REPO`、`MAINTENANCE_REPO`
  - `seedVehicles(): Vehicle[]`、`seedCustomers(): Customer[]`、`seedBookings(): RentalBooking[]`、`seedMaintenanceRecords(): MaintenanceRecord[]`
  - date-utils：`startOfDay(d: Date): Date`、`addDays(d: Date, n: number): Date`、`diffDays(a: Date, b: Date): number`（a−b 的整天數）、`isSameDay(a: Date, b: Date): boolean`、`isoAt(daysFromToday: number, hour: number): string`、`fmtDateTime(iso: string): string`（`MM/DD HH:mm`）、`fmtDate(d: Date): string`（`MM/DD`）
  - testing：`createInMemoryRepo<T extends {id:string}>(initial?: T[]): Repository<T>`

- [ ] **Step 1: date-utils（先寫，種子資料要用）**

`src/app/core/date-utils.ts`:
```typescript
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function diffDays(a: Date, b: Date): number {
  return Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isoAt(daysFromToday: number, hour: number): string {
  const d = addDays(startOfDay(new Date()), daysFromToday);
  d.setHours(hour);
  return d.toISOString();
}

const pad = (n: number) => String(n).padStart(2, '0');

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtDate(d: Date): string {
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}
```

- [ ] **Step 2: 種子資料**

`src/app/core/repositories/seed-data.ts`（日期以今日為基準，保證 demo 永遠有「今日取還車」「衝突」「保養提醒」情境）:
```typescript
import { Vehicle, Customer, RentalBooking, MaintenanceRecord } from '../models';
import { isoAt } from '../date-utils';

export function seedVehicles(): Vehicle[] {
  return [
    { id: 'v1', plateNumber: 'ABC-123', type: 'scooter', model: 'Gogoro 3', status: 'available', mileage: 4800, createdAt: isoAt(-90, 9) },
    { id: 'v2', plateNumber: 'DEF-456', type: 'scooter', model: '勁戰六代', status: 'rented', mileage: 12100, createdAt: isoAt(-80, 9) },
    { id: 'v3', plateNumber: 'GHI-789', type: 'car', model: 'Yaris', status: 'available', mileage: 30500, createdAt: isoAt(-70, 9) },
    { id: 'v4', plateNumber: 'JKL-012', type: 'car', model: 'Sienta', status: 'maintenance', mileage: 45200, createdAt: isoAt(-60, 9) },
    { id: 'v5', plateNumber: 'MNO-345', type: 'scooter', model: 'SYM 4MICA', status: 'reserved', mileage: 800, createdAt: isoAt(-30, 9) },
    { id: 'v6', plateNumber: 'PQR-678', type: 'car', model: 'Corolla Cross', status: 'available', mileage: 15900, createdAt: isoAt(-20, 9) },
  ];
}

export function seedCustomers(): Customer[] {
  return [
    { id: 'c1', name: '王小明', phone: '0912-345-678' },
    { id: 'c2', name: '林美惠', phone: '0922-111-222', idNumber: 'A123456789' },
    { id: 'c3', name: '陳大同', phone: '0933-333-444', note: '常客' },
    { id: 'c4', name: '佐藤健', phone: '+81-90-1234-5678', note: '日本旅客' },
  ];
}

export function seedBookings(): RentalBooking[] {
  return [
    { id: 'b1', vehicleId: 'v2', customerId: 'c1', startTime: isoAt(-1, 9), endTime: isoAt(1, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'in_progress' },
    { id: 'b2', vehicleId: 'v5', customerId: 'c2', startTime: isoAt(0, 10), endTime: isoAt(2, 17), pickupLocation: '機場', returnLocation: '馬公門市', status: 'confirmed' },
    { id: 'b3', vehicleId: 'v1', customerId: 'c3', startTime: isoAt(2, 9), endTime: isoAt(4, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'confirmed' },
    { id: 'b4', vehicleId: 'v3', customerId: 'c4', startTime: isoAt(3, 9), endTime: isoAt(6, 12), pickupLocation: '機場', returnLocation: '機場', status: 'confirmed' },
    { id: 'b5', vehicleId: 'v1', customerId: 'c2', startTime: isoAt(-5, 9), endTime: isoAt(-3, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'completed' },
    { id: 'b6', vehicleId: 'v6', customerId: 'c1', startTime: isoAt(0, 14), endTime: isoAt(0, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'confirmed' },
    { id: 'b7', vehicleId: 'v3', customerId: 'c3', startTime: isoAt(-10, 9), endTime: isoAt(-8, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'cancelled' },
    { id: 'b8', vehicleId: 'v6', customerId: 'c4', startTime: isoAt(7, 9), endTime: isoAt(9, 18), pickupLocation: '機場', returnLocation: '機場', status: 'confirmed' },
  ];
}

export function seedMaintenanceRecords(): MaintenanceRecord[] {
  return [
    // v2 里程 12100，門檻 12000 → overdue（里程）
    { id: 'm1', vehicleId: 'v2', type: 'oil_change', performedAt: isoAt(-40, 9), mileageAtService: 9000, nextDueMileage: 12000, cost: 350, notes: '' },
    // v3 里程 30500，門檻 30700 → upcoming（30700-300=30400 ≤ 30500）
    { id: 'm2', vehicleId: 'v3', type: 'oil_change', performedAt: isoAt(-30, 9), mileageAtService: 27700, nextDueMileage: 30700, cost: 1200, notes: '' },
    // v6 日期規則：5 天後到期 → upcoming（7 天內）
    { id: 'm3', vehicleId: 'v6', type: 'inspection', performedAt: isoAt(-175, 9), mileageAtService: 14000, nextDueDate: isoAt(5, 9), cost: 2500, notes: '半年定檢' },
    { id: 'm4', vehicleId: 'v4', type: 'brake', performedAt: isoAt(-2, 9), mileageAtService: 45200, nextDueMileage: 55000, cost: 1800, notes: '前煞車皮更換，維修中' },
  ];
}
```

- [ ] **Step 3: tokens 與 providers**

`src/app/core/repositories/tokens.ts`:
```typescript
import { InjectionToken } from '@angular/core';
import { Vehicle, Customer, RentalBooking, MaintenanceRecord } from '../models';
import { Repository } from './repository';

export const VEHICLE_REPO = new InjectionToken<Repository<Vehicle>>('VEHICLE_REPO');
export const CUSTOMER_REPO = new InjectionToken<Repository<Customer>>('CUSTOMER_REPO');
export const BOOKING_REPO = new InjectionToken<Repository<RentalBooking>>('BOOKING_REPO');
export const MAINTENANCE_REPO = new InjectionToken<Repository<MaintenanceRecord>>('MAINTENANCE_REPO');
```

`src/app/app.config.ts` 的 `providers` 加入（保留 CLI 既有 providers；`provideAnimationsAsync` 若 `ng add @angular/material` 已加就不重複）:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { VEHICLE_REPO, CUSTOMER_REPO, BOOKING_REPO, MAINTENANCE_REPO } from './core/repositories/tokens';
import { LocalStorageRepository } from './core/repositories/local-storage-repository';
import { seedVehicles, seedCustomers, seedBookings, seedMaintenanceRecords } from './core/repositories/seed-data';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...CLI 既有 providers 保留...
    { provide: VEHICLE_REPO, useFactory: () => new LocalStorageRepository('cr.vehicles', seedVehicles) },
    { provide: CUSTOMER_REPO, useFactory: () => new LocalStorageRepository('cr.customers', seedCustomers) },
    { provide: BOOKING_REPO, useFactory: () => new LocalStorageRepository('cr.bookings', seedBookings) },
    { provide: MAINTENANCE_REPO, useFactory: () => new LocalStorageRepository('cr.maintenance', seedMaintenanceRecords) },
  ],
};
```

- [ ] **Step 4: 測試用 in-memory repo**

`src/app/core/repositories/testing.ts`:
```typescript
import { Repository } from './repository';

export function createInMemoryRepo<T extends { id: string }>(initial: T[] = []): Repository<T> {
  let items = [...initial];
  return {
    getAll: () => [...items],
    getById: id => items.find(i => i.id === id),
    create: item => { items.push(item); return item; },
    update: (id, patch) => {
      const idx = items.findIndex(i => i.id === id);
      if (idx < 0) throw new Error(`not found: ${id}`);
      items[idx] = { ...items[idx], ...patch };
      return items[idx];
    },
    remove: id => { items = items.filter(i => i.id !== id); },
    replaceAll: next => { items = [...next]; },
  };
}
```

- [ ] **Step 5: 驗證與 commit**

```bash
ng build && ng test   # 預期都 exit 0（既有測試不受影響）
git add -A && git commit -m "feat: 種子資料、repository tokens、date-utils、測試用 in-memory repo"
```

---

### Task 5: VehicleStore + 狀態機（TDD）

**Files:**
- Create: `src/app/stores/vehicle.store.ts`、`src/app/stores/vehicle.store.spec.ts`

**Interfaces:**
- Consumes: `VEHICLE_REPO`、`BOOKING_REPO`、`MAINTENANCE_REPO`、models
- Produces: `VehicleStore`（`providedIn: 'root'`）:
  - `vehicles: Signal<Vehicle[]>`
  - `statusCounts: Signal<Record<VehicleStatus, number>>`
  - `create(input: { plateNumber: string; type: VehicleType; model: string; mileage: number }): Vehicle`
  - `update(id: string, patch: { plateNumber?: string; model?: string; mileage?: number }): void`
  - `transition(id: string, to: VehicleStatus): void`
  - `remove(id: string): void`
  - 錯誤一律 `throw new Error(<ZH_TW 對應訊息>)`

補充說明（相對 spec 的明確化）：狀態機加入 `available → rented`（未先保留直接取車的走道），spec 其餘轉換不變，`rented → maintenance` 仍為非法。

- [ ] **Step 1: 寫失敗測試**

`src/app/stores/vehicle.store.spec.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { VehicleStore } from './vehicle.store';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../core/repositories/tokens';
import { createInMemoryRepo } from '../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord } from '../core/models';
import { ZH_TW } from '../core/i18n/zh-tw';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return { id: 'v1', plateNumber: 'ABC-123', type: 'scooter', model: 'Gogoro',
    status: 'available', mileage: 100, createdAt: new Date().toISOString(), ...partial };
}

describe('VehicleStore', () => {
  let store: VehicleStore;
  let bookings: RentalBooking[];
  let records: MaintenanceRecord[];

  beforeEach(() => {
    bookings = [];
    records = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        { provide: BOOKING_REPO, useFactory: () => createInMemoryRepo<RentalBooking>(bookings) },
        { provide: MAINTENANCE_REPO, useFactory: () => createInMemoryRepo<MaintenanceRecord>(records) },
      ],
    });
    store = TestBed.inject(VehicleStore);
  });

  it('create 車牌重複要擋', () => {
    expect(() => store.create({ plateNumber: 'ABC-123', type: 'car', model: 'X', mileage: 0 }))
      .toThrowError(ZH_TW.vehicle.plateDuplicate);
  });

  it('里程只能遞增', () => {
    expect(() => store.update('v1', { mileage: 50 })).toThrowError(ZH_TW.vehicle.mileageDecrease);
    store.update('v1', { mileage: 200 });
    expect(store.vehicles()[0].mileage).toBe(200);
  });

  it('合法轉換：available→maintenance→available', () => {
    store.transition('v1', 'maintenance');
    expect(store.vehicles()[0].status).toBe('maintenance');
    store.transition('v1', 'available');
    expect(store.vehicles()[0].status).toBe('available');
  });

  it('非法轉換：rented→maintenance 丟錯', () => {
    store.transition('v1', 'rented');
    expect(() => store.transition('v1', 'maintenance'))
      .toThrowError(ZH_TW.vehicle.invalidTransition);
  });

  it('有未完成訂單不可刪', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([
          { id: 'b1', vehicleId: 'v1', customerId: 'c1', startTime: '2026-07-11T09:00:00Z',
            endTime: '2026-07-12T09:00:00Z', pickupLocation: '', returnLocation: '', status: 'confirmed' },
        ]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>() },
      ],
    });
    const s = TestBed.inject(VehicleStore);
    expect(() => s.remove('v1')).toThrowError(ZH_TW.vehicle.deleteBlocked);
  });

  it('無關聯資料可刪', () => {
    store.remove('v1');
    expect(store.vehicles()).toEqual([]);
  });

  it('statusCounts 統計各狀態', () => {
    expect(store.statusCounts()['available']).toBe(1);
    expect(store.statusCounts()['rented']).toBe(0);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

```bash
ng test
```
預期：FAIL（VehicleStore 不存在）。

- [ ] **Step 3: 實作**

`src/app/stores/vehicle.store.ts`:
```typescript
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Vehicle, VehicleStatus, VehicleType } from '../core/models';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../core/repositories/tokens';
import { ZH_TW } from '../core/i18n/zh-tw';

const ALLOWED: Record<VehicleStatus, VehicleStatus[]> = {
  available: ['reserved', 'rented', 'maintenance'],
  reserved: ['rented', 'available'],
  rented: ['available'],
  maintenance: ['available'],
};

@Injectable({ providedIn: 'root' })
export class VehicleStore {
  private repo = inject(VEHICLE_REPO);
  private bookingRepo = inject(BOOKING_REPO);
  private maintenanceRepo = inject(MAINTENANCE_REPO);

  private _vehicles = signal<Vehicle[]>(this.repo.getAll());
  readonly vehicles: Signal<Vehicle[]> = this._vehicles.asReadonly();

  readonly statusCounts = computed(() => {
    const counts: Record<VehicleStatus, number> = { available: 0, rented: 0, maintenance: 0, reserved: 0 };
    for (const v of this._vehicles()) counts[v.status]++;
    return counts;
  });

  create(input: { plateNumber: string; type: VehicleType; model: string; mileage: number }): Vehicle {
    this.assertPlateUnique(input.plateNumber);
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      ...input,
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    this.repo.create(vehicle);
    this.reload();
    return vehicle;
  }

  update(id: string, patch: { plateNumber?: string; model?: string; mileage?: number }): void {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    if (patch.plateNumber !== undefined && patch.plateNumber !== current.plateNumber) {
      this.assertPlateUnique(patch.plateNumber);
    }
    if (patch.mileage !== undefined && patch.mileage < current.mileage) {
      throw new Error(ZH_TW.vehicle.mileageDecrease);
    }
    this.repo.update(id, patch);
    this.reload();
  }

  transition(id: string, to: VehicleStatus): void {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    if (!ALLOWED[current.status].includes(to)) {
      throw new Error(ZH_TW.vehicle.invalidTransition);
    }
    this.repo.update(id, { status: to });
    this.reload();
  }

  remove(id: string): void {
    const hasActiveBooking = this.bookingRepo.getAll().some(
      b => b.vehicleId === id && (b.status === 'confirmed' || b.status === 'in_progress'),
    );
    const hasRecords = this.maintenanceRepo.getAll().some(r => r.vehicleId === id);
    if (hasActiveBooking || hasRecords) throw new Error(ZH_TW.vehicle.deleteBlocked);
    this.repo.remove(id);
    this.reload();
  }

  reload(): void {
    this._vehicles.set(this.repo.getAll());
  }

  private assertPlateUnique(plate: string): void {
    if (this.repo.getAll().some(v => v.plateNumber === plate)) {
      throw new Error(ZH_TW.vehicle.plateDuplicate);
    }
  }
}
```

- [ ] **Step 4: 跑測試確認通過**

```bash
ng test
```
預期：PASS。

- [ ] **Step 5: Commit**

```bash
git add src/app/stores
git commit -m "feat: VehicleStore 狀態機、車牌唯一、里程遞增、刪除防護"
```

---

### Task 6: CustomerStore

**Files:**
- Create: `src/app/stores/customer.store.ts`、`src/app/stores/customer.store.spec.ts`

**Interfaces:**
- Consumes: `CUSTOMER_REPO`
- Produces: `CustomerStore`：`customers: Signal<Customer[]>`、`create(input: Omit<Customer,'id'>): Customer`、`update(id, patch: Partial<Omit<Customer,'id'>>): void`、`remove(id): void`、`nameOf(id: string): string`（查無回 `'—'`）

- [ ] **Step 1: 寫失敗測試**

`src/app/stores/customer.store.spec.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CustomerStore } from './customer.store';
import { CUSTOMER_REPO } from '../core/repositories/tokens';
import { createInMemoryRepo } from '../core/repositories/testing';
import { Customer } from '../core/models';

describe('CustomerStore', () => {
  let store: CustomerStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>() }],
    });
    store = TestBed.inject(CustomerStore);
  });

  it('CRUD 與 nameOf', () => {
    const c = store.create({ name: '王小明', phone: '0912' });
    expect(store.customers()).toHaveLength(1);
    expect(store.nameOf(c.id)).toBe('王小明');
    expect(store.nameOf('nope')).toBe('—');
    store.update(c.id, { phone: '0999' });
    expect(store.customers()[0].phone).toBe('0999');
    store.remove(c.id);
    expect(store.customers()).toEqual([]);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**（`ng test` → FAIL）

- [ ] **Step 3: 實作**

`src/app/stores/customer.store.ts`:
```typescript
import { Injectable, Signal, inject, signal } from '@angular/core';
import { Customer } from '../core/models';
import { CUSTOMER_REPO } from '../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class CustomerStore {
  private repo = inject(CUSTOMER_REPO);
  private _customers = signal<Customer[]>(this.repo.getAll());
  readonly customers: Signal<Customer[]> = this._customers.asReadonly();

  create(input: Omit<Customer, 'id'>): Customer {
    const customer: Customer = { id: crypto.randomUUID(), ...input };
    this.repo.create(customer);
    this.reload();
    return customer;
  }

  update(id: string, patch: Partial<Omit<Customer, 'id'>>): void {
    this.repo.update(id, patch);
    this.reload();
  }

  remove(id: string): void {
    this.repo.remove(id);
    this.reload();
  }

  nameOf(id: string): string {
    return this._customers().find(c => c.id === id)?.name ?? '—';
  }

  private reload(): void {
    this._customers.set(this.repo.getAll());
  }
}
```

- [ ] **Step 4: 跑測試確認通過**（`ng test` → PASS）

- [ ] **Step 5: Commit**

```bash
git add src/app/stores
git commit -m "feat: CustomerStore"
```

---

### Task 7: BookingStore + 衝突偵測 + 取還車流程（TDD）

**Files:**
- Create: `src/app/stores/booking.store.ts`、`src/app/stores/booking.store.spec.ts`

**Interfaces:**
- Consumes: `BOOKING_REPO`、`VehicleStore`（取還車時轉車輛狀態）
- Produces: `BookingStore`：
  - `bookings: Signal<RentalBooking[]>`
  - `findConflicts(vehicleId: string, startIso: string, endIso: string, excludeId?: string): RentalBooking[]`
  - `create(input: Omit<RentalBooking,'id'|'status'>): RentalBooking` — 驗 `end > start` 與零衝突，衝突訊息含衝突訂單 id
  - `updateBooking(id: string, patch: Partial<Omit<RentalBooking,'id'|'status'>>): void` — 同上驗證（exclude 自己）
  - `pickUp(id: string): void` — confirmed→in_progress，車輛 transition 'rented'
  - `complete(id: string): void` — in_progress→completed，車輛 transition 'available'
  - `cancel(id: string): void` — completed 不可取消；原為 in_progress 時車輛回 available
  - 衝突判定：活動狀態為 `confirmed`/`in_progress`；重疊條件 `start < b.endTime && end > b.startTime`（Date 比較）；頭尾相接不算衝突

- [ ] **Step 1: 寫失敗測試**

`src/app/stores/booking.store.spec.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BookingStore } from './booking.store';
import { VEHICLE_REPO, CUSTOMER_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../core/repositories/tokens';
import { createInMemoryRepo } from '../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord, Customer } from '../core/models';
import { ZH_TW } from '../core/i18n/zh-tw';

const T0 = '2026-07-20T09:00:00.000Z';
const T1 = '2026-07-22T18:00:00.000Z';

function baseInput(partial: Partial<Omit<RentalBooking, 'id' | 'status'>> = {}) {
  return { vehicleId: 'v1', customerId: 'c1', startTime: T0, endTime: T1,
    pickupLocation: '馬公', returnLocation: '馬公', ...partial };
}

describe('BookingStore', () => {
  let store: BookingStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([
          { id: 'v1', plateNumber: 'A-1', type: 'scooter', model: 'X', status: 'available', mileage: 0, createdAt: T0 },
        ]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>() },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>() },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>() },
      ],
    });
    store = TestBed.inject(BookingStore);
  });

  it('end <= start 要擋', () => {
    expect(() => store.create(baseInput({ endTime: T0 })))
      .toThrowError(ZH_TW.booking.endBeforeStart);
  });

  it('重疊時段要擋且訊息含衝突單號', () => {
    const b = store.create(baseInput());
    expect(() =>
      store.create(baseInput({ startTime: '2026-07-21T09:00:00.000Z', endTime: '2026-07-23T09:00:00.000Z' })),
    ).toThrowError(new RegExp(b.id));
  });

  it('頭尾相接不算衝突', () => {
    store.create(baseInput());
    expect(() => store.create(baseInput({ startTime: T1, endTime: '2026-07-23T18:00:00.000Z' })))
      .not.toThrow();
  });

  it('cancelled/completed 不擋新單', () => {
    const b = store.create(baseInput());
    store.cancel(b.id);
    expect(() => store.create(baseInput())).not.toThrow();
  });

  it('取車→還車流程連動車輛狀態', () => {
    const b = store.create(baseInput());
    store.pickUp(b.id);
    expect(store.bookings().find(x => x.id === b.id)!.status).toBe('in_progress');
    store.complete(b.id);
    expect(store.bookings().find(x => x.id === b.id)!.status).toBe('completed');
  });

  it('completed 不可取消', () => {
    const b = store.create(baseInput());
    store.pickUp(b.id);
    store.complete(b.id);
    expect(() => store.cancel(b.id)).toThrowError(ZH_TW.booking.invalidTransition);
  });

  it('出租中取消訂單，車輛回 available', () => {
    const b = store.create(baseInput());
    store.pickUp(b.id);
    store.cancel(b.id);
    const vehicleStore = (store as any).vehicleStore;
    expect(vehicleStore.vehicles()[0].status).toBe('available');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**（`ng test` → FAIL）

- [ ] **Step 3: 實作**

`src/app/stores/booking.store.ts`:
```typescript
import { Injectable, Signal, inject, signal } from '@angular/core';
import { RentalBooking } from '../core/models';
import { BOOKING_REPO } from '../core/repositories/tokens';
import { VehicleStore } from './vehicle.store';
import { ZH_TW } from '../core/i18n/zh-tw';

const ACTIVE: RentalBooking['status'][] = ['confirmed', 'in_progress'];

@Injectable({ providedIn: 'root' })
export class BookingStore {
  private repo = inject(BOOKING_REPO);
  private vehicleStore = inject(VehicleStore);

  private _bookings = signal<RentalBooking[]>(this.repo.getAll());
  readonly bookings: Signal<RentalBooking[]> = this._bookings.asReadonly();

  findConflicts(vehicleId: string, startIso: string, endIso: string, excludeId?: string): RentalBooking[] {
    const start = new Date(startIso);
    const end = new Date(endIso);
    return this.repo.getAll().filter(
      b =>
        b.id !== excludeId &&
        b.vehicleId === vehicleId &&
        ACTIVE.includes(b.status) &&
        start < new Date(b.endTime) &&
        end > new Date(b.startTime),
    );
  }

  create(input: Omit<RentalBooking, 'id' | 'status'>): RentalBooking {
    this.validate(input.vehicleId, input.startTime, input.endTime);
    const booking: RentalBooking = { id: crypto.randomUUID(), ...input, status: 'confirmed' };
    this.repo.create(booking);
    this.reload();
    return booking;
  }

  updateBooking(id: string, patch: Partial<Omit<RentalBooking, 'id' | 'status'>>): void {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    const next = { ...current, ...patch };
    this.validate(next.vehicleId, next.startTime, next.endTime, id);
    this.repo.update(id, patch);
    this.reload();
  }

  pickUp(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'confirmed') throw new Error(ZH_TW.booking.invalidTransition);
    this.vehicleStore.transition(b.vehicleId, 'rented');
    this.repo.update(id, { status: 'in_progress' });
    this.reload();
  }

  complete(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'in_progress') throw new Error(ZH_TW.booking.invalidTransition);
    this.vehicleStore.transition(b.vehicleId, 'available');
    this.repo.update(id, { status: 'completed' });
    this.reload();
  }

  cancel(id: string): void {
    const b = this.mustGet(id);
    if (b.status === 'completed' || b.status === 'cancelled') {
      throw new Error(ZH_TW.booking.invalidTransition);
    }
    if (b.status === 'in_progress') {
      this.vehicleStore.transition(b.vehicleId, 'available');
    }
    this.repo.update(id, { status: 'cancelled' });
    this.reload();
  }

  private validate(vehicleId: string, startIso: string, endIso: string, excludeId?: string): void {
    if (new Date(endIso) <= new Date(startIso)) throw new Error(ZH_TW.booking.endBeforeStart);
    const conflicts = this.findConflicts(vehicleId, startIso, endIso, excludeId);
    if (conflicts.length > 0) {
      throw new Error(`${ZH_TW.booking.conflict} ${conflicts.map(c => c.id).join(', ')}`);
    }
  }

  private mustGet(id: string): RentalBooking {
    const b = this.repo.getById(id);
    if (!b) throw new Error(`not found: ${id}`);
    return b;
  }

  private reload(): void {
    this._bookings.set(this.repo.getAll());
  }
}
```

- [ ] **Step 4: 跑測試確認通過**（`ng test` → PASS）

- [ ] **Step 5: Commit**

```bash
git add src/app/stores
git commit -m "feat: BookingStore 衝突偵測與取還車狀態流轉"
```

---

### Task 8: MaintenanceStore + 提醒規則（TDD）

**Files:**
- Create: `src/app/stores/maintenance.store.ts`、`src/app/stores/maintenance.store.spec.ts`

**Interfaces:**
- Consumes: `MAINTENANCE_REPO`、`VehicleStore`
- Produces: `MaintenanceStore`：
  - `records: Signal<MaintenanceRecord[]>`
  - `alerts: Signal<MaintenanceAlert[]>`（= `alertsAt(new Date())`）
  - `alertsAt(now: Date): MaintenanceAlert[]` — 每台車取最近一筆紀錄（performedAt 最大）；里程規則：`mileage >= nextDueMileage - 300` → upcoming、`>= nextDueMileage` → overdue；日期規則：`now >= nextDueDate - 7天` → upcoming、`now >= nextDueDate` → overdue；兩規則獨立、可同車兩筆
  - `addRecord(input: Omit<MaintenanceRecord,'id'>): MaintenanceRecord`
  - `sendToMaintenance(vehicleId: string): void`（車輛 → maintenance）
  - `completeMaintenance(vehicleId: string, record: Omit<MaintenanceRecord,'id'|'vehicleId'>): void`（新增紀錄 + 車輛 → available）

- [ ] **Step 1: 寫失敗測試**

`src/app/stores/maintenance.store.spec.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MaintenanceStore } from './maintenance.store';
import { VehicleStore } from './vehicle.store';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO, CUSTOMER_REPO } from '../core/repositories/tokens';
import { createInMemoryRepo } from '../core/repositories/testing';
import { Vehicle, RentalBooking, MaintenanceRecord, Customer } from '../core/models';

const NOW = new Date('2026-07-20T12:00:00.000Z');

function setup(vehicles: Vehicle[], records: MaintenanceRecord[]) {
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(vehicles) },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>() },
      { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>() },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>(records) },
    ],
  });
  return TestBed.inject(MaintenanceStore);
}

const vehicle = (mileage: number): Vehicle =>
  ({ id: 'v1', plateNumber: 'A-1', type: 'scooter', model: 'X', status: 'available', mileage, createdAt: '2026-01-01T00:00:00Z' });

const record = (partial: Partial<MaintenanceRecord>): MaintenanceRecord =>
  ({ id: 'm1', vehicleId: 'v1', type: 'oil_change', performedAt: '2026-06-01T00:00:00Z',
    mileageAtService: 1000, cost: 0, notes: '', ...partial });

describe('MaintenanceStore 提醒規則', () => {
  it('里程未達門檻-300：無提醒', () => {
    const s = setup([vehicle(1500)], [record({ nextDueMileage: 2000 })]);
    expect(s.alertsAt(NOW)).toEqual([]);
  });

  it('里程達門檻-300：upcoming', () => {
    const s = setup([vehicle(1700)], [record({ nextDueMileage: 2000 })]);
    expect(s.alertsAt(NOW)).toEqual([
      { vehicleId: 'v1', ruleType: 'mileage', threshold: 2000, status: 'upcoming' },
    ]);
  });

  it('里程達門檻：overdue', () => {
    const s = setup([vehicle(2000)], [record({ nextDueMileage: 2000 })]);
    expect(s.alertsAt(NOW)[0].status).toBe('overdue');
  });

  it('日期 7 天內：upcoming；過期：overdue', () => {
    const s1 = setup([vehicle(0)], [record({ nextDueDate: '2026-07-25T00:00:00.000Z' })]);
    expect(s1.alertsAt(NOW)).toEqual([
      { vehicleId: 'v1', ruleType: 'date', threshold: '2026-07-25T00:00:00.000Z', status: 'upcoming' },
    ]);
    TestBed.resetTestingModule();
    const s2 = setup([vehicle(0)], [record({ nextDueDate: '2026-07-19T00:00:00.000Z' })]);
    expect(s2.alertsAt(NOW)[0].status).toBe('overdue');
  });

  it('只看最近一筆紀錄', () => {
    const s = setup([vehicle(5000)], [
      record({ id: 'old', performedAt: '2026-01-01T00:00:00Z', nextDueMileage: 3000 }),
      record({ id: 'new', performedAt: '2026-06-01T00:00:00Z', nextDueMileage: 9000 }),
    ]);
    expect(s.alertsAt(NOW)).toEqual([]);
  });

  it('送修/完修驅動車輛狀態', () => {
    const s = setup([vehicle(1000)], []);
    const vs = TestBed.inject(VehicleStore);
    s.sendToMaintenance('v1');
    expect(vs.vehicles()[0].status).toBe('maintenance');
    s.completeMaintenance('v1', { type: 'oil_change', performedAt: NOW.toISOString(),
      mileageAtService: 1000, cost: 300, notes: '' });
    expect(vs.vehicles()[0].status).toBe('available');
    expect(s.records()).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**（`ng test` → FAIL）

- [ ] **Step 3: 實作**

`src/app/stores/maintenance.store.ts`:
```typescript
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { MaintenanceAlert, MaintenanceRecord } from '../core/models';
import { MAINTENANCE_REPO } from '../core/repositories/tokens';
import { VehicleStore } from './vehicle.store';

const MILEAGE_WARN_BEFORE = 300;
const DATE_WARN_DAYS = 7;

@Injectable({ providedIn: 'root' })
export class MaintenanceStore {
  private repo = inject(MAINTENANCE_REPO);
  private vehicleStore = inject(VehicleStore);

  private _records = signal<MaintenanceRecord[]>(this.repo.getAll());
  readonly records: Signal<MaintenanceRecord[]> = this._records.asReadonly();

  readonly alerts = computed(() => this.alertsAt(new Date()));

  alertsAt(now: Date): MaintenanceAlert[] {
    const alerts: MaintenanceAlert[] = [];
    for (const vehicle of this.vehicleStore.vehicles()) {
      const latest = this._records()
        .filter(r => r.vehicleId === vehicle.id)
        .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
      if (!latest) continue;

      if (latest.nextDueMileage !== undefined) {
        if (vehicle.mileage >= latest.nextDueMileage) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'mileage', threshold: latest.nextDueMileage, status: 'overdue' });
        } else if (vehicle.mileage >= latest.nextDueMileage - MILEAGE_WARN_BEFORE) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'mileage', threshold: latest.nextDueMileage, status: 'upcoming' });
        }
      }

      if (latest.nextDueDate !== undefined) {
        const due = new Date(latest.nextDueDate);
        const warnFrom = new Date(due.getTime() - DATE_WARN_DAYS * 86_400_000);
        if (now >= due) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'date', threshold: latest.nextDueDate, status: 'overdue' });
        } else if (now >= warnFrom) {
          alerts.push({ vehicleId: vehicle.id, ruleType: 'date', threshold: latest.nextDueDate, status: 'upcoming' });
        }
      }
    }
    return alerts;
  }

  addRecord(input: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord {
    const record: MaintenanceRecord = { id: crypto.randomUUID(), ...input };
    this.repo.create(record);
    this.reload();
    return record;
  }

  sendToMaintenance(vehicleId: string): void {
    this.vehicleStore.transition(vehicleId, 'maintenance');
  }

  completeMaintenance(vehicleId: string, record: Omit<MaintenanceRecord, 'id' | 'vehicleId'>): void {
    this.addRecord({ ...record, vehicleId });
    this.vehicleStore.transition(vehicleId, 'available');
  }

  private reload(): void {
    this._records.set(this.repo.getAll());
  }
}
```

- [ ] **Step 4: 跑測試確認通過**（`ng test` → PASS）

- [ ] **Step 5: Commit**

```bash
git add src/app/stores
git commit -m "feat: MaintenanceStore 里程/日期雙提醒規則與送修完修"
```

---

### Task 9: Shared UI（StatusChip + ConfirmDialog）

**Files:**
- Create: `src/app/shared/status-chip.component.ts`、`src/app/shared/confirm-dialog.component.ts`

**Interfaces:**
- Produces:
  - `StatusChipComponent`（selector `app-status-chip`）：inputs `label: string`（必填）、`tone: 'green'|'blue'|'gray'|'red'|'yellow'`（必填）
  - `ConfirmDialogComponent` + `confirm(dialog: MatDialog, message: string): Promise<boolean>` helper

- [ ] **Step 1: 實作 StatusChip**

`src/app/shared/status-chip.component.ts`:
```typescript
import { Component, input } from '@angular/core';

export type ChipTone = 'green' | 'blue' | 'gray' | 'red' | 'yellow';

const TONE_CLASS: Record<ChipTone, string> = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-200 text-gray-700',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
};

@Component({
  selector: 'app-status-chip',
  template: `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {{ toneClass }}">{{ label() }}</span>`,
})
export class StatusChipComponent {
  readonly label = input.required<string>();
  readonly tone = input.required<ChipTone>();
  get toneClass(): string {
    return TONE_CLASS[this.tone()];
  }
}
```

- [ ] **Step 2: 實作 ConfirmDialog**

`src/app/shared/confirm-dialog.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { ZH_TW } from '../core/i18n/zh-tw';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-content>{{ message }}</div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ t.common.cancel }}</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">{{ t.common.confirm }}</button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  protected readonly t = ZH_TW;
  readonly message = inject<string>(MAT_DIALOG_DATA);
}

export async function confirm(dialog: MatDialog, message: string): Promise<boolean> {
  const ref = dialog.open(ConfirmDialogComponent, { data: message, width: '320px' });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
```

- [ ] **Step 3: 驗證與 commit**

```bash
ng build && ng test   # 預期 exit 0
git add src/app/shared && git commit -m "feat: StatusChip 與 ConfirmDialog 共用元件"
```

---

### Task 10: /vehicles 車輛管理頁

**Files:**
- Create: `src/app/features/vehicles/vehicles-page.component.ts`（覆蓋佔位）、`src/app/features/vehicles/vehicle-form-dialog.component.ts`

**Interfaces:**
- Consumes: `VehicleStore`、`StatusChipComponent`、`confirm()`、`ZH_TW`
- Produces: 完整車輛 CRUD 頁

- [ ] **Step 1: 表單 dialog**

`src/app/features/vehicles/vehicle-form-dialog.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Vehicle } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';

export interface VehicleFormResult {
  plateNumber: string;
  type: Vehicle['type'];
  model: string;
  mileage: number;
}

@Component({
  selector: 'app-vehicle-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ data ? t.common.edit : t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-2 !pt-2">
      <mat-form-field>
        <mat-label>{{ t.vehicle.plateNumber }}</mat-label>
        <input matInput formControlName="plateNumber" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.vehicle.type }}</mat-label>
        <mat-select formControlName="type">
          <mat-option value="scooter">{{ t.vehicle.typeLabels['scooter'] }}</mat-option>
          <mat-option value="car">{{ t.vehicle.typeLabels['car'] }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.vehicle.model }}</mat-label>
        <input matInput formControlName="model" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.vehicle.mileage }}</mat-label>
        <input matInput type="number" formControlName="mileage" />
      </mat-form-field>
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
})
export class VehicleFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<VehicleFormDialogComponent>);
  readonly data = inject<Vehicle | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    plateNumber: [this.data?.plateNumber ?? '', Validators.required],
    type: [this.data?.type ?? ('scooter' as Vehicle['type']), Validators.required],
    model: [this.data?.model ?? '', Validators.required],
    mileage: [this.data?.mileage ?? 0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.valid) this.ref.close(this.form.getRawValue() as VehicleFormResult);
  }
}
```

- [ ] **Step 2: 頁面**

`src/app/features/vehicles/vehicles-page.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Vehicle, VehicleStatus } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { VehicleStore } from '../../stores/vehicle.store';
import { StatusChipComponent, ChipTone } from '../../shared/status-chip.component';
import { confirm } from '../../shared/confirm-dialog.component';
import { VehicleFormDialogComponent, VehicleFormResult } from './vehicle-form-dialog.component';
import { firstValueFrom } from 'rxjs';

const STATUS_TONE: Record<VehicleStatus, ChipTone> = {
  available: 'green', rented: 'blue', maintenance: 'gray', reserved: 'yellow',
};

@Component({
  selector: 'app-vehicles-page',
  imports: [MatTableModule, MatButtonModule, StatusChipComponent],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold">{{ t.vehicle.title }}</h1>
        <button mat-flat-button (click)="openForm(null)">{{ t.common.create }}</button>
      </div>

      @if (store.vehicles().length === 0) {
        <p class="text-gray-500">{{ t.common.empty }}</p>
      } @else {
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="store.vehicles()" class="w-full">
            <ng-container matColumnDef="plateNumber">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.plateNumber }}</th>
              <td mat-cell *matCellDef="let v">{{ v.plateNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.type }}</th>
              <td mat-cell *matCellDef="let v">{{ t.vehicle.typeLabels[v.type] }}</td>
            </ng-container>
            <ng-container matColumnDef="model">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.model }}</th>
              <td mat-cell *matCellDef="let v">{{ v.model }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.status }}</th>
              <td mat-cell *matCellDef="let v">
                <app-status-chip [label]="t.vehicle.statusLabels[v.status]" [tone]="toneOf(v)" />
              </td>
            </ng-container>
            <ng-container matColumnDef="mileage">
              <th mat-header-cell *matHeaderCellDef>{{ t.vehicle.mileage }}</th>
              <td mat-cell *matCellDef="let v">{{ v.mileage }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ t.common.actions }}</th>
              <td mat-cell *matCellDef="let v">
                <button mat-button (click)="openForm(v)">{{ t.common.edit }}</button>
                <button mat-button color="warn" (click)="remove(v)">{{ t.common.delete }}</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
      }
    </div>
  `,
})
export class VehiclesPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly columns = ['plateNumber', 'type', 'model', 'status', 'mileage', 'actions'];

  toneOf(v: Vehicle): ChipTone {
    return STATUS_TONE[v.status];
  }

  async openForm(vehicle: Vehicle | null): Promise<void> {
    const ref = this.dialog.open(VehicleFormDialogComponent, { data: vehicle, width: '400px' });
    const result: VehicleFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      if (vehicle) this.store.update(vehicle.id, result);
      else this.store.create(result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async remove(vehicle: Vehicle): Promise<void> {
    if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
    try {
      this.store.remove(vehicle.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }
}
```

- [ ] **Step 3: 驗證**

```bash
ng build && ng test   # exit 0
ng serve --port 4400 > /tmp/cr-serve.log 2>&1 &
sleep 8
curl -s --max-time 3 http://localhost:4400/ -o /dev/null -w "%{http_code}"   # 200
```
瀏覽器（chrome-devtools-mcp 或手動）打開 `http://localhost:4400/vehicles`：確認種子 6 台車列出、新增/編輯/刪除可用、重複車牌被 snackbar 擋下。驗完殺 port：`lsof -ti:4400 | xargs -r kill`。

- [ ] **Step 4: Commit**

```bash
git add src/app/features/vehicles
git commit -m "feat: 車輛管理頁 CRUD 與驗證"
```

---

### Task 11: /bookings 訂單管理 + 客戶子頁

**Files:**
- Create: `src/app/features/bookings/bookings-page.component.ts`（覆蓋佔位）、`src/app/features/bookings/booking-form-dialog.component.ts`、`src/app/features/bookings/customers-page.component.ts`（覆蓋佔位）、`src/app/features/bookings/customer-form-dialog.component.ts`

**Interfaces:**
- Consumes: `BookingStore`、`VehicleStore`、`CustomerStore`、`StatusChipComponent`、`confirm()`、`fmtDateTime`
- Produces: 訂單 CRUD（含衝突擋單提示）、取車/還車/取消操作、客戶 CRUD 子頁

補充：`datetime-local` input 值（`YYYY-MM-DDTHH:mm`）與 ISO string 互轉——存檔時 `new Date(value).toISOString()`；回填時用下方 `toLocalInputValue()`。

- [ ] **Step 1: 客戶表單 dialog 與客戶子頁**

`src/app/features/bookings/customer-form-dialog.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Customer } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';

@Component({
  selector: 'app-customer-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data ? t.common.edit : t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-2 !pt-2">
      <mat-form-field><mat-label>{{ t.customer.name }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field><mat-label>{{ t.customer.phone }}</mat-label><input matInput formControlName="phone" /></mat-form-field>
      <mat-form-field><mat-label>{{ t.customer.idNumber }}</mat-label><input matInput formControlName="idNumber" /></mat-form-field>
      <mat-form-field><mat-label>{{ t.customer.note }}</mat-label><input matInput formControlName="note" /></mat-form-field>
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
})
export class CustomerFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<CustomerFormDialogComponent>);
  readonly data = inject<Customer | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    phone: [this.data?.phone ?? '', Validators.required],
    idNumber: [this.data?.idNumber ?? ''],
    note: [this.data?.note ?? ''],
  });

  save(): void {
    if (this.form.valid) this.ref.close(this.form.getRawValue());
  }
}
```

`src/app/features/bookings/customers-page.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Customer } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { CustomerStore } from '../../stores/customer.store';
import { confirm } from '../../shared/confirm-dialog.component';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';

@Component({
  selector: 'app-customers-page',
  imports: [MatButtonModule],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold">{{ t.customer.title }}</h1>
        <button mat-flat-button (click)="openForm(null)">{{ t.common.create }}</button>
      </div>
      @if (store.customers().length === 0) {
        <p class="text-gray-500">{{ t.common.empty }}</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2">{{ t.customer.name }}</th>
                <th>{{ t.customer.phone }}</th>
                <th>{{ t.customer.idNumber }}</th>
                <th>{{ t.customer.note }}</th>
                <th>{{ t.common.actions }}</th>
              </tr>
            </thead>
            <tbody>
              @for (c of store.customers(); track c.id) {
                <tr class="border-b">
                  <td class="py-2">{{ c.name }}</td>
                  <td>{{ c.phone }}</td>
                  <td>{{ c.idNumber ?? '—' }}</td>
                  <td>{{ c.note ?? '' }}</td>
                  <td>
                    <button mat-button (click)="openForm(c)">{{ t.common.edit }}</button>
                    <button mat-button color="warn" (click)="remove(c)">{{ t.common.delete }}</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class CustomersPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(CustomerStore);
  private dialog = inject(MatDialog);

  async openForm(customer: Customer | null): Promise<void> {
    const ref = this.dialog.open(CustomerFormDialogComponent, { data: customer, width: '400px' });
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    if (customer) this.store.update(customer.id, result);
    else this.store.create(result);
  }

  async remove(customer: Customer): Promise<void> {
    if (await confirm(this.dialog, this.t.common.deleteConfirm)) this.store.remove(customer.id);
  }
}
```

- [ ] **Step 2: 訂單表單 dialog**

`src/app/features/bookings/booking-form-dialog.component.ts`:
```typescript
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';

export interface BookingFormResult {
  vehicleId: string;
  customerId: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  pickupLocation: string;
  returnLocation: string;
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-booking-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ data ? t.common.edit : t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-2 !pt-2">
      <mat-form-field>
        <mat-label>{{ t.booking.vehicle }}</mat-label>
        <mat-select formControlName="vehicleId">
          @for (v of vehicleStore.vehicles(); track v.id) {
            <mat-option [value]="v.id">{{ v.plateNumber }}（{{ v.model }}）</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.customer }}</mat-label>
        <mat-select formControlName="customerId">
          @for (c of customerStore.customers(); track c.id) {
            <mat-option [value]="c.id">{{ c.name }}（{{ c.phone }}）</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button mat-button type="button" class="self-start" (click)="createCustomer()">
        {{ t.customer.newInline }}
      </button>
      <mat-form-field>
        <mat-label>{{ t.booking.startTime }}</mat-label>
        <input matInput type="datetime-local" formControlName="startLocal" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.endTime }}</mat-label>
        <input matInput type="datetime-local" formControlName="endLocal" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.pickupLocation }}</mat-label>
        <input matInput formControlName="pickupLocation" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.booking.returnLocation }}</mat-label>
        <input matInput formControlName="returnLocation" />
      </mat-form-field>
      @if (error()) {
        <p class="text-red-600 text-sm whitespace-pre-wrap">{{ error() }}</p>
      }
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
})
export class BookingFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<BookingFormDialogComponent>);
  readonly data = inject<RentalBooking | null>(MAT_DIALOG_DATA);
  readonly vehicleStore = inject(VehicleStore);
  readonly customerStore = inject(CustomerStore);
  private dialog = inject(MatDialog);
  private fb = inject(NonNullableFormBuilder);
  readonly error = signal('');

  form = this.fb.group({
    vehicleId: [this.data?.vehicleId ?? '', Validators.required],
    customerId: [this.data?.customerId ?? '', Validators.required],
    startLocal: [this.data ? toLocalInputValue(this.data.startTime) : '', Validators.required],
    endLocal: [this.data ? toLocalInputValue(this.data.endTime) : '', Validators.required],
    pickupLocation: [this.data?.pickupLocation ?? '', Validators.required],
    returnLocation: [this.data?.returnLocation ?? '', Validators.required],
  });

  async createCustomer(): Promise<void> {
    const ref = this.dialog.open(CustomerFormDialogComponent, { data: null, width: '400px' });
    const result = await firstValueFrom(ref.afterClosed());
    if (result) {
      const c = this.customerStore.create(result);
      this.form.patchValue({ customerId: c.id });
    }
  }

  save(): void {
    if (!this.form.valid) return;
    const v = this.form.getRawValue();
    const result: BookingFormResult = {
      vehicleId: v.vehicleId,
      customerId: v.customerId,
      startTime: new Date(v.startLocal).toISOString(),
      endTime: new Date(v.endLocal).toISOString(),
      pickupLocation: v.pickupLocation,
      returnLocation: v.returnLocation,
    };
    this.ref.close(result);
  }

  showError(message: string): void {
    this.error.set(message);
  }
}
```

- [ ] **Step 3: 訂單頁**

`src/app/features/bookings/bookings-page.component.ts`（衝突處理：dialog 關閉後 create 失敗 → 重開 dialog 帶原值並顯示錯誤太複雜，MVP 簡化為 snackbar 顯示衝突訊息）:
```typescript
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { BookingStatus, RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';
import { StatusChipComponent, ChipTone } from '../../shared/status-chip.component';
import { confirm } from '../../shared/confirm-dialog.component';
import { BookingFormDialogComponent, BookingFormResult } from './booking-form-dialog.component';

const STATUS_TONE: Record<BookingStatus, ChipTone> = {
  confirmed: 'yellow', in_progress: 'blue', completed: 'green', cancelled: 'gray',
};

@Component({
  selector: 'app-bookings-page',
  imports: [MatButtonModule, RouterLink, StatusChipComponent],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 class="text-xl font-bold">{{ t.booking.title }}</h1>
        <div class="flex gap-2">
          <a mat-button routerLink="/bookings/customers">{{ t.booking.goCustomers }}</a>
          <button mat-flat-button (click)="openForm(null)">{{ t.common.create }}</button>
        </div>
      </div>
      @if (store.bookings().length === 0) {
        <p class="text-gray-500">{{ t.common.empty }}</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2">{{ t.booking.vehicle }}</th>
                <th>{{ t.booking.customer }}</th>
                <th>{{ t.booking.startTime }}</th>
                <th>{{ t.booking.endTime }}</th>
                <th>{{ t.booking.status }}</th>
                <th>{{ t.common.actions }}</th>
              </tr>
            </thead>
            <tbody>
              @for (b of store.bookings(); track b.id) {
                <tr class="border-b">
                  <td class="py-2">{{ plateOf(b.vehicleId) }}</td>
                  <td>{{ customerStore.nameOf(b.customerId) }}</td>
                  <td>{{ fmt(b.startTime) }}</td>
                  <td>{{ fmt(b.endTime) }}</td>
                  <td><app-status-chip [label]="t.booking.statusLabels[b.status]" [tone]="toneOf(b)" /></td>
                  <td class="whitespace-nowrap">
                    @if (b.status === 'confirmed') {
                      <button mat-button (click)="act(() => store.pickUp(b.id))">{{ t.booking.pickUp }}</button>
                      <button mat-button (click)="openForm(b)">{{ t.common.edit }}</button>
                    }
                    @if (b.status === 'in_progress') {
                      <button mat-button (click)="act(() => store.complete(b.id))">{{ t.booking.complete }}</button>
                    }
                    @if (b.status === 'confirmed' || b.status === 'in_progress') {
                      <button mat-button color="warn" (click)="cancelBooking(b)">{{ t.booking.cancelBooking }}</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class BookingsPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(BookingStore);
  readonly customerStore = inject(CustomerStore);
  private vehicleStore = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly fmt = fmtDateTime;

  plateOf(vehicleId: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === vehicleId)?.plateNumber ?? '—';
  }

  toneOf(b: RentalBooking): ChipTone {
    return STATUS_TONE[b.status];
  }

  act(fn: () => void): void {
    try {
      fn();
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 4000 });
    }
  }

  async cancelBooking(b: RentalBooking): Promise<void> {
    if (await confirm(this.dialog, this.t.common.deleteConfirm)) this.act(() => this.store.cancel(b.id));
  }

  async openForm(booking: RentalBooking | null): Promise<void> {
    const ref = this.dialog.open(BookingFormDialogComponent, { data: booking, width: '440px' });
    const result: BookingFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    this.act(() => {
      if (booking) this.store.updateBooking(booking.id, result);
      else this.store.create(result);
    });
  }
}
```

- [ ] **Step 4: 驗證**

```bash
ng build && ng test   # exit 0
```
實跑 `http://localhost:4400/bookings`（同 Task 10 的 serve/kill 手法）：
1. 種子訂單列出、狀態 chip 正確
2. 建一筆與 b3（v1，2 天後~4 天後）重疊的新單 → snackbar 顯示衝突訊息含單號
3. 對 b2 按「取車」→ 狀態變出租中；到 /vehicles 看 MNO-345 變出租中
4. `/bookings/customers` CRUD 可用

- [ ] **Step 5: Commit**

```bash
git add src/app/features/bookings
git commit -m "feat: 訂單管理頁（衝突擋單、取還車）與客戶子頁"
```

---

### Task 12: /dispatch 調度看板——時間軸模式

**Files:**
- Create: `src/app/features/dispatch/dispatch-page.component.ts`（覆蓋佔位）、`src/app/features/dispatch/timeline-view.component.ts`、`src/app/features/dispatch/booking-detail-dialog.component.ts`
- Test: `src/app/features/dispatch/timeline-view.spec.ts`

**Interfaces:**
- Consumes: `BookingStore`、`VehicleStore`、`CustomerStore`、date-utils
- Produces:
  - `DispatchPageComponent`：view toggle（`timeline`/`calendar`）同步 URL query param `view`；本 task 先只掛 timeline，calendar 佔位
  - `TimelineViewComponent`：14 天 × 車輛 grid；exported pure function `computeBlocks(bookings, vehicleId, rangeStart, days): TimelineBlock[]`
  - `interface TimelineBlock { startCol: number; span: number; kind: 'confirmed' | 'in_progress'; bookingId: string }`（startCol 從 1 起算＝第 1 個日期欄）

- [ ] **Step 1: 寫 computeBlocks 失敗測試**

`src/app/features/dispatch/timeline-view.spec.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { computeBlocks } from './timeline-view.component';
import { RentalBooking } from '../../core/models';

const rangeStart = new Date(2026, 6, 20); // 2026-07-20 local
const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
  id: 'b1', vehicleId: 'v1', customerId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupLocation: '', returnLocation: '', status: 'confirmed', ...partial,
});

describe('computeBlocks', () => {
  it('範圍內的訂單：startCol 依日差、span 含首尾日', () => {
    const blocks = computeBlocks([mk({})], 'v1', rangeStart, 14);
    expect(blocks).toEqual([{ startCol: 2, span: 3, kind: 'confirmed', bookingId: 'b1' }]);
  });

  it('跨範圍起點的訂單被裁切到第 1 欄', () => {
    const blocks = computeBlocks(
      [mk({ startTime: new Date(2026, 6, 15, 9).toISOString(), endTime: new Date(2026, 6, 21, 18).toISOString() })],
      'v1', rangeStart, 14,
    );
    expect(blocks[0].startCol).toBe(1);
    expect(blocks[0].span).toBe(2);
  });

  it('完全在範圍外或 cancelled/completed 不產生 block', () => {
    expect(computeBlocks([mk({ startTime: new Date(2026, 7, 20).toISOString(), endTime: new Date(2026, 7, 22).toISOString() })], 'v1', rangeStart, 14)).toEqual([]);
    expect(computeBlocks([mk({ status: 'cancelled' })], 'v1', rangeStart, 14)).toEqual([]);
    expect(computeBlocks([mk({ vehicleId: 'v2' })], 'v1', rangeStart, 14)).toEqual([]);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**（`ng test` → FAIL）

- [ ] **Step 3: 實作 computeBlocks + TimelineView + 詳情 dialog + dispatch 頁**

`src/app/features/dispatch/booking-detail-dialog.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime } from '../../core/date-utils';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';

@Component({
  selector: 'app-booking-detail-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-content class="text-sm flex flex-col gap-1">
      <p><b>{{ t.booking.vehicle }}</b>：{{ plate }}</p>
      <p><b>{{ t.booking.customer }}</b>：{{ customerStore.nameOf(data.customerId) }}</p>
      <p><b>{{ t.booking.startTime }}</b>：{{ fmt(data.startTime) }}</p>
      <p><b>{{ t.booking.endTime }}</b>：{{ fmt(data.endTime) }}</p>
      <p><b>{{ t.booking.pickupLocation }}</b>：{{ data.pickupLocation }}</p>
      <p><b>{{ t.booking.returnLocation }}</b>：{{ data.returnLocation }}</p>
      <p><b>{{ t.booking.status }}</b>：{{ t.booking.statusLabels[data.status] }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ t.common.confirm }}</button>
    </div>
  `,
})
export class BookingDetailDialogComponent {
  protected readonly t = ZH_TW;
  readonly data = inject<RentalBooking>(MAT_DIALOG_DATA);
  readonly customerStore = inject(CustomerStore);
  private vehicleStore = inject(VehicleStore);
  readonly fmt = fmtDateTime;
  get plate(): string {
    return this.vehicleStore.vehicles().find(v => v.id === this.data.vehicleId)?.plateNumber ?? '—';
  }
}
```

`src/app/features/dispatch/timeline-view.component.ts`:
```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { addDays, diffDays, fmtDate, startOfDay } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { BookingDetailDialogComponent } from './booking-detail-dialog.component';

export interface TimelineBlock {
  startCol: number;
  span: number;
  kind: 'confirmed' | 'in_progress';
  bookingId: string;
}

export function computeBlocks(
  bookings: RentalBooking[],
  vehicleId: string,
  rangeStart: Date,
  days: number,
): TimelineBlock[] {
  const blocks: TimelineBlock[] = [];
  for (const b of bookings) {
    if (b.vehicleId !== vehicleId) continue;
    if (b.status !== 'confirmed' && b.status !== 'in_progress') continue;
    const startIdx = diffDays(new Date(b.startTime), rangeStart);
    const endIdx = diffDays(new Date(b.endTime), rangeStart); // 含結束日
    if (endIdx < 0 || startIdx > days - 1) continue;
    const from = Math.max(startIdx, 0);
    const to = Math.min(endIdx, days - 1);
    blocks.push({ startCol: from + 1, span: to - from + 1, kind: b.status, bookingId: b.id });
  }
  return blocks;
}

const DAYS = 14;

@Component({
  selector: 'app-timeline-view',
  imports: [MatButtonModule],
  template: `
    <div class="flex items-center gap-2 mb-2">
      <button mat-button (click)="shift(-14)">{{ t.dispatch.prevRange }}</button>
      <button mat-button (click)="shift(14)">{{ t.dispatch.nextRange }}</button>
    </div>
    <div class="overflow-x-auto">
      <div class="min-w-[900px]">
        <!-- 表頭列 -->
        <div class="grid" [style.grid-template-columns]="gridCols">
          <div class="text-xs font-bold p-1">{{ t.booking.vehicle }}</div>
          @for (d of days(); track $index) {
            <div class="text-xs text-center p-1 border-l border-gray-100">{{ fmtDate(d) }}</div>
          }
        </div>
        <!-- 每台車一列 -->
        @for (v of vehicleStore.vehicles(); track v.id) {
          <div class="relative border-t border-gray-100">
            <div class="grid" [style.grid-template-columns]="gridCols">
              <div class="text-sm p-2 whitespace-nowrap">
                {{ v.plateNumber }}
                @if (v.status === 'maintenance') {
                  <span class="text-xs text-gray-500">（{{ t.dispatch.maintenanceBlock }}）</span>
                }
              </div>
              @for (d of days(); track $index) {
                <div class="border-l border-gray-100 min-h-10"
                     [class.bg-gray-200]="v.status === 'maintenance' && $index === todayIdx()"></div>
              }
            </div>
            <!-- 色塊層 -->
            <div class="absolute inset-0 grid pointer-events-none" [style.grid-template-columns]="gridCols">
              <div></div>
              @for (block of blocksOf(v.id); track block.bookingId) {
                <button
                  class="pointer-events-auto self-center h-6 rounded text-white text-xs truncate px-1 cursor-pointer"
                  [class.bg-blue-400]="block.kind === 'confirmed'"
                  [class.bg-blue-700]="block.kind === 'in_progress'"
                  [style.grid-column]="(block.startCol + 1) + ' / span ' + block.span"
                  [style.grid-row]="1"
                  (click)="openDetail(block.bookingId)">
                  {{ t.booking.statusLabels[block.kind] }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TimelineViewComponent {
  protected readonly t = ZH_TW;
  readonly vehicleStore = inject(VehicleStore);
  private bookingStore = inject(BookingStore);
  private dialog = inject(MatDialog);
  readonly fmtDate = fmtDate;
  readonly gridCols = `120px repeat(${DAYS}, minmax(48px, 1fr))`;

  readonly rangeStart = signal(startOfDay(new Date()));
  readonly days = computed(() => Array.from({ length: DAYS }, (_, i) => addDays(this.rangeStart(), i)));
  readonly todayIdx = computed(() => diffDays(new Date(), this.rangeStart()));

  shift(n: number): void {
    this.rangeStart.update(d => addDays(d, n));
  }

  blocksOf(vehicleId: string): TimelineBlock[] {
    return computeBlocks(this.bookingStore.bookings(), vehicleId, this.rangeStart(), DAYS);
  }

  openDetail(bookingId: string): void {
    const booking = this.bookingStore.bookings().find(b => b.id === bookingId);
    if (booking) this.dialog.open(BookingDetailDialogComponent, { data: booking, width: '360px' });
  }
}
```

`src/app/features/dispatch/dispatch-page.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { TimelineViewComponent } from './timeline-view.component';

@Component({
  selector: 'app-dispatch-page',
  imports: [MatButtonToggleModule, TimelineViewComponent],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 class="text-xl font-bold">{{ t.dispatch.title }}</h1>
        <mat-button-toggle-group [value]="view()" (change)="setView($event.value)">
          <mat-button-toggle value="timeline">{{ t.dispatch.timeline }}</mat-button-toggle>
          <mat-button-toggle value="calendar">{{ t.dispatch.calendar }}</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
      @if (view() === 'timeline') {
        <app-timeline-view />
      } @else {
        <p class="text-gray-500">calendar（Task 13）</p>
      }
    </div>
  `,
})
export class DispatchPageComponent {
  protected readonly t = ZH_TW;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly view = toSignal(
    this.route.queryParamMap.pipe(map(p => (p.get('view') === 'calendar' ? 'calendar' : 'timeline'))),
    { initialValue: 'timeline' as const },
  );

  setView(view: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { view }, queryParamsHandling: 'merge' });
  }
}
```

- [ ] **Step 4: 跑測試與實跑**

```bash
ng test && ng build   # 都 exit 0
```
實跑 `http://localhost:4400/dispatch`：種子訂單 b1（v2 出租中）、b2/b3/b4/b6/b8 色塊出現在正確車列與日期；點色塊出現詳情 dialog；前後翻 14 天正常。

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dispatch
git commit -m "feat: 調度看板時間軸模式（computeBlocks + 詳情 dialog + view toggle）"
```

---

### Task 13: /dispatch 調度看板——日曆瀏覽模式

**Files:**
- Create: `src/app/features/dispatch/calendar-view.component.ts`
- Modify: `src/app/features/dispatch/dispatch-page.component.ts`（calendar 佔位換成真元件）
- Test: `src/app/features/dispatch/calendar-view.spec.ts`

**Interfaces:**
- Consumes: `BookingStore`、`VehicleStore`、`CustomerStore`、date-utils
- Produces:
  - `CalendarViewComponent`
  - exported pure function `dayStats(bookings: RentalBooking[], totalVehicles: number, day: Date): { pickups: number; returns: number; available: number }` — pickups=活動訂單 startTime 當日數、returns=endTime 當日數、available=總車數−當日被活動訂單佔用的車輛數（distinct）

- [ ] **Step 1: 寫 dayStats 失敗測試**

`src/app/features/dispatch/calendar-view.spec.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { dayStats } from './calendar-view.component';
import { RentalBooking } from '../../core/models';

const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
  id: 'b1', vehicleId: 'v1', customerId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupLocation: '', returnLocation: '', status: 'confirmed', ...partial,
});

describe('dayStats', () => {
  it('取/還/可用數', () => {
    const bookings = [mk({}), mk({ id: 'b2', vehicleId: 'v2', startTime: new Date(2026, 6, 23, 10).toISOString(), endTime: new Date(2026, 6, 25, 10).toISOString() })];
    // 7/21：b1 取車、v1 佔用
    expect(dayStats(bookings, 3, new Date(2026, 6, 21))).toEqual({ pickups: 1, returns: 0, available: 2 });
    // 7/23：b1 還車、b2 取車，v1 v2 都佔用
    expect(dayStats(bookings, 3, new Date(2026, 6, 23))).toEqual({ pickups: 1, returns: 1, available: 1 });
    // 7/26：無事，全可用
    expect(dayStats(bookings, 3, new Date(2026, 6, 26))).toEqual({ pickups: 0, returns: 0, available: 3 });
  });

  it('cancelled/completed 不計', () => {
    expect(dayStats([mk({ status: 'cancelled' })], 3, new Date(2026, 6, 21)))
      .toEqual({ pickups: 0, returns: 0, available: 3 });
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**（`ng test` → FAIL）

- [ ] **Step 3: 實作**

`src/app/features/dispatch/calendar-view.component.ts`:
```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { addDays, fmtDateTime, isSameDay, startOfDay } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';

const ACTIVE: RentalBooking['status'][] = ['confirmed', 'in_progress'];

export function dayStats(
  bookings: RentalBooking[],
  totalVehicles: number,
  day: Date,
): { pickups: number; returns: number; available: number } {
  const active = bookings.filter(b => ACTIVE.includes(b.status));
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const pickups = active.filter(b => isSameDay(new Date(b.startTime), day)).length;
  const returns = active.filter(b => isSameDay(new Date(b.endTime), day)).length;
  const occupied = new Set(
    active
      .filter(b => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart)
      .map(b => b.vehicleId),
  );
  return { pickups, returns, available: totalVehicles - occupied.size };
}

@Component({
  selector: 'app-calendar-view',
  imports: [MatButtonModule],
  template: `
    <div class="flex items-center gap-2 mb-2">
      <button mat-button (click)="shiftMonth(-1)">{{ t.dispatch.prevMonth }}</button>
      <span class="font-bold">{{ monthLabel() }}</span>
      <button mat-button (click)="shiftMonth(1)">{{ t.dispatch.nextMonth }}</button>
    </div>
    <div class="grid grid-cols-7 gap-px bg-gray-200 text-xs">
      @for (d of monthDays(); track d.getTime()) {
        <button
          class="bg-white p-2 min-h-16 text-left cursor-pointer hover:bg-blue-50"
          [class.opacity-40]="d.getMonth() !== month().getMonth()"
          [class.ring-2]="selected() && isSameDay(d, selected()!)"
          (click)="selected.set(d)">
          <div class="font-bold">{{ d.getDate() }}</div>
          <div>{{ t.dispatch.pickups }}{{ statsOf(d).pickups }} {{ t.dispatch.returns }}{{ statsOf(d).returns }}</div>
          <div>{{ t.dispatch.available }} {{ statsOf(d).available }}</div>
        </button>
      }
    </div>
    @if (selected(); as sel) {
      <div class="mt-4">
        <h2 class="font-bold mb-2">{{ t.dispatch.dayDetail }}（{{ sel.getMonth() + 1 }}/{{ sel.getDate() }}）</h2>
        @if (dayBookings(sel).length === 0) {
          <p class="text-gray-500">{{ t.common.empty }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (b of dayBookings(sel); track b.id) {
              <li class="border rounded p-2">
                {{ plateOf(b.vehicleId) }}｜{{ customerStore.nameOf(b.customerId) }}｜
                {{ fmt(b.startTime) }} → {{ fmt(b.endTime) }}｜{{ t.booking.statusLabels[b.status] }}
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export class CalendarViewComponent {
  protected readonly t = ZH_TW;
  private bookingStore = inject(BookingStore);
  private vehicleStore = inject(VehicleStore);
  readonly customerStore = inject(CustomerStore);
  readonly fmt = fmtDateTime;
  readonly isSameDay = isSameDay;

  readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly selected = signal<Date | null>(null);

  readonly monthLabel = computed(() => `${this.month().getFullYear()} / ${this.month().getMonth() + 1}`);

  readonly monthDays = computed(() => {
    const first = this.month();
    const gridStart = addDays(first, -first.getDay()); // 週日開頭
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  });

  shiftMonth(n: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + n, 1));
    this.selected.set(null);
  }

  statsOf(d: Date) {
    return dayStats(this.bookingStore.bookings(), this.vehicleStore.vehicles().length, d);
  }

  dayBookings(d: Date): RentalBooking[] {
    const dayStart = startOfDay(d);
    const dayEnd = addDays(dayStart, 1);
    return this.bookingStore
      .bookings()
      .filter(b => (b.status === 'confirmed' || b.status === 'in_progress'))
      .filter(b => new Date(b.startTime) < dayEnd && new Date(b.endTime) > dayStart);
  }

  plateOf(vehicleId: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === vehicleId)?.plateNumber ?? '—';
  }
}
```

`dispatch-page.component.ts` 修改：import `CalendarViewComponent` 加進 `imports`，template 的 `@else` 佔位改為 `<app-calendar-view />`。

- [ ] **Step 4: 跑測試與實跑**

```bash
ng test && ng build   # 都 exit 0
```
實跑 `/dispatch?view=calendar`：本月格子有取/還/可用數字、點今日出現明細、翻月正常、toggle 切回 timeline 正常。

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dispatch
git commit -m "feat: 調度看板日曆瀏覽模式（dayStats + 當日明細）"
```

---

### Task 14: /maintenance 保養管理頁

**Files:**
- Create: `src/app/features/maintenance/maintenance-page.component.ts`（覆蓋佔位）、`src/app/features/maintenance/maintenance-record-dialog.component.ts`

**Interfaces:**
- Consumes: `MaintenanceStore`、`VehicleStore`、`StatusChipComponent`、`ZH_TW`、`fmtDateTime`
- Produces: 提醒清單（紅/黃）、送修/完修操作、保養紀錄表 + 新增紀錄 dialog

- [ ] **Step 1: 紀錄表單 dialog**

`src/app/features/maintenance/maintenance-record-dialog.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaintenanceRecord, MaintenanceType } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { VehicleStore } from '../../stores/vehicle.store';

export interface RecordFormResult extends Omit<MaintenanceRecord, 'id'> {}

const TYPES: MaintenanceType[] = ['oil_change', 'tire', 'brake', 'inspection', 'other'];

@Component({
  selector: 'app-maintenance-record-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ t.common.create }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="flex flex-col gap-2 !pt-2">
      <mat-form-field>
        <mat-label>{{ t.booking.vehicle }}</mat-label>
        <mat-select formControlName="vehicleId">
          @for (v of vehicleStore.vehicles(); track v.id) {
            <mat-option [value]="v.id">{{ v.plateNumber }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.type }}</mat-label>
        <mat-select formControlName="type">
          @for (mt of types; track mt) {
            <mat-option [value]="mt">{{ t.maintenance.typeLabels[mt] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.performedAt }}</mat-label>
        <input matInput type="date" formControlName="performedDate" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.mileageAtService }}</mat-label>
        <input matInput type="number" formControlName="mileageAtService" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.nextDueMileage }}</mat-label>
        <input matInput type="number" formControlName="nextDueMileage" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.nextDueDate }}</mat-label>
        <input matInput type="date" formControlName="nextDueDate" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.cost }}</mat-label>
        <input matInput type="number" formControlName="cost" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ t.maintenance.notes }}</mat-label>
        <input matInput formControlName="notes" />
      </mat-form-field>
      <div class="flex justify-end gap-2">
        <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
      </div>
    </form>
  `,
})
export class MaintenanceRecordDialogComponent {
  protected readonly t = ZH_TW;
  readonly types = TYPES;
  readonly ref = inject(MatDialogRef<MaintenanceRecordDialogComponent>);
  readonly vehicleStore = inject(VehicleStore);
  /** data: 預選車輛 id（完修流程帶入）；null 為自由新增 */
  readonly data = inject<string | null>(MAT_DIALOG_DATA);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    vehicleId: [this.data ?? '', Validators.required],
    type: ['oil_change' as MaintenanceType, Validators.required],
    performedDate: [new Date().toISOString().slice(0, 10), Validators.required],
    mileageAtService: [0, [Validators.required, Validators.min(0)]],
    nextDueMileage: [null as number | null],
    nextDueDate: [''],
    cost: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  save(): void {
    if (!this.form.valid) return;
    const v = this.form.getRawValue();
    const result: RecordFormResult = {
      vehicleId: v.vehicleId,
      type: v.type,
      performedAt: new Date(v.performedDate).toISOString(),
      mileageAtService: v.mileageAtService,
      nextDueMileage: v.nextDueMileage ?? undefined,
      nextDueDate: v.nextDueDate ? new Date(v.nextDueDate).toISOString() : undefined,
      cost: v.cost,
      notes: v.notes,
    };
    this.ref.close(result);
  }
}
```

- [ ] **Step 2: 頁面**

`src/app/features/maintenance/maintenance-page.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MaintenanceAlert, Vehicle } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime } from '../../core/date-utils';
import { MaintenanceStore } from '../../stores/maintenance.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { MaintenanceRecordDialogComponent, RecordFormResult } from './maintenance-record-dialog.component';

@Component({
  selector: 'app-maintenance-page',
  imports: [MatButtonModule],
  template: `
    <div class="p-4 flex flex-col gap-6">
      <!-- 提醒 -->
      <section>
        <h1 class="text-xl font-bold mb-2">{{ t.maintenance.alerts }}</h1>
        @if (store.alerts().length === 0) {
          <p class="text-gray-500">{{ t.maintenance.noAlerts }}</p>
        } @else {
          <div class="flex flex-col gap-2">
            @for (a of store.alerts(); track a.vehicleId + a.ruleType) {
              <div class="rounded-md p-3 text-sm"
                   [class.bg-red-50]="a.status === 'overdue'"
                   [class.text-red-800]="a.status === 'overdue'"
                   [class.bg-yellow-50]="a.status === 'upcoming'"
                   [class.text-yellow-800]="a.status === 'upcoming'">
                <b>{{ plateOf(a.vehicleId) }}</b>：
                {{ a.status === 'overdue' ? t.maintenance.overdue : t.maintenance.upcoming }}
                （{{ a.ruleType === 'mileage' ? t.maintenance.byMileage : t.maintenance.byDate }}
                {{ a.ruleType === 'mileage' ? a.threshold + ' km' : fmt('' + a.threshold) }}）
              </div>
            }
          </div>
        }
      </section>

      <!-- 車輛送修/完修 -->
      <section>
        <h2 class="font-bold mb-2">{{ t.vehicle.status }}</h2>
        <div class="flex flex-col gap-1">
          @for (v of vehicleStore.vehicles(); track v.id) {
            <div class="flex items-center gap-3 text-sm border-b py-1">
              <span class="w-28">{{ v.plateNumber }}</span>
              <span class="w-20">{{ t.vehicle.statusLabels[v.status] }}</span>
              @if (v.status === 'available') {
                <button mat-button (click)="send(v)">{{ t.maintenance.sendToMaintenance }}</button>
              }
              @if (v.status === 'maintenance') {
                <button mat-button (click)="completeFix(v)">{{ t.maintenance.completeMaintenance }}</button>
              }
            </div>
          }
        </div>
      </section>

      <!-- 紀錄 -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-bold">{{ t.maintenance.records }}</h2>
          <button mat-flat-button (click)="addRecord()">{{ t.common.create }}</button>
        </div>
        @if (store.records().length === 0) {
          <p class="text-gray-500">{{ t.common.empty }}</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left border-b">
                  <th class="py-2">{{ t.booking.vehicle }}</th>
                  <th>{{ t.maintenance.type }}</th>
                  <th>{{ t.maintenance.performedAt }}</th>
                  <th>{{ t.maintenance.mileageAtService }}</th>
                  <th>{{ t.maintenance.nextDueMileage }}</th>
                  <th>{{ t.maintenance.nextDueDate }}</th>
                  <th>{{ t.maintenance.cost }}</th>
                </tr>
              </thead>
              <tbody>
                @for (r of store.records(); track r.id) {
                  <tr class="border-b">
                    <td class="py-2">{{ plateOf(r.vehicleId) }}</td>
                    <td>{{ t.maintenance.typeLabels[r.type] }}</td>
                    <td>{{ fmt(r.performedAt) }}</td>
                    <td>{{ r.mileageAtService }}</td>
                    <td>{{ r.nextDueMileage ?? '—' }}</td>
                    <td>{{ r.nextDueDate ? fmt(r.nextDueDate) : '—' }}</td>
                    <td>{{ r.cost }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
})
export class MaintenancePageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(MaintenanceStore);
  readonly vehicleStore = inject(VehicleStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly fmt = fmtDateTime;

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === id)?.plateNumber ?? '—';
  }

  send(v: Vehicle): void {
    try {
      this.store.sendToMaintenance(v.id);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async completeFix(v: Vehicle): Promise<void> {
    const ref = this.dialog.open(MaintenanceRecordDialogComponent, { data: v.id, width: '420px' });
    const result: RecordFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    try {
      this.store.completeMaintenance(v.id, result);
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }

  async addRecord(): Promise<void> {
    const ref = this.dialog.open(MaintenanceRecordDialogComponent, { data: null, width: '420px' });
    const result: RecordFormResult | undefined = await firstValueFrom(ref.afterClosed());
    if (result) this.store.addRecord(result);
  }
}
```

- [ ] **Step 3: 驗證**

```bash
ng build && ng test   # exit 0
```
實跑 `/maintenance`：種子提醒出現（DEF-456 里程 overdue 紅、GHI-789 里程 upcoming 黃、PQR-678 日期 upcoming 黃）；ABC-123 送修→狀態變保養中→完修（填紀錄）→回可租借且紀錄多一筆。

- [ ] **Step 4: Commit**

```bash
git add src/app/features/maintenance
git commit -m "feat: 保養管理頁（提醒清單、送修完修、紀錄 CRUD）"
```

---

### Task 15: /dashboard 總覽頁

**Files:**
- Create: `src/app/features/dashboard/dashboard-page.component.ts`（覆蓋佔位）

**Interfaces:**
- Consumes: `BookingStore`、`VehicleStore`、`CustomerStore`、`MaintenanceStore`、`isSameDay`、`fmtDateTime`

- [ ] **Step 1: 實作**

`src/app/features/dashboard/dashboard-page.component.ts`:
```typescript
import { Component, computed, inject } from '@angular/core';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { fmtDateTime, isSameDay } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { CustomerStore } from '../../stores/customer.store';
import { MaintenanceStore } from '../../stores/maintenance.store';

@Component({
  selector: 'app-dashboard-page',
  template: `
    <div class="p-4 grid gap-4 md:grid-cols-2">
      <!-- 今日取車 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.todayPickups }}</h2>
        @if (todayPickups().length === 0) {
          <p class="text-gray-500 text-sm">{{ t.dashboard.none }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (b of todayPickups(); track b.id) {
              <li>{{ plateOf(b.vehicleId) }}｜{{ customerStore.nameOf(b.customerId) }}｜{{ fmt(b.startTime) }}</li>
            }
          </ul>
        }
      </section>

      <!-- 今日還車 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.todayReturns }}</h2>
        @if (todayReturns().length === 0) {
          <p class="text-gray-500 text-sm">{{ t.dashboard.none }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (b of todayReturns(); track b.id) {
              <li>{{ plateOf(b.vehicleId) }}｜{{ customerStore.nameOf(b.customerId) }}｜{{ fmt(b.endTime) }}</li>
            }
          </ul>
        }
      </section>

      <!-- 保養警示 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.alerts }}</h2>
        @if (maintenanceStore.alerts().length === 0) {
          <p class="text-gray-500 text-sm">{{ t.maintenance.noAlerts }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (a of maintenanceStore.alerts(); track a.vehicleId + a.ruleType) {
              <li [class.text-red-700]="a.status === 'overdue'" [class.text-yellow-700]="a.status === 'upcoming'">
                {{ plateOf(a.vehicleId) }}：{{ a.status === 'overdue' ? t.maintenance.overdue : t.maintenance.upcoming }}
              </li>
            }
          </ul>
        }
      </section>

      <!-- 車輛狀態 -->
      <section class="border rounded-lg p-4">
        <h2 class="font-bold mb-2">{{ t.dashboard.statusCounts }}</h2>
        <div class="grid grid-cols-2 gap-2 text-sm">
          @for (s of statusKeys; track s) {
            <div class="flex justify-between border rounded px-2 py-1">
              <span>{{ t.vehicle.statusLabels[s] }}</span>
              <b>{{ vehicleStore.statusCounts()[s] }}</b>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class DashboardPageComponent {
  protected readonly t = ZH_TW;
  readonly vehicleStore = inject(VehicleStore);
  readonly customerStore = inject(CustomerStore);
  readonly maintenanceStore = inject(MaintenanceStore);
  private bookingStore = inject(BookingStore);
  readonly fmt = fmtDateTime;
  readonly statusKeys = ['available', 'rented', 'maintenance', 'reserved'] as const;

  readonly todayPickups = computed(() =>
    this.bookingStore.bookings().filter(
      b => b.status === 'confirmed' && isSameDay(new Date(b.startTime), new Date()),
    ),
  );

  readonly todayReturns = computed(() =>
    this.bookingStore.bookings().filter(
      b => b.status === 'in_progress' && isSameDay(new Date(b.endTime), new Date()),
    ),
  );

  plateOf(id: string): string {
    return this.vehicleStore.vehicles().find(v => v.id === id)?.plateNumber ?? '—';
  }
}
```

- [ ] **Step 2: 驗證主流程（spec 驗收第 3 條完整跑一輪）**

```bash
ng build && ng test   # exit 0
```
實跑：清 localStorage 重載 → dashboard 顯示今日取車（b2、b6）與警示 →
建新車 → 建新客戶 → 建單（先做一筆與現有單衝突的確認被擋、再建合法單）→
取車 → 還車 → 建保養紀錄（低門檻 nextDueMileage）→ /vehicles 把該車里程推過門檻 → dashboard/保養頁出現提醒。
390px 寬（devtools 模擬）抽查 dashboard 與 /dispatch 不破版（時間軸容器可橫向捲動、不撐破頁面）。

- [ ] **Step 3: Commit**

```bash
git add src/app/features/dashboard
git commit -m "feat: 總覽頁（今日取還車、警示、狀態統計）"
```

---

### Task 16: GitHub Pages 部署

**Files:**
- Modify: 無程式碼；建 GitHub repo、部署產物

前置：需要 GitHub repo。若尚未建立，先問使用者 repo 名稱（預設 `car-rental`）與公開性。

- [ ] **Step 1: production build（含 base href）**

```bash
ng build --base-href /car-rental/
grep -o '<base href="[^"]*"' dist/penghu-rental-admin/browser/index.html
```
預期輸出：`<base href="/car-rental/"`。不符就停下修正（lessons：base href 是已知坑）。

SPA fallback：
```bash
cp dist/penghu-rental-admin/browser/index.html dist/penghu-rental-admin/browser/404.html
```

- [ ] **Step 2: 建 repo 並部署**

```bash
gh repo create car-rental --public --source . --push
npx angular-cli-ghpages --dir=dist/penghu-rental-admin/browser --no-silent
```

- [ ] **Step 3: 部署後驗證（lessons 規則）**

```bash
curl -s --max-time 5 -o /dev/null -w "%{http_code}" https://<username>.github.io/car-rental/
# 預期 200
curl -s --max-time 5 https://<username>.github.io/car-rental/ | grep -oE 'src="[^"]+\.js"' | head -3
# 取第一個 js 路徑再 curl，預期 200
```

- [ ] **Step 4: Commit（部署設定若有異動）**

```bash
git add -A && git commit -m "chore: GitHub Pages 部署（base href + 404 fallback）" || true
git push
```

---

## Self-Review 紀錄

- Spec 覆蓋：五個頁面（Task 10–15）、四 store（5–8）、repository/種子（3–4）、i18n 常數（2）、部署（16）——spec 各節皆有對應 task。spec「錯誤處理」的 localStorage 重設 → Task 3 `onReset` 已留 hook；snackbar 提示掛在 app 層可於 Task 4 providers 傳入（MVP 允許只在 console 層級，seed 重灌本身已保證可用）。
- 型別一致性：`Repository<T>` 方法名（`remove` 非 `delete`）、`TimelineBlock.startCol` 從 1 起算（template 中 +1 跳過車牌欄）、`BookingStore.updateBooking`（避免與 repo `update` 混淆）已全文一致。
- 佔位符掃描：無 TBD/TODO；Task 1 六個佔位元件在 Task 10–15 逐一覆蓋。
