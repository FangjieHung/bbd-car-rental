import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  AuditEntry,
  CancellationCase,
  ChargeAdjustment,
  ContractVersion,
  CustomerCreditLedgerEntry,
  Member,
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
  MAINTENANCE_REPO,
  MEMBER_REPO,
  OPERATOR_RECOVERY_CASE_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { ReminderGateway } from '../../../core/services/reminder.gateway';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { OperatorRecoveryPanelComponent } from './operator-recovery-panel.component';
import { OperatorRecoveryStore } from '../../../stores/operator-recovery/operator-recovery.store';
import { CancellationStore } from '../../../stores/cancellation/cancellation.store';
import { BookingStore } from '../../../stores/booking/booking.store';

const T_START = '2026-08-20T09:00:00.000Z';
const T_END = '2026-08-22T18:00:00.000Z';

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'A-1',
    category: 'car',
    model: 'Yaris',
    brand: 'Toyota',
    year: 2022,
    status: 'reserved',
    mileage: 1000,
    createdAt: T_START,
    ...partial,
  };
}

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: T_START,
    endTime: T_END,
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'reserved',
    depositRequired: 1000,
    ...partial,
  };
}

function makeMember(partial: Partial<Member> = {}): Member {
  return { id: 'm1', name: '王小明', phone: '0900000000', kind: 'local', ...partial };
}

function makeContractVersion(partial: Partial<ContractVersion> = {}): ContractVersion {
  return {
    id: 'cv1',
    bookingId: 'b1',
    version: 1,
    status: 'signed',
    snapshot: {
      renter: { memberId: 'm1', name: '王小明', phone: '0900000000' },
      driver: { memberId: 'm1', name: '王小明', phone: '0900000000' },
      vehicle: { vehicleId: 'v1', plateNumber: 'A-1', brand: 'Toyota', model: 'Yaris', category: 'car' },
      rentalStartTime: T_START,
      rentalEndTime: T_END,
      pickupLocation: '馬公',
      returnLocation: '馬公',
      depositRequired: 1000,
      pricing: {
        dailyLines: [],
        rentalRaw: 2000,
        tierDiscountPercent: 0,
        tierDiscountAmount: 0,
        rentalSubtotal: 2000,
        partnerDiscountPercent: 0,
        partnerDiscount: 0,
        addOnLines: [],
        addOnSubtotal: 0,
        insuranceSubtotal: 0,
        couponDiscount: 0,
        total: 2000,
      },
      disclosedRules: { cancellationContractKind: 'passenger_car', cancellationRuleVersion: '2026.1' },
    },
    createdAt: T_START,
    signedAt: T_START,
    ...partial,
  };
}

