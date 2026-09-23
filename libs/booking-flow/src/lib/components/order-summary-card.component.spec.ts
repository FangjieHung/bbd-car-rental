import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BookingFlowI18n } from '../i18n/booking-flow-i18n';
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

describe('OrderSummaryCardComponent 多語系', () => {
  function render() {
    const fixture = TestBed.createComponent(OrderSummaryCardComponent);
    fixture.componentInstance.vehicle = makeVehicle({ branchId: 'mzg-airport' });
    fixture.componentInstance.startDate = '2026-09-22';
    fixture.componentInstance.endDate = '2026-09-24';
    fixture.componentInstance.priceBreakdown = {
      dailyLines: [], rentalRaw: 1000, tierDiscountPercent: 0, tierDiscountAmount: 0,
      rentalSubtotal: 1000, partnerDiscountPercent: 0, partnerDiscount: 0,
      addOnLines: [], addOnSubtotal: 0, insuranceSubtotal: 600,
      couponDiscount: 0, total: 1600,
    };
    fixture.detectChanges();
    return { fixture, i18n: TestBed.inject(BookingFlowI18n) };
  }

  it('預設繁中：日期與金額依在地格式', () => {
    const text = render().fixture.nativeElement.textContent as string;
    expect(text).toContain('應付總計');
    expect(text).toContain('2026/09/22');
    expect(text).toContain('NT$1,600');
  });

  it('切換成英文後同一張卡片立即改用英文文案與日期格式；據點名稱是資料、不翻', () => {
    const { fixture, i18n } = render();
    i18n.setLocale('en');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Total due');
    expect(text).toContain('09/22/2026');
    expect(text).toContain('NT$1,600');
    expect(text).toContain('馬公機場櫃檯');
    expect(text).not.toContain('應付總計');
  });
});
