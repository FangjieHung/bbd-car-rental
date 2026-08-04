# 響應式資料表格元件（DataTable）實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 admin 的 9 張表格與 affiliate 的 1 張表格，統一成 `libs/ui` 的 `DataTableComponent`——桌機表格、手機純 CSS 轉卡片、內建 Excel 匯出。

**Architecture:** 元件建在**原生 `<table>` 語意**上（不是 `mat-table`），因為 Excel 匯出套件直接讀 DOM，且 `colspan`/`rowspan` 在 column-def 模型裡無法表達。手機版**不換 DOM**，只用 CSS 把 table 排成卡片，讓匯出與無障礙語意在所有斷點都成立。元件提供標準模式（`columns` config 驅動）與逃生門模式（頁面自己接管 `thead`/`tbody`），後者供未來高度客製報表使用。

**Tech Stack:** Angular 22（zoneless + signal）、Nx 23.1.0、Vitest、Tailwind v4、SheetJS（`xlsx`，動態載入）。

**Spec:** [`docs/superpowers/specs/2026-08-04-responsive-data-table-design.md`](../specs/2026-08-04-responsive-data-table-design.md)

## Global Constraints

- **Angular 22 zoneless + signal**。元件一律 `ChangeDetectionStrategy.OnPush`、輸入用 `input()` / `input.required()`、內部狀態用 `signal()` / `computed()`。不使用 `@Input()` 裝飾器、不使用 RxJS。
- **`libs/ui` 不得 import `@angular/material`**。`apps/affiliate/src/app/features/partner-account/partner-account.component.ts` 完全沒有 Material 依賴，元件若用 `mat-button` 會把 Material 拉進 affiliate。匯出鈕與展開鈕一律用原生 `<button type="button">`，樣式自理。
- **`libs/ui` 不得 import `libs/domain`**。表格元件對資料型別保持泛型，不認識 `Vehicle` / `Booking` 等領域型別。
- **`libs/ui` 不得內建任何字串**。所有使用者可見文案由 `labels` input 傳入。
- **顏色只用 `--mat-sys-*` token**，不寫死色碼。改動樣式後必須跑 `npm run lint:theme`。
- **斷點固定 `max-width: 640px`**，與 `apps/admin/src/app/shared/ui/page-toolbar.component.scss:44` 現有斷點一致。
- **測試用 Vitest**，`import { describe, it, expect } from 'vitest'`，測試名稱用繁中（沿用 `libs/domain/src/lib/pricing/date-classify.spec.ts` 的風格）。
- **所有 npm 安裝指令帶 `--legacy-peer-deps`**（本 repo 既有慣例）。
- **每個 task 結束時 commit**。commit 前必須先跑 `git diff --cached --name-only` 確認暫存區沒有無關檔案——工作區目前有 9 個與本計畫無關的未提交修改（`app.scss`、`zh-tw.ts`、dashboard、header、footer、page-toolbar），**絕對不可 `git add -A` 或 `git add .`**，一律逐檔 `git add`。
- Commit message 結尾加上：`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

## 相對 Spec 的兩項細節修正

實作前查證後的調整，已納入下列任務：

1. **匯出用 `aoa_to_sheet` 而非 `json_to_sheet`**。`json_to_sheet` 以物件 key 決定欄位順序與標題，無法直接套用 `columns` 的 `label` 與排列順序；`aoa_to_sheet` 接受二維陣列，欄序與標題完全可控。
2. **匯出鈕與展開鈕用原生 `<button>`**，理由見 Global Constraints。

## File Structure

```
libs/ui/                                   # 新 lib，alias @car-rental/ui
  src/
    index.ts                               # barrel：只匯出公開 API
    lib/data-table/
      data-table.types.ts                  # DataTableColumn / DataTableLabels / DataTableMobileMode
      data-table-cell.directive.ts         # ng-template[dtCell]
      data-table-slot.directives.ts        # ng-template[dtHead] / ng-template[dtBody]
      data-table-export.ts                 # 純函式：檔名、資料轉二維陣列、兩條匯出路徑
      data-table-export.spec.ts
      data-table.component.ts              # 元件邏輯
      data-table.component.html            # 兩種模式的模板
      data-table.component.scss            # 桌機表格樣式 + 640px 卡片轉換
      data-table.component.spec.ts
```

匯出邏輯獨立成 `data-table-export.ts` 而非塞進元件，是為了讓「資料 → 二維陣列」與「檔名格式」能以純函式單測，不必透過 TestBed。

---

## Task 1: 建立 `libs/ui` 與型別定義

**Files:**
- Create: `libs/ui/` 整個 lib scaffold
- Create: `libs/ui/src/lib/data-table/data-table.types.ts`
- Modify: `libs/ui/src/index.ts`
- Modify: `tsconfig.base.json`（`paths` 區塊）

**Interfaces:**
- Consumes: 無
- Produces: `DataTableColumn<T>`、`DataTableLabels`、`DataTableMobileMode`；path alias `@car-rental/ui`

- [ ] **Step 1: 產生 lib**

```bash
npx nx g @nx/angular:library ui --directory=libs/ui --prefix=lib --skipTests=false --standalone --no-interactive
```

- [ ] **Step 2: 對齊既有 lib 的 project.json 形狀**

打開 `libs/ui/project.json`，確認與 `libs/domain/project.json` 一致（`test` target 必須是 `@nx/angular:unit-test`、`options.watch: false`）：

```json
{
  "name": "ui",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": [],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "defaultConfiguration": "production",
      "options": {
        "project": "libs/ui/ng-package.json",
        "tsConfig": "libs/ui/tsconfig.lib.json"
      },
      "configurations": {
        "production": { "tsConfig": "libs/ui/tsconfig.lib.prod.json" },
        "development": {}
      }
    },
    "test": { "executor": "@nx/angular:unit-test", "options": { "watch": false } },
    "lint": { "executor": "@nx/eslint:lint" }
  }
}
```

- [ ] **Step 3: 註冊 path alias**

在 `tsconfig.base.json` 的 `compilerOptions.paths` 新增一行（放在既有三條之後）：

```json
"@car-rental/ui": ["./libs/ui/src/index.ts"]
```

- [ ] **Step 4: 寫型別定義**

Create `libs/ui/src/lib/data-table/data-table.types.ts`：

```ts
/** 標準模式的欄位定義。label 是欄位標題的唯一來源，元件會自動寫進 td 的 data-label。 */
export interface DataTableColumn<T> {
  key: string;
  label: string;
  /** 手機版卡片收合時仍顯示。整份 columns 都沒標時，第一欄自動視為 primary。 */
  primary?: boolean;
  align?: 'start' | 'end';
  /** 匯出時的取值。未提供時取 row[key]。 */
  exportValue?: (row: T) => string | number;
  /** 不納入匯出（actions 欄用）。 */
  exportSkip?: boolean;
}

/** 元件本身不內建字串，全部由使用端傳入。 */
export interface DataTableLabels {
  exportExcel: string;
  expandRow: string;
  collapseRow: string;
}

export type DataTableMobileMode = 'cards' | 'scroll';
```

- [ ] **Step 5: 設定 barrel**

`libs/ui/src/index.ts`（覆蓋 generator 產生的內容）：

```ts
export * from './lib/data-table/data-table.types';
```

- [ ] **Step 6: 驗證 alias 可解析**

```bash
npx nx test ui
```
Expected: PASS（generator 產生的預設測試通過，或無測試時顯示 no tests——兩者皆可接受）

```bash
npx tsc --noEmit -p tsconfig.base.json 2>&1 | head -20
```
Expected: 無關於 `@car-rental/ui` 的錯誤

- [ ] **Step 7: Commit**

```bash
git add libs/ui tsconfig.base.json
git diff --cached --name-only    # 確認只有上述檔案
git commit -m "feat(ui): 建立 libs/ui 與 DataTable 型別定義

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: 內容投影指令（`dtCell` / `dtHead` / `dtBody`）

**Files:**
- Create: `libs/ui/src/lib/data-table/data-table-cell.directive.ts`
- Create: `libs/ui/src/lib/data-table/data-table-slot.directives.ts`
- Modify: `libs/ui/src/index.ts`

**Interfaces:**
- Consumes: 無
- Produces: `DataTableCellDirective`（有 `dtCell: InputSignal<string>` 與 `template: TemplateRef<DataTableCellContext<T>>`）、`DataTableHeadDirective`、`DataTableBodyDirective`（各有 `template: TemplateRef<unknown>`）、`DataTableCellContext<T>`

- [ ] **Step 1: 寫 cell 指令**

Create `libs/ui/src/lib/data-table/data-table-cell.directive.ts`：

```ts
import { Directive, TemplateRef, inject, input } from '@angular/core';

/** dtCell template 的 context：let-row 取得該列資料。 */
export interface DataTableCellContext<T> {
  $implicit: T;
}

/**
 * 為單一欄位提供自訂儲存格內容。
 * 用法：<ng-template dtCell="status" let-row> ... </ng-template>
 */
@Directive({ selector: 'ng-template[dtCell]' })
export class DataTableCellDirective<T = unknown> {
  readonly dtCell = input.required<string>();
  readonly template = inject<TemplateRef<DataTableCellContext<T>>>(TemplateRef);
}
```

