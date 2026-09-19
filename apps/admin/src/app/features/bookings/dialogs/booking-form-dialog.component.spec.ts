import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  BookingFormDialogComponent,
  BOOKING_WIZARD_STEPS,
} from './booking-form-dialog.component';
import {
  VEHICLE_REPO,
  MEMBER_REPO,
  BOOKING_REPO,
  MAINTENANCE_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import {
  Vehicle,
  Member,
  MemberKind,
  RentalBooking,
  MaintenanceRecord,
  PricingPlan,
  SeasonCalendar,
  AddOn,
  InsurancePlan,
  PaymentRecord,
  RefundRecord,
  ChargeAdjustment,
  ContractVersion,
  ContractSnapshot,
} from '../../../core/models';
import { ReminderGateway } from '../../../core/services/reminder.gateway';

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
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

function makePlan(partial: Partial<PricingPlan> = {}): PricingPlan {
  return {
    id: `plan-${partial.appliesToCategory ?? 'car'}`,
    name: 'test',
    appliesToCategory: 'car',
    dayTypeRates: { weekday: 1000, weekend: 1000, holiday: 1000, peak: 1000 },
    tiers: [],
    ...partial,
  };
}

function makeCalendar(): SeasonCalendar {
  return { id: 'cal1', holidays: [], peakSeasons: [] };
}

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: '2026-01-05T01:00:00.000Z',
    endTime: '2026-01-07T01:00:00.000Z',
    pickupLocation: '機場',
    returnLocation: '機場',
    status: 'reserved',
    depositRequired: 600,
    ...partial,
  };
}

function selectedEvent(value: string): MatAutocompleteSelectedEvent {
  return { option: { value } } as unknown as MatAutocompleteSelectedEvent;
}

function fakeReminderGateway() {
  return {
    schedule: vi.fn(async () => ({ state: 'scheduled' as const })),
    cancel: vi.fn(async () => undefined),
  };
}

interface FixtureOptions {
  vehicles?: Vehicle[];
  members?: Member[];
  bookings?: RentalBooking[];
  plans?: PricingPlan[];
  addOns?: AddOn[];
  contracts?: ContractVersion[];
  data?: Partial<RentalBooking> | null;
  paymentRepo?: ReturnType<typeof createInMemoryRepo<PaymentRecord>>;
  bookingRepo?: ReturnType<typeof createInMemoryRepo<RentalBooking>>;
  memberRepo?: ReturnType<typeof createInMemoryRepo<Member>>;
}

function createFixture(options: FixtureOptions = {}) {
  const closeSpy = vi.fn();
  const reminderGateway = fakeReminderGateway();
  const vehicleRepo = createInMemoryRepo<Vehicle>(options.vehicles ?? [makeVehicle()]);
  const memberRepo = options.memberRepo ?? createInMemoryRepo<Member>(options.members ?? []);
  const bookingRepo = options.bookingRepo ?? createInMemoryRepo<RentalBooking>(options.bookings ?? []);
  const paymentRepo = options.paymentRepo ?? createInMemoryRepo<PaymentRecord>([]);
  const contractRepo = createInMemoryRepo<ContractVersion>(options.contracts ?? []);

  TestBed.configureTestingModule({
    providers: [
      { provide: MatDialogRef, useValue: { close: closeSpy } },
      { provide: MAT_DIALOG_DATA, useValue: options.data ?? null },
      { provide: VEHICLE_REPO, useValue: vehicleRepo },
      { provide: MEMBER_REPO, useValue: memberRepo },
      { provide: BOOKING_REPO, useValue: bookingRepo },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      { provide: PRICING_PLAN_REPO, useValue: createInMemoryRepo<PricingPlan>(options.plans ?? [makePlan()]) },
      { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([makeCalendar()]) },
      { provide: ADDON_REPO, useValue: createInMemoryRepo<AddOn>(options.addOns ?? []) },
      { provide: PAYMENT_REPO, useValue: paymentRepo },
      { provide: REFUND_REPO, useValue: createInMemoryRepo<RefundRecord>([]) },
      { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo<ChargeAdjustment>([]) },
      { provide: CONTRACT_VERSION_REPO, useValue: contractRepo },
      { provide: ReminderGateway, useValue: reminderGateway },
    ],
  });
  const component = TestBed.createComponent(BookingFormDialogComponent).componentInstance;
  return { component, closeSpy, reminderGateway, vehicleRepo, memberRepo, bookingRepo, paymentRepo, contractRepo };
}

