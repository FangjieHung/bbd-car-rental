# 雙軸主題系統 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **搭配閱讀**：本計畫的設計依據是 `docs/superpowers/specs/2026-07-15-theme-pack-architecture-design.md`（下稱 spec）。CSS token 對照表在 spec §4/§11/§12，狀態→tone 在 §5，class 契約在 §3。計畫引用這些表格，不重複整貼。

**Goal:** 把現有單一 Verdant 樣式，重構成「範式 × 配色」雙軸主題系統，並以 Midnight 配色證明配色軸可即時切換。

**Architecture:** 兩個正交維度——範式包（paradigm，管造型 recipe＋圓角/陰影/字體）與配色包（color-theme，只管顏色 token）；最外層 `data-paradigm` + `data-theme` 兩屬性獨立切換。元件綁 Material 3 sys token（`--mat-sys-*`）與 `--app-*` 擴充，透過固定 `ui-` class 契約（CSS Zen Garden 模型）。本計畫範式軸只做 Material，配色軸做 Verdant＋Midnight，Glass/Neumo 插槽預留。

**Tech Stack:** Angular 22（zoneless、signal）、Angular Material 22（M3）、Tailwind v4、SCSS、Vitest。

## Global Constraints

- **只改樣式，不改功能行為**：任何 task 不得更動元件的資料流、store、路由、業務邏輯。
- **Token 詞彙 = M3 sys token**：顏色/字體/圓角/陰影一律綁 `--mat-sys-*`（或 `--app-*` 擴充）；顏色值只准出現在 `src/styles/color-themes/**`，造型值只准出現在 `src/styles/paradigms/*/_tokens.scss`。
- **間距用 Tailwind**（`p-4`/`gap-3`），不進 CSS 變數。
- **class 命名**：元件 `ui-` 前綴 + BEM（`ui-card__header--compact`）；暫時狀態 `is-`；名字描述角色不描述長相。
- **不寫死色**：`themes`/`_tokens.scss` 允許區以外不得出現十六進位色碼或底層色階變數。
- **Node 24**（`.nvmrc`）；測試 = `npm test`（vitest）；建置 = `npm run build`。
- **既有 45 個測試必須保持全綠**；新程式碼走 TDD。
- **commit 訊息結尾**照 repo 慣例加 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。

---

## 任務依賴圖

- Task 1（status-tone）、Task 2（ThemeService）、Task 3（lint 腳本）互相獨立，可任意順序。
- Task 4 → Task 5 → Task 6：CSS 重構序列，必須依序（每步 build 綠）。
- Task 7（status-chip）依賴 Task 1、Task 6。
- Task 8（換膚器）依賴 Task 2。
- Task 9（Midnight）依賴 Task 4、Task 6。
- Task 10（README）最後。

---

### Task 1: 狀態 tone 單一真相源

**Files:**
- Create: `src/app/core/theme/status-tone.ts`
- Test: `src/app/core/theme/status-tone.spec.ts`

**Interfaces:**
- Produces: `STATUS_TONE`（`Record<StatusKey, Tone>` const）、`type StatusKey`、`type Tone`（`'positive'|'info'|'neutral'|'warning'|'danger'`）、`toneOf(key: StatusKey): Tone`。

- [ ] **Step 1: 寫失敗測試**

```ts
// src/app/core/theme/status-tone.spec.ts
import { describe, it, expect } from 'vitest';
import { STATUS_TONE, toneOf, type Tone } from './status-tone';

const VALID_TONES: Tone[] = ['positive', 'info', 'neutral', 'warning', 'danger'];

describe('status-tone', () => {
  it('每個狀態都對到合法 tone', () => {
    for (const tone of Object.values(STATUS_TONE)) {
      expect(VALID_TONES).toContain(tone);
    }
  });

  it('toneOf 依 spec §5 對應', () => {
    expect(toneOf('approved')).toBe('positive');
    expect(toneOf('processing')).toBe('info');
    expect(toneOf('archived')).toBe('neutral');
    expect(toneOf('warning')).toBe('warning');
    expect(toneOf('cancelled')).toBe('danger');
  });

  it('涵蓋 spec §5 全部狀態 key', () => {
    expect(Object.keys(STATUS_TONE)).toHaveLength(21);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test -- status-tone`
Expected: FAIL（找不到 `./status-tone`）

- [ ] **Step 3: 實作**

```ts
// src/app/core/theme/status-tone.ts
export const STATUS_TONE = {
  success: 'positive', approved: 'positive', completed: 'positive', active: 'positive', online: 'positive',
  info: 'info', processing: 'info', loading: 'info', queued: 'info', pending: 'info',
  draft: 'neutral', inactive: 'neutral', archived: 'neutral', offline: 'neutral', empty: 'neutral', noResult: 'neutral',
  warning: 'warning',
  error: 'danger', critical: 'danger', rejected: 'danger', cancelled: 'danger',
} as const;

export type StatusKey = keyof typeof STATUS_TONE;
export type Tone = (typeof STATUS_TONE)[StatusKey];

export function toneOf(key: StatusKey): Tone {
  return STATUS_TONE[key];
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test -- status-tone`
Expected: PASS（3 個測試）

- [ ] **Step 5: Commit**

```bash
git add src/app/core/theme/status-tone.ts src/app/core/theme/status-tone.spec.ts
git commit -m "feat: 狀態 tone 單一真相源（StatusKey→Tone）"
```

---

### Task 2: ThemeService（雙軸切換 + 記憶）

**Files:**
- Create: `src/app/core/theme/theme.token.ts`
- Create: `src/app/core/theme/theme.service.ts`
- Test: `src/app/core/theme/theme.service.spec.ts`

