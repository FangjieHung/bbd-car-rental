import { Injectable } from '@angular/core';
import { DocumentAssetGateway, StoredDocumentAsset } from './document-asset.gateway';

const DB_NAME = 'car-rental-dev-documents';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

interface StoredAssetRecord {
  assetId: string;
  filename: string;
  blob: Blob;
  createdAt: string;
}

/**
 * 開發期的 DocumentAssetGateway 實作：把證件圖檔存進瀏覽器專用的 IndexedDB
 * （與其他業務資料的 localStorage 分開，容量與二進位支援都比較合適），
 * 只對外回傳不透明的 assetId 與物件 URL。
 *
 * 明確標示「開發用」——正式環境需要真正的後端檔案服務，這裡的資料庫名稱、
 * clearDevelopmentData 都是開發／展示情境專用，不代表正式儲存策略。
 */
@Injectable()
export class IndexedDbDocumentAssetGateway implements DocumentAssetGateway {
  private dbPromise?: Promise<IDBDatabase>;
  private readonly objectUrls = new Map<string, string>();

  async store(file: Blob, filename: string): Promise<StoredDocumentAsset> {
    const assetId = crypto.randomUUID();
    const record: StoredAssetRecord = {
      assetId,
      filename,
      blob: file,
      createdAt: new Date().toISOString(),
    };
    const db = await this.openDb();
    await this.runRequest(db, 'readwrite', (store) => store.put(record));
    const url = URL.createObjectURL(file);
    this.objectUrls.set(assetId, url);
    return { assetId, url };
  }

  async resolveUrl(assetId: string): Promise<string | undefined> {
    const cached = this.objectUrls.get(assetId);
    if (cached) return cached;

    const db = await this.openDb();
    const record = await this.runRequest<StoredAssetRecord | undefined>(db, 'readonly', (store) =>
      store.get(assetId),
    );
    if (!record) return undefined;

    const url = URL.createObjectURL(record.blob);
    this.objectUrls.set(assetId, url);
    return url;
  }

  async remove(assetId: string): Promise<void> {
    const db = await this.openDb();
    await this.runRequest(db, 'readwrite', (store) => store.delete(assetId));
    this.revokeUrl(assetId);
  }

  /** 開發用：清空整個資料庫並釋放所有已建立的物件 URL，重置示範資料或測試收尾時使用。 */
  async clearDevelopmentData(): Promise<void> {
    const db = await this.openDb();
    await this.runRequest(db, 'readwrite', (store) => store.clear());
    for (const assetId of [...this.objectUrls.keys()]) this.revokeUrl(assetId);
  }

  private revokeUrl(assetId: string): void {
    const url = this.objectUrls.get(assetId);
    if (!url) return;
    URL.revokeObjectURL(url);
    this.objectUrls.delete(assetId);
  }

  private openDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(STORE_NAME)) {
            request.result.createObjectStore(STORE_NAME, { keyPath: 'assetId' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  private runRequest<T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
