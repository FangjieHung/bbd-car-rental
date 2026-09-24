import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import {
  AddOn,
  PaymentPreference,
  PriceBreakdown,
  RENTAL_BRANCHES,
  Vehicle,
} from '@car-rental/domain';
import { injectBookingFlowI18n } from '../i18n/booking-flow-i18n';

export interface ConfirmFormValue {
  name: string;
  phone: string;
  email: string;
  paymentMethod: PaymentPreference;
  /** 還車據點 id（見 RENTAL_BRANCHES）。 */
  returnBranchId: string;
}

@Component({
  selector: 'lib-confirm-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatButtonModule, MatSelectModule],
  templateUrl: './confirm-step.component.html',
  styleUrl: './confirm-step.component.scss',
})
export class ConfirmStepComponent {
  protected readonly locations = RENTAL_BRANCHES;

  private _vehicle: Vehicle | null = null;
  @Input() set vehicle(value: Vehicle | null) {
    this._vehicle = value;
    // 預帶跟取車同一個據點（多數人原地還車）；使用者自己選過就不再覆蓋
    if (value?.branchId && !this.returnLocationTouched) {
      this.form.returnBranchId = value.branchId;
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

  protected readonly i18n = injectBookingFlowI18n();
  protected readonly paymentMethods: PaymentPreference[] = [
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
    returnBranchId: RENTAL_BRANCHES[0].id,
  };

  /** 使用者是否自己指定過還車地點——是的話就停止跟著取車地點（車輛所屬據點）連動 */
  private returnLocationTouched = false;

  protected onReturnLocationChange(branchId: string): void {
    this.form.returnBranchId = branchId;
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
