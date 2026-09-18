import { Injectable } from '@angular/core';
import { OcrDocumentKind, OcrExtractionResult, OcrGateway } from './ocr.gateway';

/** 查無夾具時的預設結果：低信心，不假裝辨識成功，逼呼叫端走人工確認路徑。 */
const DEFAULT_RESULT: OcrExtractionResult = {
  status: 'low_confidence',
  confidence: 0.4,
};

/** 讓非同步呼叫確實經過一次 Promise 邊界，不是同步回傳假資料。 */
function microtaskBoundary(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

/**
 * 開發期 Mock OCR 服務：依 assetId 回傳事先設定好的固定夾具結果，
 * 涵蓋 succeeded／low_confidence／failed 三種路徑，讓開發與測試可預期。
 * 沒有真正串接任何外部辨識服務——這點必須誠實反映在行為上，不偽造「看起來像真的」辨識邏輯。
 */
@Injectable()
export class MockOcrGateway implements OcrGateway {
  private readonly fixtures = new Map<string, OcrExtractionResult>();

  async extract(assetId: string, _kind: OcrDocumentKind): Promise<OcrExtractionResult> {
    await microtaskBoundary();
    return this.fixtures.get(assetId) ?? DEFAULT_RESULT;
  }

  /** 測試或展示情境可自行掛上想要的夾具結果。 */
  setFixture(assetId: string, result: OcrExtractionResult): void {
    this.fixtures.set(assetId, result);
  }

  clearFixtures(): void {
    this.fixtures.clear();
  }
}
