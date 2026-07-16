# 多子專案 Monorepo Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 `nx init` 原地把 car-rental 轉成多子專案 Nx monorepo，現有後台變成 `apps/admin`，主題系統與共用資源抽成 `libs/`，並讓每個子專案可自由選配主題。

**Architecture:** 先以一個「風險退場」spike 任務實跡 `nx init`，確認現有 Angular 22 + `@angular/build` + vitest 技術棧能被 Nx 乾淨包住（build/test/serve 全過）才繼續；失敗則回滾並回報。之後依序：把 app 移到 `apps/admin`、抽 `libs/theme-pack`（含 Angular service/component 與所有主題 SCSS）、抽 `libs/assets`（圖檔 + 共用 tailwind-base SCSS + quill 內容樣式）、把 `lint:theme` 改成多 app 自動偵測、建 `booking`/`pos` 骨架殼、更新部署腳本與 README。

**Tech Stack:** Nx 23.1.0（`nx` + `@nx/angular`）、Angular 22（`@angular/build:application` builder）、Angular Material 22（M3 `mat.theme()`）、Tailwind v4（CSS `@theme`，無 tailwind.config.js）、vitest（`@angular/build:unit-test`）、Node 24。

## Global Constraints

- 不修改 `ls-angular14-apps` 專案；本計畫全部在 car-rental repo 內進行。
- 不升級 Angular / Material 版本，沿用現有 22 版。
- SCSS 跨 lib 共用一律用 build 的 `stylePreprocessorOptions.includePaths: ["libs"]` + 相對路徑（如 `@use 'theme-pack/src/lib/styles/skeleton'`）；SCSS 不使用 tsconfig path alias。
- TypeScript 跨 lib 匯入用 tsconfig path alias `@car-rental/theme-pack`（在 `tsconfig.base.json` 的 `paths` 註冊）。
- 主題選配的唯一判斷依據：某 app 的 `styles.scss` 內是否出現字串 `theme-pack`（即有無 `@use` 主題包）。沒有額外開關或清單設定檔。
- `booking`、`pos` 本計畫僅建「能 build 的最小殼」，不套用 theme-pack，不開發業務畫面。
- 每個結構性任務的完成證據是命令輸出：`nx build <app>` 成功、`nx test admin` 既有測試全過（基準 53 個）、`npm run lint:theme` exit 0。
- 每完成一個任務就 commit（frequent commits）。

## 前置：分支

在開工前建立工作分支（不在 main 上動結構）：

```bash
cd /Users/fangjiemini/bbd-projects/car-rental
git checkout -b feat/monorepo-template
```

## File Structure（目標樣貌，Task 1 spike 後以實際 nx 產出為準微調）

```
car-rental/ (Nx workspace)
  nx.json                                  ← Task 1 產生
  tsconfig.base.json                       ← Task 1 產生；Task 3/4 加 paths alias
  package.json                             ← Task 1 加 nx 依賴；Task 7 改 deploy script
  apps/
    admin/                                 ← Task 2：現有 app 搬入
      project.json
      src/
        app/                               （features/shared/stores/core，扣除 core/theme）
        styles.scss                        （@use theme-pack + tailwind-base）
        main.ts, index.html
      public/                              （或引用 libs/assets/image）
    booking/                               ← Task 6：骨架殼，不套主題
      project.json
      src/app/app.ts, src/styles.scss, src/main.ts, src/index.html
    pos/                                   ← Task 6：骨架殼，不套主題
      project.json
      src/app/app.ts, src/styles.scss, src/main.ts, src/index.html
  libs/
    theme-pack/                            ← Task 3
      src/
        index.ts                           （barrel：匯出 ThemeService、ThemeSwitcherComponent、tokens、status-tone）
        lib/
          theme/                           （theme.service.ts、theme.token.ts、status-tone.ts + specs）
          theme-switcher/                  （theme-switcher.component.ts）
          styles/
            _skeleton.scss
            CONTRACT.md
            paradigms/                     （material/*.scss、_registry.scss）
            color-themes/                  （verdant/、midnight/、_registry.scss）
    assets/
      image/                               ← Task 4：favicon.ico、logo
      style/
        tailwind-base.scss                 ← Task 4：共用 @theme token
        scss/
          quill-content-style/
            _quill-content.scss            ← Task 4：Quill 內容排版，寫死樣式
  scripts/
    lint-theme.mjs                         ← Task 5：改多 app 自動偵測
    lint-theme.spec.mjs                    ← Task 5：更新測試
  docs/superpowers/...                     （spec / plan）
```

