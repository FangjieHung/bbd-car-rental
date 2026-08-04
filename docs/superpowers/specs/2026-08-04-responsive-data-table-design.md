# 響應式資料表格元件（DataTable）設計 Spec

**日期**：2026-08-04
**範圍**：把 `apps/admin` 的 9 張表格與 `apps/affiliate` 的 1 張表格，統一成一個位於 `libs/ui` 的共用元件。桌機維持表格、手機轉為卡片、並內建 Excel 匯出。
**前提**：純前端、繁中、Angular 22 zoneless + signal。Material 22 已在 admin 使用。
**上游**：commit `f33e58d`（page-toolbar 投影到 topbar）。

---

## 1. 目標與範圍

### 這輪要做

- 新增 `libs/ui`（alias `@car-rental/ui`），放入 `DataTableComponent`。
- 元件支援兩種模式：**標準模式**（欄位 config 驅動）與**逃生門模式**（頁面自己接管 `thead` / `tbody`）。
- 手機版以**純 CSS** 把表格轉為卡片，DOM 不換。
- 內建 Excel 匯出，兩條路徑（見 §6）。
- 把 6 個 `mat-table` 頁改寫為原生 `<table>` 語意，與現有 4 個手刻頁一起收斂到同一元件。
- i18n：新增 `common.exportExcel`、`common.expandRow`、`common.collapseRow`。

### 這輪不做

- 不做排序、分頁、虛擬捲動。目前 10 張表都是一次渲染全部資料列，沒有分頁需求。（但匯出策略已預留分頁相容性，見 §6.1。）
- 不做 CSV 匯出、不做列印樣式。
- 不動 `PageToolbarComponent`。搜尋與篩選仍由頁面處理，元件只接收已篩選好的 `rows`。
- 不做橫向欄位隱藏設定 UI（使用者自選顯示哪幾欄）。
- 不重構 `apps/affiliate` 的其他部分，只換那一張表。

---

## 2. 現況盤點

| 頁面 | 實作 | 欄位數 | 備註 |
|---|---|---|---|
| `vehicles` | `mat-table` | 6 | 含 `app-status-chip` |
| `pricing` | `mat-table` | 8 | 欄位最多，手機版最吃緊 |
| `coupons` | `mat-table` | 7 | |
| `partners` | `mat-table` | 5 | actions 含「複製連結」 |
| `add-ons` | `mat-table` | 4 | 最單純，適合當遷移首發 |
| `commission` | `mat-table` | 5 | 無 actions 欄 |
| `bookings` | 手刻 | 6 | actions 是條件式 4 顆按鈕，最複雜 |
| `customers` | 手刻 | 6 | |
| `maintenance` | 手刻 | 8 | |
| `affiliate/partner-account` | 手刻 | 5 | **欄位標題是寫死的中文**，未走 i18n |

兩套寫法並存（6 個 `mat-table` + 4 個手刻）本身就是既有技術債，這次一併收斂。

`libs/` 目前有 `assets`、`booking-flow`、`domain`、`theme-pack`；`apps/affiliate` 沒有 `shared/` 目錄。因此共用元件必須落在新的 `libs/ui`，不能放進 `apps/admin/src/app/shared/ui/`。

---

## 3. 為什麼不建在 `mat-table` 上

這是本設計的決定性判斷，且與過去踩過的坑直接相關。

`mat-table` 的 `matColumnDef` 模型假設「每一列結構相同、一欄對一格」。這個假設一旦成立，兩件事同時失效：

### 3.1 Excel 匯出（已踩過的坑）

`XLSX.utils.table_to_sheet()` 這類套件直接讀 DOM 的 `<table>` 結構。`mat-table` 的儲存格外面包了 `ng-container` 與 `role` 屬性、CSS 又改寫 `display`，套件抓不到乾淨的 row／cell 對應。專案先前正是因此改用手刻表格。

### 3.2 合併儲存格

`colspan` / `rowspan` 在 column-def 模型裡沒有位置可以表達。業主端的報表需求（跨欄小計、分組表頭）遲早會撞上，屆時只能整張表拆掉重寫。

### 3.3 結論

統一的方向是**把 6 個 `mat-table` 改成原生 `<table>`**，不是反過來。共用元件建在原生表格語意上。

同時，這也限制了共用元件自己的設計：**如果元件做成「傳 columns 陣列進去、元件負責生出整張表」，就是把 `mat-table` 的限制原地重造一次**。因此元件必須留一道逃生門（§4.2），讓頁面在需要時完全接管列結構，而只保留外框與樣式的統一。

