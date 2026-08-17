# Admin Shell Layout Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `apps/admin/src/app/app.html`（147 行的單一巨型 shell 模板）拆成 `layout/side-nav`、`layout/header`、`layout/footer` 三個獨立元件，並把 `ListToolbarComponent` 改名為 `PageToolbarComponent`。

**Architecture:** 採「行為不變、只搬 markup」的保守拆法——`App` (`app.ts`) 繼續持有全部現有 state 與邏輯（`navItems`、`isMobile`、`collapsed`、`openGroupLabel`、`currentTitle`、`currentGroupLabel`……全部不變），三個新元件是純 presentational component，透過 `@Input()`/`@Output()` 接資料與事件，不引入 service 或 signal store。`<mat-sidenav>`／`<mat-sidenav-container>`／`<mat-sidenav-content>` 這組 Angular Material 結構性標籤留在 `app.html`（Material 要求 `mat-sidenav` 必須是 `mat-sidenav-container` 直接投影的內容，搬進子元件風險高，故不動），只把每個標籤「裡面」的內容搬進對應子元件。

**Tech Stack:** Angular 21（standalone component、signal-based `input()`/`output()`）、Angular Material、vitest（`@angular/build:unit-test` executor）。

## Global Constraints

- 每個新元件的 host 必須設 `:host { display: contents; }`，避免自訂元素標籤（`<app-header>`/`<app-footer>`/`<app-side-nav>`）在 flex 版面（`.content-area { display:flex }`、`.sidenav-inner` 的高度計算）中插入多餘的盒子，破壞現有版面。
- `app.scss` 裡跟本次拆分「無關」的既有 utility class（`.ui-card-header`、`.stat-grid`、`.table-*`、`.list-*`、`.chip-list`、`.alert-*`、`.form-shell`、`.tier-row`/`.range-row`、`.error-message`、`.actions`、`.dialog-content`、`.muted`、`.stack-block`、`.vehicle-*`、`.action-cell`、`.text-secondary`、`.section-title`、`.content-grid`）一律不動、不搬——這些不是本次任務範圍。
- 每個 task 完成後跑 `npx nx test admin` 確認全部測試綠燈，改完 app 相關檔案後額外跑 `npx nx build admin` 確認能編譯。
- i18n 文案一律加在 `apps/admin/src/app/core/i18n/zh-tw.ts` 的 `ZH_TW`，不要在元件裡寫死中文（既有慣例）。
- commit message 用專案既有的 conventional commit 中文風格（參考 `git log`：`fix(domain): ...`、`docs(architecture): ...`），本次全部用 `refactor(admin): ...`。

---

### Task 1: 共用 nav 型別（`nav-item.model.ts`）

**Files:**
- Create: `apps/admin/src/app/layout/side-nav/nav-item.model.ts`
- Test: `apps/admin/src/app/layout/side-nav/nav-item.model.spec.ts`

**Interfaces:**
- Produces: `NavLeaf { route: string; label: string; icon: string }`、`NavGroup { label: string; icon: string; children: NavLeaf[] }`、`NavEntry = NavLeaf | NavGroup`、`isNavGroup(entry: NavEntry): entry is NavGroup`——後續 Task 2、Task 5 都會 import 這四個名稱。

- [ ] **Step 1: 寫測試**

