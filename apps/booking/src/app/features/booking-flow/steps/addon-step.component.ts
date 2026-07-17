import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddOn } from '@car-rental/domain';

const UNIT_LABEL: Record<AddOn['unit'], string> = {
  per_rental: '每筆訂單',
  per_day: '每日',
};

@Component({
  selector: 'app-addon-step',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './addon-step.component.html',
  styleUrl: './addon-step.component.scss',
})
export class AddonStepComponent {
  @Input() addOns: AddOn[] = [];
  @Input() addOnQty: Record<string, number> = {};
  @Output() addOnQtyChange = new EventEmitter<{ addOnId: string; qty: number }>();

  protected readonly unitLabel = UNIT_LABEL;

  protected qtyOf(addOnId: string): number {
    return this.addOnQty[addOnId] ?? 0;
  }

  protected onQtyInput(addOnId: string, value: string): void {
    const qty = Math.max(0, Number(value) || 0);
    this.addOnQtyChange.emit({ addOnId, qty });
  }
}
