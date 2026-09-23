import { InjectionToken } from '@angular/core';

/**
 * 一筆已存檔的簽名證據：不透明的 asset ID 與可直接顯示的 URL。
 *
 * 刻意定義在本 lib 而非 `@car-rental/domain`：領域資料（`ContractVersion.signatureAssetIds`）
 * 只保存 assetId 字串參照，`url` 是儲存實作在當下 session 產生的顯示用位址（例如 blob: URL），
 * 不是可持久化的領域資料。結構與 admin 的 `StoredDocumentAsset` 相同，所以 admin 的
 * `DocumentAssetGateway` 可直接滿足 `SignatureAssetStore`。
 */
export interface SignatureAsset {
  assetId: string;
  url: string;
}

/**
 * 簽名板實際需要的最小儲存介面：把簽名內容（畫布 PNG 或打字姓名文字檔）存成 Blob，
 * 回傳不透明的資產紀錄。簽名內容本身絕不經由元件 output 外流，只交給這個 store。
 */
export interface SignatureAssetStore {
  store(file: Blob, filename: string): Promise<SignatureAsset>;
}

/**
 * 簽名儲存的注入點；本 lib 不提供預設實作，消費端必須自行 provide，例如 admin：
 * `{ provide: SIGNATURE_ASSET_STORE, useExisting: DocumentAssetGateway }`。
 */
export const SIGNATURE_ASSET_STORE = new InjectionToken<SignatureAssetStore>('SIGNATURE_ASSET_STORE');