**Interfaces:**
- Produces:
  - `theme.token.ts`：`interface ThemeOption { id: string; label: string }`；`PARADIGMS: ThemeOption[]`；`COLOR_THEMES: ThemeOption[]`；`DEFAULT_PARADIGM='material'`；`DEFAULT_THEME='verdant'`；`PARADIGM_KEY='cr.paradigm'`；`THEME_KEY='cr.theme'`。
  - `ThemeService`：`paradigm: Signal<string>`、`theme: Signal<string>`、`setParadigm(id)`、`setTheme(id)`、`init()`。均寫 `document.documentElement.dataset` 與 `localStorage`。

- [ ] **Step 1: 寫失敗測試**

```ts
// src/app/core/theme/theme.service.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { DEFAULT_THEME } from './theme.token';

describe('ThemeService', () => {
  let svc: ThemeService;
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-paradigm');
    TestBed.configureTestingModule({});
    svc = TestBed.inject(ThemeService);
  });

  it('setTheme 同時改 signal、dataset、localStorage', () => {
    svc.setTheme('midnight');
    expect(svc.theme()).toBe('midnight');
    expect(document.documentElement.dataset.theme).toBe('midnight');
    expect(localStorage.getItem('cr.theme')).toBe('midnight');
  });

  it('setParadigm 同時改 signal、dataset、localStorage', () => {
    svc.setParadigm('material');
    expect(svc.paradigm()).toBe('material');
    expect(document.documentElement.dataset.paradigm).toBe('material');
    expect(localStorage.getItem('cr.paradigm')).toBe('material');
  });

  it('init 從 localStorage 還原；無值用預設', () => {
    localStorage.setItem('cr.theme', 'midnight');
    svc.init();
    expect(svc.theme()).toBe('midnight');
    expect(svc.paradigm()).toBe('material'); // 無值 → 預設
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test -- theme.service`
Expected: FAIL（找不到模組）

- [ ] **Step 3: 實作 theme.token.ts**

```ts
// src/app/core/theme/theme.token.ts
export interface ThemeOption { id: string; label: string; }
export const PARADIGMS: ThemeOption[] = [{ id: 'material', label: 'Material' }];
export const COLOR_THEMES: ThemeOption[] = [
  { id: 'verdant', label: 'Verdant 綠' },
  { id: 'midnight', label: 'Midnight 深' },
];
export const DEFAULT_PARADIGM = 'material';
export const DEFAULT_THEME = 'verdant';
export const PARADIGM_KEY = 'cr.paradigm';
export const THEME_KEY = 'cr.theme';
```

- [ ] **Step 4: 實作 theme.service.ts**

```ts
// src/app/core/theme/theme.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  DEFAULT_PARADIGM, DEFAULT_THEME, PARADIGM_KEY, THEME_KEY,
} from './theme.token';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);
  readonly paradigm = signal(DEFAULT_PARADIGM);
  readonly theme = signal(DEFAULT_THEME);

  init(): void {
    this.setParadigm(localStorage.getItem(PARADIGM_KEY) ?? DEFAULT_PARADIGM);
    this.setTheme(localStorage.getItem(THEME_KEY) ?? DEFAULT_THEME);
  }

  setParadigm(id: string): void {
    this.paradigm.set(id);
    this.doc.documentElement.dataset.paradigm = id;
    localStorage.setItem(PARADIGM_KEY, id);
  }

  setTheme(id: string): void {
    this.theme.set(id);
    this.doc.documentElement.dataset.theme = id;
    localStorage.setItem(THEME_KEY, id);
  }
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npm test -- theme.service`
Expected: PASS（3 個測試）

- [ ] **Step 6: Commit**

```bash
git add src/app/core/theme/theme.token.ts src/app/core/theme/theme.service.ts src/app/core/theme/theme.service.spec.ts
git commit -m "feat: ThemeService 雙軸切換與 localStorage 記憶"
```

---

### Task 3: lint:theme 防漏腳本

**Files:**
- Create: `scripts/lint-theme.mjs`
- Create: `scripts/lint-theme.spec.mjs`
- Modify: `package.json`（scripts 加一行）

**Interfaces:**
- Produces: `node scripts/lint-theme.mjs [rootDir...]`。掃 `.ts/.scss/.html`，排除 `color-themes/` 與 `*/_tokens.scss`；命中十六進位色碼或底層色階變數（`--_?(primary|accent|neutral|sage|teal|cream)-\d`）時印 `file:line`、exit 1；乾淨 exit 0。預設 root = `src/app`、`src/styles`。

- [ ] **Step 1: 寫失敗測試**

```js
// scripts/lint-theme.spec.mjs
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function run(dir) {
  try {
    execFileSync('node', ['scripts/lint-theme.mjs', dir], { encoding: 'utf8' });
    return { code: 0, out: '' };
  } catch (e) {
    return { code: e.status, out: e.stdout?.toString() ?? '' };
  }
}

describe('lint-theme', () => {
  it('掃到寫死色 → exit 1 並列出檔案', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    writeFileSync(join(dir, 'bad.scss'), '.x { color: #ff0000; }');
    const r = run(dir);
    expect(r.code).toBe(1);
    expect(r.out).toContain('bad.scss');
  });

  it('乾淨（只用 token）→ exit 0', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    writeFileSync(join(dir, 'ok.scss'), '.x { color: var(--mat-sys-primary); }');
    expect(run(dir).code).toBe(0);
  });

  it('_tokens.scss 允許寫死色 → exit 0', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    mkdirSync(join(dir, 'material'), { recursive: true });
    writeFileSync(join(dir, 'material', '_tokens.scss'), '--x: #ff0000;');
    expect(run(dir).code).toBe(0);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test -- lint-theme`
