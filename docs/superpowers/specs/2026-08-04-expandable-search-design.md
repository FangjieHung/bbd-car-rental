# Topbar 可展開搜尋框設計 Spec

**日期**：2026-08-04
**範圍**：`apps/admin` 的 `PageToolbarComponent` 搜尋框改為可展開／收合：收合態 44×44 圓形只顯示放大鏡，點按展開為膠囊形輸入框並取得焦點（手機需喚起鍵盤），再點放大鏡清空並收回。
**前提**：純前端、繁中、Angular 22 zoneless + signal。toolbar 已透過 `HeaderToolbarSlot` 投影進 topbar（見 `apps/admin/src/app/layout/header/header-toolbar-slot.ts`）。
**上游**：commit `f33e58d`（page-toolbar 投影到 topbar，與頁面標題同一列）。

---

## 1. 目標與範圍

### 這輪要做

- `PageToolbarComponent` 的搜尋框改為可展開／收合的自訂元素，**移除 `mat-form-field` 依賴**。
- 展開時同步 focus input，確保 iOS Safari 喚起軟鍵盤。
- 補上 `page-toolbar.component.spec.ts`（目前無測試）。
- i18n（`core/i18n/zh-tw.ts`）：複用既有的 `common.search`、`common.clearSearch`；
  新增 `common.collapseSearch`（值：「收合搜尋」）供展開態的放大鏡按鈕使用。

### 這輪不做

- 不動 `FilterSelectComponent`（維持 Material filled field）。搜尋框與篩選器形態不同（膠囊 vs 下拉），視覺不需強求一致；若日後覺得突兀再另案統一。
- 不動那 7 個使用 `app-page-toolbar` 的頁面：元件對外 API（`query`、`placeholder`、`showSearch`、`activeFilterCount`、`clearAll`）完全不變。
- 不做搜尋歷史、建議清單、debounce 調整。

---

## 2. 行為規格

兩個狀態（收合／展開），四個轉換：

| 觸發 | 收合 → 展開 | 展開 → 收合 |
|---|---|---|
| 點放大鏡按鈕 | 展開 ＋ 同步 focus input | **清空文字** ＋ 收合 |
| input 失焦（blur） | — | 僅在 `query()` 為空時收合；有文字則維持展開 |
| Esc 鍵 | — | 清空文字 ＋ 收合 |
| 點 ✕ 清除鈕 | — | 只清空文字，**維持展開且保持 focus** |

設計意圖：

- **✕ 與放大鏡刻意不同結果**。✕ 是「我要重打」，游標留在框內；放大鏡是「我搜完了」，整個收起來。
- **Esc 採單一行為**（清空＋收合），不做兩段式（第一次清空、第二次收合）。少一條規則要記。
- **失焦不收合有文字的框**，避免使用者點別處就丟失輸入；同時空框失焦自動收合，不留下佔版面的空欄位。
- 收合永遠伴隨清空，因此不存在「搜尋生效但看不到搜尋框」的隱形過濾狀態。

### 斷點

所有螢幕尺寸行為一致（皆可收合），無斷點差異的狀態機。僅展開後的寬度隨斷點不同，見 §4。

---

## 3. 為什麼不用 mat-form-field

### 3.1 Material 的功能已被逐項關閉

| `mat-form-field` 提供 | 現況 |
|---|---|
| 浮動 label | 已移除（改用 placeholder） |
| hint / error / 驗證 | 未使用 |
| subscript 空間 | 以 `subscriptSizing="dynamic"` 關閉 |
| 預設 56px 高度 | 以 density overrides 壓成 44px |
| filled 背景 | 唯一實際使用的部分 |

除了一塊底色之外，其餘功能全數關閉，卻仍需承擔三層內部 DOM
（`.mat-mdc-text-field-wrapper` / `.mat-mdc-form-field-flex` / `.mat-mdc-form-field-infix`）
與其固定 padding。改為原生元素後，`header.component.scss` 中為了壓縮高度而加的
`mat.form-field-overrides` 亦可一併移除。

### 3.2 iOS 軟鍵盤限制（決定性因素）

iOS Safari 僅在**使用者手勢的同步執行流程**中呼叫 `focus()` 才會喚起軟鍵盤。一旦跨越
非同步邊界（`setTimeout`、`afterNextRender`、等待下一輪變更偵測），input 會取得焦點但
鍵盤不彈出。

因此以下做法**不可採用**：

- 用 `@if` 在收合／展開間切換兩個不同元素——展開後 input 是新建立的，focus 必然發生在
  非同步的 render 之後。
- 收合態將 input 設為 `display: none`——不可 focus。
- 收合態將 input 設為 `width: 0`——零寬度元素的 focus 行為在 iOS 上不保證。

採用的做法是 input 常駐 DOM 且**尺寸恆定**，僅由容器裁切（見 §4）。

---

## 4. DOM 結構與樣式策略

```html
<div class="search" [class.search--expanded]="expanded()">
  <button class="search__toggle" type="button">🔍</button>   <!-- 44×44，恆常可見可點 -->
  <input #searchInput class="search__input" />               <!-- 固定寬度，收合時被裁掉 -->
  @if (query()) { <button class="search__clear" type="button">✕</button> }
</div>
```

### 4.1 收合原理

