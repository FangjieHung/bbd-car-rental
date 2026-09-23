// 僅供 features/orders 的 spec 使用：以 in-memory repository 組出 admin stores 需要的注入環境。
import { Provider } from '@angular/core';
import {
  ADDON_REPO,
  ORDER_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
  MAINTENANCE_REPO,
  MEMBER_REPO,
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
  ChargeAdjustment,
  ContractVersion,
  MaintenanceRecord,
  Member,
  PaymentRecord,
  PricingPlan,
  RefundRecord,
  ReminderStatus,
  RentalOrder,
  SeasonCalendar,
  Vehicle,
} from '../../core/models';
import { ReminderGateway } from '../../core/services/reminder.gateway';

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
}

export function createOrderRepos(options: OrderRepoOptions = {}) {
  const repos = {
    vehicleRepo: createInMemoryRepo<Vehicle>(options.vehicles ?? [makeVehicle()]),
    memberRepo: createInMemoryRepo<Member>(options.members ?? []),
    orderRepo: createInMemoryRepo<RentalOrder>(options.orders ?? []),
    paymentRepo: createInMemoryRepo<PaymentRecord>([]),
    contractRepo: createInMemoryRepo<ContractVersion>(options.contracts ?? []),
    reminderStatusRepo: createInMemoryRepo<ReminderStatus>([]),
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
    { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
    { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
    { provide: CONTRACT_VERSION_REPO, useValue: repos.contractRepo },
    { provide: REMINDER_STATUS_REPO, useValue: repos.reminderStatusRepo },
    { provide: ReminderGateway, useValue: repos.reminderGateway },
  ];
  return { ...repos, providers };
}
