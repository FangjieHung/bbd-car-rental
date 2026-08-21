import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AddOn, PaymentMethod, PriceBreakdown, RENTAL_LOCATIONS, RentalLocation, Vehicle } from '@car-rental/domain';

export interface ConfirmFormValue {
  name: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  returnLocation: RentalLocation;
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  credit_card: '信用卡',
  line_pay: 'LINE Pay',
  on_site: '現場付款',
  bank_transfer: '轉帳',
};

@Component({
  selector: 'app-confirm-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatButtonModule, MatSelectModule],
  templateUrl: './confirm-step.component.html',
  styleUrl: './confirm-step.component.scss',
})
export class ConfirmStepComponent {
  protected readonly locations = RENTAL_LOCATIONS;

  private _vehicle: Vehicle | null = null;
  @Input() set vehicle(value: Vehicle | null) {
    this._vehicle = value;
    // 預帶跟取車同一個據點（多數人原地還車）；使用者自己選過就不再覆蓋
    if (value?.location && !this.returnLocationTouched) {
      this.form.returnLocation = value.location;
    }
  }
  get vehicle(): Vehicle | null {
    return this._vehicle;
  }

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
    returnLocation: RENTAL_LOCATIONS[0],
  };

  /** 使用者是否自己指定過還車地點——是的話就停止跟著取車地點（車輛所屬據點）連動 */
  private returnLocationTouched = false;

  protected onReturnLocationChange(location: RentalLocation): void {
    this.form.returnLocation = location;
    this.returnLocationTouched = true;
  }

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
