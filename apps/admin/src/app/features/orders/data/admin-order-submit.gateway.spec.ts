import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { InsurancePlan, PaymentRecord, RentalOrder } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { ContractStore } from '../../../stores/contract/contract.store';
import { OrderStore } from '../../../stores/order/order.store';
import { DocumentStore } from '../../../stores/document/document.store';
import {
  ORDER_FORM_DATA,
  ORDER_SUBMIT_GATEWAY,
  NO_INSURANCE_VALUE,
  OrderForm,
  OrderFormInitial,
  addPaymentDraft,
  createOrderForm,
  orderFormInitialFromOrder,
  setPaymentDrafts,
  buildContractSnapshot,
  computeOrderQuote,
  selectedVehicleOf,
} from '@car-rental/order-form';
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
    pickupBranchId: 'mzg-airport',
    returnBranchId: 'mzg-airport',
    ...initial,
  });
  if (!initial.member) {
    form.controls.renter.patchValue({ name: '新客人', phone: '0900000000', email: 'guest@example.com' });
  }
  return form;
}

describe('AdminOrderSubmitGateway.create（搬自舊建單 dialog 的原子寫入序列）', () => {
  it('建立成功：新建會員、訂單（含報價快照與訂金）、款項、第 1 版合約草稿與還車提醒，回傳訂單 id', async () => {
    const { gateway, memberRepo, orderRepo, paymentRepo, contractRepo, reminderStatusRepo } = setup();
    const form = baselineForm();
    form.controls.pricing.controls.depositRequired.setValue(600);
    setPaymentDrafts(form, [{ purpose: 'deposit', method: 'cash', amount: 600 }]);

    const id = await gateway.create({ value: form.getRawValue() });

    const order = orderRepo.getAll()[0];
    expect(order.id).toBe(id);
    expect(order).toMatchObject({ vehicleId: 'v1', pickupBranchId: 'mzg-airport', depositRequired: 600, status: 'reserved' });
    expect(order.priceBreakdown?.total).toBe(2000);
    expect(memberRepo.getAll()).toHaveLength(1);
    expect(order.memberId).toBe(memberRepo.getAll()[0].id);
    expect(paymentRepo.getAll().map((p) => [p.bookingId, p.amount, p.status])).toEqual([[id, 600, 'confirmed']]);
    expect(contractRepo.getAll()).toHaveLength(1);
    expect(contractRepo.getAll()[0]).toMatchObject({ bookingId: id, version: 1, status: 'draft' });
    expect(reminderStatusRepo.getAll().length).toBeGreaterThan(0);
  });

  it('BUG 重現／修復：新增一列款項後直接改列上的金額欄位（不呼叫任何「新增」以外的提交動作），送出仍會寫入款項紀錄', async () => {
    const { gateway, paymentRepo } = setup();
    const form = baselineForm();
    // 對應畫面上按一次「＋ 新增一筆收款」：新增一列，此時金額欄位還是預設值。
    addPaymentDraft(form, { method: 'cash', purpose: 'deposit', amount: 0 });
    // 「列表就是紀錄」：直接改列上的金額欄位本身，不透過任何獨立於列表之外的輸入列或
    // 「新增」以外的提交動作——這正是舊版「打了金額沒按＋新增款項，這筆錢被默默丟掉」的情境。
    form.controls.payments.controls.drafts.at(0)?.controls.amount.setValue(500);

    const id = await gateway.create({ value: form.getRawValue() });

    expect(paymentRepo.getAll().map((p) => [p.bookingId, p.amount])).toEqual([[id, 500]]);
  });

  it('鎖定既有會員時沿用該會員、不新建', async () => {
    const member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' as const };
    const { gateway, memberRepo, orderRepo } = setup({ members: [member] });
    await gateway.create({ value: baselineForm({ member }).getRawValue() });
    expect(memberRepo.getAll()).toHaveLength(1);
    expect(orderRepo.getAll()[0].memberId).toBe('m1');
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
    const existing: RentalOrder = {
      id: 'existing',
      vehicleId: 'v1',
      memberId: 'mx',
      startTime: new Date('2026-01-06T00:00').toISOString(),
      endTime: new Date('2026-01-06T12:00').toISOString(),
      pickupBranchId: 'mzg-airport',
      returnBranchId: 'mzg-airport',
      status: 'reserved',
      depositRequired: 0,
    };
    const { gateway, orderRepo, memberRepo } = setup({ orders: [existing] });
    await expect(gateway.create({ value: baselineForm().getRawValue() })).rejects.toThrow('existing');
    expect(orderRepo.getAll()).toHaveLength(1);
    expect(memberRepo.getAll()).toHaveLength(0);
  });

  it('訂單寫入失敗：補償刪除本次新建的會員，並以錯誤拒絕', async () => {
    const { gateway, orderRepo, memberRepo } = setup();
    orderRepo.create = vi.fn(() => {
      throw new Error('模擬訂單寫入失敗');
    });
    await expect(gateway.create({ value: baselineForm().getRawValue() })).rejects.toThrow('模擬訂單寫入失敗');
    expect(memberRepo.getAll()).toHaveLength(0);
    expect(orderRepo.getAll()).toHaveLength(0);
  });

  it('第 2 筆款項寫入失敗：第 1 筆款項作廢（不刪除），訂單與新會員補償清除', async () => {
    const { gateway, orderRepo, memberRepo, paymentRepo, contractRepo } = setup();
    const originalCreate = paymentRepo.create;
    let calls = 0;
    paymentRepo.create = vi.fn((item: PaymentRecord) => {
      calls++;
      if (calls === 2) throw new Error('模擬第 2 筆款項寫入失敗');
      return originalCreate(item);
    });
    const form = baselineForm();
    setPaymentDrafts(form, [
      { purpose: 'deposit', method: 'cash', amount: 100 },
      { purpose: 'balance', method: 'cash', amount: 200 },
    ]);

    await expect(gateway.create({ value: form.getRawValue() })).rejects.toThrow('模擬第 2 筆款項寫入失敗');
    expect(paymentRepo.getAll().map((p) => p.status)).toEqual(['voided']);
    expect(orderRepo.getAll()).toHaveLength(0);
    expect(memberRepo.getAll()).toHaveLength(0);
    expect(contractRepo.getAll()).toHaveLength(0);
  });

  it('車型沒有可用定價方案時以「無法試算報價」拒絕', async () => {
    const { gateway, orderRepo } = setup({ vehicles: [makeVehicle({ category: 'ev' })] });
    await expect(gateway.create({ value: baselineForm().getRawValue() })).rejects.toThrow(
      ZH_TW.orderForm.quoteUnavailable,
    );
    expect(orderRepo.getAll()).toHaveLength(0);
  });
});

