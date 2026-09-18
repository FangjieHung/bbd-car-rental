import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IndexedDbDocumentAssetGateway } from './indexed-db-document-asset.gateway';

/**
 * jsdom（本專案的 vitest 測試環境）沒有實作 IndexedDB，所以這裡用一個貼合
 * IndexedDbDocumentAssetGateway 實際用法（open／transaction／objectStore／
 * put／get／delete／clear，以及 request 與 transaction 各自的成功／失敗事件）
 * 的最小 fake，不拉外部套件依賴。
 *
 * 重點是能各別控制「request 本身 onsuccess」與「transaction 真正 commit」
 * 兩個時間點——這正是被修的 bug 所在：commit 前 abort 時，request 可能已經
 * onsuccess 過，呼叫端仍必須拿到 reject。
 */
class FakeIDBRequest<T> {
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: T | undefined;
  error: Error | null = null;
}

class FakeIDBTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  error: Error | null = null;
  private readonly store: FakeIDBObjectStore;

  constructor(data: Map<string, unknown>, private readonly abortReason: string | null) {
    this.store = new FakeIDBObjectStore(data, this);
  }

  objectStore(): FakeIDBObjectStore {
    return this.store;
  }

  /** 由 store 的操作完成後呼叫，模擬瀏覽器在 request 成功之後才真正決定 commit 或 abort。 */
  notifyRequestDone(): void {
    queueMicrotask(() => {
      if (this.abortReason) {
        this.error = new Error(this.abortReason);
        this.onabort?.();
      } else {
        this.oncomplete?.();
      }
    });
  }
}

class FakeIDBObjectStore {
  constructor(
    private readonly data: Map<string, unknown>,
    private readonly tx: FakeIDBTransaction,
  ) {}

  private op<T>(run: () => T): FakeIDBRequest<T> {
    const req = new FakeIDBRequest<T>();
    queueMicrotask(() => {
      req.result = run();
      req.onsuccess?.();
      this.tx.notifyRequestDone();
    });
    return req;
  }

  put(record: { assetId: string }): FakeIDBRequest<undefined> {
    return this.op(() => {
      this.data.set(record.assetId, record);
      return undefined;
    });
  }

  get(key: string): FakeIDBRequest<unknown> {
    return this.op(() => this.data.get(key));
  }

  delete(key: string): FakeIDBRequest<undefined> {
    return this.op(() => {
      this.data.delete(key);
      return undefined;
    });
  }

  clear(): FakeIDBRequest<undefined> {
    return this.op(() => {
      this.data.clear();
      return undefined;
    });
  }
}

class FakeIndexedDb {
  private readonly data = new Map<string, unknown>();
  private nextAbortReason: string | null = null;

  /** 下一筆交易 commit 時模擬 abort（例如配額超過），僅生效一次。 */
  abortNextTransaction(reason: string): void {
    this.nextAbortReason = reason;
  }

  open(_name: string, _version: number): FakeIDBRequest<unknown> {
    const req = new FakeIDBRequest<unknown>();
    const db = {
      objectStoreNames: { contains: () => true },
      createObjectStore: () => undefined,
      transaction: () => {
        const reason = this.nextAbortReason;
        this.nextAbortReason = null;
        return new FakeIDBTransaction(this.data, reason);
      },
    };
    queueMicrotask(() => {
      req.result = db;
      req.onsuccess?.();
    });
    return req;
  }
}

describe('IndexedDbDocumentAssetGateway', () => {
  let fakeDb: FakeIndexedDb;
  let gateway: IndexedDbDocumentAssetGateway;
  const originalIndexedDb = globalThis.indexedDB;

  beforeEach(() => {
    fakeDb = new FakeIndexedDb();
    (globalThis as unknown as { indexedDB: unknown }).indexedDB = fakeDb;
    gateway = new IndexedDbDocumentAssetGateway();
  });

  afterEach(() => {
    (globalThis as unknown as { indexedDB: unknown }).indexedDB = originalIndexedDb;
  });

  it('store 後可透過 resolveUrl 存取到同一顆物件 URL（round trip）', async () => {
    const blob = new Blob(['fake-image-bytes'], { type: 'image/png' });
    const stored = await gateway.store(blob, 'front.png');

    expect(stored.assetId).toBeTruthy();
    expect(stored.url).toContain('blob:');

    const resolved = await gateway.resolveUrl(stored.assetId);
    expect(resolved).toBe(stored.url);
  });

  it('remove 後撤銷物件 URL，之後 resolveUrl 查無此 assetId', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    const stored = await gateway.store(blob, 'a.png');
    const revoked: string[] = [];
    const originalRevoke = URL.revokeObjectURL;
    URL.revokeObjectURL = (url: string) => revoked.push(url);

    try {
      await gateway.remove(stored.assetId);
      expect(revoked).toContain(stored.url);

      // 已從快取撤銷，且底層資料也已刪除，resolveUrl 應查無此筆。
      const resolved = await gateway.resolveUrl(stored.assetId);
      expect(resolved).toBeUndefined();
    } finally {
      URL.revokeObjectURL = originalRevoke;
    }
  });

  it('clearDevelopmentData 撤銷所有已建立的物件 URL', async () => {
    const blobA = new Blob(['a'], { type: 'image/png' });
    const blobB = new Blob(['b'], { type: 'image/png' });
    const a = await gateway.store(blobA, 'a.png');
    const b = await gateway.store(blobB, 'b.png');

    const revoked: string[] = [];
    const originalRevoke = URL.revokeObjectURL;
    URL.revokeObjectURL = (url: string) => revoked.push(url);

    try {
      await gateway.clearDevelopmentData();
      expect(revoked).toEqual(expect.arrayContaining([a.url, b.url]));
    } finally {
      URL.revokeObjectURL = originalRevoke;
    }
  });

  it('交易在 request 成功之後才 abort 時，store 回傳的 Promise 會 reject，不會回傳懸空的 assetId', async () => {
    fakeDb.abortNextTransaction('simulated quota exceeded');
    const blob = new Blob(['x'], { type: 'image/png' });

    await expect(gateway.store(blob, 'a.png')).rejects.toThrow('simulated quota exceeded');
  });
});
