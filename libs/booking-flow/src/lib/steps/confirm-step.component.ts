import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { AddOn, PaymentMethod, PriceBreakdown, Vehicle } from '@car-rental/domain';

export interface ConfirmFormValue {
  name: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  credit_card: '信用卡',
  line_pay: 'LINE Pay',
  on_site: '現場付款',
  bank_transfer: '轉帳',
};

@Component({
  selector: 'app-confirm-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatButtonModule],
  templateUrl: './confirm-step.component.html',
  styleUrl: './confirm-step.component.scss',
})
export class ConfirmStepComponent {
  @Input() vehicle: Vehicle | null = null;
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() selectedAddOnLines: { addOn: AddOn; qty: number }[] = [];
  @Input() priceBreakdown: PriceBreakdown | null = null;
  @Input() submitting = false;
  @Input() submitError = '';
  @Output() confirm = new EventEmitter<ConfirmFormValue>();

  protected readonly paymentMethodLabel = PAYMENT_METHOD_LABEL;
  protected readonly paymentMethods: PaymentMethod[] = [
    'credit_card',
    'line_pay',
    'on_site',
    'bank_transfer',
  ];

  protected form: ConfirmFormValue = {
    name: '',
    phone: '',
    email: '',
    paymentMethod: 'on_site',
  };

  protected get canSubmit(): boolean {
    return (
      !!this.priceBreakdown &&
      this.form.name.trim().length > 0 &&
      this.form.phone.trim().length > 0 &&
      this.form.email.trim().length > 0 &&
      !this.submitting
    );
  }

  protected onSubmit(): void {
    if (!this.canSubmit) return;
    this.confirm.emit({ ...this.form });
  }
}
