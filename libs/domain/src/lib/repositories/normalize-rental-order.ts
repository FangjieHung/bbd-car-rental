import { OrderStatus, PaymentPreference } from '../models/enums';
import { RentalOrder } from '../models/rental-order';
import { VehicleCategory } from '../models/vehicle';
import { normalizeBranchId } from '../models/branch';
import { defaultDepositForCategory } from '../pricing/deposit-cap';

/** 舊版曾經出現過、現在已經併入 reserved 的履約狀態。 */
const LEGACY_STATUS_MIGRATION: Partial<Record<string, OrderStatus>> = {
  pending_payment: 'reserved',
  confirmed: 'reserved',
};

interface LegacyRentalOrderShape extends Record<string, unknown> {
  vehicleId: string;
  status: string;
  paymentMethod?: PaymentPreference;
  paymentPreference?: PaymentPreference;
  depositRequired?: number;
  priceBreakdown?: { total?: number };
  pickupBranchId?: string;
  returnBranchId?: string;
  /** 2026-09 更名前的欄位名，值同 pickupBranchId。 */
  pickupLocation?: string;
  /** 2026-09 更名前的欄位名，值同 returnBranchId。 */
  returnLocation?: string;
}

/**
 * 查詢某台車的車型分類；沒有 depositRequired 的舊資料要靠它判斷是否套用小客車訂金上限。
 * 選填是因為 normalizeRentalOrder 目前尚未接到任何真正的 Repository（見 local-storage-repository.ts
 * 的 normalize hook）——沒有車輛清單可查時，寧可保守預設 0，也不要對機車/電動機車錯課訂金。
 */
export type VehicleCategoryLookup = (vehicleId: string) => VehicleCategory | undefined;

/**
 * 把 localStorage 裡可能還是舊 schema 的訂單資料，轉成目前的 RentalOrder 形狀：
 * - status：pending_payment/confirmed 併入 reserved，其餘狀態原樣保留。
 * - paymentMethod 欄位改名為 paymentPreference。
 * - depositRequired 缺漏時：
 *   - 車型分類確定是 'car'（小客車）時，用報價總額的 30% 當安全預設值（無報價則為 0）——
 *     對應設計文件「小客車訂金預設不得超過總租金 30%」這條只針對小客車的規則。
 *   - 車型分類是 'scooter'/'ev'，或查不到車輛（未提供 getVehicleCategory、或該 vehicleId
 *     不在清單裡）時，一律預設 0——目前沒有任何機車/電動機車的訂金規則，猜測套用小客車的
 *     30% 上限反而是錯的，0 才是不會多收的安全預設值。
 *   已有 depositRequired 的資料視為已由建立當下的規則算過，不重新覆蓋、也不查車型。
 * - pickupLocation／returnLocation 欄位改名為 pickupBranchId／returnBranchId（兩者並存時以新欄位為準）。
 * - pickupBranchId／returnBranchId：值可能還是舊版的據點類型文字（機場/港口/店舖）或門市全名
 *   （馬公門市），用 normalizeBranchId 統一遷移成目前的據點 id；已經是合法 id 或查無對應
 *   遷移規則的值原樣保留。
 * - 其餘欄位（couponCode、sourcePartnerId、addOns…）原樣保留，不因未知而遺失。
 */
export function normalizeRentalOrder(
  item: unknown,
  getVehicleCategory?: VehicleCategoryLookup,
): RentalOrder {
  const raw = item as LegacyRentalOrderShape;
  const {
    status,
    paymentMethod,
    paymentPreference,
    depositRequired,
    pickupLocation,
    returnLocation,
    ...restWithBranches
  } = raw;
  const { pickupBranchId = pickupLocation, returnBranchId = returnLocation, ...rest } = restWithBranches;

  const normalizedStatus = LEGACY_STATUS_MIGRATION[status] ?? (status as OrderStatus);
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
    ...(rest as unknown as RentalOrder),
    status: normalizedStatus,
    ...(normalizedPaymentPreference ? { paymentPreference: normalizedPaymentPreference } : {}),
    depositRequired: normalizedDeposit,
    ...(pickupBranchId !== undefined
      ? { pickupBranchId: normalizeBranchId(pickupBranchId) as string }
      : {}),
    ...(returnBranchId !== undefined
      ? { returnBranchId: normalizeBranchId(returnBranchId) as string }
      : {}),
  };
}
