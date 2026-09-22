import { Component, computed, inject, input, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PAYMENT_METHOD_OPTIONS, PaymentMethod, PaymentPurpose } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { BookingStore } from '../../../stores/booking/booking.store';

const PAYMENT_METHODS: PaymentMethod[] = PAYMENT_METHOD_OPTIONS.map((option) => option.value);
const PAYMENT_PURPOSES: PaymentPurpose[] = ['deposit', 'balance', 'adjustment'];

/** 金額必須是大於 0 的正數；0 或負數（含手滑打錯的負號）一律視為無效輸入。 */
function positiveAmountValidator(control: { value: unknown }) {
  const value = control.value;
  return typeof value === 'number' && value > 0 ? null : { nonPositive: true };
}

const BANK_LAST_FIVE_VALIDATORS = [Validators.required, Validators.pattern(/^\d{5}$/)];

/**
 * 訂單工作區「款項」分頁的收付款分類帳 UI。設計文件第 4.2 節：
 * - 摘要區塊：原訂單報價、已確認費用調整、最新應付總額、淨實收、待收餘額、訂金應收、推導狀態。
 * - 交易列：每筆付款各自成列且不可刪除，作廢只改狀態（PaymentStore.voidPayment），
 *   維持分類帳「保留歷史」的原則（見設計原則 2）。
 * - 同一張訂單允許混合付款：方式摘要在出現一種以上已確認付款方式時顯示「混合付款」，
 *   不能用單一 method 欄位蓋掉歷史（見設計文件第 4.2 節）。
 *
 * 送出流程刻意寫成 async 並在寫入前讓出一個 microtask：這不是為了配合目前同步的
 * PaymentStore.recordPayment()，而是讓「送出鎖」在單元測試裡可被真的觀察到
 * （兩次背靠背呼叫 submit()，第二次必須在第一次真正完成前就被鎖擋下），
 * 也預留未來換成真金流非同步呼叫時不必重寫這段防重送邏輯。
 * 寫入失敗時刻意不重置表單：使用者剛輸入的值原樣保留，解除送出鎖後可以直接重試，
 * 不會被「卡住」或被迫重新輸入一次。
 */
@Component({
  selector: 'app-payment-panel',
  imports: [ReactiveFormsModule, SlicePipe, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './payment-panel.component.html',
  styleUrl: './payment-panel.component.scss',
})
export class PaymentPanelComponent {
  protected readonly t = ZH_TW;
  protected readonly methods = PAYMENT_METHODS;
  protected readonly purposes = PAYMENT_PURPOSES;

  private readonly paymentStore = inject(PaymentStore);
  private readonly bookingStore = inject(BookingStore);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly bookingId = input.required<string>();

  protected readonly booking = computed(() =>
    this.bookingStore.bookings().find((b) => b.id === this.bookingId()),
  );
  protected readonly baseTotal = computed(() => this.booking()?.priceBreakdown?.total ?? 0);
  protected readonly depositRequired = computed(() => this.booking()?.depositRequired ?? 0);

  protected readonly payments = computed(() =>
    [...this.paymentStore.paymentsFor(this.bookingId())].sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    ),
  );
  protected readonly adjustments = computed(() => this.paymentStore.adjustmentsFor(this.bookingId()));
  protected readonly confirmedAdjustmentsTotal = computed(() =>
    this.adjustments()
      .filter((a) => a.status === 'confirmed')
      .reduce((sum, a) => sum + a.amount, 0),
  );
  protected readonly summary = computed(() => this.paymentStore.summaryFor(this.bookingId()));

  protected readonly methodSummaryLabel = computed(() => {
    const methods = this.summary().methods;
    if (methods.length === 0) return this.t.paymentPanel.noPaymentsYet;
    if (methods.length > 1) return this.t.paymentPanel.mixedPayment;
    return this.t.bookingForm.paymentMethodLabels[methods[0]];
  });

  protected readonly addFormOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | undefined>(undefined);

  protected readonly form = this.fb.group({
    purpose: ['balance' as PaymentPurpose, Validators.required],
    method: ['cash' as PaymentMethod, Validators.required],
    amount: [0, [Validators.required, positiveAmountValidator]],
    bankLastFive: [''],
    note: [''],
  });

  constructor() {
    this.form.controls.method.valueChanges.subscribe((method) => this.syncBankLastFiveValidators(method));
  }

  private syncBankLastFiveValidators(method: PaymentMethod): void {
    const control = this.form.controls.bankLastFive;
    control.setValidators(method === 'bank_transfer' ? BANK_LAST_FIVE_VALIDATORS : []);
    control.updateValueAndValidity({ emitEvent: false });
  }

  protected openAddForm(): void {
    this.addFormOpen.set(true);
    this.submitError.set(undefined);
  }

  protected cancelAddForm(): void {
    this.addFormOpen.set(false);
    this.submitError.set(undefined);
    this.resetForm();
  }

  protected async submit(): Promise<void> {
    if (this.submitting()) return; // 送出鎖：已有一筆送出在進行中，直接忽略這次呼叫

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.submitError.set(undefined);

    // 讓出一個 microtask 再真正寫入：見類別註解，這是刻意的送出鎖邊界。
    await Promise.resolve();

    const value = this.form.getRawValue();
    try {
      this.paymentStore.recordPayment({
        bookingId: this.bookingId(),
        amount: value.amount,
        method: value.method,
        purpose: value.purpose,
        status: 'confirmed',
        receivedAt: new Date().toISOString(),
        handledBy: this.t.layout.adminUser,
        ...(value.method === 'bank_transfer' && value.bankLastFive ? { bankLastFive: value.bankLastFive } : {}),
        ...(value.note ? { note: value.note } : {}),
      });
      this.resetForm();
      this.addFormOpen.set(false);
    } catch {
      // 刻意不 resetForm()：保留使用者剛輸入的值，讓失敗紀錄可復原、不必重新輸入即可重試。
      this.submitError.set(this.t.paymentPanel.recordFailed);
    } finally {
      this.submitting.set(false);
    }
  }

  private resetForm(): void {
    this.form.reset({ purpose: 'balance', method: 'cash', amount: 0, bankLastFive: '', note: '' });
  }

  protected voidPayment(id: string): void {
    this.paymentStore.voidPayment(id);
  }
}
