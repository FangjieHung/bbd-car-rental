# Responsive Panel (Calendar Day Detail) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `calendar-view`'s day-detail list into a responsive panel — a bottom sheet below 1024px, a flexible-width push-aside at or above 1024px — via a new, standalone `ResponsivePanelComponent` in `libs/ui`.

**Architecture:** Three-layer separation. `ResponsivePanelComponent` (new, `libs/ui`) owns *how* it opens/closes/resizes and knows nothing about calendar data. `CalendarViewComponent` (existing, `apps/admin`) owns *what* is inside and *when* it's open, via two new signals (`panelDismissed`, `panelOpen`) layered on top of the existing `selected`/`selectDate`/`dateSelected` contract. Breakpoint detection uses `@angular/cdk/layout`'s `BreakpointObserver`, already the codebase's established pattern (`apps/admin/src/app/app.ts:76-86`).

**Tech Stack:** Angular 22 standalone components, signals (`input`/`output`/`signal`/`computed`/`effect`/`viewChild`), `@angular/cdk/layout` `BreakpointObserver`, Vitest, Nx.

**Spec:** `docs/superpowers/specs/2026-08-14-responsive-panel-design.md`

## Global Constraints

- Breakpoint is exactly `max-width: 1024px` for both the CSS media query and the JS `BreakpointObserver.observe()` call — must match verbatim (spec §3.1).
- `ResponsivePanelComponent` declares no user-visible strings itself; `closeLabel` is a required input (spec §5).
- Desktop (≥1024px) panel width is `flex: 0 1 clamp(320px, 32vw, 480px)` — flexible, not fixed (spec §3.2).
- Mobile (<1024px) panel is `max-height: 70vh` with internal scroll, not full-screen (spec §3.2).
- Closing the panel must never clear `CalendarViewComponent`'s `selected` signal — only `panelDismissed` changes (spec §4).
- `apps/admin` SCSS is scanned by `npm run lint:theme`, which forbids hex colors and raw palette vars — use only `--mat-sys-*` / `--app-*` tokens for colors in `calendar-view.component.scss` (already the file's existing convention).
- `CalendarViewComponent` already has `targetDate` input, `dateSelected` output, and `selectDate(date: Date)` method implemented (completed outside this plan, during brainstorming, as part of the separate `docs/plans/2026-08-13-dashboard-date-sync.md` work) — do not recreate them; extend them.

---

### Task 1: `ResponsivePanelComponent` — open/close and content projection

**Files:**
- Create: `libs/ui/src/lib/responsive-panel/responsive-panel.component.ts`
- Create: `libs/ui/src/lib/responsive-panel/responsive-panel.component.html`
- Create: `libs/ui/src/lib/responsive-panel/responsive-panel.component.scss`
- Test: `libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts`

**Interfaces:**
- Produces: `ResponsivePanelComponent` (selector `lib-responsive-panel`) with `open = input(false)`, `heading = input('')`, `closeLabel = input.required<string>()`, `closed = output<void>()`. Not yet exported from `libs/ui/src/index.ts` (done in Task 3).

- [ ] **Step 1: Write the failing test**

```ts
// libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ResponsivePanelComponent } from './responsive-panel.component';

@Component({
  imports: [ResponsivePanelComponent],
  template: `
    <button type="button" class="trigger" (click)="open.set(true)">開啟</button>
    <lib-responsive-panel
      [open]="open()"
      [heading]="heading()"
      closeLabel="關閉面板"
      (closed)="onClosed()"
    >
      <p class="content">內容</p>
      <button type="button" class="content-action">動作</button>
    </lib-responsive-panel>
  `,
})
class HostComponent {
  readonly open = signal(false);
  readonly heading = signal('標題');
  closedCount = 0;
  onClosed(): void {
    this.closedCount++;
  }
}

describe('ResponsivePanelComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('open 為 false 時不渲染投影內容', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();
  });

  it('open 為 true 時渲染投影內容與標題', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.content')?.textContent).toContain('內容');
    expect(fixture.nativeElement.textContent).toContain('標題');
  });

  it('點關閉鈕發出 closed', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.responsive-panel__close',
    );
    closeButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('關閉鈕的 aria-label 來自 closeLabel input', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.responsive-panel__close',
    );
    expect(closeButton.getAttribute('aria-label')).toBe('關閉面板');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx run ui:test --include="libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts"`
Expected: FAIL — `responsive-panel.component.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
// libs/ui/src/lib/responsive-panel/responsive-panel.component.ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-responsive-panel',
  templateUrl: './responsive-panel.component.html',
  styleUrl: './responsive-panel.component.scss',
})
export class ResponsivePanelComponent {
  readonly open = input(false);
  readonly heading = input('');
  readonly closeLabel = input.required<string>();
  readonly closed = output<void>();
}
```

```html
<!-- libs/ui/src/lib/responsive-panel/responsive-panel.component.html -->
@if (open()) {
  <div class="responsive-panel">
    <div class="responsive-panel__header">
      @if (heading()) {
        <h2 class="responsive-panel__heading">{{ heading() }}</h2>
      }
      <button
        type="button"
        class="responsive-panel__close"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </div>
    <div class="responsive-panel__body">
      <ng-content />
    </div>
  </div>
}
```

```scss
// libs/ui/src/lib/responsive-panel/responsive-panel.component.scss
:host {
  display: contents;
}

.responsive-panel {
  display: flex;
  flex-direction: column;
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  border: 1px solid var(--mat-sys-outline-variant);
  border-radius: var(--mat-sys-corner-large);
  box-shadow: var(--mat-sys-level1);
  overflow: hidden;
}

.responsive-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.responsive-panel__heading {
  margin: 0;
  font-weight: 700;
}

.responsive-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--mat-sys-on-surface-variant);
}

.responsive-panel__body {
  padding: 0.75rem 1rem;
  overflow-y: auto;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx nx run ui:test --include="libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts"`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/lib/responsive-panel/responsive-panel.component.ts libs/ui/src/lib/responsive-panel/responsive-panel.component.html libs/ui/src/lib/responsive-panel/responsive-panel.component.scss libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts
git commit -m "feat(ui): add ResponsivePanelComponent open/close skeleton"
```

---

### Task 2: `ResponsivePanelComponent` — breakpoint, backdrop, modal semantics, Esc

**Files:**
- Modify: `libs/ui/src/lib/responsive-panel/responsive-panel.component.ts`
- Modify: `libs/ui/src/lib/responsive-panel/responsive-panel.component.html`
- Modify: `libs/ui/src/lib/responsive-panel/responsive-panel.component.scss`
- Test: `libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts`

**Interfaces:**
- Consumes: `HostComponent` from Task 1 (same file, same class — do not redefine).
- Produces: protected `isNarrow` signal (internal, not part of public API) driving `.responsive-panel--narrow` class, `role="dialog"`/`aria-modal="true"` attributes (narrow only), and a `.responsive-panel__backdrop` element (narrow only, click emits `closed`). Esc key emits `closed` whenever `open()` is true, in both modes.

- [ ] **Step 1: Write the failing tests**

Append to the existing `libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts` (add these imports at the top alongside the existing ones, and add a new `describe` block after the existing one):

```ts
// add to the top imports:
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

// add after the existing `describe('ResponsivePanelComponent', ...)` block:
function provideBreakpoint(matches: boolean) {
  return {
    provide: BreakpointObserver,
    useValue: { observe: () => of({ matches, breakpoints: {} }) },
  };
}

describe('ResponsivePanelComponent 響應式行為', () => {
  function createFixture(narrow: boolean) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideBreakpoint(narrow)],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    return fixture;
  }

  it('窄螢幕：具 role=dialog 與 aria-modal，且有遮罩', () => {
    const fixture = createFixture(true);
    const panel: HTMLElement = fixture.nativeElement.querySelector('.responsive-panel');

    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.querySelector('.responsive-panel__backdrop')).not.toBeNull();
  });

  it('窄螢幕：點遮罩發出 closed', () => {
    const fixture = createFixture(true);
    const backdrop: HTMLElement = fixture.nativeElement.querySelector(
      '.responsive-panel__backdrop',
    );

    backdrop.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('寬螢幕：無 role/aria-modal，無遮罩', () => {
    const fixture = createFixture(false);
    const panel: HTMLElement = fixture.nativeElement.querySelector('.responsive-panel');

    expect(panel.hasAttribute('role')).toBe(false);
    expect(panel.hasAttribute('aria-modal')).toBe(false);
    expect(fixture.nativeElement.querySelector('.responsive-panel__backdrop')).toBeNull();
  });

  it('開啟時按 Esc 發出 closed', () => {
    const fixture = createFixture(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('關閉時按 Esc 不動作', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideBreakpoint(false)],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx nx run ui:test --include="libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts"`
Expected: FAIL — no `role`/`aria-modal`/backdrop/Esc handling yet.

- [ ] **Step 3: Implement breakpoint detection, backdrop, modal attributes, Esc**

```ts
// libs/ui/src/lib/responsive-panel/responsive-panel.component.ts (replace entire file)
import { Component, HostListener, inject, input, output } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const NARROW_QUERY = '(max-width: 1024px)';

@Component({
  selector: 'lib-responsive-panel',
  templateUrl: './responsive-panel.component.html',
  styleUrl: './responsive-panel.component.scss',
})
export class ResponsivePanelComponent {
  readonly open = input(false);
  readonly heading = input('');
  readonly closeLabel = input.required<string>();
  readonly closed = output<void>();

  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly isNarrow = toSignal(
    this.breakpointObserver.observe([NARROW_QUERY]).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
```

```html
<!-- libs/ui/src/lib/responsive-panel/responsive-panel.component.html (replace entire file) -->
@if (open()) {
  @if (isNarrow()) {
    <div class="responsive-panel__backdrop" (click)="closed.emit()"></div>
  }
  <div
    class="responsive-panel"
    [class.responsive-panel--narrow]="isNarrow()"
    [attr.role]="isNarrow() ? 'dialog' : null"
    [attr.aria-modal]="isNarrow() ? 'true' : null"
  >
    <div class="responsive-panel__header">
      @if (heading()) {
        <h2 class="responsive-panel__heading">{{ heading() }}</h2>
      }
      <button
        type="button"
        class="responsive-panel__close"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </div>
    <div class="responsive-panel__body">
      <ng-content />
    </div>
  </div>
}
```

Append to `responsive-panel.component.scss` (keep everything already there from Task 1):

```scss
.responsive-panel:not(.responsive-panel--narrow) {
  flex: 0 1 clamp(320px, 32vw, 480px);
  min-width: 0;
}

.responsive-panel--narrow {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  max-height: 70vh;
  overflow-y: auto;
  border-radius: var(--mat-sys-corner-large) var(--mat-sys-corner-large) 0 0;
  z-index: 101;
  animation: responsive-panel-slide-up 0.2s ease-out;
}

.responsive-panel__backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 40%);
  z-index: 100;
}

@keyframes responsive-panel-slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx run ui:test --include="libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts"`
Expected: PASS (9 tests total).

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/lib/responsive-panel/responsive-panel.component.ts libs/ui/src/lib/responsive-panel/responsive-panel.component.html libs/ui/src/lib/responsive-panel/responsive-panel.component.scss libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts
git commit -m "feat(ui): add ResponsivePanelComponent breakpoint, backdrop, Esc"
```

---

### Task 3: `ResponsivePanelComponent` — focus management, scroll lock, export

**Files:**
- Modify: `libs/ui/src/lib/responsive-panel/responsive-panel.component.ts`
- Modify: `libs/ui/src/lib/responsive-panel/responsive-panel.component.html`
- Modify: `libs/ui/src/index.ts`
- Test: `libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts`

**Interfaces:**
- Consumes: `HostComponent`, `provideBreakpoint` from Tasks 1–2 (same spec file).
- Produces: `ResponsivePanelComponent` now exported from `@car-rental/ui` (public entry point), ready for Task 5 to consume.

- [ ] **Step 1: Write the failing tests**

Append to `libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts`, after the `describe('ResponsivePanelComponent 響應式行為', ...)` block:

```ts
describe('ResponsivePanelComponent 焦點與捲動', () => {
  // 每個 it() 只呼叫一次 configureTestingModule（透過這個 helper），避免在同一個
  // test 內於 fixture 建立後重新設定 TestBed（Angular 會丟錯）。
  function createFixture(narrow: boolean) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideBreakpoint(narrow)],
    });
    return TestBed.createComponent(HostComponent);
  }

  it('開啟時焦點移入面板內第一個可聚焦元素', () => {
    const fixture = createFixture(false);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.responsive-panel__close');
    expect(document.activeElement).toBe(closeButton);
  });

  it('關閉後焦點還原到觸發元素', () => {
    const fixture = createFixture(false);
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.trigger');
    trigger.focus();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger);
  });

  it('窄螢幕下 Tab 在最後一個可聚焦元素時循環回第一個', () => {
    const fixture = createFixture(true);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const closeButton: HTMLElement = fixture.nativeElement.querySelector(
      '.responsive-panel__close',
    );
    const actionButton: HTMLElement = fixture.nativeElement.querySelector('.content-action');
    actionButton.focus();

    fixture.nativeElement
      .querySelector('.responsive-panel')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(document.activeElement).toBe(closeButton);
  });

  it('寬螢幕下 Tab 不被攔截（無循環）', () => {
    const fixture = createFixture(false);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const actionButton: HTMLElement = fixture.nativeElement.querySelector('.content-action');
    actionButton.focus();

    fixture.nativeElement
      .querySelector('.responsive-panel')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(document.activeElement).toBe(actionButton);
  });

  it('窄螢幕開啟時鎖住 body 捲動，關閉後還原', () => {
    const fixture = createFixture(true);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(document.body.style.overflow).toBe('hidden');

    fixture.componentInstance.open.set(false);
    fixture.detectChanges();

    expect(document.body.style.overflow).toBe('');
  });

  it('寬螢幕開啟時不鎖住 body 捲動', () => {
    const fixture = createFixture(false);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(document.body.style.overflow).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx nx run ui:test --include="libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts"`
Expected: FAIL — no focus management, no tab trap, no scroll lock yet.

- [ ] **Step 3: Implement focus management and scroll lock**

```ts
// libs/ui/src/lib/responsive-panel/responsive-panel.component.ts (replace entire file)
import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const NARROW_QUERY = '(max-width: 1024px)';
const FOCUSABLE_SELECTOR =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'lib-responsive-panel',
  templateUrl: './responsive-panel.component.html',
  styleUrl: './responsive-panel.component.scss',
})
export class ResponsivePanelComponent {
  readonly open = input(false);
  readonly heading = input('');
  readonly closeLabel = input.required<string>();
  readonly closed = output<void>();

  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly isNarrow = toSignal(
    this.breakpointObserver.observe([NARROW_QUERY]).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private lastFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.lastFocused = document.activeElement as HTMLElement | null;
        if (this.isNarrow()) document.body.style.overflow = 'hidden';
        this.focusableElements()[0]?.focus();
      } else {
        document.body.style.overflow = '';
        this.lastFocused?.focus?.();
        this.lastFocused = null;
      }
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.closed.emit();
  }

  protected onTrapKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.isNarrow()) return;
    const focusables = this.focusableElements();
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableElements(): HTMLElement[] {
    const root = this.panelRef()?.nativeElement;
    return root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
  }
}
```

```html
<!-- libs/ui/src/lib/responsive-panel/responsive-panel.component.html (replace entire file) -->
@if (open()) {
  @if (isNarrow()) {
    <div class="responsive-panel__backdrop" (click)="closed.emit()"></div>
  }
  <div
    #panel
    class="responsive-panel"
    [class.responsive-panel--narrow]="isNarrow()"
    [attr.role]="isNarrow() ? 'dialog' : null"
    [attr.aria-modal]="isNarrow() ? 'true' : null"
    (keydown)="onTrapKeydown($event)"
  >
    <div class="responsive-panel__header">
      @if (heading()) {
        <h2 class="responsive-panel__heading">{{ heading() }}</h2>
      }
      <button
        type="button"
        class="responsive-panel__close"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </div>
    <div class="responsive-panel__body">
      <ng-content />
    </div>
  </div>
}
```

Export the component from the library's public API:

```ts
// libs/ui/src/index.ts (add this line; keep the existing four export lines as-is)
export * from './lib/responsive-panel/responsive-panel.component';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx run ui:test --include="libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts"`
Expected: PASS (15 tests total).

Run: `npx nx run ui:test`
Expected: PASS (full `ui` project suite, no regressions in `data-table`).

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/lib/responsive-panel/responsive-panel.component.ts libs/ui/src/lib/responsive-panel/responsive-panel.component.html libs/ui/src/index.ts libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts
git commit -m "feat(ui): add ResponsivePanelComponent focus trap, scroll lock, export"
```

---

### Task 4: `CalendarViewComponent` — panel open/dismiss state

**Files:**
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts`
- Test: `apps/admin/src/app/features/dispatch/calendar-view.spec.ts`

**Interfaces:**
- Consumes: existing `CalendarViewComponent` fields — `selected` signal, `targetDate` input, `dateSelected` output, `selectDate(date: Date): void`, `shiftMonth(n: number): void` (all already implemented; do not recreate).
- Produces: new `panelDismissed` signal, `panelOpen` computed, `panelHeading` computed, `dismissPanel(): void` method — consumed by Task 5's template.

**Current state of the file being modified** (for reference — do not treat this as something to write, it already exists):

```ts
// current constructor and selectDate in calendar-view.component.ts
readonly selected = signal<Date | null>(null);
readonly targetDate = input<Date>(startOfDay(new Date()));
readonly dateSelected = output<Date>();

constructor() {
  effect(() => {
    const date = startOfDay(this.targetDate());
    this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
    this.selected.set(date);
  });
}

shiftMonth(n: number): void {
  const m = this.month();
  this.month.set(new Date(m.getFullYear(), m.getMonth() + n, 1));
  this.selected.set(null);
}

selectDate(date: Date): void {
  const normalized = startOfDay(date);
  this.selected.set(normalized);
  this.dateSelected.emit(normalized);
}
```

- [ ] **Step 1: Write the failing tests**

Append to `apps/admin/src/app/features/dispatch/calendar-view.spec.ts`, after the existing `describe('CalendarViewComponent supplied date', ...)` block (keep all existing content in the file untouched):

```ts
describe('CalendarViewComponent 面板開關', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
  });

  it('selectDate 開啟面板並保留選取日期', () => {
    const d = new Date(2026, 6, 10);
    fixture.componentInstance.selectDate(d);

    expect(fixture.componentInstance.selected()).toEqual(d);
    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('dismissPanel 收起面板但保留選取日期', () => {
    const d = new Date(2026, 6, 10);
    fixture.componentInstance.selectDate(d);
    fixture.componentInstance.dismissPanel();

    expect(fixture.componentInstance.selected()).toEqual(d);
    expect(fixture.componentInstance.panelOpen()).toBe(false);
  });

  it('關閉後再次 selectDate 同一天會重新開啟面板', () => {
    const d = new Date(2026, 6, 10);
    fixture.componentInstance.selectDate(d);
    fixture.componentInstance.dismissPanel();
    fixture.componentInstance.selectDate(d);

    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('面板關閉時 selectDate 另一天會開啟並顯示新日期', () => {
    const d1 = new Date(2026, 6, 10);
    const d2 = new Date(2026, 6, 12);
    fixture.componentInstance.selectDate(d1);
    fixture.componentInstance.dismissPanel();
    fixture.componentInstance.selectDate(d2);

    expect(fixture.componentInstance.selected()).toEqual(d2);
    expect(fixture.componentInstance.panelOpen()).toBe(true);
  });

  it('換月會收起面板（selected 清空）', () => {
    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    fixture.componentInstance.shiftMonth(1);

    expect(fixture.componentInstance.selected()).toBeNull();
    expect(fixture.componentInstance.panelOpen()).toBe(false);
  });

  it('panelHeading 依選取日期組字串；未選取時為空字串', () => {
    expect(fixture.componentInstance.panelHeading()).toBe('');

    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    expect(fixture.componentInstance.panelHeading()).toBe('當日明細（7/10）');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx nx run admin:test --include="apps/admin/src/app/features/dispatch/calendar-view.spec.ts"`
Expected: FAIL — `panelOpen`, `panelHeading`, `dismissPanel` do not exist yet.

- [ ] **Step 3: Implement panel state**

Edit `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts`:

Add `panelDismissed` signal next to `selected`:

```ts
readonly selected = signal<Date | null>(null);
readonly panelDismissed = signal(false);
```

Add `panelOpen` and `panelHeading` computed values after `monthDays`:

```ts
readonly panelOpen = computed(() => this.selected() !== null && !this.panelDismissed());

readonly panelHeading = computed(() => {
  const sel = this.selected();
  return sel ? `${this.t.dispatch.dayDetail}（${sel.getMonth() + 1}/${sel.getDate()}）` : '';
});
```

Update the constructor effect to reset `panelDismissed` whenever `targetDate` changes:

```ts
constructor() {
  effect(() => {
    const date = startOfDay(this.targetDate());
    this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
    this.selected.set(date);
    this.panelDismissed.set(false);
  });
}
```

Update `selectDate` to also reset `panelDismissed`:

```ts
selectDate(date: Date): void {
  const normalized = startOfDay(date);
  this.selected.set(normalized);
  this.panelDismissed.set(false);
  this.dateSelected.emit(normalized);
}
```

Add `dismissPanel` next to `shiftMonth`:

```ts
dismissPanel(): void {
  this.panelDismissed.set(true);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx run admin:test --include="apps/admin/src/app/features/dispatch/calendar-view.spec.ts"`
Expected: PASS (11 tests total in this file).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts apps/admin/src/app/features/dispatch/calendar-view.spec.ts
git commit -m "feat(admin): add calendar panel open/dismiss state"
```

---

### Task 5: `CalendarViewComponent` — wire `ResponsivePanelComponent` into the template

**Files:**
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.html`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.scss`
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts`
- Test: `apps/admin/src/app/features/dispatch/calendar-view.spec.ts`

**Interfaces:**
- Consumes: `ResponsivePanelComponent` from `@car-rental/ui` (Task 3), `panelOpen`/`panelHeading`/`dismissPanel` from Task 4, `t.common.closePanel` (new i18n key added in this task).

- [ ] **Step 1: Write the failing tests**

Append to `apps/admin/src/app/features/dispatch/calendar-view.spec.ts`, after the `describe('CalendarViewComponent 面板開關', ...)` block:

```ts
describe('CalendarViewComponent 面板 DOM 行為', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CalendarViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
        { provide: CUSTOMER_REPO, useValue: createInMemoryRepo<Customer>([]) },
      ],
    });
    fixture = TestBed.createComponent(CalendarViewComponent);
    fixture.detectChanges();
  });

  it('點日期格子開啟面板並標示選取', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll<HTMLButtonElement>('.calendar-view__day'),
    );
    dayButtons[10].click();
    fixture.detectChanges();

    expect(dayButtons[10].classList.contains('calendar-view__day--selected')).toBe(true);
    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).not.toBeNull();
  });

  it('點關閉鈕收起面板但保留格子選取樣式', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll<HTMLButtonElement>('.calendar-view__day'),
    );
    dayButtons[10].click();
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector<HTMLButtonElement>('.responsive-panel__close')
      .click();
    fixture.detectChanges();

    expect(dayButtons[10].classList.contains('calendar-view__day--selected')).toBe(true);
    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).toBeNull();
  });

  it('關閉後再點同一天會重新開啟面板', () => {
    const dayButtons = Array.from(
      fixture.nativeElement.querySelectorAll<HTMLButtonElement>('.calendar-view__day'),
    );
    dayButtons[10].click();
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector<HTMLButtonElement>('.responsive-panel__close')
      .click();
    fixture.detectChanges();

    dayButtons[10].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.responsive-panel__body')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx nx run admin:test --include="apps/admin/src/app/features/dispatch/calendar-view.spec.ts"`
Expected: FAIL — `.responsive-panel__body`/`.responsive-panel__close` do not exist in the rendered template yet.

- [ ] **Step 3: Add the i18n key**

Edit `apps/admin/src/app/core/i18n/zh-tw.ts`, inside the `common` block, add one line after `exportFailedText`:

```ts
  common: {
    // ...existing keys unchanged...
    exportFailedText: '匯出失敗，請確認網路連線後再試一次',
    closePanel: '關閉面板',
  },
```

- [ ] **Step 4: Import `ResponsivePanelComponent` into `CalendarViewComponent`**

Edit `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts`:

```ts
// add to the top imports:
import { ResponsivePanelComponent } from '@car-rental/ui';

// update the @Component decorator's imports array:
@Component({
  selector: 'app-calendar-view',
  imports: [MatButtonModule, ResponsivePanelComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
})
```

- [ ] **Step 5: Restructure the template**

Replace `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.html` entirely:

```html
<div class="calendar-view">
  <div class="calendar-view__toolbar flex items-center gap-2 mb-2">
    <button mat-button (click)="shiftMonth(-1)">{{ t.dispatch.prevMonth }}</button>
    <span class="font-bold">{{ monthLabel() }}</span>
    <button mat-button (click)="shiftMonth(1)">{{ t.dispatch.nextMonth }}</button>
  </div>

  <div class="calendar-view__layout">
    <div class="calendar-view__grid">
      @for (d of monthDays(); track d.getTime()) {
        <button
          class="calendar-view__day p-2 min-h-16 text-left cursor-pointer transition-colors hover:[background:var(--mat-sys-surface-container-high)]"
          [class.opacity-40]="d.getMonth() !== month().getMonth()"
          [class.calendar-view__day--selected]="selected() && isSameDay(d, selected()!)"
          (click)="selectDate(d)"
        >
          <div
            class="font-bold"
            [class.calendar-view__day-number--today]="isSameDay(d, todayDate)"
          >
            {{ d.getDate() }}
          </div>
          <div class="calendar-view__muted">
            {{ t.dispatch.pickups }}{{ statsOf(d).pickups }} {{ t.dispatch.returns
            }}{{ statsOf(d).returns }}
          </div>
          <div class="calendar-view__muted">{{ t.dispatch.available }} {{ statsOf(d).available }}</div>
        </button>
      }
    </div>

    <lib-responsive-panel
      [open]="panelOpen()"
      [heading]="panelHeading()"
      [closeLabel]="t.common.closePanel"
      (closed)="dismissPanel()"
    >
      @if (selected(); as sel) {
        @if (dayBookings(sel).length === 0) {
          <p class="text-sm calendar-view__muted">{{ t.common.empty }}</p>
        } @else {
          <ul class="text-sm flex flex-col gap-1">
            @for (b of dayBookings(sel); track b.id) {
              <li class="ui-card !p-3">
                {{ plateOf(b.vehicleId) }}｜{{ customerStore.nameOf(b.customerId) }}｜
                {{ fmt(b.startTime) }} → {{ fmt(b.endTime) }}｜{{ t.booking.statusLabels[b.status] }}
              </li>
            }
          </ul>
        }
      }
    </lib-responsive-panel>
  </div>
</div>
```

- [ ] **Step 6: Add the flex layout wrapper styles**

Edit `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.scss`:

```scss
.calendar-view__layout {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.calendar-view__grid {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border-radius: 0.5rem;
  background: var(--mat-sys-outline-variant);
}
```

(This replaces the existing `.calendar-view__grid` rule with one that adds `flex: 1 1 auto; min-width: 0;` on top of its unchanged existing declarations, and adds the new `.calendar-view__layout` rule above it. All other rules in the file — `.calendar-view__day`, `.calendar-view__day--selected`, `.calendar-view__day-number--today`, `.calendar-view__muted` — stay exactly as they are.)

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx nx run admin:test --include="apps/admin/src/app/features/dispatch/calendar-view.spec.ts"`
Expected: PASS (14 tests total in this file).

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.html apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.scss apps/admin/src/app/core/i18n/zh-tw.ts apps/admin/src/app/features/dispatch/calendar-view.spec.ts
git commit -m "feat(admin): wire ResponsivePanelComponent into calendar day detail"
```

---

### Task 6: Full verification

**Files:**
- Modify: none

- [ ] **Step 1: Run the full `ui` suite**

Run: `npx nx run ui:test`
Expected: PASS, no regressions.

- [ ] **Step 2: Run the full `admin` suite**

Run: `npx nx run admin:test`
Expected: PASS, no regressions (baseline before this plan was 25 files / 121 tests passing; expect that count plus this plan's new tests, all passing).

- [ ] **Step 3: Build admin**

Run: `npx nx build admin`
Expected: succeeds with no errors.

- [ ] **Step 4: Theme lint**

Run: `npm run lint:theme`
Expected: `lint:theme 通過：無寫死色。`

- [ ] **Step 5: Inspect the final diff and status**

Run: `git status --short`
Expected: clean except for any pre-existing unrelated changes that were already present before this plan started (e.g. other in-progress work visible in the initial `git status`) — no unexpected leftover modifications from this plan's tasks, since each task already committed its own changes.

- [ ] **Step 6: Manual browser check**

Start the admin app (`npx nx serve admin`), open the dispatch calendar view, and confirm at three widths:
- **≥1024px**: clicking a day shows the panel as a right-side flexible-width column; the calendar grid narrows to make room; closing it via the ✕ button collapses the panel back to full grid width, leaving the clicked day still highlighted.
- **640–1024px** and **<640px**: clicking a day shows the panel sliding up from the bottom with a backdrop, capped at roughly 70% viewport height with internal scrolling if the list is long; Esc and backdrop-tap both close it; the day stays highlighted after closing; clicking the same day again reopens it.
