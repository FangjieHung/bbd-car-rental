import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ZH_TW } from '../core/i18n/zh-tw';

@Component({
  selector: 'app-list-toolbar',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './list-toolbar.component.html',
  styleUrls: ['./list-toolbar.component.scss'],
})
export class ListToolbarComponent {
  protected readonly t = ZH_TW;
  readonly query = model<string>('');
  readonly placeholder = input<string>(ZH_TW.common.search);
  readonly activeFilterCount = input<number>(0);
  readonly clearAll = output<void>();
}