describe('OperatorRecoveryPanelComponent', () => {
  function configure(
    options: { vehicles?: Vehicle[]; booking?: Partial<RentalBooking>; contracts?: ContractVersion[] } = {},
  ) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: OPERATOR_RECOVERY_CASE_REPO, useValue: createInMemoryRepo<OperatorRecoveryCase>() },
        { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>() },
        { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>() },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([makeBooking(options.booking)]) },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>(options.vehicles ?? [makeVehicle()]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember()]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<{ id: string }>([]) },
        {
          provide: CONTRACT_VERSION_REPO,
          useValue: createInMemoryRepo<ContractVersion>(options.contracts ?? []),
        },
        { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
        { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
        { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
        { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>([]) },
        { provide: REMINDER_STATUS_REPO, useValue: createInMemoryRepo<ReminderStatus>([]) },
        {
          provide: ReminderGateway,
          useValue: { schedule: async () => ({ state: 'scheduled' as const }), cancel: async () => undefined },
        },
      ],
    });
  }

  beforeEach(() => configure());

  function createFixture(bookingId = 'b1') {
    const fixture = TestBed.createComponent(OperatorRecoveryPanelComponent);
    fixture.componentRef.setInput('bookingId', bookingId);
    fixture.detectChanges();
    return fixture;
  }

  it('尚無案件時顯示空狀態', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.operatorRecoveryPanel.noCases);
  });

  it('開立案件後自動選取，狀態為處理中，可看到下一個待嘗試方案', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component['createForm'].patchValue({ reason: 'vehicle_breakdown', actorName: '櫃檯甲' });
    component['submitCreateCase']();
    fixture.detectChanges();

    const store = TestBed.inject(OperatorRecoveryStore);
    expect(store.casesFor('b1')).toHaveLength(1);
    expect(component['selectedCase']()?.status).toBe('in_progress');
    expect(component['nextRemedyType']()).toBe('same_class_replacement');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.operatorRecoveryPanel.remedyTypeLabels['same_class_replacement']);
  });

  it('依序嘗試補救方案：同級調車拒絕後，下一個待嘗試方案變成免費升等', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component['createForm'].patchValue({ actorName: '櫃檯甲' });
    component['submitCreateCase']();
    fixture.detectChanges();

    component['remedyForm'].patchValue({ outcome: 'declined', notedBy: '櫃檯甲' });
    component['submitRemedy']();
    fixture.detectChanges();

    expect(component['nextRemedyType']()).toBe('free_upgrade');
    expect(component['remedySubmitError']()).toBeUndefined();
  });

  it('接受同級調車：更新訂單車輛、產生新合約版本，案件狀態變 resolved', () => {
    configure({
      vehicles: [makeVehicle(), makeVehicle({ id: 'v2', plateNumber: 'A-2', status: 'available' })],
      contracts: [makeContractVersion()],
    });
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component['createForm'].patchValue({ actorName: '櫃檯甲' });
    component['submitCreateCase']();
    fixture.detectChanges();

    component['remedyForm'].patchValue({
      outcome: 'accepted',
      replacementVehicleId: 'v2',
      customerConsent: true,
      approvedBy: '店長乙',
      notedBy: '櫃檯甲',
    });
    component['submitRemedy']();
    fixture.detectChanges();

    const bookingStore = TestBed.inject(BookingStore);
    expect(bookingStore.bookings().find((b) => b.id === 'b1')?.vehicleId).toBe('v2');
    expect(component['selectedCase']()?.status).toBe('resolved');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.operatorRecoveryPanel.resolvedNotice);
  });

  it('接受補救方案但未勾選顧客同意時顯示錯誤，且不更新訂單', () => {
    configure({ vehicles: [makeVehicle(), makeVehicle({ id: 'v2', status: 'available' })] });
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component['createForm'].patchValue({ actorName: '櫃檯甲' });
    component['submitCreateCase']();
    fixture.detectChanges();

    component['remedyForm'].patchValue({
      outcome: 'accepted',
      replacementVehicleId: 'v2',
      customerConsent: false,
      approvedBy: '店長乙',
      notedBy: '櫃檯甲',
    });
    component['submitRemedy']();
    fixture.detectChanges();

    expect(component['remedySubmitError']()).toBe(ZH_TW.operatorRecoveryPanel.consentRequired);
    const bookingStore = TestBed.inject(BookingStore);
    expect(bookingStore.bookings().find((b) => b.id === 'b1')?.vehicleId).toBe('v1');
  });

  it('三個補救方案皆嘗試失敗前，無法進入業者責任取消；皆失敗後可建立業者責任取消案件', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component['createForm'].patchValue({ actorName: '櫃檯甲' });
    component['submitCreateCase']();
    fixture.detectChanges();

    expect(component['canEscalate']()).toBe(false);
    let el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.operatorRecoveryPanel.escalateNotEligibleNotice);

    component['remedyForm'].patchValue({ outcome: 'unavailable', notedBy: '櫃檯甲' });
    component['submitRemedy']();
    fixture.detectChanges();
    component['remedyForm'].patchValue({ outcome: 'declined', notedBy: '櫃檯甲' });
    component['submitRemedy']();
    fixture.detectChanges();
    component['remedyForm'].patchValue({
      outcome: 'declined',
      notedBy: '櫃檯甲',
      partnerName: '離島租車行',
      externalQuoteAmount: 3000,
    });
    component['submitRemedy']();
    fixture.detectChanges();

    expect(component['canEscalate']()).toBe(true);

    component['escalateForm'].patchValue({
      requestedAt: toDatetimeLocalValue('2026-08-19T02:00:00.000Z'),
      actorName: '櫃檯甲',
      approvedBy: '店長乙',
    });
    component['submitEscalate']();
    fixture.detectChanges();

    expect(component['selectedCase']()?.status).toBe('escalated_to_cancellation');
    const cancellationStore = TestBed.inject(CancellationStore);
    expect(cancellationStore.casesFor('b1')).toHaveLength(1);
    expect(cancellationStore.casesFor('b1')[0].responsibility).toBe('operator_fault');
    expect(cancellationStore.casesFor('b1')[0].transferFee).toBe(0);

    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.operatorRecoveryPanel.escalatedNotice);
  });

  it('計程車車資補貼與善意補償各自新增紀錄；缺核准人時表單驗證擋下送出', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component['createForm'].patchValue({ actorName: '櫃檯甲' });
    component['submitCreateCase']();
    fixture.detectChanges();

    // approvedBy 是必填欄位，表單驗證會直接擋下送出（不會呼叫 store，也不會有案件紀錄）。
    component['taxiForm'].patchValue({ amount: 300, notedBy: '櫃檯甲', approvedBy: '' });
    component['submitTaxi']();
    fixture.detectChanges();
    expect(component['selectedCase']()?.taxiReimbursements).toHaveLength(0);

    component['taxiForm'].patchValue({ amount: 300, notedBy: '櫃檯甲', approvedBy: '店長乙' });
    component['submitTaxi']();
    fixture.detectChanges();
    expect(component['selectedCase']()?.taxiReimbursements).toHaveLength(1);

    component['goodwillForm'].patchValue({
      type: 'credit',
      amount: 200,
      notedBy: '櫃檯甲',
      approvedBy: '店長乙',
    });
    component['submitGoodwill']();
    fixture.detectChanges();
    expect(component['selectedCase']()?.goodwillCompensations).toHaveLength(1);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(ZH_TW.operatorRecoveryPanel.goodwillTypeLabels['credit']);
  });
});
