# 主題包架構設計（Theme-pack Architecture）

日期：2026-07-15
狀態：設計定案，待寫實作計畫
範圍：**只做換膚（styling）邊界，不改任何功能行為。**

---

## 1. 背景與策略

car-rental 這個 repo 定位為 **參考產品 / sandbox**：真實地把功能畫面做出來，
未來的 ERP/CRM template 從這份可運作的產品「抽出來」，而不是現在就憑空建一個空殼 template。
所以**現在不 fork、不另開 repo**，繼續在這裡做功能。

「之後再抽」的陷阱是：現在畫面做得隨便，之後抽 template 會變成重寫。本 spec 只處理其中一件
「現在做最划算、拖越久越虧」的事——**換膚邊界**：它是使用者長期要重複做的事（一直增加 UI style），
每多一個畫面就可能多欠一筆「顏色/尺寸寫死」的債。先把邊界立好，之後每個新畫面自動守規矩。

### 明確延後（各自另開 spec，不在本次範圍）
- 登入/登出、路由守衛、角色權限骨架
- 通用 CRUD scaffold（把 vehicles/bookings 那套列表+篩選+表單抽成可複製範式）
- 把 car-rental 領域內容抽乾淨、變成純 template
- `core/`＋`shared/` 不得引用 `features/` 的大範圍隔離規則（本 spec 只做其中「樣式」這一條）

---

## 2. 核心決策（已與使用者確認）

| 決策 | 選定 | 說明 |
|---|---|---|
| Token 權威 | **Material 3 sys token（`--mat-sys-*`）為單一權威** | 顏色/字體/圓角/陰影全部綁 M3 官方 token；連非 Material 元件（`.v-card`、外殼、時間軸）也吃同一組。除非 M3 天生沒有，否則不自創。 |
| 間距 padding/gap | **交給 Tailwind 間距尺標**（`p-4`/`gap-3`…） | M3 沒有 spacing token；Tailwind 是 4px 網格＝對齊 M3 的 4dp，等於沿用同一尺標、零自創。 |
| 元件綁「用途」還是「顏色本身」 | **綁用途（即綁 M3 token）** | 元件綁 `--mat-sys-surface` 等用途 token，換主題只改 token 的值。等同 Figma 語意變數 / mode。 |
| 換膚時機 | **runtime 即時切 + project-time 可鎖** | 出貨可即時切換展示；複製到真專案時用「初始化」步驟鎖成單一主題。runtime 是 project-time 的超集。 |
| 第二套證明主題 | **深色 Midnight** | 整個翻深色，最能驗出漏網。 |

---

## 3. Token 策略：M3 為單一權威

換膚的本質＝**改 `--mat-sys-*` 這組官方 token 的值**。分兩層：

```
┌─ 第 1 層：底層色 palette（主題私有，前綴底線標示，只在 themes/ 內出現）
│    --_primary-50 … 900   --_accent-50 … 900   --_neutral-0 … 900
│    （每套主題自己的色階，只拿來算出自己的 M3 token 值）
│
└─ 第 2 層：M3 sys token（＝契約，全站唯一能綁的東西）
     顏色  --mat-sys-primary / on-primary / surface / surface-container-* /
           on-surface / on-surface-variant / outline / outline-variant / error …
     字體  --mat-sys-{display,headline,title,body,label}-{large,medium,small}
           （及其 -size / -weight / -line-height / -font / -tracking 子 token）
     圓角  --mat-sys-corner-{none,extra-small,small,medium,large,extra-large,full}
     陰影  --mat-sys-level0 … level5
```

**契約的意義**：`--mat-sys-*` 那組名字是骨架與所有元件的唯一依賴。每套主題把要換的 token
給新值（通常換顏色；想換圓角/字體風格也行，因為都是 token）。骨架只認 token 名、不認值。

底層 palette（第 1 層）是主題**私有**：只用來算自己那套 M3 token 值，元件/畫面/外殼一律不得直接引用，
也不得寫死色碼。**間距不進 CSS 變數層——用 Tailwind utility（`p-4` 等）。**

### 必要例外（M3 天生沒有，最小自創、明確標記為 app 擴充）
- **狀態色 success / warning / info**：M3 只有 `error`。後台需要「可租借（綠）／保養（黃）／逾期（紅）」等，
  建一小組 `--app-success-{bg,fg,dot}`、`--app-warning-*`、`--app-info-*`（命名與 `--mat-sys-` 區隔，不冒充官方）。
  每套主題比照 M3 token 一起給值。
- **時間軸/圖表色 viz**：優先用 M3 的 `primary/secondary/tertiary` 及其 container 變體充當；
  真的不夠再最小自創 `--app-viz-*`（實作時盤點 timeline/calendar 用色後決定，能不創就不創）。

---

## 4. 現有自創 token → M3 對應（改寫方向）

