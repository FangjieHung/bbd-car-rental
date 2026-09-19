import { Component, computed, inject, signal, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  CancellationContractKind,
  OPERATOR_RECOVERY_REMEDY_ORDER,
  OperatorRecoveryGoodwillCompensationType,
  OperatorRecoveryReason,
  OperatorRecoveryRemedyOutcome,
  OperatorRecoveryRemedyType,
} from '@car-rental/domain';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import {
  ApprovalRequiredError,
  CaseNotInProgressError,
  ConsentRequiredError,
  EscalationRequiresAllRemedyAttemptsError,
  OperatorRecoveryStore,
  RemedyOutOfOrderError,
  RemedyVehicleUnavailableError,
} from '../../../stores/operator-recovery/operator-recovery.store';

const REASONS: OperatorRecoveryReason[] = [
  'vehicle_breakdown',
  'oversell',
  'staff_dispatch_error',
  'other_attributable',
];
const OUTCOMES: OperatorRecoveryRemedyOutcome[] = ['accepted', 'declined', 'unavailable'];
const GOODWILL_TYPES: OperatorRecoveryGoodwillCompensationType[] = ['credit', 'coupon'];

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/**
 * 訂單工作區「業者復原與補償」分頁。設計文件第 10 節：
 * - 業者無法依約交付原車輛時（車輛故障、超賣、人員調度失誤、其他可歸責事由），依序嘗試
 *   同級調車 → 免費升等 → 合作同業轉單；三者皆失敗或顧客不同意，才進入業者責任取消。
 * - 所有業務規則（順序強制、換車與合約新版本、業者責任取消的金額試算與 manual_review
 *   判斷）全部委派給 OperatorRecoveryStore／CancellationStore（Task 4/6/14），本元件
 *   只負責收集表單輸入、呈現案件狀態，不重算任何規則。
 * - 計程車車資補貼與善意補償（保留金／折價券）各自獨立記錄，與業者責任取消的法定現金賠償
 *   分開顯示，不互相抵銷。
 */
@Component({
  selector: 'app-operator-recovery-panel',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './operator-recovery-panel.component.html',
})
export class OperatorRecoveryPanelComponent {
  protected readonly t = ZH_TW;
  protected readonly reasons = REASONS;
  protected readonly outcomes = OUTCOMES;
  protected readonly goodwillTypes = GOODWILL_TYPES;
  protected readonly remedyOrder = OPERATOR_RECOVERY_REMEDY_ORDER;