function fillVehicleStep(
  component: BookingFormDialogComponent,
  partial: Partial<{
    vehicleId: string;
    startLocal: string;
    endLocal: string;
    pickupLocation: string;
    returnLocation: string;
  }> = {},
): void {
  component.form.patchValue({
    vehicleId: 'v1',
    startLocal: '2026-01-05T09:00',
    endLocal: '2026-01-07T09:00',
    pickupLocation: '機場',
    returnLocation: '機場',
    ...partial,
  });
}

function fillNewRenter(
  component: BookingFormDialogComponent,
  partial: Partial<{ name: string; phone: string; kind: MemberKind }> = {},
): void {
  component.form.patchValue({
    name: '新客人',
    phone: '0900000000',
    kind: 'local',
    ...partial,
  });
}

describe('BookingFormDialogComponent 五個步驟', () => {
  it('精靈共有 5 個步驟，依序為租期與車輛→承租人與駕駛資格→費用與付款→合約→確認建立', () => {
    expect(BOOKING_WIZARD_STEPS).toEqual(['vehicle', 'renter', 'payment', 'contract', 'review']);
  });

  it('step 從 0 開始；nextStep/prevStep 依序移動且在頭尾夾住', () => {
    const { component } = createFixture();
    expect(component.step()).toBe(0);
    component.prevStep();
    expect(component.step()).toBe(0); // 夾在 0，不會變負數

    for (let i = 0; i < 4; i++) component.nextStep();
    expect(component.step()).toBe(4);
    component.nextStep();
    expect(component.step()).toBe(4); // 夾在最後一步

    component.prevStep();
    expect(component.step()).toBe(3);
  });

  it('租期與車輛欄位未填齊或報價算不出來之前，canProceed(0) 為 false', () => {
    const { component } = createFixture();
    expect(component.canProceed(0)).toBe(false);
    fillVehicleStep(component);
    expect(component.canProceed(0)).toBe(true);
  });
});

describe('BookingFormDialogComponent 車輛衝突檢查', () => {
  it('所選時段與既有訂單重疊時，conflicts() 非空且擋住第一步', () => {
    const { component } = createFixture({
      bookings: [
        makeBooking({
          id: 'existing',
          vehicleId: 'v1',
          startTime: '2026-01-06T00:00:00.000Z',
          endTime: '2026-01-06T12:00:00.000Z',
          status: 'reserved',
        }),
      ],
    });
    fillVehicleStep(component);

    expect(component.conflicts().map((c) => c.id)).toEqual(['existing']);
    expect(component.canProceed(0)).toBe(false);
  });

  it('送出前重新驗證：衝突存在時 submit() 會回報失敗、不建立訂單、不關閉 dialog', async () => {
    const { component, closeSpy, bookingRepo } = createFixture({
      bookings: [
        makeBooking({
          id: 'existing',
          vehicleId: 'v1',
          startTime: '2026-01-06T00:00:00.000Z',
          endTime: '2026-01-06T12:00:00.000Z',
          status: 'reserved',
        }),
      ],
    });
    fillVehicleStep(component);
    fillNewRenter(component);

    await component.submit();

    expect(component.error()).toContain('existing');
    expect(closeSpy).not.toHaveBeenCalled();
    expect(bookingRepo.getAll()).toHaveLength(1); // 仍只有原本那筆，沒有新增
  });
});

