import { describe, expect, it } from 'vitest';
import { signal } from '@angular/core';
import { AddOn, InsurancePlan, Member, PriceBreakdown, RentalBooking, Vehicle, calculatePrice } from '../../../core/models';
import {
  NO_INSURANCE_VALUE,
  createOrderForm,
  lockRenterToMember,
  orderFormInitialFromBooking,
  unlockRenter,
} from './order-form';
import { OrderFormData } from './order-form-data';
import { createOrderFormDerived, orderFormProblems, orderIncompleteItems } from './order-form-derived';
import { buildContractSnapshot, sameContractTerms } from './contract-snapshot';
import { ZH_TW } from '../../../core/i18n/zh-tw';

const t = ZH_TW;

const insurance: InsurancePlan = { id: 'ins1', name: '甲式', dailyPriceFrom: 300, tags: [], coverageItems: [] };

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
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
    ...partial,
  };
}

const member: Member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local', email: 'a@b.c' };

function quoteFor(days: number, insuranceSubtotal = 0, addOnLines: PriceBreakdown['addOnLines'] = []): PriceBreakdown {
  const addOnSubtotal = addOnLines.reduce((s, l) => s + l.amount, 0);
  return {
    dailyLines: Array.from({ length: days }, (_, i) => ({ date: `2026-01-0${i + 1}`, dayType: 'weekday' as const, price: 1000 })),
    rentalRaw: 1000 * days,
    tierDiscountPercent: 0,
    tierDiscountAmount: 0,
    rentalSubtotal: 1000 * days,
    partnerDiscountPercent: 0,
    partnerDiscount: 0,
    addOnLines,
    addOnSubtotal,
    insuranceSubtotal,
    couponDiscount: 0,
    total: 1000 * days + insuranceSubtotal + addOnSubtotal,
  };
}

/** 最小的參考資料假實作：報價固定用 1000/日的方案真實試算。 */
function fakeData(vehicles: Vehicle[], conflicts: RentalBooking[] = [], addOns: AddOn[] = []): OrderFormData {
  return {
    vehicles: signal(vehicles),
    addOns: signal(addOns),
    searchMembers: () => [],
    memberById: () => undefined,
    quote: (input) =>
      calculatePrice({
        plan: {
          id: 'p',
          name: 'p',
          appliesToCategory: input.vehicle.category,
          dayTypeRates: { weekday: 1000, weekend: 1000, holiday: 1000, peak: 1000 },
          tiers: [],
        },
        calendar: { id: 'c', holidays: [], peakSeasons: [] },
        startDate: input.startDate,
        endDate: input.endDate,
        addOns: addOns.map((a) => ({ addOn: a, qty: input.addOnQty[a.id] ?? 0 })),
        ...(input.insurancePlan ? { insurancePlan: input.insurancePlan } : {}),
      }),
    findConflicts: () => conflicts,
    depositCap: (_v, total) => Math.round(total * 0.3),
  };
}

function filledForm() {
  const form = createOrderForm({
    vehicleId: 'v1',
    startTime: new Date('2026-01-05T09:00').toISOString(),
    endTime: new Date('2026-01-07T09:00').toISOString(),
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
  });
  form.controls.renter.patchValue({ name: '新客人', phone: '0900000000' });
  return form;
}

describe('createOrderForm', () => {
  it('預設值：保險為「不加保」、訂金 0、承租人未鎖定；ISO 初始時間轉成 datetime-local 格式', () => {
    const iso = new Date('2026-03-01T10:30').toISOString();
    const v = createOrderForm({ vehicleId: 'v1', startTime: iso }).getRawValue();
    expect(v.rental.vehicleId).toBe('v1');
    expect(v.rental.startLocal).toBe('2026-03-01T10:30');
    expect(v.pricing.insurancePlanId).toBe(NO_INSURANCE_VALUE);
    expect(v.pricing.depositRequired).toBe(0);
    expect(v.renter.memberId).toBeNull();
    expect(v.payments.drafts).toEqual([]);
  });

  it('鎖定既有會員會帶入資料並停用承租人欄位；換一位則解除並清空', () => {
    const form = createOrderForm({ member });
    expect(form.getRawValue().renter).toMatchObject({ memberId: 'm1', name: '王小明', email: 'a@b.c' });
    expect(form.controls.renter.controls.name.disabled).toBe(true);

    unlockRenter(form);
    expect(form.getRawValue().renter).toMatchObject({ memberId: null, name: '', phone: '' });
    expect(form.controls.renter.controls.name.enabled).toBe(true);

    lockRenterToMember(form, member);
    expect(form.controls.renter.controls.phone.disabled).toBe(true);
  });
});

