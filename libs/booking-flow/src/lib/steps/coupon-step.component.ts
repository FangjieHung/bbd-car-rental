import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PriceBreakdown } from '@car-rental/domain';
import { CouponResult } from '../catalog.store';
import { injectBookingFlowI18n } from '../i18n/booking-flow-i18n';

@Component({
  selector: 'lib-coupon-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './coupon-step.component.html',
  styleUrl: './coupon-step.component.scss',
})
export class CouponStepComponent {
  @Input() couponCode = '';
  @Input() couponResult: CouponResult | null = null;
  @Input() priceBreakdown: PriceBreakdown | null = null;
  @Output() couponCodeChange = new EventEmitter<string>();

  protected readonly i18n = injectBookingFlowI18n();

  protected onCodeInput(value: string): void {
    this.couponCodeChange.emit(value);
  }
}
