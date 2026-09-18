# 月曆右側 Panel 資訊層級修改計劃

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> 適用於下一個 Codex session。先讀現況，再依本計劃實作；本 session 僅建立計劃，未修改產品程式碼。

**Goal:** 讓使用者先找到「哪一台車」，再讀取時間、客人及交還車明細；減少日期與 tabs 周圍的重複分隔線。

**Architecture:** 保留 ResponsivePanel、Material tabs 與 accordion，調整表頭分隔、訂單摘要和明細排版。共用 panel 只提供可選的表頭分隔線控制；租車資料與版型留在 CalendarView。保留既有日期同步、tabs 切換、窄螢幕 overlay、焦點與捲動行為。

**Tech Stack:** Angular 22 standalone components / signals、Nx 23、Angular Material/CDK 22、SCSS、Tailwind 4、Vitest。版本以執行時 package.json 為準。

---

## 已確認的使用需求

- 使用者明確表示：看右側 panel 時，先找「哪一台車」。因此車牌是第一視覺重點，時間是輔助資訊。
- 使用者認為「9/18 星期五…」與 tabs 間分隔過多，accordion 展開內容排得紊亂。
- 採用清單式 accordion 整理；不改成獨立卡片、不重新設計左側月曆。
- 這是視覺與資訊編排調整，不代表要依車牌重排訂單；保留既有資料順序。
- 本文件是交接用的具體修改方案，細部尺寸可依真實瀏覽器結果微調。

## 已查證的程式位置與原因

以下路徑相對於專案根目錄 `/Users/fangjiemini/bbd-projects/car-rental`。

| 檔案 | 現況與本次責任 |
| --- | --- |
| `libs/ui/src/lib/responsive-panel/responsive-panel.component.html` | 使用者指定檔案；負責外框、heading、額外標記、tabs 投影插槽與 body，沒有租車 accordion 內容。 |
| `libs/ui/src/lib/responsive-panel/responsive-panel.component.scss` | header 本身有 border-bottom；header-tabs 插槽未使用時仍有 wrapper。body 目前已移除 padding。 |
| `libs/ui/src/lib/responsive-panel/responsive-panel.component.ts` | 如採下述 opt-in 設計，新增 showHeaderDivider input；不變動 overlay/focus 實作。 |
| `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.html` | 真正的取車／還車／可用 tabs、兩份 accordion、聯絡電話及明細內容。mat-tab-group 目前投影在 panel body，並未使用 panelHeaderTabs 插槽。 |
| `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts` | vehicleLabel() 將車牌與車型串成同一字串；fmt 指向顯示日期及時間的 fmtDateTime；提供 customerName/location/phoneHref/phoneLabel/paymentLabel。 |
| `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.scss` | 月曆專用版型；新的清單樣式應集中在這裡。 |
| `apps/admin/src/app/app.scss` | `.work-list-accordion` 與 `.work-list-detail` 的既有樣式來源，CalendarView 也透過 styleUrls 載入此檔。明細目前使用 space-between 與 dd text-align:right，導致標籤和值分離。 |
| `apps/admin/src/app/features/dispatch/calendar-view.spec.ts` | 日期選擇、面板開關、工作清單與電話資料的既有測試。 |
| `libs/ui/src/lib/responsive-panel/responsive-panel.component.spec.ts` | 面板投影、ARIA、開關、焦點、寬窄螢幕與 overlay 回歸測試。 |

現況另有以下資料限制：

- tabs 的 `0/2` 是「已完成 / 總數」，不是未完成筆數；保留計算邏輯。
- 工作列目前只納入 confirmed / in_progress；不要順便調整 completed 的顯示規則。
- 班次、洗車目前為固定 `—`；paymentLabel() 也固定回傳 `—`。舊設計文件 `docs/plans/2026-08-14-dashboard-work-list-design.md` 記錄了相關資料限制。
- 地點目前包含 `取：` 或 `還：` 及固定 `（—）`。後者沒有真實資料來源，可移除；不要把它改成猜測的站點或狀態。
- fmtDateTime 依本地時區格式化。改為只顯示時間時，也必須保持本地時區，不能截取 ISO 字串中的 UTC 時間。

## 開始前保護現有工作

