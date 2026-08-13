# 日曆當日明細改為 Responsive 面板設計 Spec

**日期**：2026-08-14
**範圍**：`calendar-view` 的「當日明細」清單，從目前的行內（inline，選了日期就往下擠出一段）改為 responsive 面板：`<1024px` 從底部貼底彈出（像 dialog）、`≥1024px` 改用右側 aside 並排推擠版面（push，非覆蓋）。新增 `libs/ui` 的 `ResponsivePanelComponent` 作為承載容器。
**前提**：純前端、繁中、Angular 22 zoneless + signal。`BreakpointObserver`（`@angular/cdk/layout`）已是專案既有慣例（`app.ts` 的側欄斷點）。
**相關但不同的既有 spec**：`docs/superpowers/specs/2026-08-06-split-view-edit-panel-design.md` 的 `SplitPanelComponent`（尚未實作）。該元件是給「編輯表單」用：手機全螢幕覆蓋、桌面固定 420px 並排。本次的使用情境是「唯讀清單快速瀏覽」：手機貼底、桌面彈性寬。兩者行為不同、使用情境不同，**刻意分開做成兩個元件**，不合併成同一個可配置元件（見第 2 節）。

---

## 1. 目標與範圍

### 這輪要做

- 新增 `libs/ui` 的 `ResponsivePanelComponent`：`<1024px` 貼底彈出（類 dialog）、`≥1024px` 右側並排推擠版面。
- `calendar-view` 改用此元件包裝「當日明細」清單，版面從行內堆疊改為橫向（桌面）／貼底（手機）。
- 面板加上明確的關閉動作（關閉鈕／Esc／手機遮罩點擊），關閉只收起面板、**不**清除行事曆格子的選取狀態。

### 這輪不做

- 不動 `SplitPanelComponent`（2026-08-06 spec）或 `add-ons` 頁的任何實作——那是獨立、尚未動工的工作。
- 不做面板寬度可拖曳調整、不做多面板堆疊。
- 不改 `DataTableComponent` 或表格相關行為（與本次無關）。
- 不改 `timeline-view` 或其他 dispatch 子頁面。

---

## 2. 架構：兩個元件為什麼不合併

| | `ResponsivePanelComponent`（本次新增） | `SplitPanelComponent`（既有 spec，尚未實作） |
|---|---|---|
| 用途 | 唯讀清單快速瀏覽 | 編輯表單 |
| 手機（`<1024px`） | 貼底彈出，`max-height` 上限＋內部捲動 | 全螢幕覆蓋 |
| 桌面（`≥1024px`） | 右側並排，**彈性寬**（`clamp(320px, 32vw, 480px)`） | 右側並排，**固定 420px** |
| 語意重量 | 手機才是 modal；桌面純輔助區域 | 兩種寬度都可能承載表單焦點流程 |

若把兩者塞進同一個可配置元件，等於用一堆 boolean/enum input（`mobileMode: 'sheet' \| 'overlay'`、`widthMode: 'fixed' \| 'flexible'`）去分岔內部樣式與行為，維護者要先讀懂四種組合裡哪些是真的被使用，才敢動樣式。兩個各司其職的小元件，各自的行為一看就懂、可獨立測試，符合現有 `SplitPanelComponent` spec 已建立的「元件只做一件事」原則。

沿用該 spec 已驗證過的三層分工：

| 層 | 元件 | 知道什麼 | **不**知道什麼 |
|---|---|---|---|
| 面板 | `ResponsivePanelComponent`（新增） | 自己多寬、怎麼開關、窄螢幕怎麼貼底 | 裡面裝的是清單還是別的、行事曆資料 |
| 接線 | `calendar-view` | 哪一天被選、清單資料哪來、關閉後要不要保留選取 | 面板怎麼動畫、breakpoint 數字 |

---

## 3. 版面與斷點行為

### 3.1 斷點

單一斷點 `max-width: 1024px`，與 `SplitPanelComponent` spec 的斷點一致（沿用同一條線，降低使用者心智負擔）。JS 偵測（`BreakpointObserver.observe(['(max-width: 1024px)'])`）與 CSS media query 須同為此值，避免語意與視覺不同步。

### 3.2 兩段行為

