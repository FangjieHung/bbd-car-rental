# Topbar 可展開搜尋框 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 admin topbar 的搜尋框改成可展開／收合的自訂元件——收合態 44×44 圓形只顯示放大鏡，點按展開為膠囊形輸入框並同步取得焦點（手機喚起軟鍵盤），再點放大鏡清空並收回。

**Architecture:** 移除 `mat-form-field`，改用原生 `<input>` 加自訂容器。收合／展開只改變**容器寬度**（44px ⟷ 320px）搭配 `overflow: hidden`，input 尺寸恆定、永遠留在 DOM 中，確保 `focus()` 可在使用者手勢的同步流程中呼叫（iOS 軟鍵盤的硬性要求）。元件對外 API 完全不變，7 個使用端頁面不需改動。

**Tech Stack:** Angular 22（zoneless、signal、新控制流語法）、Vitest + TestBed、Angular Material（僅保留 `mat-icon` 與篩選器的 `mat-button`）、SCSS + M3 design token。

## Global Constraints

- **`focus()` 必須同步呼叫**：不可包進 `setTimeout`、`afterNextRender` 或任何非同步邊界，否則 iOS Safari 不會喚起軟鍵盤。此限制須以程式碼註解標記。
- **不可對收合態的 input 使用 `display: none`、`width: 0` 或 `aria-hidden`**：三者都會破壞 `focus()`。收合以容器 `overflow: hidden` 裁切達成，並用 `[tabindex]` 擋 tab 巡覽。
- **顏色一律使用 token**：`--mat-sys-surface-variant`（底）、`--mat-sys-on-surface`（文字）、`--mat-sys-on-surface-variant`（placeholder／圖示）、`--mat-sys-primary`（focus 外框）。不得寫死色碼。
- **元件對外 API 不變**：`query`（model）、`placeholder`、`showSearch`、`activeFilterCount`（input）、`clearAll`（output）簽章一律不動，7 個使用端頁面不得修改。
- **所有按鈕須帶 `type="button"`**。
- **測試以繁體中文命名**，沿用 `header.component.spec.ts` 的 Vitest + TestBed 風格。
- **測試指令一律跑全套**：`npx nx test admin`（全套僅約 1.5 秒）。

---

## File Structure

| 檔案 | 動作 | 責任 |
|---|---|---|
| `apps/admin/src/app/core/i18n/zh-tw.ts` | Modify | 新增 `common.collapseSearch` |
| `apps/admin/src/app/shared/ui/page-toolbar.component.ts` | Modify | 展開狀態與四個轉換方法；移除 form-field/input 的 Material import |
| `apps/admin/src/app/shared/ui/page-toolbar.component.html` | Modify | 以原生 input 取代 `mat-form-field` |
| `apps/admin/src/app/shared/ui/page-toolbar.component.scss` | Modify | 收合／展開寬度、膠囊形狀、動畫、token 配色 |
| `apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts` | Create | 狀態機七項行為測試 |
| `apps/admin/src/app/layout/header/header.component.scss` | Modify | 移除已無作用的 `mat.form-field-overrides` |

---

## Task 1: 狀態機骨架與展開／收合切換

**Files:**
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts`
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.ts`
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.html`
- Test: `apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`（新建）

**Interfaces:**
- Consumes: 無（本計畫第一個任務）
- Produces: `PageToolbarComponent.expanded: WritableSignal<boolean>`、`toggle(): void`。
  模板中 `.search`（容器）、`.search__toggle`（放大鏡按鈕）、`.search__input`（原生 input）三個 class 為後續任務的樣式與測試選擇器。

- [ ] **Step 1: 寫失敗測試**

建立 `apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PageToolbarComponent } from './page-toolbar.component';

