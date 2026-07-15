# 雙軸主題系統設計（範式 Paradigm × 配色 Color-theme）

日期：2026-07-15
狀態：設計定案，待寫實作計畫
範圍：**只做換膚（styling）邊界，不改任何功能行為。**

---

## 1. 背景與策略

car-rental 這個 repo 定位為 **參考產品 / sandbox**：真實把功能畫面做出來，未來的 ERP/CRM
template 從這份可運作的產品「抽出來」，而不是憑空建空殼。所以**現在不 fork、不另開 repo**，
繼續在這裡做。

本 spec 只處理「換膚邊界」——它是使用者長期要重複做的事（一直增加 UI style），每多一個畫面
就可能多欠一筆「顏色/尺寸寫死」的債。先把邊界立好，之後每個新畫面自動守規矩。

### 明確延後（各自另開 spec）
- 登入/登出、路由守衛、角色權限骨架
- 通用 CRUD scaffold
- 把 car-rental 領域內容抽乾淨、變成純 template
- `core`＋`shared` 不得引用 `features` 的大範圍隔離（本 spec 只做「樣式」這條）

---

## 2. 核心模型：兩個正交的維度

一個畫面的外觀 = **選一個範式 ＋ 選一個配色**。兩軸獨立、可自由組合：

|  | Verdant 綠 | Midnight 深 | …（配色軸） |
|---|---|---|---|
| **Material** | ✓ | ✓ | |
| **Glass**（未來） | ✓ | ✓ | |
| **Neumorphism**（未來） | ✓ | ✓ | |

N 個範式 ＋ M 個配色 = N×M 種樣子，只維護 N＋M 份。技術上就是最外層兩個獨立屬性：
`<html data-paradigm="material" data-theme="verdant">`。

### 兩軸各管什麼

| | 管什麼 | 內容 | 例 |
|---|---|---|---|
| **配色包** color-theme（可獨立換） | **只管顏色** | 主色/表面/文字/邊線的顏色值、5–6 個狀態 tone 的顏色 | Verdant、Midnight |
| **範式包** paradigm（可獨立換） | **管造型結構** | button/card/table/status/typography 的樣式規則 ＋ 造型 token（圓角/陰影/模糊/光邊/字體） | Material、Glass、Neumo |

同一配色可套不同範式；同一範式可換不同配色。Material+Verdant 與 Material+Midnight 只差在顏色，
造型（圓角/陰影/字體）一樣。

### 決策彙整（已與使用者確認）

| 決策 | 選定 |
|---|---|
| 主題結構 | 二維：範式 × 配色，兩獨立屬性切換 |
| Token 詞彙 | Material 3 sys token（`--mat-sys-*`）為單一詞彙表；顏色值來自配色包、造型值來自範式包 |
| 間距 | 交給 Tailwind（`p-4`/`gap-3`，4px 網格＝對齊 M3 4dp），不進 CSS 變數 |
| 元件樣式歸屬 | 每範式一份（因跨範式結構本質不同）；但顏色/字體仍綁 token |
| 換膚時機 | runtime 即時切（兩軸各一個下拉）＋ project-time 可鎖 |
| 第一個計畫範圍 | 雙軸結構就位；範式軸先 Material 一個；配色軸做 Verdant＋Midnight 兩個 |

---

## 3. 契約：從「token 名」升級成「class 名單」（CSS Zen Garden 模型）

因為元件樣式每範式一份，契約不只是 token，而是**骨架 HTML 用的一組固定 class**。
每個範式包必須實作這同一組 class；骨架的 HTML 與功能永不動，變的是「哪一包 CSS 認這些 class」。
如同 CSS Zen Garden：同一份 HTML，套不同 CSS，就是另一個世界。

Class 契約（初版，實作時定稿並寫進 `_contract.scss`）。**命名慣例**：
- **前綴中性**：元件一律 `ui-`（代表設計系統元件，不綁配色/範式）；暫時狀態用 `is-`。
- **BEM 階層**：`ui-區塊__元素--修飾`（`ui-card__header--compact`）。
- **名字描述角色、不描述長相**：`--ghost` 不叫 `--transparent`（換到 Neumo 後 ghost 未必透明）。

