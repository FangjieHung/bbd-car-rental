import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PaymentPanelComponent } from './payment-panel.component';
import {
  ORDER_REPO,
  VEHICLE_REPO,
  MAINTENANCE_REPO,
  PAYMENT_REPO,
  REFUND_REPO,
  CHARGE_ADJUSTMENT_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ChargeAdjustment, MaintenanceRecord, PaymentRecord, RefundRecord, RentalOrder, Repository, Vehicle } from '../../../core/models';

function makeOrder(partial: Partial<RentalOrder> = {}): RentalOrder {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: '2026-01-05T01:00:00.000Z',
    endTime: '2026-01-07T01:00:00.000Z',
    pickupBranchId: '機場',
    returnBranchId: '機場',
    status: 'reserved',
    depositRequired: 300,
    priceBreakdown: {
      dailyLines: [],
      rentalRaw: 1000,
      tierDiscountPercent: 0,
      tierDiscountAmount: 0,
      rentalSubtotal: 1000,
      partnerDiscountPercent: 0,
      partnerDiscount: 0,
      addOnLines: [],
      addOnSubtotal: 0,
      insuranceSubtotal: 0,
      couponDiscount: 0,
      total: 1000,
    },
    ...partial,
  };
}

/** 讓 create() 在指定次數內連續丟出錯誤，之後恢復正常——用來模擬「收款寫入失敗但可重試」。 */
function createFlakyRepo<T extends { id: string }>(initial: T[], failFirstNCalls: number): Repository<T> {
  const real = createInMemoryRepo<T>(initial);
  let calls = 0;
  return {
    ...real,
    create: (item: T) => {
      calls += 1;
      if (calls <= failFirstNCalls) {
        throw new Error('模擬寫入失敗');
      }
      return real.create(item);
    },
  };
}

interface FixtureOptions {
  order?: RentalOrder;
  paymentRepo?: Repository<PaymentRecord>;
  adjustments?: ChargeAdjustment[];
  refunds?: RefundRecord[];
}

