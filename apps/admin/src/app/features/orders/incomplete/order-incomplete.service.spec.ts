import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DriverCredential, IdentityDocument, Member } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { BookingStore } from '../../../stores/booking/booking.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { ORDER_SUBMIT_GATEWAY, OrderPresignature } from '../order-form/order-submit-gateway';
import { OrderForm, OrderFormInitial, computeOrderQuote, createOrderForm, selectedVehicleOf, setPaymentDrafts } from '../order-form/order-form';
import { buildContractSnapshot } from '../order-form/contract-snapshot';
import { provideAdminOrderForm } from '../data/provide-admin-order-form';
import { OrderRepoOptions, createOrderRepos } from '../testing';
import { incompleteFactsFromForm, orderIncompleteItems } from './order-incomplete';
import { OrderIncompleteService } from './order-incomplete.service';

const t = ZH_TW;

function setup(options: OrderRepoOptions = {}) {
  const repos = createOrderRepos(options);
  TestBed.configureTestingModule({ providers: [...repos.providers, ...provideAdminOrderForm()] });
  return {
    ...repos,
    gateway: TestBed.inject(ORDER_SUBMIT_GATEWAY),
    data: TestBed.inject(ORDER_FORM_DATA),
    service: TestBed.inject(OrderIncompleteService),
    bookingStore: TestBed.inject(BookingStore),
  };
}

/** 報價 2000（1000/日 × 2 天）、應收訂金 600 的一張表單。 */
function form(initial: OrderFormInitial = {}): OrderForm {
  const f = createOrderForm({
    vehicleId: 'v1',
    startTime: new Date('2026-01-05T09:00').toISOString(),
    endTime: new Date('2026-01-07T09:00').toISOString(),
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
    depositRequired: 600,
    ...initial,
  });
  if (!initial.member) f.controls.renter.patchValue({ name: '新客人', phone: '0900000000' });
  return f;
}

/**
 * 同一張表單：建立訂單頁摘要欄列出的「建立後待補」，與送出後訂單詳情／列表列出的待補，必須一樣。
 * 建單端照建立訂單頁的算法（incompleteFactsFromForm＋既有會員的證件紀錄），詳情端用真的送出實作寫入後讀回。
 */
async function compare(
  ctx: ReturnType<typeof setup>,
  f: OrderForm,
  options: { presign?: boolean } = {},
): Promise<{ beforeCreate: string[]; afterCreate: string[] }> {
  const value = f.getRawValue();
  const memberId = value.renter.memberId;
  let presignature: OrderPresignature | undefined;
  if (options.presign) {
    const vehicle = selectedVehicleOf(value, ctx.data);
    const quote = computeOrderQuote(value, ctx.data);
    if (!vehicle || !quote) throw new Error('fixture: quote unavailable');
    presignature = { assetId: 'asset-1', snapshot: buildContractSnapshot(vehicle, quote, '', value) };
  }
  const beforeCreate = orderIncompleteItems(
    incompleteFactsFromForm({
      value,
      quoteTotal: computeOrderQuote(value, ctx.data)?.total,
      contract: options.presign ? 'signed' : 'unsigned',
      ...(memberId
        ? {
            memberRecords: {
              identityDocuments: ctx.data.identityDocumentsOf(memberId),
              driverCredentials: ctx.data.driverCredentialsOf(memberId),
            },
          }
        : {}),
    }),
  ).map((i) => i.label);

  const id = await ctx.gateway.create({ value, ...(presignature ? { presignature } : {}) });
  const booking = ctx.bookingStore.bookings().find((b) => b.id === id);
  if (!booking) throw new Error('booking not created');
  const afterCreate = ctx.service.itemsFor(booking).map((i) => i.label);
  return { beforeCreate, afterCreate };
}