1. 讀取當下 AGENTS.md（若存在），確認工作目錄及 `git status --short`。
2. 本計劃建立時已有大量 staged / unstaged 變更，不是本任務產生。尤其：
   - `libs/ui/src/lib/responsive-panel/responsive-panel.component.scss`：body 的 `padding: 0.75rem 1rem` 已被移除。
   - `apps/admin/src/app/app.scss`：expansion header padding 已從 `0.75rem 0` 改成 `0.75rem`。
3. 以現有 working tree 為基礎；不可 reset、覆蓋或暫存移走使用者變更。若改用 worktree，必須先確保這些調整和本計劃都在該工作環境中。
4. 使用 @ng19-nx-frontend-standard 與 @ux-guidelines：繁體中文、既有 Material theme tokens、Material Symbols、可見 focus、合理點擊範圍。不新增套件。

## 目標版型

```text
9/18 星期五  今天                         [關閉：僅窄螢幕]

  取車 0/2          還車 0/1          可用 3 筆
  ━━━━━━━ ────────────────────────────────────

MNO-345                              10:00  ⌃
SYM 4MICA · 林美惠

客人       林美惠  [電話圖示 打電話]
取車地點   機場
班次       —
洗車       —
付款       —

──────────────────────────────────────────────
PQR-678                              14:00  ⌄
Corolla Cross · 王小明
```

- 草圖中的今天標記、關閉鈕與電話圖示沿用既有視覺語言；不照字面新增括號文字。
- 日期與 tabs 之間沒有橫線；tabs 下方只有一條淡基線，active indicator 是其上的主色標示。
- 車牌最醒目，車型與客人較淡；時間位於右侧但字重不高於車牌。
- 收合時仍能看見客人姓名；展開後客人列提供電話操作，因此姓名會有目的地重複一次。
- 電話連結放在展開內容，不放進有 button 語意的 mat-expansion-panel-header。
- 訂單之間保留單一淡線，展開後沒有卡片陰影、額外框線或額外的上下卡片間距。

## Task 1：整理日期與 tabs 分隔

**修改檔案：** responsive-panel 的 `.ts`、`.html`、`.scss`，及 calendar-view.component.html。
**測試檔案：** responsive-panel.component.spec.ts（只新增 API 行為覆蓋，不測像素值）。

1. 在 ResponsivePanel 新增 `readonly showHeaderDivider = input(true)`，預設保留現有行為。
2. header 加上 `[class.responsive-panel__header--borderless]="!showHeaderDivider()"`；SCSS 以此 class 移除 border-bottom。月曆使用處設定 `[showHeaderDivider]="false"`。
3. 以 `.responsive-panel__header-tabs:empty { display: none; }` 隱藏空插槽 wrapper；在瀏覽器確認 Angular 投影結果確實符合 :empty，保留有投影內容時的全寬與 pagination 行為。不要刪除 panelHeaderTabs API。
4. 保留 mat-tab-group 在 panel body，不搬動整個 tab group 至表頭、不改寫成自製 tabs，以免意外改動內容投影與鍵盤行為。
5. 表頭採 16px 水平邊距；以約 8px 的底部留白銜接 tabs。避開空 wrapper 留白與 header gap 疊加。
6. tabs 文案改成「取車 0/2」「還車 0/1」「可用 3 筆」，只移除連字號、不改數字含義。
7. 保留 Material 自己的 tab 基線和 active indicator；不要額外加第二條 border。若真實 DOM 還有重複線，先找出來源再移除，避免全域覆寫所有 tabs。
8. 日期 heading 及今天／明天／後天標記保持既有內容，這次不為拆分星期字重另增 header API。

**通過條件：** 日期與 tabs 視覺上是同一組；tabs 下方僅一條基線；其他 panel 的預設分隔行為不變；空插槽不佔多餘高度。

## Task 2：以車牌為主重新編排取車／還車摘要

**修改檔案：** calendar-view.component.html / .ts / .scss。
**測試檔案：** calendar-view.spec.ts（若增加顯示資料方法，覆蓋缺資料與時間格式）。