describe('BookingFormDialogComponent 承租人：沿用既有會員 / 新建會員', () => {
  it('選到既有會員後鎖定 id，送出直接沿用該會員，不新建會員', async () => {
    const { component, closeSpy, memberRepo } = createFixture({
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
    });
    component.onMemberSelected(selectedEvent('m1'));
    expect(component.lockedMemberId()).toBe('m1');
    expect(component.form.controls.name.disabled).toBe(true);

    fillVehicleStep(component);
    await component.submit();

    expect(memberRepo.getAll()).toHaveLength(1); // 沒有新建會員
    expect(closeSpy).toHaveBeenCalledWith({ bookingId: expect.any(String) });
    const bookingId = closeSpy.mock.calls[0][0].bookingId;
    expect(component.bookingStore.bookings().find((b) => b.id === bookingId)?.memberId).toBe('m1');
  });

  it('純打字輸入新客人資料時，送出前會先呼叫 MemberStore.create 建立新會員', async () => {
    const { component, closeSpy, memberRepo } = createFixture();
    fillVehicleStep(component);
    fillNewRenter(component, { name: '新客人', phone: '0900000000' });

    await component.submit();

    const members = memberRepo.getAll();
    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({ name: '新客人', phone: '0900000000', kind: 'local' });
    expect(closeSpy).toHaveBeenCalled();
    const bookingId = closeSpy.mock.calls[0][0].bookingId;
    expect(component.bookingStore.bookings().find((b) => b.id === bookingId)?.memberId).toBe(members[0].id);
  });

  it('鎖定後點「換一位」清空三欄並解除鎖定，回到新會員狀態', () => {
    const { component } = createFixture({
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
    });
    component.onMemberSelected(selectedEvent('m1'));
    component.changeMember();

    expect(component.lockedMemberId()).toBeNull();
    expect(component.form.controls.name.disabled).toBe(false);
    expect(component.form.getRawValue().name).toBe('');
  });
});

describe('BookingFormDialogComponent 訂金上限（小客車 30% / 機車 0，Task 3 同一套規則）', () => {
  it('小客車：訂金預設等於報價總額的 30%，超過上限會被標記', () => {
    const { component } = createFixture({ vehicles: [makeVehicle({ id: 'v1', category: 'car' })] });
    fillVehicleStep(component);

    const total = component.quote()?.total ?? 0;
    expect(total).toBeGreaterThan(0);
    expect(component.depositCap()).toBe(Math.round(total * 0.3));
    expect(component.form.controls.depositRequired.value).toBe(component.depositCap());
    expect(component.depositExceedsCap()).toBe(false);

    // 模擬使用者親自輸入（不是精靈自動預設）：UI 上 formControlName 的輸入事件會自動
    // markAsDirty，這裡用程式碼直接呼叫 setValue 需要自己補上，才會關閉自動預設訂金的邏輯。
    component.form.controls.depositRequired.markAsDirty();
    component.form.controls.depositRequired.setValue(component.depositCap() + 1);
    expect(component.depositExceedsCap()).toBe(true);
    expect(component.canProceed(2)).toBe(false);
  });

  it('機車：訂金上限為 0', () => {
    const { component } = createFixture({
      vehicles: [makeVehicle({ id: 'v1', category: 'scooter' })],
      plans: [makePlan({ appliesToCategory: 'scooter' })],
    });
    fillVehicleStep(component);

    expect(component.depositCap()).toBe(0);
    expect(component.form.controls.depositRequired.value).toBe(0);
  });

  it('編輯既有訂單時不會用車型上限覆蓋已載入的訂金值', () => {
    const booking = makeBooking({ depositRequired: 123 });
    const { component } = createFixture({
      data: booking,
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
    });
    expect(component.form.controls.depositRequired.value).toBe(123);
  });
});

