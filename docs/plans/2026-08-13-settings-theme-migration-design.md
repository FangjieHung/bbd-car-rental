# 設定頁外觀功能搬移設計

## 目標

將 `app-theme-switcher` 的質地與配色功能搬到 `/settings` 頁面，並移除 app shell 右下角的浮動切換器。

## 設計

- `SettingsPageComponent` 直接注入既有 `ThemeService`。
- 沿用 `libs/theme-pack` 已匯出的 `texture` 與 `COLOR_THEMES` 選項，不複製選項資料。
- 設定頁以兩組按鈕呈現「質地」與「配色」，目前選取項目使用 `aria-pressed` 與 active style 表示。
- 點擊選項直接呼叫 `ThemeService.setParadigm()` / `setTheme()`；既有 signal、`data-*` 與 localStorage 保存行為不變。
- 從 `apps/admin/src/app/app.ts`、`app.html` 移除 `ThemeSwitcherComponent`。
- 保留 theme-pack 內的 `ThemeSwitcherComponent`，不影響其他 app 的重用可能性。

## 測試與風險

- 設定頁測試確認外觀選項顯示、目前項目狀態，以及點擊後呼叫既有 service。
- 既有 ThemeService 與 ThemeSwitcherComponent 測試維持通過。
- 不新增主題種類、不改變 localStorage key、不處理登入權限。

