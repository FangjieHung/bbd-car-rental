import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AuditEntry,
  CancellationCase,
  ChargeAdjustment,
  ContractVersion,
  CustomerCreditLedgerEntry,
  DriverCredential,
  HandoverRecord,
  IdentityDocument,
  OperatorRecoveryCase,
  PaymentRecord,
  RefundRecord,
  RentalBooking,
  ReminderStatus,
  Vehicle,
} from '@car-rental/domain';
import {
  AUDIT_ENTRY_REPO,
  BOOKING_REPO,
  CANCELLATION_CASE_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
  CUSTOMER_CREDIT_LEDGER_REPO,
  DRIVER_CREDENTIAL_REPO,
  HANDOVER_RECORD_REPO,
  IDENTITY_DOCUMENT_REPO,
  MAINTENANCE_REPO,
  OPERATOR_RECOVERY_CASE_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { DriverEligibilityGateway } from '../../../core/services/driver-eligibility.gateway';
import { OcrExtractionResult, OcrGateway } from '../../../core/services/ocr.gateway';
import { ReminderDispatchResult, ReminderGateway, ScheduleReminderInput } from '../../../core/services/reminder.gateway';
import { ActivityTimelineComponent } from './activity-timeline.component';

class NoopOcrGateway implements OcrGateway {
  extract(): Promise<OcrExtractionResult> {
    return Promise.resolve({ status: 'succeeded', confidence: 1 });
  }
}

class NoopDriverEligibilityGateway implements DriverEligibilityGateway {
  checkReciprocity() {
    return Promise.resolve({ reciprocityStatus: 'eligible' as const });
  }
}

class NoopReminderGateway implements ReminderGateway {
  async schedule(_input: ScheduleReminderInput): Promise<ReminderDispatchResult> {
    return { state: 'scheduled' };
  }
  async cancel(): Promise<void> {
    return undefined;
  }
}

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'A-1',
    category: 'car',
    model: 'Altis',
    brand: 'Toyota',
    year: 2022,
    status: 'available',
    mileage: 1000,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: '2026-01-01T00:00:00.000Z',
    endTime: '2026-01-10T00:00:00.000Z',
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'completed',
    depositRequired: 0,
    ...partial,
  };
}

interface Fixtures {
  bookings?: RentalBooking[];
  payments?: PaymentRecord[];
  refunds?: RefundRecord[];
  adjustments?: ChargeAdjustment[];
  contracts?: ContractVersion[];
  identityDocuments?: IdentityDocument[];
  driverCredentials?: DriverCredential[];
  handoverRecords?: HandoverRecord[];
  cancellationCases?: CancellationCase[];
  creditEntries?: CustomerCreditLedgerEntry[];
  operatorRecoveryCases?: OperatorRecoveryCase[];
  auditEntries?: AuditEntry[];
  reminderStatuses?: ReminderStatus[];
}

function configure(fixtures: Fixtures = {}) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo() },
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(fixtures.bookings ?? [makeBooking()]) },
      { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>(fixtures.payments ?? []) },
      { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>(fixtures.refunds ?? []) },
      { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>(fixtures.adjustments ?? []) },
      { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>(fixtures.contracts ?? []) },
      {
        provide: IDENTITY_DOCUMENT_REPO,
        useValue: createInMemoryRepo<IdentityDocument>(fixtures.identityDocuments ?? []),
      },
      {
        provide: DRIVER_CREDENTIAL_REPO,
        useValue: createInMemoryRepo<DriverCredential>(fixtures.driverCredentials ?? []),
      },
      { provide: HANDOVER_RECORD_REPO, useValue: createInMemoryRepo<HandoverRecord>(fixtures.handoverRecords ?? []) },
      {
        provide: CANCELLATION_CASE_REPO,
        useValue: createInMemoryRepo<CancellationCase>(fixtures.cancellationCases ?? []),
      },
      {
        provide: CUSTOMER_CREDIT_LEDGER_REPO,
        useValue: createInMemoryRepo<CustomerCreditLedgerEntry>(fixtures.creditEntries ?? []),
      },
      {
        provide: OPERATOR_RECOVERY_CASE_REPO,
        useValue: createInMemoryRepo<OperatorRecoveryCase>(fixtures.operatorRecoveryCases ?? []),
      },
      { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>(fixtures.auditEntries ?? []) },
      { provide: REMINDER_STATUS_REPO, useValue: createInMemoryRepo<ReminderStatus>(fixtures.reminderStatuses ?? []) },
      { provide: OcrGateway, useValue: new NoopOcrGateway() },
      { provide: DriverEligibilityGateway, useValue: new NoopDriverEligibilityGateway() },
      { provide: ReminderGateway, useValue: new NoopReminderGateway() },
    ],
  });
}

function createFixture(bookingId = 'b1') {
  const fixture = TestBed.createComponent(ActivityTimelineComponent);
  fixture.componentRef.setInput('bookingId', bookingId);
  fixture.detectChanges();
  return fixture;
}

