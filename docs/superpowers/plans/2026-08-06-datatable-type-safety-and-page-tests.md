# DataTable 型別收緊與頁面層一致性測試 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 關掉 DataTable 遷移留下的兩個缺口——讓「欄位 key 不是資料屬性卻沒給 `exportValue`」變成編譯錯誤，並讓「畫面顯示值與匯出值不一致」變成測試失敗。

**Architecture:** 兩層防護。第一層是型別：把 `DataTableColumn<T>` 從單一介面改成三分支 union，真實欄位的 `key` 必須是 `keyof T`，虛擬欄位（值來自巢狀路徑／查表／方法）必須自備 `exportValue`，只有 `exportSkip: true` 的欄位兩者都免。第二層是測試：一個共用斷言函式從 DOM 抽出每格的顯示值、與 `rowsToAoa` 算出的匯出值逐格比對，刻意不同的欄位必須列進例外表並寫明理由。

**Tech Stack:** Angular 22（zoneless + signals）、Nx 23、Vitest、TypeScript strict。

**背景：** 2026-08-06 合併的 DataTable 遷移（merge commit `140e4e2`）過程中抓到**八次**同一類缺陷——欄位的顯示格式或匯出值在遷移時靜默消失（`%` 後綴不見、`-` 變空白、欄位標題只剩半截、匯出掉了費率數字）。全分支 review 指出結構成因是 `DataTableColumn.key` 型別為 `string`、未與 `keyof T` 綁定：key 若不是 row 的屬性，畫面與匯出都會是空的，卻沒有編譯錯誤也沒有測試失敗。詳見 `docs/superpowers/plans/2026-08-04-responsive-data-table.md`。

## Global Constraints

- **必須在 git worktree 內作業。** 主 checkout（`/Users/fangjiemini/bbd-projects/car-rental`）目前有另一個 session 的 6 個未提交檔案（dashboard ×2、footer、header、page-toolbar ×2）。動工前用 `superpowers:using-git-worktrees` 建立隔離工作區，從 `main` 開分支。
- **每個 bash 指令都以 `cd <worktree 絕對路徑> && unset NX_WORKSPACE_ROOT_PATH &&` 開頭。** 該環境變數從父 session 繼承、指向主 checkout，不 unset 會讓 `nx` 把檔案寫到錯誤的目錄。
- Angular 22 zoneless + signal：`ChangeDetectionStrategy.OnPush`、`input()` / `input.required()` / `output()` / `signal()` / `computed()`。**不使用 `@Input()` 裝飾器、不使用 RxJS。**
- **`libs/ui` 不得 import `@angular/material` 或 `libs/domain`**，且**不得內建任何使用者可見字串**（測試用的斷言訊息不算，那是給開發者看的）。
- 測試用 Vitest：`import { describe, it, expect } from 'vitest'`，**測試名稱用繁體中文**（沿用 `libs/domain/src/lib/pricing/date-classify.spec.ts` 的風格）。
- SCSS 顏色只用 `--mat-sys-*` token；斷點固定 `max-width: 640px`。（本計畫不改樣式，此條僅為完整性。）
- **所有 npm 指令帶 `--legacy-peer-deps`**（本 repo 慣例）。
- commit 前必須跑 `git diff --cached --name-only` 確認暫存區內容；**禁止 `git add -A` / `git add .`**。
- commit message 結尾加上：`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

---

## File Structure

```
libs/ui/src/lib/data-table/
  data-table.types.ts          # 修改：DataTableColumn 改為三分支 union
  data-table-export.ts         # 修改：rowsToAoa 加型別守衛以在 union 上取用 exportValue
  data-table.component.ts      # 修改：若有因 union 產生的取值錯誤
  data-table-testing.ts        # 新增：expectExportMatchesDisplay 斷言函式
  data-table-testing.spec.ts   # 新增：斷言函式自身的測試
  index.ts (libs/ui/src/)      # 修改：barrel 匯出新型別與斷言函式