---

### Task 1: nx init 轉換與驗證（風險退場 spike，含 go/no-go 關卡）

**目的：** 這是整個計畫的風險退場任務。實際跑 `nx init`，確認 Nx 能把現有 Angular 22 + `@angular/build` + vitest 技術棧乾淨包住。**若任一驗收命令失敗，回滾並停止，回報實際錯誤，由 controller 決定是否改走「全新 workspace 手動搬碼」方案。** 這是 spike：實作者要記錄 `nx init` 實際產生的檔案與目錄佈局，回報給 controller。

**Files:**
- Create（由 nx init 自動產生）：`nx.json`、`tsconfig.base.json`、`.nx/`
- Modify（由 nx init 自動改）：`package.json`、`angular.json`（可能被轉為 `project.json`）

**Interfaces:**
- Consumes: 無（起點）。
- Produces: 一個 Nx workspace，`nx build`/`nx test`/`nx serve` 對應現有 `penghu-rental-admin` 專案；後續任務依賴 `nx.json`、`tsconfig.base.json` 存在。

- [ ] **Step 1: 確認乾淨的工作樹**

Run: `git status --short`
Expected: 只有本計畫/ spec 文件，無其他未提交改動（若有先 stash 或 commit）。

- [ ] **Step 2: 執行 nx init（非互動，接受預設）**

Run: `npx nx@23.1.0 init --interactive=false`
說明：`nx init` 會偵測既有 Angular workspace 並加裝 Nx。若它提示需要安裝 `@nx/angular`，允許之。記錄它印出的每一行「created / updated」訊息。

- [ ] **Step 3: 記錄實際產出佈局**

Run: `ls -la && echo '---' && cat nx.json && echo '---' && git status --short`
Expected: 出現 `nx.json`、`tsconfig.base.json`；記錄 app 專案目前的 root（可能仍在 repo 根，尚未移到 apps/）。**把這份實際佈局寫進回報**，後續任務的路徑以此為準。

- [ ] **Step 4: 驗證 build 仍可跑**

Run: `npx nx build penghu-rental-admin`
Expected: 建置成功，產出 `dist/`。若失敗，記錄完整錯誤，跳到 Step 8（回滾）。

- [ ] **Step 5: 驗證 test 仍可跑**

Run: `npx nx test penghu-rental-admin --watch=false`
Expected: 既有測試全過（基準 53 個）。若失敗，記錄錯誤，跳到 Step 8。

- [ ] **Step 6: 驗證 serve 可啟動**

Run: `npx nx serve penghu-rental-admin --port 4210 &` 後 `curl -s -o /dev/null -w "%{http_code}" --max-time 20 http://localhost:4210/` 再 `lsof -ti:4210 | xargs -r kill`
Expected: HTTP 200。

- [ ] **Step 7（成功路徑）: 提交轉換結果**

```bash
git add -A
git commit -m "chore: nx init 轉換為 Nx workspace（保留 admin build/test/serve）"
```
然後**回報 DONE**，附實際佈局，等 controller 確認再進 Task 2。

- [ ] **Step 8（失敗路徑）: 回滾並升級**

```bash
git checkout -- .
git clean -fd
git reset --hard HEAD
```
回報 **BLOCKED**，附 `nx init` 與失敗命令的完整輸出。**不要**在 nx init 失敗後硬改設定重試第三次；交給 controller 決定改方案。

---

### Task 2: 將 admin app 移到 apps/admin

**目的：** 把現有 `penghu-rental-admin` 專案搬到 `apps/admin`，建立多子專案目錄慣例。

**Files:**
- Move: 現有 app 專案（src、project 設定）→ `apps/admin/`
- Modify: `apps/admin/project.json`（root/sourceRoot 路徑）、`nx.json`（若需要）

**Interfaces:**
- Consumes: Task 1 的 Nx workspace。
- Produces: 專案名維持 `admin`（供 `nx build admin`、`nx test admin` 使用）；app 原始碼位於 `apps/admin/src`。

- [ ] **Step 1: 用 nx move 搬遷專案**

