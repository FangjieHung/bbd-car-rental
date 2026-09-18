import { BookingStatus, PaymentPreference } from '../models/enums';
import { RentalBooking } from '../models/rental-booking';

/** 舊版曾經出現過、現在已經併入 reserved 的履約狀態。 */
const LEGACY_STATUS_MIGRATION: Partial<Record<string, BookingStatus>> = {
  pending_payment: 'reserved',
  confirmed: 'reserved',
};

/** 沒有 depositRequired 的舊資料，用報價總額的固定比例當安全預設值。 */
const LEGACY_DEPOSIT_DEFAULT_PERCENT = 0.3;

interface LegacyRentalBookingShape extends Record<string, unknown> {
  status: string;
  paymentMethod?: PaymentPreference;
  paymentPreference?: PaymentPreference;
  depositRequired?: number;
  priceBreakdown?: { total?: number };
}

/**
 * 把 localStorage 裡可能還是舊 schema 的訂單資料，轉成目前的 RentalBooking 形狀：
 * - status：pending_payment/confirmed 併入 reserved，其餘狀態原樣保留。
 * - paymentMethod 欄位改名為 paymentPreference。
 * - depositRequired 缺漏時，用報價總額的 30% 當安全預設值（無報價則為 0）；
 *   已有 depositRequired 的資料視為已由建立當下的規則算過，不重新覆蓋。
 * - 其餘欄位（couponCode、sourcePartnerId、addOns…）原樣保留，不因未知而遺失。
 */
export function normalizeRentalBooking(item: unknown): RentalBooking {
  const raw = item as LegacyRentalBookingShape;
  const { status, paymentMethod, paymentPreference, depositRequired, ...rest } = raw;

  const normalizedStatus = LEGACY_STATUS_MIGRATION[status] ?? (status as BookingStatus);
  const normalizedPaymentPreference = paymentPreference ?? paymentMethod;

  const total = typeof rest.priceBreakdown?.total === 'number' ? rest.priceBreakdown.total : 0;
  const normalizedDeposit =
    typeof depositRequired === 'number'
      ? depositRequired
      : Math.round(total * LEGACY_DEPOSIT_DEFAULT_PERCENT);

  return {
    ...(rest as unknown as RentalBooking),
    status: normalizedStatus,
    ...(normalizedPaymentPreference ? { paymentPreference: normalizedPaymentPreference } : {}),
    depositRequired: normalizedDeposit,
  };
}
