# 訂單頁面化：前端與設計接續待辦

**日期：** 2026-09-22 起草，2026-09-23 更新（同日：第 1、2、4、5 節完成）
**狀態：** 訂單頁面化已合併 `main`（merge commit `cecda36`）。第 1 節（更名）與第 2 節（官網多語系）也已合併 `main`（merge commit `1bb110c`）；第 4、5 節隨後合併
**給誰：** 設計＋前端接手的人（也就是下一次的自己）
**相關文件：** 術語 `CONTEXT.md`、決策 `docs/adr/0001-order-creation-not-shared-with-booking-site.md`、後端 `docs/plans/2026-09-22-orders-page-backend-handoff.md`、業主 `docs/owner-questions.md`

## 從這裡開始（給下一個 session）

**2026-09-23～24 的後台流程審查（`docs/plans/2026-09-23-admin-flow-review.md`）已經把下方
第 6 節的調度相關項目與第 7 節的部分小問題處理掉了**——那份計畫四批全部完成、在分支
`feat/admin-flow-review`（尚未合併 `main`），細節與完成後跟原規格不同的地方見它文末的
「完成紀錄」；下方第 6、7 節對應處已逐條加註。

**目前基準線**（2026-09-23 實測，不是估計；下方數字是本文件當時起草時的基準，`feat/
admin-flow-review` 合併後會再往上動，屆時請以該分支「完成紀錄」的驗收數字為準）：

- 全專案 9 個 app/lib，**856 個測試全過**，沒有任何已知失敗。`feat/admin-flow-review`
  完成時（尚未合併）已增加到 **1,267 個測試全過**。
- 建置全過，**只有一個警告**：空殼 app `pos` 的 Nx 樣板頁樣式超標。這是刻意留著的，等 pos 開工時刪掉那頁即可——不要為了消警告去調它的門檻。
- lint 只剩 **14 個 error**，全是 lib 元件 selector 前綴（booking-flow 13、theme-pack 1），已決定併進第 1 節的更名任務。`feat/admin-flow-review` 完成時分布變成 booking-flow
  12、theme-pack 1、**affiliate 1**（總數仍是 14），推測是雙月日期區間選擇器搬進
  `libs/ui` 牽動的連鎖——尚未逐一核對，併入第 1 節更名任務時請重新盤點一次。
- 環境：`.nvmrc` 是 **Node 24**，但預設 shell 常是 22。跑任何 nx 指令前先 `export PATH=~/.nvm/versions/node/v24.18.0/bin:$PATH`，並加 `NX_DAEMON=false`。

**建議的接手順序：**

1. **先看 `docs/owner-questions.md`**——10 條已填入我方暫定決定，等業主會議確認。其中第 1、3 條一旦確認就要開發（見下方第 6 節與第 3 節），**在確認之前不要動那兩塊**。截至 2026-09-23 下午仍是「暫定，待業主會議確認」，所以這兩塊還沒動。
2. ~~`bookings → orders` 全面更名~~（第 1 節）：**已完成**，含 lint 清零。
3. ~~官網多語系~~（第 2 節）：**已完成**；剩下的是業主確認與翻譯校對（見第 2 節「還沒做的」）。
4. ~~建單積木搬到 lib~~（第 4 節）、~~mock 資料彙整~~（第 5 節）：**已完成**。
5. 接下來不必等業主的只剩第 6 節（調度畫面改進）與第 7 節的零星問題。

**動工前請先確認工作區乾淨**——這個 repo 常有多個 session 並行（`.worktrees/` 下有數個），未提交的改動容易被別的 session 一起 commit 走。

## 0. 這次做完了什麼