---

## 4. 元件 API

### 4.1 標準模式

適用目前全部 10 張表。

```ts
export interface DataTableColumn<T> {
  key: string;
  label: string;
  /** 手機版卡片收合時仍顯示。未標記者收進展開區。 */
  primary?: boolean;
  align?: 'start' | 'end';
  /** 匯出時的取值。預設取 row[key]。 */
  exportValue?: (row: T) => string | number;
  /** 不納入匯出（actions 欄用）。 */
  exportSkip?: boolean;
}
```

```html
<app-data-table
  [columns]="columns"
  [rows]="filteredVehicles()"
  [rowId]="idOf"
  exportName="vehicles"
>
  <ng-template dtCell="status" let-row>
    <app-status-chip [label]="t.vehicle.statusLabels[row.status]" [status]="statusKeyOf(row)" />
  </ng-template>

  <ng-template dtCell="actions" let-row>
    <button mat-button (click)="openForm(row)">{{ t.common.edit }}</button>
    <button mat-button color="warn" (click)="remove(row)">{{ t.common.delete }}</button>
  </ng-template>
</app-data-table>
```

**儲存格解析規則**：該 `key` 有對應的 `dtCell` template 就用 template 渲染，否則直接印 `row[key]`。純文字欄位（多數欄位）因此完全不需要寫 template。

**欄位標題只存在 `columns` config 一處**。元件渲染時自動把 `label` 寫進每個 `<td>` 的 `data-label` 屬性，供手機版 CSS 取用。這是本設計相對「每頁加 card-wrap」的核心優勢：不存在標題與 `data-label` 雙寫、i18n 改動漏改一處的風險（10 張表 × 平均 6 欄 ≈ 60 處）。

**指令**：

```ts
@Directive({ selector: 'ng-template[dtCell]' })
export class DataTableCellDirective {
  readonly dtCell = input.required<string>();
  readonly template = inject(TemplateRef);
}
```

元件以 `contentChildren(DataTableCellDirective)` 收集，建成 `Map<string, TemplateRef>`。

### 4.2 逃生門模式

供未來高度客製的報表（合併儲存格、分組表頭、跨欄小計）使用。**這輪不會有任何頁面用到，但介面要一併定義並測試**，否則真的需要時仍會走上「另外手刻一張表」的老路。

```html
<app-data-table mobile="scroll" exportName="settlement">
  <ng-template dtHead>
    <tr>
      <th rowspan="2">合作夥伴</th>
      <th colspan="3">本季</th>
    </tr>
    <tr>…</tr>
  </ng-template>

  <ng-template dtBody>
    @for (row of rows(); track row.id) { <tr>…</tr> }
  </ng-template>
</app-data-table>
```

元件偵測到 `dtHead` 存在即進入逃生門模式：不再讀 `columns`、不注入 `data-label`、不生成卡片。外框、字級、邊框、間距仍統一。

### 4.3 輸入一覽

| 輸入 | 型別 | 預設 | 說明 |
|---|---|---|---|
| `columns` | `DataTableColumn<T>[]` | `[]` | 逃生門模式下忽略 |
| `rows` | `T[]` | `[]` | 已由頁面篩選／排序完成 |
| `rowId` | `(row: T) => unknown` | `row => row.id` | 展開狀態與 `track` 用 |
| `mobile` | `'cards' \| 'scroll'` | 標準模式 `'cards'`／逃生門 `'scroll'` | |
| `exportName` | `string` | `'export'` | 檔名，元件補上日期 |
| `showExport` | `boolean` | `true` | |
| `emptyText` | `string` | `''` | 由頁面傳入（admin 傳 `t.common.empty`） |
| `labels` | `DataTableLabels` | 必填 | 匯出鈕、展開／收合鈕的文案，見 §8 |

---

## 5. 響應式策略

### 5.1 不換 DOM，只換 CSS

手機版**不**用 `@if` 切換成一套卡片 DOM。理由有二：

1. **匯出**：換 DOM 後手機上的 `table_to_sheet` 會抓到一堆 `<div>`，逃生門模式的匯出直接失效。
2. **無障礙**：原生表格語意（`<th scope>`、row／column 關聯）在螢幕閱讀器上有意義，換成 `<div>` 會全部丟失。

因此桌機與手機共用同一份 DOM，斷點以 CSS 處理。

