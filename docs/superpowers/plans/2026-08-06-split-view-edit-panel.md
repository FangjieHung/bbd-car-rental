# Split View 編輯面板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 點 `add-ons` 頁表格的某一列，右側滑出該筆資料的編輯表單，開合狀態放在 URL query param。

**Architecture:** 三層切開。`DataTableComponent` 只多知道「哪一列被選了」；新的 `SplitPanelComponent` 只管容器與版面、不知道自己裝什麼；URL 與資料的接線留在頁面。表單先從 dialog 解耦成獨立元件，讓 dialog 與面板裝的是同一張表單。

**Tech Stack:** Angular 22（zoneless + signal）、Nx 23、Vitest、Angular Material（僅 apps 使用）。

**Spec:** [`docs/superpowers/specs/2026-08-06-split-view-edit-panel-design.md`](../specs/2026-08-06-split-view-edit-panel-design.md)

## Global Constraints

- **必須在 git worktree 內作業。** 動工前用 `superpowers:using-git-worktrees` 從 `main` 建立隔離工作區。主 checkout 可能有其他 session 的未提交改動。
- **每個 bash 指令以 `cd <worktree 絕對路徑> && unset NX_WORKSPACE_ROOT_PATH &&` 開頭。** 該環境變數從父 session 繼承、指向主 checkout，不 unset 會讓 `nx` 寫錯目錄。
- Angular 22 zoneless + signal：`ChangeDetectionStrategy.OnPush`、`input()` / `input.required()` / `output()` / `signal()` / `computed()` / `effect()`。**不使用 `@Input()` 裝飾器。**
- `SplitPanelComponent` 的窄螢幕覆蓋模式是 modal：必須處理焦點進入／返回、焦點陷阱與 `aria-modal`；寬螢幕並排時不應宣告 modal。
- **`libs/ui` 不得 import `@angular/material` 或 `libs/domain`**，且**不得內建任何使用者可見字串**——所有文案由 input 傳入。（元件內丟出的開發者診斷錯誤不受此限，見 `data-table.component.ts:32-34` 既有註解。）
- **SCSS 顏色只用 `--mat-sys-*` token**，不寫死色碼。改動 `apps/` 底下的樣式後必須跑 `npm run lint:theme`（該腳本只掃 `apps/`，但 `libs/ui` 仍須遵守同一約束）。
- **既有斷點 `max-width: 640px` 不得更動**，那是表格轉卡片的線。面板用新的 `max-width: 1024px`。
- **`data-table.component.scss` 內既有的 `@media (max-width: 640px)` 只能有一個區塊**——`data-table.component.spec.ts` 有一個讀 SCSS 原始碼的守衛測試會用 `split('@media (max-width: 640px)')[1]` 取出該區塊。新規則追加在既有區塊內，不可另開第二個。
- 測試用 Vitest：`import { describe, it, expect } from 'vitest'`，**測試名稱用繁體中文**。
- commit 前必須跑 `git diff --cached --name-only`；**禁止 `git add -A` / `git add .`**。
- commit message 結尾加上：`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

---

## File Structure

```
libs/ui/src/lib/
  data-table/
    data-table.component.ts       # 修改：selectable / selectedId / rowClick / onRowClick / isSelected
    data-table.component.html     # 修改：標準模式 <tr> 的 class 與 click 綁定
    data-table.component.scss     # 修改：.is-selectable / .is-selected（桌機與手機各一處）
    data-table.component.spec.ts  # 修改：新增 6 個列點選測試
  split-panel/
    split-panel.component.ts      # 新增
    split-panel.component.html    # 新增
    split-panel.component.scss    # 新增
    split-panel.component.spec.ts # 新增
libs/ui/src/index.ts              # 修改：匯出 SplitPanelComponent

apps/admin/src/app/
  app.config.ts                             # 修改：provideRouter 加 withComponentInputBinding()
  app.scss                                  # 修改：.split-shell / .split-main 版面
  core/i18n/zh-tw.ts                         # 修改：common 追加三個鍵
  features/add-ons/
    forms/add-on-form.component.ts           # 新增：從 dialog 抽出的表單
    forms/add-on-form.component.html         # 新增
    forms/add-on-form.component.spec.ts      # 新增
    dialogs/add-on-dialog.component.{ts,html}# 修改：退化為薄殼
    pages/add-ons-page.component.{ts,html}   # 修改：URL 接線與面板
    pages/add-ons-page.component.spec.ts     # 新增（此頁目前無 spec 檔）
```

---

## Task 1: `DataTableComponent` 加入列點選

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.component.html`
- Modify: `libs/ui/src/lib/data-table/data-table.component.scss`
- Test: `libs/ui/src/lib/data-table/data-table.component.spec.ts`

**Interfaces:**
- Consumes: 既有的 `rowId`、`isCustom`、`resolvedColumns`
- Produces: `selectable: InputSignal<boolean>`、`selectedId: InputSignal<unknown>`、`rowClick: OutputEmitterRef<T>`；`<tr>` 上的 `is-selectable` / `is-selected` class

- [ ] **Step 1: 寫失敗的測試**

在 `data-table.component.spec.ts` 末尾追加。**這個檔案已有既有的 `HostComponent`（含 `dtCell="status"` 與 `dtCell="actions"`）與逃生門用的 host，請先讀過再寫**，新測試需要一個帶按鈕的 actions 欄與展開鈕才能驗證冒泡處理：

