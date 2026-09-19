import { Component, computed, inject, signal, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SlicePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  IdentityDocumentType,
  MemberKind,
  PickupReadinessInput,
  ReciprocityStatus,
  RentalBooking,
  ReturnChargeResult,
  Vehicle,
  deriveEnergyTypeFallback,
} from '@car-rental/domain';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { DocumentAssetGateway } from '../../../core/services/document-asset.gateway';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { PricingStore } from '../../../stores/pricing/pricing.store';
import {
  HandoverOrchestrationPartialFailureError,
  HandoverStore,
  NON_OVERRIDABLE_PICKUP_BLOCKER_TYPES,
  PickupBlockedError,
  PickupOverrideNotAllowedError,
  SupervisorOverrideInvalidError,
} from '../../../stores/handover/handover.store';

/** 依會員類型推導本次取車必須查核的身分文件種類：本國人查身分證、居留證者查居留證、外國旅客查護照。 */
function requiredIdentityDocumentKind(memberKind: MemberKind | undefined): IdentityDocumentType {
  if (memberKind === 'foreign_visitor') return 'passport';
  if (memberKind === 'resident') return 'resident_permit';
  return 'taiwan_id';
}

/**
 * DriverCredential.reciprocityStatus 比 PickupDriverCredential 多一個 'manual_review'
 * （查核中，需人工判斷）；就緒判斷只在乎「是否已確認符合」，尚未確認一律視同 pending
 * （非 eligible 都會被 evaluatePickupReadiness 擋下，語意上等價，不影響阻擋結果）。
 */
function toPickupReciprocityStatus(status: ReciprocityStatus): 'pending' | 'eligible' | 'ineligible' {
  return status === 'manual_review' ? 'pending' : status;
}

