# contract-signing（`@car-rental/contract-signing`）

「檢視合約＋簽名」的共用元件庫，給櫃檯後台（apps/admin）與官網（apps/booking）共用：
櫃檯人員把螢幕轉給客人、或客人在自己手機上，看完合約條文、在下方簽名、按確認——同一個畫面，不分現場／線上模式。

本 lib 只依賴 `@car-rental/domain` 與 Angular／Material，**不可依賴任何 apps/\* 的程式碼**。
它只負責「顯示合約」與「擷取簽名」，不呼叫任何合約 store；拿到簽名資產紀錄後完成簽署是呼叫端的職責。

## 提供的元件與函式

| 匯出 | 用途 |
| --- | --- |
| `ContractSigningDialogComponent` | 簽署用 MatDialog 內容：合約條文（可捲動）→ 簽名板 → 取消／確認簽署 |
| `openContractSigningDialog(dialog, data)` | 開啟上述 dialog（寬螢幕大尺寸、手機全螢幕），回傳 `Observable<SignatureAsset \| undefined>` |
| `ContractDocumentComponent` | `<lib-contract-document [snapshot] [version]>`：純展示一份 `ContractSnapshot` |
| `SignaturePadComponent` | `<lib-signature-pad>`：手寫（canvas）／打字簽名，存檔後只 emit 不透明的資產紀錄 |

## 需要消費端提供的 token

| Token | 必填 | 說明 |
| --- | --- | --- |
| `SIGNATURE_ASSET_STORE` | 是 | 簽名內容的儲存實作（`store(file, filename) → Promise<SignatureAsset>`）。admin 以既有 `DocumentAssetGateway` 提供：`{ provide: SIGNATURE_ASSET_STORE, useExisting: DocumentAssetGateway }` |
| `CONTRACT_SIGNING_LABELS` | 否 | 所有畫面文字。`providedIn: 'root'`，預設為繁中 `DEFAULT_CONTRACT_SIGNING_LABELS`；日後多語系時 provide 另一份即可 |

## 使用範例

```ts
openContractSigningDialog(this.dialog, { snapshot: version.snapshot, version, needsResign })
  .subscribe((asset) => {
    if (asset) this.contractStore.sign(version.id, [asset.assetId]);
  });
```

## 開發

- `nx test contract-signing`
- `nx build contract-signing`
- `nx lint contract-signing`