Expected: FAIL（找不到 `scripts/lint-theme.mjs`）

- [ ] **Step 3: 實作腳本**

```js
// scripts/lint-theme.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const roots = process.argv.slice(2);
const scanRoots = roots.length ? roots : ['src/app', 'src/styles'];

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const PALETTE = /var\(\s*--_?(primary|accent|neutral|sage|teal|cream)-\d/;
const EXTS = ['.ts', '.scss', '.html'];

function isAllowed(path) {
  return path.includes('/color-themes/') || basename(path) === '_tokens.scss';
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXTS.some(e => p.endsWith(e))) out.push(p);
  }
}

const files = [];
for (const r of scanRoots) {
  try { walk(r, files); } catch { /* root 不存在略過 */ }
}

const violations = [];
for (const f of files) {
  if (isAllowed(f)) continue;
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (HEX.test(line) || PALETTE.test(line)) violations.push(`${f}:${i + 1}: ${line.trim()}`);
  });
}

if (violations.length) {
  console.log('lint:theme 發現寫死色/底層色（請改綁 --mat-sys-* 或 --app-*）：');
  for (const v of violations) console.log('  ' + v);
  process.exit(1);
}
console.log('lint:theme 通過：無寫死色。');
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test -- lint-theme`
Expected: PASS（3 個測試）

- [ ] **Step 5: package.json 加 script**

在 `package.json` 的 `"scripts"` 區塊，`"test": "ng test"` 之後加一行：

```json
    "test": "ng test",
    "lint:theme": "node scripts/lint-theme.mjs"
```

- [ ] **Step 6: Commit**

```bash
git add scripts/lint-theme.mjs scripts/lint-theme.spec.mjs package.json
git commit -m "feat: lint:theme 防漏腳本（禁寫死色/底層色）"
```

> 註：此時對真實 `src/` 跑 `npm run lint:theme` 仍會 fail（尚有寫死色），Task 6 完成後才要求全綠。

---

### Task 4: 建立雙軸 token 檔（外觀不變、純加法）

**Files:**
- Create: `src/styles/color-themes/verdant/_tokens.scss`
- Create: `src/styles/paradigms/material/_tokens.scss`
- Create: `src/styles/color-themes/_registry.scss`
- Create: `src/styles/paradigms/_registry.scss`
- Modify: `src/styles.scss`（改為 `@use` 新檔；**暫時保留**舊 `:root` 自創語意層當橋）
- Modify: `src/index.html`（`<html>` 加預設兩屬性）

**做法說明**：把 `styles.scss` 現有 `:root`（行 9–105）的顏色搬進 verdant 顏色包、造型搬進 material 造型包，並把 M3 覆寫（行 165–186）搬進對應包。**值完全照搬、不改**，所以 Verdant 外觀不變。舊 `:root` 自創語意名（`--surface-*`/`--text-*`/`--radius-*`/`--shadow-*`/`--viz-*`/`--status-*`）此步**先保留**，Task 5 才移除。

- [ ] **Step 1: 建 verdant 顏色包**

```scss
// src/styles/color-themes/verdant/_tokens.scss
// 只放顏色。值照搬自原 styles.scss。
:root[data-theme='verdant'] {
  // 主題私有底層色階（僅本檔使用，供下方 M3 token 引用）
  --_sage-100: #e0efe1; --_sage-500: #5fa06a; --_sage-600: #4a8656; --_sage-700: #3b6b45; --_sage-800: #305537;
  --_teal-100: #d7e3e8; --_teal-600: #294c5a; --_teal-700: #1f3a48; --_teal-800: #172c37;
  --_cream-0: #ffffff; --_cream-25: #fcfbf8; --_cream-50: #f7f5f0; --_cream-100: #efece4;
  --_cream-200: #e3dfd4; --_cream-300: #d0cbbd; --_cream-500: #8b8574; --_cream-600: #6d685a; --_cream-900: #232220;

  // M3 顏色 token（對應原 styles.scss 行 165–186）
  --mat-sys-primary: var(--_sage-600);
  --mat-sys-on-primary: #ffffff;
  --mat-sys-primary-container: var(--_sage-100);
  --mat-sys-on-primary-container: var(--_sage-800);
  --mat-sys-secondary: var(--_teal-600);
  --mat-sys-on-secondary: #ffffff;
  --mat-sys-secondary-container: var(--_teal-100);
  --mat-sys-on-secondary-container: var(--_teal-800);
  --mat-sys-background: var(--_cream-50);
  --mat-sys-surface: var(--_cream-0);
  --mat-sys-surface-container-lowest: var(--_cream-0);
  --mat-sys-surface-container-low: var(--_cream-25);
  --mat-sys-surface-container: var(--_cream-25);
  --mat-sys-surface-container-high: var(--_cream-50);
  --mat-sys-surface-container-highest: var(--_cream-100);
  --mat-sys-on-surface: var(--_cream-900);
  --mat-sys-on-surface-variant: var(--_cream-600);
  --mat-sys-outline: var(--_cream-300);
  --mat-sys-outline-variant: var(--_cream-200);
  --mat-sys-inverse-surface: var(--_teal-700);
  --mat-sys-inverse-on-surface: #ffffff;
  --mat-sys-error: #a13f34;
  --mat-sys-on-error: #ffffff;
  --mat-sys-error-container: #fbe8e6;
  --mat-sys-on-error-container: #a13f34;

  // app 擴充狀態色（M3 缺 success/warning/info；danger 沿用 error）
  --app-positive-bg: var(--_sage-100); --app-positive-fg: var(--_sage-700); --app-positive-dot: var(--_sage-500);
  --app-info-bg: var(--_teal-100); --app-info-fg: var(--_teal-700); --app-info-dot: var(--_teal-600);
  --app-neutral-bg: var(--_cream-100); --app-neutral-fg: var(--_cream-600); --app-neutral-dot: var(--_cream-500);
  --app-warning-bg: #fbf1dd; --app-warning-fg: #8a6416; --app-warning-dot: #e0a530;
  --app-danger-bg: #fbe8e6; --app-danger-fg: #a13f34; --app-danger-dot: #e2584a;

  // 時間軸圖表色
  --app-viz-1: var(--_teal-700); --app-viz-2: var(--_teal-600); --app-viz-3: var(--_teal-100); --app-viz-4: var(--_cream-300);
}
```