- 建立訂單改為 `/orders/new` 頁面，非線性 `mat-stepper`，「建立訂單」每一步都能按，錯誤在按下後才亮在步驟標題上。
- 訂單工作區改為 `/orders/:id`「訂單詳情」頁，總覽分頁「檢視 → 編輯 → 明確儲存」。
- 合約檢視＋簽署抽成共用 lib `libs/contract-signing`，建單第四步與合約分頁共用同一個 dialog。
- 據點統一：四個具體據點，車輛所在據點／取車／還車都存據點 id，舊值自動遷移。
- 調度行事曆的取車清單標示「需調度」並可篩選；車輛表單可設定所在據點。
- 付款方式選項與預設標籤下放 `libs/domain`；官網 `lang` 修正、付款標籤去重、官網標籤改為可覆寫的 token。
- 官網「選保險方案」這一步接回流程（09-18 曾被暫時拿掉，期間保費一律算成 0），保險方案改為依車種的目錄、六台車都有三個級距可選。
- 修掉三個開工前就壞的測試、清掉除元件前綴外的所有 lint error、重訂三個 app 的 bundle 預算門檻（原本是 Angular 預設值，長年在響）。
- 沿路修掉的既有問題：合約時間顯示成 UTC（差 8 小時）、車輛存檔會清空保險到期日、`affiliate` 測試長期編譯失敗、選方案頁從第一版就有的桌機版面 bug。
- 文件：新增術語表 `CONTEXT.md`、ADR 0001、三份交接文件；五份架構文件逐條對照程式碼更新；初版規劃書封存、`docs/superpowers/` 移除。

以下是**刻意沒做**、留給之後的事，依建議順序排列。

## 1. `bookings → orders` 全面更名（2026-09-23 完成）

commit `407c3cc`，純機械改名，除網址外沒有行為變更。

**做了什麼：**
- 路由：`/bookings` → `/orders`（列表併進 `ORDER_ROUTES` 的空路徑）、`/bookings/members` → `/members`。**舊網址會轉址**，書籤不會壞。
- 側欄：`/orders/*` 本來就會被「訂單管理」的前綴比對涵蓋，不再需要特例；`matchPrefixes` 改成 `['/members']`，讓會員管理頁的頁首仍顯示「訂單管理」（會員頁從訂單列表進入，不另開選單項目）。
- 資料夾：`features/bookings/` 拆開——訂單相關併入 `features/orders/`（`components/`、`dialogs/vehicle-picker-dialog`、`pages/orders-page`），只給會員用的（會員頁、會員表單、證件擷取、駕駛資格面板）搬到 `features/members/`。`stores/booking/` → `stores/order/`。
- 型別與 token：`RentalBooking` → `RentalOrder`、`BookingStatus` → `OrderStatus`、`BOOKING_REPO` → `ORDER_REPO`、`BookingStore` → `OrderStore`、`normalizeRentalBooking` → `normalizeRentalOrder`、`seedBookings` → `seedOrders`、`BOOKING_STATUS_KEY` → `ORDER_STATUS_KEY`，以及 admin／domain 內的一般變數名。
- 欄位：`pickupLocation`／`returnLocation` → `pickupBranchId`／`returnBranchId`、`Vehicle.location` → `Vehicle.branchId`。`normalizeRentalOrder`／`normalizeVehicle` 讀取時會把 localStorage 裡的舊欄位名轉成新的（新舊並存時以新欄位為準），有測試。
- `zh-tw.ts`：`booking` → `order`、`bookingForm` 併入 `orderForm`、`nav.bookings` → `nav.orders`。
- lint：booking-flow 13 個與 theme-pack 1 個元件改用 `lib-` 前綴（其他 lib 本來就是 `lib-`，所以改程式碼而不是改規則）；affiliate 的路由改為 lazy load 本地的 `partner-pages.ts` 再轉出 booking-flow 頁面，解掉「同一個 lib 同時被靜態與動態引用」。
- `docs/architecture/` 內的舊名稱已同步。

**刻意沒改的（改了就需要資料遷移或會打破外部網址）：**
- `bookingId`：付款、合約、交車、取消、提醒等每一種紀錄上的外鍵，都已寫進 localStorage。改名要對每個集合做遷移，應該跟接後端一起處理（後端 API 直接用 `orderId`，見 backend handoff 第 8 節）。
- localStorage key `cr.bookings`、稽核紀錄的 `entityType: 'booking'`：持久化值，已加註解說明它就是「訂單」。
- `libs/booking-flow` 內部命名（`markBookingPaid`、`submitBooking`、`BookingContext`、官網路由參數 `pay/:bookingId`）：這個 lib 的名字本身就是「官網訂車流程」，改它牽動官網與 affiliate 的公開網址，不在這次範圍。
- 畫面文字「取車地點／還車地點」：術語表說應叫「據點」，但改畫面文字屬行為變更，留給之後文案一起調整（key 已改名為 `pickupBranch`／`returnBranch`）。

## 2. 官網多語系（i18n）（2026-09-23 完成）

commit `ef62889`。設計與使用方式寫在 `docs/architecture/04-booking-flow.md`「多語系」一節，這裡只記重點與剩下的事。