Run: `npx nx g @nx/angular:move --project penghu-rental-admin --destination apps/admin --newProjectName admin`
說明：Nx 會自動更新 `project.json`、tsconfig 參照與 workspace 註冊。若 `@nx/angular:move` 不存在，改用 `npx nx g move --projectName penghu-rental-admin --destination apps/admin`。記錄實際指令與輸出。

- [ ] **Step 2: 確認新路徑存在**

Run: `ls apps/admin/src && cat apps/admin/project.json | head -20`
Expected: `apps/admin/src/app`、`apps/admin/src/styles.scss` 存在；`project.json` 的 `sourceRoot` 指向 `apps/admin/src`。

- [ ] **Step 3: 驗證 build**

Run: `npx nx build admin`
Expected: 建置成功。

- [ ] **Step 4: 驗證 test**

Run: `npx nx test admin --watch=false`
Expected: 既有測試全過（基準 53 個）。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: 將 admin app 移到 apps/admin"
```

---

### Task 3: 抽出 libs/theme-pack（主題系統選配庫）

**目的：** 把主題系統（Angular service/component + 所有主題 SCSS）從 admin app 抽成獨立 Nx library，admin 改用選配方式引入。

**Files:**
- Create: `libs/theme-pack/` Nx library（`nx g @nx/angular:library`）
- Move: `apps/admin/src/app/core/theme/{theme.service.ts,theme.service.spec.ts,theme.token.ts,status-tone.ts,status-tone.spec.ts}` → `libs/theme-pack/src/lib/theme/`
- Move: `apps/admin/src/app/shared/theme/theme-switcher.component.ts` → `libs/theme-pack/src/lib/theme-switcher/`
- Move: `apps/admin/src/styles/{_skeleton.scss,CONTRACT.md,paradigms/,color-themes/}` → `libs/theme-pack/src/lib/styles/`
- Create: `libs/theme-pack/src/index.ts`（barrel）
- Modify: `tsconfig.base.json`（加 `@car-rental/theme-pack` path）、`apps/admin/src/styles.scss`（改 includePaths 相對路徑）、`apps/admin` 的 build options（加 `stylePreprocessorOptions.includePaths: ["libs"]`）、所有引用 theme 的 admin TS 檔改 import `@car-rental/theme-pack`

**Interfaces:**
- Consumes: Task 2 的 `apps/admin`。
- Produces:
  - TS barrel `@car-rental/theme-pack` 匯出：`ThemeService`、`ThemeSwitcherComponent`、`PARADIGMS`、`COLOR_THEMES`、`DEFAULT_PARADIGM`、`DEFAULT_THEME`、`PARADIGM_KEY`、`THEME_KEY`、`StatusKey`、`Tone`、`STATUS_TONE`、`toneOf`。
  - SCSS 入口（供 app 用 includePaths `@use`）：`theme-pack/src/lib/styles/skeleton`、`theme-pack/src/lib/styles/paradigms/registry`、`theme-pack/src/lib/styles/color-themes/registry`、`theme-pack/src/lib/styles/paradigms/material/{card,buttons,table,status,typography}`。

- [ ] **Step 1: 建立 library**

Run: `npx nx g @nx/angular:library theme-pack --directory libs/theme-pack --importPath @car-rental/theme-pack --style scss --skipTests false`
說明：記錄 Nx 實際建立的檔案；確認 `tsconfig.base.json` 已自動加入 `@car-rental/theme-pack` path。

- [ ] **Step 2: 搬移 TS 檔並建立目錄**

```bash
mkdir -p libs/theme-pack/src/lib/theme libs/theme-pack/src/lib/theme-switcher libs/theme-pack/src/lib/styles
git mv apps/admin/src/app/core/theme/theme.service.ts libs/theme-pack/src/lib/theme/
git mv apps/admin/src/app/core/theme/theme.service.spec.ts libs/theme-pack/src/lib/theme/
git mv apps/admin/src/app/core/theme/theme.token.ts libs/theme-pack/src/lib/theme/
git mv apps/admin/src/app/core/theme/status-tone.ts libs/theme-pack/src/lib/theme/
git mv apps/admin/src/app/core/theme/status-tone.spec.ts libs/theme-pack/src/lib/theme/
git mv apps/admin/src/app/shared/theme/theme-switcher.component.ts libs/theme-pack/src/lib/theme-switcher/
```

- [ ] **Step 3: 搬移 SCSS 檔**

```bash
git mv apps/admin/src/styles/_skeleton.scss libs/theme-pack/src/lib/styles/
git mv apps/admin/src/styles/CONTRACT.md libs/theme-pack/src/lib/styles/
git mv apps/admin/src/styles/paradigms libs/theme-pack/src/lib/styles/paradigms
git mv apps/admin/src/styles/color-themes libs/theme-pack/src/lib/styles/color-themes
```

- [ ] **Step 4: 寫 barrel index.ts**

覆寫 `libs/theme-pack/src/index.ts`：
```typescript
export * from './lib/theme/theme.service';
export * from './lib/theme/theme.token';
export * from './lib/theme/status-tone';
export * from './lib/theme-switcher/theme-switcher.component';
```

- [ ] **Step 5: 修正 theme-switcher 內部 import**

`theme-switcher.component.ts` 原本相對匯入 `theme.service`/`theme.token`。改為相對新位置：
```typescript
import { ThemeService } from '../theme/theme.service';
import { PARADIGMS, COLOR_THEMES } from '../theme/theme.token';
```
Run: `grep -n "import" libs/theme-pack/src/lib/theme-switcher/theme-switcher.component.ts`
確認無殘留舊路徑（如 `core/theme`、`./theme.service`）。

- [ ] **Step 6: admin 的 build options 加 includePaths**

在 `apps/admin/project.json` 的 `build.options` 加入：
```json
"stylePreprocessorOptions": { "includePaths": ["libs"] }
```

- [ ] **Step 7: 改 apps/admin/src/styles.scss 的 SCSS @use 路徑**

把原本 `@use 'styles/paradigms/registry' as *;` 等 5 行主題相關 `@use`，改為 theme-pack 相對路徑（含關鍵字 `theme-pack`，供 Task 5 偵測）：
```scss
@use "tailwindcss";
@use '@angular/material' as mat;
@use 'theme-pack/src/lib/styles/paradigms/registry' as *;
@use 'theme-pack/src/lib/styles/color-themes/registry' as *;
@use 'theme-pack/src/lib/styles/skeleton';
@use 'theme-pack/src/lib/styles/paradigms/material/card';
@use 'theme-pack/src/lib/styles/paradigms/material/buttons';
@use 'theme-pack/src/lib/styles/paradigms/material/table';
@use 'theme-pack/src/lib/styles/paradigms/material/status';
@use 'theme-pack/src/lib/styles/paradigms/material/typography';
```
（`html { @include mat.theme(...) }` 區塊保留不動。）

- [ ] **Step 8: 全域改 admin 的 TS 匯入為 alias**

把 admin 內所有從 `core/theme` 或 `shared/theme` 匯入 theme 符號的檔案，改成 `@car-rental/theme-pack`：
```bash
grep -rl -e "core/theme/" -e "shared/theme/theme-switcher" apps/admin/src --include='*.ts'
```
逐檔把 import 來源換成 `@car-rental/theme-pack`（符號名不變）。例如 `app.ts`：
```typescript
import { ThemeService, ThemeSwitcherComponent } from '@car-rental/theme-pack';
```
改完 Run: `grep -rn -e "core/theme/" -e "shared/theme/theme-switcher" apps/admin/src --include='*.ts'`
Expected: 無輸出（全部改完）。

- [ ] **Step 9: 刪除空的舊資料夾**

```bash
rmdir apps/admin/src/app/core/theme apps/admin/src/app/shared/theme apps/admin/src/styles 2>/dev/null || true
```
Run: `ls apps/admin/src/styles 2>&1 | head -1`（若已無主題檔且資料夾空則移除）。

- [ ] **Step 10: 驗證 build**

Run: `npx nx build admin`
Expected: 建置成功（TS alias + SCSS includePaths 都解析成功）。

- [ ] **Step 11: 驗證 test（含搬進 lib 的 spec）**

Run: `npx nx test admin --watch=false && npx nx test theme-pack --watch=false`
Expected: admin 既有測試全過；theme-pack 的 `theme.service.spec`、`status-tone.spec` 全過。

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "refactor: 抽出 libs/theme-pack 主題選配庫，admin 改選配引入"
```

