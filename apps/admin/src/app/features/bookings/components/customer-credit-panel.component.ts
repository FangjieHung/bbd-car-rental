import { Component, computed, inject, signal, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CancellationDisposition, PaymentMethod } from '@car-rental/domain';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { TwdPipe } from '../../../shared/pipes/twd.pipe';
import { BookingStore } from '../../../stores/booking/booking.store';
import { MemberStore } from '../../../stores/member/member.store';
import { CreditStore } from '../../../stores/credit/credit.store';
import {
  CancellationDispositionPartialFailureError,
  CancellationStore,
  CaseNotReadyForDispositionError,
  CreditConsentRequiredError,
  DispositionAmountMismatchError,
} from '../../../stores/cancellation/cancellation.store';

const DISPOSITIONS: CancellationDisposition[] = ['refund', 'credit', 'split'];
const REFUND_METHODS: Exclude<PaymentMethod, 'customer_credit'>[] = [
  'cash',
  'credit_card',
  'line_pay',
  'bank_transfer',
];

/**
 * 訂單詳情「取消／退款」分頁的撥付區塊。設計文件第 9.3 節：
 * - 顧客可選原方式退款、全部轉保留金、或兩者拆分；轉保留金前必須取得顧客明確同意。
 * - 保留金預設 12 個月效期、到期前 30 天提醒；主管可展延且必須留存理由。
 * - 撥付本身（金額試算、退款／保留金紀錄建立、訂單轉 cancelled、稽核紀錄）全部委派給
 *   CancellationStore.disposeCase()，本元件只負責收集撥付方式與金額、呈現結果，
 *   不重算任何金額或狀態機規則（同 HandoverPanelComponent 對 HandoverStore 的分工）。
 */