```typescript
// apps/admin/src/app/layout/side-nav/nav-item.model.spec.ts
import { describe, it, expect } from 'vitest';
import { isNavGroup } from './nav-item.model';

describe('isNavGroup', () => {
  it('有 children 的項目判斷為 group', () => {
    expect(isNavGroup({ label: '商品管理', icon: '◫', children: [] })).toBe(true);
  });

  it('沒有 children 的項目判斷為 leaf', () => {
    expect(isNavGroup({ route: '/dashboard', label: '總覽', icon: '◉' })).toBe(false);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL — 找不到 `./nav-item.model` 模組。

- [ ] **Step 3: 建立型別檔**

```typescript
// apps/admin/src/app/layout/side-nav/nav-item.model.ts
export interface NavLeaf {
  route: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  icon: string;
  children: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PASS（2 個新測試 + 既有測試全綠）

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/layout/side-nav/nav-item.model.ts apps/admin/src/app/layout/side-nav/nav-item.model.spec.ts
git commit -m "refactor(admin): 抽出 nav 項目共用型別，供 app shell 與後續 side-nav 元件共用"
```

---

### Task 2: `layout/side-nav` 元件

**Files:**
- Create: `apps/admin/src/app/layout/side-nav/side-nav.component.ts`
- Create: `apps/admin/src/app/layout/side-nav/side-nav.component.html`
- Create: `apps/admin/src/app/layout/side-nav/side-nav.component.scss`
- Test: `apps/admin/src/app/layout/side-nav/side-nav.component.spec.ts`

**Interfaces:**
- Consumes: `NavEntry`、`NavGroup`、`isNavGroup`（Task 1）。
- Produces：selector `app-side-nav`；Inputs（全部 `input.required`）：`navItems: NavEntry[]`、`collapsed: boolean`、`isMobile: boolean`、`openGroupLabel: string | null`、`currentGroupLabel: string | null`、`flyoutPositions: ConnectedPosition[]`；Outputs：`toggleCollapse: void`、`toggleGroup: string`（群組 label）、`navClick: void`、`groupDetach: void`。Task 5 會這樣接：`(toggleCollapse)="toggleCollapsed()"`、`(toggleGroup)="toggleGroup($event)"`、`(navClick)="onNavClick()"`、`(groupDetach)="openGroupLabel = null"`。

- [ ] **Step 1: 寫測試**

```typescript
// apps/admin/src/app/layout/side-nav/side-nav.component.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SideNavComponent } from './side-nav.component';
import { NavEntry } from './nav-item.model';

describe('SideNavComponent', () => {
  const navItems: NavEntry[] = [
    { route: '/dashboard', label: '總覽', icon: '◉' },
    {
      label: '商品管理',
      icon: '◫',
      children: [{ route: '/vehicles', label: '車輛清單', icon: '◫' }],
    },
  ];

  function setup() {
    const fixture = TestBed.createComponent(SideNavComponent);
    fixture.componentRef.setInput('navItems', navItems);
    fixture.componentRef.setInput('collapsed', false);
    fixture.componentRef.setInput('isMobile', false);
    fixture.componentRef.setInput('openGroupLabel', null);
    fixture.componentRef.setInput('currentGroupLabel', null);
    fixture.componentRef.setInput('flyoutPositions', []);
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('渲染導覽項目與群組', () => {
    const fixture = setup();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('總覽');
    expect(text).toContain('商品管理');
  });

  it('點擊群組觸發 toggleGroup 事件', () => {
    const fixture = setup();
    fixture.detectChanges();
    let emitted: string | undefined;
    fixture.componentInstance.toggleGroup.subscribe((label: string) => (emitted = label));
    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      '.nav-group-trigger',
    ) as HTMLButtonElement;
    trigger.click();
    expect(emitted).toBe('商品管理');
  });

  it('currentGroupLabel 命中時群組按鈕加上 active class', () => {
    const fixture = setup();
    fixture.componentRef.setInput('currentGroupLabel', '商品管理');
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('.nav-group-trigger');
    expect(trigger?.classList.contains('active')).toBe(true);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL — 找不到 `./side-nav.component` 模組。

- [ ] **Step 3: 建立元件**

```typescript
// apps/admin/src/app/layout/side-nav/side-nav.component.ts
import { Component, input, output } from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { NavEntry, NavGroup, isNavGroup } from './nav-item.model';

@Component({
  selector: 'app-side-nav',
  imports: [
    NgFor,
    NgIf,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    OverlayModule,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  protected readonly t = ZH_TW;
  protected readonly isNavGroup = isNavGroup;

  readonly navItems = input.required<NavEntry[]>();
  readonly collapsed = input.required<boolean>();
  readonly isMobile = input.required<boolean>();
  readonly openGroupLabel = input.required<string | null>();
  readonly currentGroupLabel = input.required<string | null>();
  readonly flyoutPositions = input.required<ConnectedPosition[]>();

  readonly toggleCollapse = output<void>();
  readonly toggleGroup = output<string>();
  readonly navClick = output<void>();
  readonly groupDetach = output<void>();

  protected isGroupActive(group: NavGroup): boolean {
    return this.currentGroupLabel() === group.label;
  }
}
```

```html
<!-- apps/admin/src/app/layout/side-nav/side-nav.component.html -->
<div class="sidenav-inner" [class.collapsed]="collapsed()">
  <div class="brand">
    <div class="brand-mark">P</div>
    <div class="brand-copy" *ngIf="!collapsed()">
      <h1>{{ t.app.title }}</h1>
      <p>管理中心</p>
    </div>
    <button
      *ngIf="!isMobile()"
      mat-icon-button
      type="button"
      class="collapse-toggle"
      (click)="toggleCollapse.emit()"
    >
      <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
    </button>
  </div>

  <nav class="nav-list" aria-label="主導覽">
    <ng-container *ngFor="let item of navItems()">
      <a
        *ngIf="!isNavGroup(item)"
        class="nav-link"
        [routerLink]="$any(item).route"
        routerLinkActive="active"
        [matTooltip]="collapsed() ? item.label : ''"
        matTooltipPosition="right"
        (click)="navClick.emit()"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span *ngIf="!collapsed()">{{ item.label }}</span>
      </a>

      <ng-container *ngIf="isNavGroup(item)">
        <button
          #groupOrigin="cdkOverlayOrigin"
          cdkOverlayOrigin
          type="button"
          class="nav-link nav-group-trigger"
          [class.active]="isGroupActive($any(item))"
          [matTooltip]="collapsed() ? item.label : ''"
          matTooltipPosition="right"
          (click)="toggleGroup.emit(item.label)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span *ngIf="!collapsed()">{{ item.label }}</span>
          <mat-icon
            *ngIf="!collapsed()"
            class="nav-group-caret"
            [class.open]="openGroupLabel() === item.label"
          >
            expand_more
          </mat-icon>
        </button>

        <div class="nav-subgroup" *ngIf="!collapsed() && openGroupLabel() === item.label">
          <a
            *ngFor="let child of $any(item).children"
            class="nav-sublink"
            [routerLink]="child.route"
            routerLinkActive="active"
            (click)="navClick.emit()"
          >
            <span class="nav-icon">{{ child.icon }}</span>
            <span>{{ child.label }}</span>
          </a>
        </div>

        <ng-template
          *ngIf="collapsed()"
          cdkConnectedOverlay
          [cdkConnectedOverlayOrigin]="groupOrigin"
          [cdkConnectedOverlayOpen]="openGroupLabel() === item.label"
          [cdkConnectedOverlayPositions]="flyoutPositions()"
          [cdkConnectedOverlayHasBackdrop]="true"
          cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
          (backdropClick)="toggleGroup.emit(item.label)"
          (detach)="groupDetach.emit()"
        >
          <div class="nav-flyout">
            <a
              *ngFor="let child of $any(item).children"
              class="nav-flyout-item"
              [routerLink]="child.route"
              routerLinkActive="active"
              (click)="navClick.emit()"
            >
              <span class="nav-icon">{{ child.icon }}</span>
              <span>{{ child.label }}</span>
            </a>
          </div>
        </ng-template>
      </ng-container>
    </ng-container>
  </nav>

  <div class="sidenav-footer">
    <div class="user-card">
      <div class="avatar">A</div>
      <div *ngIf="!collapsed()">
        <strong>管理員</strong>
        <p>已登入</p>
      </div>
    </div>
  </div>
</div>
```

```scss
// apps/admin/src/app/layout/side-nav/side-nav.component.scss
:host {
  display: contents;
}

.sidenav-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  flex: 0 0 auto;
}

.collapsed .brand {
  flex-direction: column;
  gap: 8px;
}

.collapse-toggle {
  margin-left: auto;
  flex-shrink: 0;
}

.collapsed .collapse-toggle {
  margin-left: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--mat-sys-primary) 78%, white),
    var(--mat-sys-primary)
  );
  color: var(--app-shell-on);
  font-weight: 800;
  font-size: 1.1rem;
}

.brand-copy h1 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.brand-copy p {
  margin: 2px 0 0;
  color: var(--app-shell-on-muted);
  font-size: 0.85rem;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.24) transparent;
}

.nav-list::-webkit-scrollbar {
  width: 6px;
}

.nav-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.24);
  border-radius: 999px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  color: var(--app-shell-on-muted);
  text-decoration: none;
  transition:
    background 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(255, 255, 255, 0.12);
  color: var(--app-shell-on);
  transform: translateX(2px);
}

.nav-icon {
  width: 24px;
  text-align: center;
}

.collapsed .nav-link,
.collapsed .nav-group-trigger {
  justify-content: center;
  padding: 12px 0;
}

.nav-group-trigger {
  width: 100%;
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.nav-group-caret {
  margin-left: auto;
  font-size: 20px;
  width: 20px;
  height: 20px;
  transition: transform 180ms ease;
}

.nav-group-caret.open {
  transform: rotate(180deg);
}

.nav-subgroup {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 2px 0 2px 26px;
  padding-left: 14px;
  border-left: 1px solid rgba(255, 255, 255, 0.16);
}

.nav-sublink {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  color: var(--app-shell-on-muted);
  text-decoration: none;
  transition:
    background 180ms ease,
    color 180ms ease;
}

.nav-sublink:hover,
.nav-sublink.active {
  background: rgba(255, 255, 255, 0.12);
  color: var(--app-shell-on);
}

.nav-flyout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  padding: 8px;
  border-radius: 14px;
  background: var(--app-shell-bg);
  color: var(--app-shell-on);
  box-shadow: var(--mat-sys-level4);
}

.nav-flyout-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--app-shell-on-muted);
  text-decoration: none;
  transition:
    background 180ms ease,
    color 180ms ease;
}

.nav-flyout-item:hover,
.nav-flyout-item.active {
  background: rgba(255, 255, 255, 0.12);
  color: var(--app-shell-on);
}

.sidenav-footer {
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
}

.collapsed .user-card {
  justify-content: center;
  padding: 10px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--mat-sys-primary);
  font-weight: 700;
}

.user-card strong {
  display: block;
  font-size: 0.95rem;
}

.user-card p {
  margin: 2px 0 0;
  color: var(--app-shell-on-muted);
  font-size: 0.8rem;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/layout/side-nav/
git commit -m "refactor(admin): 新增 layout/side-nav 元件，承接原本 app.html 內聯的側欄 markup"
```

---

### Task 3: `layout/header` 元件

**Files:**
- Create: `apps/admin/src/app/layout/header/header.component.ts`
- Create: `apps/admin/src/app/layout/header/header.component.html`
- Create: `apps/admin/src/app/layout/header/header.component.scss`
- Test: `apps/admin/src/app/layout/header/header.component.spec.ts`

**Interfaces:**
- Produces：selector `app-header`；Inputs：`currentTitle: string`（required）、`currentGroupLabel: string | null`（required）；Outputs：`menuToggle: void`。Task 5 接法：`(menuToggle)="toggleSidenav()"`。

- [ ] **Step 1: 寫測試**

```typescript
// apps/admin/src/app/layout/header/header.component.spec.ts
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('顯示標題與麵包屑', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentTitle', '車輛清單');
    fixture.componentRef.setInput('currentGroupLabel', '商品管理');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('商品管理');
    expect(text).toContain('車輛清單');
  });

  it('沒有 currentGroupLabel 時不顯示麵包屑前綴', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentTitle', '總覽');
    fixture.componentRef.setInput('currentGroupLabel', null);
    fixture.detectChanges();
    const breadcrumb = (fixture.nativeElement as HTMLElement).querySelector('.breadcrumb');
    expect(breadcrumb?.querySelectorAll('span').length).toBe(1);
  });

  it('點擊選單按鈕觸發 menuToggle 事件', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentTitle', '車輛清單');
    fixture.componentRef.setInput('currentGroupLabel', null);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.menuToggle.subscribe(() => (emitted = true));
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '.menu-toggle',
    ) as HTMLButtonElement;
    btn.click();
    expect(emitted).toBe(true);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL — 找不到 `./header.component` 模組。

- [ ] **Step 3: 建立元件**

```typescript
// apps/admin/src/app/layout/header/header.component.ts
import { Component, input, output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [NgIf, MatButtonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly currentTitle = input.required<string>();
  readonly currentGroupLabel = input.required<string | null>();
  readonly menuToggle = output<void>();
}
```

```html
<!-- apps/admin/src/app/layout/header/header.component.html -->
<header class="topbar">
  <button mat-icon-button class="menu-toggle" type="button" (click)="menuToggle.emit()">
    <mat-icon>menu</mat-icon>
  </button>

  <div class="topbar-title">
    <div class="breadcrumb">
      <ng-container *ngIf="currentGroupLabel()">
        <span>{{ currentGroupLabel() }}</span>
        <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
      </ng-container>
      <span>{{ currentTitle() }}</span>
    </div>
    <h2>{{ currentTitle() }}</h2>
  </div>
</header>
```

```scss
// apps/admin/src/app/layout/header/header.component.scss
:host {
  display: contents;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(10px);
}

.topbar-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 4px 0 0;
  color: var(--mat-sys-on-surface-variant);
  font-size: 0.8rem;
}

.breadcrumb-sep {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.menu-toggle {
  display: none;
}

@media (max-width: 900px) {
  .menu-toggle {
    display: inline-flex;
  }

  .topbar {
    padding: 16px 18px;
  }
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/layout/header/
git commit -m "refactor(admin): 新增 layout/header 元件，承接原本 app.html 內聯的 topbar markup"
```

---

### Task 4: `layout/footer` 元件（版本資訊 + copyright）

**Files:**
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts:200-202`（在 `} as const;` 前加 `layout` 區塊）
- Create: `apps/admin/src/app/layout/footer/footer.component.ts`
- Create: `apps/admin/src/app/layout/footer/footer.component.html`
- Create: `apps/admin/src/app/layout/footer/footer.component.scss`
- Test: `apps/admin/src/app/layout/footer/footer.component.spec.ts`

**Interfaces:**
- Produces：selector `app-footer`，無 Input/Output（純靜態內容）。

- [ ] **Step 1: 寫測試**

```typescript
// apps/admin/src/app/layout/footer/footer.component.spec.ts
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  it('顯示版本號與版權文字', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('澎湖租車後台');
    expect(text).toContain('©');
    expect(text).toContain(String(new Date().getFullYear()));
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx nx test admin`
Expected: FAIL — 找不到 `./footer.component` 模組。

- [ ] **Step 3: 加 i18n 文案**

在 `apps/admin/src/app/core/i18n/zh-tw.ts` 的 `commission` 區塊之後、`} as const;` 之前加：

```typescript
  layout: {
    copyright: '版權所有',
  },
```

- [ ] **Step 4: 建立元件**

```typescript
// apps/admin/src/app/layout/footer/footer.component.ts
import { Component } from '@angular/core';
import { ZH_TW } from '../../core/i18n/zh-tw';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly t = ZH_TW;
  protected readonly year = new Date().getFullYear();
  protected readonly version = '0.0.0';
}
```

> `version` 目前手動維護、與 `package.json` 的 `"version": "0.0.0"` 對齊；兩邊不會自動同步。若之後需要自動同步，可以改成建置時用 Nx 的 file-replacement 或環境變數注入，目前專案沒有這個需求，先手動維護即可。

```html
<!-- apps/admin/src/app/layout/footer/footer.component.html -->
<footer class="app-footer">
  <span>{{ t.app.title }} v{{ version }}</span>
  <span>© {{ year }} {{ t.layout.copyright }}</span>
</footer>
```

```scss
// apps/admin/src/app/layout/footer/footer.component.scss
:host {
  display: contents;
}

.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  border-top: 1px solid var(--mat-sys-outline-variant);
  color: var(--mat-sys-on-surface-variant);
  font-size: 0.75rem;
}

@media (max-width: 900px) {
  .app-footer {
    padding: 10px 16px;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx nx test admin`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/app/core/i18n/zh-tw.ts apps/admin/src/app/layout/footer/
git commit -m "refactor(admin): 新增 layout/footer 元件，顯示版本號與版權資訊"
```

---

### Task 5: 重寫 `app.html` / `app.ts` / `app.scss` 串接三個新元件

**Files:**
- Modify: `apps/admin/src/app/app.html`（全檔重寫）
- Modify: `apps/admin/src/app/app.ts`（全檔重寫）
- Modify: `apps/admin/src/app/app.scss`（全檔重寫）

**Interfaces:**
- Consumes: Task 1～4 產出的 `SideNavComponent`（`app-side-nav`）、`HeaderComponent`（`app-header`）、`FooterComponent`（`app-footer`）、`NavEntry`/`NavGroup`/`isNavGroup`。
- 這個 task 完成後，`app.html:137` 那顆沒有任何 Input、沒有內容的空殼 `<app-list-toolbar>` 會被整個移除（它原本就沒有被使用）。

- [ ] **Step 1: 重寫 `app.html`**

```html
<!-- apps/admin/src/app/app.html -->
<div class="app-shell">
  <mat-sidenav-container class="sidenav-container">
    <mat-sidenav
      #drawer
      class="app-sidenav"
      [class.collapsed]="!isMobile && collapsed"
      [mode]="isMobile ? 'over' : 'side'"
      [opened]="isMobile ? isSidenavOpen : true"
      (closedStart)="isSidenavOpen = false"
      (transitionend)="onSidenavTransitionEnd()"
    >
      <app-side-nav
        [navItems]="navItems"
        [collapsed]="collapsed"
        [isMobile]="isMobile"
        [openGroupLabel]="openGroupLabel"
        [currentGroupLabel]="currentGroupLabel"
        [flyoutPositions]="flyoutPositions"
        (toggleCollapse)="toggleCollapsed()"
        (toggleGroup)="toggleGroup($event)"
        (navClick)="onNavClick()"
        (groupDetach)="openGroupLabel = null"
      />
    </mat-sidenav>

    <mat-sidenav-content class="content-area">
      <app-header
        [currentTitle]="currentTitle"
        [currentGroupLabel]="currentGroupLabel"
        (menuToggle)="toggleSidenav()"
      />

      <main class="page-shell">
        <router-outlet />
      </main>

      <app-footer />
    </mat-sidenav-content>
  </mat-sidenav-container>

  <app-theme-switcher />
</div>
```

- [ ] **Step 2: 重寫 `app.ts`**

```typescript
// apps/admin/src/app/app.ts
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ZH_TW } from './core/i18n/zh-tw';
import { ThemeSwitcherComponent } from '@car-rental/theme-pack';
import { SideNavComponent } from './layout/side-nav/side-nav.component';
import { NavEntry, NavGroup, isNavGroup } from './layout/side-nav/nav-item.model';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    ThemeSwitcherComponent,
    SideNavComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly t = ZH_TW;

  protected readonly navItems: NavEntry[] = [
    { route: '/dashboard', label: this.t.nav.dashboard, icon: '◉' },
    {
      label: this.t.nav.productGroup,
      icon: '◫',
      children: [
        { route: '/vehicles', label: this.t.nav.vehicles, icon: '◫' },
        { route: '/maintenance', label: this.t.nav.maintenance, icon: '◎' },
        { route: '/add-ons', label: this.t.nav.addOns, icon: '◇' },
      ],
    },
    { route: '/bookings', label: this.t.nav.bookings, icon: '◍' },
    {
      label: this.t.nav.pricingGroup,
      icon: '◈',
      children: [
        { route: '/pricing', label: this.t.nav.pricing, icon: '◈' },
        { route: '/coupons', label: this.t.nav.coupons, icon: '◆' },
      ],
    },
    {
      label: this.t.nav.partnerGroup,
      icon: '◐',
      children: [
        { route: '/partners', label: this.t.nav.partners, icon: '◐' },
        { route: '/commission', label: this.t.nav.commission, icon: '◑' },
      ],
    },
  ];

  private readonly navLeaves = this.navItems.flatMap((entry) =>
    isNavGroup(entry) ? entry.children : [entry],
  );

  protected isMobile = false;
  protected isSidenavOpen = true;
  protected currentTitle = String(this.t.nav.dashboard);
  protected currentGroupLabel: string | null = null;
  protected openGroupLabel: string | null = null;
  protected collapsed = false;

  protected readonly flyoutPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
  ];

  @ViewChild(MatSidenavContainer) private sidenavContainer?: MatSidenavContainer;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 900px)']).subscribe((result) => {
      this.isMobile = result.matches;
      this.isSidenavOpen = !result.matches;
      if (this.isMobile) {
        this.collapsed = false;
      }
    });

    this.router.events
      .pipe(
        filter((event) => event.type === 1),
        map(() => this.router.url),
      )
      .subscribe((url) => {
        const active = this.navLeaves.find(
          (item) => item.route === url || url.startsWith(`${item.route}/`),
        );
        this.currentTitle = active?.label ?? this.t.nav.dashboard;

        const activeGroup = active
          ? this.navItems.find(
              (entry): entry is NavGroup => isNavGroup(entry) && entry.children.includes(active),
            )
          : undefined;
        this.currentGroupLabel = activeGroup?.label ?? null;

        if (activeGroup) {
          this.openGroupLabel = activeGroup.label;
        }
      });
  }