1. 讓 vehicle 查詢回傳結構化資料，而不是拆解 vehicleLabel() 的顯示字串。可新增 `vehicleOf(row)` 並在 template 用 `@let vehicle = vehicleOf(row)`，讀取 `vehicle?.plateNumber` 及 `vehicle?.model`；缺值顯示 `—`。先搜尋 vehicleLabel 使用處，再決定是否移除舊方法。
2. 取車與還車使用同一種摘要結構：左側垂直排列「車牌」「車型 · 客人」，右側只放時間，最右保留 Material 展開指示。
3. 時間使用新的本地 HH:mm formatter；取車讀 startTime、還車讀 endTime。先確認既有 utilities 是否已有適用函式，若沒有，保留在 CalendarView 即可，避免改動全站 fmtDateTime。
4. 使用 `mat-panel-title` 承載左側兩行、`mat-panel-description` 承載右側時間；移除預設 flex 比例造成的左右各佔半寬，title 設 flex:1、min-width:0，時間设 flex:0 0 auto、white-space:nowrap。
5. 車牌約 16px / 600，次要行約 13–14px / 400，時間約 14px / 500，並使用 tabular-nums。顏色沿用 on-surface / on-surface-variant。
6. header 左右 padding 統一 16px，上下約 12px；兩行間距約 4px。高度隨內容增長，不鎖死 expandedHeight / collapsedHeight。
7. 長車型、長姓名在第二行自然換行，不讓時間或箭頭擠出容器；車牌正常長度保持完整可見。極長異常值需可換行，不能造成橫向捲動。
8. 保留既有單一展開行為、點擊整個標題切換、Enter/Space 鍵盤互動、panelTabIndex 綁定與換日重設取車 tab 的行為。

**通過條件：** 收合列表能一眼沿左側找到車牌；車型不再和車牌同字重混成一大塊；時間不重複日期；取還車摘要一致。

## Task 3：讓展開明細靠左、關聯資訊放在一起

**修改檔案：** calendar-view.component.html / .scss；必要時整理 app.scss 的既有工作清單樣式。

1. 保留 `<dl>` 語意，每個 `<div>` 內維持 dt/dd 配對。把 `justify-content: space-between` 改為 grid：`grid-template-columns: 5rem minmax(0, 1fr)`，column-gap 約 12px；dd 一律靠左，長地點可換行。
2. 內容與摘要左邊緣對齊，统一 16px；行距約 8px，展開內容底部留白約 16px。若 Material 內層 padding 不同，以限定範圍 selector 調整。
3. 明細第一列為「客人」，內容是姓名及電話連結；移除原本獨立的「聯絡」列。
4. 電話連結仍使用 phoneHref() 的 tel 值。以 Material Symbols 的 call 圖示搭配「打電話」，取代 emoji；圖示 aria-hidden，連結的可存取名稱包含客人及 phoneLabel()，且有可見 focus。
5. 電話連結有至少 44px 的點擊高度，並允許與姓名換行；缺電話時只顯示姓名，不渲染可點擊的假操作，也不增加空白聯絡列。
6. 地點 label 依 kind 使用「取車地點」或「還車地點」，內容只顯示 location(row)；拿掉重複的取／還前綴與無資料的固定括號。
7. 班次、洗車、付款保留 `—`，淡化空值但確保可讀。不要改成「未付款」「未洗車」「不適用」等無法從現有資料證明的含義，也不新增後端欄位。
8. 不把四個簡單欄位拆成多張卡片或多個子 accordion；保留一個平面、緊湊的清單。

**樣式歸屬與 overlay 注意：**

- 執行前再搜尋 `.work-list-accordion` / `.work-list-detail` 使用處。檢查時只有月曆 template 使用它們。
- 建議把這兩組樣式完整移至 CalendarView SCSS，刪除 app.scss 對應區塊，避免 styleUrls 順序導致新樣式被舊的 text-align:right 覆蓋。移動時吸收原本已修改的 header padding，不還原使用者工作。
- Material 內部 DOM 如需覆寫，僅限於 `.work-list-accordion` 下的窄範圍 `::ng-deep`。自己 template 的元素使用一般 component styles。
- 窄螢幕會經 DomPortal 將內容搬到 body。不要使用依賴 `app-calendar-view`、`.calendar-view` 或 `.split-view__panel` 祖先仍存在的 selector。以被搬移的 accordion/tab-group 自己的 class 作為作用域。
- 消除 Material expanded panel 的額外 margin（僅這份清單）；保留列間淡線、hover、focus，避免重複 panel 偽元素分隔。