describe('AdminOrderSubmitGateway.update（沿用舊 dialog 編輯模式）', () => {
  const member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' as const };

  it('無異動不多產生合約版本；換車（核心條款異動）會讓舊版 superseded 並產生新草稿', async () => {
    const { gateway, contractStore, orderRepo } = setup({
      vehicles: [makeVehicle(), makeVehicle({ id: 'v2', plateNumber: 'XYZ-999' })],
      members: [member],
    });
    const id = await gateway.create({ value: baselineForm({ member }).getRawValue() });
    const order = orderRepo.getById(id);
    if (!order) throw new Error('order not created');

    const same = createOrderForm(orderFormInitialFromOrder(order, { member }));
    await gateway.update(id, { value: same.getRawValue() });
    expect(contractStore.versionsFor(id)).toHaveLength(1);

    same.controls.rental.controls.vehicleId.setValue('v2');
    await gateway.update(id, { value: same.getRawValue() });
    const versions = contractStore.versionsFor(id);
    expect(versions.map((v) => v.status)).toEqual(['superseded', 'draft']);
    expect(versions[1].snapshot.vehicle.vehicleId).toBe('v2');
    expect(orderRepo.getById(id)?.vehicleId).toBe('v2');
  });

  it('原報價含保險但保險方案尚未確認（反推失敗）：在任何寫入前拒絕', async () => {
    const plan: InsurancePlan = { id: 'ins1', name: '甲式', dailyPriceFrom: 300, tags: [], coverageItems: [] };
    const vehicle = makeVehicle({ insurancePlans: [plan] });
    const { gateway, orderRepo } = setup({ vehicles: [vehicle], members: [member] });
    const id = await gateway.create({ value: baselineForm({ member, insurancePlanId: 'ins1' }).getRawValue() });
    const order = orderRepo.getById(id);
    if (!order?.priceBreakdown) throw new Error('order not created');
    const tampered = { ...order, priceBreakdown: { ...order.priceBreakdown, insuranceSubtotal: 1 } };

    const form = createOrderForm(orderFormInitialFromOrder(tampered, { vehicle, member }));
    expect(form.getRawValue().pricing.insurancePlanId).toBe('');
    TestBed.inject(OrderStore).updateOrder(id, { priceBreakdown: tampered.priceBreakdown });

    await expect(gateway.update(id, { value: form.getRawValue() })).rejects.toThrow(ZH_TW.orderForm.insuranceUnreconciled);
  });

  // 以下三則搬自已刪除的舊建單 dialog spec（編輯模式的寫入行為），改以 gateway 驗證。
  it('只改與保險／加購無關的欄位（還車據點）：priceBreakdown 保留原本的保險與加購', async () => {
    const plan: InsurancePlan = { id: 'ins1', name: '甲式', dailyPriceFrom: 300, tags: [], coverageItems: [] };
    const addOn = { id: 'addon1', name: '兒童座椅', unitPrice: 100, unit: 'per_day' as const };
    const vehicle = makeVehicle({ insurancePlans: [plan] });
    const { gateway, orderRepo } = setup({ vehicles: [vehicle], members: [member], addOns: [addOn] });
    const id = await gateway.create({
      value: baselineForm({ member, insurancePlanId: 'ins1', addOnQty: { addon1: 2 } }).getRawValue(),
    });
    const original = orderRepo.getById(id);
    if (!original?.priceBreakdown) throw new Error('order not created');
    expect(original.priceBreakdown.insuranceSubtotal).toBeGreaterThan(0);
    expect(original.priceBreakdown.addOnSubtotal).toBeGreaterThan(0);

    const form = createOrderForm(orderFormInitialFromOrder(original, { vehicle, member }));
    form.controls.rental.controls.returnBranchId.setValue('mzg-port');
    await gateway.update(id, { value: form.getRawValue() });

    const updated = orderRepo.getById(id);
    expect(updated?.returnBranchId).toBe('mzg-port');
    expect(updated?.priceBreakdown?.insuranceSubtotal).toBe(original.priceBreakdown.insuranceSubtotal);
    expect(updated?.priceBreakdown?.addOnSubtotal).toBe(original.priceBreakdown.addOnSubtotal);
    expect(updated?.priceBreakdown?.total).toBe(original.priceBreakdown.total);
  });

  it('明確改選「不加保」：送出後保險小計歸零，不會被當成「還沒解決」擋下', async () => {
    const plan: InsurancePlan = { id: 'ins1', name: '甲式', dailyPriceFrom: 300, tags: [], coverageItems: [] };
    const vehicle = makeVehicle({ insurancePlans: [plan] });
    const { gateway, orderRepo } = setup({ vehicles: [vehicle], members: [member] });
    const id = await gateway.create({ value: baselineForm({ member, insurancePlanId: 'ins1' }).getRawValue() });
    const original = orderRepo.getById(id);
    if (!original) throw new Error('order not created');

    const form = createOrderForm(orderFormInitialFromOrder(original, { vehicle, member }));
    form.controls.pricing.controls.insurancePlanId.setValue(NO_INSURANCE_VALUE);
    await gateway.update(id, { value: form.getRawValue() });

    expect(orderRepo.getById(id)?.priceBreakdown?.insuranceSubtotal).toBe(0);
  });

  it('改還車時間：重新排程還車提醒，先取消舊排程，且不留下重複紀錄', async () => {
    const { gateway, orderRepo, reminderGateway, reminderStatusRepo } = setup({
      members: [{ ...member, email: 'a@b.com' }],
    });
    const memberWithEmail = { ...member, email: 'a@b.com' };
    const id = await gateway.create({ value: baselineForm({ member: memberWithEmail }).getRawValue() });
    expect(reminderStatusRepo.getAll()).toHaveLength(2);
    const cancel = vi.spyOn(reminderGateway, 'cancel');

    const order = orderRepo.getById(id);
    if (!order) throw new Error('order not created');
    const form = createOrderForm(orderFormInitialFromOrder(order, { member: memberWithEmail }));
    form.controls.rental.controls.endLocal.setValue('2026-01-09T09:00');
    await gateway.update(id, { value: form.getRawValue() });

    expect(cancel).toHaveBeenCalledTimes(2);
    expect(reminderStatusRepo.getAll()).toHaveLength(2);
  });
});

