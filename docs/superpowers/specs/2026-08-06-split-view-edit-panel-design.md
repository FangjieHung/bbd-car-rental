# 表格列點選開啟右側編輯面板（Split View）設計 Spec

**日期**：2026-08-06
**範圍**：點 DataTable 的某一列，右側滑出該筆資料的編輯表單；面板開合狀態放在 URL query param。本輪只做 `add-ons` 一頁作為試點。
**前提**：純前端、繁中、Angular 22 zoneless + signal。`libs/ui` 的 `DataTableComponent` 已上線（merge commit `140e4e2`），admin 9 頁 + affiliate 1 頁皆已使用。
**上游**：`docs/superpowers/specs/2026-08-04-responsive-data-table-design.md`

---

## 1. 目標與範圍

### 這輪要做

- `DataTableComponent` 新增列點選能力：`selectable`、`selectedId` 兩個 input 與 `rowClick` 一個 output。
- 新增 `libs/ui` 的 `SplitPanelComponent`：右側面板容器，寬螢幕並排、窄螢幕全螢幕覆蓋。
- 把 `AddOnDialogComponent` 的表單抽成不依賴 dialog 的 `AddOnFormComponent`，dialog 退化為薄殼。
- `add-ons` 頁接線：URL query param `?edit=<id>` / `?edit=new` ↔ 面板開合。
- 新增與編輯都走面板。

### 這輪不做

- **不動其餘 8 頁**（vehicles、bookings、customers、coupons、pricing、partners、maintenance、commission）與 affiliate。試點驗證體驗對了再推。
- 不移除 actions 欄的「編輯」按鈕。這次是試點，同時改兩件事會分不清體驗變化來自哪一個；該按鈕改為走和列點選相同的面板開啟流程，**不**保留第二套 dialog 編輯體驗。
- 不移除手機卡片的展開鈕。展開是唯讀快速瞄一眼、面板是要動手改，用途不同。
- 不做面板寬度可拖曳調整、不做多選、不做面板內的分頁瀏覽（上一筆／下一筆）。
- 不改 `libs/ui` 既有的匯出、逃生門模式、手機卡片轉換等任何行為。

---

## 2. 架構：三層各司其職

「點某一列」與「右側出現表單」是兩件不同的事，混在一起會讓元件邊界糊掉。

| 層 | 元件 | 知道什麼 | **不**知道什麼 |
|---|---|---|---|
| 表格 | `DataTableComponent`（既有，擴充） | 哪一列被選了、怎麼標示、點擊要不要發事件 | 有面板存在、面板裡是什麼、URL |
| 面板 | `SplitPanelComponent`（新增） | 自己多寬、怎麼關、窄螢幕怎麼覆蓋 | 裡面裝的是表單還是別的 |
| 接線 | `add-ons` 頁 | query param 叫什麼、id 對應哪筆資料、儲存後做什麼 | 面板怎麼動畫、表格怎麼標示 |

三者可獨立理解、獨立測試、獨立更換。

**為什麼不把面板做進 DataTable**：URL 參數名稱與「id 怎麼查回資料」只有頁面知道，包進去還是得從外面傳，反而更繞；逃生門模式下用不上；且未來若要在非表格場景（例如日曆點某時段開面板）重用，包在表格裡就複製不了。

**為什麼不做一個 `master-detail` 大元件把兩者包在一起**：現有 10 頁已直接使用 `DataTableComponent`，再包一層等於再遷移一次；且 master-detail 的變化多（面板寬度、捲動位置保留、多選），現在包死日後不好調。

---

## 3. 版面

### 3.1 兩個斷點，各管各的

| 斷點 | 管什麼 | 行為 |
|---|---|---|
| `max-width: 1024px` | **面板**（本 spec 新增） | 以上：右側並排；以下：全螢幕覆蓋 |
| `max-width: 640px` | **表格**（既有，不動） | 以下：表格轉卡片 |

兩者刻意不同。表格加上 420px 的面板，在 900px 視窗裡會讓表格只剩約 480px——8 欄的 `pricing` 完全無法閱讀，所以面板的線必須更寬。

因此存在三段行為，皆為預期：

- **≥1024px**：表格 + 右側面板並排
- **640–1024px**：表格仍是表格，面板全螢幕覆蓋在其上
- **<640px**：表格是卡片，面板全螢幕覆蓋

### 3.2 面板寬度

固定 `420px`，與現有 dialog 的 `width: '420px'` 相同。這樣同一張表單搬進面板時欄位排版不需重調。

表格區自動收窄。`DataTableComponent` 的 `.dt-wrap` 本就有 `overflow-x: auto`，欄位擠不下時橫向捲動而非換行。

### 3.3 窄螢幕的覆蓋

面板從右側滑入、蓋滿視窗，左上角一個返回鈕（關閉面板）。動畫用 `transform: translateX()`，避免觸發版面重排。

