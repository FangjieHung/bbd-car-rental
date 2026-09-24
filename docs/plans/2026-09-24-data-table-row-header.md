# data-table 列標題欄（rowHeader）移植

> 交給下一個 car-rental session 執行。來源：smart-agri commit `a5a675f`（2026-09-24）。

## 背景

`lib-data-table` 的標準模式（`[columns]`）每一格都渲染成 `<td>`，沒有列標題。螢幕報讀使用者在表格裡移動到「狀態」「金額」等欄時，聽不到「這是哪一台車／哪一筆訂單」，只能倒回第一欄自己對照。逃生門模式（`dtHead`／`dtBody`）可以手寫 `<th scope="row">`，標準模式做不到。

smart-agri 把知識庫、數據庫清單從逃生門模式改成標準模式（為了用整列點擊 `rowClickable`）時，正好把原本的 `<th scope="row">` 弄丟了，於是在共用的 data-table 加了一個欄位選項 `rowHeader`。兩個 repo 的 `libs/ui/src/lib/data-table` 原本同步，這份文件把同一個選項帶回 car-rental，並套用到 car-rental 的清單上。

## 決定

- `DataTableColumn` 新增 `rowHeader?: boolean`。標了的欄位渲染成 `<th scope="row">`，其餘照舊是 `<td>`。
- 列標題格跟一般資料格**外觀一致**：同樣套 `dtCell` 自訂模板、`dt-align-*`、`data-label`、`is-secondary`，也吃手機卡片樣式。不套表頭 `th` 的次要色與 500 字重。
- 所有資料格（td 與列標題 th）都多掛一個 `dt-cell` class，手機卡片規則改用 `.dt-cell` 選擇，讓 th 也吃到。選取格（`dt-selection-cell`）與展開格（`dt-expand-cell`）不掛 `dt-cell`，行為不變。
- 預設不啟用：沒標 `rowHeader` 的既有表格 DOM 完全不變。
- 每張表最多標一欄，標「辨識這一列的欄位」（名稱、車牌、訂單編號），通常就是第一個 `primary` 欄。

## 步驟

### 1. 套用 libs/ui 的改動

smart-agri 的 commit 可以直接套到 car-rental（2026-09-24 已用 `git apply --check` 確認乾淨套用，因為兩邊的 data-table 在這之前一致，只差一條與此無關的 `tabular-nums`）：

```bash
git -C ~/bbd-projects/smart-agri show a5a675f -- libs/ui | git apply
```

改到 4 個檔：`data-table.types.ts`、`data-table.component.html`、`data-table.component.scss`、`data-table.component.spec.ts`（新增 describe「列標題欄（rowHeader）」共 4 個測試）。若 `git apply` 失敗（代表 car-rental 的 data-table 在這之後又改過），改成對照 `git -C ~/bbd-projects/smart-agri show a5a675f -- libs/ui` 手動移植，上面「決定」一節就是規格。

跑 `npx nx test ui`，應該全過（新增的 4 個也要過）。**單獨 commit**：`feat(ui): let a data-table column render as the row header`。

### 2. 套用到各清單

2026-09-24 時 car-rental 有 11 個 `lib-data-table` 使用端，全部是標準模式。建議的列標題欄（動手前以當下的 `columns` 定義為準）：

| 使用端 | 建議標 rowHeader 的欄 |
|---|---|
| `apps/admin/.../vehicles/pages/vehicles-page` | `plateNumber` |
| `apps/admin/.../orders/pages/orders-page` | 先看完整的 columns：若有訂單編號欄就標它，否則標 `vehicleId` |
| `apps/admin/.../members/pages/members-page` | `name` |
| `apps/admin/.../partners/pages/partners-page` | `name` |
| `apps/admin/.../pricing/pages/pricing-page` | `name` |
| `apps/admin/.../add-ons/pages/add-ons-page` | `name` |
| `apps/admin/.../coupons/pages/coupons-page` | `code` |
| `apps/admin/.../commission/pages/commission-page` | `bookingId` |
| `apps/admin/.../dashboard/dialogs/prep-queue-dialog` | `plate` |
| `apps/affiliate/.../partner-account/partner-account.component` | `bookingId` |
| `apps/admin/.../vehicles/pages/vehicle-detail-page`（保養紀錄） | 沒有天然的辨識欄，可以不標；要標就標 `type` 或 `performedAt`，自行判斷 |

每個使用端的 spec 補一條斷言：`tbody tr th[scope="row"]` 的文字是該列的辨識值。若既有 spec 用 `tbody tr td` 數格數或找第一格，要一起改（改用 `.dt-cell`，或把列標題 th 算進去）。

### 3. 驗收

- `npx nx test ui`、`npx nx test admin`、`npx nx test affiliate`、`npx nx lint ui`、`npx nx lint admin`、`npx nx lint affiliate` 全過，看 exit code，不要 grep。
- build 只拿來驗證，一律加 `--output-path=<scratchpad>/build`，不要寫進 repo 的 `dist/`。
- 瀏覽器實測至少兩張表（建議 vehicles、orders）：
  - 桌機寬度：列標題格外觀與其他資料格一致（字色、字重、padding、靠左），用 `getComputedStyle` 比對 th 與同列 td。
  - 640px 以下（非 `mobile="scroll"` 的表）：列標題格一樣有左側欄位標籤（`::before` 的 `content` 是欄名），卡片排版不亂。
  - 整列點擊（`rowClickable`）照常：點列標題格也會開啟詳情，只開一次。

## 注意事項

- **工作區可能有別的 session 的改動**：2026-09-24 撰寫本文時 car-rental 工作區就有大量已 staged／未 staged 的改動（不是這份計畫的）。動工前先 `git status`；commit 前一定跑 `git diff --cached --name-only`，只 commit 這份計畫的檔案；**禁止** `git checkout -- .`、`git restore`、`git stash`、`git reset --hard`、`git clean`。有疑慮就先請使用者清空工作區或改用 worktree。
- Node 版本：car-rental 的 `.nvmrc` 是 24，但預設 shell 是 Node 22。跑 nx 前先 `export PATH=~/.nvm/versions/node/v24.18.0/bin:$PATH`。
- 只跑部分 spec：`npx nx test admin --include='apps/admin/src/app/features/<...>.spec.ts'`（路徑相對 workspace 根目錄）。
- smart-agri 那邊已經有這個選項，car-rental 不必再回頭同步。之後任一邊再改 `libs/ui/src/lib/data-table`，記得另一邊也要跟上。