---

### Task 4: 抽出 libs/assets（圖檔 + 共用 tailwind-base + quill 內容樣式）

**目的：** 建立純靜態共用資源庫：品牌圖檔、共用 Tailwind base（v4 的 `@theme`）、Quill 內容排版樣式（獨立、不吃主題 token）。

**Files:**
- Create: `libs/assets/image/`（放 favicon、logo）
- Create: `libs/assets/style/tailwind-base.scss`
- Create: `libs/assets/style/scss/quill-content-style/_quill-content.scss`
- Move: `apps/admin/public/favicon.ico` → `libs/assets/image/favicon.ico`
- Modify: `apps/admin/project.json`（build assets 指向 `libs/assets/image`）、`apps/admin/src/styles.scss`（`@use` tailwind-base 與 quill）

**Interfaces:**
- Consumes: Task 3 後的 `apps/admin`（已有 `stylePreprocessorOptions.includePaths: ["libs"]`）。
- Produces:
  - SCSS 入口：`assets/style/tailwind-base`（共用 `@theme`）、`assets/style/scss/quill-content-style/quill-content`（Quill 樣式）。
  - 圖檔目錄 `libs/assets/image/`。

- [ ] **Step 1: 建立目錄與搬 favicon**

```bash
mkdir -p libs/assets/image libs/assets/style/scss/quill-content-style
git mv apps/admin/public/favicon.ico libs/assets/image/favicon.ico
```