---

## 4. 互動：三種點擊目標的分工

`DataTableComponent` 加入列點選後，同一列上會有三種點擊目標：

| 目標 | 行為 |
|---|---|
| actions 欄的按鈕（編輯／刪除等） | 各自原本的行為，**不**開面板 |
| 手機卡片的展開鈕 | 展開次要欄位，**不**開面板 |
| 列／卡片的其餘任何位置 | 開面板 |

### 4.1 事件冒泡的處理方式

**不使用散落各處的 `stopPropagation`。** actions 欄的內容由頁面透過 `dtCell` 提供，要求每個頁面自己記得加 `stopPropagation` 一定會有人漏掉，而且漏掉的症狀是「點刪除時同時開了面板」。

改為在 `DataTableComponent` 的列點擊處理器內判斷點擊來源：

```ts
protected onRowClick(row: T, event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (target.closest('button, a, input, select, textarea, label')) return;
  this.rowClick.emit(row);
}
```

任何互動元素內的點擊都不視為「選取這一列」。這對頁面零要求，也自動涵蓋未來新增的按鈕。

### 4.2 為什麼需要 `selectable` input

只有真的要用列點選的頁面才該出現 `cursor: pointer` 與 hover 樣式——其餘 9 頁的列點下去沒反應，卻長得像可點，是壞體驗。

Angular 的 `output()` 沒有公開的「是否有人訂閱」查詢，因此改用明確的 `selectable` input 讓頁面主動開啟。未開啟時不發出事件、不加游標樣式、不加 hover。模板可以為了簡化結構而保留 `(click)` 綁定，但處理器必須在第一行返回；這是實作細節，不能改變上述可觀察行為。

---

## 5. `DataTableComponent` 的 API 新增

```ts
/** 開啟列點選：加上游標與 hover 樣式，點列時發出 rowClick。預設關閉。 */
readonly selectable = input(false);

/** 目前選中的列（值為 rowId() 的回傳）。用於在該列加上 is-selected 樣式。 */
readonly selectedId = input<unknown>(null);

/** 點了某一列（點在按鈕／連結／表單元素上時不會發出）。 */
readonly rowClick = output<T>();
```

模板的 `<tr>` 增加：

```html
<tr
  [class.is-expanded]="isExpanded(row)"
  [class.is-selectable]="selectable()"
  [class.is-selected]="selectable() && rowId()(row) === selectedId()"
  (click)="onRowClick(row, $event)"
>
```

**逃生門模式不支援列點選。** 該模式下 `tbody` 完全由頁面提供，`DataTableComponent` 不擁有 `<tr>`，無從掛載。若在逃生門模式下傳入 `selectable`，開發模式印出一則 `console.warn` 並忽略。

樣式（`--mat-sys-*` token）：

- `.is-selectable` → `cursor: pointer`；hover 時 `background: var(--mat-sys-surface-container)`
- `.is-selected` → `background: var(--mat-sys-secondary-container)`，桌機左緣 3px 指示條

---

## 6. `SplitPanelComponent`

放在 `libs/ui/src/lib/split-panel/`，selector `lib-split-panel`（沿用 lib 前綴慣例）。

```ts
/** 面板是否開啟。 */
readonly open = input(false);

/** 面板標題（顯示在頂部，也作為關閉鈕的 aria-label 前綴）。 */
readonly heading = input('');

/** 關閉鈕的 aria-label。libs/ui 不內建字串，由使用端傳入。 */
readonly closeLabel = input.required<string>();

/** 使用者要求關閉（點關閉鈕、按 Esc、或點窄螢幕的遮罩）。 */
readonly closed = output<void>();
```

內容以 `<ng-content>` 投影，面板**不知道自己裝的是什麼**。

行為：

- `open` 為 false 時不渲染內容（`@if`），避免表單在背景保持存活。
- Esc 鍵發出 `closed`。
- 窄螢幕（<1024px）覆蓋時，點面板外的遮罩發出 `closed`。
- 開啟時記住目前焦點，並在下一個 render 將焦點移到面板內第一個可聚焦元素（通常是表單第一欄；沒有時為關閉鈕）。關閉時還原焦點；若原元素已被刪除，則不強制聚焦。
- 寬螢幕的並排面板是補充區域，不宣告 modal，也不限制 Tab 在表格與面板間移動。窄螢幕覆蓋時才以 `role="dialog"`、`aria-modal="true"` 及焦點陷阱形成真正 modal；遮罩也只在此模式可要求關閉。

**不內建任何使用者可見字串**，與 `DataTableComponent` 同一約束。

---

## 7. 表單從 dialog 解耦

### 7.1 現況的問題

