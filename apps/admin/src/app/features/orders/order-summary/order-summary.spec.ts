import { describe, expect, it } from 'vitest';
import { InsurancePlan, PriceBreakdown, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { createOrderForm, setPaymentDrafts } from '../order-form/order-form';
import { OrderRequirement } from '../order-form/order-form-derived';
import { buildOrderSummary } from './order-summary';

const t = ZH_TW;
const NOW = new Date('2026-09-23T12:00');

const standard: InsurancePlan = { id: 'standard', name: '安心保障', dailyPriceFrom: 400, tags: [], coverageItems: [] };

const vehicle: Vehicle = {
  id: 'v1',
  plateNumber: 'ABC-123',
  category: 'car',
  model: 'Altis',
  brand: 'Toyota',
  year: 2022,
  status: 'available',
  mileage: 100,
  createdAt: '2026-01-01T00:00:00.000Z',
  location: 'mzg-port',
  insurancePlans: [standard],
};

const quote = { rentalSubtotal: 2000, insuranceSubtotal: 800, addOnSubtotal: 150, total: 2950 } as PriceBreakdown;

const allMet: OrderRequirement[] = (['vehicle', 'period', 'branches', 'renter'] as const).map((group) => ({
  group,
  met: true,
  missing: false,
  issues: [],
}));

function filledValue(pickupLocation = 'mzg-port') {
  const form = createOrderForm({
    vehicleId: 'v1',
    startTime: new Date('2026-10-01T09:00').toISOString(),
    endTime: new Date('2026-10-03T09:00').toISOString(),
    pickupLocation,
    returnLocation: 'mzg-airport',
    insurancePlanId: 'standard',
    depositRequired: 885,
  });
  form.controls.renter.patchValue({ name: '王小明', phone: '0912345678' });
  return form;
}

describe('buildOrderSummary（訂單摘要欄的內容）', () => {
  it('空白表單：沒有車、時間與據點為 null、報價與待收為 null、承租人為空字串', () => {
    const summary = buildOrderSummary({
      value: createOrderForm().getRawValue(),
      vehicle: undefined,
      quote: undefined,
      requirements: [],
      incompleteItems: [],
      now: NOW,
    });
    expect(summary).toMatchObject({
      vehicle: null,
      pickupAt: null,
      returnAt: null,
      days: null,
      pickupBranch: null,
      returnBranch: null,
      dispatchRoute: null,
      renterName: '',
      renterPhone: '',
      insurance: t.bookingForm.insuranceNone,
      quote: null,
      depositRequired: 0,
      collected: 0,
      due: null,
    });
  });

  it('有車：車牌＋車款（廠牌 型號）、取還車時間（全站格式）、天數、據點名稱、保險方案名稱、報價明細', () => {
    const summary = buildOrderSummary({
      value: filledValue().getRawValue(),
      vehicle,
      quote,
      requirements: allMet,
      incompleteItems: [],
      now: NOW,
    });
    expect(summary).toMatchObject({
      vehicle: { plate: 'ABC-123', model: 'Toyota Altis' },
      pickupAt: '10/01 09:00',
      returnAt: '10/03 09:00',
      days: 2,
      pickupBranch: '馬公港櫃檯',
      returnBranch: '馬公機場櫃檯',
      renterName: '王小明',
      renterPhone: '0912345678',
      insurance: '安心保障',
      quote: { rental: 2000, insurance: 800, addOns: 150, total: 2950 },
      depositRequired: 885,
    });
  });

  it('取車據點與車輛所在據點相同：不需調度', () => {
    const summary = buildOrderSummary({
      value: filledValue('mzg-port').getRawValue(),
      vehicle,
      quote,
      requirements: allMet,
      incompleteItems: [],
      now: NOW,
    });
    expect(summary.dispatchRoute).toBeNull();
  });

  it('需調度：路線為「車輛所在據點 → 取車據點」', () => {
    const summary = buildOrderSummary({
      value: filledValue('mzg-airport').getRawValue(),
      vehicle,
      quote,
      requirements: allMet,
      incompleteItems: [],
      now: NOW,
    });
    expect(summary.dispatchRoute).toEqual({ from: '馬公港櫃檯', to: '馬公機場櫃檯' });
  });

  it('本次收款合計與建立後待收；超收時待收為負數（溢收）', () => {
    const form = filledValue();
    setPaymentDrafts(form, [
      { method: 'cash', purpose: 'deposit', amount: 885 },
      { method: 'cash', purpose: 'balance', amount: 1000 },
    ]);
    const base = { vehicle, quote, requirements: allMet, incompleteItems: [], now: NOW };
    expect(buildOrderSummary({ ...base, value: form.getRawValue() })).toMatchObject({ collected: 1885, due: 1065 });

    setPaymentDrafts(form, [{ method: 'cash', purpose: 'deposit', amount: 3000 }]);
    expect(buildOrderSummary({ ...base, value: form.getRawValue() })).toMatchObject({ collected: 3000, due: -50 });
  });

  it('「還缺」只列還沒填的項目；待補清單原樣帶入', () => {
    const requirements: OrderRequirement[] = [
      { group: 'vehicle', met: false, missing: false, issues: [t.bookingForm.vehicleConflict] },
      { group: 'period', met: true, missing: false, issues: [] },
      { group: 'branches', met: true, missing: false, issues: [] },
      { group: 'renter', met: false, missing: true, issues: [] },
    ];
    const summary = buildOrderSummary({
      value: filledValue().getRawValue(),
      vehicle,
      quote,
      requirements,
      incompleteItems: [t.bookingForm.incomplete.contractNotSigned],
      now: NOW,
    });
    expect(summary.missing).toEqual(['renter']);
    expect(summary.requirements).toBe(requirements);
    expect(summary.incompleteItems).toEqual([t.bookingForm.incomplete.contractNotSigned]);
  });

  it('選的保險方案不屬於這台車（例如換了車型）：顯示「未選」', () => {
    const form = filledValue();
    form.controls.pricing.controls.insurancePlanId.setValue('ins-scooter-basic');
    const summary = buildOrderSummary({
      value: form.getRawValue(),
      vehicle,
      quote,
      requirements: allMet,
      incompleteItems: [],
      now: NOW,
    });
    expect(summary.insurance).toBe(t.orderSummary.insuranceUnresolved);
  });
});
