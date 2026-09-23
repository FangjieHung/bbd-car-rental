import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { branchName } from '@car-rental/domain';

/** 下單頁頂端的租期摘要，取還地點來自搜尋頁選擇並經 URL 帶入（皆為據點 id）。 */
@Component({
  selector: 'lib-search-criteria-bar',
  imports: [MatButtonModule],
  templateUrl: './search-criteria-bar.component.html',
  styleUrl: './search-criteria-bar.component.scss',
})
export class SearchCriteriaBarComponent {
  @Input() pickupBranchId = '';
  @Input() returnBranchId = '';
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() days = 0;
  @Output() edit = new EventEmitter<void>();

  /** 兩地相同只顯示一次；不同才分別標示取車／還車 */
  protected get location(): string {
    if (!this.pickupBranchId) return '';
    if (!this.returnBranchId || this.returnBranchId === this.pickupBranchId) {
      return branchName(this.pickupBranchId);
    }
    return `取車 ${branchName(this.pickupBranchId)} ・ 還車 ${branchName(this.returnBranchId)}`;
  }
}
