// 僅供 features/orders 的 spec 使用：以 in-memory repository 組出 admin stores 需要的注入環境。
import { Provider } from '@angular/core';
import {
  ADDON_REPO,
  AUDIT_ENTRY_REPO,
  ORDER_REPO,
  CANCELLATION_CASE_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
  CUSTOMER_CREDIT_LEDGER_REPO,
  DRIVER_CREDENTIAL_REPO,
  IDENTITY_DOCUMENT_REPO,
  MAINTENANCE_REPO,
  MEMBER_REPO,
  OPERATOR_RECOVERY_CASE_REPO,
  PAYMENT_REPO,
  PRICING_PLAN_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  SEASON_CALENDAR_REPO,
  VEHICLE_REPO,
} from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import {
  AddOn,
  AuditEntry,
  CancellationCase,
  ChargeAdjustment,
  ContractVersion,
  CustomerCreditLedgerEntry,
  DriverCredential,
  IdentityDocument,
  MaintenanceRecord,
  Member,
  OperatorRecoveryCase,
  PaymentRecord,
  PricingPlan,
  RefundRecord,
  ReminderStatus,
  RentalOrder,
  SeasonCalendar,
  Vehicle,
} from '../../core/models';
import { ReminderGateway } from '../../core/services/reminder.gateway';
import { OcrGateway } from '../../core/services/ocr.gateway';
import { MockOcrGateway } from '../../core/services/mock-ocr.gateway';
import { DriverEligibilityGateway } from '../../core/services/driver-eligibility.gateway';
import { MockDriverEligibilityGateway } from '../../core/services/mock-driver-eligibility.gateway';

export function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'car',
    model: 'Altis',
    brand: 'Toyota',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    branchId: 'mzg-airport',
    ...partial,
  };
}

export function makePlan(partial: Partial<PricingPlan> = {}): PricingPlan {
  return {
    id: `plan-${partial.appliesToCategory ?? 'car'}`,
    name: 'test',
    appliesToCategory: 'car',
    dayTypeRates: { weekday: 1000, weekend: 1000, holiday: 1000, peak: 1000 },
    tiers: [],
    ...partial,
  };
}

export interface OrderRepoOptions {
  vehicles?: Vehicle[];
  members?: Member[];
  orders?: RentalOrder[];
  addOns?: AddOn[];
  contracts?: ContractVersion[];
  /** 訂單詳情標題旁的急迫狀態：退款待處理。 */
  refunds?: RefundRecord[];
  /** 訂單詳情標題旁的急迫狀態：業者復原處理中。 */
  operatorRecoveryCases?: OperatorRecoveryCase[];
  /** 會員的證件紀錄（待補「證件未查核」「駕駛資格未查核」、第 2 步預填駕駛資格）。 */
  identityDocuments?: IdentityDocument[];
  driverCredentials?: DriverCredential[];
}

export function createOrderRepos(options: OrderRepoOptions = {}) {
  const repos = {
    vehicleRepo: createInMemoryRepo<Vehicle>(options.vehicles ?? [makeVehicle()]),
    memberRepo: createInMemoryRepo<Member>(options.members ?? []),
    orderRepo: createInMemoryRepo<RentalOrder>(options.orders ?? []),
    paymentRepo: createInMemoryRepo<PaymentRecord>([]),
    refundRepo: createInMemoryRepo<RefundRecord>(options.refunds ?? []),
    contractRepo: createInMemoryRepo<ContractVersion>(options.contracts ?? []),
    reminderStatusRepo: createInMemoryRepo<ReminderStatus>([]),
    operatorRecoveryCaseRepo: createInMemoryRepo<OperatorRecoveryCase>(options.operatorRecoveryCases ?? []),
    identityDocumentRepo: createInMemoryRepo<IdentityDocument>(options.identityDocuments ?? []),
    driverCredentialRepo: createInMemoryRepo<DriverCredential>(options.driverCredentials ?? []),
    /** 互惠資格查核的開發期 mock；測試可用 setFixture 讓某國家查核為「符合」。 */
    eligibilityGateway: new MockDriverEligibilityGateway(),
    reminderGateway: {
      schedule: async () => ({ state: 'scheduled' as const }),
      cancel: async () => undefined,
    },
  };
  const providers: Provider[] = [
    { provide: VEHICLE_REPO, useValue: repos.vehicleRepo },
    { provide: MEMBER_REPO, useValue: repos.memberRepo },
    { provide: ORDER_REPO, useValue: repos.orderRepo },
    { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
    { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>([makePlan(), makePlan({ appliesToCategory: 'scooter' })]) },
    {
      provide: SEASON_CALENDAR_REPO,
      useValue: createInMemoryRepo<SeasonCalendar>([{ id: 'cal1', holidays: [], peakSeasons: [] }]),
    },
    { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>(options.addOns ?? []) },
    { provide: PAYMENT_REPO, useValue: repos.paymentRepo },
    { provide: REFUND_REPO, useValue: repos.refundRepo },
    { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
    { provide: CONTRACT_VERSION_REPO, useValue: repos.contractRepo },
    { provide: REMINDER_STATUS_REPO, useValue: repos.reminderStatusRepo },
    { provide: ReminderGateway, useValue: repos.reminderGateway },
    // 訂單詳情標題旁的急迫狀態會注入 OperatorRecoveryStore，牽出 CancellationStore／CreditStore
    // 整串 DI 圖；即使測試不呼叫相關方法，元件建構時仍會整串解析，缺一個 provider 就整個炸掉
    // （沿用 orders-page.component.spec.ts 的 provideOrderDetailRepos 教訓）。
    { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>([]) },
    { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>([]) },
    { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>([]) },
    { provide: OPERATOR_RECOVERY_CASE_REPO, useValue: repos.operatorRecoveryCaseRepo },
    // 4.1／4.2：待補判斷與建立訂單會讀寫會員的證件紀錄（DocumentStore）。
    { provide: IDENTITY_DOCUMENT_REPO, useValue: repos.identityDocumentRepo },
    { provide: DRIVER_CREDENTIAL_REPO, useValue: repos.driverCredentialRepo },
    MockOcrGateway,
    { provide: OcrGateway, useExisting: MockOcrGateway },
    { provide: DriverEligibilityGateway, useValue: repos.eligibilityGateway },
  ];
  return { ...repos, providers };
}
