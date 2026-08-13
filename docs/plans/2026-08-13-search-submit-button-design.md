# 搜尋 Submit Button 設計

## 目標

在 `PageToolbarComponent` 的搜尋 input 中，只有輸入非空白內容時顯示 submit button；點擊按鈕或按下 Enter 時，正式觸發搜尋事件，讓目前的前端篩選與未來的後端查詢可以共用同一個觸發點。

## 設計

- 保留既有的 `query` model，維持目前頁面以 query 做即時顯示／篩選的相容性。
- 新增 `searchSubmit` output，送出前對 query 執行 `trim()`。
- query 為空或只含空白時不顯示 submit button，也不觸發搜尋事件。
- submit button 使用語意化的 `type="button"`，Enter 由 input 的 keydown handler 觸發，避免未來包在 form 時產生重複送出。
- 送出後保留搜尋文字與展開狀態，方便使用者查看或修改條件。
- 使用既有 i18n 字串；若沒有適合的 aria-label，新增搜尋送出的繁中標籤。

## 元件與資料流

`input` → `query` model → 使用者點擊 submit／按 Enter → `searchSubmit.emit(trimmedQuery)` → 父層可選擇執行前端篩選或呼叫後端 API。

## 錯誤與可及性

- 空白 query 不送出，避免無意義的後端請求。
- submit button 必須是可鍵盤操作的原生 button，提供明確 aria-label 與可見 focus 狀態。
- 不新增非必要動畫；現有搜尋容器的 reduced-motion 規則維持不變。

## 測試範圍

- 無文字時 submit button 不存在。
- 有文字時 submit button 顯示。
- 點擊 submit emits trim 後的文字。
- Enter emits trim 後的文字。
- 空白文字不 emit。
- 送出後 query、展開狀態與既有 clear 行為維持不變。
