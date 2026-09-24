import { describe, expect, it } from 'vitest';
import {
  ContractVersion,
  DriverCredential,
  IdentityDocument,
  PaymentRecord,
  PriceBreakdown,
  RentalOrder,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import {
  createOrderForm,
  setPaymentDrafts,
} from '@car-rental/order-form';
import {
  OrderIncompleteFacts,
  driverCheckOf,
  identityCheckOf,
  incompleteFactsFromForm,
  incompleteFactsFromOrder,
  orderIncompleteItems,
  orderIncompleteKinds,
  requiredIdentityDocumentType,
} from './order-incomplete';

const t = ZH_TW;

/** 什麼都齊了的一筆：各測項只改要觸發的那一個事實。 */
function completeFacts(partial: Partial<OrderIncompleteFacts> = {}): OrderIncompleteFacts {
  return {
    renterEmail: 'a@b.c',
    depositRequired: 600,
    depositCollected: 600,
    amountDue: 2000,
    collected: 2000,
    contract: 'signed',
    identity: 'verified',
    driver: 'verified',
    ...partial,
  };
}

function identityDoc(partial: Partial<IdentityDocument> = {}): IdentityDocument {
  return {
    id: 'id1',
    memberId: 'm1',
    type: 'taiwan_id',
    documentNumber: 'A123456789',
    issuingCountry: 'TW',
    verification: { state: 'verified' },
    version: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function credential(partial: Partial<DriverCredential> = {}): DriverCredential {
  return {
    id: 'dc1',
    memberId: 'm1',
    type: 'taiwan_license',
    documentNumber: 'TL-1',
    issuingCountry: 'TW',
    originalVehicleClassText: '普通小型車',
    standardizedVehicleClass: 'car',
    verification: { state: 'verified' },
    reciprocityStatus: 'pending',
    version: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('orderIncompleteKinds（待補規則本身）', () => {
  it('什麼都齊了：沒有待補', () => {
    expect(orderIncompleteKinds(completeFacts())).toEqual([]);
  });

  it('每一項各自觸發，依畫面順序排列', () => {
    expect(
      orderIncompleteKinds({
        renterEmail: '  ',
        depositRequired: 600,
        depositCollected: 0,
        amountDue: 2000,
        collected: 0,
        contract: 'unsigned',
        identity: 'missing',
        driver: 'unverified',
      }),
    ).toEqual([
      'missingEmail',
      'depositNotCollected',
      'contractNotSigned',
      'identityNotVerified',
      'driverNotVerified',
      'balanceNotCollected',
    ]);
  });

  it('合約：還沒有任何版本也算未簽署；需重新簽署以專屬文字提示', () => {
    expect(orderIncompleteKinds(completeFacts({ contract: 'none' }))).toEqual(['contractNotSigned']);
    expect(orderIncompleteKinds(completeFacts({ contract: 'needs_resign' }))).toEqual(['contractNeedsResign']);
    expect(orderIncompleteItems(completeFacts({ contract: 'needs_resign' }))[0].label).toBe(
      t.orderForm.incomplete.contractNeedsResign,
    );
  });

  it('訂金：應收訂金為 0 時不列；收不足才列', () => {
    expect(orderIncompleteKinds(completeFacts({ depositRequired: 0, depositCollected: 0 }))).toEqual([]);
    expect(orderIncompleteKinds(completeFacts({ depositCollected: 599 }))).toEqual(['depositNotCollected']);
  });

  it('租金：沒有報價（應收算不出來）時不判斷，不假裝應收是 0', () => {
    expect(orderIncompleteKinds(completeFacts({ amountDue: undefined, collected: 0 }))).toEqual([]);
    expect(orderIncompleteKinds(completeFacts({ collected: 1999 }))).toEqual(['balanceNotCollected']);
  });

  it('每一項帶著文字與處理的地方：款項／合約分頁，或承租人的會員資料', () => {
    const items = orderIncompleteItems(
      completeFacts({ renterEmail: '', depositCollected: 0, contract: 'unsigned', identity: 'missing', driver: 'missing', collected: 0 }),
    );
    expect(items.map((i) => [i.label, i.target])).toEqual([
      [t.orderForm.incomplete.missingEmail, 'renter'],
      [t.orderForm.incomplete.depositNotCollected, 'payments'],
      [t.orderForm.incomplete.contractNotSigned, 'contract'],
      [t.orderForm.incomplete.identityNotVerified, 'renter'],
      [t.orderForm.incomplete.driverNotVerified, 'renter'],
      [t.orderForm.incomplete.balanceNotCollected, 'payments'],
    ]);
  });
});

describe('證件與駕駛資格的查核狀態', () => {
  it('身分證明文件依承租人類型要求不同種類：本國人身分證、外國旅客護照、持居留證者居留證', () => {
    expect(requiredIdentityDocumentType('local')).toBe('taiwan_id');
    expect(requiredIdentityDocumentType('foreign_visitor')).toBe('passport');
    expect(requiredIdentityDocumentType('resident')).toBe('resident_permit');
    // 外國旅客只有台灣身分證紀錄＝要求的護照不存在
    expect(identityCheckOf([identityDoc()], 'foreign_visitor')).toBe('missing');
  });

  it('同種文件取版本號最大的一筆判斷是否已核對', () => {
    const docs = [
      identityDoc({ id: 'v1', version: 1, verification: { state: 'verified' } }),
      identityDoc({ id: 'v2', version: 2, verification: { state: 'ocr_extracted' } }),
    ];
    expect(identityCheckOf(docs, 'local')).toBe('unverified');
    expect(identityCheckOf([], 'local')).toBe('missing');
  });

  it('駕駛資格：沒有紀錄＝缺；未核對＝未查核；外國旅客另外要互惠資格「符合」', () => {
    expect(driverCheckOf(undefined, 'local')).toBe('missing');
    expect(driverCheckOf(credential({ verification: { state: 'ocr_extracted' } }), 'local')).toBe('unverified');
    expect(driverCheckOf(credential(), 'local')).toBe('verified');
    expect(driverCheckOf(credential({ reciprocityStatus: 'manual_review' }), 'foreign_visitor')).toBe('unverified');
    expect(driverCheckOf(credential({ reciprocityStatus: 'eligible' }), 'foreign_visitor')).toBe('verified');
    // 持居留證者不查互惠資格（取車判斷同樣只對外國旅客查）
    expect(driverCheckOf(credential({ reciprocityStatus: 'pending' }), 'resident')).toBe('verified');
  });
});

describe('incompleteFactsFromOrder（已成立訂單的實際紀錄）', () => {
  const quote = { total: 2000 } as PriceBreakdown;
  const order: RentalOrder = {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: '2026-01-05T01:00:00.000Z',
    endTime: '2026-01-07T01:00:00.000Z',
    pickupBranchId: 'mzg-airport',
    returnBranchId: 'mzg-airport',
    status: 'reserved',
    depositRequired: 600,
    priceBreakdown: quote,
  };
  const payment = (partial: Partial<PaymentRecord>): PaymentRecord => ({
    id: 'p',
    bookingId: 'b1',
    amount: 100,
    method: 'cash',
    purpose: 'deposit',
    status: 'confirmed',
    receivedAt: '2026-01-01T00:00:00.000Z',
    handledBy: 'staff',
    ...partial,
  });

  it('已收訂金只算已確認的訂金款項；應收＝款項分頁的最新應付總額；已收＝淨實收', () => {
    const facts = incompleteFactsFromOrder({
      order,
      member: { id: 'm1', name: '王小明', phone: '0900', kind: 'local' },
      payments: [
        payment({ id: 'p1', amount: 400 }),
        payment({ id: 'p2', amount: 500, status: 'voided' }),
        payment({ id: 'p3', amount: 300, purpose: 'balance' }),
      ],
      paymentSummary: { requiredTotal: 2200, netPaid: 700 },
      contractVersions: [],
      identityDocuments: [],
      driverCredentials: [],
    });
    expect(facts).toMatchObject({
      renterEmail: '',
      depositCollected: 400,
      amountDue: 2200,
      collected: 700,
      contract: 'none',
      identity: 'missing',
      driver: 'missing',
    });
  });

  it('沒有報價快照的舊訂單（種子 b9）：應收算不出來，不列「租金尚未收足」', () => {
    const facts = incompleteFactsFromOrder({
      order: { ...order, priceBreakdown: undefined, depositRequired: 0 },
      member: { id: 'm1', name: '林美惠', phone: '0900', kind: 'local', email: 'l@m.h' },
      payments: [payment({ amount: 700, purpose: 'balance' })],
      paymentSummary: { requiredTotal: 0, netPaid: 700 },
      contractVersions: [{ status: 'signed', version: 1 } as ContractVersion],
      identityDocuments: [identityDoc()],
      driverCredentials: [credential()],
    });
    expect(facts.amountDue).toBeUndefined();
    expect(orderIncompleteKinds(facts)).toEqual([]);
  });
});

describe('incompleteFactsFromForm（建立訂單的表單值）', () => {
  function form() {
    const f = createOrderForm({
      vehicleId: 'v1',
      startTime: new Date('2026-01-05T09:00').toISOString(),
      endTime: new Date('2026-01-07T09:00').toISOString(),
      pickupBranchId: 'mzg-airport',
      returnBranchId: 'mzg-airport',
      depositRequired: 600,
    });
    f.controls.renter.patchValue({ name: '新客人', phone: '0900000000' });
    return f;
  }

  it('款項草稿：訂金只算用途為訂金的列；還沒填的金額（null）當 0', () => {
    const f = form();
    setPaymentDrafts(f, [
      { purpose: 'deposit', method: 'cash', amount: 500 },
      { purpose: 'balance', method: 'cash', amount: 300 },
    ]);
    const value = f.getRawValue();
    value.payments.drafts.push({ purpose: 'deposit', method: 'cash', amount: null });
    const facts = incompleteFactsFromForm({ value, quoteTotal: 2000, contract: 'unsigned' });
    expect(facts).toMatchObject({ depositRequired: 600, depositCollected: 500, amountDue: 2000, collected: 800 });
  });

  it('新承租人：填了證件號碼／駕照＝建立時一併建立並確認；留空＝缺', () => {
    const f = form();
    expect(incompleteFactsFromForm({ value: f.getRawValue(), quoteTotal: 2000, contract: 'unsigned' })).toMatchObject({
      identity: 'missing',
      driver: 'missing',
    });

    f.controls.renter.patchValue({ idNumber: 'A123456789' });
    f.controls.driver.patchValue({ licenseNumber: 'TL-9', standardizedVehicleClass: 'car' });
    expect(incompleteFactsFromForm({ value: f.getRawValue(), quoteTotal: 2000, contract: 'unsigned' })).toMatchObject({
      identity: 'verified',
      driver: 'verified',
    });
  });

  it('外國旅客的新駕照：這一步查核互惠資格為「符合」才算查核完成', () => {
    const f = form();
    f.controls.renter.patchValue({ kind: 'foreign_visitor', nationality: 'JP' });
    f.controls.driver.patchValue({ licenseNumber: 'JP-1', licenseIssuingCountry: 'JP', standardizedVehicleClass: 'car' });
    const facts = () => incompleteFactsFromForm({ value: f.getRawValue(), quoteTotal: 2000, contract: 'unsigned' });
    expect(facts().driver).toBe('unverified');
    f.controls.driver.controls.reciprocityStatus.setValue('manual_review');
    expect(facts().driver).toBe('unverified');
    f.controls.driver.controls.reciprocityStatus.setValue('eligible');
    expect(facts().driver).toBe('verified');
  });

  it('既有會員：證件看他已有的紀錄；駕照沒改就沿用那筆紀錄的查核狀態，改了才當成這次重新確認', () => {
    const f = form();
    f.controls.renter.patchValue({ memberId: 'm1' });
    const existing = credential({ verification: { state: 'ocr_extracted' } });
    f.controls.driver.patchValue({
      licenseNumber: existing.documentNumber,
      originalVehicleClassText: existing.originalVehicleClassText,
      standardizedVehicleClass: existing.standardizedVehicleClass,
    });
    const memberRecords = { identityDocuments: [identityDoc({ verification: { state: 'rejected' } })], driverCredentials: [existing] };
    const facts = () => incompleteFactsFromForm({ value: f.getRawValue(), quoteTotal: 2000, contract: 'signed', memberRecords });

    expect(facts()).toMatchObject({ identity: 'unverified', driver: 'unverified' });
    f.controls.driver.patchValue({ licenseNumber: 'TL-NEW' });
    expect(facts().driver).toBe('verified');
  });
});