describe('AdminOrderSubmitGateway 證件紀錄（4.2：第 2 步的駕駛資格與證件號碼）', () => {
  it('新承租人：證件號碼→建立並確認身分證明文件；駕照→建立並確認駕駛資格（會員層、可跨訂單重用）', async () => {
    const { gateway, memberRepo, identityDocumentRepo, driverCredentialRepo } = setup();
    const form = baselineForm();
    form.controls.renter.patchValue({ idNumber: 'A123456789' });
    form.controls.driver.patchValue({
      licenseNumber: 'TL-9001',
      licenseExpiryDate: '2030-05-31',
      originalVehicleClassText: '普通小型車',
      standardizedVehicleClass: 'car',
    });

    await gateway.create({ value: form.getRawValue() });

    const memberId = memberRepo.getAll()[0].id;
    expect(identityDocumentRepo.getAll()).toEqual([
      expect.objectContaining({
        memberId,
        type: 'taiwan_id',
        documentNumber: 'A123456789',
        issuingCountry: 'TW',
        version: 1,
        verification: expect.objectContaining({ state: 'verified', verifiedBy: ZH_TW.layout.adminUser }),
      }),
    ]);
    expect(driverCredentialRepo.getAll()).toEqual([
      expect.objectContaining({
        memberId,
        type: 'taiwan_license',
        documentNumber: 'TL-9001',
        issuingCountry: 'TW',
        expiryDate: '2030-05-31',
        originalVehicleClassText: '普通小型車',
        standardizedVehicleClass: 'car',
        version: 1,
        verification: expect.objectContaining({ state: 'verified' }),
      }),
    ]);
  });

  it('駕駛資格留空：不建立任何駕駛資格紀錄（之後在會員資料補，列入待補）', async () => {
    const { gateway, identityDocumentRepo, driverCredentialRepo } = setup();
    await gateway.create({ value: baselineForm().getRawValue() });
    expect(identityDocumentRepo.getAll()).toHaveLength(0);
    expect(driverCredentialRepo.getAll()).toHaveLength(0);
  });

  it('外國旅客：駕照走外國駕照、建立後立即查核互惠資格（同會員視窗）', async () => {
    const { gateway, driverCredentialRepo, identityDocumentRepo, eligibilityGateway } = setup();
    eligibilityGateway.setFixture('JP', 'foreign_license', { reciprocityStatus: 'eligible', legalUseThroughDate: '2026-12-31' });
    const form = baselineForm();
    form.controls.renter.patchValue({ kind: 'foreign_visitor', nationality: 'JP', idNumber: 'TR1234567' });
    form.controls.driver.patchValue({ licenseNumber: 'JP-1', standardizedVehicleClass: 'car' });

    await gateway.create({ value: form.getRawValue() });

    expect(identityDocumentRepo.getAll()[0]).toMatchObject({ type: 'passport', issuingCountry: 'JP' });
    expect(driverCredentialRepo.getAll()[0]).toMatchObject({
      type: 'foreign_license',
      issuingCountry: 'JP',
      reciprocityStatus: 'eligible',
      legalUseThroughDate: '2026-12-31',
    });
  });

  it('既有會員：駕照沒改就沿用既有紀錄（不重複建立）；改了才追加新版本（version 遞增、指回前一版）', async () => {
    const member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' as const };
    const existing = {
      id: 'dc-old',
      memberId: 'm1',
      type: 'taiwan_license' as const,
      documentNumber: 'TL-1',
      issuingCountry: 'TW',
      originalVehicleClassText: '普通小型車',
      standardizedVehicleClass: 'car' as const,
      verification: { state: 'ocr_extracted' as const },
      reciprocityStatus: 'pending' as const,
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const { gateway, driverCredentialRepo, identityDocumentRepo } = setup({
      vehicles: [makeVehicle(), makeVehicle({ id: 'v2', plateNumber: 'XYZ-999' })],
      members: [member],
      driverCredentials: [existing],
    });

    const unchanged = baselineForm({ member });
    unchanged.controls.driver.patchValue({
      licenseNumber: 'TL-1',
      originalVehicleClassText: '普通小型車',
      standardizedVehicleClass: 'car',
    });
    await gateway.create({ value: unchanged.getRawValue() });
    expect(driverCredentialRepo.getAll()).toEqual([existing]);
    // 既有會員的證件號碼欄位是鎖定的（沒有人重新核對），不建立身分證明文件。
    expect(identityDocumentRepo.getAll()).toHaveLength(0);

    const changed = baselineForm({ member, vehicleId: 'v2' });
    changed.controls.driver.patchValue({ licenseNumber: 'TL-2', standardizedVehicleClass: 'car' });
    await gateway.create({ value: changed.getRawValue() });
    const [, renewed] = driverCredentialRepo.getAll();
    expect(renewed).toMatchObject({ documentNumber: 'TL-2', version: 2, supersededId: 'dc-old' });
    expect(renewed.verification.state).toBe('verified');
  });

  it('填了駕照號碼卻沒有車種：整筆拒絕（不默默丟掉已填的駕照，也不存一筆沒有車種的紀錄）', async () => {
    const { gateway, orderRepo, driverCredentialRepo } = setup();
    const form = baselineForm();
    form.controls.driver.patchValue({ licenseNumber: 'TL-9001' });
    await expect(gateway.create({ value: form.getRawValue() })).rejects.toThrow(
      ZH_TW.orderForm.problems.driverClassRequired,
    );
    expect(orderRepo.getAll()).toHaveLength(0);
    expect(driverCredentialRepo.getAll()).toHaveLength(0);
  });

  it('證件寫到一半失敗：這次新建的證件、訂單與會員都補償清除', async () => {
    const { gateway, orderRepo, memberRepo, identityDocumentRepo, driverCredentialRepo } = setup();
    vi.spyOn(TestBed.inject(DocumentStore), 'confirmDriverCredential').mockImplementation(() => {
      throw new Error('模擬駕駛資格確認失敗');
    });
    const form = baselineForm();
    form.controls.renter.patchValue({ idNumber: 'A123456789' });
    form.controls.driver.patchValue({ licenseNumber: 'TL-9001', standardizedVehicleClass: 'car' });

    await expect(gateway.create({ value: form.getRawValue() })).rejects.toThrow('模擬駕駛資格確認失敗');
    expect(identityDocumentRepo.getAll()).toHaveLength(0);
    expect(driverCredentialRepo.getAll()).toHaveLength(0);
    expect(orderRepo.getAll()).toHaveLength(0);
    expect(memberRepo.getAll()).toHaveLength(0);
  });
});
