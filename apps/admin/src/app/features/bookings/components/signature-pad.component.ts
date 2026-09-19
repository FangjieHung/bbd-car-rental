import { AfterViewInit, Component, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { ZH_TW } from '../../../core/i18n/zh-tw';

export type SignatureMode = 'draw' | 'type';

/**
 * 簽名擷取元件。設計文件第 4.4 節「前端 MVP 提供預覽與簽名操作」，本元件只負責「擷取」這一步：
 * - 手寫模式：以 Pointer Events（同時涵蓋滑鼠／觸控／觸控筆）在 canvas 上畫筆畫。
 * - 打字簽名模式：純鍵盤可操作的姓名輸入框，供無法（或不便）用指標裝置簽名的使用者作為替代方案——
 *   這不是「偵測裝置能力後自動切換」，而是一律提供的明確替代入口，行為可預期也方便測試。
 * - 兩種模式都必須先勾選「確認已閱讀並同意」才能按下確認簽署，避免使用者誤觸直接送出。
 * - 簽名內容（無論是畫布還是打字姓名）一律先透過 DocumentAssetGateway 存成 Blob，
 *   對外只 emit 不透明的 assetId／url，絕不把簽名圖檔或姓名文字內容本身夾帶送出
 *   （呼應 DocumentAssetGateway 的既有原則：正式證件／簽名資料不進 localStorage）。
 * - 本元件不知道自己在簽哪張合約、也不呼叫 ContractStore——那是呼叫端（contract-panel）的職責，
 *   這裡只是一個可重用的「擷取一筆簽名證據」元件。
 */
@Component({
  selector: 'app-signature-pad',
  imports: [MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss',
})
export class SignaturePadComponent implements AfterViewInit {
  protected readonly t = ZH_TW;

  private readonly assetGateway = inject(DocumentAssetGateway);

  readonly signed = output<StoredDocumentAsset>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private lastPoint: { x: number; y: number } | undefined;

  protected readonly mode = signal<SignatureMode>('draw');
  protected readonly hasDrawing = signal(false);
  protected readonly typedName = signal('');
  protected readonly acknowledged = signal(false);
  protected readonly submitting = signal(false);

  /** 目前模式是否已經有「可視為一筆簽名」的內容：手寫模式看有沒有筆畫，打字模式看姓名去空白後是否非空。 */
  protected readonly hasSignatureInput = computed(() =>
    this.mode() === 'draw' ? this.hasDrawing() : this.typedName().trim().length > 0,
  );

  protected readonly canConfirm = computed(
    () => this.hasSignatureInput() && this.acknowledged() && !this.submitting(),
  );

  ngAfterViewInit(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    // jsdom 在沒有裝 `canvas` npm 套件時，getContext('2d') 會回傳 null（並印出一則
    // "Not implemented" 的警告，這是 jsdom 本身的已知限制，不是本元件的錯誤）。
    // 之後所有畫圖呼叫都要 guard `this.ctx` 存在，真實瀏覽器才會實際落筆。
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = '#1a1a1a';
    }
  }

  protected switchMode(mode: SignatureMode): void {
    this.mode.set(mode);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.isDrawing = true;
    this.lastPoint = this.pointFromEvent(event);
    // jsdom 的 canvas 元素沒有實作 setPointerCapture，真實瀏覽器才有這個方法；
    // 用 optional chaining 呼叫，測試環境下安靜跳過，不影響邏輯正確性。
    (event.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDrawing) return;
    const point = this.pointFromEvent(event);
    if (this.ctx && this.lastPoint) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
      this.ctx.lineTo(point.x, point.y);
      this.ctx.stroke();
    }
    this.lastPoint = point;
    this.hasDrawing.set(true);
  }

  protected onPointerUp(): void {
    this.isDrawing = false;
    this.lastPoint = undefined;
  }

  private pointFromEvent(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  /** 清除重寫：依目前模式清空畫布筆畫或已輸入的姓名，不影響已勾選的確認同意狀態。 */
  protected clear(): void {
    if (this.mode() === 'draw') {
      const canvas = this.canvasRef()?.nativeElement;
      if (canvas && this.ctx) {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      this.hasDrawing.set(false);
    } else {
      this.typedName.set('');
    }
    this.isDrawing = false;
    this.lastPoint = undefined;
  }

  protected onTypedNameInput(value: string): void {
    this.typedName.set(value);
  }

  protected onTypedNameInputEvent(event: Event): void {
    this.onTypedNameInput((event.target as HTMLInputElement).value);
  }

  protected toggleAcknowledged(checked: boolean): void {
    this.acknowledged.set(checked);
  }

  protected onAcknowledgeChange(event: MatCheckboxChange): void {
    this.toggleAcknowledged(event.checked);
  }

  protected async confirm(): Promise<void> {
    if (!this.canConfirm()) return;

    this.submitting.set(true);
    try {
      const blob = this.mode() === 'draw' ? await this.captureDrawingBlob() : this.typedNameBlob();
      if (!blob) return;
      const filename = this.mode() === 'draw' ? 'signature.png' : 'signature-typed.txt';
      const stored = await this.assetGateway.store(blob, filename);
      this.signed.emit(stored);
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * 抽成獨立、可被測試覆寫的方法：canvas.toBlob() 在 jsdom 沒有裝 `canvas` 套件時
   * callback 永遠不會被呼叫（會讓測試卡死），因此測試會直接覆寫這個方法，只驗證
   * 「元件何時呼叫、把結果傳給誰」這一層邏輯，真正的畫布轉檔交給瀏覽器原生實作負責。
   */
  protected captureDrawingBlob(): Promise<Blob | undefined> {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return Promise.resolve(undefined);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob ?? undefined), 'image/png'));
  }

  private typedNameBlob(): Blob {
    return new Blob([this.typedName().trim()], { type: 'text/plain' });
  }
}