function createFixture(options: FixtureOptions = {}) {
  const order = options.order ?? makeOrder();
  const orderRepo = createInMemoryRepo<RentalOrder>([order]);
  const paymentRepo = options.paymentRepo ?? createInMemoryRepo<PaymentRecord>([]);
  const refundRepo = createInMemoryRepo<RefundRecord>(options.refunds ?? []);
  const adjustmentRepo = createInMemoryRepo<ChargeAdjustment>(options.adjustments ?? []);

  TestBed.configureTestingModule({
    providers: [
      { provide: ORDER_REPO, useValue: orderRepo },
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([]) },
      { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      { provide: PAYMENT_REPO, useValue: paymentRepo },
      { provide: REFUND_REPO, useValue: refundRepo },
      { provide: CHARGE_ADJUSTMENT_REPO, useValue: adjustmentRepo },
    ],
  });

  const fixture = TestBed.createComponent(PaymentPanelComponent);
  fixture.componentRef.setInput('bookingId', order.id);
  fixture.detectChanges();
  const paymentStore = TestBed.inject(PaymentStore);

  return { fixture, component: fixture.componentInstance, order, orderRepo, paymentRepo, refundRepo, adjustmentRepo, paymentStore };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function fillForm(
  component: PaymentPanelComponent,
  partial: Partial<{ purpose: string; method: string; amount: number; bankLastFive: string; note: string }> = {},
): void {
  component['form'].patchValue({
    purpose: 'balance',
    method: 'cash',
    amount: 500,
    bankLastFive: '',
    note: '',
    ...partial,
  } as never);
}

describe('PaymentPanelComponent 摘要區塊', () => {
  it('初始（無任何付款）：原訂單報價、最新應付總額等於報價，淨實收 0，待收餘額等於報價，狀態為 deposit_due', () => {
    const { component } = createFixture();

    expect(component['baseTotal']()).toBe(1000);
    expect(component['depositRequired']()).toBe(300);
    expect(component['summary']().requiredTotal).toBe(1000);
    expect(component['summary']().netPaid).toBe(0);
    expect(component['summary']().balanceDue).toBe(1000);
    expect(component['summary']().status).toBe('deposit_due');
  });

  it('已確認費用調整會計入最新應付總額；未確認（draft）的不算', () => {
    const { component } = createFixture({
      adjustments: [
        { id: 'a1', bookingId: 'b1', kind: 'late_return', quotedAmount: 200, amount: 200, status: 'confirmed', createdAt: 't', handledBy: 'x' },
        { id: 'a2', bookingId: 'b1', kind: 'manual', quotedAmount: 50, amount: 50, status: 'draft', createdAt: 't', handledBy: 'x' },
      ],
    });

    expect(component['confirmedAdjustmentsTotal']()).toBe(200);
    expect(component['summary']().requiredTotal).toBe(1200);
  });

  it('收訂金後狀態變成 deposit_paid，收足尾款後變成 paid_in_full；之後確認一筆費用調整又變成 additional_payment_due', () => {
    const { component, paymentStore } = createFixture();

    paymentStore.recordPayment({
      bookingId: 'b1',
      amount: 300,
      method: 'cash',
      purpose: 'deposit',
      status: 'confirmed',
      receivedAt: new Date().toISOString(),
      handledBy: 'tester',
    });
    expect(component['summary']().status).toBe('deposit_paid');

    paymentStore.recordPayment({
      bookingId: 'b1',
      amount: 700,
      method: 'credit_card',
      purpose: 'balance',
      status: 'confirmed',
      receivedAt: new Date().toISOString(),
      handledBy: 'tester',
    });
    expect(component['summary']().status).toBe('paid_in_full');
    expect(component['summary']().balanceDue).toBe(0);

    const adjustment = paymentStore.createAdjustment({
      bookingId: 'b1',
      kind: 'late_return',
      quotedAmount: 150,
      amount: 150,
      createdAt: new Date().toISOString(),
      handledBy: 'tester',
    });
    paymentStore.confirmAdjustment(adjustment.id);

    expect(component['summary']().status).toBe('additional_payment_due');
    expect(component['summary']().balanceDue).toBe(150);
  });

  it('混合付款：兩種不同付款方式時，方式摘要顯示「混合付款」而不是被其中一個覆蓋', () => {
    const { component, paymentStore } = createFixture();

    expect(component['methodSummaryLabel']()).toBe(component['t'].paymentPanel.noPaymentsYet);

    paymentStore.recordPayment({
      bookingId: 'b1',
      amount: 300,
      method: 'cash',
      purpose: 'deposit',
      status: 'confirmed',
      receivedAt: new Date().toISOString(),
      handledBy: 'tester',
    });
    expect(component['methodSummaryLabel']()).toBe(component['t'].orderForm.paymentMethodLabels['cash']);

    paymentStore.recordPayment({
      bookingId: 'b1',
      amount: 700,
      method: 'line_pay',
      purpose: 'balance',
      status: 'confirmed',
      receivedAt: new Date().toISOString(),
      handledBy: 'tester',
    });
    expect(component['methodSummaryLabel']()).toBe(component['t'].paymentPanel.mixedPayment);
  });
});

describe('PaymentPanelComponent 交易紀錄列', () => {
  it('多筆付款皆各自顯示為一列，不互相覆蓋', () => {
    const { component, paymentStore } = createFixture();
    paymentStore.recordPayment({
      bookingId: 'b1', amount: 300, method: 'cash', purpose: 'deposit',
      status: 'confirmed', receivedAt: '2026-01-01T00:00:00.000Z', handledBy: 'a',
    });
    paymentStore.recordPayment({
      bookingId: 'b1', amount: 700, method: 'line_pay', purpose: 'balance',
      status: 'confirmed', receivedAt: '2026-01-02T00:00:00.000Z', handledBy: 'a',
    });

    expect(component['payments']()).toHaveLength(2);
  });

  it('作廢一筆付款：紀錄仍在列表中（不是刪除），狀態變成 voided，且不再計入淨實收', () => {
    const { component, paymentStore } = createFixture();
    const payment = paymentStore.recordPayment({
      bookingId: 'b1', amount: 300, method: 'cash', purpose: 'deposit',
      status: 'confirmed', receivedAt: new Date().toISOString(), handledBy: 'a',
    });
    expect(component['summary']().netPaid).toBe(300);

    component['voidPayment'](payment.id);

    expect(component['payments']()).toHaveLength(1); // 仍在列表，不是刪除
    expect(component['payments']()[0].status).toBe('voided');
    expect(component['summary']().netPaid).toBe(0);
  });
});

describe('PaymentPanelComponent 新增收款表單', () => {
  it('非正數金額會被拒絕：表單無效，不會建立付款紀錄', () => {
    const { component, paymentRepo } = createFixture();
    component['openAddForm']();
    fillForm(component, { amount: 0 });

    component['submit']();

    expect(paymentRepo.getAll()).toHaveLength(0);
    expect(component['form'].invalid).toBe(true);

    fillForm(component, { amount: -100 });
    expect(component['form'].invalid).toBe(true);
  });

  it('付款方式為銀行轉帳時，後五碼為必填且必須是 5 位數字；其他付款方式則不需要', () => {
    const { component } = createFixture();
    component['openAddForm']();
    fillForm(component, { method: 'bank_transfer', amount: 500, bankLastFive: '' });

    expect(component['form'].controls.bankLastFive.invalid).toBe(true);

    component['form'].patchValue({ bankLastFive: '123' } as never);
    expect(component['form'].controls.bankLastFive.invalid).toBe(true);

    component['form'].patchValue({ bankLastFive: '12345' } as never);
    expect(component['form'].controls.bankLastFive.valid).toBe(true);

    component['form'].patchValue({ method: 'cash', bankLastFive: '' } as never);
    expect(component['form'].controls.bankLastFive.valid).toBe(true);
  });

  it('成功送出後會建立一筆已確認付款、清空表單並關閉新增區塊', async () => {
    const { component, paymentRepo } = createFixture();
    component['openAddForm']();
    fillForm(component, { purpose: 'balance', method: 'credit_card', amount: 500, note: '現場刷卡' });

    await component['submit']();
    await flush();

    expect(paymentRepo.getAll()).toHaveLength(1);
    expect(paymentRepo.getAll()[0]).toMatchObject({
      bookingId: 'b1',
      amount: 500,
      method: 'credit_card',
      purpose: 'balance',
      status: 'confirmed',
      note: '現場刷卡',
    });
    expect(component['addFormOpen']()).toBe(false);
    expect(component['submitting']()).toBe(false);
  });

  it('雙重送出鎖：在第一次送出流程完成前重複呼叫 submit，不會建立第二筆紀錄', async () => {
    const { component, paymentRepo } = createFixture();
    component['openAddForm']();
    fillForm(component, { amount: 500 });

    const first = component['submit']();
    const second = component['submit'](); // 應被鎖擋下，直接 no-op
    await Promise.all([first, second]);
    await flush();

    expect(paymentRepo.getAll()).toHaveLength(1);
  });

  it('寫入失敗時可復原：表單內容保留、送出鎖解除，重試後可成功建立紀錄', async () => {
    const flakyRepo = createFlakyRepo<PaymentRecord>([], 1);
    const { component, paymentRepo } = createFixture({ paymentRepo: flakyRepo });
    component['openAddForm']();
    fillForm(component, { purpose: 'balance', method: 'cash', amount: 888, note: '重試案例' });

    await component['submit']();
    await flush();

    expect(paymentRepo.getAll()).toHaveLength(0); // 第一次失敗，沒有留下髒紀錄
    expect(component['submitting']()).toBe(false); // 沒有卡住，鎖已解除
    expect(component['submitError']()).toBeTruthy();
    expect(component['form'].controls.amount.value).toBe(888); // 表單內容保留，不必重新輸入
    expect(component['addFormOpen']()).toBe(true); // 表單仍開著

    await component['submit'](); // 重試
    await flush();

    expect(paymentRepo.getAll()).toHaveLength(1);
    expect(paymentRepo.getAll()[0]).toMatchObject({ amount: 888, note: '重試案例' });
    expect(component['submitError']()).toBeFalsy();
  });
});

describe('PaymentPanelComponent 沒有報價快照的舊訂單', () => {
  function summaryText(fixture: { nativeElement: HTMLElement }) {
    const el = fixture.nativeElement as HTMLElement;
    const dts = [...el.querySelectorAll('.payment-panel__summary-grid dt')].map((d) => d.textContent?.trim());
    const dds = [...el.querySelectorAll('.payment-panel__summary-grid dd')].map((d) => d.textContent?.trim());
    const value = (label: string) => dds[dts.indexOf(label)];
    const status = el.querySelector('.payment-panel__status');
    return { value, status };
  }

  it('原訂單報價／最新應付總額／待收餘額顯示「—」，狀態說明無法判斷，不出現溢收', () => {
    const { fixture, paymentStore } = createFixture({ order: makeOrder({ priceBreakdown: undefined }) });
    paymentStore.recordPayment({
      bookingId: 'b1', amount: 700, method: 'cash', purpose: 'deposit',
      status: 'confirmed', receivedAt: new Date().toISOString(), handledBy: 'tester',
    });
    fixture.detectChanges();

    const { value, status } = summaryText(fixture);
    expect(value('原訂單報價')).toBe('—');
    expect(value('最新應付總額')).toBe('—');
    expect(value('待收餘額')).toBe('—');
    expect(value('淨實收')).toBe('NT$700');
    expect(status?.textContent?.trim()).toBe('尚無報價，無法判斷收款狀態');
    expect(status?.classList.contains('payment-panel__status--overpaid')).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('溢收');
  });

  it('有報價的訂單照舊顯示金額與推導狀態', () => {
    const { fixture } = createFixture();
    const { value, status } = summaryText(fixture);
    expect(value('原訂單報價')).toBe('NT$1,000');
    expect(value('待收餘額')).toBe('NT$1,000');
    expect(status?.textContent?.trim()).toBe('待收訂金');
  });
});