- [ ] **Step 2: 寫逃生門指令**

Create `libs/ui/src/lib/data-table/data-table-slot.directives.ts`：

```ts
import { Directive, TemplateRef, inject } from '@angular/core';

/** 逃生門模式：頁面自行提供 thead 內容（可用 colspan / rowspan）。 */
@Directive({ selector: 'ng-template[dtHead]' })
export class DataTableHeadDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** 逃生門模式：頁面自行提供 tbody 內容。 */
@Directive({ selector: 'ng-template[dtBody]' })
export class DataTableBodyDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
```

- [ ] **Step 3: 更新 barrel**

`libs/ui/src/index.ts`：

```ts
export * from './lib/data-table/data-table.types';
export * from './lib/data-table/data-table-cell.directive';
export * from './lib/data-table/data-table-slot.directives';
```

- [ ] **Step 4: 驗證編譯**

```bash
npx nx build ui
```
Expected: 成功

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src
git diff --cached --name-only
git commit -m "feat(ui): DataTable 內容投影指令 dtCell/dtHead/dtBody

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: 匯出純函式（檔名 + 資料轉二維陣列）

**Files:**
- Create: `libs/ui/src/lib/data-table/data-table-export.ts`
- Test: `libs/ui/src/lib/data-table/data-table-export.spec.ts`

**Interfaces:**
- Consumes: `DataTableColumn<T>`（Task 1）
- Produces: `exportFileName(name: string, date?: Date): string`、`rowsToAoa<T>(columns: DataTableColumn<T>[], rows: readonly T[]): (string | number)[][]`

- [ ] **Step 1: 寫失敗的測試**

Create `libs/ui/src/lib/data-table/data-table-export.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { exportFileName, rowsToAoa } from './data-table-export';
import { DataTableColumn } from './data-table.types';

interface Row {
  id: string;
  name: string;
  price: number;
  unit: 'day' | 'trip';
}

const rows: Row[] = [
  { id: 'a1', name: '兒童座椅', price: 200, unit: 'day' },
  { id: 'a2', name: '接送服務', price: 500, unit: 'trip' },
];

const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: '名稱' },
  { key: 'price', label: '單價' },
  { key: 'unit', label: '計價單位', exportValue: (r) => (r.unit === 'day' ? '每日' : '每趟') },
  { key: 'actions', label: '操作', exportSkip: true },
];

describe('exportFileName', () => {
  it('檔名為 {name}-{YYYYMMDD}.xlsx', () =>
    expect(exportFileName('vehicles', new Date(2026, 7, 4))).toBe('vehicles-20260804.xlsx'));

  it('月與日補零', () =>
    expect(exportFileName('x', new Date(2026, 0, 9))).toBe('x-20260109.xlsx'));
});

describe('rowsToAoa', () => {
  it('第一列為欄位標題，且不含 exportSkip 欄位', () =>
    expect(rowsToAoa(columns, rows)[0]).toEqual(['名稱', '單價', '計價單位']));

  it('有 exportValue 時優先於 row[key]', () =>
    expect(rowsToAoa(columns, rows)[1]).toEqual(['兒童座椅', 200, '每日']));

  it('數字保持數字型別，不轉字串', () =>
    expect(typeof rowsToAoa(columns, rows)[1][1]).toBe('number'));

  it('null/undefined 轉為空字串', () => {
    const sparse = [{ id: 'x', name: null, price: 1, unit: 'day' }] as unknown as Row[];
    expect(rowsToAoa(columns, sparse)[1][0]).toBe('');
  });

  it('rows 為空時只有標題列', () =>
    expect(rowsToAoa(columns, [])).toHaveLength(1));
});
```

- [ ] **Step 2: 跑測試確認失敗**

```bash
npx nx test ui
```
Expected: FAIL，訊息為找不到模組 `./data-table-export`

- [ ] **Step 3: 寫最小實作**

Create `libs/ui/src/lib/data-table/data-table-export.ts`：

```ts
import { DataTableColumn } from './data-table.types';

export function exportFileName(name: string, date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  return `${name}-${stamp}.xlsx`;
}

/** 把資料列轉成 SheetJS 的 aoa（array of arrays）：第一列是標題。 */
export function rowsToAoa<T>(
  columns: DataTableColumn<T>[],
  rows: readonly T[],
): (string | number)[][] {
  const cols = columns.filter((c) => !c.exportSkip);
  const header = cols.map((c) => c.label);
  const body = rows.map((row) =>
    cols.map((col) => {
      const raw = col.exportValue
        ? col.exportValue(row)
        : (row as Record<string, unknown>)[col.key];
      if (raw === null || raw === undefined) return '';
      return typeof raw === 'number' ? raw : String(raw);
    }),
  );
  return [header, ...body];
}
```

- [ ] **Step 4: 跑測試確認通過**

```bash
npx nx test ui
```
Expected: PASS（9 個測試）

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/lib/data-table
git diff --cached --name-only
git commit -m "feat(ui): DataTable 匯出純函式（檔名格式與 aoa 轉換）

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: 標準模式渲染（原生 table + `data-label`）

**Files:**
- Create: `libs/ui/src/lib/data-table/data-table.component.ts`
- Create: `libs/ui/src/lib/data-table/data-table.component.html`
- Create: `libs/ui/src/lib/data-table/data-table.component.scss`
- Test: `libs/ui/src/lib/data-table/data-table.component.spec.ts`
- Modify: `libs/ui/src/index.ts`

**Interfaces:**
- Consumes: `DataTableColumn`、`DataTableLabels`、`DataTableMobileMode`（Task 1）、`DataTableCellDirective`、`DataTableCellContext`（Task 2）
- Produces: `DataTableComponent<T>`，selector `lib-data-table`，inputs：`columns`、`rows`、`rowId`、`mobile`、`exportName`、`showExport`、`emptyText`、`labels`（required）

本 task 只做標準模式的 DOM 渲染。匯出鈕、展開鈕、逃生門在後續 task 加入。

- [ ] **Step 1: 寫失敗的測試**

Create `libs/ui/src/lib/data-table/data-table.component.spec.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { DataTableCellDirective } from './data-table-cell.directive';
import { DataTableColumn, DataTableLabels } from './data-table.types';

interface Row {
  id: string;
  name: string;
  status: 'available' | 'rented';
  mileage: number;
}

const LABELS: DataTableLabels = {
  exportExcel: '匯出 Excel',
  expandRow: '展開詳細資料',
  collapseRow: '收合詳細資料',
};

@Component({
  imports: [DataTableComponent, DataTableCellDirective],
  template: `
    <lib-data-table
      [columns]="columns()"
      [rows]="rows()"
      [labels]="labels"
      emptyText="目前沒有資料"
    >
      <ng-template dtCell="status" let-row>
        <span class="chip">{{ row.status }}</span>
      </ng-template>
    </lib-data-table>
  `,
})
class HostComponent {
  readonly labels = LABELS;
  readonly columns = signal<DataTableColumn<Row>[]>([
    { key: 'name', label: '車牌', primary: true },
    { key: 'status', label: '狀態', primary: true },
    { key: 'mileage', label: '里程', align: 'end' },
  ]);
  readonly rows = signal<Row[]>([
    { id: 'v1', name: 'ABC-123', status: 'available', mileage: 12000 },
    { id: 'v2', name: 'XYZ-789', status: 'rented', mileage: 34000 },
  ]);
}

describe('DataTableComponent 標準模式', () => {
  let el: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('渲染出原生 table 元素', () => {
    expect(el.querySelector('table')).toBeTruthy();
  });

  it('表頭來自 columns 的 label', () => {
    const heads = [...el.querySelectorAll('thead th')].map((th) => th.textContent?.trim());
    expect(heads.slice(0, 3)).toEqual(['車牌', '狀態', '里程']);
  });

  it('每個 td 都帶上對應欄位的 data-label', () => {
    const firstRowCells = [...el.querySelectorAll('tbody tr')[0].querySelectorAll('td')];
    expect(firstRowCells.slice(0, 3).map((td) => td.getAttribute('data-label'))).toEqual([
      '車牌',
      '狀態',
      '里程',
    ]);
  });

  it('沒有 dtCell template 的欄位直接印 row[key]', () => {
    const cell = el.querySelector('tbody tr td[data-label="車牌"]');
    expect(cell?.textContent?.trim()).toBe('ABC-123');
  });

  it('有 dtCell template 的欄位改用 template 渲染', () => {
    const cell = el.querySelector('tbody tr td[data-label="狀態"]');
    expect(cell?.querySelector('.chip')?.textContent?.trim()).toBe('available');
  });

  it('align 欄位加上對齊 class', () => {
    const cell = el.querySelector('tbody tr td[data-label="里程"]');
    expect(cell?.classList.contains('dt-align-end')).toBe(true);
  });

  it('值為 null 時渲染空字串而非 "null"', async () => {
    fixture.componentInstance.rows.set([
      { id: 'v3', name: null, status: 'available', mileage: 0 } as unknown as Row,
    ]);
    await fixture.whenStable();
    const cell = el.querySelector('tbody tr td[data-label="車牌"]');
    expect(cell?.textContent?.trim()).toBe('');
  });

  it('rows 為空時顯示 emptyText 且不渲染 table', async () => {
    fixture.componentInstance.rows.set([]);
    await fixture.whenStable();
    expect(el.querySelector('table')).toBeNull();
    expect(el.textContent).toContain('目前沒有資料');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

```bash
npx nx test ui
```
Expected: FAIL，找不到模組 `./data-table.component`

- [ ] **Step 3: 寫元件邏輯**

Create `libs/ui/src/lib/data-table/data-table.component.ts`：

```ts
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  input,
} from '@angular/core';
import { DataTableCellContext, DataTableCellDirective } from './data-table-cell.directive';
import { DataTableColumn, DataTableLabels, DataTableMobileMode } from './data-table.types';