- **`<1024px`（窄）**：面板 `position: fixed; inset-inline: 0; bottom: 0; max-height: 70vh; overflow-y: auto`，以 `transform: translateY()` 滑入；後方有遮罩 `<div>`，點遮罩關閉；`role="dialog"`、`aria-modal="true"`、焦點陷阱、開啟時鎖住 `document.body` 捲動。
- **`≥1024px`（寬）**：面板是行事曆容器裡的一個 flex 子項，`flex: 0 1 clamp(320px, 32vw, 480px)`；行事曆格線容器改為 `flex: 1 1 auto; min-width: 0`，讓格線隨可用空間縮窄（既有 `repeat(7, minmax(0,1fr))` 欄位定義本就支援縮窄，不需額外處理）。無遮罩、無 `aria-modal`、無焦點陷阱——可自由在格線與面板間 Tab。

### 3.3 開啟時不渲染背景外的內容

`open=false` 時整段投影內容不渲染（`@if`），避免清單在背景保持存活；與 `SplitPanelComponent` spec 的理由一致。

---

## 4. 互動：關閉來源與選取狀態的關係

現行 `calendar-view` 只有一個 `selected` signal：選了日期＝清單顯示，沒有獨立關閉的概念。改為面板後，關閉面板**不**應清除行事曆格子的選取樣式（灰底標示），這樣使用者才知道自己剛才在看哪一天。

因此拆成兩個 signal：

```ts
readonly selected = signal<Date | null>(null);   // 行事曆格子的選取狀態，不變
readonly panelDismissed = signal(false);          // 使用者主動關閉面板，但未清除選取
readonly panelOpen = computed(() => this.selected() !== null && !this.panelDismissed());
```

- 點任一天（含目前已選中那天）：`selected.set(d); panelDismissed.set(false)`——一律（重新）開啟面板。
- 面板關閉（關閉鈕／Esc／窄螢幕遮罩）：`panelDismissed.set(true)`——格子選取樣式不變，僅面板收起。
- 換月（`shiftMonth`）：現行邏輯本就會 `selected.set(null)`，連帶讓 `panelOpen()` 為 false，`panelDismissed` 的殘留值不影響下次選取（下次點日期會重新設為 `false`）。

---

## 5. `ResponsivePanelComponent` API

放在 `libs/ui/src/lib/responsive-panel/`，selector `lib-responsive-panel`（沿用 lib 前綴慣例）。

```ts
/** 面板是否開啟。 */
readonly open = input(false);

/** 面板標題（顯示在頂部）。 */
readonly heading = input('');

/** 關閉鈕的 aria-label。libs/ui 不內建字串，由使用端傳入。 */
readonly closeLabel = input.required<string>();

/** 使用者要求關閉（點關閉鈕、按 Esc、或點窄螢幕的遮罩）。 */
readonly closed = output<void>();
```

行為（與第 3 節對應）：

- 開啟時記住目前焦點，下一個 render 將焦點移到面板內第一個可聚焦元素（沒有時為關閉鈕）；關閉時還原焦點，若原元素已被移除則不強制聚焦。
- Esc 鍵發出 `closed`（窄、寬螢幕皆可，寬螢幕下面板本就在版面中，Esc 關閉是常見且無害的捷徑）。
- 窄螢幕遮罩點擊發出 `closed`；寬螢幕沒有遮罩，此互動不存在。
- **不內建任何使用者可見字串**，與 `SplitPanelComponent` spec 同一約束。

---

## 6. `calendar-view` 頁面接線

### 6.1 模板結構調整

容器從目前的行內堆疊：

```html
<div class="calendar-view">
  <div class="calendar-view__grid">...</div>
  @if (selected(); as sel) {
    <div class="mt-4">...當日明細...</div>
  }
</div>
```

改為橫向容器（`calendar-view__layout`，`display: flex; gap`），格線與面板為並列的 flex 子項：

```html
<div class="calendar-view">
  <div class="calendar-view__toolbar">（現行 toolbar，不變）</div>
  <div class="calendar-view__layout">
    <div class="calendar-view__grid">（現行月曆格線，不變）</div>
    <lib-responsive-panel
      [open]="panelOpen()"
      [heading]="panelHeading()"
      [closeLabel]="t.common.closePanel"
      (closed)="panelDismissed.set(true)"
    >
      @if (selected(); as sel) {
        <!-- 現行當日明細清單內容（§dayBookings 的 @if/@else 區塊）原封不動搬進來，只是外層容器換成 ng-content -->
      }
    </lib-responsive-panel>
  </div>
</div>
```

