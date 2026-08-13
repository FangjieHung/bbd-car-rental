# 設定頁外觀功能搬移 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將 `app-theme-switcher` 的質地與配色控制搬到 `/settings`，並移除 app shell 的浮動切換器。

**Architecture:** `SettingsPageComponent` 直接使用 theme-pack 的 `ThemeService`、`texture` 與 `COLOR_THEMES`，讓既有 signal、DOM dataset 與 localStorage 行為保持單一來源。app root 不再載入或渲染 `ThemeSwitcherComponent`；theme-pack 元件本身保留供其他 app 使用。

**Tech Stack:** Angular standalone components, Angular Material-independent buttons, signals, Vitest.

---

### Task 1: 為設定頁外觀控制補上失敗測試

**Files:**
- Modify: `apps/admin/src/app/features/settings/pages/settings-page.component.spec.ts`

**Step 1: Write the failing tests**

加入測試確認設定頁顯示「外觀設定」、「質地」、「配色」，並確認存在 theme-pack 的每個 texture/color option。加入測試點擊配色與質地按鈕後，`ThemeService.theme()` / `paradigm()` 更新且對應按鈕具有 `aria-pressed="true"`。

**Step 2: Run test to verify it fails**

Run: `npx nx test admin`

Expected: FAIL，因目前設定頁只有「設定功能建置中」，沒有外觀控制。

### Task 2: 將主題控制搬入設定頁

**Files:**
- Modify: `apps/admin/src/app/features/settings/pages/settings-page.component.ts`
- Modify: `apps/admin/src/app/features/settings/pages/settings-page.component.html`
- Modify: `apps/admin/src/app/features/settings/pages/settings-page.component.scss`

**Step 1: Write minimal implementation**

在 standalone component imports 加入 `ThemeService`、`texture`、`COLOR_THEMES`；建立 protected handlers `onParadigm()`、`onTheme()`。模板以兩組 `@for` 渲染選項按鈕，使用 `aria-pressed` 與 active class，並保留原 theme switcher 的繁體中文文案與可及性語意。

**Step 2: Run test to verify it passes**

Run: `npx nx test admin`

Expected: 設定頁測試與全 admin unit tests PASS。

### Task 3: 移除 app shell 浮動切換器

**Files:**
- Modify: `apps/admin/src/app/app.ts`
- Modify: `apps/admin/src/app/app.html`
- Test: `apps/admin/src/app/app.spec.ts`（若現有測試需要因 import 變更調整）

**Step 1: Write minimal implementation**

移除 `ThemeSwitcherComponent` import、standalone imports 項目與 `<app-theme-switcher />` 標記；保留 `ThemeService` app initializer，確保初始主題仍從 localStorage 還原。

**Step 2: Run tests**

Run: `npx nx test admin`

Expected: 全部 unit tests PASS，且 app root 不再建立浮動 theme switcher。

### Task 4: 品質驗證

**Files:**
- No additional source changes expected.

**Step 1: Run focused lint**

Run: `npx eslint apps/admin/src/app/features/settings/pages/settings-page.component.ts apps/admin/src/app/features/settings/pages/settings-page.component.spec.ts apps/admin/src/app/app.ts`

Expected: 無 error。

**Step 2: Run tests**

Run: `npx nx test admin`

Expected: 全部測試通過。

**Step 3: Check diff**

Run: `git diff --check`

Expected: 本次修改沒有 whitespace error；不納入工作樹其他既存修改。

