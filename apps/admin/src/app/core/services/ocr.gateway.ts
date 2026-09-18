/** 送去 OCR 辨識的文件屬於哪一種：身分證明文件或駕駛資格文件。 */
export type OcrDocumentKind = 'identity_document' | 'driver_credential';

export type OcrExtractionStatus = 'succeeded' | 'low_confidence' | 'failed';

/**
 * OCR 辨識結果。status 為 'failed' 時，辨識出的欄位一律不提供——
 * 呼叫端不應該把失敗結果的殘缺欄位當成可用資料使用。
 */
export interface OcrExtractionResult {
  status: OcrExtractionStatus;
  documentNumber?: string;
  issuingCountry?: string;
  expiryDate?: string;
  /** 0–1，對應 DocumentVerification.ocrConfidence。 */
  confidence: number;
  /** status 為 'failed' 時的原因說明。 */
  failureReason?: string;
}

/**
 * 證件 OCR 辨識介面。真正的辨識服務屬於外部系統，這裡只定義呼叫端需要的窄介面，
 * 讓開發期可以先接上 Mock 實作。
 */
export abstract class OcrGateway {
  abstract extract(assetId: string, kind: OcrDocumentKind): Promise<OcrExtractionResult>;
}