describe('待補：建立訂單摘要欄與訂單詳情用同一套規則（同樣情況給同樣項目）', () => {
  it('只填了訂單底線的新承租人：兩邊都列出六項', async () => {
    const ctx = setup();
    const { beforeCreate, afterCreate } = await compare(ctx, form());
    expect(beforeCreate).toEqual([
      t.bookingForm.incomplete.missingEmail,
      t.bookingForm.incomplete.depositNotCollected,
      t.bookingForm.incomplete.contractNotSigned,
      t.bookingForm.incomplete.identityNotVerified,
      t.bookingForm.incomplete.driverNotVerified,
      t.bookingForm.incomplete.balanceNotCollected,
    ]);
    expect(afterCreate).toEqual(beforeCreate);
  });

  it('全部補齊（Email、證件、駕照、收足、預簽合約）：兩邊都沒有待補', async () => {
    const ctx = setup();
    const f = form();
    f.controls.renter.patchValue({ email: 'guest@example.com', idNumber: 'A123456789' });
    f.controls.driver.patchValue({ licenseNumber: 'TL-1', standardizedVehicleClass: 'car' });
    setPaymentDrafts(f, [
      { purpose: 'deposit', method: 'cash', amount: 600 },
      { purpose: 'balance', method: 'cash', amount: 1400 },
    ]);
    const { beforeCreate, afterCreate } = await compare(ctx, f, { presign: true });
    expect(beforeCreate).toEqual([]);
    expect(afterCreate).toEqual([]);
    expect(TestBed.inject(ContractStore).versionsFor(ctx.bookingStore.bookings()[0].id)[0].status).toBe('signed');
  });

  it('既有會員：證件看他已有的紀錄，駕照沒改就沿用那筆（OCR 辨識完但沒人核對＝未查核）', async () => {
    const member: Member = { id: 'm1', name: '王小明', phone: '0912', kind: 'local', email: 'w@x.y' };
    const identity: IdentityDocument = {
      id: 'id1', memberId: 'm1', type: 'taiwan_id', documentNumber: 'A1', issuingCountry: 'TW',
      verification: { state: 'verified' }, version: 1, createdAt: '', updatedAt: '',
    };
    const credential: DriverCredential = {
      id: 'dc1', memberId: 'm1', type: 'taiwan_license', documentNumber: 'TL-1', issuingCountry: 'TW',
      originalVehicleClassText: '普通小型車', standardizedVehicleClass: 'car',
      verification: { state: 'ocr_extracted', ocrConfidence: 0.5 }, reciprocityStatus: 'pending',
      version: 1, createdAt: '', updatedAt: '',
    };
    const ctx = setup({ members: [member], identityDocuments: [identity], driverCredentials: [credential] });
    const f = form({ member });
    f.controls.driver.patchValue({ licenseNumber: 'TL-1', originalVehicleClassText: '普通小型車', standardizedVehicleClass: 'car' });
    setPaymentDrafts(f, [{ purpose: 'deposit', method: 'cash', amount: 2000 }]);

    const { beforeCreate, afterCreate } = await compare(ctx, f, { presign: true });
    expect(beforeCreate).toEqual([t.bookingForm.incomplete.driverNotVerified]);
    expect(afterCreate).toEqual(beforeCreate);
  });

  it('外國旅客：互惠資格還沒查核為「符合」＝駕駛資格未查核；查核符合後兩邊都不列', async () => {
    const pending = setup();
    const f = form();
    f.controls.renter.patchValue({ kind: 'foreign_visitor', nationality: 'JP', email: 'j@p.jp', idNumber: 'TR1' });
    f.controls.driver.patchValue({ licenseNumber: 'JP-1', standardizedVehicleClass: 'car' });
    setPaymentDrafts(f, [{ purpose: 'deposit', method: 'cash', amount: 2000 }]);
    // 開發期 mock 沒有互惠規則時一律「需人工審查」：摘要欄（這一步沒按查核）與建立後（自動查核）都列。
    const first = await compare(pending, f, { presign: true });
    expect(first.beforeCreate).toEqual([t.bookingForm.incomplete.driverNotVerified]);
    expect(first.afterCreate).toEqual(first.beforeCreate);

    TestBed.resetTestingModule();
    const eligible = setup();
    eligible.eligibilityGateway.setFixture('JP', 'foreign_license', { reciprocityStatus: 'eligible' });
    f.controls.driver.controls.reciprocityStatus.setValue('eligible');
    const second = await compare(eligible, f, { presign: true });
    expect(second.beforeCreate).toEqual([]);
    expect(second.afterCreate).toEqual([]);
  });
});

describe('OrderIncompleteService', () => {
  it('已取消、已完成的訂單沒有待補', async () => {
    const ctx = setup();
    const id = await ctx.gateway.create({ value: form().getRawValue() });
    expect(ctx.service.itemsFor(ctx.bookingStore.bookings()[0]).length).toBeGreaterThan(0);

    ctx.bookingStore.cancel(id);
    expect(ctx.service.itemsFor(ctx.bookingStore.bookings()[0])).toEqual([]);
    const completed = { ...ctx.bookingStore.bookings()[0], status: 'completed' as const };
    expect(ctx.service.itemsFor(completed)).toEqual([]);
  });
});