**通過條件：** 標籤和值可就近配對；客人與電話放在一起；電話不會切換 accordion；長資料可讀；空值沒有被誤解成業務狀態。

## Task 4：驗證並交付

### 自動驗證

不為單純間距／字色建立脆弱的 CSS snapshot 或 class 名稱斷言。針對實際新增行為補少量測試：

- showHeaderDivider 預設與關閉選项，以及有／沒有 header tabs 投影仍可正常渲染。
- 若新增 formatter／vehicle lookup：本地 09:05 等有前導零的時間、缺少車輛、取還車不同時間來源。
- 實際展開後能找到客人與正確 tel 連結；沒有電話則沒有連結。連結不在 expansion header 內。
- 既有日期同步、工作列篩選、tabs 切換、窄螢幕焦點與關閉測試保留。
- 窄螢幕測試由 document.body / overlay container 查詢，並 destroy fixture，避免遺留 overlay 汙染其他測試。

在專案根目錄執行（這些是下一個 session 的指令，本次未執行）：

```bash
npx nx test admin --watch=false --include='src/app/features/dispatch/calendar-view.spec.ts'
npx nx test ui --watch=false
npx nx lint admin
npx nx lint ui
npx nx build admin --configuration=development
npm run lint:theme
git diff --check
```

預期各命令 exit 0；unit tests 通過、admin 能編譯、theme 檢查沒有新增違規。若工具選項隨版本改變，先看本地 executor schema；admin include 相對於 apps/admin。若遇既有失敗，紀錄是否與本次修改有關，不把無關 dirty files 一起修掉，也不要宣稱全數通過。

### 真實瀏覽器驗收

啟動既有 admin 開發服務（`npm start`，已有服務則重用），開啟 Dashboard 的月曆，準備有多筆取車／還車的日期。日期資料不必固定在 9/18；不要為展示而修改正式 seed data。

| 情境 | 驗收重點 |
| --- | --- |
| 寬度 1440–1600px，側 panel | 日期到 tabs 無分隔線；tab 下只有一條基線；車牌、時間、箭頭不擠壓。 |
| 視窗在 1280px 斷點兩側 | inline panel 與 bottom sheet 切換正常、內容不遺失、樣式不因 portal 移動而失效。 |
| 390px 及 320px 窄螢幕 | tabs 可操作，沒有橫向溢出；長姓名／車型／地點換行；關閉鈕可達。 |
| 取車及還車各展開一筆 | 相同資訊順序、正確時間來源與地點標籤、電話在客人旁。 |
| 缺電話／缺車輛／空資料 | 沒有假操作、undefined 或錯誤狀態；既有空狀態仍清楚。 |
| 鍵盤操作 | tabs 左右鍵、accordion Enter/Space、Tab focus、窄螢幕 Escape 和關閉後焦點返回正常。 |
| 大量訂單與展開內容 | 沒有雙重捲動回歸；保持現有可用高度与 tab 可達性；無明顯跳動或新增不必要動畫。 |
| 可用 tab | 車款選擇內容與既有版型正常，沒有受 accordion 樣式污染。 |

保留寬螢幕與窄螢幕的收合／展開截圖做前後比較。單元測試不代表視覺通過，必須實際檢視上述畫面。

### 交付內容

- 列出實際修改檔案、車輛優先層級和分隔線處理方式。
- 報告執行過的測試及結果，附至少桌面與窄螢幕展開畫面的截圖或可檢視產物。
- 說明保留的限制：班次／洗車／付款仍無資料；本次沒有調整業務篩選和順序。
- 不自動提交整份 dirty working tree；若之後另行要求 commit，只納入本任務的變更。

## 可貼給下一個 session 的指令

請依照 `docs/plans/2026-09-18-calendar-panel-hierarchy.md` 實作月曆右側 panel 的整理。使用者已確認先找「哪一台車」，請以車牌為第一視覺重點，減少日期與 tabs 的分隔線，重排 accordion 摘要與展開明細。先查看現有未提交變更並保留它們，按文件列出的實際檔案修改，完成必要測試與桌面／窄螢幕視覺驗證後回報。
