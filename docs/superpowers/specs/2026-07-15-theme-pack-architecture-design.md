# 主題包架構設計（Theme-pack Architecture）

日期：2026-07-15
狀態：設計定案，待寫實作計畫
範圍：**只做換膚（styling）邊界，不改任何功能行為。**

---

## 1. 背景與策略

car-rental 這個 repo 定位為 **參考產品 / sandbox**：真實地把功能畫面做出來，
未來的 ERP/CRM template 從這份可運作的產品「抽出來」，而不是現在就憑空建一個空殼 template。
所以**現在不 fork、不另開 repo**，繼續在這裡做功能。

但「之後再抽」有個陷阱：如果現在畫面做得隨便，之後抽 template 會變成重寫而非複製。
本 spec 只處理其中一件「現在做最划算、拖越久越虧」的事——**換膚邊界**：
它是使用者長期要重複做的事（一直增加 UI style），而且每多做一個畫面、就可能多欠一筆
「顏色寫死」的債。先把邊界立好，之後每個新畫面都自動守規矩。

### 明確延後（各自另開 spec，不在本次範圍）
- 登入/登出、路由守衛、角色權限骨架
- 通用 CRUD scaffold（把 vehicles/bookings 那套列表+篩選+表單抽成可複製範式）
- 把 car-rental 領域內容抽乾淨、變成純 template
- `core/`＋`shared/` 不得引用 `features/` 的大範圍隔離規則（本 spec 只做其中「顏色」這一條）

---

## 2. 核心決策（已與使用者確認）

| 決策 | 選定 | 說明 |
|---|---|---|
| 元件綁「顏色用途」還是「顏色本身」 | **綁用途（語意色票）** | 元件只認 surface/brand/text 等用途，換主題只改「用途→顏色」對應。等同 Figma 語意變數、Material 3 分層。 |
| 換膚時機 | **runtime 即時切 + project-time 可鎖** | 出貨可即時切換（方便展示每套 style）；複製到真專案時，用一個「初始化」步驟鎖成單一主題。runtime 是 project-time 的超集。 |
| 第二套證明主題 | **深色 Midnight** | 整個翻深色，最能驗出「沒接好、漏網」的地方。 |
| 底層色票命名 | **改角色名** `primary/accent/neutral`（原 sage/teal/cream） | 底層色主題私有、元件看不到；改角色名讓主題作者不用在深色主題定義叫「綠」卻是藍的色票。 |

---

## 3. 三層色票模型

```
┌─ 第 1 層：底層色票 palette（主題私有，元件不得直接綁）
│    --primary-50 … 900   （原 sage）
│    --accent-50 … 900    （原 teal）
│    --neutral-0 … 900    （原 cream）
│
├─ 第 2 層：語意色票（＝契約：骨架/元件唯一能綁的東西）
│    --surface-*  --text-*  --border-*  --status-*  --viz-*
│    --radius-*   --shadow-*  --font-*
│
└─ 第 3 層：綁定層（把語意/底層接到框架）
     --mat-sys-*         （Angular Material）
     --color-* @theme    （Tailwind；grep 顯示畫面未使用，實作時確認後可移除）
```

**契約的意義**：第 2 層那組「用途名」是骨架與所有元件的唯一依賴。
每套主題都必須把這組名字定義齊全（給值）。主題只改「值」，骨架只認「名」。

底層色票（第 1 層）是每套主題**私有的**：只用來算出自己那套語意色票，
元件、畫面、app 外殼一律不得直接引用第 1 層或寫死色碼。

---

## 4. 語意色票契約（清單）

現有語意色票（沿用）：
- 表面：`--surface-app` `--surface-card` `--surface-card-alt` `--surface-sunken` `--surface-inverse` `--surface-brand` `--surface-pill`
- 文字：`--text-primary` `--text-secondary` `--text-tertiary` `--text-on-brand` `--text-on-inverse` `--text-on-inverse-muted`
- 邊框：`--border-subtle` `--border-default` `--border-inverse`
- 狀態：`--status-{success,warning,error,info}-{bg,fg,dot}`
- 圖表：`--viz-1 … 4`
- 字體/圓角/陰影/動態：`--font-*` `--radius-*` `--shadow-*` `--ease-*` `--duration-*`

**本次需補的語意色票**（因為 §5 那些寫死的地方需要一個「用途名」可接）：
- `--surface-shell`：側邊深色導覽底（app.scss 現用 `--cream-25/50` 疊深色，實為外殼專用面）
- `--text-on-shell` / `--text-on-shell-muted`：外殼上的文字（現用寫死 `#fff` 與 teal）
- 補足圖表/時間軸用色：確認 `--viz-1…4` 是否夠 timeline/calendar 使用，不足則補（例：`--viz-track` 時間軸底軌）

（實際新增項以實作時盤點 §5 清單為準；原則是「每個寫死處都對到一個語意名」。）

---

## 5. 要修的「顏色寫死」清單（約 20 處）

以下是 grep 出、目前跳過語意層、直接綁底層色或寫死色碼的地方。Model B 要求先把它們
改成綁語意色票，之後才乾淨。**這是本 spec 主要的一次性工作量，範圍明確可控。**