apps/admin/src/app/features/*/pages/*.component.ts      # 修改：型別收緊後需補 exportValue 的欄位
apps/admin/src/app/features/*/pages/*.component.spec.ts # 新增 7 個 / 擴充既有 2 個
apps/affiliate/src/app/features/partner-account/partner-account.component.spec.ts  # 新增
```

斷言函式放 `libs/ui` 而非各 app，是因為 admin 與 affiliate 都要用，那是唯一兩邊都構得到的位置。它很小且可被 tree-shake，放進正式 barrel 的成本可接受。

---

## 現況盤點：型別收緊會攔下哪些欄位

以下是十頁全部 58 個欄位中，`key` **不是** row 型別屬性的「虛擬欄位」。收緊後它們必須有 `exportValue`（或 `exportSkip: true`）：

| 頁面 | 虛擬欄位 | 目前狀態 |
|---|---|---|
| add-ons | `actions` | `exportSkip: true` ✅ |
| bookings | `actions` | `exportSkip: true` ✅ |
| customers | `actions` | `exportSkip: true` ✅ |
| commission | `period` | 有 `exportValue` ✅ |
| coupons | `period`、`actions` | 各自 ✅ |
| partners | `actions` | `exportSkip: true` ✅ |
| pricing | `weekday`、`weekend`、`holiday`、`peak`（值在 `p.dayTypeRates.*`）、`tiers`（值來自 `tiersSummary(p)`）、`actions` | 各自 ✅ |
| vehicles | `actions` | `exportSkip: true` ✅ |
| affiliate | `period`、`rentalSubtotal`（值在 `l.booking.priceBreakdown`）、`bookingId`（值在 `l.booking.id`） | 各自 ✅ |

**這些目前都已經寫對了**，所以型別收緊預期不會產生大量修正——它的價值在於**防止未來寫錯**。但 `affiliate` 的 `days` 與 `commission` 兩欄沒有 `exportValue`，代表它們應為 `CommissionLine` 的直接屬性；Task 1 必須實際驗證，若不是就要補。

---

## Task 1: 收緊 `DataTableColumn` 型別

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.types.ts`
- Modify: `libs/ui/src/lib/data-table/data-table-export.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.component.ts`（若編譯需要）
- Modify: `libs/ui/src/index.ts`
- Modify: 十頁的 `*.component.ts`（僅在編譯器指出時）

**Interfaces:**
- Consumes: 無
- Produces: `DataTableRealColumn<T>`、`DataTableVirtualColumn<T>`、`DataTableSkippedColumn`，以及三者的 union `DataTableColumn<T>`（名稱不變，使用端 import 不需改）

型別收緊是**破壞性變更**，十頁會同時編譯失敗或通過，無法拆成多個 commit，因此本 task 涵蓋型別定義與所有連帶修正。

- [ ] **Step 1: 改寫型別定義**

`libs/ui/src/lib/data-table/data-table.types.ts` 的 `DataTableColumn` 整段換成：

```ts
interface DataTableColumnCommon {
  label: string;
  /** 手機版卡片收合時仍顯示。整份 columns 都沒標時，第一欄自動視為 primary。 */
  primary?: boolean;
  align?: 'start' | 'end';
}

/**
 * 真實欄位：key 是 T 的屬性，未提供 exportValue 時匯出直接取 row[key]。
 */
export interface DataTableRealColumn<T> extends DataTableColumnCommon {
  key: Extract<keyof T, string>;
  exportValue?: (row: T) => string | number;
  exportSkip?: false;
}

/**
 * 虛擬欄位：key 不是 T 的屬性——值來自巢狀路徑（p.dayTypeRates.weekday）、
 * 查表（statusLabels[v.status]）、方法（tiersSummary(p)）或多欄組合（startTime ~ endTime）。
 * 這種欄位的預設取值 row[key] 必然是 undefined，所以 exportValue 是必填。
 * 這正是遷移期間八次「匯出值靜默消失」缺陷的成因，由型別在編譯期擋下。
 */
export interface DataTableVirtualColumn<T> extends DataTableColumnCommon {
  key: string;
  exportValue: (row: T) => string | number;
  exportSkip?: false;
}

/** 不納入匯出的欄位（actions），因此既不需要 key 是真屬性，也不需要 exportValue。 */
export interface DataTableSkippedColumn extends DataTableColumnCommon {
  key: string;
  exportSkip: true;
}

export type DataTableColumn<T> =
  | DataTableRealColumn<T>
  | DataTableVirtualColumn<T>
  | DataTableSkippedColumn;
