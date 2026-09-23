import { Component, Input } from '@angular/core';
import { AddOn, branchName, findBranch, PriceBreakdown, Vehicle } from '@car-rental/domain';

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
  @Input() returnLocation = '';
  @Input() showVehicleHeader = true;
  @Input() selectedAddOnLines: { addOn: AddOn; qty: number }[] = [];
  @Input() priceBreakdown: PriceBreakdown | null = null;

  /** 三種折扣的合計，用來判斷是否需要顯示劃線的原價 */
  get discountTotal(): number {
    if (!this.priceBreakdown) return 0;
    const { tierDiscountAmount, partnerDiscount, couponDiscount } = this.priceBreakdown;
    return tierDiscountAmount + partnerDiscount + couponDiscount;
  }

  /** 完全沒有任何折扣時的應付總計（租金原價 + 配件小計 + 保費），供劃線價對照 */
  get originalTotal(): number {
    const price = this.priceBreakdown;
    return price ? price.rentalRaw + price.addOnSubtotal + price.insuranceSubtotal : 0;
  }

  /** 扣除協議折扣、加上保費後的租金基本費用 */
  get baseFareAmount(): number {
    const price = this.priceBreakdown;
    return price ? price.rentalSubtotal - price.partnerDiscount + price.insuranceSubtotal : 0;
  }

  /** 折扣佔原價的百分比，用於顯示「折 X%」徽章 */
  get discountPercent(): number {
    return this.originalTotal === 0 ? 0 : Math.round((this.discountTotal / this.originalTotal) * 100);
  }

  /** 據點 id → 顯示名稱（相容尚未遷移的舊資料：查不到 id 時原樣顯示）。 */
  protected branchName(locationId: string): string {
    return branchName(locationId);
  }

  /** 優先用據點地址查 Google 地圖，查不到據點時退回用（可能是舊資料的）原始文字查詢。 */
  protected mapUrl(locationId: string): string {
    const query = findBranch(locationId)?.address ?? locationId;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
}
