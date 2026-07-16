# PenghuRentalAdmin

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.6.

## Prerequisites

Angular CLI 22 requires **Node.js >= 22.22.3 or 24.x**. This project pins Node 24 via `.nvmrc`:

```bash
nvm use   # switches to Node 24 (from .nvmrc)
npm install
```

## Common commands

```bash
npm start        # dev server (ng serve), http://localhost:4200/
npm run build    # production build (ng build), output in dist/
npm test         # unit tests (vitest)
npm run deploy   # build + publish to GitHub Pages (gh-pages branch)
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Deploying to GitHub Pages

This app is hosted at https://fangjiehung.github.io/bbd-car-rental/. To deploy:

```bash
npm run deploy
```

This builds with the correct base href for the `/bbd-car-rental/` subpath and publishes
`dist/penghu-rental-admin/browser` to the `gh-pages` branch via `angular-cli-ghpages`.
Pages typically takes 1–2 minutes to update after the push completes.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

## 雙軸主題系統

本專案採用**範式（Paradigm）× 配色（Color-theme）**的兩軸主題架構。範式管造型（圓角、陰影、字體），配色管顏色。一套配色可搭配不同範式；同一範式可套用不同配色。目前提供 Material 範式與 Verdant / Midnight 兩套配色。

詳細設計見 `docs/superpowers/specs/2026-07-15-theme-pack-architecture-design.md`。

### 樣式規則（開發者）

撰寫樣式時請遵守以下規則，確保主題系統運作正確：

1. **顏色、字體、圓角綁定 token**
   - 顏色一律綁 `--mat-sys-*`（由配色包提供）或 `--app-*` 擴充 token（如 `--app-positive-bg`、`--app-viz-1` 等）
   - 字體綁 `--font-zh`（中文）與 `--font-en`（英文），由範式包提供
   - 圓角綁 `--mat-sys-corner-*`，由範式包提供

2. **間距與尺寸**
   - 間距（padding、margin、gap）使用 Tailwind 工具類（`p-4`、`gap-3` 等）
   - 不引入間距 CSS 變數

3. **禁止寫死顏色**
   - 嚴禁出現十六進位色碼（`#xxx`、`#xxxxxx`）
   - 嚴禁使用底層色階變數（如舊專案的 `--sage-500`）
   - **唯一允許的例外**：`libs/theme-pack/src/lib/styles/color-themes/*/` 與各範式的 `_tokens.scss` 檔案

4. **元件 class 契約**
   - 元件一律用 `.ui-*` 開頭（如 `.ui-card`、`.ui-btn`、`.ui-chip`）
   - 狀態使用 `.is-*`（如 `.is-active`、`.is-disabled`）
   - 完整列表見 `libs/theme-pack/src/lib/styles/CONTRACT.md`

5. **狀態色彩**
   - 業務狀態（success、error、warning 等）對應的 tone 在 `libs/theme-pack/src/lib/theme/status-tone.ts` 定義
   - 在元件中使用 `StatusKey` 型別，不要自行編造狀態字串
   - 例：`status-chip` 元件輸入 `success` 會自動對應 `positive` tone，套用 `.ui-chip--positive` 樣式

6. **提交前驗證**
   ```bash
   npm run lint:theme   # 掃 src/app 與 src/styles，檢查色碼與底層變數
   ```
   - 命令必須 exit 0（全綠）才能提交或觸發 CI
   - 違規會列出檔案:行號

### 新增一套配色

若要新增配色（如夜間模式、企業色系等），請按以下步驟：

1. **複製基礎**
   ```bash
   cp -r libs/theme-pack/src/lib/styles/color-themes/verdant libs/theme-pack/src/lib/styles/color-themes/新配色名稱
   ```

2. **編輯色彩 token**
   - 開啟 `libs/theme-pack/src/lib/styles/color-themes/新配色名稱/_tokens.scss`
   - 修改 `:root[data-theme='新配色名稱']` 下的所有 token 值
   - 必須提供的 token：`--mat-sys-*`（Material Design 3 系統顏色）與 `--app-*`（應用擴充色）

3. **註冊到全域**
   - 編輯 `libs/theme-pack/src/lib/styles/color-themes/_registry.scss`
   - 新增一行：`@forward '新配色名稱/tokens';`

4. **新增到配色清單**
   - 編輯 `libs/theme-pack/src/lib/theme/theme.token.ts`
   - 在 `COLOR_THEMES` 陣列中新增：
     ```typescript
     { id: '新配色名稱', label: '顯示名稱' }
     ```