```

`DataTableLabels` 與 `DataTableMobileMode` 兩個型別**維持原樣，不要動**。

- [ ] **Step 2: 跑編譯確認會失敗**

Run: `npx nx build ui`
Expected: FAIL。`data-table-export.ts` 的 `col.exportValue` 會報錯，因為 `DataTableSkippedColumn` 沒有這個屬性——union 上無法直接取用。

- [ ] **Step 3: 在 `rowsToAoa` 加型別守衛**

`libs/ui/src/lib/data-table/data-table-export.ts` 的第 14 行：

```ts
  const cols = columns.filter((c) => !c.exportSkip);
```

換成：

```ts
  const cols = columns.filter(
    (c): c is DataTableRealColumn<T> | DataTableVirtualColumn<T> => !c.exportSkip,
  );
```

並在檔案頂端的 import 補上這兩個型別：

```ts
import {
  DataTableColumn,
  DataTableRealColumn,
  DataTableVirtualColumn,
} from './data-table.types';
```

- [ ] **Step 4: 更新 barrel**

`libs/ui/src/index.ts` 已經有 `export * from './lib/data-table/data-table.types';`，新型別會自動匯出，**不需要改**。確認該行存在即可。

- [ ] **Step 5: 跑建置確認 libs/ui 通過**

Run: `npx nx build ui`
Expected: PASS

Run: `npx nx test ui`
Expected: PASS（既有 49 個測試）

- [ ] **Step 6: 修正十頁的編譯錯誤**

Run: `npx nx build admin` 與 `npx nx build affiliate`

依編譯器指出的位置逐一修正。預期錯誤只會出現在「key 不是 row 屬性、卻沒有 `exportValue` 也沒有 `exportSkip`」的欄位。依上方盤點表，這類欄位目前**應該都已寫對**，但必須實際驗證：

- **`apps/affiliate` 的 `days` 與 `commission` 兩欄沒有 `exportValue`**，代表它們必須是 `CommissionLine` 的直接屬性。若編譯器報錯，代表它們其實在巢狀路徑上，請依畫面模板（`partner-account.component.html` 對應的 `dtCell`，若無 `dtCell` 則是預設渲染）補上與畫面一致的 `exportValue`。
- 若有頁面因為 `Extract<keyof T, string>` 而報「key 不在型別中」但你確認該欄確實是真屬性，先檢查是不是型別定義本身缺了那個屬性，**不要**用 `as` 繞過。

**不要**為了消除錯誤而把欄位改成 `exportSkip: true`——那會讓該欄從 Excel 消失，是比原本更糟的缺陷。

- [ ] **Step 7: 全量驗證**

```bash
npx nx test ui
npx nx test admin
npx nx test affiliate
npx nx build admin
npx nx build affiliate
npx nx lint ui
```
Expected: 全部 PASS

- [ ] **Step 8: Commit**

```bash
git add libs/ui/src/lib/data-table/data-table.types.ts libs/ui/src/lib/data-table/data-table-export.ts
# 若有頁面修正，逐檔加入
git diff --cached --name-only
git commit -m "refactor(ui): DataTableColumn 收緊為三分支 union，虛擬欄位強制 exportValue

key 不是 row 屬性的欄位（值來自巢狀路徑、查表或方法）現在必須自備
exportValue，否則編譯失敗。這是遷移期間八次「匯出值靜默消失」缺陷的
結構成因。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: `expectExportMatchesDisplay` 斷言函式

**Files:**
- Create: `libs/ui/src/lib/data-table/data-table-testing.ts`
- Test: `libs/ui/src/lib/data-table/data-table-testing.spec.ts`
- Modify: `libs/ui/src/index.ts`

**Interfaces:**
- Consumes: `DataTableColumn<T>`（Task 1）、`rowsToAoa`（既有，`data-table-export.ts`）
- Produces: `expectExportMatchesDisplay<T>(fixture, columns, rows, exceptions?): void`

- [ ] **Step 1: 寫失敗的測試**

