import { Injectable, inject } from '@angular/core';
import {
  DriverCredential,
  IdentityDocument,
  Member,
  PriceBreakdown,
  RentalOrder,
  Vehicle,
  calculatePrice,
  defaultDepositForCategory,
} from '../../../core/models';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { OrderStore } from '../../../stores/order/order.store';
import { PricingStore } from '../../../stores/pricing/pricing.store';
import { AddOnStore } from '../../../stores/addon/addon.store';
import { DocumentStore } from '../../../stores/document/document.store';
import {
  OrderFormData,
  OrderQuoteInput,
} from '@car-rental/order-form';

/** admin 以既有 stores 實作訂單表單的參考資料來源。 */
@Injectable()
export class AdminOrderFormData implements OrderFormData {
  private readonly vehicleStore = inject(VehicleStore);
  private readonly memberStore = inject(MemberStore);
  private readonly orderStore = inject(OrderStore);
  private readonly pricingStore = inject(PricingStore);
  private readonly addOnStore = inject(AddOnStore);
  private readonly documentStore = inject(DocumentStore);

  readonly vehicles = this.vehicleStore.vehicles;
  readonly addOns = this.addOnStore.addOns;

  searchMembers(query: string): Member[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.memberStore
      .members()
      .filter((m) => m.name.toLowerCase().includes(q) || m.phone.toLowerCase().includes(q));
  }

  memberById(id: string): Member | undefined {
    return this.memberStore.members().find((m) => m.id === id);
  }

  quote(input: OrderQuoteInput): PriceBreakdown | undefined {
    const plan = this.pricingStore.plans().find((p) => p.appliesToCategory === input.vehicle.category);
    const calendar = this.pricingStore.calendar();
    if (!plan || !calendar) return undefined;
    const addOns = this.addOnStore.addOns().map((a) => ({ addOn: a, qty: input.addOnQty[a.id] ?? 0 }));
    try {
      return calculatePrice({
        plan,
        calendar,
        startDate: input.startDate,
        endDate: input.endDate,
        addOns,
        ...(input.insurancePlan ? { insurancePlan: input.insurancePlan } : {}),
      });
    } catch {
      return undefined;
    }
  }

  findConflicts(vehicleId: string, startIso: string, endIso: string, excludeBookingId?: string): RentalOrder[] {
    // OrderStore.findConflicts 直接讀 repository；先讀一次 orders signal，讓 computed 在訂單異動時也會重算。
    this.orderStore.orders();
    return this.orderStore.findConflicts(vehicleId, startIso, endIso, excludeBookingId);
  }

  depositCap(vehicle: Vehicle | undefined, quoteTotal: number): number {
    return defaultDepositForCategory(vehicle?.category, quoteTotal);
  }

  identityDocumentsOf(memberId: string): IdentityDocument[] {
    return this.documentStore.identityDocumentsFor(memberId);
  }

  driverCredentialsOf(memberId: string): DriverCredential[] {
    return this.documentStore.driverCredentialsFor(memberId);
  }
}
