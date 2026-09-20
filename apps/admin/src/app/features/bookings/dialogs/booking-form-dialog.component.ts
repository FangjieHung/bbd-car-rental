import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  ContractPartySnapshot,
  ContractSnapshot,
  Member,
  MemberKind,
  PaymentMethod,
  PaymentPurpose,
  PriceBreakdown,
  RentalBooking,
  Vehicle,
  calculatePrice,
  defaultDepositForCategory,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { BookingStore } from '../../../stores/booking/booking.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { PricingStore } from '../../../stores/pricing/pricing.store';
import { AddOnStore } from '../../../stores/addon/addon.store';
import { ReminderStore } from '../../../stores/reminder/reminder.store';

/** 精靈回傳值：只回傳新建/編輯完成的訂單 id，呼叫端據此直接開工作區——
 * 精靈自己已經在 submit() 內完成建立會員/訂單/款項/合約/提醒的完整寫入序列，
 * 呼叫端不需要（也不應該）再重複呼叫 BookingStore.create()。 */
export interface BookingFormResult {
  bookingId: string;
}

/** 5 個步驟對應設計文件第 5 節「新增訂單 UX」：租期與車輛→承租人與駕駛資格→費用與付款→合約→確認建立。 */
export const BOOKING_WIZARD_STEPS = ['vehicle', 'renter', 'payment', 'contract', 'review'] as const;
export type BookingWizardStep = (typeof BOOKING_WIZARD_STEPS)[number];

interface PaymentDraft {
  method: PaymentMethod;
  amount: number;
  purpose: PaymentPurpose;
}

