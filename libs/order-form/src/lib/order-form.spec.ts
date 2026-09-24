import { TEST_ORDER_FORM_LABELS } from './order-form-labels.testing';
import { describe, expect, it } from 'vitest';
import { signal } from '@angular/core';
import { AddOn, InsurancePlan, Member, PriceBreakdown, RentalOrder, Vehicle, calculatePrice } from '@car-rental/domain';
import {
  NO_INSURANCE_VALUE,
  addPaymentDraft,
  createOrderForm,
  lockRenterToMember,
  orderFormInitialFromOrder,
  removePaymentDraft,
  setPaymentDrafts,
  unlockRenter,
} from './order-form';
import { OrderFormData } from './order-form-data';
import {
  createOrderFormDerived,
  orderFormProblems,
  orderRentalDays,
  orderRequirements,
  paymentDraftBalance,
} from './order-form-derived';
import { buildContractSnapshot, sameContractTerms } from './contract-snapshot';
import { OrderFormLabels } from './order-form-labels';

/** 測試字典的值就是鍵路徑，斷言時直接比對用的是哪一句。 */
const t = TEST_ORDER_FORM_LABELS;


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
function fakeData(vehicles: Vehicle[], conflicts: RentalOrder[] = [], addOns: AddOn[] = []): OrderFormData {
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
    identityDocumentsOf: () => [],
    driverCredentialsOf: () => [],
  };
}

