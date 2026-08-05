import { Component, ElementRef, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ZH_TW } from '../../core/i18n/zh-tw';

// 同頁若有多個 app-page-toolbar 實例，input id 須各自唯一，
// 供 toggle 按鈕的 aria-controls 指向。用模組層級遞增計數器，
// 比 inject(APP_ID) 更合適：APP_ID 是整個應用共用同一值，
// 無法區分同頁的多個元件實例。
let nextInstanceId = 0;

@Component({
  selector: 'app-page-toolbar',
  imports: [FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './page-toolbar.component.html',
  styleUrls: ['./page-toolbar.component.scss'],
})
export class PageToolbarComponent {
  protected readonly t = ZH_TW;
  readonly query = model<string>('');
  readonly placeholder = input<string>(ZH_TW.common.search);
  readonly activeFilterCount = input<number>(0);
  readonly showSearch = input<boolean>(true);
  readonly clearAll = output<void>();

  readonly expanded = signal(false);
  protected readonly searchInputId = `page-toolbar-search-${nextInstanceId++}`;

  // 不可用 viewChild.required：input 位於 @if (showSearch()) 內，
  // showSearch() 為 false 時元素不存在，required 會拋錯。
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly toggleRef = viewChild<ElementRef<HTMLButtonElement>>('toggleBtn');

  toggle(): void {
    if (this.expanded()) {
      this.collapse();
      return;
    }
    this.expanded.set(true);
    // 必須同步呼叫。包進 setTimeout / afterNextRender 會讓 iOS Safari 不喚起軟鍵盤。
    this.inputRef()?.nativeElement.focus();
  }

  onEscape(): void {
    this.collapse();
    // Esc 是鍵盤操作，焦點須回到觸發器，否則鍵盤使用者會失去位置。
    this.toggleRef()?.nativeElement.focus();
  }

  private collapse(): void {
    this.query.set('');
    this.expanded.set(false);
    this.inputRef()?.nativeElement.blur();
  }

  clearKeepFocus(): void {
    this.query.set('');
    // 清空後游標留在框內，讓使用者直接重打。
    this.inputRef()?.nativeElement.focus();
  }

  collapseIfEmpty(): void {
    if (!this.query().trim()) {
      this.expanded.set(false);
    }
  }
}
