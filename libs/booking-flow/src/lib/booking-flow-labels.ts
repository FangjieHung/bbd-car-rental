import { InjectionToken, inject } from '@angular/core';
import { AddOn, Transmission, VehicleCategory } from '@car-rental/domain';
import { VehicleGroup } from './date-range';

/** 座位數區間：officeUI 篩選用的粗分級距，不是真實資料欄位。 */
export type SeatBucket = 'le2' | 'mid' | 'ge6';

/** 車卡排序方式。 */
export type SortOrder = 'default' | 'price-asc' | 'price-desc';

/**
 * 官網訂車流程散落在各步驟元件內的顯示文字，集中到這裡當作單一來源，
 * 為日後疊加 i18n 留接口——這次只做搬遷，不做翻譯，預設值維持原本的繁中文字，
 * 畫面文字與行為須完全不變。
 */
export interface BookingFlowLabels {
  vehicleCategory: Record<VehicleCategory, string>;
  seatBuckets: { value: SeatBucket; label: string }[];
  sortOptions: { value: SortOrder; label: string }[];
  transmission: Record<Transmission, string>;
  addOnUnit: Record<AddOn['unit'], string>;
  vehicleGroups: { value: VehicleGroup; label: string }[];
}

/**
 * 預設繁中標籤，也是尚未走 Angular DI（例如測試直接 `new Component()`）時的 fallback 值——
 * 兩處共用同一份常數，不讓 InjectionToken 的 factory 跟元件建構子的預設值各自維護一份可能飄移的文字。
 */
export const DEFAULT_BOOKING_FLOW_LABELS: BookingFlowLabels = {
  vehicleCategory: {
    car: '汽車',
    scooter: '機車',
    ev: '電動車',
  },
  seatBuckets: [
    { value: 'le2', label: '2人以下' },
    { value: 'mid', label: '3-5人' },
    { value: 'ge6', label: '6人以上' },
  ],
  sortOptions: [
    { value: 'default', label: '預設排序' },
    { value: 'price-asc', label: '價格低到高' },
    { value: 'price-desc', label: '價格高到低' },
  ],
  transmission: {
    auto: '自排',
    manual: '手排',
  },
  addOnUnit: {
    per_rental: '每筆訂單',
    per_day: '每日',
  },
  vehicleGroups: [
    { value: 'scooter', label: '機車' },
    { value: 'car', label: '汽車' },
  ],
};

export const BOOKING_FLOW_LABELS = new InjectionToken<BookingFlowLabels>('BOOKING_FLOW_LABELS', {
  providedIn: 'root',
  factory: (): BookingFlowLabels => DEFAULT_BOOKING_FLOW_LABELS,
});

/**
 * 元件改用 inject() 取用 BOOKING_FLOW_LABELS 的共用入口。既有測試直接 `new Component()`
 * 建構、繞過 Angular DI（見 vehicle-step/date-step 的 spec），這種情境下 inject() 會丟出
 * NG0203（沒有作用中的 injection context）——接住這個例外、落回 DEFAULT_BOOKING_FLOW_LABELS，
 * 讓元件在兩種建構方式下都能正常運作，且元件內部仍然是呼叫 inject()（符合
 * @angular-eslint/prefer-inject），不必改回 constructor 參數注入。
 */
// 既有 spec 以 `new Component()` 直接建立元件（無 injection context），catch 只在那種情況落回預設值。
export function injectBookingFlowLabels(): BookingFlowLabels {
  try {
    return inject(BOOKING_FLOW_LABELS);
  } catch {
    return DEFAULT_BOOKING_FLOW_LABELS;
  }
}
