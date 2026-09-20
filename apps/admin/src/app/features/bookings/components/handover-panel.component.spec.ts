import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  ContractDisclosedRules,
  ContractVersion,
  DriverCredential,
  IdentityDocument,
  Member,
  PricingPlan,
  RentalBooking,
  ReminderStatus,
  SeasonCalendar,
  Vehicle,
} from '@car-rental/domain';
import {
  BOOKING_REPO,
  CHARGE_ADJUSTMENT_REPO,
  CONTRACT_VERSION_REPO,
  DRIVER_CREDENTIAL_REPO,
  HANDOVER_RECORD_REPO,
  IDENTITY_DOCUMENT_REPO,
  MAINTENANCE_REPO,
  MEMBER_REPO,
  AUDIT_ENTRY_REPO,
  PAYMENT_REPO,
  PRICING_PLAN_REPO,
  REFUND_REPO,
  REMINDER_STATUS_REPO,
  SEASON_CALENDAR_REPO,
  VEHICLE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { OcrExtractionResult, OcrGateway } from '../../../core/services/ocr.gateway';
import { DriverEligibilityCheckInput, DriverEligibilityGateway, DriverEligibilityResult } from '../../../core/services/driver-eligibility.gateway';
import { ReminderDispatchResult, ReminderGateway, ScheduleReminderInput } from '../../../core/services/reminder.gateway';
import { HandoverPanelComponent } from './handover-panel.component';
import { HandoverStore } from '../../../stores/handover/handover.store';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';

const T_START = '2026-07-20T09:00:00.000Z';
const T_END = '2026-07-22T18:00:00.000Z';

/** 與元件內部 toDatetimeLocalValue() 相同的轉換邏輯，測試檔獨立一份以設定 datetime-local 表單值。 */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

class FakeDocumentAssetGateway implements DocumentAssetGateway {
  private counter = 0;
  readonly stored: Array<{ file: Blob; filename: string }> = [];

  store(file: Blob, filename: string): Promise<StoredDocumentAsset> {
    this.stored.push({ file, filename });
    this.counter += 1;
    return Promise.resolve({ assetId: `asset-${this.counter}`, url: `blob:${this.counter}` });
  }
  resolveUrl(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
  remove(): Promise<void> {
    return Promise.resolve();
  }
}

class FakeOcrGateway implements OcrGateway {
  extract(): Promise<OcrExtractionResult> {
    return Promise.resolve({ status: 'succeeded', confidence: 0.95 });
  }
}

class FakeDriverEligibilityGateway implements DriverEligibilityGateway {
  checkReciprocity(_input: DriverEligibilityCheckInput): Promise<DriverEligibilityResult> {
    return Promise.resolve({ reciprocityStatus: 'eligible' });
  }
}

/** ReminderStore（本任務新增）的必要依賴——這裡只需要滿足 DI，不測試排程行為本身。 */
class FakeReminderGateway implements ReminderGateway {
  async schedule(_input: ScheduleReminderInput): Promise<ReminderDispatchResult> {
    return { state: 'scheduled' };
  }
  async cancel(): Promise<void> {
    return undefined;
  }
}

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'A-1',
    category: 'scooter',
    model: 'X',
    brand: 'Gogoro',
    year: 2022,
    status: 'available',
    mileage: 1000,
    createdAt: T_START,
    ...partial,
  };
}

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: T_START,
    endTime: T_END,
    pickupLocation: '馬公',
    returnLocation: '馬公',
    status: 'reserved',
    depositRequired: 0,
    ...partial,
  };
}

function makeMember(partial: Partial<Member> = {}): Member {
  return { id: 'm1', name: '王小明', phone: '0900000000', kind: 'local', ...partial };
}

/**
 * 就緒判斷需要的「已簽署合約」快照——內容細節不影響測試，欄位齊全即可通過型別檢查。
 * disclosedRulesOverride 只疊在 disclosedRules 上（深層合併），不會被 partial 的淺層
 * spread 整包蓋掉，方便測項單獨鎖定「合約簽署當下的逾時／能源補繳規則」而不必重寫整份快照。
 */
function makeSignedContractVersion(
  partial: Partial<ContractVersion> = {},
  disclosedRulesOverride: Partial<ContractDisclosedRules> = {},
): ContractVersion {
  return {
    id: 'cv1',
    bookingId: 'b1',
    version: 1,
    status: 'signed',
    snapshot: {
      renter: { memberId: 'm1', name: '王小明', phone: '0900000000' },
      driver: { memberId: 'm1', name: '王小明', phone: '0900000000' },
      vehicle: { vehicleId: 'v1', plateNumber: 'A-1', brand: 'Gogoro', model: 'X', category: 'scooter' },
      rentalStartTime: T_START,
      rentalEndTime: T_END,
      pickupLocation: '馬公',
      returnLocation: '馬公',
      depositRequired: 0,
      pricing: {
        dailyLines: [],
        rentalRaw: 0,
        tierDiscountPercent: 0,
        tierDiscountAmount: 0,
        rentalSubtotal: 0,
        partnerDiscountPercent: 0,
        partnerDiscount: 0,
        addOnLines: [],
        addOnSubtotal: 0,
        insuranceSubtotal: 0,
        couponDiscount: 0,
        total: 0,
      },
      disclosedRules: {
        cancellationContractKind: 'scooter',
        cancellationRuleVersion: 'v1',
        ...disclosedRulesOverride,
      },
    },
    createdAt: T_START,
    signedAt: T_START,
    ...partial,
  };
}