現在 `styles.scss` 有一層自創語意名（`--surface-*`、`--text-*`、`--border-*`、`--radius-*`、`--shadow-*`、`--font-*`）。
本次把它們**移除**，元件改綁對應的 M3 token：

| 現有自創 | 改綁 M3 token |
|---|---|
| `--surface-app` | `--mat-sys-background` |
| `--surface-card` / `--surface-card-alt` | `--mat-sys-surface` / `--mat-sys-surface-container-low` |
| `--surface-sunken` | `--mat-sys-surface-container` |
| `--surface-inverse` | `--mat-sys-inverse-surface` |
| `--surface-brand` | `--mat-sys-primary` |
| `--surface-pill` | `--mat-sys-surface-container-high` |
| `--text-primary` | `--mat-sys-on-surface` |
| `--text-secondary` / `--text-tertiary` | `--mat-sys-on-surface-variant` |
| `--text-on-brand` | `--mat-sys-on-primary` |
| `--text-on-inverse(-muted)` | `--mat-sys-inverse-on-surface` |
| `--border-subtle` / `--border-default` | `--mat-sys-outline-variant` / `--mat-sys-outline` |
| `--radius-*` | `--mat-sys-corner-*`（sm→small、md→medium、lg→large、xl→extra-large、pill→full） |
| `--shadow-*` | `--mat-sys-level1 … level4` |
| `--font-display` / `--font-body` | M3 type role（標題→`headline`/`title`，內文→`body`；用 token 或 Material typography class） |
| `--status-error-*` | `--mat-sys-error` / `--mat-sys-error-container` / `--mat-sys-on-error-container` |
| `--status-{success,warning,info}-*` | **app 擴充** `--app-{success,warning,info}-*`（見 §3 例外） |
| `--viz-*` | 優先 M3 container 色；不足才 `--app-viz-*`（見 §3 例外） |

（`--surface-shell`、`--text-on-shell` 等我上一版自創的名字**取消**，改對到上表 M3 token。）

---

## 5. 要修的「寫死 / 直綁底層色」清單（約 20 處）

grep 出、目前跳過 token、直接綁底層色或寫死色碼的地方。要改成綁 §4 的 M3 token。
**這是本 spec 主要的一次性工作量，範圍明確可控。**

| 檔案 | 現況 | 改綁 |
|---|---|---|
| `app.scss`（外殼） | `--cream-25/50`（側欄底）、`--sage-400/500/600`、`--teal-100/200/900`、`#fff`×2 | `--mat-sys-surface-container-*`、`--mat-sys-primary`、`--mat-sys-on-*` |
| `dispatch/timeline-view.component.ts` | inline `--teal-500` `--sage-500` `--cream-300` `#fff` | M3 container 色 / `--app-viz-*`、`--mat-sys-on-primary` |
| `dispatch/calendar-view.component.ts` | `--sage-100` `--sage-600` | `--app-success-bg` / `--mat-sys-primary`（依用途，實作時定） |
| `dashboard/dashboard-page.component.scss` | `--teal-700` | `--mat-sys-inverse-surface` 或 on-surface（依用途） |
| `shared/status-chip.component.ts` | `--cream-400`（gray dot 預設） | `--mat-sys-outline` |
| 現有 `styles.scss` 自創語意層 | `--surface-*`/`--text-*`/`--radius-*`… | 整層移除，改由 §4 對應 |

修完後 `themes/` 以外應為 **0 處** 底層色/寫死色。

---

## 6. 檔案結構

```
src/styles.scss                 // 精簡入口：Material theme + skeleton + 主題註冊表
src/styles/
  _skeleton.scss                // 主題無關：.v-card / .v-nav-pill / Material 結構性覆寫
                                //   → 只綁 --mat-sys-* 與 --app-* 擴充，永不碰底層色、不寫死色
  _contract.scss                // 文件性質：列出本專案用到的 M3 token + app 擴充 token 清單
  themes/
    _registry.scss              // 把每套主題掛到 :root[data-theme="x"]
    verdant/
      _palette.scss             // 主題私有底層色 --_primary/_accent/_neutral
      _theme.scss               // 底層色 → 填 --mat-sys-* 與 --app-* 的值
    midnight/
      _palette.scss
      _theme.scss

src/app/core/theme/
  theme.service.ts              // signal；設 html[data-theme]；存 localStorage；啟動時還原
  theme.token.ts                // 主題清單常數（id + 顯示名）
src/app/shared/
  theme-switcher.component.*     // 展示/開發用切換器（project-time 可刪）
```

- 預設主題：`verdant`。
- Tailwind `@theme` 的 `--color-*` 色票鏡像：畫面未使用（grep 零命中 `bg-sage-*`），**移除**以減少維護面；
  字體鏡像視 `font-display` class 使用情況保留或移除（實作時確認）。