- [ ] **Step 2: admin build assets 指向共用圖檔**

在 `apps/admin/project.json` 的 `build.options.assets` 陣列加入（保留原有項目）：
```json
{ "glob": "**/*", "input": "libs/assets/image", "output": "." }
```
（若原 assets 有指向 `apps/admin/public` 的項目且已空，可保留或移除。）

- [ ] **Step 3: 建立共用 tailwind-base.scss**

寫 `libs/assets/style/tailwind-base.scss`（Tailwind v4 用 CSS `@theme` 定義共用設計 token；此處放跨 app 共用的間距/斷點基準，顏色仍由各 app 或 theme-pack 決定）：
```scss
/* 共用 Tailwind v4 base：跨子專案一致的間距與斷點基準。
   顏色不放這裡（由 theme-pack 或各 app 決定），避免與主題系統衝突。 */
@theme {
  --breakpoint-xs: 24rem;
  --spacing-page: 1.5rem;
}
```

- [ ] **Step 4: 建立 quill 內容樣式（獨立、寫死樣式）**

寫 `libs/assets/style/scss/quill-content-style/_quill-content.scss`。**這份不吃主題 token，顏色/字體直接寫死**，故 Task 5 的 lint 會排除此路徑：
```scss
/* Quill 編輯器輸出內容的排版樣式。獨立於主題系統，顏色/字體固定。
   任何 app（無論有無套 theme-pack）皆可 @use。 */
.ql-editor {
  font-family: "Noto Sans TC", system-ui, sans-serif;
  line-height: 1.7;
  color: #1f2933;

  h1 { font-size: 1.5rem; font-weight: 700; margin: 1.2em 0 0.5em; }
  h2 { font-size: 1.25rem; font-weight: 700; margin: 1.1em 0 0.5em; }
  p { margin: 0 0 0.75em; }
  ul, ol { margin: 0 0 0.75em; padding-left: 1.5em; }
  blockquote {
    margin: 0 0 0.75em;
    padding-left: 1em;
    border-left: 3px solid #cbd2d9;
    color: #52606d;
  }
  a { color: #2563eb; text-decoration: underline; }
}
```

- [ ] **Step 5: admin styles.scss 引入 tailwind-base（quill 視需要）**

在 `apps/admin/src/styles.scss` 頂部 `@use "tailwindcss";` 之後加入共用 base：
```scss
@use 'assets/style/tailwind-base';
```
（admin 目前無 Quill 需求，quill 樣式先不在 admin 引入，僅建立於 lib 供未來子專案使用。）

- [ ] **Step 6: 驗證 build 與 favicon 產出**

Run: `npx nx build admin && find dist -name 'favicon.ico' | head -1`
Expected: 建置成功，`dist` 內含 favicon.ico。

- [ ] **Step 7: 驗證 lint:theme 排除 quill（先確認 quill 寫死色不誤報）**