| 元件 | class |
|---|---|
| 卡片 | `.ui-card` `.ui-card__header` `.ui-card__body` `.ui-card__actions`；`.ui-card--clickable` |
| 按鈕 | `.ui-btn`；尺寸 `--sm/--md/--lg`；樣式 `--solid`(預設)`/--outline/--ghost/--text`；語意色 tone `--primary/--danger`（可與樣式組合，如 `.ui-btn--outline.ui-btn--danger`） |
| 表格 | `.ui-table` `.ui-table__head` `.ui-table__row` `.ui-table__cell` |
| 狀態晶片 | `.ui-chip` + tone `--positive/--info/--neutral/--warning/--danger`（見 §5） |
| 排版 | `.ui-text-{display,title,heading,body,label,caption}` |
| 暫時狀態 | `.is-active` `.is-loading` `.is-disabled` `.is-selected` … |

（現有 `.v-card`/`.v-nav-pill`/`.v-page-title`/`.v-stat-number`/`.v-card-label` 等舊 class 一併改為 `ui-` 體系。）

**M3 token 仍是唯一詞彙表**：顏色 token（primary/surface/on-surface…）由配色包給值，
造型 token（corner-*/level*/字體）由範式包給值。Glass/Neumo 需要 M3 沒有的東西
（`backdrop-filter`、`inset` 陰影）——那些不是 token，是範式 recipe 裡的 CSS。

---

## 4. 檔案結構

```
src/styles.scss                    // 入口：mat.theme() 起底 + skeleton + 兩軸註冊表
src/styles/
  _skeleton.scss                   // 主題無關：CSS reset、layout 容器結構（用 Tailwind 間距）
                                   //   幾乎不含視覺；不碰顏色、不寫死色
  _contract.scss                   // 文件：class 名單契約 + 用到的 M3 token + --app-* 清單

  paradigms/                       // 【範式軸】= 造型（recipe + 造型 token）
    _registry.scss                 // 掛 :root[data-paradigm="x"]
    material/
      _tokens.scss                 // 造型 token 值：--mat-sys-corner-*、--mat-sys-level*、字體
      buttons.scss card.scss table.scss status.scss typography.scss   // 吃顏色 token
    (glass/ neumorphism/ 為未來插槽，本次不做)

  color-themes/                    // 【配色軸】= 顏色 token 值（唯一允許出現色碼的地方）
    _registry.scss                 // 掛 :root[data-theme="x"]
    verdant/  _tokens.scss         // --mat-sys-primary/surface/on-surface…、--app-{tone}-*
    midnight/ _tokens.scss

src/app/core/theme/
  theme.service.ts                 // 管 data-paradigm + data-theme 兩屬性；各存 localStorage；啟動還原
  theme.token.ts                   // 範式清單 + 配色清單常數（id + 顯示名）
  status-tone.ts                   // 狀態→tone 單一真相源（見 §5）
src/app/shared/
  theme-switcher.component.*        // 兩個下拉：範式、配色（project-time 可刪）
  status-chip.component.*           // 改吃 StatusKey（見 §5）
```

- 預設：`data-paradigm="material"`、`data-theme="verdant"`。
- Tailwind `@theme` 的 `--color-*` 色票鏡像：畫面未使用，移除以減維護；字體鏡像視使用情況。
- **本計畫範圍邊界**：不追求把每個元件都完美歸位。先做「雙軸骨架＋切換＋ 5 類核心元件 recipe（Material）＋ 2 配色」證明架構；其餘元件（外殼細節等）之後漸進搬入，本次只要求它們不寫死色、綁 token。

---

## 5. 狀態：型別安全的單一真相源（防同事亂引用）

20+ 個業務狀態在視覺上收斂成 5–6 個 **tone**。不是定 20 種顏色，是定 5–6 個 tone
（顏色是配色 token），每個狀態對應一個 tone。做成程式碼真相源——同事只能從清單選、打錯編譯不過，
比註解強：

```ts
// core/theme/status-tone.ts —— 單一真相源
export const STATUS_TONE = {
  success:'positive', approved:'positive', completed:'positive', active:'positive', online:'positive',
  info:'info', processing:'info', loading:'info', queued:'info', pending:'info',
  draft:'neutral', inactive:'neutral', archived:'neutral', offline:'neutral', empty:'neutral', noResult:'neutral',
  warning:'warning',
  error:'danger', critical:'danger', rejected:'danger', cancelled:'danger',
} as const;
export type StatusKey = keyof typeof STATUS_TONE;   // 同事只能從這裡選
export type Tone = typeof STATUS_TONE[StatusKey];   // positive|info|neutral|warning|danger
```