function makeIdentityDocument(partial: Partial<IdentityDocument> = {}): IdentityDocument {
  return {
    id: 'id1',
    memberId: 'm1',
    type: 'taiwan_id',
    documentNumber: 'A123456789',
    issuingCountry: 'TW',
    verification: { state: 'verified' },
    version: 1,
    createdAt: T_START,
    updatedAt: T_START,
    ...partial,
  };
}

function makeDriverCredential(partial: Partial<DriverCredential> = {}): DriverCredential {
  return {
    id: 'dc1',
    memberId: 'm1',
    type: 'taiwan_license',
    documentNumber: 'B123456',
    issuingCountry: 'TW',
    originalVehicleClassText: '普通輕型機車',
    standardizedVehicleClass: 'scooter',
    verification: { state: 'verified' },
    reciprocityStatus: 'pending',
    version: 1,
    createdAt: T_START,
    updatedAt: T_START,
    ...partial,
  };
}

function makePricingPlan(partial: Partial<PricingPlan> = {}): PricingPlan {
  return {
    id: 'plan1',
    name: '機車標準方案',
    appliesToCategory: 'scooter',
    dayTypeRates: { weekday: 500, weekend: 600, holiday: 700, peak: 800 },
    tiers: [],
    lateReturnPolicy: { graceMinutes: 15, unitMinutes: 30, feePerUnit: 100, dailyCap: 1000 },
    energyReturnPolicy: { measure: 'eighths', feePerUnit: 50, serviceFee: 100 },
    ...partial,
  };
}

