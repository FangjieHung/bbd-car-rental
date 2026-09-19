import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { OcrExtractionResult, OcrGateway } from '../../../core/services/ocr.gateway';
import { DocumentCaptureComponent } from './document-capture.component';

class FakeDocumentAssetGateway implements DocumentAssetGateway {
  readonly stored: Array<{ file: Blob; filename: string }> = [];
  private counter = 0;

  store(file: Blob, filename: string): Promise<StoredDocumentAsset> {
    this.stored.push({ file, filename });
    this.counter += 1;
    return Promise.resolve({ assetId: `asset-${this.counter}`, url: `blob:preview-${this.counter}` });
  }

  resolveUrl(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  remove(): Promise<void> {
    return Promise.resolve();
  }
}

class FakeOcrGateway implements OcrGateway {
  result: OcrExtractionResult = { status: 'succeeded', confidence: 0.9 };
  readonly calls: string[] = [];

  extract(assetId: string): Promise<OcrExtractionResult> {
    this.calls.push(assetId);
    return Promise.resolve(this.result);
  }
}

function makeFile(): File {
  return new File(['fake-bytes'], 'photo.jpg', { type: 'image/jpeg' });
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('DocumentCaptureComponent', () => {
  let assetGateway: FakeDocumentAssetGateway;
  let ocrGateway: FakeOcrGateway;

  beforeEach(() => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:local-preview'),
      revokeObjectURL: vi.fn(),
    });

    assetGateway = new FakeDocumentAssetGateway();
    ocrGateway = new FakeOcrGateway();

    TestBed.configureTestingModule({
      providers: [
        { provide: DocumentAssetGateway, useValue: assetGateway },
        { provide: OcrGateway, useValue: ocrGateway },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(DocumentCaptureComponent);
    fixture.componentRef.setInput('label', '身分證正面');
    fixture.detectChanges();
    return fixture;
  }

  function selectFile(fixture: ReturnType<typeof createFixture>): void {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile()], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('檔案輸入帶 accept="image/*" 與 capture="environment"，但仍是一般的 file input', () => {
    const fixture = createFixture();
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input).toBeTruthy();
    expect(input.type).toBe('file');
    expect(input.getAttribute('accept')).toBe('image/*');
    expect(input.getAttribute('capture')).toBe('environment');
  });

  it('選擇檔案後進入預覽狀態，尚未送出 assetCaptured', () => {
    const fixture = createFixture();
    selectFile(fixture);

    expect(fixture.componentInstance['status']()).toBe('preview');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('重拍');
    expect(el.textContent).toContain('使用這張照片');
  });

  it('沒有指定 ocrKind 時，按下使用照片只會儲存 asset 並 emit assetCaptured，不呼叫 OCR', async () => {
    const fixture = createFixture();
    const captured: StoredDocumentAsset[] = [];
    fixture.componentInstance.assetCaptured.subscribe((a) => captured.push(a));

    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();
    fixture.detectChanges();

    expect(assetGateway.stored).toHaveLength(1);
    expect(ocrGateway.calls).toHaveLength(0);
    expect(fixture.componentInstance['status']()).toBe('success');
  });

  it('有 ocrKind 且目前欄位是空的：OCR 成功後自動套用建議值並 emit fieldsResolved', async () => {
    ocrGateway.result = {
      status: 'succeeded',
      documentNumber: 'A123456789',
      issuingCountry: 'TW',
      confidence: 0.95,
    };
    const fixture = createFixture();
    fixture.componentRef.setInput('ocrKind', 'identity_document');
    fixture.componentRef.setInput('currentValues', {});

    const resolved: unknown[] = [];
    fixture.componentInstance.fieldsResolved.subscribe((v) => resolved.push(v));

    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();
    await flush();
    fixture.detectChanges();

    expect(ocrGateway.calls).toEqual(['asset-1']);
    expect(fixture.componentInstance['status']()).toBe('success');
    expect(resolved).toEqual([{ documentNumber: 'A123456789', issuingCountry: 'TW' }]);
  });

  it('OCR 建議與已手動輸入的值衝突時，不會自動覆寫，需逐欄確認；按下套用後才 emit', async () => {
    ocrGateway.result = {
      status: 'succeeded',
      documentNumber: 'A999999999',
      confidence: 0.95,
    };
    const fixture = createFixture();
    fixture.componentRef.setInput('ocrKind', 'identity_document');
    fixture.componentRef.setInput('currentValues', { documentNumber: 'A100000000' });

    const resolved: unknown[] = [];
    fixture.componentInstance.fieldsResolved.subscribe((v) => resolved.push(v));

    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();
    await flush();
    fixture.detectChanges();

    // 衝突尚未確認前，不得 emit（不可靜默覆寫）
    expect(resolved).toHaveLength(0);
    expect(fixture.componentInstance['conflicts']()).toHaveLength(1);
    expect(fixture.componentInstance['conflicts']()[0]).toMatchObject({
      key: 'documentNumber',
      currentValue: 'A100000000',
      suggestedValue: 'A999999999',
    });

    fixture.componentInstance['acceptSuggestion'](fixture.componentInstance['conflicts']()[0]);
    fixture.detectChanges();

    expect(resolved).toEqual([{ documentNumber: 'A999999999' }]);
    expect(fixture.componentInstance['conflicts']()).toHaveLength(0);
  });

  it('衝突時按下「保留目前值」則以原值 resolve，不套用 OCR 建議', async () => {
    ocrGateway.result = { status: 'succeeded', documentNumber: 'A999999999', confidence: 0.95 };
    const fixture = createFixture();
    fixture.componentRef.setInput('ocrKind', 'identity_document');
    fixture.componentRef.setInput('currentValues', { documentNumber: 'A100000000' });

    const resolved: unknown[] = [];
    fixture.componentInstance.fieldsResolved.subscribe((v) => resolved.push(v));

    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();
    await flush();

    fixture.componentInstance['keepCurrent'](fixture.componentInstance['conflicts']()[0]);

    expect(resolved).toEqual([{ documentNumber: 'A100000000' }]);
  });

  it('低信心結果仍可復原：顯示低信心狀態且保留照片，可重新辨識', async () => {
    ocrGateway.result = { status: 'low_confidence', confidence: 0.4 };
    const fixture = createFixture();
    fixture.componentRef.setInput('ocrKind', 'identity_document');

    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();
    await flush();
    fixture.detectChanges();

    expect(fixture.componentInstance['status']()).toBe('low_confidence');
    expect(fixture.componentInstance['asset']()).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('重新辨識');

    ocrGateway.result = { status: 'succeeded', documentNumber: 'B1', confidence: 0.9 };
    await fixture.componentInstance['retryOcr']();
    await flush();
    fixture.detectChanges();

    expect(ocrGateway.calls).toEqual(['asset-1', 'asset-1']);
    expect(fixture.componentInstance['status']()).toBe('success');
  });

  it('OCR 失敗時保留照片與 asset，不覆寫任何欄位，可重試或改手動輸入', async () => {
    ocrGateway.result = { status: 'failed', confidence: 0, failureReason: '模糊不清' };
    const fixture = createFixture();
    fixture.componentRef.setInput('ocrKind', 'identity_document');
    fixture.componentRef.setInput('currentValues', { documentNumber: 'manual-entry' });

    const resolved: unknown[] = [];
    fixture.componentInstance.fieldsResolved.subscribe((v) => resolved.push(v));

    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();
    await flush();
    fixture.detectChanges();

    expect(fixture.componentInstance['status']()).toBe('failed');
    expect(fixture.componentInstance['asset']()).toBeTruthy();
    expect(resolved).toHaveLength(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('改為手動輸入');
    expect(el.textContent).toContain('重新辨識');

    fixture.componentInstance['dismissOcr']();
    fixture.detectChanges();
    expect(fixture.componentInstance['conflicts']()).toHaveLength(0);
    expect(resolved).toHaveLength(0);
  });

  it('重拍會清空預覽與狀態，回到 idle', async () => {
    const fixture = createFixture();
    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();
    fixture.detectChanges();
    expect(fixture.componentInstance['status']()).toBe('success');

    fixture.componentInstance['retake']();
    fixture.detectChanges();

    expect(fixture.componentInstance['status']()).toBe('idle');
    expect(fixture.componentInstance['previewUrl']()).toBeUndefined();
  });

  it('永遠不會把照片內容以 base64 emit 出去，只會給不透明的 assetId 與 url', async () => {
    const fixture = createFixture();
    const captured: StoredDocumentAsset[] = [];
    fixture.componentInstance.assetCaptured.subscribe((a) => captured.push(a));

    selectFile(fixture);
    await fixture.componentInstance['usePhoto']();

    expect(captured).toEqual([{ assetId: 'asset-1', url: 'blob:preview-1' }]);
  });
});