function setup() {
  const fixture = TestBed.createComponent(PageToolbarComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    component: fixture.componentInstance,
    toggleBtn: () => el.querySelector('.search__toggle') as HTMLButtonElement,
    input: () => el.querySelector('.search__input') as HTMLInputElement,
    container: () => el.querySelector('.search') as HTMLElement,
  };
}

describe('PageToolbarComponent 展開收合', () => {
  it('初始為收合狀態', () => {
    const { component, container } = setup();
    expect(component.expanded()).toBe(false);
    expect(container().classList.contains('search--expanded')).toBe(false);
  });

  it('點放大鏡會展開', () => {
    const { fixture, component, toggleBtn, container } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    expect(component.expanded()).toBe(true);
    expect(container().classList.contains('search--expanded')).toBe(true);
  });

  it('展開時點放大鏡會清空文字並收合', () => {
    const { fixture, component, toggleBtn } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    component.query.set('ABC');
    fixture.detectChanges();

    toggleBtn().click();
    fixture.detectChanges();

    expect(component.query()).toBe('');
    expect(component.expanded()).toBe(false);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL——`page-toolbar.component.spec.ts` 三個案例皆失敗，錯誤為 `component.expanded is not a function` 或找不到 `.search__toggle`。

- [ ] **Step 3: 加 i18n 字串**

在 `apps/admin/src/app/core/i18n/zh-tw.ts` 的 `common` 區塊，`clearSearch` 之後加一行：

```ts
    clearSearch: '清除搜尋',
    collapseSearch: '收合搜尋',
```

- [ ] **Step 4: 改寫元件 TS**

`apps/admin/src/app/shared/ui/page-toolbar.component.ts` 全檔替換為：

```ts
import { Component, ElementRef, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ZH_TW } from '../../core/i18n/zh-tw';

@Component({
  selector: 'app-page-toolbar',
  imports: [FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './page-toolbar.component.html',
  styleUrls: ['./page-toolbar.component.scss'],
})
export class PageToolbarComponent {
  protected readonly t = ZH_TW;
  readonly query = model<string>('');
  readonly placeholder = input<string>(ZH_TW.common.search);
  readonly activeFilterCount = input<number>(0);
  readonly showSearch = input<boolean>(true);
  readonly clearAll = output<void>();

  readonly expanded = signal(false);

  // 不可用 viewChild.required：input 位於 @if (showSearch()) 內，
  // showSearch() 為 false 時元素不存在，required 會拋錯。
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  toggle(): void {
    if (this.expanded()) {
      this.query.set('');
      this.expanded.set(false);
      this.inputRef()?.nativeElement.blur();
      return;
    }
    this.expanded.set(true);
    // 必須同步呼叫。包進 setTimeout / afterNextRender 會讓 iOS Safari 不喚起軟鍵盤。
    this.inputRef()?.nativeElement.focus();
  }
}
```

注意 `imports` 已移除 `MatFormFieldModule` 與 `MatInputModule`。

- [ ] **Step 5: 改寫模板的搜尋區塊**

`apps/admin/src/app/shared/ui/page-toolbar.component.html`，把 `@if (showSearch()) { ... }` 內原本的整個 `<mat-form-field>` 換成：

```html
      <div class="search" [class.search--expanded]="expanded()">
        <button
          type="button"
          class="search__toggle"
          [attr.aria-label]="expanded() ? t.common.collapseSearch : t.common.search"
          [attr.aria-expanded]="expanded()"
          (mousedown)="$event.preventDefault()"
          (click)="toggle()"
        >
          <mat-icon>search</mat-icon>
        </button>

        <input
          #searchInput
          type="text"
          class="search__input"
          [tabindex]="expanded() ? 0 : -1"
          [attr.aria-label]="placeholder()"
          [placeholder]="placeholder()"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </div>
```

`(mousedown)="$event.preventDefault()"` 是必要的：它讓點擊放大鏡時 input 不會先失焦，避免 Task 3 加入 blur 收合後產生「blur 先收合、click 再展開」的競態。

- [ ] **Step 6: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PASS，全部測試通過（既有 83 項 + 新增 3 項）。

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/app/core/i18n/zh-tw.ts \
        apps/admin/src/app/shared/ui/page-toolbar.component.ts \
        apps/admin/src/app/shared/ui/page-toolbar.component.html \
        apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts
git commit -m "feat(admin): 搜尋框改用原生 input 並加入展開收合狀態"
```

---

## Task 2: 清除鈕與 Esc 鍵

**Files:**
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.ts`
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.html`
- Test: `apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`

**Interfaces:**
- Consumes: Task 1 的 `expanded`、`toggle()`、`.search` / `.search__input` 選擇器
- Produces: `onEscape(): void`、`clearKeepFocus(): void`；模板新增 `.search__clear` class

- [ ] **Step 1: 寫失敗測試**

在 `page-toolbar.component.spec.ts` 的 `setup()` 回傳物件中加入 clear 按鈕的存取器：

```ts
    clearBtn: () => el.querySelector('.search__clear') as HTMLButtonElement | null,
```

並在檔案末端新增一個 describe 區塊：

```ts
describe('PageToolbarComponent 清除與 Esc', () => {
  it('沒有文字時不顯示清除鈕', () => {
    const { fixture, toggleBtn, clearBtn } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    expect(clearBtn()).toBeNull();
  });

  it('點清除鈕會清空文字但維持展開', () => {
    const { fixture, component, toggleBtn, clearBtn } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    component.query.set('ABC');
    fixture.detectChanges();

    clearBtn()!.click();
    fixture.detectChanges();

    expect(component.query()).toBe('');
    expect(component.expanded()).toBe(true);
  });

  it('按 Esc 會清空文字並收合', () => {
    const { fixture, component, toggleBtn, input } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    component.query.set('ABC');
    fixture.detectChanges();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(component.query()).toBe('');
    expect(component.expanded()).toBe(false);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL——「點清除鈕」與「按 Esc」兩案例失敗（`.search__clear` 為 null、Esc 後 `expanded()` 仍為 true）。

- [ ] **Step 3: 加入兩個方法**

在 `PageToolbarComponent` 的 `toggle()` 之後加入：

```ts
  onEscape(): void {
    this.query.set('');
    this.expanded.set(false);
    this.inputRef()?.nativeElement.blur();
  }

  clearKeepFocus(): void {
    this.query.set('');
    // 清空後游標留在框內，讓使用者直接重打。
    this.inputRef()?.nativeElement.focus();
  }
```

- [ ] **Step 4: 模板接上 Esc 與清除鈕**

在 `<input #searchInput ...>` 的屬性中，`(ngModelChange)` 之後加一行：

```html
          (keydown.escape)="onEscape()"
```

並在 `</div>`（`.search` 容器的收尾）之前加入清除鈕：

```html
        @if (query()) {
          <button
            type="button"
            class="search__clear"
            [attr.aria-label]="t.common.clearSearch"
            (mousedown)="$event.preventDefault()"
            (click)="clearKeepFocus()"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PASS，全部通過（既有 83 項 + Task 1 的 3 項 + 本任務 3 項）。

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/app/shared/ui/page-toolbar.component.ts \
        apps/admin/src/app/shared/ui/page-toolbar.component.html \
        apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts
git commit -m "feat(admin): 搜尋框加入清除鈕與 Esc 收合"
```

---

## Task 3: 失焦自動收合

**Files:**
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.ts`
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.html`
- Test: `apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`

**Interfaces:**
- Consumes: Task 1 的 `expanded`、Task 2 的模板結構
- Produces: `collapseIfEmpty(): void`

- [ ] **Step 1: 寫失敗測試**

在 `page-toolbar.component.spec.ts` 末端新增：

```ts
describe('PageToolbarComponent 失焦收合', () => {
  it('失焦時若為空白則收合', () => {
    const { fixture, component, toggleBtn, input } = setup();
    toggleBtn().click();
    fixture.detectChanges();

    input().dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    expect(component.expanded()).toBe(false);
  });

  it('失焦時若有文字則維持展開', () => {
    const { fixture, component, toggleBtn, input } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    component.query.set('ABC');
    fixture.detectChanges();

    input().dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    expect(component.expanded()).toBe(true);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL——「失焦時若為空白則收合」失敗，`expanded()` 仍為 true。

- [ ] **Step 3: 加入方法**

在 `clearKeepFocus()` 之後加入：

```ts
  collapseIfEmpty(): void {
    if (!this.query()) {
      this.expanded.set(false);
    }
  }
```

- [ ] **Step 4: 模板接上 blur**

在 `<input #searchInput ...>` 的 `(keydown.escape)` 之後加一行：

```html
          (blur)="collapseIfEmpty()"
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PASS，全部通過（既有 83 項 + 新增 8 項）。

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/app/shared/ui/page-toolbar.component.ts \
        apps/admin/src/app/shared/ui/page-toolbar.component.html \
        apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts
git commit -m "feat(admin): 搜尋框空白失焦時自動收合"
```

---

## Task 4: 樣式——膠囊形狀、寬度過渡與 token 配色

**Files:**
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.scss`
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.html`（父容器加 `flex-wrap`）

**Interfaces:**
- Consumes: Task 1–3 的 `.search`、`.search--expanded`、`.search__toggle`、`.search__input`、`.search__clear`
- Produces: 無新的程式介面（純樣式）

本任務無單元測試可驗證（jsdom 不計算版面），改以瀏覽器實測量測，驗收標準寫在 Step 3。

- [ ] **Step 1: 父容器加上換行能力**

`page-toolbar.component.html` 中包住搜尋框與 actions 的那層 div：

```html
  <div class="flex flex-wrap gap-2 ml-auto">
```

（原本是 `class="flex gap-2 ml-auto"`，只加 `flex-wrap`。）窄螢幕展開時搜尋框佔滿整列後，actions 才能被擠到下一列。

- [ ] **Step 2: 寫入樣式**

在 `page-toolbar.component.scss` 中，把原本的 `.search-field` 規則（含 `@media (max-width: 640px)` 內那段）整段刪除，改為以下內容。其餘規則（`.actions`、`.filters`、`.filters:empty`、`.clear-btn`）保持不動：

```scss
/* 收合態為 44×44 正圓，展開態拉長為膠囊。
   只有容器寬度在變，input 尺寸恆定、由 overflow 裁切——
   這是為了讓 input 永遠是可 focus 的實體元素（iOS 軟鍵盤的前提）。 */
.search {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: var(--mat-sys-surface-variant);
  overflow: hidden;
  transition: width 200ms ease;
}

/* 偏離 spec §4.3：spec 原寫成 `flex: 1 1 240px; max-width: 320px`，此處改用 width。
   原因是本設計的動畫標的就是寬度，而瀏覽器對 flex-basis 的過渡遠不如 width 可靠
   （flex 容器重新分配空間時容易跳動）。改用 width 後 transition 只需盯住一個屬性。 */
.search--expanded {
  width: 320px;
  max-width: 100%;
}

.search:focus-within {
  outline: 2px solid var(--mat-sys-primary);
  outline-offset: 1px;
}

.search__toggle,
.search__clear {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mat-sys-on-surface-variant);
  cursor: pointer;
}

/* 固定基準寬度：收合時被容器裁掉，不能設為 0（零寬元素的 focus 行為在 iOS 上不保證）。 */
.search__input {
  flex: 1 1 auto;
  width: 200px;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mat-sys-on-surface);
  font: inherit;
  outline: none;
}

.search__input::placeholder {
  color: var(--mat-sys-on-surface-variant);
}

@media (prefers-reduced-motion: reduce) {
  .search {
    transition: none;
  }
}

@media (max-width: 640px) {
  .search--expanded {
    width: 100%;
  }
}
```

- [ ] **Step 3: 瀏覽器實測**

啟動：`npx nx serve admin --port 5200 > /tmp/serve.log 2>&1 &`，等待回應 200 後開啟 `http://localhost:5200/vehicles`。

逐項確認並記錄實際數值：

1. 收合態容器為 44×44，`border-radius` 使其呈正圓。
2. 點放大鏡後容器寬度變為 320px，且有可見的過渡動畫。
3. 展開後游標在 input 內（`document.activeElement` 為該 input）。
4. 輸入文字後 ✕ 出現；點 ✕ 後文字清空、**容器仍為 320px**（未收合）。
5. 再點放大鏡：文字清空且容器回到 44px。
6. 展開後不輸入文字、點頁面空白處：容器回到 44px。
7. 展開後輸入文字、點頁面空白處：容器維持 320px。
8. 切到 midnight 主題，確認底色為深色（token 生效）、文字可讀。
9. 視窗縮到 640px 以下展開：搜尋框佔滿整列，「新增」按鈕被擠到下一列。
10. Console 無 error／warn。

**手機軟鍵盤無法在桌面瀏覽器驗證**——若無 iOS 實機，須如實記錄為「未驗證」，不得宣稱通過。

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/shared/ui/page-toolbar.component.scss \
        apps/admin/src/app/shared/ui/page-toolbar.component.html
git commit -m "style(admin): 搜尋框膠囊造型與展開收合過渡"
```

---

## Task 5: 清理 header 殘留的 form-field 覆寫

**Files:**
- Modify: `apps/admin/src/app/layout/header/header.component.scss`

**Interfaces:**
- Consumes: Task 4 完成後，topbar 內已無 `mat-form-field`
- Produces: 無

- [ ] **Step 1: 確認 topbar 內已無 mat-form-field**

Run: `grep -rn "mat-form-field" apps/admin/src/app/shared/ui/ apps/admin/src/app/layout/`
Expected: 無任何命中。（`shared/filters/filter-select.component.html` 仍有，那是篩選器，不在 topbar 的 `.topbar-toolbar` 樣式範圍內，屬正常。）

- [ ] **Step 2: 移除覆寫**

在 `apps/admin/src/app/layout/header/header.component.scss` 中，刪除 `.topbar-toolbar` 規則內的整段註解與 `@include mat.form-field-overrides(...)`（該段是為了把 Material 欄位從 56px 壓到 44px，現已無對象）。

同時檢查檔案頂端的 `@use '@angular/material' as mat;`：若移除後全檔已無其他 `mat.` 呼叫，一併刪除該行。

- [ ] **Step 3: 驗證**

Run: `npx nx build admin`
Expected: exit 0，無 SCSS 編譯錯誤。

Run: `npx nx test admin`
Expected: PASS，全部通過。

重新載入瀏覽器頁面，確認篩選器（`filter-select`）外觀未受影響——它的高度由 Material 預設值決定，不應因這次移除而跳動。若高度改變，表示該覆寫原本也在影響篩選器，此時應把等效的 density 設定移到 `filter-select.component.scss` 內，而非還原 header 的覆寫。

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/layout/header/header.component.scss
git commit -m "refactor(admin): 移除 topbar 已無對象的 form-field density 覆寫"
```

---

## 驗收總覽

全部任務完成後，應同時滿足：

- `npx nx build admin` exit 0。
- `npx nx test admin` 全數通過（既有 83 項 + 新增 8 項 = 91 項）。
- 7 個使用 `app-page-toolbar` 的頁面模板**零改動**（`git log` 中不應出現 features 目錄下的檔案）。
- Task 4 Step 3 的十項瀏覽器實測逐項確認。
- iOS 軟鍵盤若無實機驗證，明確標示為未驗證項。