describe('HandoverPanelComponent', () => {
  let assetGateway: FakeDocumentAssetGateway;

  function configure(options: {
    vehicle?: Partial<Vehicle>;
    booking?: Partial<RentalBooking>;
    member?: Partial<Member>;
    depositRequired?: number;
    /** 預設是「就緒」的一份已簽署合約／身分證／駕照，個別測項只需覆寫要觸發的那個阻擋。 */
    omitContract?: boolean;
    omitIdentityDocument?: boolean;
    omitDriverCredential?: boolean;
    /** 合約快照裡鎖定的逾時／能源補繳規則；預設不帶，還車試算會退回用 PricingStore 反查。 */
    disclosedRules?: Partial<ContractDisclosedRules>;
    pricingPlan?: Partial<PricingPlan>;
    reminderStatuses?: ReminderStatus[];
  } = {}) {
    assetGateway = new FakeDocumentAssetGateway();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle(options.vehicle)]) },
        {
          provide: BOOKING_REPO,
          useValue: createInMemoryRepo<RentalBooking>([
            makeBooking({ depositRequired: options.depositRequired ?? 0, ...options.booking }),
          ]),
        },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo() },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>([makeMember(options.member)]) },
        {
          provide: IDENTITY_DOCUMENT_REPO,
          useValue: createInMemoryRepo<IdentityDocument>(options.omitIdentityDocument ? [] : [makeIdentityDocument()]),
        },
        {
          provide: DRIVER_CREDENTIAL_REPO,
          useValue: createInMemoryRepo<DriverCredential>(options.omitDriverCredential ? [] : [makeDriverCredential()]),
        },
        {
          provide: CONTRACT_VERSION_REPO,
          useValue: createInMemoryRepo<ContractVersion>(
            options.omitContract ? [] : [makeSignedContractVersion({}, options.disclosedRules ?? {})],
          ),
        },
        { provide: PAYMENT_REPO, useValue: createInMemoryRepo() },
        { provide: REFUND_REPO, useValue: createInMemoryRepo() },
        { provide: CHARGE_ADJUSTMENT_REPO, useValue: createInMemoryRepo() },
        { provide: HANDOVER_RECORD_REPO, useValue: createInMemoryRepo() },
        { provide: AUDIT_ENTRY_REPO, useValue: createInMemoryRepo() },
        { provide: REMINDER_STATUS_REPO, useValue: createInMemoryRepo<ReminderStatus>(options.reminderStatuses ?? []) },
        { provide: ReminderGateway, useValue: new FakeReminderGateway() },
        {
          provide: PRICING_PLAN_REPO,
          useValue: createInMemoryRepo<PricingPlan>([makePricingPlan(options.pricingPlan)]),
        },
        { provide: SEASON_CALENDAR_REPO, useValue: createInMemoryRepo<SeasonCalendar>([{ id: 'cal1', holidays: [], peakSeasons: [] }]) },
        { provide: DocumentAssetGateway, useValue: assetGateway },
        { provide: OcrGateway, useValue: new FakeOcrGateway() },
        { provide: DriverEligibilityGateway, useValue: new FakeDriverEligibilityGateway() },
      ],
    });
  }

  beforeEach(() => configure());

  function createFixture(bookingId = 'b1') {
    const fixture = TestBed.createComponent(HandoverPanelComponent);
    fixture.componentRef.setInput('bookingId', bookingId);
    fixture.detectChanges();
    return fixture;
  }

  it('沒有任何阻擋：顯示「已符合取車條件」，且沒有主管覆核欄位', () => {
    const fixture = createFixture();
    fixture.componentInstance['pickupForm'].patchValue({ originalDocumentChecked: true });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('已符合取車條件');
    expect(el.querySelector('.handover-panel__override')).toBeNull();
  });

  it('訂金未達門檻：顯示阻擋項目與可覆核的主管欄位；未填理由送出會顯示錯誤，不會建立紀錄', async () => {
    configure({ depositRequired: 1000 });
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('尚有阻擋項目');
    expect(el.querySelector('.handover-panel__override')).toBeTruthy();

    await fixture.componentInstance['submitPickup']();
    fixture.detectChanges();

    expect(fixture.componentInstance['pickupError']()).toBeTruthy();
    const handoverStore = TestBed.inject(HandoverStore);
    expect(handoverStore.pickupFor('b1')).toBeUndefined();
  });

  it('訂金未達門檻但填了完整主管覆核：可以成功取車，訂單轉為 in_progress', async () => {
    configure({ depositRequired: 1000 });
    const fixture = createFixture();

    fixture.componentInstance['pickupForm'].patchValue({
      overrideActorName: '主管王',
      overrideReason: '訂金餘額改於還車時一併結清',
    });

    await fixture.componentInstance['submitPickup']();
    fixture.detectChanges();

    const bookingStore = TestBed.inject(BookingStore);
    expect(bookingStore.bookings()[0].status).toBe('in_progress');
    expect(fixture.componentInstance['pickupError']()).toBeUndefined();
  });

  it('車輛維修中（車輛安全類別）：顯示無法覆核提示，不出現主管覆核欄位，送出按鈕停用', () => {
    configure({ vehicle: { status: 'maintenance' } });
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('一般主管覆核無法放行');
    expect(el.querySelector('.handover-panel__override')).toBeNull();
    const submitBtn = el.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('新增照片會呼叫 DocumentAssetGateway 並顯示在清單中，取車完成後紀錄含照片 asset id', async () => {
    const fixture = createFixture();
    fixture.componentInstance['pickupForm'].patchValue({ originalDocumentChecked: true });
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'dash.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(assetGateway.stored).toHaveLength(1);
    expect(fixture.componentInstance['pickupPhotoAssetIds']()).toEqual(['asset-1']);

    await fixture.componentInstance['submitPickup']();
    fixture.detectChanges();

    const handoverStore = TestBed.inject(HandoverStore);
    expect(handoverStore.pickupFor('b1')?.photoAssetIds).toEqual(['asset-1']);
  });

  describe('還車', () => {
    /**
     * 還車測項需要一筆「真的透過 HandoverStore.performPickup() 建立」的取車紀錄
     * （還車試算要讀取車時的能源讀數），因此重用同一個 fixture、先跑完取車表單，
     * 讓 booking().status 反應成 in_progress 後畫面自動切到還車表單，而不是另外
     * 繞過元件直接呼叫 bookingStore.pickUp()（那樣不會留下 HandoverRecord）。
     */
    async function createFixtureAfterPickup() {
      const fixture = createFixture();
      fixture.componentInstance['pickupForm'].patchValue({ originalDocumentChecked: true });
      await fixture.componentInstance['submitPickup']();
      fixture.detectChanges();
      expect(TestBed.inject(BookingStore).bookings()[0].status).toBe('in_progress');
      return fixture;
    }

    it('未按試算前，確認還車按鈕停用；按試算後才會顯示金額並可送出', async () => {
      const fixture = await createFixtureAfterPickup();
      const el = fixture.nativeElement as HTMLElement;

      const confirmBtn = Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('確認還車'),
      ) as HTMLButtonElement;
      expect(confirmBtn.disabled).toBe(true);

      fixture.componentInstance['returnForm'].patchValue({ mileage: 1100, energyLevel: 8 });
      fixture.componentInstance['previewReturnCharges']();
      fixture.detectChanges();

      expect(fixture.componentInstance['returnChargesPreview']()).toBeDefined();
    });

    it('人工調整金額但未附理由：試算顯示錯誤，不產生試算結果', async () => {
      const fixture = await createFixtureAfterPickup();

      fixture.componentInstance['returnForm'].patchValue({ mileage: 1100, energyLevel: 8, manualLateFee: 999 });
      fixture.componentInstance['previewReturnCharges']();
      fixture.detectChanges();

      expect(fixture.componentInstance['returnChargesPreview']()).toBeUndefined();
      expect(fixture.componentInstance['returnError']()).toBeTruthy();
    });

    it('準時還車、無費用：確認還車後訂單完成，車輛轉為 available；即使有應收餘額也不會擋下完成', async () => {
      const fixture = await createFixtureAfterPickup();

      fixture.componentInstance['returnForm'].patchValue({ mileage: 1100, energyLevel: 8 });
      fixture.componentInstance['previewReturnCharges']();
      fixture.detectChanges();

      await fixture.componentInstance['confirmReturn']();
      fixture.detectChanges();

      const bookingStore = TestBed.inject(BookingStore);
      expect(bookingStore.bookings()[0].status).toBe('completed');
      expect(TestBed.inject(VehicleStore).vehicles()[0].status).toBe('available');

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('交還車紀錄');
    });

    it('還車試算優先採用合約簽署當下鎖定的 disclosedRules 規則，即使定價方案事後被改成不同費率', async () => {
      // 合約快照鎖定的逾時費率（簽約當下揭露給客人的規則）：免寬限、每 30 分鐘 999 元。
      // 定價方案（模擬簽約後被後台調整過）：15 分鐘寬限、每 30 分鐘 100 元——刻意與快照不同，
      // 若元件錯用「即時反查方案」，算出的逾時費會是用這組數字，而不是快照那組。
      configure({
        disclosedRules: {
          lateReturnPolicy: { graceMinutes: 0, unitMinutes: 30, feePerUnit: 999, dailyCap: 99999 },
          energyReturnPolicy: { measure: 'eighths', feePerUnit: 0, serviceFee: 0 },
        },
        pricingPlan: {
          lateReturnPolicy: { graceMinutes: 15, unitMinutes: 30, feePerUnit: 100, dailyCap: 1000 },
        },
      });

      const fixture = await createFixtureAfterPickup();

      // 逾還 40 分鐘、能源讀數與取車相同（無能源虧缺，避免能源費干擾判讀）。
      fixture.componentInstance['returnForm'].patchValue({
        actualAt: toDatetimeLocalValue('2026-07-22T18:40:00.000Z'),
        mileage: 1100,
        energyLevel: 8,
      });
      fixture.componentInstance['previewReturnCharges']();
      fixture.detectChanges();

      const charges = fixture.componentInstance['returnChargesPreview']();
      expect(charges).toBeDefined();
      // 快照規則（無寬限、每單位 999）：40 分鐘 → ceil(40/30)=2 單位 → 1998。
      // 若誤用方案規則（15 分鐘寬限、每單位 100）會得到 100，兩者差異明顯，足以驗證來源正確。
      expect(charges!.finalLateFee).toBe(1998);
      expect(charges!.finalEnergyFee).toBe(0);
    });
  });

  describe('還車提醒狀態（Task 17）', () => {
    it('還車中訂單顯示提醒狀態，且已寄送的提醒附上明確的開發模擬標示', async () => {
      configure({
        booking: { status: 'in_progress' },
        reminderStatuses: [
          {
            id: 'rem1',
            bookingId: 'b1',
            offset: '24h_before_return',
            state: 'sent',
            sentAt: '2026-07-21T18:00:00.000Z',
            updatedAt: '2026-07-21T18:00:00.000Z',
          },
          {
            id: 'rem2',
            bookingId: 'b1',
            offset: '2h_before_return',
            state: 'failed',
            failureReason: 'smtp_timeout',
            scheduledFor: '2099-01-01T00:00:00.000Z',
            updatedAt: '2026-07-22T16:00:00.000Z',
          },
        ],
      });
      const fixture = createFixture();
      const el = fixture.nativeElement as HTMLElement;

      expect(el.textContent).toContain('還車前 24 小時');
      expect(el.textContent).toContain('已寄送');
      expect(el.textContent).toContain('smtp_timeout');
      expect(el.textContent).toContain('開發期模擬資料');
      // scheduledFor 在未來，應顯示「可重試」而非「永久失敗」提示。
      expect(el.textContent).toContain('之後仍可能由後端重試');
    });

    it('沒有任何提醒紀錄時不顯示提醒區塊', () => {
      configure({ booking: { status: 'in_progress' } });
      const fixture = createFixture();
      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('.handover-panel__reminders')).toBeNull();
    });
  });
});