describe('BookingFormDialogComponent 確認建立：待辦事項摘要', () => {
  it('沒有 Email／訂金未收／合約未簽／餘額未收足時，逐項列出待辦', () => {
    const { component } = createFixture();
    fillVehicleStep(component);
    fillNewRenter(component);

    const items = component.incompleteItems();
    expect(items).toContain(component.t.bookingForm.incomplete.missingEmail);
    expect(items).toContain(component.t.bookingForm.incomplete.depositNotCollected);
    expect(items).toContain(component.t.bookingForm.incomplete.contractNotSigned);
    expect(items).toContain(component.t.bookingForm.incomplete.balanceNotCollected);
  });

  it('補齊 Email、收滿訂金與尾款、勾選現場簽署後，待辦清單清空', () => {
    const { component } = createFixture();
    fillVehicleStep(component);
    fillNewRenter(component);
    component.form.patchValue({ email: 'a@b.com', signNow: true });

    const quote = component.quote();
    expect(quote).toBeDefined();
    const total = quote?.total ?? 0;
    const deposit = component.depositCap();
    component.form.controls.depositRequired.setValue(deposit);
    component.form.patchValue({ paymentPurpose: 'deposit', paymentAmount: deposit });
    component.addPaymentDraft();
    component.form.patchValue({ paymentPurpose: 'balance', paymentAmount: total - deposit });
    component.addPaymentDraft();

    expect(component.incompleteItems()).toEqual([]);
  });
});

describe('BookingFormDialogComponent 編輯既有訂單：核心欄位異動才產生新合約版本', () => {
  it('無異動重複送出不會多出版本；已簽署的訂單若核心欄位（車輛）異動，送出後會產生新草稿版本並讓已簽署的舊版 superseded', async () => {
    const booking = makeBooking({ id: 'b1', vehicleId: 'v1', memberId: 'm1' });
    const { component, contractRepo } = createFixture({
      vehicles: [makeVehicle({ id: 'v1', category: 'car' }), makeVehicle({ id: 'v2', category: 'car', plateNumber: 'XYZ-999' })],
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
      bookings: [booking],
      data: booking,
    });

    // 第一次送出：這筆訂單原本沒有合約，等同建立第 1 版草稿。
    await component.submit();
    expect(component.contractStore.versionsFor('b1')).toHaveLength(1);
    expect(component.contractStore.versionsFor('b1')[0].status).toBe('draft');

    // 第二次送出：勾選現場簽署、但表單其餘內容完全沒改動——快照沒有差異，
    // reviseIfChanged 沿用同一版本（不多產生版本），送出邏輯再把這個沿用的版本簽署掉。
    component.form.controls.signNow.setValue(true);
    await component.submit();
    expect(component.contractStore.versionsFor('b1')).toHaveLength(1);
    expect(component.contractStore.versionsFor('b1')[0].status).toBe('signed');

    // 換一台車（核心欄位異動）後第三次送出：即使既有版本已經簽署，仍要產生新草稿版本、
    // 讓已簽署的舊版變成 superseded——已簽署版本不可覆寫，見 contract-version.ts 的模型註解。
    // 這次不勾現場簽署，讓新版本維持在 draft，證明「新版本」與「簽署」是分開兩件事。
    component.form.controls.signNow.setValue(false);
    component.form.controls.vehicleId.setValue('v2');
    await component.submit();

    const versions = component.contractStore.versionsFor('b1');
    expect(versions).toHaveLength(2);
    expect(versions[0].status).toBe('superseded');
    expect(versions[1].status).toBe('draft');
    expect(versions[1].snapshot.vehicle.vehicleId).toBe('v2');
    expect(contractRepo.getAll()).toHaveLength(2);
  });
});