```ts
export class AddOnDialogComponent {
  readonly ref = inject(MatDialogRef<AddOnDialogComponent>);   // 綁死 dialog
  readonly data = inject<AddOn | null>(MAT_DIALOG_DATA);       // 綁死 dialog
  form = this.fb.group({ name: [this.data?.name ?? '', ...] });
}
```

這張表單只能活在 dialog 裡。

### 7.2 目標形狀

抽出 `AddOnFormComponent`（`apps/admin/src/app/features/add-ons/forms/add-on-form.component.ts`）：

```ts
readonly value = input<AddOn | null>(null);
readonly saved = output<AddOnFormResult>();
readonly cancelled = output<void>();
```

`AddOnDialogComponent` 退化為薄殼：

```html
<app-add-on-form [value]="data" (saved)="ref.close($event)" (cancelled)="ref.close()" />
```

面板內直接使用 `<app-add-on-form>`。**同一張表單、兩個容器**，不會變成兩份要各自維護的東西。

### 7.3 一個 dialog 從不需要面對的陷阱

Dialog 每次打開都是**全新實例**，所以 `form` 在 class field 初始化時讀一次 `this.data` 就夠了。

**面板可能不換實例、只換資料**——使用者點 A 再點 B，面板還在，只有 `value` 變了。

因此 `AddOnFormComponent` 必須**響應 `value` 的變化**重建或 patch 表單，不能只在初始化讀一次。寫錯的症狀是「點第二列時面板仍顯示第一列的資料」，而且在 dialog 模式下完全不會出現，等於在試點頁以外的地方看不見。

實作用 `effect()` 監看 `value()` 並 `form.reset(...)`。`value` 為 `null` 時重設為新增用的空白值。

---

## 8. URL 狀態流

### 8.1 參數形狀

```
/add-ons              沒開面板
/add-ons?edit=a1      面板開著，編輯 id 為 a1 的項目
/add-ons?edit=new     面板開著，空白新增表單
```

頁面讀 `edit` → 查 store → 傳給表單。關閉面板即移除該 param。

瀏覽器返回鍵天然關閉面板——這是把狀態放進 URL 最主要的回報，不需額外程式碼。

### 8.2 歷史紀錄分兩種情況

| 動作 | 導航方式 | 理由 |
|---|---|---|
| 沒開 → 開面板 | push | 返回鍵＝關面板，符合直覺 |
| 面板開著 → 點另一列 | **`replaceUrl: true`** | 點 A 再點 B，返回應回到「沒開面板」，而非回到 A |
| 關閉面板 | push | 與開啟對稱 |

不做第二條的話，瀏覽十筆資料要按十次返回才能離開本頁。

### 8.3 邊界情況

| 情況 | 處理 |
|---|---|
| `edit` 的 id 查不到（資料已刪、或他人傳來的舊連結） | 靜默移除 param、停在列表頁，**不跳錯誤訊息**——連結過期是正常情況，不是錯誤 |
| `edit` 值為空字串 | 同上，視為無效 |
| 儲存成功 | 關閉面板、移除 param（與現行 dialog 行為一致） |
| 儲存失敗（store 丟錯） | 面板保持開啟、表單內容不清空，snackbar 顯示錯誤（沿用該頁現行的 `catch` 寫法） |
| 在面板開啟時刪除該筆資料 | 面板關閉、移除 param |

---

## 9. 檔案結構

```
libs/ui/src/lib/
  data-table/
    data-table.component.ts      # 修改：selectable / selectedId / rowClick / onRowClick
    data-table.component.html    # 修改：<tr> 的 class 與 click 綁定
    data-table.component.scss    # 修改：.is-selectable / .is-selected
    data-table.component.spec.ts # 修改：新增列點選的測試
  split-panel/
    split-panel.component.ts     # 新增
    split-panel.component.html   # 新增
    split-panel.component.scss   # 新增
    split-panel.component.spec.ts# 新增
  ../index.ts                    # 修改：匯出 SplitPanelComponent

apps/admin/src/app/features/add-ons/
  forms/add-on-form.component.{ts,html}     # 新增：從 dialog 抽出的表單
  forms/add-on-form.component.spec.ts       # 新增：含 §7.3 的「value 變動時表單要跟著換」測試
  dialogs/add-on-dialog.component.{ts,html} # 修改：退化為薄殼
  pages/add-ons-page.component.{ts,html}    # 修改：URL 接線與面板
  pages/add-ons-page.component.spec.ts      # 新增（此頁目前無 spec 檔）

apps/admin/src/app/core/i18n/zh-tw.ts       # 修改：common 追加三個鍵，見下
```

`zh-tw.ts` 的 `common` 區塊追加（**只在 common 內追加，不動其他區塊**）：

| key | 值 |
|---|---|
| `closePanel` | 關閉面板 |
| `editPanelHeading` | 編輯 |
| `createPanelHeading` | 新增 |

