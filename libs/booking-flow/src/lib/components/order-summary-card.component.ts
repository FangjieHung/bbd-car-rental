import { Component, Input, signal } from '@angular/core';
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
  /** 還車站；order-page 目前沒有把 confirm-step 選的還車地點往上抬，這裡先用取車站當預覽值 */
  @Input() returnLocation = '';
  /** plan 頁自己的車輛詳情卡已經顯示過照片/名稱，這裡要關掉避免重複 */
  @Input() showVehicleHeader = true;
  @Input() selectedAddOnLines: { addOn: AddOn; qty: number }[] = [];
  @Input() priceBreakdown: PriceBreakdown | null = null;

  protected readonly baseFareExpanded = signal(true);
  protected readonly addOnsExpanded = signal(false);

  protected toggleBaseFare(): void {
    this.baseFareExpanded.update((v) => !v);
  }

  protected toggleAddOns(): void {
    this.addOnsExpanded.update((v) => !v);
  }

  /** 三種折扣的合計，用來判斷是否需要顯示劃線的原價 */
  get discountTotal(): number {
    if (!this.priceBreakdown) return 0;
    const { tierDiscountAmount, partnerDiscount, couponDiscount } = this.priceBreakdown;
    return tierDiscountAmount + partnerDiscount + couponDiscount;
  }

  /** 完全沒有任何折扣時的應付總計（租金原價 + 配件小計 + 保費），供劃線價對照 */
  get originalTotal(): number {
    if (!this.priceBreakdown) return 0;
    return this.priceBreakdown.rentalRaw + this.priceBreakdown.addOnSubtotal + this.priceBreakdown.insuranceSubtotal;
  }

  /** 折扣佔原價的百分比，供「Sale N% OFF」徽章顯示；沒有折扣或原價為 0 時回 0（不顯示徽章） */
  get discountPercent(): number {
    if (!this.priceBreakdown || this.originalTotal <= 0) return 0;
    return Math.round((this.discountTotal / this.originalTotal) * 100);
  }

  /** 「基本費用」分組金額：租金（已扣 tier/partner 折扣）+ 保費，不含加購／優惠券 */
  get baseFareAmount(): number {
    if (!this.priceBreakdown) return 0;
    const { rentalSubtotal, partnerDiscount, insuranceSubtotal } = this.priceBreakdown;
    return rentalSubtotal - partnerDiscount + insuranceSubtotal;
  }

  protected fuelPolicyLabel(policy?: string): string | null {
    const labels: Record<string, string> = {
      full_to_full: '滿油取還車',
      full_to_empty: '滿油取車、可空車還車',
      same_to_same: '原油量還車',
    };
    return policy ? (labels[policy] ?? null) : null;
  }

  protected mileagePolicyLabel(policy?: string): string | null {
    const labels: Record<string, string> = { unlimited: '無限里程', limited: '有里程限制' };
    return policy ? (labels[policy] ?? null) : null;
  }

  protected mapUrl(location: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
}
