import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PaymentMethod, PaymentPurpose } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { OrderForm, orderFormValue } from '../order-form/order-form';

/**
 * 建立訂單時一併排入的款項草稿（送出時才寫入款項紀錄）。只用於建立訂單——
 * 訂單成立後的收款屬於各自的作業，不算「編輯訂單」。
 */
@Component({
  selector: 'app-order-payment-drafts-section',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './order-payment-drafts-section.component.html',
  styleUrls: ['./order-section.scss', './order-payment-drafts-section.component.scss'],
})
export class OrderPaymentDraftsSectionComponent {
  protected readonly t = ZH_TW;
  protected readonly purposes: PaymentPurpose[] = ['deposit', 'balance', 'adjustment'];
  protected readonly methods: PaymentMethod[] = ['cash', 'credit_card', 'line_pay', 'bank_transfer', 'customer_credit'];

  readonly form = input.required<OrderForm>();

  private readonly value = orderFormValue(this.form);
  protected readonly drafts = computed(() => this.value().payments.drafts);

  addDraft(): void {
    const payments = this.form().controls.payments;
    const { amount, method, purpose } = payments.getRawValue();
    if (!amount || amount <= 0) return;
    payments.controls.drafts.setValue([...payments.controls.drafts.value, { method, amount, purpose }]);
    payments.controls.amount.setValue(0);
    payments.markAsDirty();
  }

  removeDraft(index: number): void {
    const drafts = this.form().controls.payments.controls.drafts;
    drafts.setValue(drafts.value.filter((_, i) => i !== index));
    drafts.markAsDirty();
  }
}
