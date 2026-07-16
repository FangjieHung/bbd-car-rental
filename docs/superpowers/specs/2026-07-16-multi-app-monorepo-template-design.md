# 多子專案 Monorepo Template 架構設計

## 目標

把 car-rental 從單一 Angular app 改造成可複製的 **多子專案 monorepo template**：一個 repo 裡容納多個獨立子專案（app），共用 lib 資源，每個子專案可各自決定要不要套用雙軸主題系統（範式 × 配色）。這次只搭骨架，不開發新子專案的業務功能。

## 背景與動機

參考同事另一個專案 `ls-angular14-apps`（Nx monorepo，`apps/store`、`apps/erp`、`apps/pos` 等子專案 + `libs/core` 共用庫）的結構經驗：多個子專案各自完整複製一份 `tailwind.config.js`、`favicon.ico`，內容幾乎相同卻要手動同步維護。car-rental 要在成為 template 之前先把這個重複問題解決，並把既有的雙軸主題系統（`docs/superpowers/specs/2026-07-15-theme-pack-architecture-design.md`）改造成「可選配」而非「全域套用」。

**明確排除**：不修改 `ls-angular14-apps` 專案本身；本次不涉及該專案的 `cart` app；car-rental 不升級/改動既有的 Angular 22 版本；`booking`、`pos` 子專案本次只建能跑的空殼，不開發業務畫面。

## 架構

### 目錄結構

```
car-rental/ (Nx workspace)
  apps/
    admin/                          ← 現有 car-rental 後台整個搬入，功能不變
      src/app/...                   （features、shared、core 保留現有結構）
      project.json
    booking/                        ← 骨架殼：未來客戶訂車前台，本次只建最小可跑的 app
      project.json
      src/app/app.ts
    pos/                            ← 骨架殼：未來店面端，同上
      project.json
  libs/
    assets/
      image/                        ← logo、favicon、共用品牌圖檔
      style/
        tailwind-config.js          ← 共用 tailwind 基礎設定（各 app 用 presets 繼承）
        scss/
          quill-content-style/      ← Quill 編輯器內容排版樣式
    theme-pack/                     ← 雙軸主題系統（選配），現有 core/theme + styles/paradigms + styles/color-themes 搬入
      src/
        theme/                      （ThemeService、ThemeSwitcherComponent、theme.token.ts、status-tone.ts）
        styles/paradigms/
        styles/color-themes/
  nx.json
  package.json                      （合併後的單一 workspace 依賴）
```

### 為何 `theme-pack` 獨立於 `libs/assets/` 之外

`libs/assets/` 底下都是純靜態資源（圖檔、CSS、設定檔），沒有執行邏輯。`theme-pack` 內含 Angular service（`ThemeService`）與 component（`ThemeSwitcherComponent`），是一套會被 app 主動注入使用的系統，性質不同，因此放在 `libs/` 根層，與 `assets` 平行。

### `libs/assets/` 三類共用資源

1. **`image/`** — logo、favicon.ico、其他共用品牌圖檔。各 app 的 `index.html`/模板直接引用這裡的檔案，不再各自放一份重複拷貝。
2. **`style/tailwind-config.js`** — 匯出一份基礎 Tailwind 設定（spacing scale 等共用部分）。各 app 自己的 `tailwind.config.js` 用 `presets: [require('@car-rental/assets/style/tailwind-config')]` 繼承，app 層只保留自己的差異設定，不再整份重複。
3. **`style/scss/quill-content-style/`** — Quill 編輯器輸出內容（如公告、說明文字）的排版樣式（標題、段落、清單、引言）。**獨立於 theme-pack，不吃 `--mat-sys-*`/`--app-*` token，顏色與字體直接寫死在這份 scss 內**——不論該 app 有沒有套用主題系統，都可以單獨 `@use` 這份樣式，顯示效果固定、不隨配色/範式切換。

### 主題選配機制

一個 app 要不要套用 `theme-pack`，**只靠該 app 的 `styles.scss` 裡有沒有 `@use '@car-rental/theme-pack'` 這一行**判斷，沒有額外開關或設定檔：

- **套用**：`styles.scss` 加入 `@use '@car-rental/theme-pack'`；`app.ts` 注入 `ThemeService`，模板加入 `<app-theme-switcher />`；元件樣式遵守 `ui-*`/`is-*` class 契約（見 `src/styles/CONTRACT.md`，隨 theme-pack 一併搬入）。
- **不套用（預設狀態）**：什麼都不做。該 app 直接用 Angular Material 預設主題或自訂 CSS，不受 `ui-*` 契約約束。