- **tone 的顏色值**（positive/info/neutral/warning/danger 各自的底/字/點）= **配色包**的 `--app-{tone}-*`
  （M3 只有 danger≈error，其餘為必要的 app 擴充）。
- **tone 的造型**（chip 圓角、是否有 dot、邊框）= **範式包**的 `status.scss`。
- `status-chip` 元件輸入 `StatusKey`，內部查表得 tone，套 `.v-chip--{tone}`。

---

## 6. Typography：中英分軌

字體 family 拆兩軌 token，**字級/行高/字重用 M3 type scale**：
- `--font-zh`：中文固定 Noto Sans TC / Noto Serif TC。
- `--font-en`：英文依**範式**換（Material 用一種、Glass/Neumo 各自風格）。
- `typography.scss`（範式包內）定義 `.v-text-{display,title,heading,body,label,caption}` 綁 M3 type token
  ＋ `font-family: var(--font-en), var(--font-zh), sans-serif`。

---

## 7. Runtime 換膚機制（設計師視角）

把兩軸想成 Figma 的**元件庫（範式）× 變數 Mode（配色）**。換膚＝在最外層改 `data-paradigm` /
`data-theme` 兩張標籤之一，全站綁 token / class 的地方同時切到對應值，像把整個 frame 換一套元件庫或換一個 mode。

- 因為元件綁「用途 token / 契約 class」不綁「顏色本身」，切換一次到位、不跑版（尺寸/間距沒動）。
- `ThemeService`（signal）設 `document.documentElement.dataset.paradigm/theme`，各存 `localStorage`；
  啟動時還原，無值用預設。
- 換膚器：兩個下拉（範式、配色），放外殼（登出鈕旁）。

---

## 8. Project-time 鎖定（初始化步驟，寫進 README）

複製到新專案要收斂時：
1. `ThemeService` 預設值設死要用的範式＋配色（或直接寫死 `<html>` 兩屬性）。
2. （可選）刪換膚器元件與外殼引用。
3. （可選）刪用不到的 `paradigms/*`、`color-themes/*` 資料夾，各自 `_registry.scss` 移除 `@use`。

runtime 能力隨時可加回來。可減可加，不是二選一。

---

## 9. 防漏機制

`npm run lint:theme`：零依賴 node 腳本，掃 `src/app/**` 與 `src/styles/**`，
**只排除 `src/styles/color-themes/**`**（顏色值的唯一來源）與各範式的 `_tokens.scss`（造型 token 定義處）。
其餘地方若出現十六進位色碼（`#xxx`/`#xxxxxx`）或底層色階變數，即 **exit 1** 並列檔案:行號。
（`--mat-sys-*` 與 `--app-*` 允許。範式 recipe 只能用 token 表達顏色，不得寫死。）納入 CI / commit 前檢查。

---

## 10. 第一個計畫要做出的東西（範圍清單）

1. 檔案結構 §4：`paradigms/material/`（5 個 recipe + `_tokens.scss`）、`color-themes/{verdant,midnight}/_tokens.scss`、兩個 `_registry.scss`、精簡 `styles.scss`、`_skeleton.scss`、`_contract.scss`。
2. 把現有 `styles.scss` 自創語意層拆解：顏色 → 配色包；造型 → material 範式 `_tokens`；元件樣式 → material 範式 recipe。
3. 修 §11 的寫死清單（約 20 處）改綁 token。
4. `ThemeService` + `theme.token.ts` + 兩軸換膚器 + `status-tone.ts` + `status-chip` 改吃 `StatusKey`。
5. **Midnight 配色包**：覆寫 §12 的顏色 token 深色值。
6. `lint:theme` 腳本 + npm script。
7. README 三段（§13）。

---

## 11. 要修的「寫死 / 直綁底層色」清單（約 20 處）

grep 出、目前跳過 token 的地方，改綁對應 M3 token（顏色來自配色包）：

