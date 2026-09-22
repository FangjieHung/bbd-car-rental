import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddOn } from '@car-rental/domain';
import { BOOKING_FLOW_LABELS } from '../booking-flow-labels';

@Component({
  selector: 'app-addon-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './addon-step.component.html',
  styleUrl: './addon-step.component.scss',
})
export class AddonStepComponent {
  private readonly labels = inject(BOOKING_FLOW_LABELS);

  @Input() addOns: AddOn[] = [];
  @Input() addOnQty: Record<string, number> = {};
  @Output() addOnQtyChange = new EventEmitter<{ addOnId: string; qty: number }>();

  protected readonly unitLabel = this.labels.addOnUnit;

  protected qtyOf(addOnId: string): number {
    return this.addOnQty[addOnId] ?? 0;
  }

  protected onQtyInput(addOnId: string, value: string): void {
    const qty = Math.max(0, Number(value) || 0);
    this.addOnQtyChange.emit({ addOnId, qty });
  }
}