Run: `node scripts/lint-theme.mjs libs/assets/style/scss/quill-content-style`
Expected（此步用現行單路徑模式手動確認）：因 quill 檔含寫死色，**目前會報 violation**——這是預期的，Task 5 會把 quill 路徑加入排除規則。此步僅記錄現況，不阻擋提交。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: 建立 libs/assets（共用圖檔、tailwind-base、quill 內容樣式）"
```

---

### Task 5: lint:theme 改多 app 自動偵測（TDD）

**目的：** 把 `lint-theme.mjs` 從單一 app 寫死路徑，改為自動掃 `apps/*/src`，只檢查 `styles.scss` 內含 `theme-pack`（即有套主題）的 app；並把 quill 內容樣式路徑加入排除。

**Files:**
- Modify: `scripts/lint-theme.mjs`
- Modify: `scripts/lint-theme.spec.mjs`
- Modify: `package.json`（`lint:theme` script 不再帶固定參數）

**Interfaces:**
- Consumes: Task 3/4 後的目錄（`apps/*/src/styles.scss`、`libs/theme-pack`、`libs/assets/.../quill-content-style/`）。
- Produces: `lint-theme.mjs` 匯出 `collectThemedAppRoots(appsDir)` 回傳「有套主題的 app src 路徑陣列」；`isAllowed(path)` 額外排除 `quill-content-style`。

- [ ] **Step 1: 先讀現有測試理解慣例**

Run: `cat scripts/lint-theme.spec.mjs`
理解既有測試如何組織（斷言函式、執行方式）。

- [ ] **Step 2: 寫失敗測試（自動偵測有套主題的 app）**

在 `scripts/lint-theme.spec.mjs` 加入測試，驗證 `collectThemedAppRoots`：只回傳 `styles.scss` 含 `theme-pack` 的 app。用暫存目錄建構 fixture：
```javascript
import { collectThemedAppRoots } from './lint-theme.mjs';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('collectThemedAppRoots 只回傳有 @use theme-pack 的 app', () => {
  const base = mkdtempSync(join(tmpdir(), 'lint-'));
  const apps = join(base, 'apps');
  for (const [name, styles] of [
    ['admin', "@use 'theme-pack/src/lib/styles/skeleton';"],
    ['store', "@use 'tailwindcss';"],
  ]) {
    mkdirSync(join(apps, name, 'src'), { recursive: true });
    writeFileSync(join(apps, name, 'src', 'styles.scss'), styles);
  }
  const roots = collectThemedAppRoots(apps);
  assert(roots.length === 1, `expected 1 themed app, got ${roots.length}`);
  assert(roots[0].endsWith(join('admin', 'src')), `expected admin/src, got ${roots[0]}`);
});
```

- [ ] **Step 3: 執行測試確認失敗**

Run: `node scripts/lint-theme.spec.mjs`
Expected: FAIL，因 `collectThemedAppRoots` 尚未匯出（`is not a function` 或 import 錯誤）。

- [ ] **Step 4: 實作 collectThemedAppRoots 並改 scanRoots + isAllowed**

改寫 `scripts/lint-theme.mjs`：
```javascript
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const PALETTE = /var\(\s*--_?(primary|accent|neutral|sage|teal|cream)-\d/;
const EXTS = ['.ts', '.scss', '.html'];

export function collectThemedAppRoots(appsDir = 'apps') {
  const roots = [];
  if (!existsSync(appsDir)) return roots;
  for (const name of readdirSync(appsDir)) {
    const src = join(appsDir, name, 'src');
    const styles = join(src, 'styles.scss');
    if (existsSync(styles) && readFileSync(styles, 'utf8').includes('theme-pack')) {
      roots.push(src);
    }
  }
  return roots;
}

function isAllowed(path) {
  return path.includes('/color-themes/')
    || path.includes('/quill-content-style/')
    || basename(path) === '_tokens.scss';
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.some(e => p.endsWith(e))) out.push(p);
  }
}

function runLint(scanRoots) {
  const files = [];
  for (const r of scanRoots) {
    try {
      const st = statSync(r);
      if (st.isDirectory()) walk(r, files);
      else if (EXTS.some(e => r.endsWith(e))) files.push(r);
    } catch { /* 略過不存在 */ }
  }
  const violations = [];
  for (const f of files) {
    if (isAllowed(f)) continue;
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (HEX.test(line) || PALETTE.test(line)) violations.push(`${f}:${i + 1}: ${line.trim()}`);
    });
  }
  return violations;
}