```ts
@Component({
  imports: [DataTableComponent, DataTableCellDirective],
  template: `
    <lib-data-table
      [columns]="columns()"
      [rows]="rows"
      [labels]="labels"
      [selectable]="selectable()"
      [selectedId]="selectedId()"
      (rowClick)="clicked.push($event)"
    >
      <ng-template dtCell="actions" let-row>
        <button type="button" class="del-btn" (click)="deleted.push(row)">刪除</button>
      </ng-template>
    </lib-data-table>
  `,
})
class SelectHostComponent {
  readonly labels = LABELS;
  readonly rows = [
    { id: 'r1', name: '甲', note: '註一' },
    { id: 'r2', name: '乙', note: '註二' },
  ];
  readonly selectable = signal(true);
  readonly selectedId = signal<unknown>(null);
  readonly clicked: { id: string }[] = [];
  readonly deleted: { id: string }[] = [];
  readonly columns = signal<DataTableColumn<{ id: string; name: string; note: string }>[]>([
    { key: 'name', label: '名稱', primary: true },
    { key: 'note', label: '備註' },
    { key: 'actions', label: '操作', exportSkip: true },
  ]);
}

describe('DataTableComponent 列點選', () => {
  let fixture: ComponentFixture<SelectHostComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(SelectHostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('selectable 為 true 時點列發出 rowClick，帶正確的那一列', () => {
    (el.querySelectorAll('tbody tr')[1] as HTMLElement).click();
    expect(fixture.componentInstance.clicked).toHaveLength(1);
    expect(fixture.componentInstance.clicked[0].id).toBe('r2');
  });

  it('selectable 為 false 時點列不發出 rowClick，且無 is-selectable class', async () => {
    fixture.componentInstance.selectable.set(false);
    await fixture.whenStable();
    (el.querySelectorAll('tbody tr')[0] as HTMLElement).click();
    expect(fixture.componentInstance.clicked).toHaveLength(0);
    expect(el.querySelector('tbody tr')?.classList.contains('is-selectable')).toBe(false);
  });

  it('點 actions 欄的按鈕不會發出 rowClick，按鈕本身的行為照常', () => {
    (el.querySelector('tbody tr .del-btn') as HTMLElement).click();
    expect(fixture.componentInstance.deleted).toHaveLength(1);
    expect(fixture.componentInstance.clicked).toHaveLength(0);
  });

  it('點展開鈕不會發出 rowClick，展開行為照常', async () => {
    (el.querySelector('tbody tr .dt-expand-btn') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clicked).toHaveLength(0);
    expect(el.querySelectorAll('tbody tr')[0].classList.contains('is-expanded')).toBe(true);
  });

  it('selectedId 命中的那一列有 is-selected，其餘沒有', async () => {
    fixture.componentInstance.selectedId.set('r2');
    await fixture.whenStable();
    const trs = el.querySelectorAll('tbody tr');
    expect(trs[0].classList.contains('is-selected')).toBe(false);
    expect(trs[1].classList.contains('is-selected')).toBe(true);
  });
});

describe('DataTableComponent 逃生門模式不支援列點選', () => {
  it('逃生門模式下傳 selectable 不會發出 rowClick', async () => {
    // 沿用本檔既有的逃生門 host 寫法（dtHead + dtBody），額外傳 [selectable]="true"，
    // 點 tbody 內任一列後確認沒有 rowClick 發出。
    // 逃生門模式的 tbody 由頁面提供，DataTableComponent 不擁有 <tr>，無從掛載。
  });
});
```

最後一個 describe 的內容請依本檔既有的 `CustomHostComponent` 樣式補完（該 host 已存在，加上 `[selectable]="true"` 與一個 `(rowClick)` 收集器即可）。

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test ui`
Expected: FAIL，`selectable` / `selectedId` / `rowClick` 不存在

- [ ] **Step 3: 加元件邏輯**

`data-table.component.ts` 在 `labels` input 之後（第 46 行後）插入：

```ts
  /** 開啟列點選：加上游標與 hover 樣式，點列時發出 rowClick。預設關閉。 */
  readonly selectable = input(false);

  /** 目前選中的列（值為 rowId() 的回傳）。用於在該列加上 is-selected 樣式。 */
  readonly selectedId = input<unknown>(null);

  /** 點了某一列。點在按鈕／連結／表單元素上時不會發出。 */
  readonly rowClick = output<T>();
```

並在 `toggle()` 之後（第 103 行後）插入：

```ts
  /** 逃生門模式的 tbody 由頁面提供，元件不擁有 <tr>，無從掛載列點選。 */
  protected readonly rowSelectable = computed(() => {
    const on = this.selectable();
    if (on && this.isCustom()) {
      console.warn('DataTable：逃生門模式不支援 selectable，已忽略');
      return false;
    }
    return on;
  });

  protected isSelected(row: T): boolean {
    return this.rowSelectable() && this.rowId()(row) === this.selectedId();
  }

  /**
   * 點在互動元素上不算「選取這一列」。
   * 刻意在元件內判斷來源，而非要求每個頁面對 actions 欄自己加 stopPropagation——
   * 那種作法一定會有人漏掉，而漏掉的症狀是「點刪除時同時開了面板」。
   */
  protected onRowClick(row: T, event: MouseEvent): void {
    if (!this.rowSelectable()) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, label')) return;
    this.rowClick.emit(row);
  }
```

Spec §4.2 已允許保留 click 綁定、在 `onRowClick` 第一行提早返回；這是目前採用的實作，行為仍是未開啟時不發事件、無游標與 hover 樣式。

- [ ] **Step 4: 改模板**

`data-table.component.html` 標準模式的 `<tr>`（目前是 `<tr [class.is-expanded]="isExpanded(row)">`）改為：

```html
            <tr
              [class.is-expanded]="isExpanded(row)"
              [class.is-selectable]="rowSelectable()"
              [class.is-selected]="isSelected(row)"
              (click)="onRowClick(row, $event)"
            >
