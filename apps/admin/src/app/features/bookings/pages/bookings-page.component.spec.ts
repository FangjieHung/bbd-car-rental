import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingsPageComponent } from './bookings-page.component';
import {
  AUDIT_ENTRY_REPO,
  CANCELLATION_CASE_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
  CUSTOMER_CREDIT_LEDGER_REPO,
  OPERATOR_RECOVERY_CASE_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  VEHICLE_REPO,
  BOOKING_REPO,
  MEMBER_REPO,
  MAINTENANCE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { ReminderGateway } from '../../../core/services/reminder.gateway';
import {
  AuditEntry,
  CancellationCase,
  ChargeAdjustment,
  ContractVersion,
  CustomerCreditLedgerEntry,
  Vehicle,
  RentalBooking,
  Member,
  MaintenanceRecord,
  OperatorRecoveryCase,
  PaymentRecord,
  RefundRecord,
  ReminderStatus,
} from '../../../core/models';
import { OrderDetailNavigation } from '../../orders/navigation/order-detail-navigation';

function makeVehicle(partial: Partial<Vehicle>): Vehicle {
  return {
    id: partial.id ?? 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: 'Gogoro',
    brand: 'Gogoro',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

function makeBooking(partial: Partial<RentalBooking>): RentalBooking {
  return {
    id: partial.id ?? 'b1',
    vehicleId: 'v1',
    memberId: 'c1',
    startTime: new Date(2026, 7, 1, 9).toISOString(),
    endTime: new Date(2026, 7, 3, 9).toISOString(),
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  };
}

/**
 * BookingsPageComponent（Task 16）新增了急迫指標所需的 PaymentStore／OperatorRecoveryStore，
 * 後者又轉引出 ContractStore／CancellationStore／CreditStore，DI 圖因此拉得很深——
 * 即使測試不呼叫相關方法，元件建構時仍會整串解析，缺一個 provider 測試就整個炸掉。
 */
function provideOrderDetailRepos(options: {
  refunds?: RefundRecord[];
  operatorRecoveryCases?: OperatorRecoveryCase[];
} = {}) {
  return [
    { provide: PAYMENT_REPO, useValue: createInMemoryRepo<PaymentRecord>([]) },
    { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>(options.refunds ?? []) },
    { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
    { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>([]) },
    { provide: CANCELLATION_CASE_REPO, useValue: createInMemoryRepo<CancellationCase>([]) },
    { provide: CUSTOMER_CREDIT_LEDGER_REPO, useValue: createInMemoryRepo<CustomerCreditLedgerEntry>([]) },
    { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo<AuditEntry>([]) },
    {
      provide: OPERATOR_RECOVERY_CASE_REPO,
      useValue: createInMemoryRepo<OperatorRecoveryCase>(options.operatorRecoveryCases ?? []),
    },
    { provide: REMINDER_STATUS_REPO, useValue: createInMemoryRepo<ReminderStatus>([]) },
    {
      provide: ReminderGateway,
      useValue: { schedule: async () => ({ state: 'scheduled' as const }), cancel: async () => undefined },
    },
  ];
}

describe('BookingsPageComponent filtering', () => {
  let component: BookingsPageComponent;
  let workspaceOpen: ReturnType<typeof vi.fn>;
  let workspaceEdit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    workspaceOpen = vi.fn();
    workspaceEdit = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ...provideOrderDetailRepos(),
        { provide: OrderDetailNavigation, useValue: { open: workspaceOpen, edit: workspaceEdit } },
        {
          provide: VEHICLE_REPO,
          useValue: createInMemoryRepo<Vehicle>([
            makeVehicle({ id: 'v1', plateNumber: 'ABC-123' }),
            makeVehicle({ id: 'v2', plateNumber: 'XYZ-999' }),
          ]),
        },
        {
          provide: MEMBER_REPO,
          useValue: createInMemoryRepo<Member>([
            { id: 'c1', name: '王小明', phone: '0912000111', kind: 'local' },
            { id: 'c2', name: '陳大文', phone: '0922000222', kind: 'local' },
          ]),
        },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([
            makeBooking({ id: 'b1', vehicleId: 'v1', memberId: 'c1', status: 'reserved' }),
            makeBooking({ id: 'b2', vehicleId: 'v2', memberId: 'c2', status: 'in_progress' }),
            makeBooking({ id: 'b3', vehicleId: 'v1', memberId: 'c2', status: 'cancelled' }),
          ]),
        },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    component = TestBed.createComponent(BookingsPageComponent).componentInstance;
  });

  it('沒有任何篩選時顯示全部', () => {
    expect(component.filteredBookings()).toHaveLength(3);
  });

  it('依會員姓名搜尋', () => {
    component.searchQuery.set('王小明');
    expect(component.filteredBookings().map((b) => b.id)).toEqual(['b1']);
  });

  it('依車牌搜尋（不分大小寫）', () => {
    component.searchQuery.set('xyz');
    expect(component.filteredBookings().map((b) => b.id)).toEqual(['b2']);
  });

  it('依訂單狀態篩選', () => {
    component.statusFilter.set('cancelled');
    expect(component.filteredBookings().map((b) => b.id)).toEqual(['b3']);
  });

  it('搜尋與篩選可同時套用', () => {
    component.searchQuery.set('陳大文');
    component.statusFilter.set('cancelled');
    expect(component.filteredBookings().map((b) => b.id)).toEqual(['b3']);
  });

  it('clearFilters 只清除篩選，不清除搜尋文字', () => {
    component.searchQuery.set('王小明');
    component.statusFilter.set('reserved');
    component.clearFilters();
    expect(component.statusFilter()).toBeNull();
    expect(component.searchQuery()).toBe('王小明');
  });

  it('openDetail 呼叫 OrderDetailNavigation.open，帶上該筆訂單 id', () => {
    component.openDetail(makeBooking({ id: 'b2', vehicleId: 'v2', memberId: 'c2' }));

    expect(workspaceOpen).toHaveBeenCalledWith('b2');
  });

  it('editOrder 開啟訂單詳情並直接進入編輯（OrderDetailNavigation.edit）', () => {
    component.editOrder(makeBooking({ id: 'b1' }));

    expect(workspaceEdit).toHaveBeenCalledWith('b1');
  });

  it('handoverAction／cancelAction 都開同一個訂單詳情的對應分頁，不直接呼叫 BookingStore', () => {
    const booking = makeBooking({ id: 'b1' });

    component.handoverAction(booking);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'handover');

    component.cancelAction(booking);
    expect(workspaceOpen).toHaveBeenLastCalledWith('b1', 'cancellation');
  });
});

