# Verdant 元件 CSS 配方（自 React 原始碼萃取，restyle Angular 時對照用）

以下值皆引用 `../tokens/*.css` 的 CSS 變數。

## Button（膠囊按鈕）
- 共通：`display:inline-flex; align-items:center; justify-content:center; font-family:var(--font-body); font-weight:600; border-radius:var(--radius-pill); white-space:nowrap; transition: filter var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);`
- 尺寸 sm `padding:8px 16px; font-size:var(--text-size-sm); gap:6px`；md `11px 20px / base / gap 8`；lg `14px 26px / md / gap 8`
- variant primary：`background:var(--surface-brand); color:var(--text-on-brand); border:1px solid transparent`
- variant inverse：`background:var(--teal-700); color:#fff`
- variant secondary：`background:var(--surface-pill); color:var(--text-primary)`
- variant outline：`background:transparent; color:var(--text-primary); border:1px solid var(--border-default)`
- variant ghost：`background:transparent; color:var(--text-secondary)`
- disabled：`background:var(--cream-100); color:var(--text-tertiary); border:1px solid var(--border-subtle)`
- hover：`filter:brightness(0.96)`；press：`transform:scale(0.97)`
- icon 尺寸 16×16

## StatusPill（狀態膠囊，帶圓點）
- `display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:var(--radius-pill); font-weight:600; font-size:var(--text-size-xs); font-family:var(--font-body)`
- 圓點：`width:6px; height:6px; border-radius:50%`
- tone success：bg `--status-success-bg` / fg `--status-success-fg` / dot `--status-success-dot`
- tone warning / error / info 同構；neutral：bg `--surface-pill`、fg `--text-secondary`、dot `--cream-400`

## NavPills（頂部導覽膠囊列）
- 容器：`display:flex; align-items:center; gap:6px`
- 每顆：`padding:10px 20px; border-radius:var(--radius-pill); border:none; font-weight:600; font-size:var(--text-size-base)`
- active：`background:var(--surface-brand); color:var(--text-on-brand)`；inactive：`background:transparent; color:var(--text-secondary)`
- transition：`background/color var(--duration-fast) var(--ease-standard)`

## Card（基礎卡片）
- light（預設）：`background:var(--surface-card); color:var(--text-primary); border-radius:var(--radius-lg); padding:var(--space-6); box-shadow:var(--shadow-xs); border:1px solid var(--border-subtle)`
- dark（hero 卡）：`background:var(--surface-inverse); color:#fff; border:none; box-shadow:none`
- sunken：`background:var(--surface-sunken)`

## StatCard（大數字統計卡）
- 基於 Card；`min-width:140px`
- 頂列：icon 圓形 32×32（light 卡用 `--teal-800` 底白 icon；dark 卡用 `rgba(255,255,255,.14)`）＋ delta 膠囊（`font-weight:700; font-size:xs; padding:3px 9px; radius pill; bg --status-success-bg; fg --status-success-fg`；dark 卡改 `rgba(255,255,255,.16)`/#fff）
- 大數字：`font-family:var(--font-display); font-weight:800; font-size:var(--text-size-2xl); letter-spacing:-0.02em; line-height:1`
- 標籤：`margin-top:6px; font-size:var(--text-size-sm); color:var(--text-secondary)`（dark 卡 `--text-on-inverse-muted`）

## Input（圓角搜尋/文字輸入）
- 外框：`display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:var(--radius-pill); background:var(--surface-pill); min-width:200px`
- 前置 icon 16×16 `color:var(--text-tertiary)`
- 內部 input：無邊框透明底，`font-size:var(--text-size-base); color:var(--text-primary)`
- focus 可用 `box-shadow:var(--shadow-focus)`

## 佈局原則（web-dashboard）
- app 背景 `--surface-app`（暖米白 #f7f5f0），卡片純白，兩層對比
- 頂部 bar：wordmark ＋ NavPills 置中導覽 ＋ 搜尋/IconButton/Avatar
- 卡片間距 20–24px、卡片內距 ~24px，寬鬆呼吸感
- 深 teal hero 卡限少數重點卡；不做漸層、不做花紋（唯一例外：photo placeholder）
- icon 一律 Lucide 線條（24 grid、2px stroke），無 emoji
- 中文顯示字體：Noto Sans SC 優先（--font-display 已含）
