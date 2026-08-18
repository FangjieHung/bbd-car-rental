import { Component, Input } from '@angular/core';
import { AddOn, PriceBreakdown, Vehicle } from '@car-rental/domain';

/** 純展示的金額摘要。下單頁滾動時固定在視野內，讓使用者隨時看得到總價。 */
@Component({
  selector: 'app-order-summary-card',
  imports: [],
  templateUrl: './order-summary-card.component.html',
  styleUrl: './order-summary-card.component.scss',
})
export class OrderSummaryCardComponent {
  @Input() vehicle: Vehicle | null = null;
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() selectedAddOnLines: { addOn: AddOn; qty: number }[] = [];
  @Input() priceBreakdown: PriceBreakdown | null = null;
}