// 直接執行時：掃 libs/theme-pack + 所有有套主題的 app
if (import.meta.url === `file://${process.argv[1]}`) {
  const cliRoots = process.argv.slice(2);
  const scanRoots = cliRoots.length
    ? cliRoots
    : ['libs/theme-pack/src', ...collectThemedAppRoots('apps')];
  const violations = runLint(scanRoots);
  if (violations.length) {
    console.log('lint:theme 發現寫死色/底層色（請改綁 --mat-sys-* 或 --app-*）：');
    for (const v of violations) console.log('  ' + v);
    process.exit(1);
  }
  console.log('lint:theme 通過：無寫死色。');
}

export { runLint, isAllowed };
```

- [ ] **Step 5: 執行測試確認通過**

Run: `node scripts/lint-theme.spec.mjs`
Expected: PASS（含既有測試與新測試）。

- [ ] **Step 6: 更新 package.json script**

把 `"lint:theme": "node scripts/lint-theme.mjs"`（不帶固定參數，讓腳本自動偵測）。確認現值已是如此；若否則改之。

- [ ] **Step 7: 端到端驗證**

Run: `npm run lint:theme`
Expected: exit 0，輸出「lint:theme 通過」。掃描範圍應含 `libs/theme-pack/src` 與 `apps/admin/src`，排除 quill 與 color-themes。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: lint:theme 改多 app 自動偵測，排除 quill 內容樣式"
```

---

### Task 6: 建立 booking / pos 骨架殼 app（不套主題）

**目的：** 用 Nx 產生兩個最小可 build 的殼 app，證明多子專案骨架成立，且驗證「不套主題的 app」被 lint:theme 自動略過。

**Files:**
- Create: `apps/booking/`（`nx g @nx/angular:application`）
- Create: `apps/pos/`（同上）
- 兩者的 `src/styles.scss` 皆不含 `theme-pack`。

**Interfaces:**
- Consumes: Task 5 後的 workspace。
- Produces: `nx build booking`、`nx build pos` 可成功；兩 app 不被 lint:theme 掃描。

- [ ] **Step 1: 產生 booking app**

Run: `npx nx g @nx/angular:application booking --directory apps/booking --style scss --routing false --skipTests false`
記錄 Nx 產生的檔案。

- [ ] **Step 2: 產生 pos app**

Run: `npx nx g @nx/angular:application pos --directory apps/pos --style scss --routing false --skipTests false`

- [ ] **Step 3: 確認殼 app 的 styles.scss 不含 theme-pack**

Run: `grep -L theme-pack apps/booking/src/styles.scss apps/pos/src/styles.scss`
Expected: 兩檔都列出（代表都不含 theme-pack）。若 Nx 產生的 styles.scss 為空亦可。

- [ ] **Step 4: 驗證兩殼 app build**

Run: `npx nx build booking && npx nx build pos`
Expected: 兩者建置成功。

- [ ] **Step 5: 驗證 lint:theme 仍只掃 admin（略過殼 app）**

Run: `npm run lint:theme`
Expected: exit 0；輸出不含 `apps/booking`、`apps/pos` 的任何檔案路徑（因未套主題被自動略過）。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 建立 booking / pos 骨架殼 app（不套主題）"
```

---

### Task 7: 更新部署腳本與 README

**目的：** 把 GitHub Pages 部署接到 `apps/admin` 的新輸出路徑，並在 README 補上「子專案如何套用/取消主題系統」與 `libs/assets` 用途說明。

**Files:**
- Modify: `package.json`（`deploy` script）
- Modify: `README.md`

**Interfaces:**
- Consumes: Task 6 後完整的 monorepo。
- Produces: 可用的 `npm run deploy`；README 新增章節。

- [ ] **Step 1: 查出 admin 的實際建置輸出路徑**

Run: `npx nx build admin && find dist -maxdepth 3 -name index.html`
記錄 index.html 所在目錄（Nx 通常為 `dist/apps/admin/browser` 或 `dist/admin/browser`），作為 deploy `--dir` 值。

- [ ] **Step 2: 更新 deploy script**

把 `package.json` 的 `deploy` 改為（用 nx build + Step 1 查到的路徑；範例以 `dist/apps/admin/browser` 為準，依實際調整）：
```json
"deploy": "npx nx build admin --base-href /bbd-car-rental/ && npx angular-cli-ghpages --dir=dist/apps/admin/browser"
```

- [ ] **Step 3: 驗證 deploy 的 build 段（不實際推送）**

Run: `npx nx build admin --base-href /bbd-car-rental/ && grep -c 'base href="/bbd-car-rental/"' dist/apps/admin/browser/index.html`
Expected: 建置成功且 grep 得 1（base href 正確）。

- [ ] **Step 4: 更新 README——新增「子專案如何套用/取消主題系統」章節**

在 `README.md`「雙軸主題系統」章節後新增：
```markdown
## 子專案如何套用 / 取消主題系統