- [ ] **Step 2: 建 material 造型包**

```scss
// src/styles/paradigms/material/_tokens.scss
// 只放造型：圓角、陰影、字體。值照搬自原 styles.scss 行 87–104。
:root[data-paradigm='material'] {
  --mat-sys-corner-small: 10px;      // 原 --radius-sm
  --mat-sys-corner-medium: 16px;     // 原 --radius-md
  --mat-sys-corner-large: 22px;      // 原 --radius-lg
  --mat-sys-corner-extra-large: 28px;// 原 --radius-xl
  --mat-sys-corner-full: 999px;      // 原 --radius-pill
  --mat-sys-level1: 0 1px 2px rgba(35, 34, 32, 0.04);
  --mat-sys-level2: 0 2px 8px rgba(35, 34, 32, 0.05);
  --mat-sys-level3: 0 8px 24px rgba(35, 34, 32, 0.07);
  --mat-sys-level4: 0 16px 40px rgba(35, 34, 32, 0.10);

  // 字體：中英分軌（spec §6）。中文固定、英文依範式。
  --font-zh: 'Noto Sans TC', system-ui, sans-serif;
  --font-en: 'Plus Jakarta Sans', 'Inter';
  --font-display: var(--font-en), var(--font-zh);
  --font-body: 'Inter', var(--font-zh);
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
}
```

- [ ] **Step 3: 建兩個 registry（@forward 各包）**

```scss
// src/styles/color-themes/_registry.scss
@forward 'verdant/tokens';
```
```scss
// src/styles/paradigms/_registry.scss
@forward 'material/tokens';
```

- [ ] **Step 4: 改 styles.scss 入口（保留舊 :root 當橋）**

在 `styles.scss` 頂部 `@use '@angular/material' as mat;` 之後加：

```scss
@use 'styles/paradigms/registry';
@use 'styles/color-themes/registry';
```

（本步**不刪**舊 `:root`／`@theme`／M3 覆寫；新舊並存、值相同，外觀不變。）

- [ ] **Step 5: index.html 設預設屬性**

把 `src/index.html` 的 `<html ...>` 改為含預設兩軸屬性：

```html
<html lang="zh-Hant" data-paradigm="material" data-theme="verdant">
```

- [ ] **Step 6: 驗證 build 綠、外觀不變**

```bash
npm run build
```
Expected: exit 0。啟動 `npm start -- --port 4300`，瀏覽器開 `/vehicles`、`/bookings`、`/dashboard`，畫面與改動前**完全一致**（截圖對照）。

- [ ] **Step 7: Commit**

```bash
git add src/styles/ src/styles.scss src/index.html
git commit -m "feat: 建立雙軸 token 檔（verdant 顏色包 + material 造型包），外觀不變"
```

---

### Task 5: 元件改綁 M3 token、移除自創語意層、修寫死色

**Files:**
- Modify: `src/styles.scss`（刪舊 `:root` 自創語意層 行 9–105 中的語意名區塊、刪 `@theme` 行 107–143、刪 M3 覆寫 行 165–186；保留 `mat.theme()`、`body`、recipe 區）
- Modify: `src/app/app.scss`、`src/app/features/dispatch/timeline-view.component.ts`、`src/app/features/dispatch/calendar-view.component.ts`、`src/app/features/dashboard/dashboard-page.component.scss`、`src/app/shared/status-chip.component.ts`，以及所有引用 `--surface-*`/`--text-*`/`--radius-*`/`--shadow-*`/`--viz-*`/`--status-*` 的 component scss

**做法說明**：依 spec §4 對照表做全域替換，依 spec §11 修寫死色清單。替換對照（節錄，完整見 spec §4）：

| 舊自創名 | 改綁 |
|---|---|
| `--surface-app` | `--mat-sys-background` |
| `--surface-card` | `--mat-sys-surface` |
| `--surface-card-alt` | `--mat-sys-surface-container-low` |
| `--surface-sunken` | `--mat-sys-surface-container` |
| `--surface-inverse` | `--mat-sys-inverse-surface` |
| `--surface-brand` | `--mat-sys-primary` |
| `--surface-pill` | `--mat-sys-surface-container-high` |
| `--text-primary` | `--mat-sys-on-surface` |
| `--text-secondary` / `--text-tertiary` | `--mat-sys-on-surface-variant` |
| `--text-on-brand` | `--mat-sys-on-primary` |
| `--text-on-inverse(-muted)` | `--mat-sys-inverse-on-surface` |
| `--border-subtle` / `--border-default` | `--mat-sys-outline-variant` / `--mat-sys-outline` |
| `--radius-sm/md/lg/xl/pill` | `--mat-sys-corner-small/medium/large/extra-large/full` |
| `--shadow-xs/sm/md/lg` | `--mat-sys-level1/2/3/4` |
| `--font-display/body/mono` | 同名 token（已由 material 包定義） |
| `--status-success/info/warning-*` | `--app-positive/info/warning-*` |
| `--status-error-*` | `--app-danger-*` |
| `--viz-1..4` | `--app-viz-1..4` |
| `--sage-*/teal-*/cream-*`（§11 寫死點） | 依用途對到上表 M3 token |
| `#fff`/`#ffffff`（app.scss/timeline） | `--mat-sys-on-primary` 或 `--mat-sys-inverse-on-surface`（依用途） |