```scss
@media (max-width: 640px) {
  .dt-table,
  .dt-table tbody,
  .dt-table tr,
  .dt-table td { display: block; }

  // 視覺隱藏而非 display:none —— 見 §5.2
  .dt-table thead {
    position: absolute;
    width: 1px; height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .dt-table tr {
    border: 1px solid var(--mat-sys-outline-variant);
    border-radius: 1rem;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
  }

  .dt-table td::before {
    content: attr(data-label);
    display: block;
    font-size: 0.75rem;
    color: var(--mat-sys-on-surface-variant);
  }

  .dt-table td.is-secondary { display: none; }
  .dt-table tr.is-expanded td.is-secondary { display: block; }
}
```

斷點 640px，與 [`page-toolbar.component.scss`](../../../apps/admin/src/app/shared/ui/page-toolbar.component.scss) 現有的 `max-width: 640px` 對齊。

### 5.2 `thead` 必須「視覺隱藏」而非 `display: none`

SheetJS 讀 DOM 時會跳過 `display: none` 的節點。若手機版把 `thead` 設為 `display: none`，匯出的 Excel 就會**少掉標題列**——而且只在手機上發生，桌機測不出來。因此改用 `clip-path` 視覺隱藏，節點仍在版面流之外但保持可讀。

### 5.3 卡片密度：主要欄位 + 展開

`primary: true` 的欄位在手機上恆常顯示；其餘掛 `is-secondary`，預設收起。每張卡片右上角一顆展開鈕。

展開狀態存在元件內的 signal：

```ts
private readonly expandedIds = signal(new Set<unknown>());
```

`<tr>` 上掛 `[class.is-expanded]="isExpanded(row)"`。**DOM 結構完全不變**，只有 class 變動，因此不影響匯出。

展開鈕在桌機以 CSS 隱藏（桌機所有欄位本就都看得見）。

每張表建議標 2–3 個 `primary`，以最能辨識該筆資料的欄位優先（`vehicles` → 車牌 + 狀態；`bookings` → 車輛 + 狀態）。實際選定於實作時逐頁決定。

---

## 6. Excel 匯出

### 6.1 兩條路徑

| | 標準模式 | 逃生門模式 |
|---|---|---|
| API | `XLSX.utils.json_to_sheet()` | `XLSX.utils.table_to_sheet(el)` |
| 資料來源 | `rows` 陣列 + `columns` 的 `exportValue` | DOM 的 `<table>` 節點 |
| 合併儲存格 | 不支援（也不需要） | `colspan` / `rowspan` 自動轉為 Excel 合併儲存格 |
| 分頁／虛擬捲動 | 相容（匯出全量資料） | 不相容（只會匯出 DOM 中存在的列） |

標準模式刻意走「從資料匯出」而非讀 DOM：與畫面完全脫鉤，日後若加上分頁或虛擬捲動也不會變成「只匯出當前頁」。逃生門模式則必須讀 DOM，才拿得到合併資訊——這也是為什麼逃生門模式的 `mobile` 預設是 `'scroll'` 而非 `'cards'`：合併儲存格的報表硬拆成卡片本來就讀不懂，保留表格 + 橫向捲動才是正解。

`exportSkip: true` 的欄位（actions）不納入匯出。逃生門模式無此機制，由頁面自行決定 DOM 內容。

檔名格式：`{exportName}-{YYYYMMDD}.xlsx`。

### 6.2 套件選擇與安裝注意

採用 **SheetJS（`xlsx`）**。`table_to_sheet` 是逃生門模式的必要條件，其他候選套件（`exceljs`、`write-excel-file`）都沒有等價的 DOM 表格讀取器。

**安裝注意**：SheetJS 自 2023 年起已停止發布到 npm registry，npm 上的 `xlsx` 停在舊版且帶有已知漏洞（prototype pollution、ReDoS）。必須從官方 CDN 安裝 tarball：

```
npm i --legacy-peer-deps https://cdn.sheetjs.com/xlsx-<版本>/xlsx-<版本>.tgz
```

版本以安裝當時 <https://cdn.sheetjs.com/> 公告的最新版為準，不在此寫死。`--legacy-peer-deps` 沿用本 repo 既有慣例。

**動態載入**：`xlsx` 體積不小（~800KB min），且匯出是低頻操作。以 `await import('xlsx')` 動態載入，不進主 bundle。

### 6.3 匯出按鈕位置

匯出鈕由元件自己渲染在表格右上角，不放進 `PageToolbarComponent`。理由：匯出是表格的能力而非頁面的能力，一頁若日後有兩張表，兩顆按鈕各自對應正確的表格。

---

## 7. 元件位置與 lib 建立