describe('BookingFormDialogComponent 原子送出：中途失敗要補償清除本次新建的記錄', () => {
  it('訂單建立失敗時，本次新建的會員要被補償刪除，且不會關閉 dialog', async () => {
    const { component, closeSpy, memberRepo, bookingRepo } = createFixture();
    bookingRepo.create = vi.fn(() => {
      throw new Error('模擬訂單寫入失敗');
    });
    fillVehicleStep(component);
    fillNewRenter(component);

    await component.submit();

    expect(component.error()).toBe('模擬訂單寫入失敗');
    expect(closeSpy).not.toHaveBeenCalled();
    expect(memberRepo.getAll()).toHaveLength(0); // 本次新建的會員已補償刪除
    expect(bookingRepo.getAll()).toHaveLength(0);
  });

  it('第 2 筆款項寫入失敗時，第 1 筆已寫入的款項要作廢（不是刪除），訂單與新會員都要補償清除', async () => {
    const { component, closeSpy, memberRepo, bookingRepo, paymentRepo } = createFixture();
    const originalCreate = paymentRepo.create;
    let calls = 0;
    paymentRepo.create = vi.fn((item: PaymentRecord) => {
      calls++;
      if (calls === 2) throw new Error('模擬第 2 筆款項寫入失敗');
      return originalCreate(item);
    });

    fillVehicleStep(component);
    fillNewRenter(component);
    component.form.patchValue({ paymentPurpose: 'deposit', paymentAmount: 100 });
    component.addPaymentDraft();
    component.form.patchValue({ paymentPurpose: 'balance', paymentAmount: 200 });
    component.addPaymentDraft();

    await component.submit();

    expect(component.error()).toBe('模擬第 2 筆款項寫入失敗');
    expect(closeSpy).not.toHaveBeenCalled();
    const payments = paymentRepo.getAll();
    expect(payments).toHaveLength(1); // 沒有被硬刪除
    expect(payments[0].status).toBe('voided'); // 而是作廢，保留稽核軌跡
    expect(bookingRepo.getAll()).toHaveLength(0);
    expect(memberRepo.getAll()).toHaveLength(0);
  });
});

describe('BookingFormDialogComponent 編輯既有訂單：不會清空原本的保險與加購配件（review fix #1）', () => {
  it('只改動不相關欄位（取車地點）時，儲存後 priceBreakdown 仍保留原本選的保險與配件', async () => {
    const insurancePlan: InsurancePlan = {
      id: 'ins1',
      name: '甲式保險',
      dailyPriceFrom: 300,
      tags: [],
      coverageItems: [],
    };
    const addOn: AddOn = { id: 'addon1', name: '兒童座椅', unitPrice: 100, unit: 'per_day' };
    const vehicle = makeVehicle({ id: 'v1', category: 'car', insurancePlans: [insurancePlan] });

    // 第一階段：用精靈建立一筆帶保險＋配件的訂單，取得真實算出來的 priceBreakdown 當基準
    // （不手刻一份 PriceBreakdown，避免自己算錯又自己驗證自己算的這種偽陽性）。
    const create = createFixture({ vehicles: [vehicle], addOns: [addOn] });
    fillVehicleStep(create.component);
    fillNewRenter(create.component);
    create.component.setAddOnQty('addon1', 2);
    create.component.form.controls.insurancePlanId.setValue('ins1');
    await create.component.submit();

    const bookingId = create.closeSpy.mock.calls[0][0].bookingId as string;
    const originalBooking = create.component.bookingStore.bookings().find((b) => b.id === bookingId);
    expect(originalBooking).toBeDefined();
    expect(originalBooking?.priceBreakdown?.insuranceSubtotal).toBeGreaterThan(0);
    expect(originalBooking?.priceBreakdown?.addOnSubtotal).toBeGreaterThan(0);
    if (!originalBooking) throw new Error('originalBooking not found');
    const original = originalBooking;

    // 第二階段：重新打開這筆訂單的編輯 dialog（新的 component 實例，模擬真的關掉再開），
    // 只改取車地點這個跟保險/配件完全無關的欄位。TestBed 同一個測試裡只能
    // configureTestingModule 一次，先重置才能再組一次新的注入環境。
    TestBed.resetTestingModule();
    const edit = createFixture({
      vehicles: [vehicle],
      addOns: [addOn],
      members: create.memberRepo.getAll(),
      bookings: [original],
      data: original,
    });
    expect(edit.component.addOnQtyFor('addon1')).toBe(2); // 建構時就該回填，不用等 submit
    expect(edit.component.form.controls.insurancePlanId.value).toBe('ins1');

    edit.component.form.controls.pickupLocation.setValue('高鐵站');
    await edit.component.submit();

    const updated = edit.component.bookingStore.bookings().find((b) => b.id === bookingId);
    expect(updated?.pickupLocation).toBe('高鐵站');
    expect(updated?.priceBreakdown?.insuranceSubtotal).toBe(original.priceBreakdown?.insuranceSubtotal);
    expect(updated?.priceBreakdown?.addOnSubtotal).toBe(original.priceBreakdown?.addOnSubtotal);
    expect(updated?.priceBreakdown?.total).toBe(original.priceBreakdown?.total);
  });
});