Create `libs/ui/src/lib/data-table/data-table-testing.spec.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { DataTableCellDirective } from './data-table-cell.directive';
import { DataTableColumn, DataTableLabels } from './data-table.types';
import { expectExportMatchesDisplay } from './data-table-testing';

interface Row {
  id: string;
  name: string;
  price: number;
  status: 'ok' | 'ng';
}

const LABELS: DataTableLabels = {
  exportExcel: '匯出 Excel',
  expandRow: '展開',
  collapseRow: '收合',
  exportFailedText: '匯出失敗',
};

const ROWS: Row[] = [
  { id: 'r1', name: '甲方案', price: 1200, status: 'ok' },
  { id: 'r2', name: '乙方案', price: 800, status: 'ng' },
];

const STATUS_LABELS: Record<string, string> = { ok: '正常', ng: '停用' };

@Component({
  imports: [DataTableComponent, DataTableCellDirective],
  template: `
    <lib-data-table [columns]="columns()" [rows]="rows" [labels]="labels">
      <ng-template dtCell="status" let-row>{{ statusLabels[row.status] }}</ng-template>
      <ng-template dtCell="price" let-row>{{ row.price }} 元</ng-template>
    </lib-data-table>
  `,
})
class HostComponent {
  readonly labels = LABELS;
  readonly rows = ROWS;
  readonly statusLabels = STATUS_LABELS;
  readonly columns = signal<DataTableColumn<Row>[]>([
    { key: 'name', label: '名稱', primary: true },
    { key: 'status', label: '狀態', primary: true, exportValue: (r) => STATUS_LABELS[r.status] },
    { key: 'price', label: '單價', exportValue: (r) => r.price },
  ]);
}

describe('expectExportMatchesDisplay', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('畫面值與匯出值一致的欄位全部通過', () => {
    // name 走預設渲染、status 的 dtCell 與 exportValue 都輸出「正常」，兩者皆一致；
    // price 的畫面加了「元」而匯出是純數字，故列為例外。
    expect(() =>
      expectExportMatchesDisplay(fixture, fixture.componentInstance.columns(), ROWS, {
        price: '畫面加「元」單位，Excel 存可計算的裸數字',
      }),
    ).not.toThrow();
  });

  it('畫面值與匯出值不一致且未列為例外時，斷言失敗', () => {
    expect(() =>
      expectExportMatchesDisplay(fixture, fixture.componentInstance.columns(), ROWS, {}),
    ).toThrow();
  });

  it('失敗訊息指出是哪一列、哪一欄、兩邊各是什麼', () => {
    let message = '';
    try {
      expectExportMatchesDisplay(fixture, fixture.componentInstance.columns(), ROWS, {});
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toContain('單價');
    expect(message).toContain('1200 元');
  });

  it('exportSkip 的欄位不納入比對', async () => {
    fixture.componentInstance.columns.set([
      { key: 'name', label: '名稱', primary: true },
      { key: 'actions', label: '操作', exportSkip: true },
    ]);
    await fixture.whenStable();
    expect(() =>
      expectExportMatchesDisplay(fixture, fixture.componentInstance.columns(), ROWS, {}),
    ).not.toThrow();
  });

  it('渲染的列數與傳入的 rows 數量不符時失敗', () => {
    expect(() => expectExportMatchesDisplay(fixture, fixture.componentInstance.columns(), [ROWS[0]], {}))
      .toThrow();
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test ui`
Expected: FAIL，找不到模組 `./data-table-testing`

- [ ] **Step 3: 寫實作**

Create `libs/ui/src/lib/data-table/data-table-testing.ts`：

