import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

/** 下單頁頂端的租期摘要，取還地點來自搜尋頁選擇並經 URL 帶入。 */
@Component({
  selector: 'app-search-criteria-bar',
  imports: [MatButtonModule],
  templateUrl: './search-criteria-bar.component.html',
  styleUrl: './search-criteria-bar.component.scss',
})
export class SearchCriteriaBarComponent {
  @Input() pickupLocation = '';
  @Input() returnLocation = '';
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() days = 0;
  @Output() edit = new EventEmitter<void>();

  /** 兩地相同只顯示一次；不同才分別標示取車／還車 */
  protected get location(): string {
    if (!this.pickupLocation) return '';
    if (!this.returnLocation || this.returnLocation === this.pickupLocation) {
      return this.pickupLocation;
    }
    return `取車 ${this.pickupLocation} ・ 還車 ${this.returnLocation}`;
  }
}