  protected toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  protected toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.openGroupLabel = null;
  }

  protected onSidenavTransitionEnd(): void {
    this.sidenavContainer?.updateContentMargins();
  }

  protected onNavClick(): void {
    if (this.isMobile) {
      this.isSidenavOpen = false;
    }
  }

  protected toggleGroup(label: string): void {
    this.openGroupLabel = this.openGroupLabel === label ? null : label;
  }
}
```

> 跟原本的 `app.ts` 相比，拿掉了 `isGroupActive()` 方法——它原本只是給 template 判斷群組是否要加 `active` class 用，現在這個判斷邏輯搬進 `SideNavComponent`（用 `currentGroupLabel() === group.label` 比對，效果等價，因為 `currentGroupLabel` 本來就是用同一套比對邏輯算出來的）。也拿掉了原本就沒被使用到的 `NavigationEnd` import（原檔案有 import 但從未真的用到 `instanceof NavigationEnd`，只用 magic number `event.type === 1`，屬於既有的死 import，順手清掉）。

- [ ] **Step 3: 重寫 `app.scss`**

```scss
// apps/admin/src/app/app.scss
:host {
  display: block;
  height: 100%;
}

.app-shell {
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--mat-sys-surface-container-low) 0%,
    var(--mat-sys-surface-container-high) 100%
  );
}

