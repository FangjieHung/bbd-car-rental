# 使用者選單與登入骨架 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成 admin 側邊欄使用者選單的「設定」與「登出」，並建立可供導頁的設定頁、登入頁與本地 session 骨架。

**Architecture:** 在 `apps/admin/src/app/core/auth` 建立小型 `AuthService`，集中管理 `cr.auth.session` localStorage key 與 Router 導頁。Side nav 只負責 menu UI，設定項目使用 router link，登出項目呼叫 service。登入與設定頁以 standalone lazy-loaded components 加入既有 admin routes；本次不新增 route guard。

**Tech Stack:** Angular standalone components 19+, Angular Router, Angular Material menu/button, Vitest。

---

### Task 1: 建立 AuthService 的失敗測試

**Files:**
- Create: `apps/admin/src/app/core/auth/auth.service.spec.ts`

**Step 1: Write the failing test**

建立 TestBed，測試 `login()` 將 demo session 寫入 `cr.auth.session`，以及 `logout()` 移除 session 並呼叫 Router 導向 `/login`。Router 使用 `provideRouter([])`，以 spy 驗證 navigate。

**Step 2: Run test to verify it fails**

Run: `npx nx test admin --runInBand`

Expected: FAIL，因為 `./auth.service` 尚不存在。

### Task 2: 實作最小 AuthService 並讓測試通過

**Files:**
- Create: `apps/admin/src/app/core/auth/auth.service.ts`

**Step 1: Write minimal implementation**

使用 `inject(Router)`；`login()` 寫入 `{ user: 'admin' }` 或等價的最小 session，`logout()` 移除 `cr.auth.session` 後 `navigateByUrl('/login')`。讀取 localStorage 時遇到無效資料視為未登入，不讓格式錯誤阻斷頁面。

**Step 2: Run test to verify it passes**

Run: `npx nx test admin --runInBand`

Expected: AuthService 測試 PASS。

**Step 3: Commit**

```bash
git add apps/admin/src/app/core/auth/auth.service.ts apps/admin/src/app/core/auth/auth.service.spec.ts
git commit -m "feat(admin): add auth session skeleton"
```

### Task 3: 為使用者選單補上失敗測試

**Files:**
- Modify: `apps/admin/src/app/layout/side-nav/side-nav.component.spec.ts`

**Step 1: Write the failing tests**

沿用既有 TestBed 設定，加入 Router、AuthService provider。測試：

- menu 文字包含「設定」與「登出」，不再包含 `Item 1` / `Item 2`。
- 設定項目具有 `/settings` router link。
- 點擊登出項目會呼叫 `AuthService.logout()`。

**Step 2: Run test to verify it fails**

Run: `npx nx test admin --runInBand`

Expected: FAIL，因為現有 menu 尚未包含目標文字與互動。

### Task 4: 實作使用者選單

**Files:**
- Modify: `apps/admin/src/app/layout/side-nav/side-nav.component.ts`
- Modify: `apps/admin/src/app/layout/side-nav/side-nav.component.html`

**Step 1: Write minimal implementation**

在 standalone imports 加入 `MatMenuModule`、`RouterLink` 與 `AuthService` 依賴；將 placeholder menu 改為：設定 `button mat-menu-item` 搭配 `[routerLink]="['/settings']"`，登出 `button mat-menu-item` 搭配 `(click)="auth.logout()"`。使用專案規範的 Material Symbols/文字 icon，不引入新的 `mat-icon`。

**Step 2: Run test to verify it passes**

Run: `npx nx test admin --runInBand`

Expected: SideNav 與 AuthService 測試 PASS。

### Task 5: 建立設定頁與登入頁的失敗測試

**Files:**
- Create: `apps/admin/src/app/features/settings/pages/settings-page.component.spec.ts`
- Create: `apps/admin/src/app/features/auth/pages/login-page.component.spec.ts`

**Step 1: Write failing tests**

設定頁測試標題與佔位文案。登入頁測試顯示登入標題，點擊「進入系統」會呼叫 `AuthService.login()` 並導向 `/dashboard`。

**Step 2: Run tests to verify they fail**

Run: `npx nx test admin --runInBand`

Expected: FAIL，因為頁面元件尚不存在。

### Task 6: 實作設定頁與登入頁

**Files:**
- Create: `apps/admin/src/app/features/settings/pages/settings-page.component.ts`
- Create: `apps/admin/src/app/features/settings/pages/settings-page.component.html`
- Create: `apps/admin/src/app/features/settings/pages/settings-page.component.scss`
- Create: `apps/admin/src/app/features/auth/pages/login-page.component.ts`
- Create: `apps/admin/src/app/features/auth/pages/login-page.component.html`
- Create: `apps/admin/src/app/features/auth/pages/login-page.component.scss`

**Step 1: Write minimal implementation**

設定頁採 standalone component，提供「系統設定」標題與「設定功能建置中」佔位內容。登入頁採 standalone component，提供「登入」標題與按鈕；按鈕呼叫 `AuthService.login()` 後 `navigateByUrl('/dashboard')`。維持繁體中文與現有 token/樣式風格。

**Step 2: Run tests to verify they pass**

Run: `npx nx test admin --runInBand`

Expected: 新增頁面測試與既有測試全部 PASS。

### Task 7: 接上 lazy routes

**Files:**
- Modify: `apps/admin/src/app/app.routes.ts`

**Step 1: Add routes**

加入 `/login` 與 `/settings` 的 `loadComponent` lazy routes；保留既有 default redirect 與所有現有路由。

**Step 2: Run tests**

Run: `npx nx test admin --runInBand`

Expected: 全部 unit tests PASS。

### Task 8: 執行品質閘門

**Files:**
- No source changes expected.

**Step 1: Run lint**

Run: `npx nx lint admin`

Expected: PASS；若 lint 只回報本次觸及檔案的問題，修正後重跑。

**Step 2: Run production build**

Run: `npx nx build admin`

Expected: PASS，無 TypeScript、template 或 bundle error。

**Step 3: Review diff**

Run: `git diff --check` and `git status --short`

Expected: 本次新增/修改檔案無 whitespace error，且不包含未授權的既存檔案修改。

**Step 4: Commit implementation**

```bash
git add apps/admin/src/app/core/auth apps/admin/src/app/layout/side-nav apps/admin/src/app/features/auth apps/admin/src/app/features/settings apps/admin/src/app/app.routes.ts
git commit -m "feat(admin): complete user menu skeleton"
```