```ts
import { ComponentFixture } from '@angular/core/testing';
import { expect } from 'vitest';
import { rowsToAoa } from './data-table-export';
import { DataTableColumn } from './data-table.types';

/**
 * 欄位 key → 為什麼這一欄的畫面值與匯出值刻意不同。
 * 例：{ discountPercent: '畫面加 % 後綴，Excel 存可計算的裸數字' }
 *
 * 例外表本身就是文件——沒列在這裡的欄位一律必須一致，
 * 列在這裡的欄位則帶著它為什麼可以不一致的理由。
 */
export type DisplayExportExceptions = Record<string, string>;

/**
 * 斷言「畫面上每一格顯示的值」等於「匯出到 Excel 時寫入的值」。
 *
 * 這道防護存在的原因：頁面必須分別填寫顯示（dtCell）與匯出（exportValue）
 * 兩份內容，而匯出刻意不讀 DOM（改讀資料，避免日後加分頁後只匯出當前頁），
 * 兩者因此得靠人工同步。DataTable 遷移期間有八次是其中一邊被漏掉，
 * 畫面完全正常、只有打開 Excel 才會發現。
 */
export function expectExportMatchesDisplay<T>(
  fixture: ComponentFixture<unknown>,
  columns: DataTableColumn<T>[],
  rows: readonly T[],
  exceptions: DisplayExportExceptions = {},
): void {
  const el = fixture.nativeElement as HTMLElement;
  const renderedRows = [...el.querySelectorAll('tbody tr')];

  expect(renderedRows.length, `畫面渲染了 ${renderedRows.length} 列，但傳入 ${rows.length} 列`).toBe(
    rows.length,
  );

  const aoa = rowsToAoa(columns, rows);
  const exported = columns.filter((c) => !c.exportSkip);

  renderedRows.forEach((tr, rowIndex) => {
    exported.forEach((col, colIndex) => {
      if (exceptions[col.key] !== undefined) return;

      const cell = tr.querySelector(`td[data-label="${col.label}"]`);
      const displayed = (cell?.textContent ?? '').trim().replace(/\s+/g, ' ');
      const exportedValue = String(aoa[rowIndex + 1][colIndex]);

      expect(
        displayed,
        `第 ${rowIndex + 1} 列的「${col.label}」欄不一致：畫面顯示「${displayed}」、` +
          `匯出寫入「${exportedValue}」。若這是刻意的，請把 '${col.key}' 加進例外表並寫明理由。`,
      ).toBe(exportedValue);
    });
  });
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test ui`
Expected: PASS（既有 49 個 + 本 task 的 5 個 = 54）

- [ ] **Step 5: 更新 barrel**

`libs/ui/src/index.ts` 末尾追加：

```ts
export * from './lib/data-table/data-table-testing';
```

- [ ] **Step 6: 確認建置與 lint**

```bash
npx nx build ui
npx nx lint ui
```
Expected: 皆 PASS

- [ ] **Step 7: Commit**

```bash
git add libs/ui/src/lib/data-table/data-table-testing.ts libs/ui/src/lib/data-table/data-table-testing.spec.ts libs/ui/src/index.ts
git diff --cached --name-only
git commit -m "feat(ui): 新增 expectExportMatchesDisplay，比對畫面值與匯出值

刻意不同的欄位必須列進例外表並寫明理由，例外表本身即文件。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: 接入 `add-ons`、`partners`、`coupons`

**Files:**
- Create: `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.spec.ts`
- Create: `apps/admin/src/app/features/partners/pages/partners-page.component.spec.ts`
- Create: `apps/admin/src/app/features/coupons/pages/coupons-page.component.spec.ts`

**Interfaces:**
- Consumes: `expectExportMatchesDisplay`（Task 2，從 `@car-rental/ui` import）
- Produces: 三頁的一致性測試；`partners` 的例外表會示範怎麼記錄刻意的差異

這三頁一起做，是因為 `partners` 有目前唯一已知的刻意差異（`discountPercent` 畫面 `10%`、匯出裸數字 `10`），而 `coupons` 是與它對照後統一過慣例的那一頁——兩者放在同一輪，可以確認慣例真的一致。

- [ ] **Step 1: 寫 `add-ons` 的測試**

Create `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.spec.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expectExportMatchesDisplay } from '@car-rental/ui';
import { AddOnsPageComponent } from './add-ons-page.component';

