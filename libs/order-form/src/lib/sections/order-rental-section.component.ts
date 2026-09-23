import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RENTAL_BRANCHES } from '@car-rental/domain';
import { ORDER_FORM_LABELS } from '../order-form-labels';
import { OrderForm, orderFormValue } from '../order-form';
import { ORDER_FORM_DATA } from '../order-form-data';
import { OrderFormContext, createOrderFormDerived } from '../order-form-derived';

/**
 * 「租期與車輛」表單區塊：車輛、取／還車時間、取／還車據點，並即時提示時段衝突與無法試算報價。
 * 不依賴 stepper，可直接放進任何容器（建立訂單精靈、訂單詳情的編輯訂單）。
 */
@Component({
  selector: 'lib-order-rental-section',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './order-rental-section.component.html',
  styleUrl: './order-section.scss',
})
export class OrderRentalSectionComponent {
  protected readonly t = inject(ORDER_FORM_LABELS);
  protected readonly branches = RENTAL_BRANCHES;
  protected readonly data = inject(ORDER_FORM_DATA);

  readonly form = input.required<OrderForm>();
  /** 編輯既有訂單時傳入（衝突檢查排除自己）；新增訂單可省略。 */
  readonly context = input<OrderFormContext>({});

  private readonly value = orderFormValue(this.form);
  protected readonly derived = createOrderFormDerived(this.value, this.data, () => this.context());
}