describe('BookingFormDialogComponent 編輯既有訂單：保險方案反推不出來時擋住送出（review fix #1 的再修正）', () => {
  it('原本的保險方案已經從車輛清單移除，編輯不相關欄位時擋住送出並給出明確錯誤，不會悄悄把保險歸零', async () => {
    // 車輛目前的保險方案清單是空的——模擬「訂單建立後，車輛的保險方案被改價或整個移除」，
    // hydratePricingSelectionsFromExisting 完全反推不出對應方案。
    const vehicle = makeVehicle({ id: 'v1', category: 'car', insurancePlans: [] });
    const original = makeBooking({
      id: 'b1',
      vehicleId: 'v1',
      memberId: 'm1',
      priceBreakdown: {
        dailyLines: [
          { date: '2026-01-05', dayType: 'weekday', price: 1000 },
          { date: '2026-01-06', dayType: 'weekday', price: 1000 },
        ],
        rentalRaw: 2000,
        tierDiscountPercent: 0,
        tierDiscountAmount: 0,
        rentalSubtotal: 2000,
        partnerDiscountPercent: 0,
        partnerDiscount: 0,
        addOnLines: [],
        addOnSubtotal: 0,
        insuranceSubtotal: 600, // 原本有保險，但目前的保險清單裡已經找不到對應方案
        couponDiscount: 0,
        total: 2600,
      },
    });
    const { component, closeSpy, bookingRepo } = createFixture({
      vehicles: [vehicle],
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
      bookings: [original],
      data: original,
    });

    expect(component.insuranceUnreconciled()).toBe(true);
    expect(component.canProceed(2)).toBe(false); // 費用與付款步驟的 Next 也要被擋住

    component.form.controls.pickupLocation.setValue('高鐵站');
    await component.submit();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(component.error()).toBe(component.t.bookingForm.insuranceUnreconciled);
    const stillStored = bookingRepo.getAll().find((b) => b.id === 'b1');
    expect(stillStored?.priceBreakdown?.insuranceSubtotal).toBe(600); // 沒有被悄悄歸零
    expect(stillStored?.pickupLocation).toBe('機場'); // 送出整個被擋在寫入之前，地點也還是原值
  });

  it('操作人員手動重新選一個保險方案後，旗標解除、可以正常送出', async () => {
    const insurancePlan: InsurancePlan = {
      id: 'ins-new',
      name: '乙式保險',
      dailyPriceFrom: 400,
      tags: [],
      coverageItems: [],
    };
    const vehicle = makeVehicle({ id: 'v1', category: 'car', insurancePlans: [insurancePlan] });
    const original = makeBooking({
      id: 'b1',
      vehicleId: 'v1',
      memberId: 'm1',
      priceBreakdown: {
        dailyLines: [
          { date: '2026-01-05', dayType: 'weekday', price: 1000 },
          { date: '2026-01-06', dayType: 'weekday', price: 1000 },
        ],
        rentalRaw: 2000,
        tierDiscountPercent: 0,
        tierDiscountAmount: 0,
        rentalSubtotal: 2000,
        partnerDiscountPercent: 0,
        partnerDiscount: 0,
        addOnLines: [],
        addOnSubtotal: 0,
        insuranceSubtotal: 600, // 跟乙式保險（400/天 * 2 天 = 800）對不上，反推會失敗
        couponDiscount: 0,
        total: 2600,
      },
    });
    const { component, closeSpy } = createFixture({
      vehicles: [vehicle],
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
      bookings: [original],
      data: original,
    });
    expect(component.insuranceUnreconciled()).toBe(true);

    component.form.controls.insurancePlanId.setValue('ins-new'); // 操作人員自己明確重選
    expect(component.insuranceUnreconciled()).toBe(false);

    await component.submit();

    expect(closeSpy).toHaveBeenCalled();
    expect(component.error()).toBe('');
  });

  it('原本沒有保險（insuranceSubtotal 為 0）時，即使車輛目前沒有任何保險方案，也不會被擋', () => {
    const vehicle = makeVehicle({ id: 'v1', category: 'car', insurancePlans: [] });
    const original = makeBooking({ id: 'b1', vehicleId: 'v1', memberId: 'm1' }); // 預設沒有 priceBreakdown
    const { component } = createFixture({
      vehicles: [vehicle],
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
      bookings: [original],
      data: original,
    });

    expect(component.insuranceUnreconciled()).toBe(false);
  });
});