### 9.1 路由與頁面層的補充決策

- `app.config.ts` 的 router 啟用 `withComponentInputBinding()`；`AddOnsPageComponent` 以 `edit = input<string | null>(null)` 接收 query param，不建立 RxJS 訂閱。
- 頁面維持 `ChangeDetectionStrategy.OnPush`，並以 `computed()` 推導 `editing` 與 `panelOpen`。`editing` 只能是有效 id 對應的資料；`edit=new` 是開啟空白表單的唯一特殊值。
- `openPanel()`、`openCreate()` 與 actions 欄的編輯鈕共用同一導航函式。只有「面板已開而切換目標」使用 `replaceUrl: true`；開啟、關閉與刪除後關閉都保留一筆可由返回鍵回復的歷史紀錄。
- `remove()` 成功後若刪除的是 `editing()?.id`，必須移除 `edit` param 關閉面板；刪除其他資料則保留目前面板。
- `SplitPanelComponent` 以 1024px 作為 modal 模式的唯一斷點。JavaScript 偵測與 CSS media query 必須同為 `max-width: 1024px`（包含 1024px），避免語意與視覺模式不同步。

---

## 10. 測試

`data-table.component.spec.ts` 新增：

- `selectable` 為 false 時，點列不發出 `rowClick`，且 `<tr>` 無 `is-selectable` class。
- `selectable` 為 true 時點列發出 `rowClick`，帶正確的那一列。
- 點 actions 欄內的按鈕**不**發出 `rowClick`（守 §4.1 的冒泡處理）。
- 點展開鈕不發出 `rowClick`，且展開行為照常。
- `selectedId` 命中的那一列有 `is-selected` class，其餘沒有。
- 逃生門模式下傳 `selectable` 不會綁定 click。

`split-panel.component.spec.ts`：

- `open` 為 false 時不渲染投影內容。
- 點關閉鈕發出 `closed`。
- 按 Esc 發出 `closed`。
- 關閉鈕的 aria-label 來自 `closeLabel` input（守「不內建字串」）。
- 開啟後焦點移入面板；關閉後回到仍存在的觸發元素。
- 窄螢幕時具有 dialog/modal 語意與焦點陷阱，寬螢幕時不具有 `aria-modal`。

`add-on-form.component.spec.ts`（新增）：

- `value` 從 A 換成 B 時，表單欄位跟著換成 B 的內容——**這是 §7.3 那個陷阱的守衛**，dialog 模式下永遠不會失敗，只有面板模式會。
- `value` 從某筆資料換成 `null` 時，表單重設為空白（新增用）。
- 按儲存發出 `saved` 並帶正確的表單值；表單無效時不發出。
- 按取消發出 `cancelled`。

`add-ons-page.component.spec.ts`（新增）：

- URL 有 `?edit=<有效 id>` 時面板開啟且表單帶入該筆資料。
- URL 有 `?edit=new` 時面板開啟且表單為空。
- URL 有 `?edit=<不存在的 id>` 時面板不開，且 param 被移除。
- 面板開啟時點另一列，導航使用 `replaceUrl`。
- 儲存成功後 param 被移除。
- 刪除目前正在編輯的資料後 param 被移除；刪除其他資料不關閉面板。

---

## 11. 驗收

- `npx nx test ui` / `npx nx test admin` 全過
- `npx nx build admin` 成功
- `npm run lint:theme` 通過（新樣式只用 `--mat-sys-*` token）
- 瀏覽器實測：1280px 並排、900px 覆蓋、500px 卡片＋覆蓋三種寬度各確認一次；返回鍵關閉面板；連續點三列後按一次返回即離開面板狀態；焦點在開關面板後正確進入與返回；刪除目前編輯項目後面板關閉。

---

## 12. Review 後的可實作性結論

本 Spec 原先已涵蓋主要產品行為，但不足以避免下列三種實作偏差；本次已在上述章節補為規範，而非留給工程師臨場決定：

1. **同頁兩種編輯容器**：保留 actions 欄編輯鈕不等於保留 dialog。按鈕必須開同一個 Split View，否則使用者在同一頁會得到兩套狀態與返回鍵行為。
2. **刪除後的孤兒面板**：資料刪除會讓 `edit=<id>` 變成無效 URL；除了載入時的無效 id 自我修復外，刪除目前資料時也必須立即關閉面板。
3. **視覺覆蓋不等於無障礙 modal**：只有窄螢幕覆蓋模式應使用 modal 語意與焦點陷阱；寬螢幕並排模式不應誤加 `aria-modal`。兩種模式都要處理進入與返回焦點。

其餘架構選擇維持不變：UI lib 不知道業務資料或 URL，頁面負責接線，表單可同時被 dialog 與面板承載。這份 Spec 與對應 implementation plan 完成同步後，可作為後續試點實作的唯一行為依據。
