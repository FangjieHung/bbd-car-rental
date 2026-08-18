import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

/**
 * 下單頁頂端的租期摘要。取還地點目前全站固定為「馬公」（見 CatalogStore.submitBooking），
 * 故此處寫死；多據點取還是另一個題目。
 */
@Component({
  selector: 'app-search-criteria-bar',
  imports: [MatButtonModule],
  templateUrl: './search-criteria-bar.component.html',
  styleUrl: './search-criteria-bar.component.scss',
})
export class SearchCriteriaBarComponent {
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() days = 0;
  @Output() edit = new EventEmitter<void>();

  protected readonly location = '馬公';
}