```
libs/ui/
  src/
    index.ts
    lib/
      data-table/
        data-table.component.ts / .html / .scss
        data-table-cell.directive.ts
        data-table-head.directive.ts
        data-table-body.directive.ts
        data-table.types.ts
        data-table-export.ts        // 匯出邏輯，與元件分離便於單測
        data-table.component.spec.ts
        data-table-export.spec.ts
```

- 以 `nx g @nx/angular:library ui --directory=libs/ui` 建立，安裝相關指令一律帶 `--legacy-peer-deps`（沿用本 repo 既有慣例）。
- `tsconfig.base.json` 的 `paths` 新增 `"@car-rental/ui": ["./libs/ui/src/index.ts"]`。
- 樣式：元件 SCSS 使用 `--mat-sys-*` token，不直接寫死顏色，以維持與 theme-pack 雙軸主題的相容。
- **`libs/ui` 不得依賴 `libs/domain`**。表格元件對資料型別保持泛型，不認識 `Vehicle` / `Booking` 等領域型別。

`app.scss` 中現有的表格全域樣式 `.table-head`、`.table-cell`、`.table-cell--body`、`.table-row`（[`app.scss:65-85`](../../../apps/admin/src/app/app.scss)）在遷移完成後移除，樣式收進元件。

---

## 8. i18n

`apps/admin/src/app/core/i18n/zh-tw.ts` 的 `common` 區塊新增：

| key | 值 |
|---|---|
| `common.exportExcel` | 匯出 Excel |
| `common.expandRow` | 展開詳細資料 |
| `common.collapseRow` | 收合詳細資料 |

`apps/affiliate` 目前沒有 i18n 檔，`partner-account` 的欄位標題是寫死的中文。**這輪維持寫死**，只是從 `<th>` 搬進 `columns` config——建立 affiliate 的 i18n 機制不在本輪範圍。

`libs/ui` **不內建任何字串**（它不認識任一 app 的 i18n 機制），全部文案由 `labels` input 傳入：

```ts
export interface DataTableLabels {
  exportExcel: string;
  expandRow: string;
  collapseRow: string;
}
```

admin 傳 i18n 的值，affiliate 傳寫死的中文字面量。

---

## 9. 遷移順序

分三批，每批可獨立驗證：

1. **建 lib + 元件 + 測試**，以 `add-ons`（4 欄、最單純）作為首發接入並驗證。
2. **其餘 5 個 `mat-table` 頁**：`commission`（無 actions）→ `partners` → `vehicles` → `coupons` → `pricing`（8 欄，最吃緊）。這批的工作是拆掉 `matColumnDef` 改回原生表格語意，工作量最大。
3. **4 個手刻頁**：`customers` → `maintenance` → `bookings`（條件式 4 顆按鈕，最複雜）→ `affiliate/partner-account`。

每頁遷移後移除該頁不再使用的 `MatTableModule` import。全部完成後移除 `app.scss` 的表格全域樣式。

---

## 10. 測試

`data-table.component.spec.ts`：

- 標準模式渲染出的 `<td>` 帶正確的 `data-label`（對應 `columns` 的 `label`）。
- 有 `dtCell` template 的欄位走 template；沒有的直接印 `row[key]`。
- 展開切換只改變 `is-expanded` class，`<tr>` / `<td>` 節點數量不變。
- 逃生門模式下 `columns` 被忽略、不注入 `data-label`、不渲染展開鈕。
- 空 `rows` 時顯示 `emptyText`。

`data-table-export.spec.ts`：

- 標準模式匯出的 sheet 標題列等於 `columns` 的 `label`，且不含 `exportSkip` 欄位。
- `exportValue` 有定義時優先於 `row[key]`。
- 逃生門模式呼叫 `table_to_sheet` 並傳入正確的 table 節點。
- 檔名格式為 `{exportName}-{YYYYMMDD}.xlsx`。

---

## 11. 邊界情況

| 情況 | 處理 |
|---|---|
| `rows` 為空 | 顯示 `emptyText`，匯出鈕停用 |
| 某欄值為 `null` / `undefined` | 渲染空字串；匯出寫入空儲存格 |
| 所有欄位都標 `primary` | 展開鈕不渲染（沒有可展開內容） |
| 沒有任何欄位標 `primary` | 手機上第一欄視為 primary，避免整張卡片空白 |
| 同一頁有兩張表 | 各自的匯出鈕以各自的 `exportName` 命名，互不干擾 |
| 逃生門模式又傳了 `columns` | 忽略 `columns`，開發模式下 `console.warn` |
| 匯出時 `xlsx` 動態載入失敗 | 顯示 snackbar 錯誤訊息，不使頁面崩潰 |
