import { DestroyRef, Signal, computed, effect, isSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, map } from 'rxjs';
import {
  Member,
  MemberKind,
  PaymentMethod,
  PaymentPurpose,
  PriceBreakdown,
  RentalBooking,
  Vehicle,
} from '../../../core/models';
import type { OrderFormData } from './order-form-data';

/**
 * 「訂單表單」積木層（見 docs/adr/0001）：型別化的 FormGroup 定義、初始值、欄位連動。
 * 不依賴 stepper、不依賴 admin 專屬 store——需要的參考資料一律透過 `OrderFormData`（ORDER_FORM_DATA）取得，
 * 讓 `/orders/new` 的精靈與之後訂單詳情頁的「編輯訂單」共用同一份表單定義。
 */

/**
 * 「明確選了不加保」的專屬值，與空字串（'' = 還沒解決，只會出現在編輯既有訂單、保險方案反推失敗時）分開。
 * 沿用舊建單 dialog 的語意，完整說明見 `isInsuranceUnreconciled`。
 */
export const NO_INSURANCE_VALUE = 'none';

/** 建立訂單時一併排入的款項草稿；送出時才逐筆寫入款項紀錄。 */
export interface PaymentDraft {
  method: PaymentMethod;
  amount: number;
  purpose: PaymentPurpose;
}

/**
 * 一列款項草稿在表單裡的輸入值：金額在使用者填寫前允許 `null`（畫面顯示空白，見
 * `addPaymentDraft` 「之後預設」的規則），不預先塞一個看似合理、其實是亂猜的 0。
 */
export interface PaymentDraftRowInput {
  method: PaymentMethod;
  amount: number | null;
  purpose: PaymentPurpose;
}

/** 金額必須是大於 0 的正數；`null`、0 或負數一律視為無效輸入（沿用付款分頁 positiveAmountValidator 同一條規則）。 */
function positiveAmountValidator(control: { value: unknown }) {
  const value = control.value;
  return typeof value === 'number' && value > 0 ? null : { nonPositive: true };
}

function createPaymentDraftGroup(row: PaymentDraftRowInput) {
  return new FormGroup({
    method: new FormControl<PaymentMethod>(row.method, { nonNullable: true }),
    amount: new FormControl<number | null>(row.amount, { validators: [Validators.required, positiveAmountValidator] }),
    purpose: new FormControl<PaymentPurpose>(row.purpose, { nonNullable: true }),
  });
}

export type PaymentDraftGroup = ReturnType<typeof createPaymentDraftGroup>;

/**
 * 「列表就是紀錄」：每一列都是可直接編輯的表單群組，畫面上看到的值就是送出時會寫入的值，
 * 不再有獨立於列表之外、需要另外按一次「新增」才會被記住的輸入列——那正是原本會把打好的
 * 金額默默丟掉的 bug 來源。`removePaymentDraft`／`setPaymentDrafts` 同理直接操作這個 FormArray。
 */
export function addPaymentDraft(form: OrderForm, row: PaymentDraftRowInput): void {
  form.controls.payments.controls.drafts.push(createPaymentDraftGroup(row));
}

export function removePaymentDraft(form: OrderForm, index: number): void {
  form.controls.payments.controls.drafts.removeAt(index);
}

/** 整批帶入「已完整」的款項草稿（金額皆為正數）；供測試與程式化建立表單使用。 */
export function setPaymentDrafts(form: OrderForm, drafts: PaymentDraft[]): void {
  const array = form.controls.payments.controls.drafts;
  array.clear();
  for (const draft of drafts) array.push(createPaymentDraftGroup(draft));
}

/** `createOrderForm` 的初始值；時間一律是 ISO 字串，表單內部再轉成 datetime-local 格式。 */
export interface OrderFormInitial {
  vehicleId?: string;
  startTime?: string;
  endTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  /** 提供時直接鎖定為既有會員（承租人欄位帶入並停用），送出時沿用該會員、不新建。 */
  member?: Member;
  /** 保險方案 id；`NO_INSURANCE_VALUE` 為明確不加保，`''` 為「還沒解決」（僅編輯模式反推失敗時使用）。 */
  insurancePlanId?: string;
  /** 每個加購項目的數量，key 為 AddOn id。 */
  addOnQty?: Record<string, number>;
  depositRequired?: number;
  internalNote?: string;
}

/** ISO 時間 → `<input type="datetime-local">` 需要的本地時間字串（YYYY-MM-DDTHH:mm）。 */
export function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function text(value = '', required = false): FormControl<string> {
  return new FormControl(value, { nonNullable: true, validators: required ? Validators.required : [] });
}

/**
 * 建立訂單表單。分成五個子 group，對應可獨立擺放的表單區塊：
 * - `rental`：車輛、租期、取／還車據點（租期與車輛區塊）
 * - `renter`：承租人；`memberId` 非 null 代表已鎖定既有會員（承租人區塊）
 * - `pricing`：保險、加購數量、訂金（費用區塊）
 * - `payments`：建立時一併排入的款項草稿，列表本身就是紀錄（僅建立訂單使用）
 * - `contract`：內部備註
 */
