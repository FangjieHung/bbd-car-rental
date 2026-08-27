import { describe, it, expect } from 'vitest';
import { Vehicle } from '@car-rental/domain';
import { OrderSummaryCardComponent } from './order-summary-card.component';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: '勁戰',
    brand: 'Yamaha',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('OrderSummaryCardComponent', () => {
  it('showVehicleHeader 預設為 true', () => {
    const component = new OrderSummaryCardComponent();
    expect(component.showVehicleHeader).toBe(true);
  });

  it('mapUrl 依地點組出 Google Maps 搜尋連結', () => {
    const component = new OrderSummaryCardComponent();
    expect(component['mapUrl']('機場')).toBe(
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('機場'),
    );
  });

  it('originalTotal 併入 insuranceSubtotal', () => {
    const component = new OrderSummaryCardComponent();
    component.vehicle = makeVehicle();
    component.priceBreakdown = {
      dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0,
      rentalSubtotal: 1000, partnerDiscountPercent: 0, partnerDiscount: 0,
      addOnLines: [], addOnSubtotal: 200, insuranceSubtotal: 400,
      couponDiscount: 0, total: 1600,
    };
    expect(component.originalTotal).toBe(1600); // 1000 + 200 + 400
  });

  it('discountPercent 依折扣總額佔原價的比例四捨五入', () => {
    const component = new OrderSummaryCardComponent();
    component.priceBreakdown = {
      dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 300,
      rentalSubtotal: 700, partnerDiscountPercent: 0, partnerDiscount: 0,
      addOnLines: [], addOnSubtotal: 0, insuranceSubtotal: 0,
      couponCode: undefined, couponDiscount: 0, total: 700,
    };
    // originalTotal = 1000+0+0 = 1000；discountTotal = 300；300/1000 = 30%
    expect(component.discountPercent).toBe(30);
  });

  it('baseFareAmount = rentalSubtotal - partnerDiscount + insuranceSubtotal', () => {
    const component = new OrderSummaryCardComponent();
    component.priceBreakdown = {
      dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0,
      rentalSubtotal: 1000, partnerDiscountPercent: 10, partnerDiscount: 100,
      addOnLines: [], addOnSubtotal: 0, insuranceSubtotal: 400,
      couponDiscount: 0, total: 1300,
    };
    expect(component.baseFareAmount).toBe(1300); // 1000 - 100 + 400
  });
});
