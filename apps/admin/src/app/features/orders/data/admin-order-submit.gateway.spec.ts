import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { InsurancePlan, PaymentRecord, RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { ContractStore } from '../../../stores/contract/contract.store';
import { BookingStore } from '../../../stores/booking/booking.store';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { ORDER_SUBMIT_GATEWAY } from '../order-form/order-submit-gateway';
import { OrderForm, OrderFormInitial, createOrderForm, orderFormInitialFromBooking } from '../order-form/order-form';
import { buildContractSnapshot } from '../order-form/contract-snapshot';
import { computeOrderQuote, selectedVehicleOf } from '../order-form/order-form';
import { provideAdminOrderForm } from './provide-admin-order-form';
import { OrderRepoOptions, createOrderRepos, makeVehicle } from '../testing';

function setup(options: OrderRepoOptions = {}) {
  const repos = createOrderRepos(options);
  TestBed.configureTestingModule({ providers: [...repos.providers, ...provideAdminOrderForm()] });
  return {
    ...repos,
    gateway: TestBed.inject(ORDER_SUBMIT_GATEWAY),
    data: TestBed.inject(ORDER_FORM_DATA),
    contractStore: TestBed.inject(ContractStore),
  };
}

function baselineForm(initial: OrderFormInitial = {}): OrderForm {
  const form = createOrderForm({
    vehicleId: 'v1',
    startTime: new Date('2026-01-05T09:00').toISOString(),
    endTime: new Date('2026-01-07T09:00').toISOString(),
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
    ...initial,
  });
  if (!initial.member) {
    form.controls.renter.patchValue({ name: '新客人', phone: '0900000000', email: 'guest@example.com' });
  }
  return form;
}

describe('AdminOrderSubmitGateway.create（搬自舊建單 dialog 的原子寫入序列）', () => {
  it('建立成功：新建會員、訂單（含報價快照與訂金）、款項、第 1 版合約草稿與還車提醒，回傳訂單 id', async () => {
    const { gateway, memberRepo, bookingRepo, paymentRepo, contractRepo, reminderStatusRepo } = setup();
    const form = baselineForm();
    form.controls.pricing.controls.depositRequired.setValue(600);
    form.controls.payments.controls.drafts.setValue([{ purpose: 'deposit', method: 'cash', amount: 600 }]);

    const id = await gateway.create({ value: form.getRawValue() });

    const booking = bookingRepo.getAll()[0];
    expect(booking.id).toBe(id);
    expect(booking).toMatchObject({ vehicleId: 'v1', pickupLocation: 'mzg-airport', depositRequired: 600, status: 'reserved' });
    expect(booking.priceBreakdown?.total).toBe(2000);
    expect(memberRepo.getAll()).toHaveLength(1);
    expect(booking.memberId).toBe(memberRepo.getAll()[0].id);
    expect(paymentRepo.getAll().map((p) => [p.bookingId, p.amount, p.status])).toEqual([[id, 600, 'confirmed']]);
    expect(contractRepo.getAll()).toHaveLength(1);
    expect(contractRepo.getAll()[0]).toMatchObject({ bookingId: id, version: 1, status: 'draft' });
    expect(reminderStatusRepo.getAll().length).toBeGreaterThan(0);
  });

  it('鎖定既有會員時沿用該會員、不新建', async () => {
    const member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' as const };
    const { gateway, memberRepo, bookingRepo } = setup({ members: [member] });
    await gateway.create({ value: baselineForm({ member }).getRawValue() });
    expect(memberRepo.getAll()).toHaveLength(1);
    expect(bookingRepo.getAll()[0].memberId).toBe('m1');
  });

  it('預先簽署且條款一致：以該簽名資產簽署新合約版本；條款不一致則維持草稿、不套用舊簽名', async () => {
    const { gateway, data, contractStore } = setup({
      vehicles: [makeVehicle(), makeVehicle({ id: 'v2', plateNumber: 'XYZ-999' })],
    });
    const form = baselineForm();
    const value = form.getRawValue();
    const vehicle = selectedVehicleOf(value, data);
    const quote = computeOrderQuote(value, data);
    if (!vehicle || !quote) throw new Error('fixture: quote unavailable');
    const preview = buildContractSnapshot(vehicle, quote, '', value);

    const signedId = await gateway.create({ value, presignature: { assetId: 'asset-1', snapshot: preview } });
    expect(contractStore.latestFor(signedId)).toMatchObject({ status: 'signed', signatureAssetIds: ['asset-1'] });

    // 簽完後又改了還車時間（另一台車避免時段衝突）：舊簽名不得套用
    const changed = baselineForm({ vehicleId: 'v2' });
    changed.controls.rental.controls.endLocal.setValue('2026-01-08T09:00');
    const unsignedId = await gateway.create({
      value: changed.getRawValue(),
      presignature: { assetId: 'asset-1', snapshot: preview },
    });
    expect(contractStore.latestFor(unsignedId)?.status).toBe('draft');
    expect(contractStore.latestFor(unsignedId)?.signatureAssetIds).toBeUndefined();
  });

  it('時段衝突：拒絕並不寫入任何資料', async () => {
    const existing: RentalBooking = {
      id: 'existing',
      vehicleId: 'v1',
      memberId: 'mx',
      startTime: new Date('2026-01-06T00:00').toISOString(),
      endTime: new Date('2026-01-06T12:00').toISOString(),
      pickupLocation: 'mzg-airport',
      returnLocation: 'mzg-airport',
      status: 'reserved',
      depositRequired: 0,
    };
    const { gateway, bookingRepo, memberRepo } = setup({ bookings: [existing] });
    await expect(gateway.create({ value: baselineForm().getRawValue() })).rejects.toThrow('existing');
    expect(bookingRepo.getAll()).toHaveLength(1);
    expect(memberRepo.getAll()).toHaveLength(0);
  });

  it('訂單寫入失敗：補償刪除本次新建的會員，並以錯誤拒絕', async () => {
    const { gateway, bookingRepo, memberRepo } = setup();
    bookingRepo.create = vi.fn(() => {
      throw new Error('模擬訂單寫入失敗');
    });
    await expect(gateway.create({ value: baselineForm().getRawValue() })).rejects.toThrow('模擬訂單寫入失敗');
    expect(memberRepo.getAll()).toHaveLength(0);
    expect(bookingRepo.getAll()).toHaveLength(0);
  });

  it('第 2 筆款項寫入失敗：第 1 筆款項作廢（不刪除），訂單與新會員補償清除', async () => {
    const { gateway, bookingRepo, memberRepo, paymentRepo, contractRepo } = setup();
    const originalCreate = paymentRepo.create;
    let calls = 0;
    paymentRepo.create = vi.fn((item: PaymentRecord) => {
      calls++;
      if (calls === 2) throw new Error('模擬第 2 筆款項寫入失敗');
      return originalCreate(item);
    });
    const form = baselineForm();
    form.controls.payments.controls.drafts.setValue([
      { purpose: 'deposit', method: 'cash', amount: 100 },
      { purpose: 'balance', method: 'cash', amount: 200 },
    ]);

    await expect(gateway.create({ value: form.getRawValue() })).rejects.toThrow('模擬第 2 筆款項寫入失敗');
    expect(paymentRepo.getAll().map((p) => p.status)).toEqual(['voided']);
    expect(bookingRepo.getAll()).toHaveLength(0);
    expect(memberRepo.getAll()).toHaveLength(0);
    expect(contractRepo.getAll()).toHaveLength(0);
  });

  it('車型沒有可用定價方案時以「無法試算報價」拒絕', async () => {
    const { gateway, bookingRepo } = setup({ vehicles: [makeVehicle({ category: 'ev' })] });
    await expect(gateway.create({ value: baselineForm().getRawValue() })).rejects.toThrow(
      ZH_TW.bookingForm.quoteUnavailable,
    );
    expect(bookingRepo.getAll()).toHaveLength(0);
  });
});

describe('AdminOrderSubmitGateway.update（沿用舊 dialog 編輯模式）', () => {
  const member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' as const };

  it('無異動不多產生合約版本；換車（核心條款異動）會讓舊版 superseded 並產生新草稿', async () => {
    const { gateway, contractStore, bookingRepo } = setup({
      vehicles: [makeVehicle(), makeVehicle({ id: 'v2', plateNumber: 'XYZ-999' })],
      members: [member],
    });
    const id = await gateway.create({ value: baselineForm({ member }).getRawValue() });
    const booking = bookingRepo.getById(id);
    if (!booking) throw new Error('booking not created');

    const same = createOrderForm(orderFormInitialFromBooking(booking, { member }));
    await gateway.update(id, { value: same.getRawValue() });
    expect(contractStore.versionsFor(id)).toHaveLength(1);

    same.controls.rental.controls.vehicleId.setValue('v2');
    await gateway.update(id, { value: same.getRawValue() });
    const versions = contractStore.versionsFor(id);
    expect(versions.map((v) => v.status)).toEqual(['superseded', 'draft']);
    expect(versions[1].snapshot.vehicle.vehicleId).toBe('v2');
    expect(bookingRepo.getById(id)?.vehicleId).toBe('v2');
  });

  it('原報價含保險但保險方案尚未確認（反推失敗）：在任何寫入前拒絕', async () => {
    const plan: InsurancePlan = { id: 'ins1', name: '甲式', dailyPriceFrom: 300, tags: [], coverageItems: [] };
    const vehicle = makeVehicle({ insurancePlans: [plan] });
    const { gateway, bookingRepo } = setup({ vehicles: [vehicle], members: [member] });
    const id = await gateway.create({ value: baselineForm({ member, insurancePlanId: 'ins1' }).getRawValue() });
    const booking = bookingRepo.getById(id);
    if (!booking?.priceBreakdown) throw new Error('booking not created');
    const tampered = { ...booking, priceBreakdown: { ...booking.priceBreakdown, insuranceSubtotal: 1 } };

    const form = createOrderForm(orderFormInitialFromBooking(tampered, { vehicle, member }));
    expect(form.getRawValue().pricing.insurancePlanId).toBe('');
    TestBed.inject(BookingStore).updateBooking(id, { priceBreakdown: tampered.priceBreakdown });

    await expect(gateway.update(id, { value: form.getRawValue() })).rejects.toThrow(ZH_TW.bookingForm.insuranceUnreconciled);
  });
});