describe('AddOnsPageComponent 畫面與匯出一致性', () => {
  let fixture: ComponentFixture<AddOnsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOnsPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AddOnsPageComponent);
    await fixture.whenStable();
  });

  it('每一欄的畫面顯示值與匯出值一致', () => {
    const page = fixture.componentInstance;
    expectExportMatchesDisplay(fixture, page.columns, page.store.addOns(), {});
  });
});
```

若 `columns` 或 `store` 在元件上不是 public，將其改為 public readonly（不要用 `as any` 繞過）。

- [ ] **Step 2: 跑測試，讓失敗告訴你例外有哪些**

Run: `npx nx test admin`

**這一步是本 task 的核心作法**：例外表先傳空物件 `{}`，每一個失敗訊息都會指出「第 N 列的『某欄』畫面顯示 X、匯出寫入 Y」。逐一判斷：

- **是真的缺陷** → 修 `*.component.ts` 的 `exportValue` 或 `*.component.html` 的 `dtCell`，讓兩者一致
- **是刻意的差異** → 加進例外表，並寫一句為什麼

**不要**為了讓測試變綠就把所有欄位塞進例外表——那等於把防護關掉。

把每一輪的判斷寫進報告。

- [ ] **Step 3: 寫 `partners` 的測試（含已知例外）**

Create `apps/admin/src/app/features/partners/pages/partners-page.component.spec.ts`，結構與 Step 1 相同，但例外表預先帶入已知的一項：

```ts
  it('每一欄的畫面顯示值與匯出值一致', () => {
    const page = fixture.componentInstance;
    expectExportMatchesDisplay(fixture, page.columns, page.store.partners(), {
      discountPercent: '畫面加 % 後綴便於閱讀，Excel 存可計算的裸數字',
    });
  });
```

`rows` 的來源以該頁實際的 signal 為準（可能是 `page.store.partners()` 或已篩選的 computed），照實填。

- [ ] **Step 4: 寫 `coupons` 的測試**

Create `apps/admin/src/app/features/coupons/pages/coupons-page.component.spec.ts`，結構同 Step 1，例外表先傳 `{}`，照 Step 2 的方式讓失敗訊息告訴你例外。

**特別確認**：`coupons` 的 `value` 欄在遷移收尾時從 `` `${c.value}%` `` 改成了 `c.value`，與 `partners.discountPercent` 統一為「Excel 存數字」。若這一欄出現不一致，例外理由要與 `partners` 那條一致，不要各寫各的。

- [ ] **Step 5: 三頁測試全過**

Run: `npx nx test admin`
Expected: PASS。把新增的測試數與任何修掉的缺陷記進報告。

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/app/features/add-ons/pages/add-ons-page.component.spec.ts \
        apps/admin/src/app/features/partners/pages/partners-page.component.spec.ts \
        apps/admin/src/app/features/coupons/pages/coupons-page.component.spec.ts
# 若有連帶修正的 .ts / .html，逐檔加入
git diff --cached --name-only
git commit -m "test(admin): add-ons/partners/coupons 補畫面與匯出一致性測試

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: 接入 `vehicles`、`pricing`、`customers`、`maintenance`

**Files:**
- Modify: `apps/admin/src/app/features/vehicles/pages/vehicles-page.component.spec.ts`（既有，加一個 describe 區塊）
- Create: `apps/admin/src/app/features/pricing/pages/pricing-page.component.spec.ts`
- Create: `apps/admin/src/app/features/bookings/pages/customers-page.component.spec.ts`
- Create: `apps/admin/src/app/features/maintenance/pages/maintenance-page.component.spec.ts`

**Interfaces:**
- Consumes: `expectExportMatchesDisplay`（Task 2）
- Produces: 四頁的一致性測試

`vehicles` 已有 spec 檔（7 個測試，測搜尋與篩選），**不要覆寫它**——在檔案末尾追加一個新的 `describe('VehiclesPageComponent 畫面與匯出一致性', ...)` 區塊，沿用該檔既有的 TestBed 設定風格。

- [ ] **Step 1: 擴充 `vehicles` 既有 spec**

先讀 `apps/admin/src/app/features/vehicles/pages/vehicles-page.component.spec.ts` 了解它既有的 TestBed 設定與 fixture 建立方式，然後在末尾追加：

```ts
describe('VehiclesPageComponent 畫面與匯出一致性', () => {
  it('每一欄的畫面顯示值與匯出值一致', async () => {
    // TestBed 設定沿用本檔既有的寫法
    const fixture = TestBed.createComponent(VehiclesPageComponent);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expectExportMatchesDisplay(fixture, page.columns, page.filteredVehicles(), {});
  });
});
```

`rows` 來源以該頁實際的 signal 為準（`filteredVehicles()` 或等價者），照實填。檔案頂端補上 `import { expectExportMatchesDisplay } from '@car-rental/ui';`。

- [ ] **Step 2: 跑測試，依失敗訊息判斷例外**

Run: `npx nx test admin`

同 Task 3 Step 2 的作法：例外表先空著，逐一判斷每個失敗是真缺陷（修 config 或模板）還是刻意差異（加進例外表並寫理由）。

- [ ] **Step 3: 寫 `pricing` 的測試**

Create `apps/admin/src/app/features/pricing/pages/pricing-page.component.spec.ts`。這是欄位最多的一頁（8 欄），其中四個費率欄的值在巢狀路徑 `p.dayTypeRates.*`、`tiers` 來自 `tiersSummary(p)`——這五欄的 `dtCell` 與 `exportValue` 是分開寫的，正是本測試最該守住的地方。

結構同 Task 3 Step 1，`rows` 用該頁實際的 signal（如 `page.store.plans()`），例外表先傳 `{}`。

- [ ] **Step 4: 寫 `customers` 的測試**

Create `apps/admin/src/app/features/bookings/pages/customers-page.component.spec.ts`（注意 `customers` 頁位於 `features/bookings/pages/` 底下）。

這頁有三欄（`phone`、`idNumber`、`note`）的 `dtCell` 內容包在 `<span class="text-secondary">` 裡。**斷言函式取的是 `td` 的 `textContent`，內層 span 不影響取值**，所以預期不需要例外。若出現不一致，代表 `?? '—'` 這類預設值在某一邊漏掉了，那是真缺陷要修。

- [ ] **Step 5: 寫 `maintenance` 的測試**

Create `apps/admin/src/app/features/maintenance/pages/maintenance-page.component.spec.ts`。

**只測下半部的「保養紀錄」表格**。這頁上半部有保養警示區塊（chip、逾期／即將到期分類、送修按鈕），不在本測試範圍——斷言函式查的是 `tbody tr`，若該區塊也含表格會誤抓，屆時把查詢範圍收窄到 DataTable 所在的容器。

- [ ] **Step 6: 四頁測試全過**

Run: `npx nx test admin`
Expected: PASS。把新增測試數與修掉的缺陷記進報告。

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/app/features/vehicles/pages/vehicles-page.component.spec.ts \
        apps/admin/src/app/features/pricing/pages/pricing-page.component.spec.ts \
        apps/admin/src/app/features/bookings/pages/customers-page.component.spec.ts \
        apps/admin/src/app/features/maintenance/pages/maintenance-page.component.spec.ts
git diff --cached --name-only
git commit -m "test(admin): vehicles/pricing/customers/maintenance 補畫面與匯出一致性測試

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: 接入 `bookings`、`commission`、`affiliate`

**Files:**
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.spec.ts`（既有，加一個 describe 區塊）
- Create: `apps/admin/src/app/features/commission/pages/commission-page.component.spec.ts`
- Create: `apps/affiliate/src/app/features/partner-account/partner-account.component.spec.ts`

