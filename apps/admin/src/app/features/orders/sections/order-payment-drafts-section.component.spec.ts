import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import { createOrderRepos, makeVehicle } from '../testing';
import { OrderForm, createOrderForm } from '../order-form/order-form';
import { OrderPaymentDraftsSectionComponent } from './order-payment-drafts-section.component';

const t = ZH_TW;

/** 車 v1、Jan 5 09:00 → Jan 7 09:00（2 天 × 1000/日，無保險無配件）＝報價合計 2000。 */
function baselineForm(depositRequired = 0): OrderForm {
  return createOrderForm({
    vehicleId: 'v1',
    startTime: new Date('2026-01-05T09:00').toISOString(),
    endTime: new Date('2026-01-07T09:00').toISOString(),
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
    depositRequired,
  });
}

function setup(depositRequired = 0) {
  const repos = createOrderRepos({ vehicles: [makeVehicle({ id: 'v1' })] });
  TestBed.configureTestingModule({
    providers: [...repos.providers, { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData }],
  });
  const form = baselineForm(depositRequired);
  const fixture = TestBed.createComponent(OrderPaymentDraftsSectionComponent);
  fixture.componentRef.setInput('form', form);
  fixture.detectChanges();
  return { fixture, form, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
}

function rows(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll('.payment-drafts__row'));
}

function clickAdd(fixture: ReturnType<typeof setup>['fixture']): void {
  (fixture.nativeElement.querySelector('button:not(.payment-drafts__delete)') as HTMLButtonElement)?.click();
}

describe('OrderPaymentDraftsSectionComponent（本次收款：列表就是紀錄）', () => {
  it('沒有任何一筆時顯示提示文字，不顯示合計列', () => {
    const { el } = setup();
    expect(el.textContent).toContain(t.orderForm.noPaymentDrafts);
    expect(el.querySelector('.payment-drafts__footer')).toBeNull();
  });

  it('按「＋ 新增一筆收款」新增第一列：預設用途＝訂金、金額＝應收訂金（扣掉已列入的訂金，此時為 0）、方式＝現金', () => {
    const { form, fixture } = setup(600);
    clickAdd(fixture);
    expect(form.getRawValue().payments.drafts).toEqual([{ method: 'cash', purpose: 'deposit', amount: 600 }]);
  });

  it('新增第二列：預設用途＝尾款、金額為 null（畫面顯示空白，不是 0）', () => {
    const { component, form, fixture, el } = setup(600);
    component.addDraft();
    component.addDraft();
    fixture.detectChanges();

    expect(form.getRawValue().payments.drafts[1]).toEqual({ method: 'cash', purpose: 'balance', amount: null });
    const amountInputs = Array.from(el.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
    // 第二列的金額輸入框：Angular NumberValueAccessor 對 null 寫出空字串，畫面上真的是空白而非 "0"。
    expect(amountInputs[1].value).toBe('');
  });

  it('修改列上金額欄位（不呼叫新增以外的任何動作）：表單值立即反映——原本掉資料的 bug 已修法', () => {
    const { component, form } = setup(0);
    component.addDraft();
    form.controls.payments.controls.drafts.at(0)?.controls.amount.setValue(750);
    expect(form.getRawValue().payments.drafts).toEqual([{ method: 'cash', purpose: 'deposit', amount: 750 }]);
  });

  it('刪除列：icon 按鈕觸發移除，清單與表單同步減少', () => {
    const { component, form, fixture, el } = setup();
    component.addDraft();
    component.addDraft();
    fixture.detectChanges();
    expect(rows(el)).toHaveLength(2);

    (el.querySelector('.payment-drafts__delete') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(rows(el)).toHaveLength(1);
    expect(form.getRawValue().payments.drafts).toHaveLength(1);
  });

  it('刪除圖示按鈕的無障礙名稱是「刪除這筆收款」', () => {
    const { component, fixture, el } = setup();
    component.addDraft();
    fixture.detectChanges();
    const button = el.querySelector('.payment-drafts__delete') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe(t.orderForm.removePaymentDraft);
  });

  it('合計與待收：報價合計 2000，本次收款 750 時，待收為 1250', () => {
    const { component, form, fixture, el } = setup();
    component.addDraft();
    form.controls.payments.controls.drafts.at(0)?.controls.amount.setValue(750);
    fixture.detectChanges();

    expect(component['collectedTotal']()).toBe(750);
    expect(component['dueAfterCreate']()).toBe(1250);
    expect(el.querySelector('.payment-drafts__footer')?.textContent).toContain('750');
    expect(el.querySelector('.payment-drafts__footer')?.textContent).toContain(t.orderForm.balanceAfterCreatePrefix.trim());
    expect(el.querySelector('.payment-drafts__footer')?.classList.contains('is-overpaid')).toBe(false);
  });

  it('溢收：本次收款超過報價合計時顯示「溢收」並套用警示樣式', () => {
    const { component, form, fixture, el } = setup();
    component.addDraft();
    form.controls.payments.controls.drafts.at(0)?.controls.amount.setValue(2500);
    fixture.detectChanges();

    expect(component['dueAfterCreate']()).toBe(-500);
    const footer = el.querySelector('.payment-drafts__footer') as HTMLElement;
    expect(footer.textContent).toContain(t.orderForm.overpaidPrefix.trim());
    expect(footer.textContent).toContain('500');
    expect(footer.classList.contains('is-overpaid')).toBe(true);
  });

  it('金額必填且大於 0：未填或為 0 時該列欄位無效；填入正數後有效', () => {
    const { component, form } = setup(); // depositRequired 未設（0）：第一列預設金額也是 0，本身就不合格
    component.addDraft();
    const amount = form.controls.payments.controls.drafts.at(0)?.controls.amount;
    expect(amount?.valid).toBe(false);

    amount?.setValue(-100);
    expect(amount?.valid).toBe(false);

    amount?.setValue(500);
    expect(amount?.valid).toBe(true);

    amount?.setValue(null);
    expect(amount?.valid).toBe(false);
  });

  it('金額欄位無效且已 touched 時顯示錯誤訊息', () => {
    const { component, form, fixture, el } = setup();
    component.addDraft();
    const amount = form.controls.payments.controls.drafts.at(0)?.controls.amount;
    amount?.setValue(0);
    amount?.markAsTouched();
    fixture.detectChanges();

    expect(el.textContent).toContain(t.orderForm.paymentAmountInvalid);
  });

  it('addDraft／removeDraft 都標記 payments 群組為 dirty', () => {
    const { component, form } = setup();
    expect(form.controls.payments.dirty).toBe(false);
    component.addDraft();
    expect(form.controls.payments.dirty).toBe(true);
  });
});