| 檔案 | 現況 | 改成 |
|---|---|---|
| `app.scss`（外殼） | `--cream-25/50`（側欄底）、`--sage-400/500/600`、`--teal-100/200/900`、`#fff`×2 | `--surface-shell`、`--surface-brand`、`--text-on-shell(-muted)`、`--text-on-brand` |
| `features/dispatch/timeline-view.component.ts` | inline `--teal-500` `--sage-500` `--cream-300` `#fff` | `--viz-*`、`--text-on-brand` |
| `features/dispatch/calendar-view.component.ts` | `--sage-100` `--sage-600` | `--status-success-bg`/`--surface-brand` 或新 viz 名（實作時定） |
| `features/dashboard/dashboard-page.component.scss` | `--teal-700` | `--surface-inverse` 或 `--text-*`（依用途） |
| `shared/status-chip.component.ts` | `--cream-400`（gray dot 預設） | `--border-default` 或 `--status-neutral-dot`（實作時定） |

修完後 `src/app/` 內（`styles/themes/` 以外）應為 **0 處** 底層色/寫死色。

---

## 6. 檔案結構

```
src/styles.scss                 // 精簡入口：@use skeleton + 主題註冊表
src/styles/
  _skeleton.scss                // 主題無關：.v-card / .v-nav-pill / Material 結構性覆寫
                                //   → 只綁語意色票，永不碰底層色
  _contract.scss                // 語意色票契約清單（文件性質，列出每個用途名）
  themes/
    _registry.scss              // 把每套主題掛到 :root[data-theme="x"]
    verdant/
      _palette.scss             // 底層色（primary/accent/neutral 的實際色碼）
      _theme.scss               // 底層 → 語意 → mat-sys 的對應
    midnight/
      _palette.scss
      _theme.scss

src/app/core/theme/
  theme.service.ts              // signal；設 html[data-theme]；存 localStorage；啟動時還原
  theme.token.ts                // 主題清單常數（id + 顯示名），供切換器與 init 使用
src/app/shared/
  theme-switcher.component.*     // 展示/開發用切換器（project-time 可刪）
```

預設主題（`data-theme` 初值）：`verdant`。

---

## 7. Runtime 換膚機制

- `ThemeService`：持有 `currentTheme` signal；`setTheme(id)` 寫 `document.documentElement.dataset.theme` 並存 `localStorage('cr.theme')`；app 啟動時從 localStorage 還原，無值則用預設。
- `:root[data-theme="verdant"]` / `[data-theme="midnight"]` 各自定義整組語意色票 + `--mat-sys-*`。切換＝換掉 `data-theme` 屬性，CSS 變數 cascade 即時生效，無需重繪元件、無 layout shift。
- 換膚器元件：一個下拉/切換，列 `theme.token.ts` 的主題，呼叫 `ThemeService.setTheme`。放在 app 外殼（登出按鈕旁）。

---

## 8. Project-time 鎖定（初始化步驟，寫進 README）

複製到新專案後要收斂成單一主題時：
1. 把 `ThemeService` 預設值設成要用的那套（或直接在 `<html>` 寫死 `data-theme`）。
2. （可選）刪掉 `shared/theme-switcher.component` 與外殼上的切換器引用。
3. （可選）刪掉 `styles/themes/` 內用不到的主題資料夾，`_registry.scss` 移除對應 `@use`。

runtime 能力隨時可加回來（把切換器接回去即可）。這是「可減可加」，不是二選一。

---

## 9. 防漏機制（讓邊界不會爛掉）

新增 `npm run lint:theme`：一支零依賴的 node 腳本，掃 `src/app/**` 與 `src/styles/**`，
**只排除** `src/styles/themes/**`（底層色只准出現在這裡）。
若在其他地方出現 `var(--（primary|accent|neutral）-數字)` 或十六進位色碼（`#xxx`/`#xxxxxx`）
即 **exit 1** 並列出檔案:行號。（掃描範圍含 `_skeleton.scss`，確保骨架也不寫死色。）
納入 CI / commit 前檢查。這是「綁用途」規則能長期成立的關鍵——之後誰再寫死顏色，當場擋下。

（stylelint 也能做，但為零依賴、好懂、好改，先用 node 腳本；日後要換 stylelint 再說。）

---

## 10. 深色 Midnight 主題規格（證明用）

| 用途 | Verdant（現況） | Midnight |
|---|---|---|
| 背景 `--surface-app` | 米白 | 深靖藍（深） |
| 卡片 `--surface-card` | 白 | 深灰 |
| 外殼 `--surface-shell` | 深色 | 更深/同深色系 |
| 主色 `--surface-brand` | 鼠尾草綠 | 冷藍 |
| 文字 `--text-primary` | 深 | 亮（近白） |
| 狀態/圖表 | 亮底彩 | 深底、提高前景對比 |

Midnight 要把 §4 全部語意色票 + `--mat-sys-*` 給出深色版值。目標：切過去**只有顏色變、版面完全不動**。

---

## 11. 驗收條件（逐條要有證據）

1. `npm run build` exit 0。
2. 既有測試全綠（目前 45 個）。
3. `npm run lint:theme` 通過：`themes/` 以外 0 處底層色/寫死色。
4. 兩套主題各自在 **vehicles、bookings、dashboard** 三頁、**桌機 + 390px** 目視對照：版面一致、只有配色不同、無破圖、無對比過低。
5. 換膚器即時切換：切換前後無 layout shift（截圖對照）。
6. 「鎖定」步驟照 README 走一遍：設死單一主題後，畫面正常、切換器移除後無錯。

---

## 12. 非目標（YAGNI）

- 不做 auth、權限、CRUD scaffold、domain 抽離（各自另開 spec）。
- 不做 per-component 的主題覆寫、不做主題編輯器 UI。
- 不引入重型主題庫 / CSS-in-JS。
- 不處理 light/dark 的系統偏好自動跟隨（Midnight 是手動選；日後要跟隨 `prefers-color-scheme` 再加）。
