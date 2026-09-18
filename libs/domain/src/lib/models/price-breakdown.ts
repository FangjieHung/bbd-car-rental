import { DayType } from './pricing-plan';
export interface PriceLineDay { date: string; dayType: DayType; price: number; }
export interface PriceLineAddOn { addOnId: string; name: string; qty: number; amount: number; }
export interface PriceBreakdown {
  dailyLines: PriceLineDay[];
  rentalRaw: number; tierDiscountPercent: number; tierDiscountAmount: number;
  rentalSubtotal: number;
  partnerDiscountPercent: number;
  partnerDiscount: number;
  addOnLines: PriceLineAddOn[]; addOnSubtotal: number;
  couponCode?: string; couponDiscount: number; total: number;
}
