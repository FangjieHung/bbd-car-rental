import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Coupon, PriceBreakdown } from '@car-rental/domain';

@Component({
  selector: 'app-coupon-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './coupon-step.component.html',
  styleUrl: './coupon-step.component.scss',
})
export class CouponStepComponent {
  @Input() couponCode = '';
  @Input() couponResult: { ok: boolean; coupon?: Coupon; reason?: string } | null = null;
  @Input() priceBreakdown: PriceBreakdown | null = null;
  @Output() couponCodeChange = new EventEmitter<string>();

  protected onCodeInput(value: string): void {
    this.couponCodeChange.emit(value);
  }
}