| 檔案 | 現況 | 改綁 |
|---|---|---|
| `app.scss`（外殼） | `--cream-25/50`、`--sage-400/500/600`、`--teal-100/200/900`、`#fff`×2 | `--mat-sys-surface-container-*`、`--mat-sys-primary`、`--mat-sys-on-*` |
| `dispatch/timeline-view.component.ts` | inline `--teal-500` `--sage-500` `--cream-300` `#fff` | M3 container 色 / `--app-viz-*`、`--mat-sys-on-primary` |
| `dispatch/calendar-view.component.ts` | `--sage-100` `--sage-600` | `--app-success-bg` / `--mat-sys-primary`（依用途，實作時定） |
| `dashboard/dashboard-page.component.scss` | `--teal-700` | `--mat-sys-inverse-surface` 或 on-surface |
| `shared/status-chip.component.ts` | `--cream-400` | `--mat-sys-outline` |
| 現有 `styles.scss` 自創語意層 | `--surface-*`/`--text-*`/`--radius-*`… | 拆進配色包 / material 範式（見 §10.2） |

修完後 `color-themes/` 與範式 `_tokens.scss` 以外應為 **0 處** 底層色/寫死色。

---

## 12. Midnight 配色包規格（證明配色軸可換）

只覆寫**顏色** token（造型沿用 Material 範式，不動）：

| 顏色 token | Verdant | Midnight |
|---|---|---|
| `--mat-sys-background` | 米白 | 深靖藍 |
| `--mat-sys-surface` | 白 | 深灰 |
| `--mat-sys-primary` | 鼠尾草綠 | 冷藍 |
| `--mat-sys-on-surface` | 深 | 亮（近白） |
| `--mat-sys-outline(-variant)` | 淺灰 | 深色系可辨邊線 |
| `--app-{positive,info,neutral,warning,danger}-*` | 亮底彩 | 深底、提高前景對比 |

目標：`data-theme` 切 verdant↔midnight（範式維持 material），**只有顏色變、版面完全不動**。

---

## 13. README 要寫什麼

1. **樣式規則**：顏色/字體/圓角綁 `--mat-sys-*`／`--app-*`，間距用 Tailwind；不准寫死色；存檔/CI 前跑 `npm run lint:theme`。
2. **如何新增一套配色**：複製 `color-themes/verdant/` → 改顏色 token → `_registry.scss` 註冊 → 加進 `theme.token.ts`。
3. **如何新增一個範式**：複製 `paradigms/material/` → 依 §3 class 契約重寫 recipe（可用 `backdrop-filter` 等自由 CSS）→ 註冊。
4. **鎖成單一主題（初始化步驟）**：即 §8。

---

## 14. 驗收條件（逐條要有證據）

1. `npm run build` exit 0。
2. 既有測試全綠（目前 45 個）。
3. `npm run lint:theme` 通過：允許區以外 0 處底層色/寫死色。
4. **配色軸**：範式固定 material，`data-theme` 切 verdant↔midnight，vehicles/bookings/dashboard 三頁、桌機＋390px 目視：版面一致、只有配色變、無破圖、對比足夠。
5. **範式軸插槽**：`data-paradigm` 屬性機制就位，切換器可選（雖只有 material 一個）；`_registry.scss` 結構可直接加第二個範式。
6. 換膚即時、無 layout shift（截圖對照）。
7. 「鎖定」步驟照 README 走一遍：設死後畫面正常、切換器移除後無錯。

---

## 15. 非目標（YAGNI）

- 本次**不做** Glass / Neumorphism 範式（範式軸只做 Material，插槽預留）。
- 不做 auth、權限、CRUD scaffold、domain 抽離（各自另開 spec）。
- 不做主題編輯器 UI、不自動跟隨系統 light/dark。
- 不引入重型主題庫 / CSS-in-JS。
- 不建自創間距/字級尺標（沿用 M3 type scale 與 Tailwind 間距）。

### 未來範式軸的已知硬點（記錄，非本次範圍）
做 Glass/Neumo 時，高頻視覺元件（button/card/table）要盡量用自訂 class、少依賴 Material 元件內部
（深度覆寫 `mat-button` 內部脆弱、跟版本綁）。Material 留給複雜互動元件（日期選擇、下拉浮層）。
本次 class 契約（§3）已為此鋪路——骨架用 `.v-*` 契約 class，未來範式可完全接管其樣式。
