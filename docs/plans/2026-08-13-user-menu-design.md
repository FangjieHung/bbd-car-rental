# 使用者選單與登入骨架設計

## 目標

完成 admin 側邊欄使用者 `mat-menu`，提供「設定」與「登出」兩個可用項目，並建立最小可用的設定頁、登入頁與本地 session 骨架。

## 範圍

- `設定` 導向 `/settings`，顯示設定頁佔位內容。
- `登出` 清除 `cr.auth.session`，導向 `/login`。
- `/login` 提供佔位登入畫面；按下進入系統後建立簡單本地 session 並回到 `/dashboard`。
- 不實作真實帳號驗證、後端串接、權限守衛或角色權限。
- 不改動既有資料 repository 的 localStorage 資料。

## 架構與資料流

`SideNavComponent` 負責顯示 menu，透過 `RouterLink` 導向設定頁，透過注入的 `AuthService` 處理登出。`LoginPageComponent` 呼叫同一個 `AuthService` 建立 demo session。`AuthService` 只封裝 `cr.auth.session` 的 localStorage 讀寫與 router 導頁，讓後續接真實登入時不需把 session 邏輯散落在元件中。

路由新增 `/login` 與 `/settings`，兩者皆為 lazy-loaded standalone component。既有 `/dashboard` 等路由暫不加 guard，確保這次骨架不影響目前開發中的頁面。

## UI 與可及性

- 選單文案使用繁體中文：「設定」、「登出」。
- icon 使用現有專案約定的 Google Material Symbols / 純文字 icon，不新增 `mat-icon`。
- menu button 與 menu item 保留 Material 的鍵盤操作與 focus 行為。
- 登入頁與設定頁提供清楚的頁面標題和可理解的空狀態文案。

## 錯誤處理

localStorage 不可用或內容格式不正確時，`AuthService` 將視為沒有 session；登出仍應嘗試移除 key 並導向 `/login`。本次不顯示後端驗證錯誤。

## 測試策略

- `SideNavComponent`：確認 menu 顯示兩個項目、設定連結指向 `/settings`，點擊登出會呼叫 auth service。
- `AuthService`：確認 login 寫入 session、logout 移除 session 並導向 `/login`。
- `LoginPageComponent`：確認登入按鈕建立 session 並導向 dashboard。
- `SettingsPageComponent`：確認佔位標題與文案存在。
- 執行 admin unit tests、lint 與 production build。