- [ ] **Step 1: 全域替換自創語意名（component scss + app.scss + inline ts）**

用編輯器對每個檔案做上表替換。逐檔改完後不要漏 `styles.scss` 內 recipe 區（`.v-card` 等仍在此檔，也要替換其 `var(--…)`）。

- [ ] **Step 2: 修 spec §11 寫死點**
  - `app.scss`：`--cream-25/50`→`--mat-sys-surface-container-low/high`；`--sage-*`→`--mat-sys-primary`；`--teal-*`→`--mat-sys-inverse-surface`/`--mat-sys-on-primary`；`#fff`→`--mat-sys-on-primary`。
  - `timeline-view.component.ts`：inline `--teal-500/--sage-500/--cream-300`→`--app-viz-2/--mat-sys-primary/--app-viz-4`；`#fff`→`--mat-sys-on-primary`。
  - `calendar-view.component.ts`：`--sage-100`→`--app-positive-bg`；`--sage-600`→`--mat-sys-primary`。
  - `dashboard-page.component.scss`：`--teal-700`→`--mat-sys-inverse-surface`。
  - `status-chip.component.ts`：`--cream-400`→`--mat-sys-outline`。

- [ ] **Step 3: 刪 styles.scss 舊 :root 自創語意層、@theme、M3 覆寫**

刪除 `styles.scss` 行 9–105（整個舊 `:root`）、行 107–143（`@theme`）、行 165–186（`html{}` 內的 M3 覆寫，但**保留** `@include mat.theme(...)` 與 `height`）。`body` 的 `--surface-app`/`--text-primary`/`--font-body` 改綁 `--mat-sys-background`/`--mat-sys-on-surface`/`--font-body`。

- [ ] **Step 4: 驗證**

```bash
npm run build && npm test
grep -rn "var(--surface-\|var(--text-primary\|var(--radius-\|var(--shadow-\|var(--status-\|var(--viz-" src/app src/styles.scss
```
Expected: build exit 0；45 測試綠；grep **無輸出**（自創名已清）。啟動 dev server，三頁目視與改動前一致。

- [ ] **Step 5: Commit**

```bash
git add src/styles.scss src/app
git commit -m "refactor: 元件改綁 M3 token、移除自創語意層、修寫死色（外觀不變）"
```

---

### Task 6: class rename `.v-*`→`.ui-*` + recipe 歸位到 material 範式包

**Files:**
- Create: `src/styles/paradigms/material/{card,buttons,table,status,typography}.scss`
- Create: `src/styles/_skeleton.scss`、`src/styles/_contract.scss`
- Modify: `src/styles.scss`（recipe 區移出；`@use` skeleton 與 material recipe）、`src/styles/paradigms/_registry.scss`
- Modify: 8 個含 `.v-*` 的 template/ts（見下）

**做法說明**：把 `styles.scss` recipe 區（`.v-card`/`.v-card-dark`/`.v-nav-pill`/`.v-stat-number`/`.v-page-title`/`.v-card-label` 及 Material 微調）搬到 material 範式包，並 rename 成 `ui-` 契約 class。recipe 掛在 `[data-paradigm='material']` 作用域下，未來換範式才能整包替換。

Class rename 對照：

| 舊 | 新 |
|---|---|
| `.v-card` | `.ui-card` |
| `.v-card-dark` | `.ui-card--inverse` |
| `.v-nav-pill` | `.ui-nav-pill`（`.active`→`.is-active`） |
| `.v-stat-number` | `.ui-text-display` |
| `.v-page-title` | `.ui-text-title` |
| `.v-card-label` | `.ui-text-caption` |

- [ ] **Step 1: 建 material recipe 檔（card/typography 範例，其餘同法）**

```scss
// src/styles/paradigms/material/card.scss
[data-paradigm='material'] {
  .ui-card {
    background: var(--mat-sys-surface);
    color: var(--mat-sys-on-surface);
    border: 1px solid var(--mat-sys-outline-variant);
    border-radius: var(--mat-sys-corner-large);
    box-shadow: var(--mat-sys-level1);
    padding: 1.5rem; // 24px → Tailwind 尺標對齊，可改 class p-6
  }
  .ui-card--inverse {
    background: var(--mat-sys-inverse-surface);
    color: var(--mat-sys-inverse-on-surface);
    border: none;
    border-radius: var(--mat-sys-corner-large);
    padding: 1.5rem;
  }
  .ui-card--clickable { cursor: pointer; }
}
```
```scss
// src/styles/paradigms/material/typography.scss
[data-paradigm='material'] {
  .ui-text-display { font-family: var(--font-display); font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
  .ui-text-title { font-family: var(--font-display); font-weight: 800; font-size: 26px; letter-spacing: -0.02em; color: var(--mat-sys-on-surface); }
  .ui-text-caption { font-size: 13px; color: var(--mat-sys-on-surface-variant); }
}
```

