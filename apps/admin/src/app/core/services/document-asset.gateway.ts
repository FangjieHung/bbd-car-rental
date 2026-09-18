/** 一次成功存檔後的結果：不透明的 asset ID 與可直接顯示的 URL。 */
export interface StoredDocumentAsset {
  assetId: string;
  url: string;
}

/**
 * 證件圖檔的儲存介面。正式證件圖檔只透過這個 adapter 存取，不進 localStorage
 * （設計原則 #7：「正式證件圖檔不放 localStorage」，也不進任何 Repository）——
 * IdentityDocument／DriverCredential 只存這裡回傳的 assetId 參照。
 *
 * 這是開發期的抽象邊界：正式環境要換成真正的檔案服務時，只需替換實作，
 * 呼叫端（stores／components）不需要跟著改。
 */
export abstract class DocumentAssetGateway {
  abstract store(file: Blob, filename: string): Promise<StoredDocumentAsset>;
  abstract resolveUrl(assetId: string): Promise<string | undefined>;
  abstract remove(assetId: string): Promise<void>;
}