**做了什麼：**
- 不引入套件，做了 signal 型的 `BookingFlowI18n`（`libs/booking-flow/src/lib/i18n/`）＋型別化的繁中／英文／日文字典；漏翻會編譯失敗，切換語言不必重新整理。
- booking-flow 正式碼內所有文案（約 150 處）都已抽出；`NT$` 字面量、`.slice(0, 10)` 直接顯示的日期、自寫的 `formatDate()`、「2026年9月」月份標籤、`plan-page` 的 JPY 三元判斷、內嵌在三元式裡的文案，全部改走 `money()`／`date()`／`month()` 與字典。
- 預設固定繁中且不偵測：admin 與 affiliate 不呼叫 `provideBookingFlowI18n()`，畫面不變；只有官網啟用偵測、記住選擇、同步 `<html lang>` 與月曆地區設定，殼層放語言切換器。
- 錯誤改用代碼（`BookingFlowError`、優惠碼 `reason: 'not_found' | 'not_applicable'`），未預期例外不再把技術訊息丟給客人。
- `BOOKING_FLOW_LABELS` 併入字典（`t().labels`）。
- spec 斷言沒有改成多語——它們仍以繁中（預設語言）驗證行為；另外新增 26 個多語系測試。

**還沒做的：**
- **業主 #8 確認語言清單**。若要加韓文或簡中：在 `booking-flow-locale.ts` 加一筆、補一份字典，型別會指出所有要翻的地方。
- **翻譯校對**：英文、日文是工程師初稿，上線前請母語者校對（尤其法律意味的句子：延遲取車服務費提醒、付款失敗訊息）。
- **資料不翻造成的混語**：切到英文／日文時，車型分類（`classLabel`，如「小型轎車」）、保險方案名稱與保障項目、配件名稱、據點名稱仍是繁中。這符合已定案的界線，但實際看起來很突兀；若業主要翻，這些是**主檔資料**，需要後端提供多語欄位（見 backend handoff 第 9 節），前端不該自己維護對照表。
- **affiliate 沒有語言切換**：民宿代訂站的使用者是民宿業者，照「只做官網」的決定維持繁中。要開放只需在 affiliate 殼層呼叫 `provideBookingFlowI18n()` 並放上切換器。
- **日文字型**：`index.html` 只載入 Noto Sans TC，日文假名目前靠系統字型；若視覺上不一致，再加 Noto Sans JP（注意字型檔大小）。
- **訂單沒有記錄客人的語言**：後續通知與手機簽約連結需要知道客人用哪個語言下單（見 backend handoff 第 9.2 節），接 API 時送出流程要帶上 `i18n.locale()`。
- 車卡標題裡的 `{{ year }} edition` 是既有的英文字面量，三種語言都一樣顯示，沒有動。

## 3. 官網接上合約簽署

**已有暫定決定（2026-09-23，待業主會議確認）：客人付款完成之後產生合約草稿。** 也就是在 `CatalogStore.markBookingPaid()` 成功之後建立第一版 `ContractVersion`，客人才有東西可簽。

要做：
- 付款成功後建立合約草稿（上述時機）
- `apps/booking/src/app/app.config.ts` 補上 `CONTRACT_VERSION_REPO` 與 `SIGNATURE_ASSET_STORE` 的 provider（目前只注入 8 個 repo）
- 官網目前**沒有載入 `libs/theme-pack` 樣式**，但簽署 lib 用到 `--app-warning-*` 等 token，要先補上主題樣式，否則「需重新簽署」提示會沒有顏色
- 簽署元件在手機上已是全螢幕，但未在官網實機驗證過

## 4. 建單流程共用給官網（2026-09-23 完成積木搬遷）

依 ADR 0001，**不共用外層流程容器**，只共用積木層。積木已搬到新的共用 lib **`libs/order-form`**（`@car-rental/order-form`）：

- 表單定義 `createOrderForm()`、衍生狀態與送出前檢查、合約快照、`ORDER_FORM_DATA`、`ORDER_SUBMIT_GATEWAY`，以及五個區塊元件（selector 改為 `lib-order-rental-section` 等）。
- 區塊元件原本直接引用 admin 的 `ZH_TW`；現在改注入新的 `ORDER_FORM_LABELS`（文案＋日期格式），**lib 本身不帶任何文案**。admin 在 `provideAdminOrderForm()` 以 `ZH_TW` 對應的分組提供；`orderFormProblems()`／`orderIncompleteItems()` 改為接收 labels 參數。
- lib 自己的 spec 用「值等於 key 路徑」的測試用 labels 斷言，不依賴任何語言。
- admin 行為不變（原 456 個測試拆成 admin 446＋lib 10）。