`buttons.scss`（`.ui-nav-pill` + 未來 `.ui-btn`）、`status.scss`（`.ui-chip` + tone，見 Task 7）、`table.scss`（Material 表格微調 `.mat-mdc-table` + 未來 `.ui-table`）比照，把原 styles.scss 對應 recipe 搬入並綁 M3 token。原 Material 微調（`.mat-mdc-dialog-surface` 等）放 `table.scss` 或新 `material/overrides.scss`。

- [ ] **Step 2: 建 _skeleton.scss（只留主題無關）**

```scss
// src/styles/_skeleton.scss
// 主題無關：全域 reset 與 body 基礎。視覺造型交給範式包。
body {
  color-scheme: light;
  background: var(--mat-sys-background);
  color: var(--mat-sys-on-surface);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
  min-height: 100%;
}
```

- [ ] **Step 3: 建 _contract.scss（文件性質，列契約）**

內容：把 spec §3 的 class 契約表與「用到的 M3 token + --app-* 清單」以 SCSS 註解形式落檔，供開發者查閱（純註解、不產生樣式）。

- [ ] **Step 4: 改 styles.scss 收尾**

`styles.scss` 移除 recipe 區（行 200–283）與 `body`（行 189–198），改為：

```scss
@use 'tailwindcss';
@use '@angular/material' as mat;
@use 'styles/paradigms/registry';
@use 'styles/color-themes/registry';
@use 'styles/skeleton';
@use 'styles/paradigms/material/card';
@use 'styles/paradigms/material/buttons';
@use 'styles/paradigms/material/table';
@use 'styles/paradigms/material/status';
@use 'styles/paradigms/material/typography';

html { height: 100%; @include mat.theme((color: (primary: mat.$green-palette, tertiary: mat.$cyan-palette), typography: (plain-family: 'Inter', brand-family: '"Plus Jakarta Sans"'), density: 0)); }
```

- [ ] **Step 5: rename class（8 檔 template/ts）**

對下列檔案做上表 class 替換（`.v-*`→`.ui-*`、`.active`→`.is-active`）：
`app.html`、`features/dashboard/dashboard-page.component.html`、`features/vehicles/vehicles-page.component.html`、`features/bookings/{bookings,customers}-page.component.html`、`features/dispatch/{dispatch-page.component.html,timeline-view.component.ts,calendar-view.component.ts}`、`features/maintenance/maintenance-page.component.html`。

- [ ] **Step 6: 驗證**

```bash
npm run build && npm test
grep -rn "v-card\|v-nav-pill\|v-page-title\|v-stat-number\|v-card-label" src/app
npm run lint:theme
```
Expected: build exit 0；45 測試綠；第一個 grep **無輸出**（無舊 class）；`lint:theme` **通過**（src 全綠）。三頁目視不變。

- [ ] **Step 7: Commit**

```bash
git add src/styles src/styles.scss src/app
git commit -m "refactor: class 改 ui- 契約、recipe 歸位 material 範式包；lint:theme 全綠"
```

---

### Task 7: status-chip 改吃 StatusKey

**Files:**
- Modify: `src/app/shared/status-chip.component.ts`、`src/app/shared/status-chip.component.html`
- Create: `src/styles/paradigms/material/status.scss` 的 `.ui-chip` tone 樣式（若 Task 6 未建完則在此補）
- Modify: 呼叫端 `vehicles-page.component.ts`、`bookings-page.component.ts`（把 domain status 對到 `StatusKey`）
- Test: `src/app/shared/status-chip.component.spec.ts`

**Interfaces:**
- Consumes: `toneOf`、`StatusKey`（Task 1）。
- Produces: `<app-status-chip [status]="statusKey" [label]="text" />`，內部套 `.ui-chip.ui-chip--{tone}`。

- [ ] **Step 1: 寫失敗測試**

```ts
// src/app/shared/status-chip.component.spec.ts
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StatusChipComponent } from './status-chip.component';

describe('StatusChipComponent', () => {
  it('依 StatusKey 套對應 tone class', () => {
    const f = TestBed.createComponent(StatusChipComponent);
    f.componentRef.setInput('status', 'approved');
    f.componentRef.setInput('label', '已核准');
    f.detectChanges();
    const chip = f.nativeElement.querySelector('.ui-chip');
    expect(chip.classList).toContain('ui-chip--positive');
    expect(chip.textContent).toContain('已核准');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test -- status-chip`
Expected: FAIL

- [ ] **Step 3: 改元件**

```ts
// status-chip.component.ts
import { Component, computed, input } from '@angular/core';
import { StatusKey, toneOf } from '../core/theme/status-tone';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss'],
})
export class StatusChipComponent {
  readonly status = input.required<StatusKey>();
  readonly label = input.required<string>();
  readonly tone = computed(() => toneOf(this.status()));
}
```
```html
<!-- status-chip.component.html -->
<span class="ui-chip" [class]="'ui-chip--' + tone()">
  <span class="ui-chip__dot"></span>{{ label() }}
</span>
```

- [ ] **Step 4: 建 tone 樣式（material/status.scss）**

```scss
[data-paradigm='material'] {
  .ui-chip { display: inline-flex; align-items: center; gap: .375rem; padding: .125rem .625rem; border-radius: var(--mat-sys-corner-full); font-size: 13px; }
  .ui-chip__dot { width: .5rem; height: .5rem; border-radius: 999px; }
  .ui-chip--positive { background: var(--app-positive-bg); color: var(--app-positive-fg); .ui-chip__dot { background: var(--app-positive-dot); } }
  .ui-chip--info { background: var(--app-info-bg); color: var(--app-info-fg); .ui-chip__dot { background: var(--app-info-dot); } }
  .ui-chip--neutral { background: var(--app-neutral-bg); color: var(--app-neutral-fg); .ui-chip__dot { background: var(--app-neutral-dot); } }
  .ui-chip--warning { background: var(--app-warning-bg); color: var(--app-warning-fg); .ui-chip__dot { background: var(--app-warning-dot); } }
  .ui-chip--danger { background: var(--app-danger-bg); color: var(--app-danger-fg); .ui-chip__dot { background: var(--app-danger-dot); } }
}
```