5. **驗證**
   ```bash
   npm run build
   npm run lint:theme
   ```

### 新增一個範式

若要新增造型範式（如玻璃態效果、新形主義等），請按以下步驟：

1. **複製基礎**
   ```bash
   cp -r libs/theme-pack/src/lib/styles/paradigms/material libs/theme-pack/src/lib/styles/paradigms/新範式名稱
   ```

2. **依契約重寫 recipe**
   - 參考 `libs/theme-pack/src/lib/styles/CONTRACT.md` 的 class 名單
   - 在各 recipe 檔中（`buttons.scss`、`card.scss`、`table.scss` 等）重新設計樣式
   - 可自由使用 CSS（包括 `backdrop-filter`、`inset` 陰影等），但顏色一定要綁 token
   - 新增或修改 `_tokens.scss` 裡的造型 token（圓角、陰影、字體等）

3. **註冊到全域**
   - 編輯 `libs/theme-pack/src/lib/styles/paradigms/_registry.scss`
   - 新增一行：`@forward '新範式名稱/tokens';`
   - 若新增了 recipe 檔，也在該檔頭部用 `@use` 引入

4. **新增到範式清單**
   - 編輯 `libs/theme-pack/src/lib/theme/theme.token.ts`
   - 在 `PARADIGMS` 陣列中新增：
     ```typescript
     { id: '新範式名稱', label: '顯示名稱' }
     ```

5. **驗證**
   ```bash
   npm run build
   npm run lint:theme
   ```

### 鎖成單一主題（初始化步驟）

若專案要收斂為固定的主題組合（範式 + 配色），請按以下步驟：

1. **設定預設值**
   - 編輯 `libs/theme-pack/src/lib/theme/theme.token.ts`
   - 修改 `DEFAULT_PARADIGM` 和 `DEFAULT_THEME` 為要鎖定的值
   - 或在 `apps/admin/src/index.html` 的 `<html>` 標籤直接寫死屬性：
     ```html
     <html data-paradigm="material" data-theme="verdant">
     ```

2. **（可選）移除換膚器**
   - 若不需要 runtime 切換，可刪除 `libs/theme-pack/src/lib/theme-switcher/theme-switcher.component.ts` 及其引用
   - 編輯主應用模板，移除 theme-switcher 的宣告與使用

3. **（可選）清理未用資源**
   - 若只用一個範式，可刪除 `libs/theme-pack/src/lib/styles/paradigms/` 下的其他資料夾
   - 同時編輯 `libs/theme-pack/src/lib/styles/paradigms/_registry.scss`，移除對應的 `@forward` 行
   - 若只用一個配色，可刪除 `libs/theme-pack/src/lib/styles/color-themes/` 下的其他資料夾
   - 同時編輯 `libs/theme-pack/src/lib/styles/color-themes/_registry.scss`，移除對應的 `@forward` 行

4. **驗證**
   ```bash
   npm run build
   npm run lint:theme
   ```

Runtime 主題切換能力隨時可重新啟用，無需修改架構。

---

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
3. `app.config.ts` / `app.ts` 注入主題系統：
   ```typescript
   import { ThemeService, ThemeSwitcherComponent } from '@car-rental/theme-pack';
   ```
   在模板放入 `<app-theme-switcher />`，並依現有 admin 作法在啟動時呼叫 `ThemeService.init()`。
4. 元件樣式遵守 `ui-*` / `is-*` class 契約（見 `libs/theme-pack/src/lib/styles/CONTRACT.md`）。

### 不套用（預設）
什麼都不用做。app 直接用 Angular Material 預設主題或自訂 CSS，不受 `ui-*` 契約約束。`booking`、`pos` 目前即為此狀態。

### lint:theme 如何運作
`npm run lint:theme` 會自動掃 `libs/theme-pack/src` 與所有 `styles.scss` 含 `theme-pack` 的 app；沒套主題的 app 自動略過，不需維護任何清單。

## libs/assets 共用資源
- `libs/assets/image/`：logo、favicon 等品牌圖檔，各 app 的 build assets 引用此處。
- `libs/assets/style/tailwind-base.scss`：共用 Tailwind v4 `@theme`（間距、斷點基準），各 app `@use 'assets/style/tailwind-base';` 繼承。
- `libs/assets/style/scss/quill-content-style/_quill-content.scss`：Quill 編輯器內容排版，獨立於主題系統、樣式固定，需要顯示 Quill 內容的 app `@use` 即可。
