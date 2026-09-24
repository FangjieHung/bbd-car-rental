import { InjectionToken } from '@angular/core';
import {
  Vehicle,
  Member,
  RentalOrder,
  PricingPlan,
  SeasonCalendar,
  AddOn,
  Coupon,
  Partner,
  MonthlyPayout,
  PaymentRecord,
  RefundRecord,
  ChargeAdjustment,
  IdentityDocument,
  DriverCredential,
  ContractVersion,
  HandoverRecord,
  CancellationCase,
  CustomerCreditLedgerEntry,
  ReminderStatus,
  OperatorRecoveryCase,
  AuditEntry,
  PrepTask,
} from '../models';
import { Repository } from './repository';
import { createInMemoryRepo } from './testing';

export const VEHICLE_REPO = new InjectionToken<Repository<Vehicle>>('VEHICLE_REPO');
export const MEMBER_REPO = new InjectionToken<Repository<Member>>('MEMBER_REPO');
export const ORDER_REPO = new InjectionToken<Repository<RentalOrder>>('ORDER_REPO');
export const PRICING_PLAN_REPO = new InjectionToken<Repository<PricingPlan>>('PRICING_PLAN_REPO');
export const SEASON_CALENDAR_REPO = new InjectionToken<Repository<SeasonCalendar>>(
  'SEASON_CALENDAR_REPO',
);
export const ADDON_REPO = new InjectionToken<Repository<AddOn>>('ADDON_REPO');
export const COUPON_REPO = new InjectionToken<Repository<Coupon>>('COUPON_REPO');
export const PARTNER_REPO = new InjectionToken<Repository<Partner>>('PARTNER_REPO');
export const PAYOUT_REPO = new InjectionToken<Repository<MonthlyPayout>>('PAYOUT_REPO');

// --- Task 7：租務作業工作流（付款、證件、合約、取還車、取消、購物金、提醒、稽核）---
export const PAYMENT_REPO = new InjectionToken<Repository<PaymentRecord>>('PAYMENT_REPO');
export const REFUND_REPO = new InjectionToken<Repository<RefundRecord>>('REFUND_REPO');
export const CHARGE_ADJUSTMENT_REPO = new InjectionToken<Repository<ChargeAdjustment>>(
  'CHARGE_ADJUSTMENT_REPO',
);
export const IDENTITY_DOCUMENT_REPO = new InjectionToken<Repository<IdentityDocument>>(
  'IDENTITY_DOCUMENT_REPO',
);
export const DRIVER_CREDENTIAL_REPO = new InjectionToken<Repository<DriverCredential>>(
  'DRIVER_CREDENTIAL_REPO',
);
export const CONTRACT_VERSION_REPO = new InjectionToken<Repository<ContractVersion>>(
  'CONTRACT_VERSION_REPO',
);
export const HANDOVER_RECORD_REPO = new InjectionToken<Repository<HandoverRecord>>(
  'HANDOVER_RECORD_REPO',
);
export const CANCELLATION_CASE_REPO = new InjectionToken<Repository<CancellationCase>>(
  'CANCELLATION_CASE_REPO',
);
export const CUSTOMER_CREDIT_LEDGER_REPO = new InjectionToken<
  Repository<CustomerCreditLedgerEntry>
>('CUSTOMER_CREDIT_LEDGER_REPO');
export const REMINDER_STATUS_REPO = new InjectionToken<Repository<ReminderStatus>>(
  'REMINDER_STATUS_REPO',
);
/**
 * OperatorRecoveryCase 的完整欄位設計屬於 Task 15；這裡先用 Task 7 定義的最小骨架
 * 註冊 repository token，讓儲存層與 seed 資料先就位。
 */
export const OPERATOR_RECOVERY_CASE_REPO = new InjectionToken<Repository<OperatorRecoveryCase>>(
  'OPERATOR_RECOVERY_CASE_REPO',
);
export const AUDIT_ENTRY_REPO = new InjectionToken<Repository<AuditEntry>>('AUDIT_ENTRY_REPO');

/**
 * 4.3 整備待辦（見 PrepTask）。與上面的 token 不同，這裡帶一個「空的記憶體 repo」預設值：
 * 還車流程（admin 的 HandoverStore.performReturn）現在會寫入整備待辦，而既有測試各自手動列舉
 * provider（含其他批次負責的訂單詳情／交還車元件測試），不會知道這個新 token——沒有預設值的話，
 * 只要測試裡建得出 HandoverStore 就會整串 DI 失敗。正式環境由 admin 的 app.config.ts 明確提供
 * localStorage 版本（cr.prepTasks），這個預設值只有在沒人提供時才會用到，也不會跨測試留下資料。
 */
export const PREP_TASK_REPO = new InjectionToken<Repository<PrepTask>>('PREP_TASK_REPO', {
  providedIn: 'root',
  factory: () => createInMemoryRepo<PrepTask>(),
});