- Material 仍以 `mat.theme()` 起底，再由各主題在 `[data-theme]` 下覆寫 `--mat-sys-*`。

---

## 7. Runtime 換膚機制（設計師視角）

把兩套主題想成 Figma 的兩個 **Mode**（像 Light / Dark mode）。每個用途 token 在兩個 mode 各有一個值。

- 「換膚」＝在畫面最外層貼一張標籤 `<html data-theme="midnight">`。貼上的瞬間，全站綁 token 的地方同時切到那個 mode 的值——如同在 Figma 把整個 frame 從 Light 切成 Dark。
- 因為元件綁「用途 token」不綁「顏色本身」，切換一次到位、不用逐一改、**不會跑版**（尺寸/間距/圓角沒動，只有值換掉）。
- 技術上：`ThemeService`（signal）設 `document.documentElement.dataset.theme`，並存 `localStorage('cr.theme')`；app 啟動時還原，無值用預設。
- 換膚器元件：一個下拉，列 `theme.token.ts` 的主題，呼叫 `setTheme`。放在外殼（登出鈕旁）。

---

## 8. Project-time 鎖定（初始化步驟，寫進 README）

複製到新專案後要收斂成單一主題時：
1. 把 `ThemeService` 預設值設成要用的那套（或直接在 `<html>` 寫死 `data-theme`）。
2. （可選）刪 `shared/theme-switcher.component` 與外殼上的引用。
3. （可選）刪 `styles/themes/` 內用不到的主題資料夾，`_registry.scss` 移除對應 `@use`。

runtime 能力隨時可加回來。這是「可減可加」，不是二選一。

---

## 9. 防漏機制（讓邊界不會爛掉）

新增 `npm run lint:theme`：零依賴 node 腳本，掃 `src/app/**` 與 `src/styles/**`，
**只排除** `src/styles/themes/**`（底層色只准出現在這裡）。在其他地方若出現：
- 底層色 `var(--_primary/_accent/_neutral-數字)`，或
- 十六進位色碼（`#xxx`/`#xxxxxx`）

即 **exit 1** 並列出檔案:行號。（掃描含 `_skeleton.scss`，確保骨架也不寫死色。`--mat-sys-*` 與 `--app-*` 是允許的。）
納入 CI / commit 前檢查。這是「綁 token」規則能長期成立的關鍵。

---

## 10. 深色 Midnight 主題規格（證明用）

| 用途 token | Verdant | Midnight |
|---|---|---|
| `--mat-sys-background` | 米白 | 深靖藍 |
| `--mat-sys-surface` | 白 | 深灰 |
| `--mat-sys-primary` | 鼠尾草綠 | 冷藍 |
| `--mat-sys-on-surface` | 深 | 亮（近白） |
| `--mat-sys-outline(-variant)` | 淺灰 | 深色系中的可辨邊線 |
| `--app-{success,warning,info}-*` | 亮底彩 | 深底、提高前景對比 |

Midnight 要把用到的 M3 token + `--app-*` 給出深色版值。目標：切過去**只有顏色變、版面完全不動**。
（字體/圓角 token 跨主題沿用同一組值，除非某主題刻意要改風格。）

---

## 11. README 要寫什麼（回應「防漏腳本會在 README 嗎」）

README 是這個 template 的使用說明書，本次補三段：
1. **給開發者的樣式規則**：顏色/字體/圓角一律綁 `--mat-sys-*`（或 `--app-*` 擴充），間距用 Tailwind；
   不准寫死色碼；存檔/送 CI 前跑 `npm run lint:theme`。
2. **如何新增一套主題**：複製 `themes/verdant/` → 改 `_palette.scss` 底層色 → `_registry.scss` 註冊 → 加進 `theme.token.ts`。
3. **鎖成單一主題（初始化步驟）**：即 §8。

---

## 12. 驗收條件（逐條要有證據）

1. `npm run build` exit 0。
2. 既有測試全綠（目前 45 個）。
3. `npm run lint:theme` 通過：`themes/` 以外 0 處底層色/寫死色。
4. 兩套主題各自在 **vehicles、bookings、dashboard** 三頁、**桌機 + 390px** 目視對照：版面一致、只有配色不同、無破圖、無對比過低。
5. 換膚器即時切換：切換前後無 layout shift（截圖對照）。
6. 「鎖定」步驟照 README 走一遍：設死單一主題後畫面正常、切換器移除後無錯。

---

## 13. 非目標（YAGNI）

- 不做 auth、權限、CRUD scaffold、domain 抽離（各自另開 spec）。
- 不做 per-component 主題覆寫、不做主題編輯器 UI。
- 不引入重型主題庫 / CSS-in-JS。
- 不自動跟隨系統 light/dark（Midnight 是手動選；日後要跟隨 `prefers-color-scheme` 再加）。
- 不建自創間距/字級尺標（沿用 M3 type scale 與 Tailwind 間距）。
