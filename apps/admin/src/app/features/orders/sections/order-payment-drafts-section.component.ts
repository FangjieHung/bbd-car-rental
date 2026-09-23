import { Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { formatTwd } from '@car-rental/domain';
import { PaymentMethod, PaymentPurpose } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { OrderForm, addPaymentDraft, computeOrderQuote, orderFormValue, removePaymentDraft } from '../order-form/order-form';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';

/**
 * 「本次收款」：列表就是紀錄。每一列都是可直接編輯的表單群組（FormArray of FormGroup），
 * 畫面上看到的值就是送出時會寫入款項紀錄的值，沒有獨立於列表之外、需要再按一次「新增」
 * 才會被記住的輸入列——那正是原本「打了金額沒按＋新增款項，這筆錢會被默默丟掉」的 bug 來源
 * （見 order-form.ts 的 addPaymentDraft／removePaymentDraft）。只用於建立訂單；訂單成立後的
 * 收款屬於款項分頁自己的作業，不算「編輯訂單」。
 */
@Component({
  selector: 'app-order-payment-drafts-section',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule],
  templateUrl: './order-payment-drafts-section.component.html',
  styleUrls: ['./order-section.scss', './order-payment-drafts-section.component.scss'],
})
export class OrderPaymentDraftsSectionComponent {
  protected readonly t = ZH_TW;
  protected readonly purposes: PaymentPurpose[] = ['deposit', 'balance', 'adjustment'];
  protected readonly methods: PaymentMethod[] = ['cash', 'credit_card', 'line_pay', 'bank_transfer', 'customer_credit'];

  readonly form = input.required<OrderForm>();

  private readonly data = inject(ORDER_FORM_DATA);
  private readonly value = orderFormValue(this.form);

  protected readonly drafts = computed(() => this.value().payments.drafts);
  /**
   * 逐列的表單群組，供模板以 `[formGroup]` 直接綁定。FormArray#push／removeAt 是原地
   * mutate（`.controls` 陣列參考本身不會換新），單純回傳 `.controls` 會被 computed() 的
   * 預設相等判斷誤判成「沒變」而不重新渲染；所以先讀一次 `this.value()`（新增／刪除列都會
   * 觸發 valueChanges，讓這個 computed 重新求值），再回傳一份新陣列，確保參考一定會變。
   */
  protected readonly draftGroups = computed(() => {
    this.value();
    return [...this.form().controls.payments.controls.drafts.controls];
  });

  private readonly quoteTotal = computed(() => computeOrderQuote(this.value(), this.data)?.total ?? 0);
  protected readonly collectedTotal = computed(() => this.drafts().reduce((sum, d) => sum + (d.amount ?? 0), 0));
  protected readonly dueAfterCreate = computed(() => this.quoteTotal() - this.collectedTotal());
  protected readonly isOverpaid = computed(() => this.dueAfterCreate() < 0);
  protected readonly footerText = computed(() => {
    const t = this.t.orderForm;
    const due = this.dueAfterCreate();
    const tail =
      due < 0 ? `${t.overpaidPrefix}${formatTwd(-due)}` : `${t.balanceAfterCreatePrefix}${formatTwd(due)}`;
    return `${t.paymentsCollectedPrefix}${formatTwd(this.collectedTotal())}${t.paymentsFooterSeparator}${tail}`;
  });

  /**
   * 第一列（目前列表是空的）預設「訂金、金額＝應收訂金（扣掉已列入的訂金——此時列表是空的，
   * 這個扣項恆為 0）」；之後每一列預設「尾款、金額空白」，逼使用者自己看清楚要填多少，
   * 不要用一個像是對的其實是亂猜的數字。方式一律預設現金。
   */
  addDraft(): void {
    const isFirst = this.drafts().length === 0;
    addPaymentDraft(
      this.form(),
      isFirst
        ? { method: 'cash', purpose: 'deposit', amount: this.value().pricing.depositRequired }
        : { method: 'cash', purpose: 'balance', amount: null },
    );
    this.form().controls.payments.markAsDirty();
  }

  removeDraft(index: number): void {
    removePaymentDraft(this.form(), index);
    this.form().controls.payments.markAsDirty();
  }
}
