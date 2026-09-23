import { Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MemberKind } from '@car-rental/domain';
import { ORDER_FORM_LABELS } from '../order-form-labels';
import { OrderForm, lockRenterToMember, orderFormValue, unlockRenter } from '../order-form';
import { ORDER_FORM_DATA } from '../order-form-data';

/**
 * 「承租人」表單區塊：輸入姓名或電話可搜尋既有會員，選到後鎖定並沿用該會員；
 * 沒選既有會員時，送出會新建會員。不依賴 stepper。
 */
@Component({
  selector: 'lib-order-renter-section',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './order-renter-section.component.html',
  styleUrl: './order-section.scss',
})
export class OrderRenterSectionComponent {
  protected readonly t = inject(ORDER_FORM_LABELS);
  protected readonly kinds: MemberKind[] = ['local', 'foreign_visitor', 'resident'];
  private readonly data = inject(ORDER_FORM_DATA);

  readonly form = input.required<OrderForm>();

  private readonly value = orderFormValue(this.form);
  protected readonly locked = computed(() => !!this.value().renter.memberId);
  protected readonly isForeignVisitor = computed(() => this.value().renter.kind === 'foreign_visitor');
  protected readonly identityNumberLabel = computed(
    () => this.t.member.identityNumberLabel[this.value().renter.kind],
  );
  protected readonly memberSuggestions = computed(() =>
    this.locked() ? [] : this.data.searchMembers(this.value().renter.name),
  );

  protected onMemberSelected(event: MatAutocompleteSelectedEvent): void {
    const member = this.data.memberById(event.option.value);
    if (!member) return;
    lockRenterToMember(this.form(), member);
    this.form().controls.renter.markAsDirty();
  }

  protected changeMember(): void {
    unlockRenter(this.form());
    this.form().controls.renter.markAsDirty();
  }
}