**還沒做的（等真的要給官網用時）：**
- 官網沒有接上：要在官網提供三個 token，`ORDER_FORM_LABELS` 的文案要進 booking-flow 的三語字典（目前 labels 形狀沿用 admin `ZH_TW` 的分組）。
- 官網需要的欄位只有約 6/20 重疊，別硬把 admin 專屬區塊（承租人身分別／國籍、訂金、款項、內部備註）塞進官網；可能需要把 `createOrderForm()` 拆出官網用的較小版本。

## 5. mock 資料彙整（2026-09-23 完成）

照付款方式的模式——值＋預設繁中標籤放 `libs/domain`，admin 用 `optionLabelMap()` 塞回 `ZH_TW` 原位：

| 原本重複的項目 | 現在 |
|---|---|
| 車型中文標籤（三份） | `VEHICLE_CATEGORY_OPTIONS`；admin `vehicle.typeLabels` 與官網繁中字典的 `vehicleCategory`／`vehicleGroups` 都取自它 |
| 佔用車位的訂單狀態（三份） | `OCCUPYING_ORDER_STATUSES`／`isOccupyingStatus()`（`libs/domain` 的 `enums.ts`），可用性、`OrderStore` 衝突檢查、調度月曆共用 |
| `zh-tw.ts` 的各種 statusLabels | 22 組列舉標籤搬到 domain 的 `*_OPTIONS`（與型別放在同一檔）。`ZH_TW` 經比對與搬移前**逐字、逐 key 順序相同**，消費端零改動 |
| 寫死在模板的選項值 | 會員、車輛、定價方案、優惠券、配件五個 dialog 改用選項清單產生 |

- 新增 domain spec 檢查所有 `*_OPTIONS` 值不重複、標籤非空。
- 唯一可見差異：dialog 裡的車型選單順序改成與車輛列表篩選一致（機車、汽車、電動車），原本是汽車排第一。
- 刻意留在 admin 的：活動紀錄的事件種類、取消試算的原因代碼、駕照路徑、保養類型、提醒時點——這些是後台畫面或 admin 專屬 model 的概念，官網用不到。

## 6. 調度相關

- **還車完成時更新車輛所在據點**：業主問題 #1 的暫定決定是「車子改算還車據點的車」，目前**尚未實作**——還車手續完成後 `Vehicle.location` 不會變。實作時注意這會連動需調度的判定（下一筆訂單從新據點算起）。
  **✅ 已由 `docs/plans/2026-09-23-admin-flow-review.md` 批次 3.7 完成**：`HandoverStore.performReturn()` 在車輛狀態轉換成功後，另外把 `Vehicle.location` 更新成該筆訂單的
  `returnLocation`（一般欄位更新，不經 `VehicleStore.transition()`）；`docs/owner-
  questions.md` 第 1 條已標記「已實作（暫定，待業主確認）」。

- **甘特圖的資訊架構**：真正「一列一台車」的時間軸（`features/dispatch/timeline-view/`）躲在車輛管理頁的「時間軸」檢視裡，而調度人員看的卻是儀表板月曆。考慮把時間軸移到調度相關的位置，並在上面也標示需調度。
  **✅ 已由批次 3.5 完成**：時間軸搬到 `/dashboard`，與月曆共用同一張卡片、用「月曆｜
  時間軸」切換與同一個右側面板；車輛清單頁的「表格／時間軸」切換隨之拿掉（批次 3.6，
  只留表格）。元件檔案本身還在 `features/dispatch/timeline-view/`，變的是誰在用它。
- 月曆格子只顯示「取 N／還 N／可用 N」，沒有「需調度 N」。要加得改 `dayStats()` 的簽名（被儀表板與 spec 直接引用）。
  **✅ 已由批次 3.3 完成**：`dayStats()` 多回傳 `needsDispatch`，月曆格新增「需調度 N」
  警示色徽章（N>0 才顯示），與取車分頁的需調度判斷同一條規則。
- 車輛列表表格沒有「所在據點」欄。
  **✅ 已由批次 3.6 完成**：加了「所在據點」欄與對應篩選（含「未設定」選項）。