@Component({
  selector: 'app-customer-credit-panel',
  imports: [
    ReactiveFormsModule,
    TwdPipe,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './customer-credit-panel.component.html',
})
export class CustomerCreditPanelComponent {
  protected readonly t = ZH_TW;
  protected readonly dispositions = DISPOSITIONS;
  /** 購物金到期日一律用共用日期時間格式，不可再用 slice pipe 切 ISO 字串。 */
  protected readonly fmt = fmtDateTime;
  protected readonly refundMethods = REFUND_METHODS;

  private readonly cancellationStore = inject(CancellationStore);
  private readonly bookingStore = inject(BookingStore);
  private readonly memberStore = inject(MemberStore);
  private readonly creditStore = inject(CreditStore);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly bookingId = input.required<string>();

  protected readonly booking = computed(() => this.bookingStore.bookings().find((b) => b.id === this.bookingId()));
  protected readonly member = computed(() => {
    const booking = this.booking();
    return booking ? this.memberStore.members().find((m) => m.id === booking.memberId) : undefined;
  });

  /** 只有 quoted／approved 的案件才可以撥付：manual_review 須先人工確認金額，settled／voided 已結案。 */
  protected readonly disposableCases = computed(() =>
    this.cancellationStore
      .casesFor(this.bookingId())
      .filter((c) => c.status === 'quoted' || c.status === 'approved'),
  );

  protected readonly form = this.fb.group({
    caseId: [''],
    disposition: ['refund' as CancellationDisposition, Validators.required],
    refundAmount: [0, [Validators.required, Validators.min(0)]],
    refundMethod: ['cash' as Exclude<PaymentMethod, 'customer_credit'>, Validators.required],
    creditAmount: [0, [Validators.required, Validators.min(0)]],
    creditConsent: [false],
    creditExpiryMonths: [12, [Validators.required, Validators.min(1)]],
    actorName: ['', Validators.required],
  });

  protected readonly formValue = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  protected readonly selectedCase = computed(() => {
    const cases = this.disposableCases();
    if (cases.length === 0) return undefined;
    const selectedId = this.formValue().caseId || cases[0].id;
    return cases.find((c) => c.id === selectedId) ?? cases[0];
  });

  protected readonly selectedCaseTotal = computed(() => {
    const kase = this.selectedCase();
    return kase ? this.cancellationStore.totalDisposableAmount(kase) : 0;
  });

  protected readonly showCreditFields = computed(() => this.formValue().disposition !== 'refund');
  protected readonly showRefundFields = computed(() => this.formValue().disposition !== 'credit');

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | undefined>(undefined);
  protected readonly lastResultNotice = signal<string | undefined>(undefined);

  protected selectDisposition(disposition: CancellationDisposition): void {
    const total = this.selectedCaseTotal();
    if (disposition === 'refund') {
      this.form.patchValue({ disposition, refundAmount: total, creditAmount: 0 });
    } else if (disposition === 'credit') {
      this.form.patchValue({ disposition, refundAmount: 0, creditAmount: total });
    } else {
      this.form.patchValue({ disposition, refundAmount: 0, creditAmount: 0 });
    }
  }

  protected async submitDisposition(): Promise<void> {
    if (this.submitting()) return;

    const kase = this.selectedCase();
    this.form.markAllAsTouched();
    if (!kase || this.form.invalid) return;

    this.submitting.set(true);
    this.submitError.set(undefined);
    this.lastResultNotice.set(undefined);
    await Promise.resolve();

    const value = this.form.getRawValue();
    try {
      const result = this.cancellationStore.disposeCase({
        caseId: kase.id,
        disposition: value.disposition,
        refundAmount: value.refundAmount,
        refundMethod: value.refundMethod,
        creditAmount: value.creditAmount,
        creditConsent: value.creditConsent,
        creditExpiryMonths: value.creditExpiryMonths,
        actor: { actorId: value.actorName, actorName: value.actorName },
        occurredAt: new Date().toISOString(),
      });
      this.lastResultNotice.set(
        `${this.t.customerCreditPanel.submitDisposition}：${this.t.cancellationPanel.statusLabels[result.case.status]}`,
      );
      this.resetForm();
    } catch (e) {
      if (e instanceof CreditConsentRequiredError) {
        this.submitError.set(this.t.customerCreditPanel.creditConsentRequired);
      } else if (e instanceof DispositionAmountMismatchError) {
        this.submitError.set(this.t.customerCreditPanel.amountMismatch);
      } else if (e instanceof CaseNotReadyForDispositionError) {
        this.submitError.set(this.t.customerCreditPanel.caseNotReady);
      } else if (e instanceof CancellationDispositionPartialFailureError) {
        this.submitError.set(e.message);
      } else {
        this.submitError.set(this.t.customerCreditPanel.dispositionFailed);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  private resetForm(): void {
    this.form.reset({
      caseId: '',
      disposition: 'refund',
      refundAmount: 0,
      refundMethod: 'cash',
      creditAmount: 0,
      creditConsent: false,
      creditExpiryMonths: 12,
      actorName: '',
    });
  }

  // ---------------------------------------------------------------------
  // 保留金餘額、異動紀錄與展延：設計文件第 9.3 節。
  // ---------------------------------------------------------------------

  protected readonly ledger = computed(() => {
    const member = this.member();
    if (!member) return [];
    return [...this.creditStore.entriesFor(member.id)].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  });

  protected readonly balance = computed(() => {
    const member = this.member();
    return member ? this.creditStore.balanceFor(member.id) : 0;
  });

  protected readonly expiringReminders = computed(() => {
    const member = this.member();
    return member ? this.creditStore.expiringWithin(member.id, 30) : [];
  });

  protected readonly extendForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]],
    reason: ['', Validators.required],
    actorName: ['', Validators.required],
    expiresAt: [''],
  });

  protected readonly extendError = signal<string | undefined>(undefined);

  protected submitExtend(): void {
    const member = this.member();
    this.extendForm.markAllAsTouched();
    if (!member || this.extendForm.invalid) return;

    const value = this.extendForm.getRawValue();
    this.extendError.set(undefined);
    try {
      this.creditStore.extend({
        memberId: member.id,
        amount: value.amount,
        occurredAt: new Date().toISOString(),
        handledBy: value.actorName,
        reason: value.reason,
        ...(value.expiresAt ? { expiresAt: new Date(value.expiresAt).toISOString() } : {}),
      });
      this.extendForm.reset({ amount: 0, reason: '', actorName: '', expiresAt: '' });
    } catch {
      this.extendError.set(this.t.customerCreditPanel.extendReasonRequired);
    }
  }
}
