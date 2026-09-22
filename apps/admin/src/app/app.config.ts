import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import {
  VEHICLE_REPO,
  MEMBER_REPO,
  BOOKING_REPO,
  MAINTENANCE_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  PARTNER_REPO,
  PAYOUT_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  CHARGE_ADJUSTMENT_REPO,
  IDENTITY_DOCUMENT_REPO,
  DRIVER_CREDENTIAL_REPO,
  CONTRACT_VERSION_REPO,
  HANDOVER_RECORD_REPO,
  CANCELLATION_CASE_REPO,
  CUSTOMER_CREDIT_LEDGER_REPO,
  REMINDER_STATUS_REPO,
  OPERATOR_RECOVERY_CASE_REPO,
  AUDIT_ENTRY_REPO,
} from './core/repositories/tokens';
import { LocalStorageRepository } from './core/repositories/local-storage-repository';
import {
  seedVehicles,
  seedMembers,
  seedBookings,
  seedMaintenanceRecords,
  seedPricingPlans,
  seedSeasonCalendar,
  seedAddOns,
  seedCoupons,
  seedPartners,
  seedPayouts,
  seedPayments,
  seedRefunds,
  seedChargeAdjustments,
  seedIdentityDocuments,
  seedDriverCredentials,
  seedContractVersions,
  seedHandoverRecords,
  seedCancellationCases,
  seedCustomerCreditLedger,
  seedReminderStatuses,
  seedOperatorRecoveryCases,
  seedAuditEntries,
} from './core/repositories/seed-data';
import { ZH_TW } from './core/i18n/zh-tw';
import { ThemeService } from '@car-rental/theme-pack';
import { normalizeRentalBooking, normalizeVehicle } from '@car-rental/domain';
import { DocumentAssetGateway } from './core/services/document-asset.gateway';
import { SIGNATURE_ASSET_STORE } from '@car-rental/contract-signing';
import { IndexedDbDocumentAssetGateway } from './core/services/indexed-db-document-asset.gateway';
import { OcrGateway } from './core/services/ocr.gateway';
import { MockOcrGateway } from './core/services/mock-ocr.gateway';
import { DriverEligibilityGateway } from './core/services/driver-eligibility.gateway';
import { MockDriverEligibilityGateway } from './core/services/mock-driver-eligibility.gateway';
import { ReminderGateway } from './core/services/reminder.gateway';
import { MockReminderGateway } from './core/services/mock-reminder.gateway';

function notifyStorageReset(snackBar: MatSnackBar): () => void {
  return () => snackBar.open(ZH_TW.common.storageReset, undefined, { duration: 4000 });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNativeDateAdapter(),
    provideAppInitializer(() => inject(ThemeService).init()),
    {
      provide: VEHICLE_REPO,
      // 舊資料的 location 可能還是遷移前的據點類型文字/門市全名，用 normalizeVehicle 統一轉成據點 id。
      useFactory: () =>
        new LocalStorageRepository(
          'cr.vehicles',
          seedVehicles,
          notifyStorageReset(inject(MatSnackBar)),
          normalizeVehicle,
        ),
    },
    {
      provide: MEMBER_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.members',
          seedMembers,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: BOOKING_REPO,
      // 舊資料可能還是遷移前的 schema（pending_payment/confirmed 狀態、paymentMethod 欄位名、
      // 缺 depositRequired）——用 normalizeRentalBooking 統一轉成目前的 RentalBooking 形狀；
      // 小客車的訂金安全預設值需要查車型，所以要能拿到 VEHICLE_REPO。
      useFactory: () => {
        const vehicleRepo = inject(VEHICLE_REPO);
        return new LocalStorageRepository(
          'cr.bookings',
          seedBookings,
          notifyStorageReset(inject(MatSnackBar)),
          (item) => normalizeRentalBooking(item, (vehicleId) => vehicleRepo.getById(vehicleId)?.category),
        );
      },
    },
    {
      provide: MAINTENANCE_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.maintenance',
          seedMaintenanceRecords,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: PRICING_PLAN_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.pricingPlans',
          seedPricingPlans,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: SEASON_CALENDAR_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.seasonCalendar',
          seedSeasonCalendar,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: ADDON_REPO,
      useFactory: () =>
        new LocalStorageRepository('cr.addOns', seedAddOns, notifyStorageReset(inject(MatSnackBar))),
    },
    {
      provide: COUPON_REPO,
      useFactory: () =>
        new LocalStorageRepository('cr.coupons', seedCoupons, notifyStorageReset(inject(MatSnackBar))),
    },
    {
      provide: PARTNER_REPO,
      useFactory: () =>
        new LocalStorageRepository('cr.partners', seedPartners, notifyStorageReset(inject(MatSnackBar))),
    },
    {
      provide: PAYOUT_REPO,
      useFactory: () =>
        new LocalStorageRepository('cr.payouts', seedPayouts, notifyStorageReset(inject(MatSnackBar))),
    },
    // --- Task 7：租務作業工作流 repository ---
    {
      provide: PAYMENT_REPO,
      useFactory: () =>
        new LocalStorageRepository('cr.payments', seedPayments, notifyStorageReset(inject(MatSnackBar))),
    },
    {
      provide: REFUND_REPO,
      useFactory: () =>
        new LocalStorageRepository('cr.refunds', seedRefunds, notifyStorageReset(inject(MatSnackBar))),
    },
    {
      provide: CHARGE_ADJUSTMENT_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.chargeAdjustments',
          seedChargeAdjustments,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: IDENTITY_DOCUMENT_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.identityDocuments',
          seedIdentityDocuments,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: DRIVER_CREDENTIAL_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.driverCredentials',
          seedDriverCredentials,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: CONTRACT_VERSION_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.contractVersions',
          seedContractVersions,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: HANDOVER_RECORD_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.handoverRecords',
          seedHandoverRecords,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: CANCELLATION_CASE_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.cancellationCases',
          seedCancellationCases,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: CUSTOMER_CREDIT_LEDGER_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.customerCreditLedger',
          seedCustomerCreditLedger,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: REMINDER_STATUS_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.reminderStatuses',
          seedReminderStatuses,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: OPERATOR_RECOVERY_CASE_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.operatorRecoveryCases',
          seedOperatorRecoveryCases,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    {
      provide: AUDIT_ENTRY_REPO,
      useFactory: () =>
        new LocalStorageRepository(
          'cr.auditEntries',
          seedAuditEntries,
          notifyStorageReset(inject(MatSnackBar)),
        ),
    },
    // --- Task 7：外部服務 adapter（開發期一律使用安全的本機模擬實作） ---
    IndexedDbDocumentAssetGateway,
    { provide: DocumentAssetGateway, useExisting: IndexedDbDocumentAssetGateway },
    // 共用簽署 lib（@car-rental/contract-signing）的簽名儲存沿用同一個文件資產 gateway。
    { provide: SIGNATURE_ASSET_STORE, useExisting: DocumentAssetGateway },
    MockOcrGateway,
    { provide: OcrGateway, useExisting: MockOcrGateway },
    MockDriverEligibilityGateway,
    { provide: DriverEligibilityGateway, useExisting: MockDriverEligibilityGateway },
    MockReminderGateway,
    { provide: ReminderGateway, useExisting: MockReminderGateway },
  ],
};