describe('orderFormInitialFromBooking（編輯訂單的 hydration）', () => {
  const booking: RentalBooking = {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: '2026-01-05T01:00:00.000Z',
    endTime: '2026-01-07T01:00:00.000Z',
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-port',
    status: 'reserved',
    depositRequired: 600,
  };

  it('帶入車輛、租期、據點、訂金與會員；加購數量從 addOnLines 精確回填', () => {
    const initial = orderFormInitialFromBooking(
      { ...booking, priceBreakdown: quoteFor(2, 0, [{ addOnId: 'a1', name: '座椅', qty: 2, amount: 400 }]) },
      { member },
    );
    expect(initial).toMatchObject({
      vehicleId: 'v1',
      pickupLocation: 'mzg-airport',
      returnLocation: 'mzg-port',
      depositRequired: 600,
      addOnQty: { a1: 2 },
    });
    expect(createOrderForm(initial).getRawValue().renter.memberId).toBe('m1');
  });

  it('保險方案以「天數 × 每日價」反推；反推不出且車輛有方案時設為空字串（還沒解決）', () => {
    const vehicle = makeVehicle({ insurancePlans: [insurance] });
    expect(orderFormInitialFromBooking({ ...booking, priceBreakdown: quoteFor(2, 600) }, { vehicle }).insurancePlanId).toBe('ins1');
    expect(orderFormInitialFromBooking({ ...booking, priceBreakdown: quoteFor(2, 999) }, { vehicle }).insurancePlanId).toBe('');
    // 車輛已沒有任何保險方案：維持預設（不加保），不擋送出
    expect(
      orderFormInitialFromBooking({ ...booking, priceBreakdown: quoteFor(2, 999) }, { vehicle: makeVehicle() }).insurancePlanId,
    ).toBeUndefined();
  });
});

describe('buildContractSnapshot / sameContractTerms', () => {
  const vehicle = makeVehicle();

  it('預覽（無會員 id）與正式送出（有會員 id）的條款視為一致；內部備註不影響', () => {
    const form = filledForm();
    const quote = quoteFor(2);
    const preview = buildContractSnapshot(vehicle, quote, '', form.getRawValue());
    form.controls.contract.controls.internalNote.setValue('VIP');
    const final = buildContractSnapshot(vehicle, quote, 'member-new', form.getRawValue());
    expect(final.internalNote).toBe('VIP');
    expect(final.pickupLocation).not.toBe('mzg-airport'); // 快照存據點名稱，不是 id
    expect(sameContractTerms(preview, final)).toBe(true);
  });

  it('租期、承租人或報價改變時條款不一致', () => {
    const form = filledForm();
    const quote = quoteFor(2);
    const before = buildContractSnapshot(vehicle, quote, '', form.getRawValue());

    form.controls.rental.controls.endLocal.setValue('2026-01-08T09:00');
    expect(sameContractTerms(before, buildContractSnapshot(vehicle, quote, '', form.getRawValue()))).toBe(false);

    const form2 = filledForm();
    form2.controls.renter.controls.phone.setValue('0911111111');
    expect(sameContractTerms(before, buildContractSnapshot(vehicle, quote, '', form2.getRawValue()))).toBe(false);

    expect(sameContractTerms(before, buildContractSnapshot(vehicle, quoteFor(3), '', filledForm().getRawValue()))).toBe(false);
  });
});

describe('orderFormProblems（送出前檢查）', () => {
  function problemsOf(form: ReturnType<typeof createOrderForm>, data = fakeData([makeVehicle()])) {
    const value = signal(form.getRawValue());
    return orderFormProblems(value(), createOrderFormDerived(value, data));
  }

  it('空白表單：租期與車輛、承租人各有問題；費用沒問題', () => {
    const p = problemsOf(createOrderForm());
    expect(p.rental).toContain(t.orderForm.problems.rentalBaseline);
    expect(p.rental).toContain(t.orderForm.problems.branchesRequired);
    expect(p.renter).toEqual([t.orderForm.problems.renterBaseline]);
    expect(p.pricing).toEqual([]);
  });

  it('底線齊全時沒有任何問題', () => {
    expect(problemsOf(filledForm())).toEqual({ rental: [], renter: [], pricing: [] });
  });

  it('還車早於取車、時段衝突、訂金超過上限都會擋', () => {
    const form = filledForm();
    form.controls.rental.controls.endLocal.setValue('2026-01-04T09:00');
    expect(problemsOf(form).rental).toContain(t.orderForm.problems.endBeforeStart);

    const conflicted = problemsOf(filledForm(), fakeData([makeVehicle()], [{ id: 'x' } as RentalBooking]));
    expect(conflicted.rental).toContain(t.bookingForm.vehicleConflict);

    const rich = filledForm();
    rich.controls.pricing.controls.depositRequired.setValue(999_999);
    expect(problemsOf(rich).pricing[0]).toContain(t.bookingForm.depositExceedsCap);
  });
});

describe('orderIncompleteItems（待補項目）', () => {
  it('沿用舊規則；需重新簽署以專屬文字提示', () => {
    const v = filledForm().getRawValue();
    v.pricing.depositRequired = 600;
    expect(orderIncompleteItems(v, 2000, 'unsigned')).toEqual([
      t.bookingForm.incomplete.missingEmail,
      t.bookingForm.incomplete.depositNotCollected,
      t.bookingForm.incomplete.contractNotSigned,
      t.bookingForm.incomplete.balanceNotCollected,
    ]);
    expect(orderIncompleteItems(v, 2000, 'needs_resign')).toContain(t.orderForm.incomplete.contractNeedsResign);

    v.renter.email = 'a@b.c';
    v.payments.drafts = [
      { purpose: 'deposit', method: 'cash', amount: 600 },
      { purpose: 'balance', method: 'cash', amount: 1400 },
    ];
    expect(orderIncompleteItems(v, 2000, 'signed')).toEqual([]);
  });
});