function makeContractSnapshot(partial: Partial<ContractSnapshot> = {}): ContractSnapshot {
  const party = { memberId: 'm1', name: '王小明', phone: '0912345678' };
  return {
    renter: party,
    driver: party,
    vehicle: { vehicleId: 'v1', plateNumber: 'ABC-123', brand: 'Toyota', model: 'Altis', category: 'car' },
    rentalStartTime: '2026-01-05T01:00:00.000Z',
    rentalEndTime: '2026-01-07T01:00:00.000Z',
    pickupLocation: '機場',
    returnLocation: '機場',
    depositRequired: 600,
    pricing: {
      dailyLines: [],
      rentalRaw: 2000,
      tierDiscountPercent: 0,
      tierDiscountAmount: 0,
      rentalSubtotal: 2000,
      partnerDiscountPercent: 0,
      partnerDiscount: 0,
      addOnLines: [],
      addOnSubtotal: 0,
      insuranceSubtotal: 0,
      couponDiscount: 0,
      total: 2000,
    },
    disclosedRules: { cancellationContractKind: 'passenger_car', cancellationRuleVersion: 'v1' },
    ...partial,
  };
}

describe('BookingFormDialogComponent 編輯已簽署訂單：待辦清單不誤報「合約尚未簽署」（review fix #2）', () => {
  it('既有合約已簽署時，即使這次沒勾現場簽署，待辦清單也不會出現「合約尚未簽署」', () => {
    const booking = makeBooking({ id: 'b1', vehicleId: 'v1', memberId: 'm1' });
    const signedContract: ContractVersion = {
      id: 'cv1',
      bookingId: 'b1',
      version: 1,
      status: 'signed',
      snapshot: makeContractSnapshot(),
      signatureAssetIds: ['sig'],
      createdAt: new Date().toISOString(),
      signedAt: new Date().toISOString(),
    };
    const { component } = createFixture({
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
      bookings: [booking],
      contracts: [signedContract],
      data: booking,
    });

    expect(component.currentContractSigned()).toBe(true);
    expect(component.incompleteItems()).not.toContain(component.t.bookingForm.incomplete.contractNotSigned);
  });

  it('新增訂單模式（沒有既有合約可查）時，維持看 signNow 判斷', () => {
    const { component } = createFixture();
    fillVehicleStep(component);
    fillNewRenter(component);

    expect(component.currentContractSigned()).toBe(false);
    expect(component.incompleteItems()).toContain(component.t.bookingForm.incomplete.contractNotSigned);
  });

  it('編輯既有訂單但合約還是草稿（尚未簽署）時，待辦清單仍要提醒', () => {
    const booking = makeBooking({ id: 'b1', vehicleId: 'v1', memberId: 'm1' });
    const draftContract: ContractVersion = {
      id: 'cv1',
      bookingId: 'b1',
      version: 1,
      status: 'draft',
      snapshot: makeContractSnapshot(),
      createdAt: new Date().toISOString(),
    };
    const { component } = createFixture({
      members: [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
      bookings: [booking],
      contracts: [draftContract],
      data: booking,
    });

    expect(component.currentContractSigned()).toBe(false);
    expect(component.incompleteItems()).toContain(component.t.bookingForm.incomplete.contractNotSigned);
  });
});