.sidenav-container {
  height: 100%;
}

.app-sidenav {
  width: 280px;
  border: 0;
  background: var(--app-shell-bg);
  color: var(--app-shell-on);
  padding: 24px 16px;
  box-shadow: var(--mat-sys-level4);
  transition: width 200ms ease;
}

.app-sidenav.collapsed {
  width: 84px;
  padding: 24px 12px;
}

.content-area {
  display: flex;
  flex-direction: column;
  background: transparent;
}

.page-shell {
  display: flex;
  flex-direction: column;
  padding: 24px;
  padding-top: 1.5rem;
  min-height: 0;
}

.ui-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.page-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  font-size: 0.875rem;
  color: var(--mat-sys-on-surface-variant);
}

.table-head {
  text-align: left;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.table-cell {
  color: var(--mat-sys-on-surface-variant);
  padding: 0.75rem 1rem;
}

.table-cell--body {
  color: inherit;
}

.table-row {
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.table-row:last-child {
  border-bottom: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card {
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  background: var(--mat-sys-surface);
  border: 1px solid var(--mat-sys-outline-variant);
  box-shadow: var(--mat-sys-level2);
}

.stat-card--hero {
  background: var(--mat-sys-inverse-surface);
  color: var(--mat-sys-inverse-on-surface);
  border-color: transparent;
}

.stat-card__label {
  margin-top: 0.35rem;
  font-size: 0.875rem;
  color: var(--mat-sys-on-surface-variant);
}

.stat-card__label--hero {
  color: var(--mat-sys-inverse-on-surface);
}

.content-grid {
  display: grid;
  gap: 1.25rem;
}

.section-title {
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  font-family: var(--font-display);
}

.list-stack {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.list-row:last-child {
  border-bottom: 0;
}

.list-row__secondary {
  color: var(--mat-sys-on-surface-variant);
}

.list-row__meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--mat-sys-on-surface-variant);
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.alert-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-weight: 600;
  background: var(--app-warning-bg);
  color: var(--app-warning-fg);
}

.alert-chip--overdue {
  background: var(--app-danger-bg);
  color: var(--app-danger-fg);
}

.alert-chip__dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 999px;
  background: var(--app-warning-dot);
}

.alert-chip__dot--overdue {
  background: var(--app-danger-dot);
}

.form-shell {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.tier-row,
.range-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.error-message {
  font-size: 0.875rem;
  white-space: pre-wrap;
  color: var(--app-danger-fg);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.875rem;
}

.muted {
  color: var(--mat-sys-on-surface-variant);
}

.stack-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alert-item {
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  background: var(--app-warning-bg);
  color: var(--app-warning-fg);
}

.alert-item--overdue {
  background: var(--app-danger-bg);
  color: var(--app-danger-fg);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vehicle-list {
  display: flex;
  flex-direction: column;
}

.vehicle-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.vehicle-row:last-child {
  border-bottom: 0;
}

.vehicle-row__plate {
  width: 7rem;
}

.vehicle-row__status {
  width: 5rem;
  color: var(--mat-sys-on-surface-variant);
}

.action-cell {
  white-space: nowrap;
}

.text-secondary {
  color: var(--mat-sys-on-surface-variant);
}

@media (max-width: 900px) {
  .app-sidenav {
    width: min(86vw, 280px);
  }

  .page-shell {
    padding: 16px;
  }
}

@media (min-width: 768px) {
  .stat-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 4: 跑測試與 build 確認**

Run: `npx nx test admin`
Expected: PASS，包含既有的 `apps/admin/src/app/app.spec.ts`（`.brand` 文字檢查——`.brand` 現在雖然是 `SideNavComponent` 自己模板裡的元素，但 `fixture.nativeElement.querySelector()` 查的是完整渲染後的 DOM tree，跨元件邊界照樣找得到，這個既有測試不用改）。

Run: `npx nx build admin`
Expected: 編譯成功，無 TypeScript 或 template 錯誤。

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/app.html apps/admin/src/app/app.ts apps/admin/src/app/app.scss
git commit -m "refactor(admin): app shell 拆分為 side-nav/header/footer 三個 layout 元件，並移除從未接線的空殼 list-toolbar"
```

---

### Task 6: `ListToolbarComponent` 更名為 `PageToolbarComponent`

**Files:**
- Modify: `apps/admin/src/app/shared/ui/list-toolbar.component.ts` → 改名為 `apps/admin/src/app/shared/ui/page-toolbar.component.ts`
- Modify: `apps/admin/src/app/shared/ui/list-toolbar.component.html` → 改名為 `apps/admin/src/app/shared/ui/page-toolbar.component.html`
- Modify: `apps/admin/src/app/shared/ui/list-toolbar.component.scss` → 改名為 `apps/admin/src/app/shared/ui/page-toolbar.component.scss`
- Modify: 以下 7 個檔案裡的 `<app-list-toolbar` 使用點與對應的 import／`imports` 陣列：
  - `apps/admin/src/app/features/bookings/pages/customers-page.component.html`、`.ts`
  - `apps/admin/src/app/features/bookings/pages/bookings-page.component.html`、`.ts`
  - `apps/admin/src/app/features/add-ons/pages/add-ons-page.component.html`、`.ts`
  - `apps/admin/src/app/features/coupons/pages/coupons-page.component.html`、`.ts`
  - `apps/admin/src/app/features/vehicles/pages/vehicles-page.component.html`、`.ts`
  - `apps/admin/src/app/features/partners/pages/partners-page.component.html`、`.ts`
  - `apps/admin/src/app/features/pricing/pages/pricing-page.component.html`、`.ts`

這是純機械式改名（class 名、selector、檔名、import 路徑），不改任何邏輯/行為，用整個 repo 搜尋取代即可，不用逐檔手動編輯。

- [ ] **Step 1: 改名 + 內容替換**

```bash
cd /Users/fangjiemini/bbd-projects/car-rental

# 改名 3 個實體檔案
git mv apps/admin/src/app/shared/ui/list-toolbar.component.ts apps/admin/src/app/shared/ui/page-toolbar.component.ts
git mv apps/admin/src/app/shared/ui/list-toolbar.component.html apps/admin/src/app/shared/ui/page-toolbar.component.html
git mv apps/admin/src/app/shared/ui/list-toolbar.component.scss apps/admin/src/app/shared/ui/page-toolbar.component.scss

# 檔案內容：class 名、selector、templateUrl/styleUrls、以及所有頁面引用一次改完
grep -rl "list-toolbar\|ListToolbarComponent\|app-list-toolbar" apps/admin/src \
  | xargs sed -i '' \
    -e 's/ListToolbarComponent/PageToolbarComponent/g' \
    -e 's/app-list-toolbar/app-page-toolbar/g' \
    -e 's/list-toolbar\.component/page-toolbar.component/g'
```

- [ ] **Step 2: 驗證替換完整、沒有殘留**

```bash
grep -rn "list-toolbar\|ListToolbarComponent\|app-list-toolbar" apps/admin/src
```

Expected: 無任何輸出（全部替換乾淨）。

```bash
grep -rln "PageToolbarComponent\|app-page-toolbar" apps/admin/src
```

Expected: 列出 `page-toolbar.component.ts` 本身 + 7 個頁面的 `.ts`/`.html` 共約 15 個檔案。

- [ ] **Step 3: 跑測試與 build 確認**

Run: `npx nx test admin`
Expected: PASS

Run: `npx nx build admin`
Expected: 編譯成功

- [ ] **Step 4: 抽查 3 個檔案的 diff**

```bash
git diff apps/admin/src/app/shared/ui/page-toolbar.component.ts
git diff apps/admin/src/app/features/vehicles/pages/vehicles-page.component.html
git diff apps/admin/src/app/features/bookings/pages/bookings-page.component.ts
```

確認只有 `list-toolbar`/`ListToolbarComponent`/`app-list-toolbar` → `page-toolbar`/`PageToolbarComponent`/`app-page-toolbar` 的文字替換，沒有動到其他邏輯。

- [ ] **Step 5: Commit**

```bash
git add -A apps/admin/src
git commit -m "refactor(admin): ListToolbarComponent 更名為 PageToolbarComponent，語意涵蓋 search/filter/actions 三種用途，不侷限於 filter"
```

---

### Task 7: 全域最終驗證

- [ ] **Step 1: 完整測試 + build**

Run: `npx nx test admin && npx nx build admin`
Expected: 兩者都成功，退出碼 0。

- [ ] **Step 2: 確認沒有殘留的舊命名或死程式碼**

```bash
grep -rn "list-toolbar\|ListToolbarComponent" apps/admin/src
grep -n "isGroupActive" apps/admin/src/app/app.ts
```

Expected: 兩個指令都無輸出。

- [ ] **Step 3: 手動視覺驗證（起 dev server 抽查）**

```bash
npx nx serve admin
```

開瀏覽器看：(a) 側欄展開/收合、群組展開/收合、手機寬度（390px）下選單抽屜；(b) header 麵包屑隨路由切換；(c) 頁面下方出現版本號+版權的 footer；(d) 有 filter 的頁面（bookings、vehicles）filter chips 仍正常運作；(e) 只用 actions 的頁面（如 coupons、partners）「新增」按鈕仍在原位。看完 `Ctrl+C` 關掉 server。

---

## Self-Review 摘要

- **Spec 覆蓋**：三個原始問題——(1) 空殼 list-toolbar 是否要接線／刪除 → Task 5 刪除；(2) layout 三拆分 side-nav/header/footer → Task 2/3/4/5；(3) footer 放版本+copyright → Task 4；(4) list-toolbar 改名 page-toolbar → Task 6。全部對應到具體 task。
- **型別一致性**：`SideNavComponent` 的 `toggleGroup` output 型別 `string`，`App.toggleGroup(label: string)` 簽章一致；`HeaderComponent`/`FooterComponent` 無跨檔案型別依賴風險。
- **No Placeholders**：每個 step 都是可直接執行的完整程式碼或指令，沒有「之後補」的字樣。