- [ ] **Step 5: 改呼叫端對應**

`vehicles-page.component.ts`：把 `STATUS_TONE`（原 vehicle→ChipTone）改成 vehicle status → `StatusKey`，例：`available→'active'`、`rented→'processing'`、`maintenance→'warning'`、`reserved→'pending'`。template 傳 `[status]="keyOf(v)"`。`bookings-page.component.ts` 同法：`confirmed→'pending'`、`in_progress→'processing'`、`completed→'completed'`、`cancelled→'cancelled'`。（實際對應以 UI 語意為準，實作時確認顏色合理。）

- [ ] **Step 6: 驗證**

```bash
npm run build && npm test && npm run lint:theme
```
Expected: build exit 0；測試綠（含新 status-chip）；lint 通過。目視 vehicles/bookings 狀態晶片顏色正確。

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/status-chip.component.* src/styles/paradigms/material/status.scss src/app/features/vehicles src/app/features/bookings
git commit -m "refactor: status-chip 改吃 StatusKey，晶片 tone 由真相源決定"
```

---

### Task 8: 雙軸換膚器 + 啟動初始化

**Files:**
- Create: `src/app/shared/theme-switcher.component.ts`（inline template）
- Modify: `src/app/app.html`（外殼登出鈕旁放換膚器）、`src/app/app.ts`（import）
- Modify: `src/app/app.config.ts`（`provideAppInitializer` 呼叫 `ThemeService.init`）
- Test: `src/app/shared/theme-switcher.component.spec.ts`

**Interfaces:**
- Consumes: `ThemeService`、`PARADIGMS`、`COLOR_THEMES`（Task 2）。

- [ ] **Step 1: 寫失敗測試**

```ts
// theme-switcher.component.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { ThemeService } from '../core/theme/theme.service';