export function createOrderForm(initial: OrderFormInitial = {}) {
  const form = new FormGroup({
    rental: new FormGroup({
      vehicleId: text(initial.vehicleId, true),
      startLocal: text(initial.startTime ? toLocalInputValue(initial.startTime) : '', true),
      endLocal: text(initial.endTime ? toLocalInputValue(initial.endTime) : '', true),
      pickupLocation: text(initial.pickupLocation, true),
      returnLocation: text(initial.returnLocation, true),
    }),
    renter: new FormGroup({
      memberId: new FormControl<string | null>(null),
      name: text('', true),
      phone: text('', true),
      idNumber: text(),
      email: text(),
      kind: new FormControl<MemberKind>('local', { nonNullable: true, validators: Validators.required }),
      nationality: text(),
    }),
    pricing: new FormGroup({
      insurancePlanId: text(initial.insurancePlanId ?? NO_INSURANCE_VALUE),
      addOnQty: new FormControl<Record<string, number>>(initial.addOnQty ?? {}, { nonNullable: true }),
      depositRequired: new FormControl(initial.depositRequired ?? 0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
    }),
    payments: new FormGroup({
      drafts: new FormArray<PaymentDraftGroup>([]),
    }),
    contract: new FormGroup({
      internalNote: text(initial.internalNote),
    }),
  });
  if (initial.member) lockRenterToMember(form, initial.member);
  return form;
}

export type OrderForm = ReturnType<typeof createOrderForm>;
export type OrderFormValue = ReturnType<OrderForm['getRawValue']>;

const LOCKABLE_RENTER_FIELDS = ['name', 'phone', 'idNumber', 'kind', 'nationality', 'email'] as const;

/** 選到既有會員：帶入資料並停用承租人欄位，送出時沿用這位會員。 */
export function lockRenterToMember(form: OrderForm, member: Member): void {
  const renter = form.controls.renter;
  renter.patchValue({
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    idNumber: member.idNumber ?? '',
    kind: member.kind,
    nationality: member.nationality ?? '',
    email: member.email ?? '',
  });
  for (const key of LOCKABLE_RENTER_FIELDS) renter.controls[key].disable();
}

/** 「換一位」：解除鎖定並清空欄位，回到新會員狀態（承租人類型保留）。 */
export function unlockRenter(form: OrderForm): void {
  const renter = form.controls.renter;
  for (const key of LOCKABLE_RENTER_FIELDS) renter.controls[key].enable();
  renter.patchValue({ memberId: null, name: '', phone: '', idNumber: '', nationality: '', email: '' });
}

/**
 * 從既有訂單帶入初始值（編輯訂單用）。沿用舊建單 dialog 編輯模式的 hydration：
 * - 加購項目：`priceBreakdown.addOnLines` 本身就存了 addOnId/qty，精確回填。
 * - 保險方案：`PriceBreakdown` 只存 insuranceSubtotal 金額，用「天數 × 方案每日價 = 原保險小計」反推。
 *   反推不出方案、但車輛目前確實有保險方案可選時，設為 `''`（還沒解決），讓 `isInsuranceUnreconciled`
 *   擋住送出、要求重新選擇，避免報價悄悄把原本的保險金額歸零；車輛完全沒有保險方案時維持「不加保」。
 */
export function orderFormInitialFromBooking(
  booking: RentalBooking,
  refs: { vehicle?: Vehicle; member?: Member } = {},
): OrderFormInitial {
  const initial: OrderFormInitial = {
    vehicleId: booking.vehicleId,
    startTime: booking.startTime,
    endTime: booking.endTime,
    pickupLocation: booking.pickupLocation,
    returnLocation: booking.returnLocation,
    depositRequired: booking.depositRequired,
    ...(refs.member ? { member: refs.member } : {}),
  };
  const original = booking.priceBreakdown;
  if (!original) return initial;

  if (original.addOnLines.length > 0) {
    const addOnQty: Record<string, number> = {};
    for (const line of original.addOnLines) addOnQty[line.addOnId] = line.qty;
    initial.addOnQty = addOnQty;
  }

  if (original.insuranceSubtotal > 0) {
    const plans = refs.vehicle?.insurancePlans ?? [];
    const days = original.dailyLines.length;
    const matched = plans.find((p) => p.dailyPriceFrom * days === original.insuranceSubtotal);
    if (matched) initial.insurancePlanId = matched.id;
    else if (plans.length > 0) initial.insurancePlanId = '';
  }
  return initial;
}

/**
 * 表單目前完整值（含停用欄位）的 signal，任何欄位變動（含 disable/enable）都會更新。
 * - 傳入固定的 FormGroup：立即訂閱，值同步更新（頁面層使用）。
 * - 傳入 signal（例如區塊元件的 `form` input）：於變更偵測時訂閱，input 換成另一個 FormGroup 時自動改訂。
 * 需在 injection context 內呼叫。
 */
export function orderFormValue(form: OrderForm | Signal<OrderForm>): Signal<OrderFormValue> {
  if (!isSignal(form)) {
    return toSignal(form.valueChanges.pipe(map(() => form.getRawValue())), {
      initialValue: form.getRawValue(),
    });
  }
  const version = signal(0);
  effect((onCleanup) => {
    const sub = form().valueChanges.subscribe(() => version.update((v) => v + 1));
    onCleanup(() => sub.unsubscribe());
  });
  return computed(() => {
    version();
    return form().getRawValue();
  });
}

/** 依表單值找出所選車輛。 */
export function selectedVehicleOf(value: OrderFormValue, data: OrderFormData): Vehicle | undefined {
  return data.vehicles().find((v) => v.id === value.rental.vehicleId);
}

/** 依表單值試算報價；車輛或租期未齊、或該車型沒有可用定價方案時回傳 undefined。 */
export function computeOrderQuote(value: OrderFormValue, data: OrderFormData): PriceBreakdown | undefined {
  const vehicle = selectedVehicleOf(value, data);
  const { startLocal, endLocal } = value.rental;
  if (!vehicle || !startLocal || !endLocal) return undefined;
  const planId = value.pricing.insurancePlanId;
  // '' 與 NO_INSURANCE_VALUE 都不對應真實方案，明確排除，不依賴 find() 剛好找不到。
  const insurancePlan =
    planId && planId !== NO_INSURANCE_VALUE ? vehicle.insurancePlans?.find((p) => p.id === planId) : undefined;
  return data.quote({
    vehicle,
    startDate: startLocal.slice(0, 10),
    endDate: endLocal.slice(0, 10),
    addOnQty: value.pricing.addOnQty,
    ...(insurancePlan ? { insurancePlan } : {}),
  });
}

/**
 * 編輯既有訂單時，原報價含保險、但目前保險欄位仍是「還沒解決」（''）——此時必須擋住送出，
 * 避免用尚未確認的狀態把 insuranceSubtotal 重算成 0。車輛目前完全沒有保險方案時視為自動解決。
 * 新增訂單（沒有原報價）永遠為 false。
 */
export function isInsuranceUnreconciled(
  originalPriceBreakdown: PriceBreakdown | undefined,
  vehicle: Vehicle | undefined,
  insurancePlanId: string,
): boolean {
  if (!originalPriceBreakdown || originalPriceBreakdown.insuranceSubtotal <= 0) return false;
  if (!vehicle?.insurancePlans || vehicle.insurancePlans.length === 0) return false;
  return !insurancePlanId;
}

export interface OrderFormBehaviorOptions {
  /** 新增訂單：訂金未被手動改過前，自動跟隨車型上限（小客車報價 30%、機車 0）。編輯訂單請關閉。 */
  autoDeposit: boolean;
  /** 提供時隨其銷毀自動取消訂閱。 */
  destroyRef?: DestroyRef;
}

/**
 * 欄位連動（沿用舊建單 dialog）：
 * - 選車後，取車據點若未被手動改過，預帶該車所在據點（沒有據點資料時不覆蓋）。
 * - 還車據點若未被手動改過，跟隨取車據點。
 * - `autoDeposit`：訂金未被手動改過前，跟隨訂金上限。
 * 連線當下也會先套用一次（例如預填了車輛但取車據點空白）。回傳的 Subscription 可由呼叫端取消，
 * 或傳入 `destroyRef` 自動取消。
 */
export function connectOrderFormBehaviors(
  form: OrderForm,
  data: OrderFormData,
  options: OrderFormBehaviorOptions,
): Subscription {
  const { vehicleId, pickupLocation, returnLocation } = form.controls.rental.controls;
  const deposit = form.controls.pricing.controls.depositRequired;

  const applyVehicleBranch = () => {
    if (pickupLocation.dirty) return;
    const branchId = selectedVehicleOf(form.getRawValue(), data)?.location;
    if (branchId && pickupLocation.value !== branchId) pickupLocation.setValue(branchId);
  };
  const followPickup = (pickup: string) => {
    if (returnLocation.dirty) return;
    if (returnLocation.value !== pickup) returnLocation.setValue(pickup);
  };
  const syncDeposit = () => {
    if (!options.autoDeposit || deposit.dirty) return;
    const value = form.getRawValue();
    const cap = data.depositCap(selectedVehicleOf(value, data), computeOrderQuote(value, data)?.total ?? 0);
    // 值相同就不再設，擋掉 setValue 觸發的遞迴。
    if (deposit.value !== cap) deposit.setValue(cap);
  };

  const sub = new Subscription();
  sub.add(vehicleId.valueChanges.subscribe(applyVehicleBranch));
  sub.add(pickupLocation.valueChanges.subscribe(followPickup));
  sub.add(form.valueChanges.subscribe(syncDeposit));

  if (!pickupLocation.value) applyVehicleBranch();
  if (pickupLocation.value && !returnLocation.value) followPickup(pickupLocation.value);
  syncDeposit();

  options.destroyRef?.onDestroy(() => sub.unsubscribe());
  return sub;
}
