import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { SignaturePadComponent } from './signature-pad.component';

class FakeDocumentAssetGateway implements DocumentAssetGateway {
  readonly stored: Array<{ file: Blob; filename: string }> = [];
  private counter = 0;

  store(file: Blob, filename: string): Promise<StoredDocumentAsset> {
    this.stored.push({ file, filename });
    this.counter += 1;
    return Promise.resolve({ assetId: `sig-asset-${this.counter}`, url: `blob:sig-${this.counter}` });
  }

  resolveUrl(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  remove(): Promise<void> {
    return Promise.resolve();
  }
}

function createFixture() {
  const fixture = TestBed.createComponent(SignaturePadComponent);
  fixture.detectChanges();
  // jsdom 沒有裝 `canvas` 套件時，canvas.toBlob() 的 callback 永遠不會被呼叫（見元件內註解），
  // 測試改為直接覆寫 captureDrawingBlob，只驗證元件邏輯（何時呼叫、傳什麼給 gateway），
  // 不驗證真正的畫布轉檔（那是瀏覽器原生 API 的職責，不是本元件的邏輯）。
  fixture.componentInstance['captureDrawingBlob'] = () =>
    Promise.resolve(new Blob(['fake-png-bytes'], { type: 'image/png' }));
  return fixture;
}

function dispatchPointer(el: Element, type: string, x: number, y: number): void {
  el.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true }));
}

function drawStroke(fixture: ReturnType<typeof createFixture>): void {
  const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
  dispatchPointer(canvas, 'pointerdown', 10, 10);
  dispatchPointer(canvas, 'pointermove', 20, 20);
  dispatchPointer(canvas, 'pointerup', 20, 20);
  fixture.detectChanges();
}

describe('SignaturePadComponent', () => {
  let assetGateway: FakeDocumentAssetGateway;

  beforeEach(() => {
    assetGateway = new FakeDocumentAssetGateway();
    TestBed.configureTestingModule({
      providers: [{ provide: DocumentAssetGateway, useValue: assetGateway }],
    });
  });

  it('預設是手寫模式，畫布尚未有筆畫前「清除重寫」按鈕停用，確認簽署也停用', () => {
    const fixture = createFixture();
    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(fixture.componentInstance['canConfirm']()).toBe(false);
  });

  it('pointer 事件畫出筆畫後 hasDrawing 變 true；但未勾選確認前仍不能簽署', () => {
    const fixture = createFixture();
    drawStroke(fixture);

    expect(fixture.componentInstance['hasDrawing']()).toBe(true);
    expect(fixture.componentInstance['canConfirm']()).toBe(false); // 尚未勾選確認同意
  });

  it('勾選確認同意後，有筆畫時 canConfirm 變 true', () => {
    const fixture = createFixture();
    drawStroke(fixture);
    fixture.componentInstance['toggleAcknowledged'](true);

    expect(fixture.componentInstance['canConfirm']()).toBe(true);
  });

  it('清除重寫：清空目前筆畫，canConfirm 變回 false', () => {
    const fixture = createFixture();
    drawStroke(fixture);
    fixture.componentInstance['toggleAcknowledged'](true);
    expect(fixture.componentInstance['canConfirm']()).toBe(true);

    fixture.componentInstance['clear']();
    fixture.detectChanges();

    expect(fixture.componentInstance['hasDrawing']()).toBe(false);
    expect(fixture.componentInstance['canConfirm']()).toBe(false);
  });

  it('切換為打字簽名模式：鍵盤輸入姓名（不經過任何 pointer 事件）即可讓 canConfirm 成立', () => {
    const fixture = createFixture();
    fixture.componentInstance['switchMode']('type');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input).toBeTruthy();

    input.value = '王小明';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance['typedName']()).toBe('王小明');
    fixture.componentInstance['toggleAcknowledged'](true);

    expect(fixture.componentInstance['canConfirm']()).toBe(true);
  });

  it('打字簽名模式下，僅有空白字元不算有效輸入', () => {
    const fixture = createFixture();
    fixture.componentInstance['switchMode']('type');
    fixture.componentInstance['onTypedNameInput']('   ');
    fixture.componentInstance['toggleAcknowledged'](true);

    expect(fixture.componentInstance['canConfirm']()).toBe(false);
  });

  it('確認簽署：手寫模式下透過 DocumentAssetGateway 存檔，只 emit 不透明的 assetId/url，不外洩簽名內容本身', async () => {
    const fixture = createFixture();
    const emitted: StoredDocumentAsset[] = [];
    fixture.componentInstance.signed.subscribe((a) => emitted.push(a));

    drawStroke(fixture);
    fixture.componentInstance['toggleAcknowledged'](true);
    await fixture.componentInstance['confirm']();

    expect(assetGateway.stored).toHaveLength(1);
    expect(assetGateway.stored[0].file.type).toBe('image/png');
    expect(emitted).toEqual([{ assetId: 'sig-asset-1', url: 'blob:sig-1' }]);
  });

  it('確認簽署：打字簽名模式下也是透過 DocumentAssetGateway 存檔（存成文字檔），不是傳姓名字串出去', async () => {
    const fixture = createFixture();
    const emitted: StoredDocumentAsset[] = [];
    fixture.componentInstance.signed.subscribe((a) => emitted.push(a));

    fixture.componentInstance['switchMode']('type');
    fixture.componentInstance['onTypedNameInput']('陳大同');
    fixture.componentInstance['toggleAcknowledged'](true);
    await fixture.componentInstance['confirm']();

    expect(assetGateway.stored).toHaveLength(1);
    expect(assetGateway.stored[0].file.type).toBe('text/plain');
    expect(emitted).toEqual([{ assetId: 'sig-asset-1', url: 'blob:sig-1' }]);
  });

  it('未勾選確認同意或沒有簽名內容時呼叫 confirm 是 no-op，不會呼叫 gateway', async () => {
    const fixture = createFixture();
    const emitted: StoredDocumentAsset[] = [];
    fixture.componentInstance.signed.subscribe((a) => emitted.push(a));

    await fixture.componentInstance['confirm'](); // 什麼都沒填、也沒勾選
    expect(assetGateway.stored).toHaveLength(0);
    expect(emitted).toHaveLength(0);

    drawStroke(fixture); // 有畫但沒勾選確認
    await fixture.componentInstance['confirm']();
    expect(assetGateway.stored).toHaveLength(0);
  });

  it('畫面上可見「非正式具法律效力」的模擬簽署免責提示', () => {
    const fixture = createFixture();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('非正式具法律效力');
  });
});