- 調度負責人與時限：業主問題 #2 的暫定決定是維持現狀（只標示、不指派、不計時、不收費）。
  這次沒有改動——業主問題 #2 在 2026-09-23 會議摘要裡仍是「維持暫定做法」，本節其餘四項
  已完成，只剩這項本來就決定不做。

## 7. 這次發現、沒處理的小問題

- **首屏 bundle**：`mat-stepper` 帶進約 17 kB（壓縮後約 4 kB）——`@angular/material/stepper` 發佈檔有一行無條件的 `import '@angular/common/http'`，打包工具無法剔除。不是我們的程式問題，且接上後端後這段本來就需要。**預算門檻已重訂**（原本是 Angular 新專案預設的 500 kB，長年在響）：admin 720/850 kB、booking 420/500 kB、affiliate 430/500 kB，現在全部零警告——之後再看到警告就是真的有東西變胖了。
- **保險方案是示範費率**：依車輛分類各三個級距（`libs/domain/src/lib/models/insurance-catalog.ts`），六台車都帶得到方案。實際商品與費率待業主提供（`docs/owner-questions.md` 第 10 條）。
- **後台沒有任何登入守衛**：`apps/admin` 的路由完全沒有 `canActivate`，`AuthService` 只是在 localStorage 寫一個值，沒有任何地方讀它。也就是說直接輸入網址就能進任何頁面，登入畫面目前是裝飾性的。prototype 階段沒有實害，但接後端時這是必須一起補的（權限設計見 `docs/plans/2026-09-18-rental-operations-backend-handoff.md` 第 2 節）。
- **孤兒簽名**：客人在建單第四步簽了名、但最後沒建立訂單就離開，簽名檔會留在 IndexedDB，沒有合約引用它，也沒有清理機制。
- **外國旅客國籍**：建單時不擋也沒列入待補項目（舊精靈會擋「下一步」）。要不要列為待補項目？
- **內部備註建立後無法修改**：它只存在合約快照裡、不是訂單欄位，所以訂單詳情的「編輯」沒有放它（放了會變成改了卻存不進去）。若需要可事後修改，得先決定它屬於訂單還是合約。
- **未簽署的合約草稿會被就地更新**：改訂單時，若目前版本還是草稿就直接覆寫、不產生新版本（`apps/admin/src/app/stores/contract/contract.store.ts` 的 `reviseIfChanged`）。這符合「只有已簽署版本不可覆寫」的規則，但活動紀錄看不出草稿被改過幾次。
- **交車阻擋訊息**：`libs/domain/src/lib/handover/evaluate-pickup-readiness.ts` 擋下取車時一律顯示「最新版本合約尚未簽署」，未區分「需重新簽署」。
  **部分已由 `docs/plans/2026-09-23-admin-flow-review.md` 處理**：這裡點出的原始情境
  （車還在前一位客人手上時，取車阻擋只顯示「合約未簽署」，看不出真正原因是車沒還）已經
  解決——`evaluatePickupReadiness()` 現在可選傳入 `previousRental`，車還在前一位客人手上
  時「前一位客人尚未還車（逾時 …）」會排在第一個阻擋、蓋過原本排最後又看不出逾時多久的
  通用「車輛目前在租」訊息，總覽取車清單與交還車分頁的阻擋提示都已改用這個欄位（批次 3
  acceptance 與 393e410）。但「合約未簽署」與「需重新簽署」這兩種訊息本身**仍未區分**，
  原始問題只解決了一半，需要的話仍要另外處理。
- **lint 只剩元件前綴這一類**（`feat/admin-flow-review` 完成時分布已變成 booking-flow
  12、theme-pack 1、**affiliate 1**，總數仍是 14 個 error），已決定併入第 1 節的更名任務
  一起做，屆時請重新盤點一次分布（見上方「目前基準線」）。其餘 error（依賴宣告、無障礙、
  空介面）已於 2026-09-22 修掉，測試也已全綠。

## 8. 過時的文件（2026-09-23 已處理）

`docs/architecture/` 五份文件都已逐條對照程式碼更新（訂單狀態機、`Member`、`libs/contract-signing`、官網路由與據點、保險計價）。根目錄的初版規劃書已封存到 `docs/archive/2026-07-13-初版-MVP-規劃.md`，`docs/superpowers/` 整包移除。

往後改動架構時記得同步這幾份——它們是現行文件，有人會照著做事。