**Interfaces:**
- Consumes: `expectExportMatchesDisplay`（Task 2）
- Produces: 最後三頁的一致性測試；完成後十頁全數涵蓋

這三頁留到最後，因為各有一個額外難處：`bookings` 的 actions 欄是依狀態分支的四段 `@if`、`commission` 需要先選定合作夥伴與月份才有資料、`affiliate` 的種子資料沒有符合條件的退佣明細。

- [ ] **Step 1: 擴充 `bookings` 既有 spec**

先讀 `apps/admin/src/app/features/bookings/pages/bookings-page.component.spec.ts`（既有 6 個測試，測搜尋與篩選），在末尾追加新的 describe 區塊，沿用該檔既有的 TestBed 設定：

```ts
describe('BookingsPageComponent 畫面與匯出一致性', () => {
  it('每一欄的畫面顯示值與匯出值一致', async () => {
    const fixture = TestBed.createComponent(BookingsPageComponent);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expectExportMatchesDisplay(fixture, page.columns, page.filteredBookings(), {});
  });
});
```

`actions` 欄是 `exportSkip: true`，斷言函式會自動略過，那四段條件式按鈕不影響本測試。

- [ ] **Step 2: 寫 `commission` 的測試**

Create `apps/admin/src/app/features/commission/pages/commission-page.component.spec.ts`。

這頁的資料來自 `report()`，而 `report()` 需要先選定合作夥伴與月份才有值。測試中要先設定這兩個選項，再 `await fixture.whenStable()`，然後用 `page.report()!.rows` 當作 `rows`。設定方式以元件實際暴露的 signal 為準（讀元件原始碼確認名稱）。