窄螢幕下 `ResponsivePanelComponent` 自己會切到 `position: fixed`，脫離文件流，因此 `calendar-view__layout` 的 flex 排列只在寬螢幕真正生效；窄螢幕下面板視覺上蓋在格線之上，不影響 `calendar-view__layout` 本身的排版。

### 6.2 元件邏輯調整

- 新增 `panelDismissed` signal 與 `panelOpen` computed（見第 4 節）。
- 新增 `panelHeading` computed：`selected()` 為某天時回傳 `${t.dispatch.dayDetail}（${sel.getMonth() + 1}/${sel.getDate()}）`（與現行 `<h2>` 內文字完全一致，只是從模板內聯改為 computed）；為 `null` 時回傳空字串。
- 新增 `selectDay(d: Date): void` 方法取代日期格子目前的 `(click)="selected.set(d)"`，方法內做 `this.selected.set(d); this.panelDismissed.set(false);` 兩件事，避免模板內塞多語句。

---

## 7. i18n

`zh-tw.ts` 的 `common` 區塊追加一個鍵（**只在 common 內追加，不動其他區塊**）：

| key | 值 |
|---|---|
| `closePanel` | 關閉面板 |

此鍵與 `SplitPanelComponent` spec（2026-08-06）原先規劃要加的 `closePanel` 是同一個字串，本次先加上；日後該 spec 實作時直接複用，不會產生重複鍵。

---

## 8. 檔案結構

```
libs/ui/src/lib/
  responsive-panel/
    responsive-panel.component.ts      # 新增
    responsive-panel.component.html    # 新增
    responsive-panel.component.scss    # 新增
    responsive-panel.component.spec.ts # 新增
  ../index.ts                          # 修改：匯出 ResponsivePanelComponent

apps/admin/src/app/features/dispatch/calendar-view/
  calendar-view.component.ts    # 修改：panelDismissed / panelOpen、日期點擊邏輯
  calendar-view.component.html  # 修改：改用 <lib-responsive-panel> 包裝當日明細
  calendar-view.component.scss  # 修改：新增 .calendar-view__layout（flex 容器）
  calendar-view.spec.ts         # 修改：新增本次互動的測試（見第 9 節）

apps/admin/src/app/core/i18n/zh-tw.ts   # 修改：common 追加 closePanel
```

---

## 9. 測試

`responsive-panel.component.spec.ts`：

- `open` 為 `false` 時不渲染投影內容；為 `true` 時渲染。
- 點關閉鈕發出 `closed`。
- 按 Esc 發出 `closed`。
- 關閉鈕的 `aria-label` 來自 `closeLabel` input（守「不內建字串」）。
- 窄螢幕（mock `BreakpointObserver` 回傳 matches）：具 `role="dialog"`、`aria-modal="true"`；點遮罩發出 `closed`；開啟後焦點移入面板，關閉後回到觸發元素。
- 寬螢幕：無 `aria-modal`；無遮罩元素可點。

`calendar-view.spec.ts`（既有檔案，擴充）：

- 點某天：面板開啟（`panelOpen()` 為 true）且顯示該天清單。
- 點關閉：面板收起，但該天格子仍保留選取樣式（`calendar-view__day--selected`）。
- 關閉後再點同一天：面板重新開啟。
- 面板關閉時點另一天：面板開啟並顯示新選中那天的清單。
- 換月：面板收起（沿用現行 `selected.set(null)` 行為）。

---

## 10. 驗收

- `npx nx test ui` / `npx nx test admin` 全過。
- `npx nx build admin` 成功。
- `npm run lint:theme` 通過（新樣式只用 `--mat-sys-*` token）。
- 瀏覽器實測：1280px 並排（格線隨面板寬度縮窄）、900px 與 500px 貼底彈出（含遮罩、Esc、焦點陷阱）三種寬度各確認一次；關閉面板後格子選取樣式仍在；連續切換不同天時面板內容正確更新。
