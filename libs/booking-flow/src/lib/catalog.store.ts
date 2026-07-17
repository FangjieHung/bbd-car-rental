import { Injectable, inject } from '@angular/core';
import {
  AddOn,
  Coupon,
  Customer,
  PaymentMethod,
  PriceBreakdown,
  PricingPlan,
  RentalBooking,
  VEHICLE_REPO,
  BOOKING_REPO,
  CUSTOMER_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
  Vehicle,
  VehicleCategory,
  calculatePrice,
  isCouponValid,
  isVehicleAvailable,
} from '@car-rental/domain';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly vehicleRepo = inject(VEHICLE_REPO);
  private readonly bookingRepo = inject(BOOKING_REPO);
  private readonly customerRepo = inject(CUSTOMER_REPO);
  private readonly planRepo = inject(PRICING_PLAN_REPO);
  private readonly calRepo = inject(SEASON_CALENDAR_REPO);
  private readonly addOnRepo = inject(ADDON_REPO);
  private readonly couponRepo = inject(COUPON_REPO);

  availableVehicles(startTime: string, endTime: string): Vehicle[] {
    const bookings = this.bookingRepo.getAll();
    return this.vehicleRepo
      .getAll()
      .filter((v) => isVehicleAvailable({ vehicle: v, startTime, endTime, bookings }));
  }

  planForCategory(cat: VehicleCategory): PricingPlan | undefined {
    return this.planRepo.getAll().find((p) => p.appliesToCategory === cat);
  }

  addOns(): AddOn[] {
    return this.addOnRepo.getAll();
  }

  price(input: {
    category: VehicleCategory;
    startDate: string;
    endDate: string;
    addOns: { addOn: AddOn; qty: number }[];
    coupon?: Coupon;
  }): PriceBreakdown {
    const plan = this.planForCategory(input.category);
    if (!plan) throw new Error('無此車型定價');
    return calculatePrice({ plan, calendar: this.calRepo.getAll()[0], ...input });
  }

  validateCoupon(
    code: string,
    ctx: { startDate: string; days: number; category: VehicleCategory },
  ): { ok: boolean; coupon?: Coupon; reason?: string } {
    const coupon = this.couponRepo
      .getAll()
      .find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!coupon) return { ok: false, reason: '查無此優惠碼' };
    return isCouponValid(coupon, ctx) ? { ok: true, coupon } : { ok: false, reason: '不符使用條件' };
  }

  submitBooking(input: {
    vehicleId: string;
    startTime: string;
    endTime: string;
    pickupLocation: string;
    returnLocation: string;
    customer: { name: string; phone: string; email: string };
    category: VehicleCategory;
    startDate: string;
    endDate: string;
    addOns: { addOn: AddOn; qty: number }[];
    couponCode?: string;
    paymentMethod: PaymentMethod;
  }): RentalBooking {
    const vehicle = this.vehicleRepo.getById(input.vehicleId);
    if (!vehicle) throw new Error('查無車輛');
    if (
      !isVehicleAvailable({
        vehicle,
        startTime: input.startTime,
        endTime: input.endTime,
        bookings: this.bookingRepo.getAll(),
      })
    )
      throw new Error('車輛已被預約');
    const coupon = input.couponCode
      ? this.couponRepo.getAll().find((c) => c.code.toLowerCase() === input.couponCode!.toLowerCase())
      : undefined;
    const priceBreakdown = this.price({
      category: input.category,
      startDate: input.startDate,
      endDate: input.endDate,
      addOns: input.addOns,
      coupon,
    });
    const customer: Customer = {
      id: crypto.randomUUID(),
      name: input.customer.name,
      phone: input.customer.phone,
      note: input.customer.email,
    };
    this.customerRepo.create(customer);
    const booking: RentalBooking = {
      id: crypto.randomUUID(),
      vehicleId: input.vehicleId,
      customerId: customer.id,
      startTime: input.startTime,
      endTime: input.endTime,
      pickupLocation: input.pickupLocation,
      returnLocation: input.returnLocation,
      status: 'pending_payment',
      addOns: input.addOns.filter((a) => a.qty > 0).map((a) => ({ addOnId: a.addOn.id, qty: a.qty })),
      couponCode: priceBreakdown.couponCode,
      priceBreakdown,
      paymentMethod: input.paymentMethod,
    };
    this.bookingRepo.create(booking);
    return booking;
  }
}