只有容器寬度變動，搭配 `overflow: hidden`：

- 收合：容器 `width: 44px`，input 與 ✕ 被裁切在可視範圍外。
- 展開：容器放寬，input 與 ✕ 露出。

input 的尺寸自始至終不變，確保它永遠是有實體大小、可正常 focus 的元素。

### 4.2 形狀

`border-radius: 999px` 恆定不變。收合時容器為 44×44 正圓，展開時自然拉長為膠囊，形狀轉換
連續，無須對 `border-radius` 做動畫。

### 4.3 寬度

| 狀態 | 桌面 | ≤640px |
|---|---|---|
| 收合 | `width: 44px` | `width: 44px` |
| 展開 | `width: 320px; max-width: 100%` | `width: 100%`（佔滿一列，將 actions 擠至下一列） |

收合態的 44px 在所有斷點一致。

寬度一律以 `width` 控制，不使用 `flex-basis`：本設計的動畫標的就是寬度，而瀏覽器對
`flex-basis` 的過渡遠不如 `width` 可靠（flex 容器重新分配空間時容易跳動）。父容器
（包住搜尋框與 actions 的 flex 列）需加上 `flex-wrap`，窄螢幕展開佔滿整列後 actions
才能被擠到下一列。

### 4.4 動畫

`transition: width 200ms ease`，與側欄收合的 200ms 一致。於
`@media (prefers-reduced-motion: reduce)` 下關閉。

### 4.5 顏色

全部使用 token，雙軸主題自動跟隨：

| 用途 | token |
|---|---|
| 容器底色 | `--mat-sys-surface-variant` |
| 輸入文字 | `--mat-sys-on-surface` |
| placeholder／圖示 | `--mat-sys-on-surface-variant` |
| focus 外框 | `--mat-sys-primary` |

focus 狀態以 `:focus-within` 繪製外框，取代 Material 原有的底線動畫。

---

## 5. 程式碼結構

改動集中於 `apps/admin/src/app/shared/ui/page-toolbar.component.{html,scss,ts}`。

```ts
// 不可用 viewChild.required：input 位於 @if (showSearch()) 內，
// showSearch() 為 false 時 required 會拋錯。
private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
readonly expanded = signal(false);

toggle(): void {
  if (this.expanded()) {
    this.query.set('');
    this.expanded.set(false);
    return;
  }
  this.expanded.set(true);
  // 必須同步呼叫：包進 setTimeout / afterNextRender 會導致 iOS 不喚起軟鍵盤。
  this.inputRef()?.nativeElement.focus();
}

collapseIfEmpty(): void {
  if (!this.query()) this.expanded.set(false);
}

onEscape(): void {
  this.query.set('');
  this.expanded.set(false);
}

clearKeepFocus(): void {
  this.query.set('');
  this.inputRef()?.nativeElement.focus();
}
```

- `expanded` 為元件內部狀態，不對外暴露 input／output。
- 既有對外 API 一律不變。
- `focus()` 的同步性以程式碼註解標記，避免日後被重構破壞。

---

## 6. 無障礙

- 放大鏡按鈕：`aria-label`（收合時為「搜尋」、展開時為「收合搜尋」）與 `aria-expanded`。
- input：`aria-label` 綁 `placeholder()`。
- ✕ 按鈕：`aria-label` 為 `common.clearSearch`（既有字串）。
- 三顆按鈕皆需 `type="button"`，避免未來被包進 form 時誤送出。
- 收合態下 input 雖在 DOM 中但視覺上被裁切，以 `[tabindex]="expanded() ? 0 : -1"` 避免鍵盤
  使用者 tab 進入不可見欄位。**不可改用 `aria-hidden`**：`aria-hidden` 的元素取得焦點屬於
  無障礙違規，而本設計必須能對該 input 呼叫 `focus()`（見 §3.2）。`tabindex="-1"` 只擋
  tab 巡覽，不影響程式呼叫 `focus()`。

---

## 7. 測試

新增 `apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`，涵蓋：

1. 初始為收合狀態。
2. 點放大鏡 → `expanded()` 為 true。
3. 展開且有文字時點放大鏡 → `query()` 清空且 `expanded()` 為 false。
4. 點 ✕ → `query()` 清空但 `expanded()` 維持 true。
5. Esc → `query()` 清空且 `expanded()` 為 false。
6. blur 且 `query()` 為空 → 收合。
7. blur 但 `query()` 有值 → 維持展開。

jsdom 無法驗證軟鍵盤喚起與真實 focus 行為，該部分於瀏覽器實測：桌面 Chrome 驗證展開後
游標進入 input；iOS 若無實機則記錄為未驗證項，不宣稱通過。

---

## 8. 邊界情況

- **路由切換**：每個頁面各自持有 `app-page-toolbar` 實例，切頁時元件銷毀重建，`expanded`
  自然回到收合，無需額外處理。
- **`showSearch()` 為 false**：整個搜尋區塊不渲染，`expanded` 狀態無作用。
- **篩選器列**：`.filters` 是獨立的 flex item（`order: 2`、`flex-basis: 100%`），不受搜尋框
  展開收合影響。
- **✕ 按鈕的存在條件**：僅 `query()` 非空時渲染，因此收合態（必為空）不會有 ✕。
