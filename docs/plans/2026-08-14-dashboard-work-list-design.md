# Dashboard 今日工作清單設計

## 目標

在 Dashboard 原本移除的取車／還車區域新增「今日工作清單」表格，使用共用 `lib-data-table` 顯示選定日期的取車與還車工作，並提供明日還車預告。

## 資料與日期來源

- 預約資料沿用 `BookingStore.bookings()`。
- 車輛資料沿用 `VehicleStore.vehicles()`。
- 客戶姓名與電話沿用 `CustomerStore`。
- Calendar 的選定日期作為工作清單日期主來源；今日／明日按鈕作為快捷切換。
- 目前模型沒有航班／船班、洗車狀態與獨立付款狀態欄位，這些欄位先顯示 `—` 或依既有資料可安全推導的狀態，不擴充資料模型。

## UI 設計

- 標題為「今日工作清單」，右側保留今日／明日切換，顯示日期。
- 取車區段顯示選定日期的有效預約，包含車牌／車型、客戶、時間、地點、電話動作與可取得的付款狀態。
- 還車區段顯示選定日期的有效預約；若當日無還車，顯示空狀態並列出明日還車預告，協助整備。
- 使用 `lib-data-table` 標準欄位與 mobile cards 模式，操作欄不匯出。
- 電話按鈕使用 `tel:` 連結並提供可讀文字，不使用 icon-only button。

## 元件與資料流

Dashboard 持有日期與工作清單 computed，Calendar 透過日期變更事件回傳選取日期；Dashboard 將日期傳給 Calendar、Timeline 與工作清單。工作清單由 Dashboard template 組成，使用 `DataTableComponent` 與 `DataTableCellDirective`，不新增全域 store。

## 驗證

- 測試今日／明日切換會更新工作清單資料。
- 測試取車／還車只包含 Calendar 相同的有效預約狀態。
- 測試無當日還車時顯示明日預告。
- 測試 Calendar 選取日期後工作清單同步。
- 執行 admin test、相關 lint 與 `git diff --check`。