/** 本次寫入序列中，這一次嘗試「新建」的記錄 id——失敗時只補償清除這些，不動既有資料。 */
interface CreatedInThisAttempt {
  memberId?: string;
  bookingId?: string;
  paymentIds: string[];
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 「明確選了不加保」的專屬 sentinel 值，跟表單初始的空字串（'' = 還沒解決）分開，
 * 避免同一個空字串同時代表兩種不同意思——見 insuranceUnreconciled 的完整說明。
 * 宣告在 class 外面（而不是 class field）是因為 form 這個 class field 的初始化順序
 * 在其他 class field 之前，直接用 class field 會有「用到還沒 assign 的 this.XXX」的排序陷阱。
 */
const NO_INSURANCE_VALUE = 'none';

@Component({
  selector: 'app-booking-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  templateUrl: './booking-form-dialog.component.html',
  styleUrls: ['./booking-form-dialog.component.scss', '../../../app.scss'],
})
export class BookingFormDialogComponent {
  readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<BookingFormDialogComponent>);
  readonly data = inject<Partial<RentalBooking> | null>(MAT_DIALOG_DATA);
  readonly vehicleStore = inject(VehicleStore);
  readonly memberStore = inject(MemberStore);
  readonly bookingStore = inject(BookingStore);
  readonly paymentStore = inject(PaymentStore);
  readonly contractStore = inject(ContractStore);
  readonly pricingStore = inject(PricingStore);
  readonly addOnStore = inject(AddOnStore);
  private readonly reminderStore = inject(ReminderStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly steps = BOOKING_WIZARD_STEPS;
  /** 目前所在步驟索引（0-4）；測試與模板都直接讀寫這個 signal，不另外包一層方法。 */
  readonly step = signal(0);
  readonly error = signal('');
  readonly submitting = signal(false);

  /** 選到既有會員後鎖定其 id；未鎖定代表要新增會員，送出時才呼叫 MemberStore.create()。 */
  readonly lockedMemberId = signal<string | null>(null);

  /** 是否為編輯既有訂單（有 id）；區分「建立」與「核心欄位異動要不要生新合約版本」的判斷依據之一。 */
  protected readonly isEdit = !!this.data?.id;

  /** 本次精靈要排入的款項草稿；送出時才逐筆呼叫 PaymentStore.recordPayment()。 */
  readonly paymentDrafts = signal<PaymentDraft[]>([]);
  /** 每個配件本次要加購的數量，key 為 AddOn id。 */
  readonly addOnQty = signal<Record<string, number>>({});

  form = this.fb.group({
    vehicleId: [this.data?.vehicleId ?? '', Validators.required],
    startLocal: [
      this.data?.startTime ? toLocalInputValue(this.data.startTime) : '',
      Validators.required,
    ],
    endLocal: [
      this.data?.endTime ? toLocalInputValue(this.data.endTime) : '',
      Validators.required,
    ],
    pickupLocation: [this.data?.pickupLocation ?? '', Validators.required],
    returnLocation: [this.data?.returnLocation ?? '', Validators.required],

    name: ['', Validators.required],
    phone: ['', Validators.required],
    idNumber: [''],
    email: [''],
    kind: ['local' as MemberKind, Validators.required],
    nationality: [''],

    insurancePlanId: [NO_INSURANCE_VALUE],
    depositRequired: [this.data?.depositRequired ?? 0, [Validators.required, Validators.min(0)]],

    paymentMethod: ['cash' as PaymentMethod],
    paymentAmount: [0],
    paymentPurpose: ['deposit' as PaymentPurpose],

    signNow: [false],
    internalNote: [''],
  });

  private readonly nameInput = toSignal(this.form.controls.name.valueChanges, {
    initialValue: this.form.controls.name.value,
  });
  protected readonly vehicleIdValue = toSignal(this.form.controls.vehicleId.valueChanges, {
    initialValue: this.form.controls.vehicleId.value,
  });
  protected readonly startLocalValue = toSignal(this.form.controls.startLocal.valueChanges, {
    initialValue: this.form.controls.startLocal.value,
  });
  protected readonly endLocalValue = toSignal(this.form.controls.endLocal.valueChanges, {
    initialValue: this.form.controls.endLocal.value,
  });
  protected readonly kindValue = toSignal(this.form.controls.kind.valueChanges, {
    initialValue: this.form.controls.kind.value,
  });
  protected readonly insurancePlanIdValue = toSignal(this.form.controls.insurancePlanId.valueChanges, {
    initialValue: this.form.controls.insurancePlanId.value,
  });
  protected readonly depositRequiredValue = toSignal(this.form.controls.depositRequired.valueChanges, {
    initialValue: this.form.controls.depositRequired.value,
  });
  protected readonly signNowValue = toSignal(this.form.controls.signNow.valueChanges, {
    initialValue: this.form.controls.signNow.value,
  });
  protected readonly emailValue = toSignal(this.form.controls.email.valueChanges, {
    initialValue: this.form.controls.email.value,
  });

  readonly memberSuggestions = computed(() => {
    if (this.lockedMemberId()) return [];
    const query = this.nameInput().trim().toLowerCase();
    if (!query) return [];
    return this.memberStore
      .members()
      .filter((m) => m.name.toLowerCase().includes(query) || m.phone.toLowerCase().includes(query));
  });

  protected readonly isForeignVisitor = computed(() => this.kindValue() === 'foreign_visitor');
  protected readonly identityNumberLabel = computed(
    () => this.t.member.identityNumberLabel[this.kindValue()],
  );

  readonly selectedVehicle = computed<Vehicle | undefined>(() =>
    this.vehicleStore.vehicles().find((v) => v.id === this.vehicleIdValue()),
  );

  /** 再次檢查車輛可用性（送出前也會重跑一次同樣的檢查，見 submit()）。 */
  readonly conflicts = computed<RentalBooking[]>(() => {
    const vehicleId = this.vehicleIdValue();
    const start = this.startLocalValue();
    const end = this.endLocalValue();
    if (!vehicleId || !start || !end) return [];
    return this.bookingStore.findConflicts(
      vehicleId,
      new Date(start).toISOString(),
      new Date(end).toISOString(),
      this.data?.id,
    );
  });

  readonly quote = computed<PriceBreakdown | undefined>(() => {
    const vehicle = this.selectedVehicle();
    const start = this.startLocalValue();
    const end = this.endLocalValue();
    if (!vehicle || !start || !end) return undefined;
    const plan = this.pricingStore.plans().find((p) => p.appliesToCategory === vehicle.category);
    const calendar = this.pricingStore.calendar();
    if (!plan || !calendar) return undefined;
    const addOns = this.addOnStore.addOns().map((a) => ({ addOn: a, qty: this.addOnQty()[a.id] ?? 0 }));
    const insurancePlanId = this.insurancePlanIdValue();
    // '' 代表「還沒選」、NO_INSURANCE_VALUE 代表「明確選了不加保」，兩者都不對應任何真實方案，
    // 這裡明確排除掉，不要依賴 .find() 對 sentinel 字串剛好找不到東西這種巧合。
    const insurancePlan =
      insurancePlanId && insurancePlanId !== this.NO_INSURANCE_VALUE
        ? vehicle.insurancePlans?.find((p) => p.id === insurancePlanId)
        : undefined;
    try {
      return calculatePrice({
        plan,
        calendar,
        startDate: start.slice(0, 10),
        endDate: end.slice(0, 10),
        addOns,
        ...(insurancePlan ? { insurancePlan } : {}),
      });
    } catch {
      return undefined;
    }
  });

  /**
   * 訂金上限：小客車為報價總額 30%、機車／電動機車為 0（設計文件第 4.2 節，與 Task 3
   * normalizeRentalBooking 修正版共用同一套 defaultDepositForCategory 規則，不各自重算）。
   * 新增訂單時同時當作預設值（見下方 effect）；編輯既有訂單時只當上限，不覆蓋已載入的值。
   */
  readonly depositCap = computed(() => defaultDepositForCategory(this.selectedVehicle()?.category, this.quote()?.total ?? 0));
  readonly depositExceedsCap = computed(() => this.depositRequiredValue() > this.depositCap());

  /**
   * 根本問題（review 第三輪指出）：insurancePlanId 的空字串曾經同時代表三種不同意思——
   * 「表單剛建構、什麼都還沒發生」「hydration 反推不出方案」「使用者明確選了不加保」——
   * 三者疊在同一個值上，導致「使用者能不能真的選不加保」跟「反推失敗要不要擋」永遠分不開。
   * 修法是讓「明確選不加保」有自己專屬、不會跟空字串搞混的值：NO_INSURANCE_VALUE。
   * 這樣空字串就只剩一個意思——「還沒解決」，其餘判斷都能單純看目前的值是什麼，
   * 不必再猜測「這個空字串是不是使用者剛選的」（不用碰 FormControl.dirty 或攔截
   * mat-select 的使用者互動事件，兩者都有「使用者重選跟目前值一樣的選項時到底會不會
   * 觸發事件」這種依賴函式庫內部實作、難以放心保證的灰色地帶）。
   */
  readonly NO_INSURANCE_VALUE = NO_INSURANCE_VALUE;

  /**
   * 編輯既有訂單時，原本的報價快照裡有保險（insuranceSubtotal > 0），但目前還沒有任何
   * 「這筆訂單現在該算哪個保險方案」的確定答案——包含 hydratePricingSelectionsFromExisting
   * 反推不出方案、也還沒有人手動選過任何選項（不論是選某個方案、還是明確選「不加保」）。
   * 這種「還沒解決」的狀態才需要擋住送出，避免 submit() 用一個尚未確認的空白狀態悄悄把
   * insuranceSubtotal 重算成 0（這是這個 wizard 原本要修的 bug）。
   *
   * 例外：如果車輛「目前」根本沒有任何保險方案可選（vehicle.insurancePlans 是空的或不存在），
   * 那麼不管原本的 insuranceSubtotal 是多少，都沒有任何方案是這筆訂單「可能適用、只是還沒被
   * 選到」的——保險本身在這台車上已經不存在了，不是「反推失敗」，視為自動解決成「不加保」，
   * 不擋送出、也不需要操作人員對著一個只有「不加保」一個選項的下拉選單做毫無意義的確認。
   *
   * 使用者只要選了任何一個值（某個方案的真實 id，或代表「不加保」的 NO_INSURANCE_VALUE），
   * insurancePlanIdValue() 就會是非空字串，這個旗標自然解除——不需要另外追蹤「有沒有被碰過」。
   */
  readonly insuranceUnreconciled = computed(() => {
    if (!this.isEdit) return false;
    const original = this.data?.priceBreakdown;
    if (!original || original.insuranceSubtotal <= 0) return false;
    const vehicle = this.selectedVehicle();
    if (!vehicle?.insurancePlans || vehicle.insurancePlans.length === 0) return false;
    return !this.insurancePlanIdValue();
  });

  /**
   * 編輯既有訂單時，這筆訂單「目前實際」有沒有已簽署的合約版本——不是使用者這次有沒有勾
   * 「現場完成簽署」。新增訂單模式下沒有既有合約可查，只能看 signNow 這個「打算簽」的意圖。
   * 待辦清單同時檢查這兩者（見 incompleteItems），避免編輯一筆早就簽好的訂單時，
   * 只因為這次沒重新勾 signNow checkbox 就誤報「合約尚未簽署」。
   */
  readonly currentContractSigned = computed(() => {
    const bookingId = this.data?.id;
    if (!this.isEdit || !bookingId) return false;
    return this.contractStore.latestFor(bookingId)?.status === 'signed';
  });

  readonly incompleteItems = computed<string[]>(() => {
    const items: string[] = [];
    if (!this.emailValue()) items.push(this.t.bookingForm.incomplete.missingEmail);

    const deposit = this.depositRequiredValue();
    const depositCollected = this.paymentDrafts()
      .filter((p) => p.purpose === 'deposit')
      .reduce((sum, p) => sum + p.amount, 0);
    if (deposit > 0 && depositCollected < deposit) {
      items.push(this.t.bookingForm.incomplete.depositNotCollected);
    }

    if (!this.signNowValue() && !this.currentContractSigned()) {
      items.push(this.t.bookingForm.incomplete.contractNotSigned);
    }

    const total = this.quote()?.total ?? 0;
    const totalCollected = this.paymentDrafts().reduce((sum, p) => sum + p.amount, 0);
    if (total > 0 && totalCollected < total) {
      items.push(this.t.bookingForm.incomplete.balanceNotCollected);
    }
    return items;
  });

  constructor() {
    // 編輯既有訂單／快速建單預填時，預設鎖定原本的會員；使用者仍可點「換一位」重新選擇。
    const existingMemberId = this.data?.memberId;
    if (existingMemberId) {
      const member = this.memberStore.members().find((m) => m.id === existingMemberId);
      if (member) this.lockToMember(member);
    }

    // 編輯既有訂單時，把原本報價快照裡的加購配件／保險方案回填進精靈的狀態——
    // quote() 這個 computed 每次都是從目前的 insurancePlanId/addOnQty 現算，若不回填，
    // 只是想改個取車地點這種「無關的欄位」也會因為 addOnQty/insurancePlanId 是空的，
    // 把 submit() 寫回訂單的 priceBreakdown 悄悄改成「沒有保險、沒有配件」。
    if (this.isEdit && this.data?.priceBreakdown) {
      this.hydratePricingSelectionsFromExisting(this.data.priceBreakdown, this.data.vehicleId);
    }

    // 只有「新增訂單」才用車型上限自動預設訂金；編輯既有訂單時保留原本載入的值，
    // 使用者手動改過（control 變 dirty）之後也不再被蓋回去。
    // 用 FormGroup.valueChanges 訂閱而不是 Angular effect()：effect() 要等下一輪變更
    // 偵測才會真的執行，在沒有呼叫 detectChanges() 的單元測試裡不會同步反映；
    // valueChanges 在 patchValue() 當下就同步觸發，讀值時序更可預期。
    if (!this.isEdit) {
      this.form.valueChanges.subscribe(() => {
        if (!this.form.controls.depositRequired.dirty) {
          const cap = this.depositCap();
          // 不加 { emitEvent: false }：depositRequiredValue 這個 toSignal 是訂閱
          // depositRequired 自己的 valueChanges，抑制事件會讓它讀不到剛寫入的新值。
          // 用上面的「值相同就不再設」擋掉遞迴（setValue 觸發的第二輪會發現已經相等而跳過）。
          if (this.form.controls.depositRequired.value !== cap) {
            this.form.controls.depositRequired.setValue(cap);
          }
        }
      });
    }
  }

  /**
   * 編輯既有訂單時，從原本存下的報價快照回填加購配件數量與保險方案，避免無關欄位的編輯
   * 把報價悄悄改成「沒有保險、沒有配件」（見建構子的呼叫處註解）。
   * - 加購配件：PriceBreakdown.addOnLines 本身就存了 addOnId/qty，直接精確回填。
   * - 保險方案：PriceBreakdown 只存 insuranceSubtotal 這個金額，沒有存是選了哪個
   *   InsurancePlan（這是既有 domain model 的限制，libs/domain 不在本任務檔案清單內，
   *   不在這裡順手改動模型）。用「同樣天數 × 方案每日價 = 原本的 insuranceSubtotal」
   *   反推最接近的方案——如果同一台車有兩個保險方案剛好同價就可能反推錯，是目前
   *   已知且能接受的近似（與 Task 9 對「目前生效版本」的近似判斷同一類型的限制）。
   *   反推不出方案、但車輛目前確實有其他保險方案可選時，明確把值設回空字串
   *   （跟表單預設的 NO_INSURANCE_VALUE 分開），標記成「還沒解決」，讓
   *   insuranceUnreconciled 擋住送出、要求操作人員自己確認或重選——不能放任
   *   quote() 用預設的「不加保」悄悄覆寫掉原本的保險金額。車輛目前完全沒有任何保險方案
   *   可選時則維持預設值，直接視為自動解決（見 insuranceUnreconciled 的說明）。
   */
  private hydratePricingSelectionsFromExisting(original: PriceBreakdown, vehicleId?: string): void {
    if (original.addOnLines.length > 0) {
      const addOnQtyMap: Record<string, number> = {};
      for (const line of original.addOnLines) addOnQtyMap[line.addOnId] = line.qty;
      this.addOnQty.set(addOnQtyMap);
    }

    if (original.insuranceSubtotal > 0 && vehicleId) {
      const vehicle = this.vehicleStore.vehicles().find((v) => v.id === vehicleId);
      const days = original.dailyLines.length;
      const matchedPlan = vehicle?.insurancePlans?.find(
        (p) => p.dailyPriceFrom * days === original.insuranceSubtotal,
      );
      if (matchedPlan) {
        this.form.controls.insurancePlanId.setValue(matchedPlan.id);
      } else if (vehicle?.insurancePlans && vehicle.insurancePlans.length > 0) {
        this.form.controls.insurancePlanId.setValue('');
      }
    }
  }

  private lockToMember(member: Member): void {
    this.lockedMemberId.set(member.id);
    this.form.patchValue({
      name: member.name,
      phone: member.phone,
      idNumber: member.idNumber ?? '',
      kind: member.kind,
      nationality: member.nationality ?? '',
      email: member.email ?? '',
    });
    this.form.controls.name.disable();
    this.form.controls.phone.disable();
    this.form.controls.idNumber.disable();
    this.form.controls.kind.disable();
    this.form.controls.nationality.disable();
    this.form.controls.email.disable();
  }

  onMemberSelected(event: MatAutocompleteSelectedEvent): void {
    const member = this.memberStore.members().find((m) => m.id === event.option.value);
    if (!member) return;
    this.lockToMember(member);
  }

  changeMember(): void {
    this.lockedMemberId.set(null);
    this.form.controls.name.enable();
    this.form.controls.phone.enable();
    this.form.controls.idNumber.enable();
    this.form.controls.kind.enable();
    this.form.controls.nationality.enable();
    this.form.controls.email.enable();
    this.form.patchValue({ name: '', phone: '', idNumber: '', nationality: '', email: '' });
  }

  addOnQtyFor(id: string): number {
    return this.addOnQty()[id] ?? 0;
  }

  setAddOnQty(id: string, qty: number): void {
    const safe = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0;
    this.addOnQty.update((cur) => ({ ...cur, [id]: safe }));
  }

  addPaymentDraft(): void {
    const amount = this.form.controls.paymentAmount.value;
    if (!amount || amount <= 0) return;
    this.paymentDrafts.update((drafts) => [
      ...drafts,
      {
        method: this.form.controls.paymentMethod.value,
        amount,
        purpose: this.form.controls.paymentPurpose.value,
      },
    ]);
    this.form.controls.paymentAmount.setValue(0);
  }

  removePaymentDraft(index: number): void {
    this.paymentDrafts.update((drafts) => drafts.filter((_, i) => i !== index));
  }

  nextStep(): void {
    this.step.update((s) => Math.min(s + 1, this.steps.length - 1));
  }

  prevStep(): void {
    this.step.update((s) => Math.max(s - 1, 0));
  }

  /** 各步驟是否可以往下一步——只用來控制 UI 上 Next 按鈕是否 disabled，不阻擋直接呼叫 nextStep()。 */
  canProceed(stepIndex: number): boolean {
    const v = this.form.getRawValue();
    switch (this.steps[stepIndex]) {
      case 'vehicle':
        return (
          !!v.vehicleId &&
          !!v.startLocal &&
          !!v.endLocal &&
          !!v.pickupLocation &&
          !!v.returnLocation &&
          this.conflicts().length === 0 &&
          !!this.quote()
        );
      case 'renter':
        return !!v.name && !!v.phone && !!v.kind && (!this.isForeignVisitor() || !!v.nationality);
      case 'payment':
        return !this.depositExceedsCap() && !this.insuranceUnreconciled();
      default:
        return true;
    }
  }

  private buildContractSnapshot(
    booking: Pick<RentalBooking, 'id' | 'vehicleId'>,
    vehicle: Vehicle,
    quote: PriceBreakdown,
    memberId: string,
    v: ReturnType<typeof this.form.getRawValue>,
  ): ContractSnapshot {
    const party: ContractPartySnapshot = {
      memberId,
      name: v.name,
      phone: v.phone,
      ...(v.email ? { email: v.email } : {}),
      ...(v.idNumber ? { idNumber: v.idNumber } : {}),
    };
    return {
      renter: party,
      // 這個精靈目前不區分「承租人」與「實際駕駛人」，兩者共用同一份快照；
      // 若要支援駕駛人非承租本人，需要在「承租人與駕駛資格」步驟另外收集一組駕駛人欄位（未來任務）。
      driver: party,
      vehicle: {
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        category: vehicle.category,
        ...(vehicle.fuelPolicy ? { fuelPolicy: vehicle.fuelPolicy } : {}),
        ...(vehicle.mileagePolicy ? { mileagePolicy: vehicle.mileagePolicy } : {}),
        ...(vehicle.energyType ? { energyType: vehicle.energyType } : {}),
      },
      rentalStartTime: new Date(v.startLocal).toISOString(),
      rentalEndTime: new Date(v.endLocal).toISOString(),
      pickupLocation: v.pickupLocation,
      returnLocation: v.returnLocation,
      depositRequired: v.depositRequired,
      pricing: quote,
      disclosedRules: {
        // CancellationContractKind 只有 passenger_car/scooter 兩種；ev 目前比照 scooter
        // 歸類（機車/電動機車皆尚未訂出完整的取消退費級距表，見 quote-cancellation.ts 註解）。
        cancellationContractKind: vehicle.category === 'car' ? 'passenger_car' : 'scooter',
        cancellationRuleVersion: 'v1',
      },
      ...(v.internalNote ? { internalNote: v.internalNote } : {}),
    };
  }

  /**
   * 送出前的完整原子寫入序列（Step 3）：
   * 1. 再次驗證車輛可用性 → 2. 取得或新建會員 → 3. 建立/更新訂單（含報價快照與訂金）
   * → 4. 附加本次排入的款項 → 5. 合約（核心欄位有異動才產生新版本，否則沿用最新版本）
   * → 6. 有 Email 才排程還車提醒 → 7. 關閉並回傳訂單 id。
   * local repository 沒有真正的 transaction，任何一步失敗都會補償清除「這次嘗試」新建的記錄
   * （已存在的資料，例如編輯模式下被 updateBooking 就地更新的欄位，無法回復——見 compensate() 註解）。
   */
  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.error.set('');

    const vehicle = this.selectedVehicle();
    const quote = this.quote();
    if (!vehicle || !quote) {
      this.error.set(this.t.bookingForm.quoteUnavailable);
      return;
    }

    // 保險反推失敗就直接擋在這裡，在任何寫入之前就中止——絕對不能讓下面的原子序列拿著
    // 「沒選保險」的 quote 去覆寫這筆訂單既有的 priceBreakdown（見 insuranceUnreconciled 註解）。
    if (this.insuranceUnreconciled()) {
      this.error.set(this.t.bookingForm.insuranceUnreconciled);
      return;
    }

    this.submitting.set(true);
    const v = this.form.getRawValue();
    const startIso = new Date(v.startLocal).toISOString();
    const endIso = new Date(v.endLocal).toISOString();
    const bookingId = this.data?.id;
    const created: CreatedInThisAttempt = { paymentIds: [] };

    try {
      // 1. 再次驗證車輛可用性——避免精靈填寫期間，同一台車被別筆訂單搶先鎖定。
      const conflicts = this.bookingStore.findConflicts(v.vehicleId, startIso, endIso, bookingId);
      if (conflicts.length > 0) {
        throw new Error(`${this.t.booking.conflict} ${conflicts.map((c) => c.id).join(', ')}`);
      }

      // 2. 取得或新建會員。
      let memberId = this.lockedMemberId();
      if (!memberId) {
        const member = this.memberStore.create({
          name: v.name,
          phone: v.phone,
          kind: v.kind,
          ...(v.idNumber ? { idNumber: v.idNumber } : {}),
          ...(v.email ? { email: v.email } : {}),
          ...(v.kind !== 'local' && v.nationality ? { nationality: v.nationality } : {}),
        });
        memberId = member.id;
        created.memberId = memberId;
      }

      // 3. 建立（或更新）reserved 訂單，帶上報價快照與訂金。
      const bookingPatch = {
        vehicleId: v.vehicleId,
        memberId,
        startTime: startIso,
        endTime: endIso,
        pickupLocation: v.pickupLocation,
        returnLocation: v.returnLocation,
        priceBreakdown: quote,
        depositRequired: v.depositRequired,
      };
      let booking: RentalBooking;
      if (bookingId) {
        this.bookingStore.updateBooking(bookingId, bookingPatch);
        const updated = this.bookingStore.bookings().find((b) => b.id === bookingId);
        if (!updated) throw new Error(`not found: ${bookingId}`);
        booking = updated;
      } else {
        booking = this.bookingStore.create(bookingPatch);
        created.bookingId = booking.id;
      }

      // 4. 附加本次排入的款項紀錄。
      for (const draft of this.paymentDrafts()) {
        const payment = this.paymentStore.recordPayment({
          bookingId: booking.id,
          amount: draft.amount,
          method: draft.method,
          purpose: draft.purpose,
          status: 'confirmed',
          receivedAt: new Date().toISOString(),
          handledBy: this.t.layout.adminUser,
        });
        created.paymentIds.push(payment.id);
      }

      // 5. 合約：核心欄位（承租人/駕駛人、車輛、租期、地點、訂金、報價、揭露規則）有異動
      // 才會由 reviseIfChanged 產生新版本；沒有既有版本時等同建立第 1 版草稿。
      const snapshot = this.buildContractSnapshot(booking, vehicle, quote, memberId, v);
      const contractVersion = this.contractStore.reviseIfChanged(booking.id, snapshot);
      if (v.signNow && contractVersion.status === 'draft') {
        this.contractStore.sign(contractVersion.id, ['mock-signature-pad']);
      }

      // 6. 排程（或重新排程）還車提醒——一律呼叫，讓沒有 Email 的訂單也留下 missing_email 狀態
      // 紀錄（開發期 mock；missing_email 本身是正常結果，不是錯誤）。ReminderStore 內部會視需要
      // 先取消舊排程再依（可能已編輯過的）還車時間重排，建立與編輯共用同一段程式碼。
      await this.reminderStore.scheduleForBooking({
        bookingId: booking.id,
        endTime: endIso,
        ...(v.email ? { email: v.email } : {}),
      });

      // 7. 關閉並回傳訂單 id，呼叫端直接開工作區接續補資料。
      const result: BookingFormResult = { bookingId: booking.id };
      this.ref.close(result);
    } catch (e) {
      this.compensate(created);
      this.error.set((e as Error).message);
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * 只補償清除「這次嘗試」新建的記錄：款項作廢（沒有硬刪除，作廢本身就是正確的補償動作，
   * 保留稽核軌跡）、新建的訂單刪除、新建的會員刪除。編輯既有訂單時 booking 不在補償範圍——
   * updateBooking() 已經就地覆寫欄位，BookingStore 沒有「復原成前一版」的方法，
   * local repository 也沒有真正的 transaction，這是本任務brief已知並接受的限制。
   */
  private compensate(created: CreatedInThisAttempt): void {
    for (const id of created.paymentIds) {
      this.paymentStore.voidPayment(id);
    }
    if (created.bookingId) {
      this.bookingStore.remove(created.bookingId);
    }
    if (created.memberId) {
      this.memberStore.remove(created.memberId);
    }
  }
}