本 repo 是多子專案 monorepo（`apps/` 下多個 app，`libs/` 共用）。每個 app 可自由決定要不要套用雙軸主題系統（`libs/theme-pack`）。

### 判斷準則
這個 app 的 UI 未來是否需要換膚 / 換範式？需要就套 theme-pack；純資訊型、不需要換膚的前台可以不套。

### 套用步驟
1. `apps/<app>/src/styles.scss` 加入主題 SCSS（關鍵字 `theme-pack` 是 lint 的偵測依據）：
   ```scss
   @use 'theme-pack/src/lib/styles/paradigms/registry' as *;
   @use 'theme-pack/src/lib/styles/color-themes/registry' as *;
   @use 'theme-pack/src/lib/styles/skeleton';
   @use 'theme-pack/src/lib/styles/paradigms/material/card';
   // buttons / table / status / typography 同理
   ```
2. 確認該 app 的 `project.json` build options 有 `"stylePreprocessorOptions": { "includePaths": ["libs"] }`。
3. `app.ts` 注入主題系統：
   ```typescript
   import { ThemeService, ThemeSwitcherComponent } from '@car-rental/theme-pack';
   ```
   在模板放入 `<app-theme-switcher />`，並依現有 admin 作法在啟動時 `ThemeService.init()`。
4. 元件樣式遵守 `ui-*` / `is-*` class 契約（見 `libs/theme-pack/src/lib/styles/CONTRACT.md`）。

### 不套用（預設）
什麼都不用做。app 直接用 Angular Material 預設主題或自訂 CSS，不受 `ui-*` 契約約束。

### lint:theme 如何運作
`npm run lint:theme` 會自動掃 `libs/theme-pack/src` 與所有 `styles.scss` 含 `theme-pack` 的 app；沒套主題的 app 自動略過，不需維護任何清單。

## libs/assets 共用資源
- `libs/assets/image/`：logo、favicon 等品牌圖檔，各 app 的 build assets 引用此處。
- `libs/assets/style/tailwind-base.scss`：共用 Tailwind v4 `@theme`（間距、斷點基準），各 app `@use 'assets/style/tailwind-base';` 繼承。
- `libs/assets/style/scss/quill-content-style/_quill-content.scss`：Quill 編輯器內容排版，獨立於主題系統、樣式固定，需要顯示 Quill 內容的 app `@use` 即可。
```

- [ ] **Step 5: 修正 README 舊路徑參照**

README 舊文中對主題檔的路徑參照（如 `src/styles/CONTRACT.md`、`src/app/core/theme/theme.token.ts`、`src/styles/color-themes/`、`src/styles/paradigms/`）已隨搬遷失效。Run:
```bash
grep -n -e "src/styles/" -e "src/app/core/theme" -e "src/app/shared/theme-switcher" README.md
```
逐處改為新位置（`libs/theme-pack/src/lib/styles/...`、`libs/theme-pack/src/lib/theme/theme.token.ts`）。改完再跑一次 grep 確認無殘留。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: 部署腳本接 apps/admin，README 補多子專案主題選配說明"
```

---

## 完成後

全部任務完成後，用 superpowers:finishing-a-development-branch 收尾（跑完整測試 → 選擇 merge / PR / 保留 / 丟棄）。收尾前最低驗收：

- `npx nx build admin`、`npx nx build booking`、`npx nx build pos` 皆成功。
- `npx nx test admin --watch=false` 既有測試全過（基準 53）；`npx nx test theme-pack --watch=false` 全過。
- `npm run lint:theme` exit 0，掃描含 theme-pack 與 admin、略過殼 app 與 quill。
- `npx nx build admin --base-href /bbd-car-rental/` 產出 index.html 的 base href 正確。
