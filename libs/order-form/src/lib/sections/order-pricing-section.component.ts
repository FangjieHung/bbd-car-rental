import { Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { AddOn, InsurancePlan, formatTwd } from '@car-rental/domain';
import { NO_INSURANCE_VALUE, OrderForm, orderFormValue } from '../order-form';
import { ORDER_FORM_LABELS } from '../order-form-labels';
import { ORDER_FORM_DATA } from '../order-form-data';
import { OrderFormContext, createOrderFormDerived, orderRentalDays } from '../order-form-derived';

/**
 * 保障項目裡代表「事故時客人自付」的那一項（見 libs/domain 的 insurance-catalog.ts）；
 * 這是比對資料用的鍵，不是畫面文案。找不到時退回第一項保障。
 */
const RENTAL_DEDUCTIBLE_COVERAGE = '租車自負額';

/** 保險方案表格的一列（第一列固定是「不加保」）。 */
interface InsuranceRow {
  id: string;
  name: string;
  /** 事故自負額範圍；不加保沒有這個概念，為 null。 */
  deductible: { min: number; max: number } | null;
  daily: number;
  /** 租期天數 × 每日價；租期未填時為 null。 */
  subtotal: number | null;
}

/** 加購配件表格的一列。 */
interface AddOnRow {
  addOn: AddOn;
  qty: number;
  /** 取自報價明細（與報價合計同一個來源）；還試算不出報價時為 null。 */
  subtotal: number | null;
}

function accidentDeductible(plan: InsurancePlan): { min: number; max: number } | null {
  const item = plan.coverageItems.find((c) => c.name === RENTAL_DEDUCTIBLE_COVERAGE) ?? plan.coverageItems[0];
  return item ? { min: item.deductibleMin, max: item.deductibleMax } : null;
}

/**
 * 「費用」表單區塊：報價明細、保險方案（表格式單選）、加購配件（數量步進器）、應收訂金（含上限提示）。
 * 款項登記不在這裡（建立訂單時另由款項區塊處理；訂單成立後屬於收款作業）。不依賴 stepper。
 *
 * 報價明細只在沒有訂單摘要欄的地方顯示（訂單詳情的「編輯」）；建立訂單頁的摘要欄已列出同樣的金額，
 * 由 `showQuote` 關掉，避免同一個畫面出現兩份。
 */
@Component({
  selector: 'lib-order-pricing-section',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatRadioModule],
  templateUrl: './order-pricing-section.component.html',
  styleUrls: ['./order-section.scss', './order-pricing-section.component.scss'],
})
export class OrderPricingSectionComponent {
  protected readonly t = inject(ORDER_FORM_LABELS);
  protected readonly twd = (amount: number | null | undefined): string => formatTwd(amount ?? NaN);
  protected readonly s = this.t.orderSummary;
  protected readonly NO_INSURANCE_VALUE = NO_INSURANCE_VALUE;
  protected readonly data = inject(ORDER_FORM_DATA);

  readonly form = input.required<OrderForm>();
  /** 編輯既有訂單時傳入原報價（判斷保險方案是否「還沒解決」）；新增訂單可省略。 */
  readonly context = input<OrderFormContext>({});
  /** 是否在區塊頂端列出報價明細（租金／保險／配件／報價合計）。建立訂單頁關（摘要欄已有），訂單詳情編輯開。 */
  readonly showQuote = input(true);

  private readonly value = orderFormValue(this.form);
  protected readonly derived = createOrderFormDerived(this.value, this.data, () => this.context());

  /** 租期天數（與報價引擎同一個定義）；保險表格的「N 天小計」用。 */
  protected readonly days = computed(() => orderRentalDays(this.value().rental) ?? null);
  protected readonly selectedInsurance = computed(() => this.value().pricing.insurancePlanId);

  protected readonly insuranceRows = computed<InsuranceRow[]>(() => {
    const plans = this.derived.vehicle()?.insurancePlans ?? [];
    const days = this.days();
    const subtotal = (daily: number) => (days === null ? null : daily * days);
    return [
      { id: NO_INSURANCE_VALUE, name: this.t.orderForm.insuranceNone, deductible: null, daily: 0, subtotal: subtotal(0) },
      ...plans.map((p) => ({
        id: p.id,
        name: p.name,
        deductible: accidentDeductible(p),
        daily: p.dailyPriceFrom,
        subtotal: subtotal(p.dailyPriceFrom),
      })),
    ];
  });

  protected readonly addOnRows = computed<AddOnRow[]>(() => {
    const quote = this.derived.quote();
    const qty = this.value().pricing.addOnQty;
    return this.data.addOns().map((addOn) => ({
      addOn,
      qty: qty[addOn.id] ?? 0,
      subtotal: quote ? (quote.addOnLines.find((l) => l.addOnId === addOn.id)?.amount ?? 0) : null,
    }));
  });
  /** 配件小計（表格最後一列）：報價明細的 addOnSubtotal；還試算不出報價時為 null。 */
  protected readonly addOnTotal = computed(() => this.derived.quote()?.addOnSubtotal ?? null);

  /**
   * 「應收訂金」欄位的說明：寫出上限與由來（依 libs/domain 的 deposit-cap 規則）。
   * 小客車是報價合計的固定比例；機車／電動車（或尚未選車）目前沒有這條規則，上限固定為 0——
   * 這種情況不能說成「報價合計的 0%」（那會誤導成有比例規則只是算出 0），要明講「沒有規則」。
   */
  protected readonly depositCapHint = computed(() => {
    const t = this.t.orderForm;
    const cap = formatTwd(this.derived.depositCap());
    return this.derived.vehicle()?.category === 'car'
      ? `${t.depositCapPrefix}${cap}${t.depositCapCarSuffix}`
      : `${t.depositCapNoRulePrefix}${cap}`;
  });

  /** 整列可點：點保險方案表格的任一列就選那個方案。 */
  protected selectInsurance(id: string): void {
    const control = this.form().controls.pricing.controls.insurancePlanId;
    if (control.value === id) return;
    control.setValue(id);
    control.markAsDirty();
  }

  /** 數量步進器：每按一次 ±1，最少 0。 */
  protected stepAddOn(id: string, delta: 1 | -1): void {
    const control = this.form().controls.pricing.controls.addOnQty;
    const next = Math.max(0, (control.value[id] ?? 0) + delta);
    if (next === (control.value[id] ?? 0)) return;
    control.setValue({ ...control.value, [id]: next });
    control.markAsDirty();
  }
}
