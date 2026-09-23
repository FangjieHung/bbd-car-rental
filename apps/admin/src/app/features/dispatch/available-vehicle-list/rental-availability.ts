import { InjectionToken, inject } from '@angular/core';
import { PriceBreakdown, Vehicle, VehicleAvailabilityResult, calculatePrice, vehicleAvailability } from '../../../core/models';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { BookingStore } from '../../../stores/booking/booking.store';
import { PricingStore } from '../../../stores/pricing/pricing.store';

/**
 * 「某段期間哪些車可以租、多少錢」的資料來源：可租清單元件與建單第 1 步共用。
 * 做成注入 token（而不是元件直接讀 store），讓訂單表單區塊維持只依賴介面、不直接依賴 admin store
 * （見 docs/adr/0001）；admin 預設由 stores 提供，測試可以整份替換。
 * 方法內會讀 signal，在 computed 內呼叫時會自動追蹤車輛、訂單、定價的異動。
 */
export interface RentalAvailabilitySource {
  /**
   * 這段期間（ISO，同訂單 startTime／endTime 的格式）每台車可不可以租與原因——與月曆可用數同一個判斷
   * （libs/domain 的 vehicleAvailability）。`excludeBookingId` 用於編輯訂單時排除它自己。
   */
  forPeriod(startIso: string, endIso: string, excludeBookingId?: string): VehicleAvailabilityResult;
  /** 這段期間（YYYY-MM-DD）這台車的租金試算（不含保險與配件）；該車型沒有定價方案或試算失敗時回傳 undefined。 */
  quote(vehicle: Vehicle, startDate: string, endDate: string): PriceBreakdown | undefined;
}

export const RENTAL_AVAILABILITY = new InjectionToken<RentalAvailabilitySource>('RENTAL_AVAILABILITY', {
  providedIn: 'root',
  factory: (): RentalAvailabilitySource => {
    const vehicleStore = inject(VehicleStore);
    const bookingStore = inject(BookingStore);
    const pricingStore = inject(PricingStore);
    return {
      forPeriod: (startIso, endIso, excludeBookingId) =>
        vehicleAvailability(vehicleStore.vehicles(), {
          startTime: startIso,
          endTime: endIso,
          bookings: bookingStore.bookings(),
          ...(excludeBookingId ? { excludeBookingId } : {}),
        }),
      // 與建單報價（AdminOrderFormData.quote）同一套定價引擎與方案選法，只是不帶保險與配件。
      quote: (vehicle, startDate, endDate) => {
        const plan = pricingStore.plans().find((p) => p.appliesToCategory === vehicle.category);
        const calendar = pricingStore.calendar();
        if (!plan || !calendar) return undefined;
        try {
          return calculatePrice({ plan, calendar, startDate, endDate, addOns: [] });
        } catch {
          return undefined;
        }
      },
    };
  },
});