```

**逃生門分支的 `<tbody>` 不動。**

- [ ] **Step 5: 加樣式**

`data-table.component.scss` 在 `@media (max-width: 640px)` **之前**的桌機區塊追加：

```scss
.dt-table tbody tr.is-selectable {
  cursor: pointer;
}

.dt-table tbody tr.is-selectable:hover {
  background: var(--mat-sys-surface-container);
}

.dt-table tbody tr.is-selected {
  background: var(--mat-sys-secondary-container);
}

.dt-table tbody tr.is-selected td:first-child {
  box-shadow: inset 3px 0 0 var(--mat-sys-primary);
}
```

並在**既有的** `@media (max-width: 640px)` 內的 `.dt-wrap:not(.dt-wrap--scroll)` 區塊追加（卡片模式下 `td:first-child` 的左緣指示條沒有意義，改用邊框）：

```scss
    .dt-table tbody tr.is-selected {
      border-color: var(--mat-sys-primary);
    }

    .dt-table tbody tr.is-selected td:first-child {
      box-shadow: none;
    }
```

**不要另開第二個 `@media (max-width: 640px)` 區塊**——守衛測試會失準。

- [ ] **Step 6: 跑測試與 lint**

```bash
npx nx test ui
npx nx lint ui
npx nx build ui
```
Expected: 全部 PASS（既有 49 個 + 本 task 的 6 個 = 55）

- [ ] **Step 7: Commit**

```bash
git add libs/ui/src/lib/data-table
git diff --cached --name-only
git commit -m "feat(ui): DataTable 加入列點選（selectable / selectedId / rowClick）

點在按鈕、連結、表單元素上不算選取，判斷寫在元件內，頁面零負擔。
逃生門模式不擁有 <tr>，不支援列點選。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: `SplitPanelComponent`

**Files:**
- Create: `libs/ui/src/lib/split-panel/split-panel.component.{ts,html,scss}`
- Test: `libs/ui/src/lib/split-panel/split-panel.component.spec.ts`
- Modify: `libs/ui/src/index.ts`

**Interfaces:**
- Consumes: 無
- Produces: `SplitPanelComponent`，selector `lib-split-panel`。Inputs：`open: boolean`、`heading: string`、`closeLabel: string`（required）。Output：`closed: void`。內容以 `<ng-content>` 投影。

- [ ] **Step 1: 寫失敗的測試**

Create `libs/ui/src/lib/split-panel/split-panel.component.spec.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SplitPanelComponent } from './split-panel.component';

@Component({
  imports: [SplitPanelComponent],
  template: `
    <lib-split-panel
      [open]="open()"
      heading="編輯配件"
      closeLabel="關閉面板"
      (closed)="closedCount = closedCount + 1"
    >
      <p class="projected">表單內容</p>
    </lib-split-panel>
  `,
})
class HostComponent {
  readonly open = signal(false);
  closedCount = 0;
}

describe('SplitPanelComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('open 為 false 時不渲染投影內容', () => {
    expect(el.querySelector('.projected')).toBeNull();
  });

  it('open 為 true 時渲染投影內容', async () => {
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.projected')?.textContent).toBe('表單內容');
  });

  it('顯示 heading', async () => {
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.sp-heading')?.textContent?.trim()).toBe('編輯配件');
  });

  it('關閉鈕的 aria-label 來自 closeLabel input', async () => {
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.sp-close')?.getAttribute('aria-label')).toBe('關閉面板');
  });

  it('點關閉鈕發出 closed', async () => {
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    (el.querySelector('.sp-close') as HTMLElement).click();
    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('點遮罩發出 closed', async () => {
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    (el.querySelector('.sp-scrim') as HTMLElement).click();
    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('按 Esc 發出 closed', async () => {
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('關閉狀態下按 Esc 不發出 closed', async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.closedCount).toBe(0);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test ui`
Expected: FAIL，找不到模組 `./split-panel.component`

- [ ] **Step 3: 寫元件**

Create `libs/ui/src/lib/split-panel/split-panel.component.ts`：

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * 右側滑出的面板容器。寬螢幕與內容並排、窄螢幕全螢幕覆蓋。
 * 這個元件不知道自己裝的是什麼——內容由使用端投影進來。
 */
