import { Component, ElementRef, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ZH_TW } from '../../core/i18n/zh-tw';

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

  // 不可用 viewChild.required：input 位於 @if (showSearch()) 內，
  // showSearch() 為 false 時元素不存在，required 會拋錯。
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  toggle(): void {
    if (this.expanded()) {
      this.query.set('');
      this.expanded.set(false);
      this.inputRef()?.nativeElement.blur();
      return;
    }
    this.expanded.set(true);
    // 必須同步呼叫。包進 setTimeout / afterNextRender 會讓 iOS Safari 不喚起軟鍵盤。
    this.inputRef()?.nativeElement.focus();
  }
}
