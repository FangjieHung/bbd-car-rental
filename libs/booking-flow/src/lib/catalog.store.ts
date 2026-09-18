import { Injectable, inject } from '@angular/core';
import {
  AddOn,
  Coupon,
  InsurancePlan,
  Member,
  PaymentPreference,
  PriceBreakdown,
  PricingPlan,
  RentalBooking,
  VEHICLE_REPO,
  BOOKING_REPO,
  MEMBER_REPO,
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
  private readonly memberRepo = inject(MEMBER_REPO);
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
    partnerDiscountPercent?: number;
    insurancePlan?: InsurancePlan;
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
    member: { name: string; phone: string; email: string };
    category: VehicleCategory;
    startDate: string;
    endDate: string;
    addOns: { addOn: AddOn; qty: number }[];
    couponCode?: string;
    paymentMethod: PaymentPreference;
    partnerDiscountPercent?: number;
    sourcePartnerId?: string;
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
      partnerDiscountPercent: input.partnerDiscountPercent,
    });
    const member: Member = {
      id: crypto.randomUUID(),
      name: input.member.name,
      phone: input.member.phone,
      note: input.member.email,
      // 佔位預設值：公開訂房流程目前尚未收集承租人類型（本國人／外國旅客／持居留證者），
      // Task 9/10 會補上實際的會員類型表單後，這裡應改用使用者實際輸入的值。
      kind: 'local',
    };
    this.memberRepo.create(member);
    const booking: RentalBooking = {
      id: crypto.randomUUID(),
      vehicleId: input.vehicleId,
      memberId: member.id,
      startTime: input.startTime,
      endTime: input.endTime,
      pickupLocation: input.pickupLocation,
      returnLocation: input.returnLocation,
      status: 'reserved',
      addOns: input.addOns.filter((a) => a.qty > 0).map((a) => ({ addOnId: a.addOn.id, qty: a.qty })),
      couponCode: priceBreakdown.couponCode,
      priceBreakdown,
      paymentPreference: input.paymentMethod,
      depositRequired: 0,
      ...(input.sourcePartnerId ? { sourcePartnerId: input.sourcePartnerId } : {}),
    };
    this.bookingRepo.create(booking);
    return booking;
  }

  /**
   * 付款成功後呼叫。目前由佔位付款頁觸發，日後改由金流回調觸發。
   * 訂單的履約狀態（reserved）本來就不代表付款是否完成 —— 這裡先維持原狀不動 status，
   * 只回傳訂單本身；Task 7 會在這裡接上真正的付款分類帳寫入（PaymentRecord），
   * 取代這個先佔位的窄接縫。
   */
  markBookingPaid(bookingId: string): RentalBooking {
    const booking = this.bookingRepo.getById(bookingId);
    if (!booking) throw new Error('查無訂單');
    return booking;
  }
}
