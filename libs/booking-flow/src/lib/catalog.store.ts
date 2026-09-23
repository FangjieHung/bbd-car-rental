import { Injectable, inject } from '@angular/core';
import {
  AddOn,
  Coupon,
  InsurancePlan,
  Member,
  PaymentMethod,
  PaymentPreference,
  PaymentRecord,
  PriceBreakdown,
  PricingPlan,
  RentalOrder,
  VEHICLE_REPO,
  ORDER_REPO,
  MEMBER_REPO,
  PAYMENT_REPO,
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

/**
 * 訂單建立時記錄的付款偏好（PaymentPreference）與付款分類帳實際採用的付款方式
 * （PaymentMethod）是兩個獨立的列舉 —— 分類帳沒有 'on_site' 這個值（現場付款當下
 * 一定會落地成某個具體方式，例如現金），所以需要顯式對應，不能直接假設兩邊相容。
 */
const PAYMENT_METHOD_FOR_PREFERENCE: Record<PaymentPreference, PaymentMethod> = {
  credit_card: 'credit_card',
  line_pay: 'line_pay',
  bank_transfer: 'bank_transfer',
  on_site: 'cash',
};

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly vehicleRepo = inject(VEHICLE_REPO);
  private readonly orderRepo = inject(ORDER_REPO);
  private readonly memberRepo = inject(MEMBER_REPO);
  private readonly paymentRepo = inject(PAYMENT_REPO);
  private readonly planRepo = inject(PRICING_PLAN_REPO);
  private readonly calRepo = inject(SEASON_CALENDAR_REPO);
  private readonly addOnRepo = inject(ADDON_REPO);
  private readonly couponRepo = inject(COUPON_REPO);

  availableVehicles(startTime: string, endTime: string): Vehicle[] {
    const bookings = this.orderRepo.getAll();
    return this.vehicleRepo
      .getAll()
      .filter((v) => isVehicleAvailable({ vehicle: v, startTime, endTime, orders: bookings }));
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
    pickupBranchId: string;
    returnBranchId: string;
    member: { name: string; phone: string; email: string };
    category: VehicleCategory;
    startDate: string;
    endDate: string;
    addOns: { addOn: AddOn; qty: number }[];
    couponCode?: string;
    paymentMethod: PaymentPreference;
    partnerDiscountPercent?: number;
    sourcePartnerId?: string;
    insurancePlanId?: string;
  }): RentalOrder {
    const vehicle = this.vehicleRepo.getById(input.vehicleId);
    if (!vehicle) throw new Error('查無車輛');
    if (
      !isVehicleAvailable({
        vehicle,
        startTime: input.startTime,
        endTime: input.endTime,
        orders: this.orderRepo.getAll(),
      })
    )
      throw new Error('車輛已被預約');
    const coupon = input.couponCode
      ? this.couponRepo.getAll().find((c) => c.code.toLowerCase() === input.couponCode!.toLowerCase())
      : undefined;
    const insurancePlan = input.insurancePlanId
      ? vehicle.insurancePlans?.find((p) => p.id === input.insurancePlanId)
      : undefined;
    const priceBreakdown = this.price({
      category: input.category,
      startDate: input.startDate,
      endDate: input.endDate,
      addOns: input.addOns,
      coupon,
      partnerDiscountPercent: input.partnerDiscountPercent,
      insurancePlan,
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
    const booking: RentalOrder = {
      id: crypto.randomUUID(),
      vehicleId: input.vehicleId,
      memberId: member.id,
      startTime: input.startTime,
      endTime: input.endTime,
      pickupBranchId: input.pickupBranchId,
      returnBranchId: input.returnBranchId,
      status: 'reserved',
      addOns: input.addOns.filter((a) => a.qty > 0).map((a) => ({ addOnId: a.addOn.id, qty: a.qty })),
      couponCode: priceBreakdown.couponCode,
      priceBreakdown,
      paymentPreference: input.paymentMethod,
      depositRequired: 0,
      ...(input.sourcePartnerId ? { sourcePartnerId: input.sourcePartnerId } : {}),
      ...(input.insurancePlanId ? { insurancePlanId: input.insurancePlanId } : {}),
    };
    this.orderRepo.create(booking);
    return booking;
  }

  /**
   * 付款成功後呼叫。目前由佔位付款頁觸發，日後改由金流回調觸發。
   * 訂單的履約狀態（reserved）本來就不代表付款是否完成 —— 這裡不動 status，
   * 只在付款分類帳（PaymentRecord）追加一筆已確認付款，讓 PaymentStore.summaryFor
   * 之後能算出正確的已付金額。付款方式優先採用訂單建立時記錄的 paymentPreference，
   * 查無報價明細時金額退回 0（沒有更好的數字可用，寧可留 0 讓後續人工核對）。
   *
   * 冪等性：這是財務分類帳，不能因為使用者連點兩下付款按鈕、重新整理後回到這一頁、
   * 或未來真金流回調重試，就多記一筆重複的已確認付款。呼叫前先查是否已有該訂單的
   * confirmed balance 付款紀錄，有的話直接視為已完成、不再新增。
   */
  markBookingPaid(bookingId: string): RentalOrder {
    const booking = this.orderRepo.getById(bookingId);
    if (!booking) throw new Error('查無訂單');

    const alreadyPaid = this.paymentRepo
      .getAll()
      .some((p) => p.bookingId === bookingId && p.purpose === 'balance' && p.status === 'confirmed');
    if (alreadyPaid) return booking;

    const payment: PaymentRecord = {
      id: crypto.randomUUID(),
      bookingId: booking.id,
      amount: booking.priceBreakdown?.total ?? 0,
      method: booking.paymentPreference ? PAYMENT_METHOD_FOR_PREFERENCE[booking.paymentPreference] : 'credit_card',
      purpose: 'balance',
      status: 'confirmed',
      receivedAt: new Date().toISOString(),
      handledBy: 'online_payment',
    };
    this.paymentRepo.create(payment);

    return booking;
  }
}