/** 同一 memberId 底下同種文件／駕駛資格可能有多個版本，永遠取版本號最大的那筆（見設計文件第 4.3 節）。 */
function latestByVersion<T extends { version: number }>(items: T[]): T | undefined {
  return items.reduce<T | undefined>((latest, item) => (!latest || item.version > latest.version ? item : latest), undefined);
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/**
 * 訂單工作區「交還車」分頁。設計文件第 7 節與本任務 brief：
 * - reserved 訂單顯示取車表單：即時依會員／文件／合約／付款／車輛狀態組出就緒判斷輸入，
 *   透過 HandoverStore.evaluateReadiness() 即時反映阻擋與警示；一般取車被阻擋時可視情況
 *   填寫主管覆核（操作人＋理由）；法律資格或車輛安全類別的阻擋永遠不能覆核放行。
 * - in_progress 訂單顯示還車表單：先「試算費用」（不建立任何 ChargeAdjustment，純預覽），
 *   人員確認金額（可人工調整、有調整必須填理由）後才按「確認還車」，這一步才真的建立並
 *   確認 ChargeAdjustment。未收餘額不會阻擋還車完成，留在款項分頁成為應收。
 * - completed 訂單顯示唯讀的取車／還車紀錄摘要。
 *
 * 取車／還車完成後，booking() 的狀態會透過 BookingStore 的 signal 自動反映，畫面因此
 * 自動從表單切換成下一個階段，不需要另外維護「目前模式」的旗標。
 */
@Component({
  selector: 'app-handover-panel',
  imports: [ReactiveFormsModule, SlicePipe, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule],
  templateUrl: './handover-panel.component.html',
  styleUrl: './handover-panel.component.scss',
})
export class HandoverPanelComponent {
  protected readonly t = ZH_TW;
  protected readonly nonOverridableBlockerTypes = NON_OVERRIDABLE_PICKUP_BLOCKER_TYPES;

  private readonly handoverStore = inject(HandoverStore);
  private readonly bookingStore = inject(BookingStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly memberStore = inject(MemberStore);
  private readonly documentStore = inject(DocumentStore);
  private readonly contractStore = inject(ContractStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly pricingStore = inject(PricingStore);
  private readonly assetGateway = inject(DocumentAssetGateway);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly bookingId = input.required<string>();

  protected readonly booking = computed(() => this.bookingStore.bookings().find((b) => b.id === this.bookingId()));
  protected readonly vehicle = computed(() => {
    const booking = this.booking();
    return booking ? this.vehicleStore.vehicles().find((v) => v.id === booking.vehicleId) : undefined;
  });
  protected readonly member = computed(() => {
    const booking = this.booking();
    return booking ? this.memberStore.members().find((m) => m.id === booking.memberId) : undefined;
  });

  protected readonly pickupRecord = computed(() => this.handoverStore.pickupFor(this.bookingId()));
  protected readonly returnRecord = computed(() => this.handoverStore.returnFor(this.bookingId()));

  // ---------------------------------------------------------------------
  // 取車：就緒判斷輸入即時由現有資料組出，evaluateReadiness 是純函式，任何依賴
  // signal 變動都會讓這兩個 computed 重新算一次，畫面因此永遠反映「現在」的狀態。
  // ---------------------------------------------------------------------

  protected readonly readinessInput = computed<PickupReadinessInput | undefined>(() => {
    const booking = this.booking();
    const vehicle = this.vehicle();
    if (!booking || !vehicle) return undefined;
    const member = this.member();

    const requiredKind = requiredIdentityDocumentKind(member?.kind);
    const identityDoc = latestByVersion(
      this.documentStore.identityDocumentsFor(booking.memberId).filter((d) => d.type === requiredKind),
    );
    const credential = latestByVersion(this.documentStore.driverCredentialsFor(booking.memberId));
    const contract = this.contractStore.latestFor(booking.id);
    const depositPaid = this.paymentStore
      .paymentsFor(booking.id)
      .filter((p) => p.purpose === 'deposit' && p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0);
    const hasSchedulingConflict =
      this.bookingStore.findConflicts(vehicle.id, booking.startTime, booking.endTime, booking.id).length > 0;
    const isForeignVisitor = member?.kind === 'foreign_visitor';

    return {
      evaluatedAt: new Date().toISOString(),
      depositRequired: booking.depositRequired,
      depositPaid,
      latestContractSigned: contract?.status === 'signed',
      requiredDocuments: [
        {
          kind: requiredKind,
          present: !!identityDoc,
          ...(identityDoc?.expiryDate ? { expiryDate: identityDoc.expiryDate } : {}),
          ...(identityDoc?.verification.ocrConfidence != null
            ? { ocrConfidence: identityDoc.verification.ocrConfidence }
            : {}),
        },
      ],
      driverCredential: credential
        ? {
            present: true,
            ...(credential.expiryDate ? { expiryDate: credential.expiryDate } : {}),
            matchesVehicleClass:
              credential.matchesRentedVehicleClass ?? credential.standardizedVehicleClass === vehicle.category,
            isForeignVisitor,
            reciprocityStatus: isForeignVisitor
              ? toPickupReciprocityStatus(credential.reciprocityStatus)
              : 'not_applicable',
          }
        : {
            present: false,
            // 完全沒有駕駛資格紀錄時不宣稱「准駕車種不符」——那是法律資格類別的非覆核阻擋，
            // 只有在「有一筆紀錄、但比對後真的不符」才成立。單純缺件已經由下面的
            // required_document_missing_or_expired（可覆核）擋下，不需要疊加一個
            // 無憑無據的法律資格阻擋，讓現場人員先補件就能解決，而不是誤判成無法覆核。
            matchesVehicleClass: true,
            isForeignVisitor,
            reciprocityStatus: 'not_applicable',
          },
      originalDocumentCheckedThisVisit: this.originalDocumentCheckedSignal(),
      vehicle: { status: vehicle.status, hasSchedulingConflict },
      ...(member?.email ? { memberEmail: member.email } : {}),
    };
  });

  protected readonly readiness = computed(() => {
    const input = this.readinessInput();
    return input ? this.handoverStore.evaluateReadiness(input) : undefined;
  });

  protected readonly nonOverridableBlockers = computed(() =>
    (this.readiness()?.blockers ?? []).filter((b) => NON_OVERRIDABLE_PICKUP_BLOCKER_TYPES.includes(b.type)),
  );
  protected readonly overridableBlockers = computed(() =>
    (this.readiness()?.blockers ?? []).filter((b) => !NON_OVERRIDABLE_PICKUP_BLOCKER_TYPES.includes(b.type)),
  );
  protected readonly pickupLocked = computed(() => this.nonOverridableBlockers().length > 0);
  protected readonly needsOverride = computed(() => {
    const readiness = this.readiness();
    return !!readiness && !readiness.ready && !this.pickupLocked();
  });

  protected readonly pickupPhotoAssetIds = signal<string[]>([]);
  protected readonly pickupSubmitting = signal(false);
  protected readonly pickupError = signal<string | undefined>(undefined);
  protected readonly pickupPartialFailure = signal<HandoverOrchestrationPartialFailureError | undefined>(undefined);

  protected readonly pickupForm = this.fb.group({
    actualAt: [toDatetimeLocalValue(new Date().toISOString()), Validators.required],
    mileage: [0, [Validators.required, Validators.min(0)]],
    energyLevel: [8, [Validators.required, Validators.min(0)]],
    originalDocumentChecked: [false],
    operatorConfirmedBy: [this.t.layout.adminUser, Validators.required],
    notes: [''],
    overrideActorName: [''],
    overrideReason: [''],
  });

  /**
   * readinessInput 是 computed()，只有讀到的值是 signal 時才會在值變動時自動重算。
   * pickupForm.controls.originalDocumentChecked.value 是 ReactiveFormsModule 的一般
   * 屬性讀取，不是 signal——勾選框變動不會讓 computed 重新求值，因此必須透過
   * toSignal() 把這個控制項的 valueChanges 橋接成 signal，readinessInput 才能正確
   * 即時反映「本次是否已核對證件正本」。
   */
  private readonly originalDocumentCheckedSignal = toSignal(
    this.pickupForm.controls.originalDocumentChecked.valueChanges,
    { initialValue: this.pickupForm.controls.originalDocumentChecked.value },
  );

  protected async onPickupPhotosSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    for (const file of files) {
      const stored = await this.assetGateway.store(file, file.name);
      this.pickupPhotoAssetIds.update((ids) => [...ids, stored.assetId]);
    }
    input.value = '';
  }

  protected removePickupPhoto(assetId: string): void {
    this.pickupPhotoAssetIds.update((ids) => ids.filter((id) => id !== assetId));
  }

  protected async submitPickup(): Promise<void> {
    if (this.pickupSubmitting()) return;

    const booking = this.booking();
    const input = this.readinessInput();
    this.pickupForm.markAllAsTouched();
    if (!booking || !input || this.pickupForm.invalid) return;

    this.pickupSubmitting.set(true);
    this.pickupError.set(undefined);
    this.pickupPartialFailure.set(undefined);
    await Promise.resolve();

    const value = this.pickupForm.getRawValue();
    const needsOverride = this.needsOverride();

    if (needsOverride && (!value.overrideActorName.trim() || !value.overrideReason.trim())) {
      this.pickupError.set(this.t.handoverPanel.overrideInvalid);
      this.pickupSubmitting.set(false);
      return;
    }

    try {
      this.handoverStore.performPickup({
        bookingId: booking.id,
        readinessInput: input,
        record: {
          actualAt: fromDatetimeLocalValue(value.actualAt),
          mileage: value.mileage,
          energyLevel: value.energyLevel,
          photoAssetIds: this.pickupPhotoAssetIds(),
          originalDocumentChecked: value.originalDocumentChecked,
          operatorConfirmation: { confirmedBy: value.operatorConfirmedBy, confirmedAt: new Date().toISOString() },
          ...(value.notes ? { notes: value.notes } : {}),
        },
        actor: { actorId: value.operatorConfirmedBy, actorName: value.operatorConfirmedBy },
        ...(needsOverride
          ? {
              supervisorOverride: {
                actorId: value.overrideActorName,
                actorName: value.overrideActorName,
                reason: value.overrideReason,
              },
            }
          : {}),
      });
      this.resetPickupForm();
    } catch (e) {
      this.handlePickupError(e);
    } finally {
      this.pickupSubmitting.set(false);
    }
  }

  private handlePickupError(e: unknown): void {
    if (e instanceof HandoverOrchestrationPartialFailureError) {
      this.pickupPartialFailure.set(e);
    } else if (e instanceof PickupOverrideNotAllowedError) {
      this.pickupError.set(this.t.handoverPanel.overrideNotAllowed);
    } else if (e instanceof SupervisorOverrideInvalidError) {
      this.pickupError.set(this.t.handoverPanel.overrideInvalid);
    } else if (e instanceof PickupBlockedError) {
      this.pickupError.set(this.t.handoverPanel.blockedNotice);
    } else {
      this.pickupError.set(this.t.handoverPanel.unexpectedError);
    }
  }

  private resetPickupForm(): void {
    this.pickupPhotoAssetIds.set([]);
    this.pickupForm.reset({
      actualAt: toDatetimeLocalValue(new Date().toISOString()),
      mileage: 0,
      energyLevel: 8,
      originalDocumentChecked: false,
      operatorConfirmedBy: this.t.layout.adminUser,
      notes: '',
      overrideActorName: '',
      overrideReason: '',
    });
  }

  // ---------------------------------------------------------------------
  // 還車：試算與確認刻意分開——previewReturnCharges() 只呼叫 calculateCharges()
  // （純試算，不寫入任何 repository）；confirmReturn() 才真的呼叫 performReturn()
  // 建立並確認 ChargeAdjustment。confirmReturn() 只在已經有一份試算結果時才會送出，
  // 這就是 UI 層面「先試算、後確認」的強制順序。
  // ---------------------------------------------------------------------

  protected readonly returnPhotoAssetIds = signal<string[]>([]);
  protected readonly returnSubmitting = signal(false);
  protected readonly returnError = signal<string | undefined>(undefined);
  protected readonly returnPartialFailure = signal<HandoverOrchestrationPartialFailureError | undefined>(undefined);
  protected readonly returnChargesPreview = signal<ReturnChargeResult | undefined>(undefined);

  protected readonly returnForm = this.fb.group({
    actualAt: [toDatetimeLocalValue(new Date().toISOString()), Validators.required],
    mileage: [0, [Validators.required, Validators.min(0)]],
    energyLevel: [0, [Validators.required, Validators.min(0)]],
    originalDocumentChecked: [false],
    operatorConfirmedBy: [this.t.layout.adminUser, Validators.required],
    notes: [''],
    manualLateFee: [null as number | null],
    manualEnergyFee: [null as number | null],
    manualReason: [''],
  });

  constructor() {
    // 還車金額輸入（時間、能源讀數、人工調整）改變後，先前的試算結果就已經過時，
    // 必須清掉逼使用者重新按「試算費用」，不能讓「確認還車」用一份舊試算蒙混過去。
    this.returnForm.valueChanges.subscribe(() => this.returnChargesPreview.set(undefined));
  }

  protected async onReturnPhotosSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    for (const file of files) {
      const stored = await this.assetGateway.store(file, file.name);
      this.returnPhotoAssetIds.update((ids) => [...ids, stored.assetId]);
    }
    input.value = '';
  }

  protected removeReturnPhoto(assetId: string): void {
    this.returnPhotoAssetIds.update((ids) => ids.filter((id) => id !== assetId));
  }

  protected previewReturnCharges(): void {
    const booking = this.booking();
    const vehicle = this.vehicle();
    const pickup = this.pickupRecord();
    this.returnError.set(undefined);
    this.returnForm.markAllAsTouched();
    if (!booking || !vehicle || !pickup) return;
    if (
      this.returnForm.controls.actualAt.invalid ||
      this.returnForm.controls.mileage.invalid ||
      this.returnForm.controls.energyLevel.invalid
    ) {
      return;
    }

    const value = this.returnForm.getRawValue();
    const policy = this.policyFor(booking, vehicle);
    const manualAdjustment =
      value.manualLateFee != null || value.manualEnergyFee != null
        ? {
            ...(value.manualLateFee != null ? { lateFee: value.manualLateFee } : {}),
            ...(value.manualEnergyFee != null ? { energyFee: value.manualEnergyFee } : {}),
            ...(value.manualReason ? { reason: value.manualReason } : {}),
          }
        : undefined;

    try {
      const charges = this.handoverStore.calculateCharges({
        scheduledReturnAt: booking.endTime,
        actualReturnAt: fromDatetimeLocalValue(value.actualAt),
        lateReturnPolicy: policy.lateReturnPolicy,
        energyReturnPolicy: policy.energyReturnPolicy,
        pickupEnergyLevel: pickup.energyLevel,
        returnEnergyLevel: value.energyLevel,
        ...(manualAdjustment ? { manualAdjustment } : {}),
      });
      this.returnChargesPreview.set(charges);
    } catch {
      this.returnChargesPreview.set(undefined);
      this.returnError.set(this.t.handoverPanel.manualAdjustmentReasonRequired);
    }
  }

  protected async confirmReturn(): Promise<void> {
    if (this.returnSubmitting()) return;

    const booking = this.booking();
    const charges = this.returnChargesPreview();
    if (!booking || !charges) return;

    this.returnSubmitting.set(true);
    this.returnError.set(undefined);
    this.returnPartialFailure.set(undefined);
    await Promise.resolve();

    const value = this.returnForm.getRawValue();

    try {
      this.handoverStore.performReturn({
        bookingId: booking.id,
        record: {
          actualAt: fromDatetimeLocalValue(value.actualAt),
          mileage: value.mileage,
          energyLevel: value.energyLevel,
          photoAssetIds: this.returnPhotoAssetIds(),
          originalDocumentChecked: value.originalDocumentChecked,
          operatorConfirmation: { confirmedBy: value.operatorConfirmedBy, confirmedAt: new Date().toISOString() },
          ...(value.notes ? { notes: value.notes } : {}),
        },
        charges,
        actor: { actorId: value.operatorConfirmedBy, actorName: value.operatorConfirmedBy },
      });
      this.resetReturnForm();
    } catch (e) {
      if (e instanceof HandoverOrchestrationPartialFailureError) {
        this.returnPartialFailure.set(e);
      } else {
        this.returnError.set(this.t.handoverPanel.unexpectedError);
      }
    } finally {
      this.returnSubmitting.set(false);
    }
  }

  private resetReturnForm(): void {
    this.returnPhotoAssetIds.set([]);
    this.returnChargesPreview.set(undefined);
    this.returnForm.reset({
      actualAt: toDatetimeLocalValue(new Date().toISOString()),
      mileage: 0,
      energyLevel: 0,
      originalDocumentChecked: false,
      operatorConfirmedBy: this.t.layout.adminUser,
      notes: '',
      manualLateFee: null,
      manualEnergyFee: null,
      manualReason: '',
    });
  }

  /**
   * 逾時／能源補繳規則優先讀「合約簽署當下鎖定的已揭露規則」——ContractVersion.snapshot.
   * disclosedRules（Task 6；設計文件第 4.4 節「已揭露規則」）本來就是為了這個用途而存在：
   * 快照在簽約當下就把 lateReturnPolicy／energyReturnPolicy 一併鎖住，之後方案調整不會
   * 回頭改到已經跟客人揭露、對過的規則。
   *
   * 只有在快照裡完全沒有這兩個欄位時（例如舊資料早於這個欄位存在，或訂單根本還沒有
   * 已簽署合約），才退回用車輛分類即時反查 PricingStore 目前的方案。這條退路務必只當
   * 最後手段，因為它有兩個實際會算錯錢的風險：
   * 1) PricingStore 對 appliesToCategory 沒有唯一性限制——同分類若哪天出現兩個方案，
   *    `.find()` 撈到哪個純看陣列順序，不保證是這張訂單當初實際適用的那個；
   *    2) 定價後台（pricing-page）可以隨時改掉方案的 lateReturnPolicy／energyReturnPolicy，
   *    合約簽署之後才調整費率的話，即時反查會用「現在」的費率跟客人收錢，
   *    跟簽約當下揭露、客人同意的費率對不上（見本任務修正前的教訓）。
   *
   * 快照與方案都沒有規則可用時，一律視為無此類收費（寬限與費率都是 0），
   * 不阻擋還車、也不會平白多收錢。
   */
  private policyFor(booking: RentalBooking, vehicle: Vehicle) {
    const disclosedRules = this.contractStore.latestFor(booking.id)?.snapshot.disclosedRules;
    const plan = this.pricingStore.plans().find((p) => p.appliesToCategory === vehicle.category);
    return {
      lateReturnPolicy:
        disclosedRules?.lateReturnPolicy ??
        plan?.lateReturnPolicy ?? { graceMinutes: 0, unitMinutes: 60, feePerUnit: 0, dailyCap: 0 },
      energyReturnPolicy:
        disclosedRules?.energyReturnPolicy ??
        plan?.energyReturnPolicy ??
        ({
          measure: (vehicle.energyType ?? deriveEnergyTypeFallback(vehicle.category)) === 'electric' ? 'percent' : 'eighths',
          feePerUnit: 0,
          serviceFee: 0,
        } as const),
    };
  }
}