describe('BookingsPageComponent 急迫指標與排序', () => {
  const NOW = new Date(2026, 7, 10, 12, 0, 0);

  function setup() {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    const workspaceOpen = vi.fn();
    const workspaceEdit = vi.fn();
    // ordinary：一般 reserved 訂單，無任何急迫條件。
    const ordinary = makeBooking({ id: 'ordinary', status: 'reserved' });
    // overdueReturn：in_progress 且還車時間已過，屬於逾時未還。
    const overdueReturn = makeBooking({
      id: 'overdue-return',
      status: 'in_progress',
      endTime: new Date(2026, 7, 10, 9).toISOString(),
    });
    // refundPending：cancelled 訂單，有一筆狀態 pending 的退款紀錄。
    const refundPending = makeBooking({ id: 'refund-pending', status: 'cancelled' });
    // recovering：reserved 訂單，有一筆 in_progress 的業者復原案件。
    const recovering = makeBooking({ id: 'recovering', status: 'reserved' });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ...provideOrderDetailRepos({
          refunds: [
            {
              id: 'r1', bookingId: 'refund-pending', amount: 500, method: 'cash',
              status: 'pending', handledBy: '',
            },
          ],
          operatorRecoveryCases: [
            {
              id: 'orc1', bookingId: 'recovering', reason: 'vehicle_breakdown',
              discoveredAt: '', notifiedAt: '', status: 'in_progress', remedyAttempts: [],
              taxiReimbursements: [], goodwillCompensations: [], createdBy: '', createdAt: '', updatedAt: '',
            },
          ],
        }),
        { provide: OrderDetailNavigation, useValue: { open: workspaceOpen, edit: workspaceEdit } },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle({})]) },
        {
          provide: MEMBER_REPO,
          useValue: createInMemoryRepo<Member>([{ id: 'c1', name: '王小明', phone: '0900000000', kind: 'local' }]),
        },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([ordinary, overdueReturn, refundPending, recovering]),
        },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    const component = TestBed.createComponent(BookingsPageComponent).componentInstance;
    return { component, workspaceOpen };
  }

  it('逾時未還／退款待處理／業者復原處理中都判定為急迫', () => {
    const { component } = setup();
    const bookings = component.store.bookings();
    const overdue = bookings.find((b) => b.id === 'overdue-return')!;
    const refundPending = bookings.find((b) => b.id === 'refund-pending')!;
    const recovering = bookings.find((b) => b.id === 'recovering')!;
    const ordinary = bookings.find((b) => b.id === 'ordinary')!;

    expect(component.isOverdueReturn(overdue)).toBe(true);
    expect(component.hasRefundPending(refundPending)).toBe(true);
    expect(component.hasUrgentOperatorRecovery(recovering)).toBe(true);
    expect(component.isUrgent(overdue)).toBe(true);
    expect(component.isUrgent(refundPending)).toBe(true);
    expect(component.isUrgent(recovering)).toBe(true);
    expect(component.isUrgent(ordinary)).toBe(false);

    vi.useRealTimers();
  });

  it('急迫列排在一般列之前，且維持原始載入順序（穩定排序）', () => {
    const { component } = setup();

    // 載入順序：ordinary, overdue-return, refund-pending, recovering。
    // 急迫的三筆（overdue-return, refund-pending, recovering）應排到 ordinary 之前，
    // 且彼此之間維持原本的相對順序（穩定排序），ordinary 排在最後。
    expect(component.filteredBookings().map((b) => b.id)).toEqual([
      'overdue-return',
      'refund-pending',
      'recovering',
      'ordinary',
    ]);

    vi.useRealTimers();
  });

  it('goUrgent 開同一個訂單詳情的指定分頁', () => {
    const { component, workspaceOpen } = setup();
    const overdue = component.store.bookings().find((b) => b.id === 'overdue-return')!;

    component.goUrgent(overdue, 'handover');
    expect(workspaceOpen).toHaveBeenCalledWith('overdue-return', 'handover');

    vi.useRealTimers();
  });
});
