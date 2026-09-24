import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddOn } from '@car-rental/domain';
import { injectBookingFlowI18n } from '../i18n/booking-flow-i18n';

@Component({
  selector: 'lib-addon-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './addon-step.component.html',
  styleUrl: './addon-step.component.scss',
})
export class AddonStepComponent {
  protected readonly i18n = injectBookingFlowI18n();

  @Input() addOns: AddOn[] = [];
  @Input() addOnQty: Record<string, number> = {};
  @Output() addOnQtyChange = new EventEmitter<{ addOnId: string; qty: number }>();

  protected qtyOf(addOnId: string): number {
    return this.addOnQty[addOnId] ?? 0;
  }

  protected onQtyInput(addOnId: string, value: string): void {
    const qty = Math.max(0, Number(value) || 0);
    this.addOnQtyChange.emit({ addOnId, qty });
  }
}
