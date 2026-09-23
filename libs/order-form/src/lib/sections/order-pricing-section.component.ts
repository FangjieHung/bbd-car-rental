import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ORDER_FORM_LABELS } from '../order-form-labels';
import { NO_INSURANCE_VALUE, OrderForm, orderFormValue } from '../order-form';
import { ORDER_FORM_DATA } from '../order-form-data';
import { OrderFormContext, createOrderFormDerived } from '../order-form-derived';

/**
 * 「費用」表單區塊：報價明細、保險方案、加購項目數量、訂金（含上限提示）。
 * 款項登記不在這裡（建立訂單時另由款項區塊處理；訂單成立後屬於收款作業）。不依賴 stepper。
 */
@Component({
  selector: 'lib-order-pricing-section',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './order-pricing-section.component.html',
  styleUrl: './order-section.scss',
})
export class OrderPricingSectionComponent {
  protected readonly t = inject(ORDER_FORM_LABELS);
  protected readonly NO_INSURANCE_VALUE = NO_INSURANCE_VALUE;
  protected readonly data = inject(ORDER_FORM_DATA);

  readonly form = input.required<OrderForm>();
  /** 編輯既有訂單時傳入原報價（判斷保險方案是否「還沒解決」）；新增訂單可省略。 */
  readonly context = input<OrderFormContext>({});

  private readonly value = orderFormValue(this.form);
  protected readonly derived = createOrderFormDerived(this.value, this.data, () => this.context());

  protected addOnQtyFor(id: string): number {
    return this.value().pricing.addOnQty[id] ?? 0;
  }

  protected setAddOnQty(id: string, raw: string | number): void {
    const qty = Number(raw);
    const safe = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0;
    const control = this.form().controls.pricing.controls.addOnQty;
    control.setValue({ ...control.value, [id]: safe });
    control.markAsDirty();
  }
}
