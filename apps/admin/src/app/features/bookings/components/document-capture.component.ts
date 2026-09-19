import { Component, OnDestroy, inject, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { OcrDocumentKind, OcrExtractionResult, OcrGateway } from '../../../core/services/ocr.gateway';
import { ZH_TW } from '../../../core/i18n/zh-tw';

export type DocumentCaptureStatus = 'idle' | 'preview' | 'processing' | 'success' | 'low_confidence' | 'failed';

/** OCR 可辨識、且需要逐欄與目前表單值比對衝突的欄位。 */
export interface DocumentCaptureFieldValues {
  documentNumber?: string;
  issuingCountry?: string;
  expiryDate?: string;
}

type FieldKey = keyof DocumentCaptureFieldValues;

export interface DocumentCaptureFieldConflict {
  key: FieldKey;
  label: string;
  currentValue: string;
  suggestedValue: string;
}

const FIELD_LABELS: Record<FieldKey, string> = {
  documentNumber: '證件號碼',
  issuingCountry: '發照國家／地區',
  expiryDate: '效期',
};

/**
 * 單一證件照片欄位的拍照／選檔＋OCR 元件。設計文件第 5 節「相機／OCR UX」：
 * - 可開相機或選檔（本元件用一般 file input + capture 屬性達成，不強制相機）。
 * - 狀態涵蓋預覽、重拍、處理中、成功、低信心、失敗。
 * - OCR 辨識出的欄位若與呼叫端目前已有的值衝突（目前值非空且不同），不會自動套用，
 *   要逐欄「套用 OCR 結果」或「保留目前值」確認後才透過 fieldsResolved 送出。
 * - 失敗時保留照片與已存的 asset，讓使用者可重試或直接改手動輸入，不會清空既有內容。
 * - 只對外送出不透明的 assetId／url（DocumentAssetGateway 回傳的參照），絕不夾帶 base64。
 */
@Component({
  selector: 'app-document-capture',
  imports: [MatButtonModule],
  templateUrl: './document-capture.component.html',
  styleUrl: './document-capture.component.scss',
})
export class DocumentCaptureComponent implements OnDestroy {
  protected readonly t = ZH_TW;

  private readonly assetGateway = inject(DocumentAssetGateway);
  private readonly ocrGateway = inject(OcrGateway);

  readonly label = input.required<string>();
  /** 未提供時代表這個欄位不需要跑 OCR（例如反面、IDP、簽注頁等輔助照片）。 */
  readonly ocrKind = input<OcrDocumentKind | undefined>(undefined);
  /** 呼叫端目前（可能是人工輸入過）的欄位值，用來判斷 OCR 建議是否衝突。 */
  readonly currentValues = input<DocumentCaptureFieldValues>({});
  /** 編輯既有會員時，預先帶入先前已上傳的照片，不必重新拍照。 */
  readonly existingAsset = input<StoredDocumentAsset | undefined>(undefined);

  readonly assetCaptured = output<StoredDocumentAsset>();
  readonly fieldsResolved = output<DocumentCaptureFieldValues>();

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly status = signal<DocumentCaptureStatus>('idle');
  protected readonly previewUrl = signal<string | undefined>(undefined);
  protected readonly asset = signal<StoredDocumentAsset | undefined>(undefined);
  protected readonly ocrResult = signal<OcrExtractionResult | undefined>(undefined);
  protected readonly conflicts = signal<DocumentCaptureFieldConflict[]>([]);
  private readonly resolvedSoFar = signal<DocumentCaptureFieldValues>({});

  private pendingFile: File | undefined;
  private localPreviewUrl: string | undefined;

  constructor() {
    const existing = this.existingAsset();
    if (existing) {
      this.asset.set(existing);
      this.previewUrl.set(existing.url);
      this.status.set('success');
    }
  }

  ngOnDestroy(): void {
    this.revokeLocalPreview();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.revokeLocalPreview();
    this.pendingFile = file;
    this.localPreviewUrl = URL.createObjectURL(file);
    this.previewUrl.set(this.localPreviewUrl);
    this.asset.set(undefined);
    this.ocrResult.set(undefined);
    this.conflicts.set([]);
    this.resolvedSoFar.set({});
    this.status.set('preview');
  }

  protected async usePhoto(): Promise<void> {
    if (!this.pendingFile) return;
    const stored = await this.assetGateway.store(this.pendingFile, this.pendingFile.name);
    this.asset.set(stored);
    this.assetCaptured.emit(stored);

    const kind = this.ocrKind();
    if (!kind) {
      this.status.set('success');
      return;
    }
    await this.runOcr(stored.assetId, kind);
  }

  protected async retryOcr(): Promise<void> {
    const current = this.asset();
    const kind = this.ocrKind();
    if (!current || !kind) return;
    await this.runOcr(current.assetId, kind);
  }

  private async runOcr(assetId: string, kind: OcrDocumentKind): Promise<void> {
    this.status.set('processing');
    this.conflicts.set([]);
    this.resolvedSoFar.set({});
    const result = await this.ocrGateway.extract(assetId, kind);
    this.ocrResult.set(result);
    this.applyOcrResult(result);
  }

  private applyOcrResult(result: OcrExtractionResult): void {
    if (result.status === 'failed') {
      this.status.set('failed');
      return;
    }
    this.status.set(result.status === 'low_confidence' ? 'low_confidence' : 'success');

    const current = this.currentValues();
    const autoResolved: DocumentCaptureFieldValues = {};
    const newConflicts: DocumentCaptureFieldConflict[] = [];

    (Object.keys(FIELD_LABELS) as FieldKey[]).forEach((key) => {
      const suggested = result[key];
      if (suggested === undefined) return;
      const existing = current[key];
      if (!existing || existing === suggested) {
        autoResolved[key] = suggested;
      } else {
        newConflicts.push({ key, label: FIELD_LABELS[key], currentValue: existing, suggestedValue: suggested });
      }
    });

    this.resolvedSoFar.set(autoResolved);
    this.conflicts.set(newConflicts);

    if (newConflicts.length === 0 && Object.keys(autoResolved).length > 0) {
      this.fieldsResolved.emit(autoResolved);
    }
  }

  protected acceptSuggestion(conflict: DocumentCaptureFieldConflict): void {
    this.resolveConflict(conflict.key, conflict.suggestedValue);
  }

  protected keepCurrent(conflict: DocumentCaptureFieldConflict): void {
    this.resolveConflict(conflict.key, conflict.currentValue);
  }

  private resolveConflict(key: FieldKey, value: string): void {
    this.resolvedSoFar.update((v) => ({ ...v, [key]: value }));
    this.conflicts.update((list) => list.filter((c) => c.key !== key));
    if (this.conflicts().length === 0) {
      this.fieldsResolved.emit(this.resolvedSoFar());
    }
  }

  /** 「改為手動輸入」：關閉 OCR 建議面板，讓使用者直接在既有欄位輸入，不套用任何 OCR 值。 */
  protected dismissOcr(): void {
    this.conflicts.set([]);
  }

  protected retake(): void {
    this.revokeLocalPreview();
    this.pendingFile = undefined;
    this.previewUrl.set(undefined);
    this.asset.set(undefined);
    this.ocrResult.set(undefined);
    this.conflicts.set([]);
    this.resolvedSoFar.set({});
    this.status.set('idle');
    const inputEl = this.fileInput()?.nativeElement;
    if (inputEl) inputEl.value = '';
  }

  private revokeLocalPreview(): void {
    if (this.localPreviewUrl) {
      URL.revokeObjectURL(this.localPreviewUrl);
      this.localPreviewUrl = undefined;
    }
  }
}