type ResolvedColumn<T> = DataTableColumn<T> & { primary: boolean };

@Component({
  selector: 'lib-data-table',
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T> {
  readonly columns = input<DataTableColumn<T>[]>([]);
  readonly rows = input<readonly T[]>([]);
  readonly rowId = input<(row: T) => unknown>((row) => (row as { id: unknown }).id);
  readonly mobile = input<DataTableMobileMode | null>(null);
  readonly exportName = input('export');
  readonly showExport = input(true);
  readonly emptyText = input('');
  readonly labels = input.required<DataTableLabels>();

  private readonly cellDirectives = contentChildren(DataTableCellDirective<T>);

  protected readonly mobileMode = computed<DataTableMobileMode>(() => this.mobile() ?? 'cards');

  protected readonly cellTemplates = computed(() => {
    const map = new Map<string, TemplateRef<DataTableCellContext<T>>>();
    for (const directive of this.cellDirectives()) {
      map.set(directive.dtCell(), directive.template);
    }
    return map;
  });

  /** 沒有任何欄位標 primary 時，第一欄自動視為 primary，避免手機卡片整張空白。 */
  protected readonly resolvedColumns = computed<ResolvedColumn<T>[]>(() => {
    const cols = this.columns();
    const hasPrimary = cols.some((c) => c.primary);
    return cols.map((col, i) => ({ ...col, primary: hasPrimary ? !!col.primary : i === 0 }));
  });

  protected readonly isEmpty = computed(() => this.rows().length === 0);

  protected cellContext(row: T): DataTableCellContext<T> {
    return { $implicit: row };
  }

  protected valueOf(row: T, key: string): string {
    const value = (row as Record<string, unknown>)[key];
    return value === null || value === undefined ? '' : String(value);
  }
}
```

- [ ] **Step 4: 寫模板**

Create `libs/ui/src/lib/data-table/data-table.component.html`：

```html
<div class="dt-wrap" [class.dt-wrap--scroll]="mobileMode() === 'scroll'">
  @if (isEmpty()) {
    <p class="dt-empty">{{ emptyText() }}</p>
  } @else {
    <table class="dt-table">
      <thead>
        <tr>
          @for (col of resolvedColumns(); track col.key) {
            <th scope="col" [class]="'dt-align-' + (col.align ?? 'start')">{{ col.label }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track rowId()(row)) {
          <tr>
            @for (col of resolvedColumns(); track col.key) {
              <td
                [attr.data-label]="col.label"
                [class]="'dt-align-' + (col.align ?? 'start')"
                [class.is-secondary]="!col.primary"
              >
                @if (cellTemplates().get(col.key); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="cellContext(row)"
                  />
                } @else {
                  {{ valueOf(row, col.key) }}
                }
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  }
</div>
```

- [ ] **Step 5: 寫桌機樣式**

Create `libs/ui/src/lib/data-table/data-table.component.scss`：

```scss
:host {
  display: block;
}

.dt-wrap {
  overflow-x: auto;
}

.dt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.dt-table thead tr {
  text-align: left;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.dt-table th {
  color: var(--mat-sys-on-surface-variant);
  font-weight: 500;
  padding: 0.75rem 1rem;
}

.dt-table td {
  padding: 0.75rem 1rem;
  color: inherit;
}

.dt-table tbody tr {
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.dt-table tbody tr:last-child {
  border-bottom: 0;
}

.dt-align-start {
  text-align: left;
}

.dt-align-end {
  text-align: right;
}

.dt-empty {
  font-size: 0.875rem;
  color: var(--mat-sys-on-surface-variant);
  padding: 0.75rem 1rem;
}
```

- [ ] **Step 6: 更新 barrel**

`libs/ui/src/index.ts`：

```ts
export * from './lib/data-table/data-table.types';
export * from './lib/data-table/data-table-cell.directive';
export * from './lib/data-table/data-table-slot.directives';
export * from './lib/data-table/data-table.component';
```

- [ ] **Step 7: 跑測試確認通過**

```bash
npx nx test ui
```
Expected: PASS（Task 3 的 9 個 + 本 task 的 8 個）

```bash
npm run lint:theme
```
Expected: PASS（樣式只用 `--mat-sys-*` token）

- [ ] **Step 8: Commit**

```bash
git add libs/ui/src
git diff --cached --name-only
git commit -m "feat(ui): DataTable 標準模式渲染，td 自動注入 data-label

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: 手機版卡片轉換（純 CSS，不換 DOM）

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.scss`
- Test: `libs/ui/src/lib/data-table/data-table.component.spec.ts`（新增一個 describe 區塊）

**Interfaces:**
- Consumes: Task 4 的 `.dt-table` / `data-label` / `.is-secondary`
- Produces: 640px 以下的卡片版面。無新 API。

**關鍵約束：`thead` 必須「視覺隱藏」而非 `display: none`。** SheetJS 讀 DOM 時會跳過 `display: none` 的節點，若手機版把表頭設為 `display: none`，逃生門模式（Task 7）匯出的 Excel 會少掉標題列——而且只在手機發生，桌機測不出來。

- [ ] **Step 1: 寫失敗的測試**

在 `data-table.component.spec.ts` 末尾追加：

```ts
describe('DataTableComponent 手機版 DOM 不變性', () => {
  it('thead 不使用 display:none（SheetJS 會跳過隱藏節點）', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const scss = await import('./data-table.component.scss?raw');
    const mobileBlock = (scss.default as string).split('@media (max-width: 640px)')[1] ?? '';
    expect(mobileBlock).toContain('clip-path');
    expect(mobileBlock).not.toMatch(/thead[^}]*display:\s*none/);
  });

  it('非 primary 欄位帶 is-secondary class（供手機版收合）', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const mileageCell = el.querySelector('tbody tr td[data-label="里程"]');
    const plateCell = el.querySelector('tbody tr td[data-label="車牌"]');
    expect(mileageCell?.classList.contains('is-secondary')).toBe(true);
    expect(plateCell?.classList.contains('is-secondary')).toBe(false);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

```bash
npx nx test ui
```
Expected: 第一個測試 FAIL（`clip-path` 尚未寫入 SCSS）；第二個測試 PASS（Task 4 已實作）

- [ ] **Step 3: 加上手機版樣式**

在 `data-table.component.scss` 末尾追加：

```scss
@media (max-width: 640px) {
  // scroll 模式：保留表格形態，改為橫向捲動（合併儲存格的報表硬拆成卡片會讀不懂）
  .dt-wrap--scroll {
    overflow-x: auto;
  }

  .dt-wrap:not(.dt-wrap--scroll) {
    .dt-table,
    .dt-table tbody,
    .dt-table tr,
    .dt-table td {
      display: block;
      width: auto;
    }

    // 視覺隱藏而非 display:none —— SheetJS 會跳過 display:none 的節點，
    // 否則手機上匯出的 Excel 會少掉標題列。
    .dt-table thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      white-space: nowrap;
      clip-path: inset(50%);
    }

    .dt-table tbody tr {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 1rem;
      padding: 0.875rem 1rem;
      margin-bottom: 0.75rem;
    }

    .dt-table tbody tr:last-child {
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      margin-bottom: 0;
    }

    .dt-table td {
      padding: 0.25rem 0;
      text-align: left; // 手機版一律靠左，覆蓋 dt-align-end
    }

    .dt-table td::before {
      content: attr(data-label);
      display: block;
      font-size: 0.75rem;
      line-height: 1.4;
      color: var(--mat-sys-on-surface-variant);
    }

    .dt-table td.is-secondary {
      display: none;
    }

    .dt-table tbody tr.is-expanded td.is-secondary {
      display: block;
    }
  }
}
```

- [ ] **Step 4: 跑測試確認通過**

```bash
npx nx test ui
npm run lint:theme
```
Expected: 兩者皆 PASS

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/lib/data-table
git diff --cached --name-only
git commit -m "feat(ui): DataTable 手機版純 CSS 卡片轉換，DOM 保持不變

thead 用 clip-path 視覺隱藏而非 display:none，避免 SheetJS 跳過標題列。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: 展開／收合次要欄位

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.component.html`
- Modify: `libs/ui/src/lib/data-table/data-table.component.scss`
- Test: `libs/ui/src/lib/data-table/data-table.component.spec.ts`

**Interfaces:**
- Consumes: Task 4 的 `resolvedColumns`、`rowId`
- Produces: `DataTableComponent` 新增 protected `hasSecondary`、`isExpanded(row)`、`toggle(row)`。DOM 上多一個 `<th class="dt-expand-head">` 與每列一個 `<td class="dt-expand-cell">`。

- [ ] **Step 1: 寫失敗的測試**

在 `data-table.component.spec.ts` 末尾追加：

```ts
describe('DataTableComponent 展開／收合', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('有次要欄位時每列渲染一顆展開鈕', () => {
    expect(el.querySelectorAll('tbody .dt-expand-btn')).toHaveLength(2);
  });

  it('展開鈕預設 aria-expanded 為 false', () => {
    const btn = el.querySelector('tbody .dt-expand-btn');
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
  });

  it('點擊後該列加上 is-expanded，且 DOM 節點數不變', async () => {
    const before = el.querySelectorAll('tbody td').length;
    (el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr')[0].classList.contains('is-expanded')).toBe(true);
    expect(el.querySelectorAll('tbody td').length).toBe(before);
  });

  it('展開一列不影響其他列', async () => {
    (el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr')[1].classList.contains('is-expanded')).toBe(false);
  });

  it('再次點擊收合', async () => {
    const btn = el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    btn.click();
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr')[0].classList.contains('is-expanded')).toBe(false);
  });

  it('展開時 aria-label 換成收合文案', async () => {
    const btn = el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    expect(btn.getAttribute('aria-label')).toBe('收合詳細資料');
  });

  it('所有欄位都是 primary 時不渲染展開鈕', async () => {
    fixture.componentInstance.columns.set([
      { key: 'name', label: '車牌', primary: true },
      { key: 'status', label: '狀態', primary: true },
    ]);
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody .dt-expand-btn')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

```bash
npx nx test ui
```
Expected: 上述 7 個測試 FAIL（找不到 `.dt-expand-btn`）

- [ ] **Step 3: 加上元件邏輯**

在 `data-table.component.ts` 的 import 加入 `signal`，並在 class 內 `valueOf` 之前插入：

```ts
  protected readonly hasSecondary = computed(() =>
    this.resolvedColumns().some((col) => !col.primary),
  );

  private readonly expandedIds = signal<ReadonlySet<unknown>>(new Set());

  protected isExpanded(row: T): boolean {
    return this.expandedIds().has(this.rowId()(row));
  }

  protected toggle(row: T): void {
    const id = this.rowId()(row);
    const next = new Set(this.expandedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.expandedIds.set(next);
  }
```

- [ ] **Step 4: 加上模板**

在 `data-table.component.html` 的 `<thead>` 的 `@for` 之後、`</tr>` 之前插入：

```html
          @if (hasSecondary()) {
            <th scope="col" class="dt-expand-head"></th>
          }
```

把 `<tbody>` 的 `<tr>` 開頭改為帶 class 綁定：

```html
          <tr [class.is-expanded]="isExpanded(row)">
```

在 `<tbody>` 的 `@for (col of ...)` 區塊之後、`</tr>` 之前插入：

```html
            @if (hasSecondary()) {
              <td class="dt-expand-cell">
                <button
                  type="button"
                  class="dt-expand-btn"
                  [attr.aria-expanded]="isExpanded(row)"
                  [attr.aria-label]="isExpanded(row) ? labels().collapseRow : labels().expandRow"
                  (click)="toggle(row)"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" />
                  </svg>
                </button>
              </td>
            }
```

- [ ] **Step 5: 加上樣式**

在 `data-table.component.scss` 桌機區塊（`@media` 之前）追加：

```scss
// 桌機所有欄位本就可見，展開鈕僅在手機出現
.dt-expand-head,
.dt-expand-cell {
  display: none;
}

.dt-expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--mat-sys-on-surface-variant);
  cursor: pointer;
}
```

在 `@media (max-width: 640px)` 的 `.dt-wrap:not(.dt-wrap--scroll)` 區塊內追加：

```scss
    .dt-expand-cell {
      display: block;
      padding: 0.25rem 0 0;
    }

    .dt-expand-cell::before {
      content: none; // 展開鈕不需要 data-label
    }

    tr.is-expanded .dt-expand-btn svg {
      transform: rotate(180deg);
    }
```

- [ ] **Step 6: 跑測試確認通過**

```bash
npx nx test ui
npm run lint:theme
```
Expected: 兩者皆 PASS

- [ ] **Step 7: Commit**

```bash
git add libs/ui/src/lib/data-table
git diff --cached --name-only
git commit -m "feat(ui): DataTable 手機版次要欄位展開／收合

展開只切換 class，DOM 節點數不變，不影響匯出。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: 逃生門模式（`dtHead` / `dtBody`）

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.component.html`
- Test: `libs/ui/src/lib/data-table/data-table.component.spec.ts`

**Interfaces:**
- Consumes: `DataTableHeadDirective`、`DataTableBodyDirective`（Task 2）
- Produces: `DataTableComponent` 新增 protected `isCustom`；`mobileMode` 的預設值改為「逃生門 → `scroll`，標準 → `cards`」

本輪不會有頁面用到逃生門模式，但介面必須一併實作並測試——否則業主真的提出合併儲存格報表時，仍會走上「另外手刻一張表」的老路，這正是本專案原本的問題。

- [ ] **Step 1: 寫失敗的測試**

在 `data-table.component.spec.ts` 末尾追加：

```ts
@Component({
  imports: [DataTableComponent, DataTableHeadDirective, DataTableBodyDirective],
  template: `
    <lib-data-table [columns]="columns" [labels]="labels" exportName="settlement">
      <ng-template dtHead>
        <tr>
          <th rowspan="2">合作夥伴</th>
          <th colspan="2">本季</th>
        </tr>
        <tr>
          <th>訂單數</th>
          <th>退佣</th>
        </tr>
      </ng-template>
      <ng-template dtBody>
        <tr>
          <td>海邊民宿</td>
          <td>12</td>
          <td>3600</td>
        </tr>
      </ng-template>
    </lib-data-table>
  `,
})
class CustomHostComponent {
  readonly labels = LABELS;
  // 逃生門模式下應被忽略
  readonly columns: DataTableColumn<unknown>[] = [{ key: 'ignored', label: '不該出現' }];
}

describe('DataTableComponent 逃生門模式', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CustomHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CustomHostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('渲染頁面提供的 thead，保留 colspan / rowspan', () => {
    expect(el.querySelector('thead th[rowspan="2"]')?.textContent?.trim()).toBe('合作夥伴');
    expect(el.querySelector('thead th[colspan="2"]')?.textContent?.trim()).toBe('本季');
  });

  it('忽略 columns，不渲染其 label', () => {
    expect(el.textContent).not.toContain('不該出現');
  });

  it('不注入 data-label', () => {
    expect(el.querySelector('tbody td[data-label]')).toBeNull();
  });

  it('不渲染展開鈕', () => {
    expect(el.querySelector('.dt-expand-btn')).toBeNull();
  });

  it('mobile 預設為 scroll', () => {
    expect(el.querySelector('.dt-wrap')?.classList.contains('dt-wrap--scroll')).toBe(true);
  });

  it('rows 為空也不顯示 emptyText（列由 dtBody 決定）', () => {
    expect(el.querySelector('table')).toBeTruthy();
  });
});
```

同時在檔案頂端的 import 補上：

```ts
import { DataTableBodyDirective, DataTableHeadDirective } from './data-table-slot.directives';
```

- [ ] **Step 2: 跑測試確認失敗**

```bash
npx nx test ui
```
Expected: 上述 6 個測試 FAIL

- [ ] **Step 3: 加上元件邏輯**

在 `data-table.component.ts` 的 import 加入 `contentChild`，並把 `mobileMode` 之前的區塊改為：

```ts
  private readonly cellDirectives = contentChildren(DataTableCellDirective<T>);
  protected readonly headDirective = contentChild(DataTableHeadDirective);
  protected readonly bodyDirective = contentChild(DataTableBodyDirective);

  /** dtHead 存在即進入逃生門模式：不讀 columns、不注入 data-label、不生卡片。 */
  protected readonly isCustom = computed(() => this.headDirective() != null);

  protected readonly mobileMode = computed<DataTableMobileMode>(
    () => this.mobile() ?? (this.isCustom() ? 'scroll' : 'cards'),
  );
```

並把 `isEmpty` 改為逃生門模式下恆為 false：

```ts
  protected readonly isEmpty = computed(() => !this.isCustom() && this.rows().length === 0);
```

檔案頂端 import 補上：

```ts
import { DataTableBodyDirective, DataTableHeadDirective } from './data-table-slot.directives';
```

- [ ] **Step 4: 加上模板分支**

把 `data-table.component.html` 的 `<table class="dt-table">` 內容改為兩個分支：

```html
    <table class="dt-table">
      @if (isCustom()) {
        <thead>
          <ng-container [ngTemplateOutlet]="headDirective()!.template" />
        </thead>
        <tbody>
          <ng-container [ngTemplateOutlet]="bodyDirective()!.template" />
        </tbody>
      } @else {
        <!-- Task 4 / Task 6 既有的 thead 與 tbody 原封不動放在這裡 -->
      }
    </table>
```

- [ ] **Step 5: 跑測試確認通過**

```bash
npx nx test ui
```
Expected: PASS（全部測試）

- [ ] **Step 6: Commit**

```bash
git add libs/ui/src/lib/data-table
git diff --cached --name-only
git commit -m "feat(ui): DataTable 逃生門模式，頁面可自行接管 thead/tbody

供未來合併儲存格報表使用，手機版預設 scroll 而非 cards。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8: Excel 匯出接線

**Files:**
- Modify: `package.json`（新增 `xlsx` 依賴）
- Modify: `libs/ui/src/lib/data-table/data-table-export.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.component.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.component.html`
- Modify: `libs/ui/src/lib/data-table/data-table.component.scss`
- Test: `libs/ui/src/lib/data-table/data-table-export.spec.ts`

**Interfaces:**
- Consumes: `rowsToAoa`、`exportFileName`（Task 3）、`isCustom`（Task 7）
- Produces: `exportRows<T>(columns, rows, name): Promise<void>`、`exportTableElement(el: HTMLTableElement, name: string): Promise<void>`；元件新增 `exportFailed` output（`OutputEmitterRef<Error>`）

**安裝注意：`xlsx` 不能從 npm registry 裝。** SheetJS 自 2023 年起停止發布到 npm，registry 上的版本停在舊版且帶已知漏洞（prototype pollution、ReDoS）。必須從官方 CDN 安裝 tarball。

- [ ] **Step 1: 安裝 xlsx**

先確認官方最新版號：

```bash
curl -s https://cdn.sheetjs.com/ | grep -oE 'xlsx-[0-9]+\.[0-9]+\.[0-9]+' | head -1
```

用查到的版號安裝（下方 `<版本>` 替換為上一步的結果）：

```bash
npm i --legacy-peer-deps https://cdn.sheetjs.com/xlsx-<版本>/xlsx-<版本>.tgz
```

驗證：

```bash
node -e "console.log(require('./package.json').dependencies.xlsx)"
```
Expected: 印出 `https://cdn.sheetjs.com/...` 開頭的字串（**不是** `^0.18.5` 這種 registry 版號——若是，代表裝錯來源，須移除重裝）

- [ ] **Step 2: 寫失敗的測試**

在 `data-table-export.spec.ts` 頂端 import 補上 `vi`、`beforeEach`，並在檔案末尾追加：

```ts
const writeFile = vi.fn();
const aoaToSheet = vi.fn(() => ({ mock: 'ws-aoa' }));
const tableToSheet = vi.fn(() => ({ mock: 'ws-dom' }));
const bookAppendSheet = vi.fn();

vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: (...args: unknown[]) => aoaToSheet(...args),
    table_to_sheet: (...args: unknown[]) => tableToSheet(...args),
    book_new: () => ({ mock: 'wb' }),
    book_append_sheet: (...args: unknown[]) => bookAppendSheet(...args),
  },
  writeFile: (...args: unknown[]) => writeFile(...args),
}));

describe('exportRows（標準模式：從資料匯出）', () => {
  beforeEach(() => vi.clearAllMocks());

  it('用 aoa_to_sheet，內容為 rowsToAoa 的結果', async () => {
    const { exportRows } = await import('./data-table-export');
    await exportRows(columns, rows, 'add-ons');
    expect(aoaToSheet).toHaveBeenCalledWith(rowsToAoa(columns, rows));
  });

  it('檔名帶入 exportName 與日期', async () => {
    const { exportRows } = await import('./data-table-export');
    await exportRows(columns, rows, 'add-ons');
    expect(writeFile.mock.calls[0][1]).toMatch(/^add-ons-\d{8}\.xlsx$/);
  });
});

describe('exportTableElement（逃生門模式：從 DOM 匯出）', () => {
  beforeEach(() => vi.clearAllMocks());

  it('用 table_to_sheet 並傳入該 table 節點', async () => {
    const { exportTableElement } = await import('./data-table-export');
    const table = document.createElement('table');
    await exportTableElement(table, 'settlement');
    expect(tableToSheet).toHaveBeenCalledWith(table);
  });
});
```

- [ ] **Step 3: 跑測試確認失敗**

```bash
npx nx test ui
```
Expected: FAIL，`exportRows` / `exportTableElement` 未匯出

- [ ] **Step 4: 實作兩條匯出路徑**

在 `data-table-export.ts` 末尾追加：

```ts
async function writeWorkbook(sheet: unknown, name: string): Promise<void> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet as never, 'Sheet1');
  XLSX.writeFile(workbook, exportFileName(name));
}

/**
 * 標準模式：從資料匯出，與畫面完全脫鉤。
 * 日後若加上分頁或虛擬捲動也不會變成「只匯出當前頁」。
 */
export async function exportRows<T>(
  columns: DataTableColumn<T>[],
  rows: readonly T[],
  name: string,
): Promise<void> {
  const XLSX = await import('xlsx');
  await writeWorkbook(XLSX.utils.aoa_to_sheet(rowsToAoa(columns, rows)), name);
}

/**
 * 逃生門模式：從 DOM 匯出，colspan / rowspan 會轉為 Excel 的合併儲存格。
 * 這是 exportRows 做不到的，代價是與畫面耦合。
 */
export async function exportTableElement(el: HTMLTableElement, name: string): Promise<void> {
  const XLSX = await import('xlsx');
  await writeWorkbook(XLSX.utils.table_to_sheet(el), name);
}
```

- [ ] **Step 5: 元件接線**

在 `data-table.component.ts` 的 import 補上 `output`、`viewChild`、`ElementRef`，以及匯出函式：

```ts
import { exportRows, exportTableElement } from './data-table-export';
```

在 class 內追加：

```ts
  /** 匯出失敗（多半是 xlsx 動態載入失敗）時通知使用端顯示 snackbar。 */
  readonly exportFailed = output<Error>();

  private readonly tableEl = viewChild<ElementRef<HTMLTableElement>>('tableEl');

  protected readonly canExport = computed(() => this.showExport() && !this.isEmpty());

  protected async runExport(): Promise<void> {
    try {
      if (this.isCustom()) {
        const el = this.tableEl()?.nativeElement;
        if (!el) return;
        await exportTableElement(el, this.exportName());
      } else {
        await exportRows(this.columns(), this.rows(), this.exportName());
      }
    } catch (e) {
      this.exportFailed.emit(e as Error);
    }
  }
```

- [ ] **Step 6: 模板加上匯出鈕與 table 參考**

`data-table.component.html`：在 `<div class="dt-wrap" ...>` 之前插入工具列，並給 table 加 `#tableEl`：

```html
@if (canExport()) {
  <div class="dt-toolbar">
    <button type="button" class="dt-export-btn" (click)="runExport()">
      {{ labels().exportExcel }}
    </button>
  </div>
}
```

```html
    <table class="dt-table" #tableEl>
```

- [ ] **Step 7: 匯出鈕樣式**

在 `data-table.component.scss` 桌機區塊追加：

```scss
.dt-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 0 0.5rem;
}

.dt-export-btn {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--mat-sys-outline-variant);
  border-radius: 999px;
  background: transparent;
  color: var(--mat-sys-on-surface-variant);
  font-size: 0.8125rem;
  cursor: pointer;
}

.dt-export-btn:hover {
  background: var(--mat-sys-surface-container-high);
}
```

- [ ] **Step 8: 跑測試確認通過**

```bash
npx nx test ui
npm run lint:theme
npx nx build ui
```
Expected: 三者皆 PASS

- [ ] **Step 9: Commit**

```bash
git add libs/ui package.json package-lock.json
git diff --cached --name-only
git commit -m "feat(ui): DataTable 內建 Excel 匯出（資料路徑 + DOM 路徑）

xlsx 從官方 CDN 安裝（npm registry 版本已停更且有漏洞），以動態
import 載入避免進主 bundle。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 9: i18n 文案 + admin 共用 labels

**Files:**
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts`
- Create: `apps/admin/src/app/shared/ui/data-table-labels.ts`

**Interfaces:**
- Consumes: `DataTableLabels`（Task 1）
- Produces: `ADMIN_DATA_TABLE_LABELS: DataTableLabels`，供 admin 全部 9 頁 import，避免每頁重複組裝

**注意：`apps/admin/src/app/core/i18n/zh-tw.ts` 目前有未提交的修改**（見 `git status`）。只在 `common` 區塊末端追加三行，不要動到其他部分，commit 時**只 add 這一個檔案**且需確認 diff 僅含新增的三行。

- [ ] **Step 1: 追加 i18n 文案**

在 `zh-tw.ts` 的 `common` 物件內、`noResults` 之後追加：

```ts
    exportExcel: '匯出 Excel',
    expandRow: '展開詳細資料',
    collapseRow: '收合詳細資料',
```

- [ ] **Step 2: 建立共用 labels 常數**

Create `apps/admin/src/app/shared/ui/data-table-labels.ts`：

```ts
import { DataTableLabels } from '@car-rental/ui';
import { ZH_TW } from '../../core/i18n/zh-tw';

/** admin 全站共用的 DataTable 文案，避免每頁重複組裝。 */
export const ADMIN_DATA_TABLE_LABELS: DataTableLabels = {
  exportExcel: ZH_TW.common.exportExcel,
  expandRow: ZH_TW.common.expandRow,
  collapseRow: ZH_TW.common.collapseRow,
};
```

- [ ] **Step 3: 驗證編譯**

```bash
npx nx build admin
```
Expected: 成功

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/core/i18n/zh-tw.ts apps/admin/src/app/shared/ui/data-table-labels.ts
git diff --cached          # 確認 zh-tw.ts 只多了三行
git commit -m "feat(admin): DataTable i18n 文案與共用 labels 常數

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 10: 遷移 `add-ons`（首發驗證）

**Files:**
- Modify: `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.ts`
- Modify: `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.html`

**Interfaces:**
- Consumes: `DataTableComponent`、`DataTableCellDirective`、`DataTableColumn`（`@car-rental/ui`）、`ADMIN_DATA_TABLE_LABELS`（Task 9）
- Produces: 遷移範本，後續 8 頁比照辦理

4 欄、無 status chip、actions 只有兩顆固定按鈕——最單純的一頁，用來驗證整條路走得通。

- [ ] **Step 1: 改 component ts**

`add-ons-page.component.ts`：移除 `MatTableModule` 的 import 與 `imports` 陣列項目，改為：

```ts
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
```

`imports` 陣列改為：

```ts
  imports: [
    DataTableComponent,
    DataTableCellDirective,
    MatButtonModule,
    PageToolbarComponent,
    HeaderToolbarDirective,
  ],
```

把 `readonly columns = ['name', 'unitPrice', 'unit', 'actions'];` 換成：

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<AddOn>[] = [
    { key: 'name', label: this.t.addOn.name, primary: true },
    { key: 'unitPrice', label: this.t.addOn.unitPrice, primary: true, align: 'end' },
    {
      key: 'unit',
      label: this.t.addOn.unit,
      exportValue: (a) => this.t.addOn.unitLabels[a.unit],
    },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  onExportFailed(e: Error): void {
    this.snackBar.open(e.message, undefined, { duration: 3000 });
  }
```

- [ ] **Step 2: 改模板**

`add-ons-page.component.html`：把 `@if (store.addOns().length === 0) { ... } @else { ... }` 整段（含 `.ui-card` 包裝）換成：

```html
  <div class="ui-card !p-0">
    <lib-data-table
      [columns]="columns"
      [rows]="store.addOns()"
      [labels]="labels"
      [emptyText]="t.common.empty"
      exportName="add-ons"
      (exportFailed)="onExportFailed($event)"
    >
      <ng-template dtCell="unit" let-a>{{ t.addOn.unitLabels[a.unit] }}</ng-template>
      <ng-template dtCell="actions" let-a>
        <button mat-button (click)="openForm(a)">{{ t.common.edit }}</button>
        <button mat-button color="warn" (click)="remove(a)">{{ t.common.delete }}</button>
      </ng-template>
    </lib-data-table>
  </div>
```

- [ ] **Step 3: 驗證建置與型別**

```bash
npx nx build admin
```
Expected: 成功，且無 `MatTableModule` 未使用的警告

- [ ] **Step 4: 手動驗證（開發伺服器）**

```bash
lsof -ti:5200 | xargs -r kill
npx nx serve admin --port 5200 > /tmp/admin-serve.log 2>&1 &
```

等待啟動後：

```bash
curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:5200/
```
Expected: `200`

在瀏覽器開 `http://localhost:5200/add-ons` 逐項確認：
1. 桌機寬度：表格外觀與遷移前一致（欄位順序、邊框、間距）
2. 視窗縮到 375px：每列變成卡片，「名稱」「單價」可見，「計價單位」「操作」收起
3. 點展開鈕：卡片展開顯示其餘欄位，箭頭轉向
4. 點「匯出 Excel」：下載 `add-ons-YYYYMMDD.xlsx`，開啟後有標題列「名稱／單價／計價單位」（**不含**「操作」欄），資料列與畫面一致
5. **在 375px 寬度下再匯出一次**：內容與桌機匯出完全相同（驗證 §5.2 的 `clip-path` 決策）

- [ ] **Step 5: 關閉伺服器並 commit**

```bash
lsof -ti:5200 | xargs -r kill
git add apps/admin/src/app/features/add-ons
git diff --cached --name-only
git commit -m "refactor(admin): add-ons 改用 DataTable，手機版轉卡片並支援匯出

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 11: 遷移 `commission` 與 `partners`

**Files:**
- Modify: `apps/admin/src/app/features/commission/pages/commission-page.component.{ts,html}`
- Modify: `apps/admin/src/app/features/partners/pages/partners-page.component.{ts,html}`

**Interfaces:**
- Consumes: 同 Task 10
- Produces: 無新 API

- [ ] **Step 1: 遷移 `commission`**

ts：移除 `MatTableModule`，加入 `DataTableComponent`、`ADMIN_DATA_TABLE_LABELS`。`columns` 換成（`commission` 無 actions 欄、無自訂儲存格，因此不需要 `DataTableCellDirective`）：

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<CommissionRow>[] = [
    { key: 'bookingId', label: this.t.commission.bookingId, primary: true },
    { key: 'vehicleLabel', label: this.t.commission.vehicleLabel, primary: true },
    {
      key: 'period',
      label: this.t.commission.period,
      exportValue: (r) => `${r.startTime} ~ ${r.endTime}`,
    },
    { key: 'rentalSubtotal', label: this.t.commission.rentalSubtotal, align: 'end' },
    { key: 'commission', label: this.t.commission.commissionAmount, align: 'end' },
  ];
```

`CommissionRow` 的實際型別以 `report()!.rows` 的元素型別為準，從既有 store 匯入。

html：換成

```html
  <lib-data-table
    [columns]="columns"
    [rows]="report()!.rows"
    [labels]="labels"
    [emptyText]="t.common.empty"
    exportName="commission"
    (exportFailed)="onExportFailed($event)"
  >
    <ng-template dtCell="period" let-r>{{ r.startTime }} ~ {{ r.endTime }}</ng-template>
  </lib-data-table>
```

- [ ] **Step 2: 遷移 `partners`**

ts：`columns` 換成

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Partner>[] = [
    { key: 'name', label: this.t.partner.name, primary: true },
    { key: 'slug', label: this.t.partner.slug, primary: true },
    { key: 'discountPercent', label: this.t.partner.discountPercent, align: 'end' },
    {
      key: 'commission',
      label: this.t.partner.commissionType,
      exportValue: (p) => this.t.partner.commissionTypeLabels[p.commissionType],
    },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];
```

html 的 `dtCell` 需要兩個：`commission`（型別標籤）與 `actions`（複製連結／編輯／刪除三顆按鈕，內容照搬既有 `matColumnDef="actions"` 的 `<td>` 內容）。

- [ ] **Step 3: 驗證**

```bash
npx nx build admin
```
Expected: 成功

開發伺服器逐頁確認（同 Task 10 Step 4 的五項檢查），特別確認 `partners` 的「複製連結」按鈕仍可運作。

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/features/commission apps/admin/src/app/features/partners
git diff --cached --name-only
git commit -m "refactor(admin): commission/partners 改用 DataTable

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 12: 遷移 `vehicles` 與 `coupons`

**Files:**
- Modify: `apps/admin/src/app/features/vehicles/pages/vehicles-page.component.{ts,html}`
- Modify: `apps/admin/src/app/features/coupons/pages/coupons-page.component.{ts,html}`

**Interfaces:**
- Consumes: 同 Task 10，另加 `StatusChipComponent`（`vehicles` 既有）
- Produces: 無新 API

- [ ] **Step 1: 遷移 `vehicles`**

ts：`columns` 換成

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Vehicle>[] = [
    { key: 'plateNumber', label: this.t.vehicle.plateNumber, primary: true },
    {
      key: 'category',
      label: this.t.vehicle.type,
      exportValue: (v) => this.t.vehicle.typeLabels[v.category],
    },
    { key: 'model', label: this.t.vehicle.model },
    {
      key: 'status',
      label: this.t.vehicle.status,
      primary: true,
      exportValue: (v) => this.t.vehicle.statusLabels[v.status],
    },
    { key: 'mileage', label: this.t.vehicle.mileage, align: 'end' },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];
```

html：`dtCell` 需要 `category`、`status`（含 `app-status-chip`，照搬既有內容）、`actions`。

- [ ] **Step 2: 遷移 `coupons`**

ts：`columns` 換成

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Coupon>[] = [
    { key: 'code', label: this.t.coupon.code, primary: true },
    {
      key: 'type',
      label: this.t.coupon.type,
      primary: true,
      exportValue: (c) => this.t.coupon.typeLabels[c.type],
    },
    { key: 'value', label: this.t.coupon.value, align: 'end' },
    { key: 'minDays', label: this.t.coupon.minDays, align: 'end' },
    {
      key: 'applicableCategories',
      label: this.t.coupon.applicableCategories,
      exportValue: (c) =>
        c.applicableCategories?.length
          ? c.applicableCategories.map((k) => this.t.vehicle.typeLabels[k]).join('、')
          : this.t.common.all,
    },
    {
      key: 'period',
      label: this.t.coupon.validFrom,
      exportValue: (c) => `${c.validFrom} ~ ${c.validTo}`,
    },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];
```

html：`dtCell` 需要 `type`、`applicableCategories`、`period`、`actions`，內容照搬既有 `matColumnDef` 的 `<td>`。

- [ ] **Step 3: 驗證**

```bash
npx nx build admin
```
Expected: 成功

開發伺服器逐頁確認（同 Task 10 Step 4）。`coupons` 特別確認「適用車型為全部」時匯出顯示「全部」而非空白。

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/features/vehicles apps/admin/src/app/features/coupons
git diff --cached --name-only
git commit -m "refactor(admin): vehicles/coupons 改用 DataTable

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 13: 遷移 `pricing`（8 欄，手機版最吃緊）

**Files:**
- Modify: `apps/admin/src/app/features/pricing/pages/pricing-page.component.{ts,html}`

**Interfaces:**
- Consumes: 同 Task 10
- Produces: 無新 API

8 欄是全專案最多的一頁，是驗證「主要欄位 + 展開」是否真的可用的關鍵頁面。只標 2 個 primary。

- [ ] **Step 1: 改 ts**

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<PricingPlan>[] = [
    { key: 'name', label: this.t.pricing.name, primary: true },
    {
      key: 'appliesToCategory',
      label: this.t.pricing.appliesToCategory,
      primary: true,
      exportValue: (p) => this.t.vehicle.typeLabels[p.appliesToCategory],
    },
    { key: 'weekday', label: this.t.pricing.weekday, align: 'end', exportValue: (p) => p.dayTypeRates.weekday },
    { key: 'weekend', label: this.t.pricing.weekend, align: 'end', exportValue: (p) => p.dayTypeRates.weekend },
    { key: 'holiday', label: this.t.pricing.holiday, align: 'end', exportValue: (p) => p.dayTypeRates.holiday },
    { key: 'peak', label: this.t.pricing.peak, align: 'end', exportValue: (p) => p.dayTypeRates.peak },
    { key: 'tiers', label: this.t.pricing.tiers, exportValue: (p) => this.tiersSummary(p) },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];
```

四個費率欄的值來自 `p.dayTypeRates.*`，不是 `p[key]`，因此**顯示與匯出都必須自訂**：`exportValue` 已處理匯出，顯示則需 `dtCell`。

- [ ] **Step 2: 改模板**

`dtCell` 需要 `appliesToCategory`、`weekday`、`weekend`、`holiday`、`peak`、`tiers`、`actions`，例如：

```html
      <ng-template dtCell="weekday" let-p>{{ p.dayTypeRates.weekday }}</ng-template>
```

- [ ] **Step 3: 驗證**

```bash
npx nx build admin
```
Expected: 成功

開發伺服器在 375px 寬度確認：卡片收合時只顯示「方案名稱」「適用車型」，展開後四個費率與級距摘要都在，卡片高度可接受（不超過約 1.5 個螢幕）。若收合態仍過長，調整 primary 標記而非改元件。

匯出確認：8 欄的 Excel 有 7 個欄位（不含操作），四個費率欄有值而非空白。

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/features/pricing
git diff --cached --name-only
git commit -m "refactor(admin): pricing 改用 DataTable，8 欄手機版採主要欄位+展開

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 14: 遷移 `customers` 與 `maintenance`（手刻表格）

**Files:**
- Modify: `apps/admin/src/app/features/bookings/pages/customers-page.component.{ts,html}`
- Modify: `apps/admin/src/app/features/maintenance/pages/maintenance-page.component.{ts,html}`

**Interfaces:**
- Consumes: 同 Task 10
- Produces: 無新 API

這兩頁本來就是手刻 `<table>` + `.table-cell` class，遷移時把 `<thead>`/`<tbody>` 的內容轉成 `columns` + `dtCell`，並移除 `.table-cell` / `.table-row` class（樣式改由元件提供）。

- [ ] **Step 1: 遷移 `customers`**

依既有 `<th>` 順序建立 columns（欄位 key 以 `Customer` 型別的屬性名為準）：

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Customer>[] = [
    { key: 'name', label: this.t.customer.name, primary: true },
    { key: 'phone', label: this.t.customer.phone, primary: true },
    { key: 'idNumber', label: this.t.customer.idNumber },
    { key: 'note', label: this.t.customer.note },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];
```

若既有 `<thead>` 共 6 個 `<th>`，第 6 欄依實際模板補上對應定義——**不要憑空刪欄**。

- [ ] **Step 2: 遷移 `maintenance`**

`maintenance` 的表格有 8 個 `<th>`，依既有順序建立：

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<MaintenanceRecord>[] = [
    { key: 'vehicleId', label: this.t.booking.vehicle, primary: true, exportValue: (r) => this.plateOf(r.vehicleId) },
    { key: 'type', label: this.t.maintenance.type, primary: true, exportValue: (r) => this.t.maintenance.typeLabels[r.type] },
    { key: 'performedAt', label: this.t.maintenance.performedAt },
    { key: 'mileageAtService', label: this.t.maintenance.mileageAtService, align: 'end' },
    { key: 'nextDueMileage', label: this.t.maintenance.nextDueMileage, align: 'end' },
    { key: 'nextDueDate', label: this.t.maintenance.nextDueDate },
    { key: 'cost', label: this.t.maintenance.cost, align: 'end' },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];
```

實際 key 名稱與第 8 欄以既有模板為準。**只遷移「保養紀錄」那張表，不動上方的保養警示 chip 區塊。**

- [ ] **Step 3: 驗證**

```bash
npx nx build admin
```
Expected: 成功

開發伺服器逐頁確認（同 Task 10 Step 4）。`maintenance` 特別確認上方的保養警示區塊未被影響（該區塊在 commit `51daf6c` 修過視覺重疊問題）。

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/features/bookings/pages/customers-page.component.ts apps/admin/src/app/features/bookings/pages/customers-page.component.html apps/admin/src/app/features/maintenance
git diff --cached --name-only
git commit -m "refactor(admin): customers/maintenance 改用 DataTable

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 15: 遷移 `bookings`（條件式 actions，最複雜）

**Files:**
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.{ts,html}`

**Interfaces:**
- Consumes: 同 Task 10，另加既有的 `StatusChipComponent`
- Produces: 無新 API

actions 欄是依 `b.status` 分支的 4 組按鈕（`confirmPayment` / `pickUp` + `edit` / `complete` / `cancelBooking`）——這正是「元件不該接管儲存格內容」的最佳例證，整段 `@if` 鏈原封不動搬進 `dtCell="actions"`。

- [ ] **Step 1: 改 ts**

```ts
  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Booking>[] = [
    { key: 'vehicleId', label: this.t.booking.vehicle, primary: true, exportValue: (b) => this.plateOf(b.vehicleId) },
    { key: 'customerId', label: this.t.booking.customer, primary: true, exportValue: (b) => this.customerStore.nameOf(b.customerId) },
    { key: 'startTime', label: this.t.booking.startTime, exportValue: (b) => this.fmt(b.startTime) },
    { key: 'endTime', label: this.t.booking.endTime, exportValue: (b) => this.fmt(b.endTime) },
    { key: 'status', label: this.t.booking.status, primary: true, exportValue: (b) => this.t.booking.statusLabels[b.status] },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];
```

- [ ] **Step 2: 改模板**

```html
  <lib-data-table
    [columns]="columns"
    [rows]="filteredBookings()"
    [labels]="labels"
    [emptyText]="t.common.empty"
    exportName="bookings"
    (exportFailed)="onExportFailed($event)"
  >
    <ng-template dtCell="vehicleId" let-b>{{ plateOf(b.vehicleId) }}</ng-template>
    <ng-template dtCell="customerId" let-b>{{ customerStore.nameOf(b.customerId) }}</ng-template>
    <ng-template dtCell="startTime" let-b>{{ fmt(b.startTime) }}</ng-template>
    <ng-template dtCell="endTime" let-b>{{ fmt(b.endTime) }}</ng-template>
    <ng-template dtCell="status" let-b>
      <app-status-chip [label]="t.booking.statusLabels[b.status]" [status]="statusKeyOf(b)" />
    </ng-template>
    <ng-template dtCell="actions" let-b>
      <!-- 既有的四段 @if 分支原封不動搬進來 -->
    </ng-template>
  </lib-data-table>
```

`dtCell="actions"` 內容直接複製既有 `<td class="... action-cell">` 內的四段 `@if` 鏈，只把變數名 `b` 對齊 `let-b`。

- [ ] **Step 3: 驗證**

```bash
npx nx build admin
```
Expected: 成功

開發伺服器確認：**每一種訂單狀態**（`pending_payment` / `confirmed` / `in_progress` / 已完成 / 已取消）的按鈕組合與遷移前完全一致。這是本 task 最容易出錯的地方，必須逐狀態點過。手機版確認按鈕在卡片內不擠成一團。

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/features/bookings/pages/bookings-page.component.ts apps/admin/src/app/features/bookings/pages/bookings-page.component.html
git diff --cached --name-only
git commit -m "refactor(admin): bookings 改用 DataTable，條件式 actions 走 dtCell 插槽

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 16: 遷移 `affiliate/partner-account`

**Files:**
- Modify: `apps/affiliate/src/app/features/partner-account/partner-account.component.{ts,html}`

**Interfaces:**
- Consumes: `DataTableComponent`、`DataTableColumn`、`DataTableLabels`（`@car-rental/ui`）
- Produces: 無新 API

**affiliate 沒有 i18n 機制**，欄位標題目前是寫死的中文。本輪維持寫死，只是從 `<th>` 搬進 `columns` config——建立 affiliate 的 i18n 不在本計畫範圍。

**affiliate 沒有 import Angular Material**，因此本頁不得引入任何 `mat-*` 元件（這正是元件用原生 `<button>` 的原因）。

- [ ] **Step 1: 改 ts**

加入：

```ts
import { DataTableColumn, DataTableComponent, DataTableLabels } from '@car-rental/ui';
```

`imports` 陣列加入 `DataTableComponent`，並在 class 內加入：

```ts
  readonly tableLabels: DataTableLabels = {
    exportExcel: '匯出 Excel',
    expandRow: '展開詳細資料',
    collapseRow: '收合詳細資料',
  };

  readonly commissionColumns: DataTableColumn<CommissionLine>[] = [
    { key: 'bookingId', label: '訂單編號', primary: true, exportValue: (l) => l.booking.id },
    {
      key: 'period',
      label: '租期',
      exportValue: (l) => `${l.booking.startTime.slice(0, 10)} ~ ${l.booking.endTime.slice(0, 10)}`,
    },
    { key: 'days', label: '天數', align: 'end' },
    {
      key: 'rentalSubtotal',
      label: '租金小計',
      align: 'end',
      exportValue: (l) => l.booking.priceBreakdown?.rentalSubtotal ?? '',
    },
    { key: 'commission', label: '退佣', primary: true, align: 'end' },
  ];
```

`CommissionLine` 型別以 `a.commissionLines` 的元素型別為準。若該型別沒有 `id` 屬性，必須額外傳 `[rowId]`（例如 `(l) => l.booking.id`），否則 `track` 會拿到 `undefined`。

- [ ] **Step 2: 改模板**

把整個 `<table class="commission-table">` 區塊換成：

```html
    <lib-data-table
      [columns]="commissionColumns"
      [rows]="a.commissionLines"
      [rowId]="commissionRowId"
      [labels]="tableLabels"
      emptyText="目前沒有訂單紀錄"
      exportName="commission"
    >
      <ng-template dtCell="bookingId" let-l>{{ l.booking.id }}</ng-template>
      <ng-template dtCell="period" let-l>
        {{ l.booking.startTime | slice: 0 : 10 }} ~ {{ l.booking.endTime | slice: 0 : 10 }}
      </ng-template>
      <ng-template dtCell="rentalSubtotal" let-l>
        {{ l.booking.priceBreakdown?.rentalSubtotal }}
      </ng-template>
    </lib-data-table>
```

`commissionRowId` 在 ts 定義為 `readonly commissionRowId = (l: CommissionLine) => l.booking.id;`

模板用到 `slice` pipe，`imports` 需保留 `SlicePipe`；並加入 `DataTableCellDirective`。

- [ ] **Step 3: 移除舊樣式**

刪除 `partner-account.component` 中 `.commission-table` 相關的 SCSS 規則（樣式改由元件提供）。

- [ ] **Step 4: 驗證**

```bash
npx nx build affiliate
```
Expected: 成功

```bash
lsof -ti:5201 | xargs -r kill
npx nx serve affiliate --port 5201 > /tmp/affiliate-serve.log 2>&1 &
curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:5201/
```
Expected: `200`

瀏覽器確認桌機表格、375px 卡片、匯出三項皆正常，且**沒有引入 Material 樣式導致的視覺跑掉**。

- [ ] **Step 5: 關閉伺服器並 commit**

```bash
lsof -ti:5201 | xargs -r kill
git add apps/affiliate/src/app/features/partner-account
git diff --cached --name-only
git commit -m "refactor(affiliate): partner-account 退佣明細改用 DataTable

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 17: 清理殘留

**Files:**
- Modify: `apps/admin/src/app/app.scss`（移除表格全域樣式）
- Modify: 各遷移頁面（確認 `MatTableModule` 已全數移除）

**Interfaces:**
- Consumes: 無
- Produces: 無

**注意：`apps/admin/src/app/app.scss` 目前有未提交的修改**，只刪除表格相關規則，不要動到其他部分。

- [ ] **Step 1: 確認沒有殘留使用者**

```bash
grep -rn "MatTableModule\|mat-table\|matColumnDef" apps/ libs/
```
Expected: 無輸出

```bash
grep -rn "table-cell\|table-head\|table-row" apps/
```
Expected: 無輸出（若有，代表某頁尚未遷移完全）

- [ ] **Step 2: 移除全域表格樣式**

從 `apps/admin/src/app/app.scss` 刪除 `.table-head`、`.table-cell`、`.table-cell--body`、`.table-row`、`.table-row:last-child` 五條規則（原位於第 65–85 行附近）。

- [ ] **Step 3: 全量驗證**

```bash
npx nx test ui
npx nx test admin
npx nx build admin
npx nx build affiliate
npm run lint:theme
npx nx lint ui
```
Expected: 全部 PASS

- [ ] **Step 4: 確認 xlsx 未進主 bundle**

```bash
npx nx build admin 2>&1 | grep -iE "lazy|chunk" | head -20
```
Expected: 輸出中可見獨立的 lazy chunk（xlsx 以 `await import()` 載入）。若 `xlsx` 出現在 initial bundle，代表某處用了靜態 import，須改回動態。

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/app.scss
git diff --cached           # 確認只刪了表格樣式規則
git commit -m "chore(admin): 移除已被 DataTable 取代的全域表格樣式

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review 紀錄

**Spec 覆蓋檢查**：

| Spec 章節 | 對應 Task |
|---|---|
| §1 建 `libs/ui` | Task 1 |
| §4.1 標準模式 API | Task 1（型別）、Task 2（指令）、Task 4（渲染） |
| §4.2 逃生門模式 | Task 2（指令）、Task 7 |
| §4.3 輸入一覽 | Task 4（多數）、Task 8（`showExport`） |
| §5.1 CSS-only 響應式 | Task 5 |
| §5.2 `thead` 視覺隱藏 | Task 5（含專門測試） |
| §5.3 主要欄位 + 展開 | Task 6 |
| §6.1 兩條匯出路徑 | Task 8 |
| §6.2 SheetJS 安裝注意 | Task 8 Step 1 |
| §6.3 匯出鈕位置 | Task 8 Step 6 |
| §7 lib 位置與約束 | Task 1、Global Constraints |
| §8 i18n | Task 9、Task 16 |
| §9 遷移順序 | Task 10–16 |
| §10 測試 | Task 3–8 各自的測試步驟 |
| §11 邊界情況 | Task 4（null、空 rows）、Task 6（全 primary、無 primary）、Task 8（匯出失敗） |

**§11 未覆蓋項目**：「逃生門模式又傳了 `columns` → `console.warn`」在 Task 7 只測了「忽略 columns」，未實作 warn。判定為 YAGNI，不實作——測試已保證行為正確，多一個 warn 對開發者的幫助有限。

**型別一致性檢查**：`DataTableColumn` / `DataTableLabels` / `DataTableMobileMode`（Task 1）、`DataTableCellContext`（Task 2）、`exportFileName` / `rowsToAoa` / `exportRows` / `exportTableElement`（Task 3、8）在後續 task 的引用名稱與簽章皆一致。元件 selector 全文統一為 `lib-data-table`（依 `libs/ui` 的 `prefix: "lib"`）。