describe('ActivityTimelineComponent', () => {
  it('沒有任何資料時顯示空狀態文字', () => {
    configure();
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('尚無活動紀錄');
    expect(el.querySelectorAll('.activity-timeline__item')).toHaveLength(0);
  });

  it('彙整款項、合約版本、證件驗證、取車／還車、費用調整、取消、退款、購物金、業者復原、主管覆核、還車提醒，並依發生時間由舊到新排序', () => {
    const handoverRecord: HandoverRecord = {
      id: 'ho-pickup',
      bookingId: 'b1',
      kind: 'pickup',
      actualAt: '2026-01-04T08:00:00.000Z',
      mileage: 1000,
      energyLevel: 8,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: '主管王', confirmedAt: '2026-01-04T08:00:00.000Z' },
    };
    const returnRecord: HandoverRecord = {
      id: 'ho-return',
      bookingId: 'b1',
      kind: 'return',
      actualAt: '2026-01-06T09:00:00.000Z',
      mileage: 1100,
      energyLevel: 8,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: '主管王', confirmedAt: '2026-01-06T09:00:00.000Z' },
    };
    const cancellationCase: CancellationCase = {
      id: 'cc1',
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: '2026-01-07T09:00:00.000Z',
      ruleVersion: 'v1',
      originalDepositPaid: 0,
      originalOtherPrepayment: 0,
      refundLines: [],
      transferFee: 0,
      totalCashDue: 500,
      disposition: 'refund',
      status: 'settled',
      evidenceAssetIds: [],
    };

    configure({
      payments: [
        {
          id: 'pay1',
          bookingId: 'b1',
          amount: 1000,
          method: 'cash',
          purpose: 'deposit',
          status: 'confirmed',
          receivedAt: '2026-01-01T09:00:00.000Z',
          handledBy: '櫃檯A',
        },
      ],
      contracts: [
        {
          id: 'cv1',
          bookingId: 'b1',
          version: 1,
          status: 'signed',
          snapshot: {
            renter: { memberId: 'm1', name: '王小明', phone: '0900000000' },
            driver: { memberId: 'm1', name: '王小明', phone: '0900000000' },
            vehicle: { vehicleId: 'v1', plateNumber: 'A-1', brand: 'Toyota', model: 'Altis', category: 'car' },
            rentalStartTime: '2026-01-01T00:00:00.000Z',
            rentalEndTime: '2026-01-10T00:00:00.000Z',
            pickupLocation: '馬公',
            returnLocation: '馬公',
            depositRequired: 0,
            pricing: {
              dailyLines: [],
              rentalRaw: 0,
              tierDiscountPercent: 0,
              tierDiscountAmount: 0,
              rentalSubtotal: 0,
              partnerDiscountPercent: 0,
              partnerDiscount: 0,
              addOnLines: [],
              addOnSubtotal: 0,
              insuranceSubtotal: 0,
              couponDiscount: 0,
              total: 0,
            },
            disclosedRules: { cancellationContractKind: 'passenger_car', cancellationRuleVersion: 'v1' },
          },
          createdAt: '2026-01-01T10:00:00.000Z',
          signedAt: '2026-01-02T09:00:00.000Z',
        },
      ],
      identityDocuments: [
        {
          id: 'id1',
          memberId: 'm1',
          type: 'taiwan_id',
          documentNumber: 'A123456789',
          issuingCountry: 'TW',
          verification: { state: 'verified', verifiedAt: '2026-01-03T09:00:00.000Z', verifiedBy: '櫃檯A' },
          version: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-03T09:00:00.000Z',
        },
      ],
      driverCredentials: [
        {
          id: 'dc1',
          memberId: 'm1',
          type: 'taiwan_license',
          documentNumber: 'B987654',
          issuingCountry: 'TW',
          originalVehicleClassText: '小型車',
          standardizedVehicleClass: 'car',
          verification: { state: 'verified', verifiedAt: '2026-01-03T10:00:00.000Z', verifiedBy: '櫃檯A' },
          reciprocityStatus: 'not_applicable' as DriverCredential['reciprocityStatus'],
          version: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-03T10:00:00.000Z',
        },
      ],
      handoverRecords: [handoverRecord, returnRecord],
      adjustments: [
        {
          id: 'adj1',
          bookingId: 'b1',
          kind: 'late_return',
          quotedAmount: 200,
          amount: 200,
          status: 'confirmed',
          createdAt: '2026-01-05T09:00:00.000Z',
          handledBy: '主管王',
        },
      ],
      cancellationCases: [cancellationCase],
      refunds: [
        {
          id: 'rf1',
          bookingId: 'b1',
          cancellationCaseId: 'cc1',
          amount: 500,
          method: 'cash',
          status: 'completed',
          processedAt: '2026-01-07T10:00:00.000Z',
          handledBy: '櫃檯A',
        },
      ],
      creditEntries: [
        {
          id: 'cr1',
          memberId: 'm1',
          sourceCancellationCaseId: 'cc1',
          type: 'issued',
          amount: 100,
          occurredAt: '2026-01-07T11:00:00.000Z',
          handledBy: '櫃檯A',
        },
      ],
      operatorRecoveryCases: [
        {
          id: 'or1',
          bookingId: 'b1',
          reason: 'vehicle_breakdown',
          discoveredAt: '2026-01-08T09:00:00.000Z',
          notifiedAt: '2026-01-08T09:05:00.000Z',
          status: 'resolved',
          remedyAttempts: [],
          taxiReimbursements: [],
          goodwillCompensations: [],
          createdBy: '櫃檯A',
          createdAt: '2026-01-08T09:00:00.000Z',
          updatedAt: '2026-01-08T09:00:00.000Z',
        },
      ],
      auditEntries: [
        {
          id: 'audit1',
          action: 'override',
          entityType: 'handover_record',
          entityId: 'ho-pickup',
          actorId: 'sup1',
          actorName: '主管王',
          reason: '訂金餘額改於還車時一併結清',
          afterSummary: '主管覆核放行取車',
          createdAt: '2026-01-04T08:05:00.000Z',
        },
      ],
      reminderStatuses: [
        {
          id: 'rem1',
          bookingId: 'b1',
          offset: '24h_before_return',
          state: 'sent',
          sentAt: '2026-01-09T09:00:00.000Z',
          updatedAt: '2026-01-09T09:00:00.000Z',
        },
      ],
    });

    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    const items = Array.from(el.querySelectorAll('.activity-timeline__item'));

    const kinds = items.map((li) => li.getAttribute('data-kind'));
    expect(kinds).toEqual([
      'payment',
      'contract_version',
      'contract_version',
      'document_verification',
      'document_verification',
      'pickup',
      'supervisor_override',
      'adjustment',
      'return',
      'cancellation',
      'refund',
      'credit',
      'operator_recovery',
      'reminder',
    ]);

    // 時間確實嚴格遞增，證明真的是依時間排序而不是巧合符合期望的來源順序。
    const ats = items.map((li) => li.getAttribute('data-at') as string);
    const sorted = [...ats].sort();
    expect(ats).toEqual(sorted);

    // 已寄送的提醒必須附上明確的模擬標示，不能讓人誤以為信真的寄出去了。
    expect(el.textContent).toContain('開發模擬，非真實寄送結果');

    // 敏感欄位遮罩：完整證件號碼不可出現在畫面上，只顯示遮罩後（末 4 碼）的版本。
    expect(el.textContent).not.toContain('A123456789');
    expect(el.textContent).toContain('******6789');
    expect(el.textContent).not.toContain('B987654');
    expect(el.textContent).toContain('***7654');
  });

  it('退款紀錄沒有 processedAt 時，時間退回讀取所屬取消案件的提出時間，而不是直接漏掉這筆事件', () => {
    const cancellationCase: CancellationCase = {
      id: 'cc2',
      bookingId: 'b1',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: '2026-02-01T09:00:00.000Z',
      ruleVersion: 'v1',
      originalDepositPaid: 0,
      originalOtherPrepayment: 0,
      refundLines: [],
      transferFee: 0,
      totalCashDue: 300,
      disposition: 'refund',
      status: 'quoted',
      evidenceAssetIds: [],
    };
    configure({
      cancellationCases: [cancellationCase],
      refunds: [
        {
          id: 'rf2',
          bookingId: 'b1',
          cancellationCaseId: 'cc2',
          amount: 300,
          method: 'cash',
          status: 'pending',
          handledBy: '櫃檯A',
        },
      ],
    });

    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    const refundItem = Array.from(el.querySelectorAll('.activity-timeline__item')).find(
      (li) => li.getAttribute('data-kind') === 'refund',
    );

    expect(refundItem).toBeDefined();
    expect(refundItem?.getAttribute('data-at')).toBe('2026-02-01T09:00:00.000Z');
  });

  it('保留金轉換的更新稽核不是主管覆核事件', () => {
    const cancellationCase: CancellationCase = {
      id: 'cc-credit', bookingId: 'b1', contractKind: 'passenger_car', responsibility: 'customer',
      reason: 'customer_change_of_mind', requestedAt: '2026-02-01T09:00:00.000Z', ruleVersion: 'v1',
      originalDepositPaid: 500, originalOtherPrepayment: 0, refundLines: [{ label: 'deposit', amount: 500 }],
      transferFee: 0, totalCashDue: 500, disposition: 'credit', status: 'settled', evidenceAssetIds: [],
    };
    configure({
      cancellationCases: [cancellationCase],
      auditEntries: [{
        id: 'audit-credit', action: 'update', entityType: 'cancellation_case', entityId: 'cc-credit',
        actorId: 'staff1', actorName: '櫃檯甲', reason: '顧客同意轉為保留金',
        createdAt: '2026-02-01T10:00:00.000Z',
      }],
    });

    const fixture = createFixture();
    expect(fixture.nativeElement.querySelector('[data-kind="supervisor_override"]')).toBeNull();
  });
});