本次範圍：`admin` 套用（沿用現有雙軸主題）；`booking`、`pos` 骨架殼本次**不套用**，之後真正開發業務畫面時再各自決定。

### `lint:theme` 多 app 化

現有 `scripts/lint-theme.mjs` 是單一 app 寫死掃描路徑。改造後：**自動掃描 `apps/*/src`，凡是該 app 的 `styles.scss` 內含 `@use` theme-pack 的字樣，就把該 app 的 `src` 納入掃描範圍**；沒有套用的 app 不受檢查。新增子專案時不需要另外維護一份「掃描清單」設定檔——腳本自己判斷。

### README 更新

在 car-rental 現有 README「雙軸主題系統」章節旁，新增一節「**子專案如何套用/取消主題系統**」，涵蓋：

1. 新建 app 時「要不要套用 theme-pack」的判斷準則：這個 app 的 UI 未來是否需要換膚/換範式？需要就套，純資訊型或不需要換膚的前台可以不套。
2. **套用步驟**：`styles.scss` 加 `@use '@car-rental/theme-pack'` → `app.ts` 注入 `ThemeService` → 模板加入 theme-switcher → 元件樣式遵守 `ui-*`/`is-*` 契約。
3. **取消/不套用**：預設狀態，不需要任何動作。
4. **`lint:theme` 掃描邏輯說明**：自動偵測，不需手動維護清單。
5. `libs/assets/` 三類資源的用途與引用方式（image / tailwind-config / quill-content-style）。

## 搬遷方式

**方案：`nx init` 原地轉換**（保留 git 歷史，風險最低）：

1. 在既有 car-rental repo 執行 Nx 官方「為 Angular CLI workspace 加裝 Nx」流程，將 `angular.json` 轉為 Nx 的 `project.json` 結構。
2. 現有 `src/app`、`src/styles`（扣除搬入 `theme-pack`/`libs/assets` 的部分）搬入 `apps/admin/src`。
3. 現有 `src/app/core/theme/`、`src/styles/paradigms/`、`src/styles/color-themes/`、`src/styles/CONTRACT.md` 搬入 `libs/theme-pack/`。
4. 現有 `src/favicon.ico`、品牌圖檔搬入 `libs/assets/image/`；現有 `tailwind.config.js` 拆成 base preset（`libs/assets/style/tailwind-config.js`）+ `apps/admin/tailwind.config.js` 繼承。
5. 新建 `apps/booking/`、`apps/pos/` 兩個最小可跑的空殼 app（各自 `project.json` + 最小 `app.ts`，不套用 theme-pack）。
6. 更新 `scripts/lint-theme.mjs` 為多 app 自動偵測版本。
7. 更新 README（見上一節）。
8. 更新 GitHub Pages 部署腳本（`npm run deploy`）指向新的 `apps/admin` 建置輸出路徑與 base href，確保部署行為不變。

**技術前提（已驗證）**：`@nx/angular@23.1.0` 的 peer dependency 支援 `@angular-devkit/build-angular` `>=20.0.0 <23.0.0`，涵蓋 car-rental 現用的 Angular 22，方案可行（2026-07-16 以 `npm view` 查證）。

## 測試與驗收標準

- `nx build admin`（或轉換後對應指令）成功，產物與搬遷前的 `ng build` 行為一致。
- `nx test admin` 既有測試全數通過（搬遷前 53/53）。
- `npm run lint:theme` 對 `admin` 掃描結果與搬遷前一致（全綠），對未套用主題的骨架殼 app 不掃描。
- `nx build booking`、`nx build pos` 能成功建置最小殼（即使畫面幾乎空白）。
- GitHub Pages 部署 `admin` 後，線上網址回應 200，畫面與搬遷前一致（含主題切換面板正常運作）。
- README 新增章節可讀、步驟可照做（人工檢查）。

## 範圍外（Out of Scope）

- `ls-angular14-apps` 專案本身的任何修改。
- 該專案的 `cart` app。
- `booking`、`pos` 的業務功能開發（僅骨架殼）。
- Angular / Material 版本升級（沿用現有 22 版）。
- Nx 的進階能力（affected 建置、remote cache 等）本次不特別設計，僅使用其多專案管理基礎能力。
