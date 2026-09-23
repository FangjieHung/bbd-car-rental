import { Component, computed, inject, signal, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CancellationCase, CancellationQuote, CancellationQuoteInput, CancellationResponsibility } from '@car-rental/domain';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { TwdPipe } from '../../../shared/pipes/twd.pipe';
import { DocumentAssetGateway } from '../../../core/services/document-asset.gateway';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import {
  CancellationStore,
  ForceMajeureEvidenceRequiredError,
  TransferFeeApprovalRequiredError,
} from '../../../stores/cancellation/cancellation.store';

const RESPONSIBILITIES: CancellationResponsibility[] = [
  'customer',
  'force_majeure',
  'operator_fault',
  'operator_intentional',
];

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/**
 * 訂單詳情「取消／退款」分頁。設計文件第 9 節：
 * - 只有 reserved 訂單可以走這個一般取消流程（Task 3 的規則：in_progress 已交車，須走還車）。
 * - 試算金額全部委派給 Task 4 的 quoteCancellation 純函式（透過 CancellationStore.quote()），
 *   本元件不重算任何金額規則，只負責組出試算輸入、即時顯示試算結果、收集建案所需的額外
 *   資訊（佐證資料、手續費理由與主管確認）。
 * - 不可抗力（force_majeure）責任歸屬必須先上傳佐證資料才能建案；建案後仍須經主管核准
 *   （approve()）才能進入撥付（見 customer-credit-panel 的 disposeCase 呼叫）。
 * - 退款手續費達 30 元（含）以上須填理由並由主管確認，否則 CancellationStore.createCase()
 *   會直接拒絕。
 * - 機車顧客取消、業者故意違約、另有損害待鑑定、業者過失未收定金且缺約定總租金，
 *   這四種情境 quoteCancellation 一律回傳 manual_review，案件會被建立但金額全為 0，
 *   之後無法透過一般撥付流程結案，必須先由人工確認實際金額（本頁只顯示提示，不繞過）。
 */
@Component({
  selector: 'app-cancellation-panel',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TwdPipe,
  ],
  templateUrl: './cancellation-panel.component.html',
  styleUrl: './cancellation-panel.component.scss',
})
export class CancellationPanelComponent {
  protected readonly t = ZH_TW;
  protected readonly responsibilities = RESPONSIBILITIES;

  private readonly cancellationStore = inject(CancellationStore);
  private readonly bookingStore = inject(BookingStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly memberStore = inject(MemberStore);
  private readonly contractStore = inject(ContractStore);
  private readonly paymentStore = inject(PaymentStore);
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

  protected readonly eligible = computed(() => this.booking()?.status === 'reserved');

  protected readonly cases = computed(() =>
    [...this.cancellationStore.casesFor(this.bookingId())].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    ),
  );

  /** 取消規則的契約類型與版本，優先讀合約簽署當下揭露的快照，理由同 HandoverPanelComponent.policyFor。 */
  protected readonly derivedContractKind = computed(() => {
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

  protected readonly evidenceAssetIds = signal<string[]>([]);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | undefined>(undefined);

  protected readonly form = this.fb.group({
    responsibility: ['customer' as CancellationResponsibility, Validators.required],
    reason: ['', Validators.required],
    cancellationRequestedAt: [toDatetimeLocalValue(new Date().toISOString()), Validators.required],
    transferFee: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    transferFeeReason: [''],
    transferFeeApprovedBy: [''],
    additionalCustomerDamageClaimed: [false],
    agreedRentalTotal: [null as number | null],
  });

  private readonly formValue = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  protected readonly needsTransferFeeApproval = computed(() => (this.formValue().transferFee ?? 0) >= 30);
  protected readonly needsEvidence = computed(() => this.formValue().responsibility === 'force_majeure');

  protected readonly quoteInput = computed<CancellationQuoteInput | undefined>(() => {
    const booking = this.booking();
    if (!booking) return undefined;
    const value = this.formValue();
    return {
      contractKind: this.derivedContractKind(),
      responsibility: value.responsibility,
      cancellationRequestedAt: fromDatetimeLocalValue(value.cancellationRequestedAt),
      pickupAt: booking.startTime,
      depositPaid: this.depositPaid(),
      otherPrepayment: this.otherPrepayment(),
      transferFee: value.transferFee,
      additionalCustomerDamageClaimed: value.additionalCustomerDamageClaimed,
      ...(value.agreedRentalTotal != null ? { agreedRentalTotal: value.agreedRentalTotal } : {}),
    };
  });

  protected readonly quotePreview = computed<CancellationQuote | undefined>(() => {
    const input = this.quoteInput();
    if (!input) return undefined;
    try {
      return this.cancellationStore.quote(input);
    } catch {
      return undefined;
    }
  });

  protected async onEvidenceSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    for (const file of files) {
      const stored = await this.assetGateway.store(file, file.name);
      this.evidenceAssetIds.update((ids) => [...ids, stored.assetId]);
    }
    input.value = '';
  }

  protected removeEvidence(assetId: string): void {
    this.evidenceAssetIds.update((ids) => ids.filter((id) => id !== assetId));
  }

  protected async submitCase(): Promise<void> {
    if (this.submitting()) return;

    const booking = this.booking();
    const quote = this.quotePreview();
    this.form.markAllAsTouched();
    if (!booking || !quote || this.form.invalid) return;

    this.submitting.set(true);
    this.submitError.set(undefined);
    await Promise.resolve();

    const value = this.form.getRawValue();
    try {
      this.cancellationStore.createCase({
        bookingId: booking.id,
        contractKind: this.derivedContractKind(),
        responsibility: value.responsibility,
        reason: value.reason,
        requestedAt: fromDatetimeLocalValue(value.cancellationRequestedAt),
        ruleVersion: this.derivedRuleVersion(),
        originalDepositPaid: this.depositPaid(),
        originalOtherPrepayment: this.otherPrepayment(),
        quote,
        evidenceAssetIds: this.evidenceAssetIds(),
        ...(value.transferFeeReason ? { transferFeeReason: value.transferFeeReason } : {}),
        ...(value.transferFeeApprovedBy ? { transferFeeApprovedBy: value.transferFeeApprovedBy } : {}),
      });
      this.resetForm();
    } catch (e) {
      if (e instanceof ForceMajeureEvidenceRequiredError) {
        this.submitError.set(this.t.cancellationPanel.forceMajeureEvidenceRequired);
      } else if (e instanceof TransferFeeApprovalRequiredError) {
        this.submitError.set(this.t.cancellationPanel.transferFeeApprovalRequired);
      } else {
        this.submitError.set(this.t.cancellationPanel.createFailed);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  private resetForm(): void {
    this.evidenceAssetIds.set([]);
    this.form.reset({
      responsibility: 'customer',
      reason: '',
      cancellationRequestedAt: toDatetimeLocalValue(new Date().toISOString()),
      transferFee: 0,
      transferFeeReason: '',
      transferFeeApprovedBy: '',
      additionalCustomerDamageClaimed: false,
      agreedRentalTotal: null,
    });
  }

  protected readonly approveActorName = signal('');

  protected approveCase(caseId: string): void {
    const actor = this.approveActorName().trim();
    if (!actor) return;
    this.cancellationStore.approve(caseId, actor);
    this.approveActorName.set('');
  }

  protected caseTotal(kase: CancellationCase): number {
    return this.cancellationStore.totalDisposableAmount(kase);
  }
}