若在測試環境中無法產生任何資料列，**不要跳過這頁**——改用 store 的 seed 資料或直接把資料塞進 repository（該頁的 store 依賴 `Repository<T>` 介面），並在報告中說明你怎麼構造資料。

- [ ] **Step 3: 寫 `affiliate` 的測試**

Create `apps/affiliate/src/app/features/partner-account/partner-account.component.spec.ts`。

**這頁的種子資料沒有符合條件的退佣明細**——遷移時的瀏覽器驗證是靠 localStorage 注入人造資料完成的。測試裡要以程式方式構造資料：透過該頁 store 依賴的 `Repository<T>` 塞入至少兩筆有 `priceBreakdown` 的訂單，讓 `commissionLines` 有內容。

注意 `CommissionLine` 沒有頂層 `id`，該頁傳了 `[rowId]`，但這不影響本斷言函式（它只比對顯示值與匯出值）。

- [ ] **Step 4: 三頁測試全過**

```bash
npx nx test admin
npx nx test affiliate
```
Expected: 皆 PASS

- [ ] **Step 5: 全量驗證**

```bash
npx nx test ui
npx nx test admin
npx nx test affiliate
npx nx build admin
npx nx build affiliate
npx nx lint ui
npx nx lint admin
npx nx lint affiliate
npm run lint:theme
```
Expected: 全部 PASS。`nx lint admin` / `nx lint affiliate` 若出現早於本計畫就存在的錯誤，用 `git log main..HEAD -- <file>` 查證後在報告中說明並跳過。

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/app/features/bookings/pages/bookings-page.component.spec.ts \
        apps/admin/src/app/features/commission/pages/commission-page.component.spec.ts \
        apps/affiliate/src/app/features/partner-account/partner-account.component.spec.ts
git diff --cached --name-only
git commit -m "test: bookings/commission/affiliate 補畫面與匯出一致性測試

十張表格全數涵蓋。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## 風險與退場條件

**型別收緊（Task 1）是本計畫唯一有真實失敗風險的部分。** TypeScript 在三分支 union 上的錯誤訊息可能很難讀——當一個 column 物件三個分支都不符時，編譯器往往只報「不符合最後一個分支」，而不會指出真正的原因。

若 Task 1 執行時出現以下任一情況，**停下來回報，不要硬推**：

- 錯誤訊息無法指出是哪個欄位、哪個屬性有問題，導致修正變成猜謎
- 為了通過編譯必須在頁面加上 `as` 斷言或 `@ts-expect-error`

退場方案：放棄 union，改回單一介面但在 `key` 的 JSDoc 寫明「若這不是 `T` 的屬性，你必須同時提供 `dtCell` 與 `exportValue`」，然後直接做 Task 2–5。**測試那一層才是真正抓到八次缺陷的東西，型別是加分項；沒有型別，計畫依然有價值。**

---

## Self-Review 紀錄

**覆蓋檢查**：

| 目標 | 對應 Task |
|---|---|
| 虛擬欄位缺 `exportValue` 變成編譯錯誤 | Task 1 |
| 共用的畫面／匯出比對斷言 | Task 2 |
| 十張表格全數接入 | Task 3（3 頁）、Task 4（4 頁）、Task 5（3 頁） |
| 刻意差異需明文記錄理由 | Task 2 的例外表設計；Task 3 Step 3 示範 |

**型別一致性檢查**：`DataTableRealColumn` / `DataTableVirtualColumn` / `DataTableSkippedColumn` / `DataTableColumn`（Task 1）、`expectExportMatchesDisplay` / `DisplayExportExceptions`（Task 2）在 Task 3–5 的引用名稱與簽章皆一致。斷言函式簽章 `(fixture, columns, rows, exceptions?)` 在全部九處呼叫中一致。

**已知的刻意留白**：Task 3–5 各頁的例外表內容不在計畫中寫死，而是由「先傳空物件、讓測試失敗訊息指出候選」的流程產生。這不是 placeholder——流程本身是明確可執行的，且逐頁列舉例外需要先讀十份模板，寫進計畫反而會過時。每一輪的判斷結果要求寫進報告。