function filledForm() {
  const form = createOrderForm({
    vehicleId: 'v1',
    startTime: new Date('2026-01-05T09:00').toISOString(),
    endTime: new Date('2026-01-07T09:00').toISOString(),
    pickupBranchId: 'mzg-airport',
    returnBranchId: 'mzg-airport',
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

describe('addPaymentDraft／removePaymentDraft／setPaymentDrafts（款項草稿：列表就是紀錄）', () => {
  it('addPaymentDraft 新增一列，getRawValue 立即反映列上的值', () => {
    const form = createOrderForm();
    addPaymentDraft(form, { method: 'cash', purpose: 'deposit', amount: 600 });
    expect(form.getRawValue().payments.drafts).toEqual([{ method: 'cash', purpose: 'deposit', amount: 600 }]);
  });

  it('直接修改列上的欄位（不呼叫 addPaymentDraft 以外的任何提交動作）：getRawValue 立即反映新值——這是原本 bug 的修法核心', () => {
    const form = createOrderForm();
    addPaymentDraft(form, { method: 'cash', purpose: 'deposit', amount: 0 });
    // 對應使用者直接在列上打金額，沒有另外按任何「新增」或「送出」——列本身就是紀錄。
    form.controls.payments.controls.drafts.at(0)?.controls.amount.setValue(500);
    expect(form.getRawValue().payments.drafts).toEqual([{ method: 'cash', purpose: 'deposit', amount: 500 }]);
  });

  it('可新增多列，依序保留；removePaymentDraft 依 index 移除、其餘列順序不變', () => {
    const form = createOrderForm();
    addPaymentDraft(form, { method: 'cash', purpose: 'deposit', amount: 600 });
    addPaymentDraft(form, { method: 'line_pay', purpose: 'balance', amount: 1400 });
    addPaymentDraft(form, { method: 'cash', purpose: 'adjustment', amount: 100 });
    expect(form.getRawValue().payments.drafts.map((d) => d.amount)).toEqual([600, 1400, 100]);

    removePaymentDraft(form, 1);
    expect(form.getRawValue().payments.drafts.map((d) => d.amount)).toEqual([600, 100]);
    expect(form.getRawValue().payments.drafts.map((d) => d.purpose)).toEqual(['deposit', 'adjustment']);
  });

  it('金額必填且大於 0：null、0、負數皆無效；正數才有效', () => {
    const form = createOrderForm();
    addPaymentDraft(form, { method: 'cash', purpose: 'balance', amount: null });
    const amount = form.controls.payments.controls.drafts.at(0)?.controls.amount;
    expect(amount?.valid).toBe(false);

    amount?.setValue(0);
    expect(amount?.valid).toBe(false);

    amount?.setValue(-100);
    expect(amount?.valid).toBe(false);

    amount?.setValue(500);
    expect(amount?.valid).toBe(true);
  });

  it('setPaymentDrafts 整批帶入，取代原本所有列', () => {
    const form = createOrderForm();
    addPaymentDraft(form, { method: 'cash', purpose: 'deposit', amount: 600 });
    setPaymentDrafts(form, [
      { method: 'line_pay', purpose: 'balance', amount: 1400 },
      { method: 'cash', purpose: 'adjustment', amount: 100 },
    ]);
    expect(form.getRawValue().payments.drafts).toEqual([
      { method: 'line_pay', purpose: 'balance', amount: 1400 },
      { method: 'cash', purpose: 'adjustment', amount: 100 },
    ]);
  });
});

describe('orderFormInitialFromOrder（編輯訂單的 hydration）', () => {
  const order: RentalOrder = {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: '2026-01-05T01:00:00.000Z',
    endTime: '2026-01-07T01:00:00.000Z',
    pickupBranchId: 'mzg-airport',
    returnBranchId: 'mzg-port',
    status: 'reserved',
    depositRequired: 600,
  };

  it('帶入車輛、租期、據點、訂金與會員；加購數量從 addOnLines 精確回填', () => {
    const initial = orderFormInitialFromOrder(
      { ...order, priceBreakdown: quoteFor(2, 0, [{ addOnId: 'a1', name: '座椅', qty: 2, amount: 400 }]) },
      { member },
    );
    expect(initial).toMatchObject({
      vehicleId: 'v1',
      pickupBranchId: 'mzg-airport',
      returnBranchId: 'mzg-port',
      depositRequired: 600,
      addOnQty: { a1: 2 },
    });
    expect(createOrderForm(initial).getRawValue().renter.memberId).toBe('m1');
  });

  it('保險方案以「天數 × 每日價」反推；反推不出且車輛有方案時設為空字串（還沒解決）', () => {
    const vehicle = makeVehicle({ insurancePlans: [insurance] });
    expect(orderFormInitialFromOrder({ ...order, priceBreakdown: quoteFor(2, 600) }, { vehicle }).insurancePlanId).toBe('ins1');
    expect(orderFormInitialFromOrder({ ...order, priceBreakdown: quoteFor(2, 999) }, { vehicle }).insurancePlanId).toBe('');
    // 車輛已沒有任何保險方案：維持預設（不加保），不擋送出
    expect(
      orderFormInitialFromOrder({ ...order, priceBreakdown: quoteFor(2, 999) }, { vehicle: makeVehicle() }).insurancePlanId,
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
    expect(final.pickupBranchId).not.toBe('mzg-airport'); // 快照存據點名稱，不是 id
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
    return orderFormProblems(value(), createOrderFormDerived(value, data), TEST_ORDER_FORM_LABELS);
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

    const conflicted = problemsOf(filledForm(), fakeData([makeVehicle()], [{ id: 'x' } as RentalOrder]));
    expect(conflicted.rental).toContain(t.orderForm.vehicleConflict);

    const rich = filledForm();
    rich.controls.pricing.controls.depositRequired.setValue(999_999);
    expect(problemsOf(rich).pricing[0]).toContain(t.orderForm.depositExceedsCap);
  });

  it('本次收款有任一列金額未填或不大於 0 時擋下（掛在費用與付款的 pricing 問題）', () => {
    const form = filledForm();
    addPaymentDraft(form, { method: 'cash', purpose: 'deposit', amount: null });
    expect(problemsOf(form).pricing).toContain(t.orderForm.problems.paymentDraftAmountInvalid);

    form.controls.payments.controls.drafts.at(0)?.controls.amount.setValue(500);
    expect(problemsOf(form).pricing).toEqual([]);
  });
});

describe('orderFormProblems：車輛與租期都沒填時，同一句提示只列一次', () => {
  it('空白表單的 rental 問題不重複', () => {
    const value = signal(createOrderForm().getRawValue());
    const p = orderFormProblems(value(), createOrderFormDerived(value, fakeData([makeVehicle()])), TEST_ORDER_FORM_LABELS);
    expect(p.rental.filter((m) => m === t.orderForm.problems.rentalBaseline)).toHaveLength(1);
  });
});

describe('orderRequirements（訂單摘要欄的「建立訂單需要」：與擋送出的檢查同一套）', () => {
  function requirementsOf(form: ReturnType<typeof createOrderForm>, data = fakeData([makeVehicle()])) {
    const value = signal(form.getRawValue());
    return orderRequirements(value(), createOrderFormDerived(value, data), TEST_ORDER_FORM_LABELS);
  }

  it('依車輛／租期／據點／承租人四項排列；空白表單四項都是「還沒填」', () => {
    const r = requirementsOf(createOrderForm());
    expect(r.map((x) => x.group)).toEqual(['vehicle', 'period', 'branches', 'renter']);
    expect(r.every((x) => !x.met && x.missing && x.issues.length === 0)).toBe(true);
  });

  it('底線齊全時四項都打勾', () => {
    expect(requirementsOf(filledForm()).every((x) => x.met && !x.missing)).toBe(true);
  });

  it('只缺承租人時只有承租人未完成', () => {
    const form = filledForm();
    form.controls.renter.patchValue({ phone: '' });
    const r = requirementsOf(form);
    expect(r.filter((x) => !x.met).map((x) => x.group)).toEqual(['renter']);
  });

  it('填了但不合格：還車早於取車→租期未完成並帶原因；時段衝突→車輛未完成並帶原因（不算「還沒填」）', () => {
    const form = filledForm();
    form.controls.rental.controls.endLocal.setValue('2026-01-04T09:00');
    const period = requirementsOf(form).find((x) => x.group === 'period');
    expect(period).toEqual({ group: 'period', met: false, missing: false, issues: [t.orderForm.problems.endBeforeStart] });

    const conflicted = requirementsOf(filledForm(), fakeData([makeVehicle()], [{ id: 'x' } as RentalOrder]));
    expect(conflicted.find((x) => x.group === 'vehicle')).toEqual({
      group: 'vehicle',
      met: false,
      missing: false,
      issues: [t.orderForm.vehicleConflict],
    });
  });

  it('打勾與擋送出一致：四項都打勾時，租期與車輛、承租人兩個步驟都沒有問題', () => {
    const form = filledForm();
    const value = signal(form.getRawValue());
    const derived = createOrderFormDerived(value, fakeData([makeVehicle()]));
    expect(orderRequirements(value(), derived, TEST_ORDER_FORM_LABELS).every((x) => x.met)).toBe(true);
    const problems = orderFormProblems(value(), derived, TEST_ORDER_FORM_LABELS);
    expect(problems.rental).toEqual([]);
    expect(problems.renter).toEqual([]);
  });

  it('費用類問題（訂金超過上限）會擋送出，但不屬於「建立訂單需要」的任何一項', () => {
    const form = filledForm();
    form.controls.pricing.controls.depositRequired.setValue(999_999);
    const value = signal(form.getRawValue());
    const derived = createOrderFormDerived(value, fakeData([makeVehicle()]));
    expect(orderFormProblems(value(), derived, TEST_ORDER_FORM_LABELS).pricing).toHaveLength(1);
    expect(orderRequirements(value(), derived, TEST_ORDER_FORM_LABELS).every((x) => x.met)).toBe(true);
  });
});

describe('orderRentalDays（與報價引擎同一個天數定義）', () => {
  it('取車日到還車日之間的日曆天數，只看日期不看時刻', () => {
    expect(orderRentalDays({ startLocal: '2026-01-05T09:00', endLocal: '2026-01-07T09:00' })).toBe(2);
    expect(orderRentalDays({ startLocal: '2026-01-05T18:00', endLocal: '2026-01-07T09:00' })).toBe(2);
    expect(orderRentalDays({ startLocal: '2026-01-31T09:00', endLocal: '2026-02-02T09:00' })).toBe(2);
  });

  it('與報價的 dailyLines 天數一致', () => {
    const form = filledForm();
    const quote = createOrderFormDerived(signal(form.getRawValue()), fakeData([makeVehicle()])).quote();
    expect(orderRentalDays(form.getRawValue().rental)).toBe(quote?.dailyLines.length);
  });

  it('租期未填完、或還車日早於取車日：undefined', () => {
    expect(orderRentalDays({ startLocal: '', endLocal: '2026-01-07T09:00' })).toBeUndefined();
    expect(orderRentalDays({ startLocal: '2026-01-07T09:00', endLocal: '2026-01-05T09:00' })).toBeUndefined();
  });
});

describe('paymentDraftBalance（本次收款 · 建立後待收）', () => {
  it('待收＝報價合計−本次收款；負數代表溢收；還沒填的金額視為 0', () => {
    expect(paymentDraftBalance([{ amount: 500 }, { amount: null }], 2000)).toEqual({ collected: 500, due: 1500 });
    expect(paymentDraftBalance([{ amount: 2500 }], 2000)).toEqual({ collected: 2500, due: -500 });
  });

  it('還沒有報價時待收算不出來（undefined），不假裝報價是 0', () => {
    expect(paymentDraftBalance([{ amount: 500 }], undefined)).toEqual({ collected: 500, due: undefined });
  });
});
