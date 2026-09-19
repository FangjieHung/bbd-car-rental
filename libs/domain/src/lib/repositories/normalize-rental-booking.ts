import { BookingStatus, PaymentPreference } from '../models/enums';
import { RentalBooking } from '../models/rental-booking';
import { VehicleCategory } from '../models/vehicle';
import { defaultDepositForCategory } from '../pricing/deposit-cap';

/** 舊版曾經出現過、現在已經併入 reserved 的履約狀態。 */
const LEGACY_STATUS_MIGRATION: Partial<Record<string, BookingStatus>> = {
  pending_payment: 'reserved',
  confirmed: 'reserved',
};

interface LegacyRentalBookingShape extends Record<string, unknown> {
  vehicleId: string;
  status: string;
  paymentMethod?: PaymentPreference;
  paymentPreference?: PaymentPreference;
  depositRequired?: number;
  priceBreakdown?: { total?: number };
}

/**
 * 查詢某台車的車型分類；沒有 depositRequired 的舊資料要靠它判斷是否套用小客車訂金上限。
 * 選填是因為 normalizeRentalBooking 目前尚未接到任何真正的 Repository（見 local-storage-repository.ts
 * 的 normalize hook）——沒有車輛清單可查時，寧可保守預設 0，也不要對機車/電動機車錯課訂金。
 */
export type VehicleCategoryLookup = (vehicleId: string) => VehicleCategory | undefined;

/**
 * 把 localStorage 裡可能還是舊 schema 的訂單資料，轉成目前的 RentalBooking 形狀：
 * - status：pending_payment/confirmed 併入 reserved，其餘狀態原樣保留。
 * - paymentMethod 欄位改名為 paymentPreference。
 * - depositRequired 缺漏時：
 *   - 車型分類確定是 'car'（小客車）時，用報價總額的 30% 當安全預設值（無報價則為 0）——
 *     對應設計文件「小客車訂金預設不得超過總租金 30%」這條只針對小客車的規則。
 *   - 車型分類是 'scooter'/'ev'，或查不到車輛（未提供 getVehicleCategory、或該 vehicleId
 *     不在清單裡）時，一律預設 0——目前沒有任何機車/電動機車的訂金規則，猜測套用小客車的
 *     30% 上限反而是錯的，0 才是不會多收的安全預設值。
 *   已有 depositRequired 的資料視為已由建立當下的規則算過，不重新覆蓋、也不查車型。
 * - 其餘欄位（couponCode、sourcePartnerId、addOns…）原樣保留，不因未知而遺失。
 */
export function normalizeRentalBooking(
  item: unknown,
  getVehicleCategory?: VehicleCategoryLookup,
): RentalBooking {
  const raw = item as LegacyRentalBookingShape;
  const { status, paymentMethod, paymentPreference, depositRequired, ...rest } = raw;

  const normalizedStatus = LEGACY_STATUS_MIGRATION[status] ?? (status as BookingStatus);
  const normalizedPaymentPreference = paymentPreference ?? paymentMethod;

  const computeLegacyDepositDefault = (): number => {
    const category = getVehicleCategory?.(raw.vehicleId);
    const total = typeof rest.priceBreakdown?.total === 'number' ? rest.priceBreakdown.total : 0;
    // 與 Task 10 新增訂單精靈共用同一套「車型分類→訂金上限」規則，見 deposit-cap.ts 的說明。
    return defaultDepositForCategory(category, total);
  };
  const normalizedDeposit =
    typeof depositRequired === 'number' ? depositRequired : computeLegacyDepositDefault();

  return {
    ...(rest as unknown as RentalBooking),
    status: normalizedStatus,
    ...(normalizedPaymentPreference ? { paymentPreference: normalizedPaymentPreference } : {}),
    depositRequired: normalizedDeposit,
  };
}