@Component({
  selector: 'lib-split-panel',
  templateUrl: './split-panel.component.html',
  styleUrl: './split-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class SplitPanelComponent {
  readonly open = input(false);
  readonly heading = input('');
  /** 關閉鈕的 aria-label。libs/ui 不內建字串，由使用端傳入。 */
  readonly closeLabel = input.required<string>();
  /** 使用者要求關閉：點關閉鈕、按 Esc、或點窄螢幕的遮罩。 */
  readonly closed = output<void>();

  protected onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
```

- [ ] **Step 4: 寫模板**

Create `libs/ui/src/lib/split-panel/split-panel.component.html`：

```html
@if (open()) {
  <div class="sp-scrim" (click)="closed.emit()"></div>
  <aside class="sp-panel" role="dialog" aria-modal="true" [attr.aria-label]="heading()">
    <header class="sp-header">
      <h2 class="sp-heading">{{ heading() }}</h2>
      <button
        type="button"
        class="sp-close"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </header>
    <div class="sp-body">
      <ng-content />
    </div>
  </aside>
}
```

- [ ] **Step 5: 寫樣式**

Create `libs/ui/src/lib/split-panel/split-panel.component.scss`：

```scss
:host {
  display: contents;
}

.sp-panel {
  flex: 0 0 420px;
  width: 420px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--mat-sys-outline-variant);
  border-radius: 1rem;
  background: var(--mat-sys-surface);
  overflow: hidden;
}

.sp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.sp-heading {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.sp-close {
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

.sp-close:hover {
  background: var(--mat-sys-surface-container-high);
}

.sp-body {
  padding: 1rem;
  overflow-y: auto;
}

.sp-scrim {
  display: none;
}

// 窄螢幕：面板全螢幕覆蓋。這條線是 1024px 而非表格的 640px——
// 表格加上 420px 的面板，在 900px 視窗裡會讓表格只剩約 480px，八欄的頁面無法閱讀。
@media (max-width: 1024px) {
  .sp-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 10;
    background: color-mix(in srgb, var(--mat-sys-scrim) 40%, transparent);
  }

  .sp-panel {
    position: fixed;
    inset: 0;
    z-index: 11;
    flex: none;
    width: auto;
    border: 0;
    border-radius: 0;
    animation: sp-slide-in 180ms ease-out;
  }
}

@keyframes sp-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

- [ ] **Step 6: 更新 barrel**

`libs/ui/src/index.ts` 末尾追加：

```ts
export * from './lib/split-panel/split-panel.component';
```

- [ ] **Step 7: 跑測試、lint、建置**

```bash
npx nx test ui
npx nx lint ui
npx nx build ui
```
Expected: 全部 PASS（包含 Task 1 的 55 個與本 Task 新增的開關、焦點、modal 模式測試）。

**注意**：`lib-split-panel` 是元素 selector，`libs/ui/eslint.config.mjs` 要求 `lib` 前綴——符合，不需要 eslint override。

- [ ] **Step 8: Commit**

```bash
git add libs/ui/src/lib/split-panel libs/ui/src/index.ts
git diff --cached --name-only
git commit -m "feat(ui): 新增 SplitPanelComponent，寬螢幕並排、窄螢幕全螢幕覆蓋

面板不知道自己裝什麼，內容由使用端投影。斷點 1024px，與表格的 640px 分工不同。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: 把 `add-ons` 表單從 dialog 解耦

**Files:**
- Create: `apps/admin/src/app/features/add-ons/forms/add-on-form.component.{ts,html}`
- Test: `apps/admin/src/app/features/add-ons/forms/add-on-form.component.spec.ts`
- Modify: `apps/admin/src/app/features/add-ons/dialogs/add-on-dialog.component.{ts,html}`
- Modify: `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.ts`（`AddOnFormResult` 的 import 路徑）

**Interfaces:**
- Consumes: 既有的 `AddOn` model、`ZH_TW`
- Produces: `AddOnFormComponent`，selector `app-add-on-form`。Input：`value: AddOn | null`。Outputs：`saved: AddOnFormResult`、`cancelled: void`。型別 `AddOnFormResult = Omit<AddOn, 'id'>` **搬到 form 檔案匯出**。

- [ ] **Step 1: 寫失敗的測試**

Create `apps/admin/src/app/features/add-ons/forms/add-on-form.component.spec.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AddOn } from '../../../core/models';
import { AddOnFormComponent, AddOnFormResult } from './add-on-form.component';

const A: AddOn = { id: 'a1', name: '兒童座椅', unitPrice: 200, unit: 'per_day' };
const B: AddOn = { id: 'a2', name: '接送服務', unitPrice: 500, unit: 'per_rental' };

@Component({
  imports: [AddOnFormComponent],
  template: `
    <app-add-on-form
      [value]="value()"
      (saved)="savedResults.push($event)"
      (cancelled)="cancelledCount = cancelledCount + 1"
    />
  `,
})
class HostComponent {
  readonly value = signal<AddOn | null>(A);
  readonly savedResults: AddOnFormResult[] = [];
  cancelledCount = 0;
}

describe('AddOnFormComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  const nameInput = () => el.querySelector('input[formControlName="name"]') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('初始帶入 value 的內容', () => {
    expect(nameInput().value).toBe('兒童座椅');
  });

  // 這是 spec §7.3 那個陷阱的守衛：面板可能不換實例只換資料，
  // 表單必須響應 value 變化。dialog 每次開都是新實例，所以這條在 dialog 模式永遠不會失敗。
  it('value 從 A 換成 B 時，表單欄位跟著換成 B 的內容', async () => {
    fixture.componentInstance.value.set(B);
    await fixture.whenStable();
    expect(nameInput().value).toBe('接送服務');
  });

  it('value 換成 null 時，表單重設為新增用的空白值', async () => {
    fixture.componentInstance.value.set(null);
    await fixture.whenStable();
    expect(nameInput().value).toBe('');
  });

  it('按儲存發出 saved，帶目前的表單值', () => {
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    expect(fixture.componentInstance.savedResults).toHaveLength(1);
    expect(fixture.componentInstance.savedResults[0]).toEqual({
      name: '兒童座椅',
      unitPrice: 200,
      unit: 'per_day',
    });
  });

  it('表單無效時按儲存不發出 saved', async () => {
    const input = nameInput();
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    expect(fixture.componentInstance.savedResults).toHaveLength(0);
  });

  it('按取消發出 cancelled', () => {
    (el.querySelector('button.cancel-btn') as HTMLButtonElement).click();
    expect(fixture.componentInstance.cancelledCount).toBe(1);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL，找不到模組 `./add-on-form.component`

- [ ] **Step 3: 寫表單元件**

Create `apps/admin/src/app/features/add-ons/forms/add-on-form.component.ts`：

```ts
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AddOn } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';

export type AddOnFormResult = Omit<AddOn, 'id'>;

/**
 * 不知道自己在哪個容器裡的配件表單——dialog 與側邊面板裝的是同一個它。
 */
@Component({
  selector: 'app-add-on-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-on-form.component.html',
  styleUrls: ['../../../app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOnFormComponent {
  protected readonly t = ZH_TW;
  private readonly fb = inject(NonNullableFormBuilder);

  readonly value = input<AddOn | null>(null);
  readonly saved = output<AddOnFormResult>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    unit: ['per_rental' as AddOn['unit'], Validators.required],
  });

  constructor() {
    // 面板可能不換實例、只換資料（使用者點 A 再點 B），因此必須響應 value 變化。
    // Dialog 每次開啟都是全新實例，從來不需要這件事——寫錯的症狀只會在面板模式出現。
    effect(() => {
      const v = this.value();
      this.form.reset({
        name: v?.name ?? '',
        unitPrice: v?.unitPrice ?? 0,
        unit: v?.unit ?? 'per_rental',
      });
    });
  }

  protected save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.saved.emit({ name: raw.name, unitPrice: raw.unitPrice, unit: raw.unit });
  }
}
```

- [ ] **Step 4: 寫表單模板**

Create `apps/admin/src/app/features/add-ons/forms/add-on-form.component.html`。內容從既有的 `dialogs/add-on-dialog.component.html` 搬過來，**移除 `mat-dialog-content`，取消鈕改發 `cancelled`，並在取消鈕加上 `cancel-btn` class（測試用來選取）**：

```html
<form [formGroup]="form" (ngSubmit)="save()" class="form-shell">
  <mat-form-field>
    <mat-label>{{ t.addOn.name }}</mat-label>
    <input matInput formControlName="name" />
  </mat-form-field>
  <mat-form-field>
    <mat-label>{{ t.addOn.unitPrice }}</mat-label>
    <input matInput type="number" formControlName="unitPrice" />
  </mat-form-field>
  <mat-form-field>
    <mat-label>{{ t.addOn.unit }}</mat-label>
    <mat-select formControlName="unit">
      <mat-option value="per_rental">{{ t.addOn.unitLabels['per_rental'] }}</mat-option>
      <mat-option value="per_day">{{ t.addOn.unitLabels['per_day'] }}</mat-option>
    </mat-select>
  </mat-form-field>

  <div class="actions">
    <button mat-button type="button" class="cancel-btn" (click)="cancelled.emit()">
      {{ t.common.cancel }}
    </button>
    <button mat-flat-button type="submit" [disabled]="form.invalid">{{ t.common.save }}</button>
  </div>
</form>
```

- [ ] **Step 5: Dialog 退化為薄殼**

`dialogs/add-on-dialog.component.ts` 整份改為：

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddOn } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { AddOnFormComponent } from '../forms/add-on-form.component';

@Component({
  selector: 'app-add-on-dialog',
  imports: [MatDialogModule, AddOnFormComponent],
  templateUrl: './add-on-dialog.component.html',
  styleUrls: ['../../../app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOnDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<AddOnDialogComponent>);
  readonly data = inject<AddOn | null>(MAT_DIALOG_DATA);
}
```

`dialogs/add-on-dialog.component.html` 整份改為：

```html
<h2 mat-dialog-title>{{ data ? t.common.edit : t.common.create }}</h2>
<div mat-dialog-content>
  <app-add-on-form [value]="data" (saved)="ref.close($event)" (cancelled)="ref.close()" />
</div>
```

**`AddOnFormResult` 型別已搬到 form 檔案**，dialog 不再匯出它。

- [ ] **Step 6: 修正 import 路徑**

`pages/add-ons-page.component.ts` 目前是：

```ts
import { AddOnDialogComponent, AddOnFormResult } from '../dialogs/add-on-dialog.component';
```

改為：

```ts
import { AddOnDialogComponent } from '../dialogs/add-on-dialog.component';
import { AddOnFormResult } from '../forms/add-on-form.component';
```

若還有其他檔案 import `AddOnFormResult`，一併修正（用 `grep -rn "AddOnFormResult" apps/` 找）。

- [ ] **Step 7: 跑測試與建置**

```bash
npx nx test admin
npx nx build admin
npm run lint:theme
```
Expected: 全部 PASS。**dialog 的既有行為必須完全不變**——這一步只是把表單搬進另一個檔案。

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/app/features/add-ons/forms \
        apps/admin/src/app/features/add-ons/dialogs \
        apps/admin/src/app/features/add-ons/pages/add-ons-page.component.ts
git diff --cached --name-only
git commit -m "refactor(admin): add-ons 表單從 dialog 解耦成獨立元件

表單改為響應 value 變化重設，因為面板可能不換實例只換資料——
這是 dialog 從不需要面對的問題。dialog 退化為薄殼。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: `add-ons` 頁接線

**Files:**
- Modify: `apps/admin/src/app/app.config.ts`
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts`
- Modify: `apps/admin/src/app/app.scss`
- Modify: `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.{ts,html}`
- Test: `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.spec.ts`

**Interfaces:**
- Consumes: `DataTableComponent` 的 `selectable` / `selectedId` / `rowClick`（Task 1）、`SplitPanelComponent`（Task 2）、`AddOnFormComponent` 與 `AddOnFormResult`（Task 3）
- Produces: 無（頁面是終端）

- [ ] **Step 1: 開啟 query param 綁定**

`app.config.ts` 的 import 改為：

```ts
import { provideRouter, withComponentInputBinding } from '@angular/router';
```

`providers` 內的 `provideRouter(routes)` 改為：

```ts
    provideRouter(routes, withComponentInputBinding()),
```

這讓 query param 直接綁進路由元件的 `input()`，不需要 RxJS。**現有頁面元件都沒有宣告 `input()`，因此這個改動不影響它們。**

- [ ] **Step 2: 加 i18n 文案**

`core/i18n/zh-tw.ts` 的 `common` 區塊內、`exportFailedText` 之後追加三行（**只在 `common` 內追加，不動其他區塊**）：

```ts
    closePanel: '關閉面板',
    editPanelHeading: '編輯',
    createPanelHeading: '新增',
```

- [ ] **Step 3: 加版面樣式**

`app.scss` 末尾追加：

```scss
// Split view：表格與右側面板並排。面板本身的斷點在 SplitPanelComponent 內（1024px）。
.split-shell {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.split-main {
  flex: 1 1 auto;
  min-width: 0;
}
```

`min-width: 0` 不可省略——沒有它，flex 子項不會收縮，表格會把面板擠出視窗。

- [ ] **Step 4: 寫失敗的測試**

Create `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.spec.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AddOnsPageComponent } from './add-ons-page.component';

describe('AddOnsPageComponent Split View', () => {
  let fixture: ComponentFixture<AddOnsPageComponent>;
  let el: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOnsPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AddOnsPageComponent);
    router = TestBed.inject(Router);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  const setEdit = async (value: string | null) => {
    fixture.componentRef.setInput('edit', value);
    await fixture.whenStable();
  };

  it('沒有 edit 參數時面板不開', async () => {
    await setEdit(null);
    expect(el.querySelector('.sp-panel')).toBeNull();
  });

  it('edit 為有效 id 時面板開啟且表單帶入該筆資料', async () => {
    const first = fixture.componentInstance.store.addOns()[0];
    await setEdit(first.id);
    expect(el.querySelector('.sp-panel')).not.toBeNull();
    const nameInput = el.querySelector('input[formControlName="name"]') as HTMLInputElement;
    expect(nameInput.value).toBe(first.name);
  });

  it('edit 為 new 時面板開啟且表單為空', async () => {
    await setEdit('new');
    expect(el.querySelector('.sp-panel')).not.toBeNull();
    const nameInput = el.querySelector('input[formControlName="name"]') as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('edit 為不存在的 id 時面板不開', async () => {
    await setEdit('不存在的-id');
    expect(el.querySelector('.sp-panel')).toBeNull();
  });

  it('選中的那一列在表格上有 is-selected 標示', async () => {
    const first = fixture.componentInstance.store.addOns()[0];
    await setEdit(first.id);
    expect(el.querySelector('tbody tr.is-selected')).not.toBeNull();
  });

  it('面板已開時再點另一列，導航使用 replaceUrl', async () => {
    const [first, second] = fixture.componentInstance.store.addOns();
    await setEdit(first.id);
    let usedReplace: boolean | undefined;
    router.navigate = ((_: unknown[], extras?: { replaceUrl?: boolean }) => {
      usedReplace = extras?.replaceUrl;
      return Promise.resolve(true);
    }) as Router['navigate'];
    fixture.componentInstance.openPanel(second);
    expect(usedReplace).toBe(true);
  });

  it('面板未開時點列，導航不使用 replaceUrl', async () => {
    await setEdit(null);
    let usedReplace: boolean | undefined;
    router.navigate = ((_: unknown[], extras?: { replaceUrl?: boolean }) => {
      usedReplace = extras?.replaceUrl;
      return Promise.resolve(true);
    }) as Router['navigate'];
    fixture.componentInstance.openPanel(fixture.componentInstance.store.addOns()[0]);
    expect(usedReplace).toBe(false);
  });
});
```

- [ ] **Step 5: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL，`edit` input 與 `openPanel` 不存在

- [ ] **Step 6: 改頁面元件**

`pages/add-ons-page.component.ts`：

import 追加：

```ts
import { computed, effect, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableCellDirective, DataTableColumn, DataTableComponent, SplitPanelComponent } from '@car-rental/ui';
import { AddOnFormComponent, AddOnFormResult } from '../forms/add-on-form.component';
```

`imports` 陣列加入 `SplitPanelComponent` 與 `AddOnFormComponent`。

class 內追加：

```ts
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** 由 withComponentInputBinding 從 ?edit= 綁入。 */
  readonly edit = input<string | null>(null);

  /** 目前正在編輯的項目；'new' 或無效 id 時為 null。 */
  readonly editing = computed<AddOn | null>(() => {
    const key = this.edit();
    if (!key || key === 'new') return null;
    return this.store.addOns().find((a) => a.id === key) ?? null;
  });

  /** 面板開啟條件：edit 為 'new'，或 edit 是一個查得到的 id。 */
  protected readonly panelOpen = computed(() => {
    const key = this.edit();
    if (key === 'new') return true;
    if (!key) return false;
    return this.editing() !== null;
  });

  constructor() {
    // 查不到的 id（資料已刪、或他人傳來的舊連結）靜默清掉參數、停在列表頁。
    // 不跳錯誤訊息——連結過期是正常情況，不是錯誤。
    effect(() => {
      const key = this.edit();
      if (!key || key === 'new') return;
      if (this.editing() === null) this.navigateTo(null, true);
    });
  }

  openPanel(addOn: AddOn): void {
    // 面板已開時切換到另一列用 replace：點 A 再點 B，返回應回到「沒開面板」而非回到 A。
    this.navigateTo(addOn.id, this.panelOpen());
  }

  openCreate(): void {
    this.navigateTo('new', this.panelOpen());
  }

  closePanel(): void {
    this.navigateTo(null, false);
  }

  private navigateTo(edit: string | null, replaceUrl: boolean): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  async onSaved(result: AddOnFormResult): Promise<void> {
    try {
      const current = this.editing();
      if (current) this.store.update(current.id, result);
      else this.store.create(result);
      this.closePanel();
    } catch (e) {
      this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
    }
  }
```

**既有的 `remove()` 保留確認與錯誤處理；成功刪除目前正在編輯的資料時，額外關閉面板。** actions 欄的編輯按鈕改走 `openPanel()` 後，`openForm()` 與 `AddOnDialogComponent` 若完全沒有使用者應一併移除，避免同頁留下第二套編輯容器。

- [ ] **Step 7: 改頁面模板**

`pages/add-ons-page.component.html` 的 `<div class="ui-card !p-0">` 整段（含 `lib-data-table`）用 `.split-shell` 包起來，並在旁邊放面板。「新增」按鈕改呼叫 `openCreate()`：

```html
<div>
  <ng-template appHeaderToolbar>
    <app-page-toolbar [showSearch]="false">
      <button actions mat-flat-button (click)="openCreate()">{{ t.common.create }}</button>
    </app-page-toolbar>
  </ng-template>

  <div class="split-shell">
    <div class="split-main">
      <div class="ui-card !p-0">
        <lib-data-table
          [columns]="columns"
          [rows]="store.addOns()"
          [labels]="labels"
          [emptyText]="t.common.empty"
          [selectable]="true"
          [selectedId]="editing()?.id ?? null"
          (rowClick)="openPanel($event)"
          exportName="add-ons"
          (exportFailed)="onExportFailed($event)"
        >
          <ng-template dtCell="unit" let-a>{{ t.addOn.unitLabels[a.unit] }}</ng-template>
          <ng-template dtCell="actions" let-a>
            <button mat-button (click)="openPanel(a)">{{ t.common.edit }}</button>
            <button mat-button color="warn" (click)="remove(a)">{{ t.common.delete }}</button>
          </ng-template>
        </lib-data-table>
      </div>
    </div>

    <lib-split-panel
      [open]="panelOpen()"
      [heading]="editing() ? t.common.editPanelHeading : t.common.createPanelHeading"
      [closeLabel]="t.common.closePanel"
      (closed)="closePanel()"
    >
      <app-add-on-form [value]="editing()" (saved)="onSaved($event)" (cancelled)="closePanel()" />
    </lib-split-panel>
  </div>
</div>
```

**注意 actions 欄的「編輯」按鈕改為 `openPanel(a)`**——它與點列走同一條路，不再開 dialog。`openForm()` 與 `AddOnDialogComponent` 的 import 若因此完全沒有使用者，一併移除（用 `grep -n "openForm\|AddOnDialogComponent" apps/admin/src/app/features/add-ons/` 確認）。

- [ ] **Step 8: 跑測試、建置、lint**

```bash
npx nx test ui
npx nx test admin
npx nx build admin
npm run lint:theme
npx nx lint admin
```
Expected: 全部 PASS

- [ ] **Step 9: 瀏覽器驗證**

用 chrome-devtools MCP 實際操作（`resize_page` 在此環境有 500px 寬下限）：

```bash
lsof -ti:5200 | xargs -r kill
npx nx serve admin --port 5200 > /tmp/split-view-serve.log 2>&1 &
curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:5200/   # 輪詢到 200
```

逐項確認並各截一張圖：

1. **1280px**：點某一列 → 右側面板開啟、該列有選中標示、URL 變成 `?edit=<id>`
2. **1280px**：點另一列 → 面板內容換成第二筆（**這是 §7.3 陷阱的實測**），選中標示跟著移動
3. **1280px**：按瀏覽器返回鍵 → 面板關閉（因為第 2 步用了 replaceUrl，**一次返回就該離開面板狀態**，不會退回第一筆）
4. **1280px**：點 actions 欄的「刪除」→ 只執行刪除，**面板不會被開啟**
5. **900px**：面板全螢幕覆蓋，表格仍是表格
6. **500px**：表格是卡片，面板全螢幕覆蓋；點卡片的展開鈕只展開、不開面板
7. **1280px**：直接在網址列輸入 `?edit=不存在的id` → 面板不開、參數被清掉、停在列表頁
8. 按 Esc 關閉面板；點窄螢幕的遮罩關閉面板
9. `list_console_messages` 確認 console 乾淨

收工 `lsof -ti:5200 | xargs -r kill`。

- [ ] **Step 10: Commit**

```bash
git add apps/admin/src/app/app.config.ts \
        apps/admin/src/app/app.scss \
        apps/admin/src/app/core/i18n/zh-tw.ts \
        apps/admin/src/app/features/add-ons/pages
git diff --cached apps/admin/src/app/core/i18n/zh-tw.ts   # 確認只多三行
git diff --cached --name-only
git commit -m "feat(admin): add-ons 改用 Split View 編輯面板，狀態放 URL

點列開右側面板，?edit=<id> / ?edit=new。切換列用 replaceUrl，
避免瀏覽十筆要按十次返回。查不到的 id 靜默清參數。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review 紀錄

**Spec 覆蓋檢查**：

| Spec 章節 | 對應 Task |
|---|---|
| §2 三層架構 | Task 1（表格）、Task 2（面板）、Task 4（接線） |
| §3.1 兩個斷點 | Task 2 Step 5（面板 1024px）；表格 640px 未動 |
| §3.2 面板寬度 420px | Task 2 Step 5 |
| §3.3 窄螢幕覆蓋與動畫 | Task 2 Step 5 |
| §4.1 冒泡處理 | Task 1 Step 3 的 `onRowClick`；Task 1 Step 1 有對應測試 |
| §4.2 `selectable` 的必要性 | Task 1 Step 3 |
| §5 DataTable API 與逃生門警告 | Task 1 Step 3、Step 4、Step 5 |
| §6 SplitPanel API | Task 2 全部 |
| §7 表單解耦與 §7.3 陷阱 | Task 3；陷阱有專屬測試（Step 1 第二個 it）與瀏覽器實測（Task 4 Step 9 第 2 項） |
| §8.1 參數形狀 | Task 4 Step 6 |
| §8.2 兩種歷史處理 | Task 4 Step 6 的 `openPanel`；有兩個測試守著 |
| §8.3 邊界情況 | Task 4 Step 6 的 effect（無效 id）、`onSaved`（成功關閉／失敗保留） |
| §9 檔案結構 | 本計畫 File Structure 一致 |
| §10 測試 | Task 1（6 個）、Task 2（8 個）、Task 3（7 個）、Task 4（7 個） |
| §11 驗收 | Task 4 Step 8、Step 9 |

**Spec 未涵蓋、由本計畫補上的兩項**：

1. **`withComponentInputBinding()`**（Task 4 Step 1）。Spec 只說「頁面讀 param」，未指定機制。查證後 `app.config.ts` 目前是 `provideRouter(routes)`，沒有開啟這個功能；開啟它可讓 query param 直接綁進 `input()`，完全避開 RxJS，比 `toSignal` 橋接更符合 signal-only 的約束。現有頁面元件都沒宣告 `input()`，不受影響。
2. **actions 欄的「編輯」按鈕改為呼叫 `openPanel()`**（Task 4 Step 7）。Spec §1 說「不移除編輯按鈕」，但沒說它該做什麼。讓它與點列走同一條路，否則同一頁會同時存在 dialog 與面板兩種編輯體驗，反而比移除按鈕更混亂。

**Spec §4.2 的實作決策**：Task 1 永遠綁定 click、在處理器第一行提早返回。Spec 已明確允許此作法；行為仍是未開啟時不發事件、無游標與 hover 樣式，模板較單純。

**Review 後補上的必要修正（已同步回填 Spec §6、§8.3、§9.1、§10）**：

1. **焦點與 modal 語意**：原 Task 2 的範例宣告了 `aria-modal="true"`，卻沒有焦點移轉或焦點陷阱，而且寬螢幕並排不應宣告 modal。Task 2 實作時改為以同一個 `max-width: 1024px` 條件控制 `CdkTrapFocus`、`role="dialog"`、`aria-modal` 與遮罩可關閉性；兩種模式都要在開啟時聚焦面板第一個可聚焦元素、關閉時還原仍存在的觸發元素。新增對應的單元與瀏覽器測試。
2. **刪除目前資料**：Task 4 的 `remove()` 在 `store.remove(addOn.id)` 成功後，若 `editing()?.id === addOn.id` 必須呼叫 `closePanel()`。新增測試：刪除目前資料會移除 `edit` 並關閉面板；刪除其他資料不影響面板。
3. **OnPush 一致性**：Task 4 將 `AddOnsPageComponent` 補為 `ChangeDetectionStrategy.OnPush`，與本計畫的 Angular signal 約束一致。

**型別一致性檢查**：`AddOnFormResult`（Task 3 定義於 form 檔案）在 Task 4 的 `onSaved` 簽章一致；`SplitPanelComponent` 的四個 input/output 名稱在 Task 2 定義、Task 4 使用一致；`selectable` / `selectedId` / `rowClick` 在 Task 1 定義、Task 4 使用一致。

### Review addendum：取代 Task 2 / Task 4 中衝突的片段

下列項目優先於前述較早的程式片段；其餘 Task 步驟不變。

**Task 2 — SplitPanel 焦點與 modal：** `libs/ui` 可使用既有的 `@angular/cdk/a11y`，但不得使用 Angular Material。元件匯入 `CdkTrapFocus`，以 `signal<boolean>` 保存 `window.matchMedia('(max-width: 1024px)')` 的結果，並在 `window:resize` 時更新。面板 `<aside>` 必須有 template ref；開啟時以 `afterNextRender()` 將焦點依序放到 `[autofocus]`、表單控制項、關閉鈕，關閉時還原仍 `isConnected` 的原焦點。

```html
<div class="sp-scrim" (click)="narrow() && closed.emit()"></div>
<aside
  #panel
  class="sp-panel"
  [attr.role]="narrow() ? 'dialog' : null"
  [attr.aria-modal]="narrow() ? 'true' : null"
  [attr.aria-label]="heading()"
  [cdkTrapFocus]="narrow()"
>
```

`CdkTrapFocus` 必須只在窄螢幕啟用；寬螢幕並排時不得有 `role="dialog"` 或 `aria-modal`。測試的「點遮罩」案例也只在模擬窄螢幕時斷言會發出 `closed`，並新增開關焦點與寬／窄 modal 語意案例。

**Task 4 — OnPush 與刪除目前資料：** `AddOnsPageComponent` 的 core import 必須納入 `ChangeDetectionStrategy`，其 `@Component` 加上 `changeDetection: ChangeDetectionStrategy.OnPush`。現有 `remove()` 用以下邏輯取代，保留原本確認與 snackbar 錯誤處理：

```ts
async remove(addOn: AddOn): Promise<void> {
  if (!(await confirm(this.dialog, this.t.common.deleteConfirm))) return;
  const closesPanel = this.editing()?.id === addOn.id;
  try {
    this.store.remove(addOn.id);
    if (closesPanel) this.closePanel();
  } catch (e) {
    this.snackBar.open((e as Error).message, undefined, { duration: 3000 });
  }
}
```

`add-ons-page.component.spec.ts` 增加兩個案例：刪除目前 `editing` 的資料會導航移除 `edit` 並關閉面板；刪除其他資料時 `edit` 與面板維持不變。執行 Task 4 的瀏覽器檢查也要涵蓋這兩條。
