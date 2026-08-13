# Data Table 批次選取與操作設計

## 目標

為共用 `lib-data-table` 新增可由頁面獨立開關的資料列選取功能。啟用後，表格第一欄顯示 checkbox，表頭提供全選／取消全選與部分選取狀態，並在有任何資料被選取時顯示批次操作工具列。

## 使用者行為

- `selectable` 預設為 `false`，既有頁面不改變外觀與行為。
- 啟用選取後，每列第一欄顯示 checkbox，表頭 checkbox 控制目前 `rows()` 的全選與取消全選。
- 表頭 checkbox 支援 checked、unchecked、indeterminate 三種狀態。
- 選取狀態以既有 `rowId` 識別資料列；當輸入資料變動時，清理已不存在的選取項目。
- 只要有至少一筆資料被選取，就顯示批次工具列與批次按鈕；沒有選取資料時完全隱藏。
- 原本的「匯出全部」按鈕保留，繼續匯出目前表格全部資料。
- 新增「只匯出已勾選的資料」按鈕，只匯出目前已選取資料。
- 批次刪除只透過事件回傳已選資料，由頁面負責確認、呼叫 store 與清理結果。
- action slot 讓各頁面插入自訂批次操作，例如批次變更狀態或批次指派。

## API 設計

新增 table inputs/outputs：

- `selectable: boolean`，預設 `false`。
- `selection: readonly T[]`，支援頁面以 signal 綁定目前選取資料。
- `selectionChange: Output<readonly T[]>`，選取列變更時回傳資料列。
- `batchDelete: Output<readonly T[]>`，按下共用刪除按鈕時回傳已選資料。

新增 labels 文案欄位，保持 UI 元件不內建使用者可見字串：

- 表頭全選／取消全選的 aria label。
- 資料列選取的 aria label。
- 批次刪除、只匯出已勾選資料與已選筆數文案。

新增 `dtBatchActions` content slot，slot context 的 `$implicit` 為目前已選資料，供頁面插入自訂按鈕。

## 元件資料流

`rows()` 與 `rowId()` 產生目前可操作的資料列集合；元件以 row id 維護內部 selected id set，並透過 `selectionChange` 對外同步資料列。輸入 `selection` 變更時同步內部 set，避免頁面刪除或重設資料後殘留無效選取。

全選只作用於目前 `rows()`，不是跨頁或跨查詢條件的全域選取。匯出全部沿用既有 `exportRows`；選取匯出則以目前選取資料呼叫相同匯出流程，並使用獨立的 export name suffix。

custom escape-hatch table 維持現有 head/body template 行為；本次功能先支援標準模式，避免自動修改使用者自訂 DOM。若 custom mode 啟用 selectable，元件應提供明確的限制或保持既有 custom template 責任邊界。

## Accessibility 與樣式

- 使用原生 `<input type="checkbox">`，提供可讀的 `aria-label`。
- 表頭 checkbox 以 `indeterminate` 表示部分選取。
- checkbox 保留可見 focus，觸控目標符合現有 UI 規範。
- 選取欄在桌面與手機 cards/scroll 模式都保留，不加入資料欄位匯出內容。
- 批次工具列沿用既有 table toolbar token 與按鈕風格。

## 測試範圍

- 預設未啟用時不渲染選取欄與批次工具列。
- 啟用時渲染首欄 checkbox、表頭 checkbox 與批次工具列。
- 單列勾選、取消勾選、全選、取消全選與 indeterminate 狀態。
- `selectionChange` 回傳正確資料列；輸入 rows 變動時移除無效選取。
- 批次刪除事件只回傳已選資料。
- 匯出全部仍匯出所有 rows；選取匯出只匯出已選 rows。
- custom mode 與既有 mobile DOM/匯出測試不回歸。