describe('ThemeSwitcherComponent', () => {
  beforeEach(() => localStorage.clear());
  it('選配色會呼叫 ThemeService.setTheme', () => {
    const f = TestBed.createComponent(ThemeSwitcherComponent);
    const svc = TestBed.inject(ThemeService);
    f.detectChanges();
    f.componentInstance.onTheme('midnight');
    expect(svc.theme()).toBe('midnight');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test -- theme-switcher`
Expected: FAIL

- [ ] **Step 3: 實作元件**

```ts
// src/app/shared/theme-switcher.component.ts
import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../core/theme/theme.service';
import { PARADIGMS, COLOR_THEMES } from '../core/theme/theme.token';

@Component({
  selector: 'app-theme-switcher',
  imports: [MatSelectModule, FormsModule],
  template: `
    <mat-select [ngModel]="theme.paradigm()" (ngModelChange)="onParadigm($event)" aria-label="範式">
      @for (p of paradigms; track p.id) { <mat-option [value]="p.id">{{ p.label }}</mat-option> }
    </mat-select>
    <mat-select [ngModel]="theme.theme()" (ngModelChange)="onTheme($event)" aria-label="配色">
      @for (c of colorThemes; track c.id) { <mat-option [value]="c.id">{{ c.label }}</mat-option> }
    </mat-select>
  `,
})
export class ThemeSwitcherComponent {
  readonly theme = inject(ThemeService);
  readonly paradigms = PARADIGMS;
  readonly colorThemes = COLOR_THEMES;
  onParadigm(id: string) { this.theme.setParadigm(id); }
  onTheme(id: string) { this.theme.setTheme(id); }
}
```

- [ ] **Step 4: 接進外殼 + 啟動初始化**

`app.config.ts` 的 providers 陣列加：
```ts
import { provideAppInitializer, inject } from '@angular/core';
import { ThemeService } from './core/theme/theme.service';
// ...
provideAppInitializer(() => inject(ThemeService).init()),
```
`app.ts` 的 imports 加 `ThemeSwitcherComponent`；`app.html` 在登出鈕（`src/app/app.html` topbar 那顆 `登出` 按鈕）前插入 `<app-theme-switcher />`。

- [ ] **Step 5: 驗證**

```bash
npm run build && npm test
```
Expected: build exit 0；測試綠。dev server 目視：外殼有兩個下拉；切「配色」不需刷新即變（Task 9 完成後 midnight 才有實際深色差異，此步先確認機制通、無錯）。

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/theme-switcher.component.* src/app/app.html src/app/app.ts src/app/app.config.ts
git commit -m "feat: 雙軸換膚器 + 啟動時還原主題"
```

---

### Task 9: Midnight 配色包（證明配色軸可切）

**Files:**
- Create: `src/styles/color-themes/midnight/_tokens.scss`
- Modify: `src/styles/color-themes/_registry.scss`（`@forward 'midnight/tokens';`）

**做法說明**：只覆寫**顏色** token（造型沿用 material 包）。深色值依 spec §12。

- [ ] **Step 1: 建 midnight 顏色包**

```scss
// src/styles/color-themes/midnight/_tokens.scss
:root[data-theme='midnight'] {
  --_ink-900: #0e1626; --_ink-800: #16203a; --_ink-700: #1e2b4a; --_ink-600: #2a3a5f;
  --_blue-300: #7aa2ff; --_blue-400: #5b86f0; --_blue-500: #4169d6;
  --_slate-100: #e6ecf5; --_slate-300: #b3c0d6; --_slate-500: #7f8ca6;

  --mat-sys-primary: var(--_blue-400);
  --mat-sys-on-primary: #ffffff;
  --mat-sys-primary-container: var(--_ink-600);
  --mat-sys-on-primary-container: var(--_blue-300);
  --mat-sys-secondary: var(--_blue-500);
  --mat-sys-on-secondary: #ffffff;
  --mat-sys-secondary-container: var(--_ink-600);
  --mat-sys-on-secondary-container: var(--_slate-100);
  --mat-sys-background: var(--_ink-900);
  --mat-sys-surface: var(--_ink-800);
  --mat-sys-surface-container-lowest: var(--_ink-900);
  --mat-sys-surface-container-low: var(--_ink-800);
  --mat-sys-surface-container: var(--_ink-700);
  --mat-sys-surface-container-high: var(--_ink-600);
  --mat-sys-surface-container-highest: var(--_ink-600);
  --mat-sys-on-surface: var(--_slate-100);
  --mat-sys-on-surface-variant: var(--_slate-300);
  --mat-sys-outline: var(--_slate-500);
  --mat-sys-outline-variant: var(--_ink-600);
  --mat-sys-inverse-surface: var(--_slate-100);
  --mat-sys-inverse-on-surface: var(--_ink-900);
  --mat-sys-error: #ff6b5e;
  --mat-sys-on-error: #2a0a08;
  --mat-sys-error-container: #4a1512;
  --mat-sys-on-error-container: #ffb4ac;

  --app-positive-bg: #12331f; --app-positive-fg: #7fe0a0; --app-positive-dot: #4fbf7a;
  --app-info-bg: var(--_ink-600); --app-info-fg: var(--_blue-300); --app-info-dot: var(--_blue-400);
  --app-neutral-bg: var(--_ink-700); --app-neutral-fg: var(--_slate-300); --app-neutral-dot: var(--_slate-500);
  --app-warning-bg: #3d3111; --app-warning-fg: #f0c96a; --app-warning-dot: #e0a530;
  --app-danger-bg: #4a1512; --app-danger-fg: #ff9a8f; --app-danger-dot: #ff6b5e;

  --app-viz-1: var(--_blue-500); --app-viz-2: var(--_blue-400); --app-viz-3: var(--_ink-600); --app-viz-4: var(--_slate-500);

  color-scheme: dark;
}
```

- [ ] **Step 2: registry 註冊**

```scss
// src/styles/color-themes/_registry.scss
@forward 'verdant/tokens';
@forward 'midnight/tokens';
```

- [ ] **Step 3: 驗證（配色軸換膚）**

```bash
npm run build && npm run lint:theme
```
Expected: build exit 0；lint 通過（midnight 在 color-themes/ 允許區）。dev server：範式固定 Material，用換膚器切「配色」verdant↔midnight，vehicles/bookings/dashboard 三頁、桌機＋390px：**只有顏色變、版面完全不動、無 layout shift**（截圖對照）；深色下對比足夠、狀態晶片可辨。

- [ ] **Step 4: Commit**

```bash
git add src/styles/color-themes/midnight src/styles/color-themes/_registry.scss
git commit -m "feat: Midnight 配色包，證明配色軸即時換膚"
```

---

### Task 10: README 使用說明

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 補四段（依 spec §13）**

在 README 加入章節：
1. **樣式規則**：顏色/字體/圓角綁 `--mat-sys-*`／`--app-*`，間距用 Tailwind；不寫死色；存檔/CI 前 `npm run lint:theme`。
2. **新增一套配色**：複製 `src/styles/color-themes/verdant/` → 改顏色 token → `_registry.scss` 加 `@forward` → `theme.token.ts` 的 `COLOR_THEMES` 加一筆。
3. **新增一個範式**：複製 `src/styles/paradigms/material/` → 依 class 契約（spec §3）重寫 recipe（可用 `backdrop-filter` 等）→ `_registry.scss` 註冊 → `PARADIGMS` 加一筆。
4. **鎖成單一主題（初始化）**：設死 `ThemeService` 預設或 `<html>` 兩屬性；可刪換膚器與用不到的 `paradigms/*`、`color-themes/*`。

- [ ] **Step 2: 驗證 + Commit**

```bash
npm run lint:theme   # 確認全綠
git add README.md
git commit -m "docs: README 補雙軸主題使用說明與 lint:theme 規則"
```

---

## Self-Review 檢查結果

- **Spec 覆蓋**：§2 雙軸（T4/T8/T9）、§3 class 契約（T6，`_contract.scss`）、§4 對照表（T5）、§5 狀態真相源（T1/T7）、§6 typography 中英分軌（T4 `_tokens`）、§7 runtime 機制（T2/T8）、§8 鎖定（T10）、§9 lint（T3）、§10 範圍清單（全部）、§11 寫死清單（T5）、§12 Midnight（T9）、§13 README（T10）、§14 驗收（各 task 驗證步驟）。無遺漏。
- **Placeholder 掃描**：CSS token 值均給實際值；狀態對應在 T7 標「以 UI 語意為準、實作時確認顏色合理」屬正常設計判斷，非缺漏。
- **型別一致**：`StatusKey`/`Tone`/`toneOf`（T1）→ status-chip（T7）一致；`ThemeService.setParadigm/setTheme/init`（T2）→ 換膚器（T8）一致；`--mat-sys-*`/`--app-*` 命名跨 T4/T5/T7/T9 一致。