  private readonly store = inject(OperatorRecoveryStore);
  private readonly bookingStore = inject(BookingStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly contractStore = inject(ContractStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly bookingId = input.required<string>();

  protected readonly booking = computed(() => this.bookingStore.bookings().find((b) => b.id === this.bookingId()));
  protected readonly vehicle = computed(() => {
    const booking = this.booking();
    return booking ? this.vehicleStore.vehicles().find((v) => v.id === booking.vehicleId) : undefined;
  });

  protected readonly cases = computed(() => this.store.casesFor(this.bookingId()));

  /** 可選的替代車輛：目前 available、且不是本次訂單目前這台車。 */
  protected readonly availableVehicles = computed(() =>
    this.vehicleStore.vehicles().filter((v) => v.status === 'available' && v.id !== this.booking()?.vehicleId),
  );

  // ---------------------------------------------------------------------
  // 開立案件
  // ---------------------------------------------------------------------

  protected readonly createForm = this.fb.group({
    reason: ['vehicle_breakdown' as OperatorRecoveryReason, Validators.required],
    reasonNote: [''],
    discoveredAt: [toDatetimeLocalValue(new Date().toISOString()), Validators.required],
    notifiedAt: [toDatetimeLocalValue(new Date().toISOString()), Validators.required],
    actorName: ['', Validators.required],
  });

  protected submitCreateCase(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;

    const value = this.createForm.getRawValue();
    const created = this.store.createCase({
      bookingId: this.bookingId(),
      reason: value.reason,
      ...(value.reasonNote ? { reasonNote: value.reasonNote } : {}),
      discoveredAt: fromDatetimeLocalValue(value.discoveredAt),
      notifiedAt: fromDatetimeLocalValue(value.notifiedAt),
      actor: { actorId: value.actorName, actorName: value.actorName },
    });
    this.selectedCaseId.set(created.id);
    this.resetCreateForm();
  }

  private resetCreateForm(): void {
    this.createForm.reset({
      reason: 'vehicle_breakdown',
      reasonNote: '',
      discoveredAt: toDatetimeLocalValue(new Date().toISOString()),
      notifiedAt: toDatetimeLocalValue(new Date().toISOString()),
      actorName: '',
    });
  }

  // ---------------------------------------------------------------------
  // 選取操作中的案件
  // ---------------------------------------------------------------------

  protected readonly selectedCaseId = signal<string | undefined>(undefined);
  protected readonly selectedCase = computed(() => {
    const cases = this.cases();
    if (cases.length === 0) return undefined;
    const id = this.selectedCaseId();
    return cases.find((c) => c.id === id) ?? cases[0];
  });

  protected selectCase(id: string): void {
    this.selectedCaseId.set(id);
  }

  protected readonly nextRemedyType = computed<OperatorRecoveryRemedyType | undefined>(() => {
    const kase = this.selectedCase();
    if (!kase || kase.status !== 'in_progress') return undefined;
    return OPERATOR_RECOVERY_REMEDY_ORDER[kase.remedyAttempts.length];
  });

  protected readonly canEscalate = computed(() => {
    const kase = this.selectedCase();
    return (
      !!kase && kase.status === 'in_progress' && kase.remedyAttempts.length >= OPERATOR_RECOVERY_REMEDY_ORDER.length
    );
  });

  // ---------------------------------------------------------------------
  // 補救方案嘗試
  // ---------------------------------------------------------------------

  protected readonly remedyForm = this.fb.group({
    outcome: ['declined' as OperatorRecoveryRemedyOutcome, Validators.required],
    availabilitySnapshot: [''],
    replacementVehicleId: [''],
    partnerName: [''],
    externalVehicleDescription: [''],
    externalQuoteAmount: [null as number | null],
    absorbedDifference: [0, [Validators.required, Validators.min(0)]],
    customerConsent: [false],
    customerDecisionNote: [''],
    notedBy: ['', Validators.required],
    approvedBy: [''],
  });

  protected readonly remedyFormValue = toSignal(
    this.remedyForm.valueChanges.pipe(map(() => this.remedyForm.getRawValue())),
    { initialValue: this.remedyForm.getRawValue() },
  );

  protected readonly remedyRequiresVehicle = computed(() => {
    const type = this.nextRemedyType();
    return type === 'same_class_replacement' || type === 'free_upgrade';
  });
  protected readonly remedyRequiresPartner = computed(() => this.nextRemedyType() === 'partner_transfer');
  protected readonly remedyNeedsApproval = computed(() => this.remedyFormValue().outcome === 'accepted');

  protected readonly remedySubmitError = signal<string | undefined>(undefined);

  protected submitRemedy(): void {
    const kase = this.selectedCase();
    const type = this.nextRemedyType();
    this.remedyForm.markAllAsTouched();
    if (!kase || !type || this.remedyForm.invalid) return;

    const value = this.remedyForm.getRawValue();
    this.remedySubmitError.set(undefined);
    try {
      this.store.attemptRemedy({
        caseId: kase.id,
        type,
        attemptedAt: new Date().toISOString(),
        ...(value.availabilitySnapshot ? { availabilitySnapshot: value.availabilitySnapshot } : {}),
        ...(value.replacementVehicleId ? { replacementVehicleId: value.replacementVehicleId } : {}),
        ...(value.partnerName ? { partnerName: value.partnerName } : {}),
        ...(value.externalVehicleDescription
          ? { externalVehicleDescription: value.externalVehicleDescription }
          : {}),
        ...(value.externalQuoteAmount != null ? { externalQuoteAmount: value.externalQuoteAmount } : {}),
        absorbedDifference: value.absorbedDifference,
        outcome: value.outcome,
        customerConsent: value.customerConsent,
        ...(value.outcome !== 'unavailable' ? { customerDecisionAt: new Date().toISOString() } : {}),
        ...(value.customerDecisionNote ? { customerDecisionNote: value.customerDecisionNote } : {}),
        notedBy: value.notedBy,
        ...(value.approvedBy ? { approvedBy: value.approvedBy } : {}),
      });
      this.resetRemedyForm();
    } catch (e) {
      if (e instanceof ConsentRequiredError) {
        this.remedySubmitError.set(this.t.operatorRecoveryPanel.consentRequired);
      } else if (e instanceof ApprovalRequiredError) {
        this.remedySubmitError.set(this.t.operatorRecoveryPanel.approvalRequired);
      } else if (e instanceof RemedyVehicleUnavailableError) {
        this.remedySubmitError.set(this.t.operatorRecoveryPanel.vehicleUnavailable);
      } else if (e instanceof RemedyOutOfOrderError || e instanceof CaseNotInProgressError) {
        this.remedySubmitError.set(e.message);
      } else if (e instanceof Error) {
        this.remedySubmitError.set(e.message);
      } else {
        this.remedySubmitError.set(this.t.operatorRecoveryPanel.remedyFailed);
      }
    }
  }

  private resetRemedyForm(): void {
    this.remedyForm.reset({
      outcome: 'declined',
      availabilitySnapshot: '',
      replacementVehicleId: '',
      partnerName: '',
      externalVehicleDescription: '',
      externalQuoteAmount: null,
      absorbedDifference: 0,
      customerConsent: false,
      customerDecisionNote: '',
      notedBy: '',
      approvedBy: '',
    });
  }

  // ---------------------------------------------------------------------
  // 業者責任取消：金額試算與案件建立全數委派 OperatorRecoveryStore.escalateToCancellation()
  // （內部呼叫既有 quoteCancellation／CancellationStore，這裡不重算任何規則）。
  // ---------------------------------------------------------------------

  protected readonly derivedContractKind = computed<CancellationContractKind>(() => {
    const disclosed = this.contractStore.latestFor(this.bookingId())?.snapshot.disclosedRules
      .cancellationContractKind;
    if (disclosed) return disclosed;
    return this.vehicle()?.category === 'car' ? 'passenger_car' : 'scooter';
  });
  protected readonly derivedRuleVersion = computed(
    () => this.contractStore.latestFor(this.bookingId())?.snapshot.disclosedRules.cancellationRuleVersion ?? 'v1',
  );
  protected readonly depositPaid = computed(() =>
    this.paymentStore
      .paymentsFor(this.bookingId())
      .filter((p) => p.purpose === 'deposit' && p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0),
  );
  protected readonly otherPrepayment = computed(() =>
    this.paymentStore
      .paymentsFor(this.bookingId())
      .filter((p) => p.purpose !== 'deposit' && p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0),
  );

  protected readonly escalateForm = this.fb.group({
    requestedAt: [toDatetimeLocalValue(new Date().toISOString()), Validators.required],
    agreedRentalTotal: [null as number | null],
    intentionalConduct: [false],
    additionalCustomerDamageClaimed: [false],
    actorName: ['', Validators.required],
    approvedBy: ['', Validators.required],
  });

  protected readonly escalateSubmitError = signal<string | undefined>(undefined);
  protected readonly escalateResultNotice = signal<string | undefined>(undefined);

  protected submitEscalate(): void {
    const kase = this.selectedCase();
    this.escalateForm.markAllAsTouched();
    if (!kase || this.escalateForm.invalid) return;

    const value = this.escalateForm.getRawValue();
    this.escalateSubmitError.set(undefined);
    this.escalateResultNotice.set(undefined);
    try {
      const result = this.store.escalateToCancellation({
        caseId: kase.id,
        contractKind: this.derivedContractKind(),
        requestedAt: fromDatetimeLocalValue(value.requestedAt),
        ruleVersion: this.derivedRuleVersion(),
        depositPaid: this.depositPaid(),
        otherPrepayment: this.otherPrepayment(),
        ...(value.agreedRentalTotal != null ? { agreedRentalTotal: value.agreedRentalTotal } : {}),
        intentionalConduct: value.intentionalConduct,
        additionalCustomerDamageClaimed: value.additionalCustomerDamageClaimed,
        actor: { actorId: value.actorName, actorName: value.actorName },
        approvedBy: value.approvedBy,
      });
      this.escalateResultNotice.set(
        `${this.t.operatorRecoveryPanel.escalatedNotice}：${this.t.cancellationPanel.statusLabels[result.cancellationCase.status]}`,
      );
    } catch (e) {
      if (e instanceof EscalationRequiresAllRemedyAttemptsError) {
        this.escalateSubmitError.set(e.message);
      } else if (e instanceof ApprovalRequiredError) {
        this.escalateSubmitError.set(this.t.operatorRecoveryPanel.approvalRequired);
      } else if (e instanceof Error) {
        this.escalateSubmitError.set(e.message);
      } else {
        this.escalateSubmitError.set(this.t.operatorRecoveryPanel.escalateFailed);
      }
    }
  }

  // ---------------------------------------------------------------------
  // 額外補償：計程車車資補貼、善意補償——各自獨立，不影響業者責任取消的法定現金賠償。
  // ---------------------------------------------------------------------

  protected readonly taxiForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]],
    evidenceAssetId: [''],
    notedBy: ['', Validators.required],
    approvedBy: ['', Validators.required],
  });
  protected readonly taxiSubmitError = signal<string | undefined>(undefined);

  protected submitTaxi(): void {
    const kase = this.selectedCase();
    this.taxiForm.markAllAsTouched();
    if (!kase || this.taxiForm.invalid) return;

    const value = this.taxiForm.getRawValue();
    this.taxiSubmitError.set(undefined);
    try {
      this.store.recordTaxiReimbursement({
        caseId: kase.id,
        amount: value.amount,
        ...(value.evidenceAssetId ? { evidenceAssetId: value.evidenceAssetId } : {}),
        occurredAt: new Date().toISOString(),
        notedBy: value.notedBy,
        approvedBy: value.approvedBy,
      });
      this.taxiForm.reset({ amount: 0, evidenceAssetId: '', notedBy: '', approvedBy: '' });
    } catch (e) {
      if (e instanceof ApprovalRequiredError) {
        this.taxiSubmitError.set(this.t.operatorRecoveryPanel.approvalRequired);
      } else {
        this.taxiSubmitError.set(this.t.operatorRecoveryPanel.compensationFailed);
      }
    }
  }

  protected readonly goodwillForm = this.fb.group({
    type: ['credit' as OperatorRecoveryGoodwillCompensationType, Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    couponCode: [''],
    notedBy: ['', Validators.required],
    approvedBy: ['', Validators.required],
  });
  protected readonly goodwillSubmitError = signal<string | undefined>(undefined);

  protected submitGoodwill(): void {
    const kase = this.selectedCase();
    this.goodwillForm.markAllAsTouched();
    if (!kase || this.goodwillForm.invalid) return;

    const value = this.goodwillForm.getRawValue();
    this.goodwillSubmitError.set(undefined);
    try {
      this.store.recordGoodwillCompensation({
        caseId: kase.id,
        type: value.type,
        amount: value.amount,
        ...(value.couponCode ? { couponCode: value.couponCode } : {}),
        occurredAt: new Date().toISOString(),
        notedBy: value.notedBy,
        approvedBy: value.approvedBy,
      });
      this.goodwillForm.reset({ type: 'credit', amount: 0, couponCode: '', notedBy: '', approvedBy: '' });
    } catch (e) {
      if (e instanceof ApprovalRequiredError) {
        this.goodwillSubmitError.set(this.t.operatorRecoveryPanel.approvalRequired);
      } else {
        this.goodwillSubmitError.set(this.t.operatorRecoveryPanel.compensationFailed);
      }
    }
  }
}
