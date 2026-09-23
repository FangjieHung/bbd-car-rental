import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CancellationQuote, Member, RefundRecord, RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { CancellationStore } from '../../../stores/cancellation/cancellation.store';
import { CreditStore } from '../../../stores/credit/credit.store';
import { createOrderRepos, makeVehicle } from '../testing';
import { OrderCancellationTabComponent } from './order-cancellation-tab.component';

const t = ZH_TW;

class FakeDocumentAssetGateway implements DocumentAssetGateway {
  store(): Promise<StoredDocumentAsset> {
    return Promise.resolve({ assetId: 'asset-1', url: 'blob:1' });
  }
  resolveUrl(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
  remove(): Promise<void> {
    return Promise.resolve();
  }
}

const member: Member = { id: 'm1', name: '王小明', phone: '0912', kind: 'local' };

function booking(status: RentalBooking['status']): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: '2026-10-20T01:00:00.000Z',
    endTime: '2026-10-22T01:00:00.000Z',
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
    status,
    depositRequired: 500,
  };
}

const quotedCase: CancellationQuote = {
  status: 'quoted',
  disposition: 'refund',
  daysBeforePickup: 12,
  depositRefundRate: 1,
  depositRefund: 500,
  otherPrepaymentRefund: 0,
  statutoryCompensation: 0,
  goodwillCompensation: 0,
  transferFee: 0,
  totalCashDue: 500,
  reason: 'customer_cancellation_tier_100pct',
};

function setup(status: RentalBooking['status'], options: { refunds?: RefundRecord[]; before?: () => void } = {}) {
  const repos = createOrderRepos({
    vehicles: [makeVehicle()],
    members: [member],
    bookings: [booking(status)],
    refunds: options.refunds,
  });
  TestBed.configureTestingModule({
    providers: [...repos.providers, { provide: DocumentAssetGateway, useValue: new FakeDocumentAssetGateway() }],
  });
  options.before?.();
  const fixture = TestBed.createComponent(OrderCancellationTabComponent);
  fixture.componentRef.setInput('bookingId', 'b1');
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const stage = (name: 'cancel' | 'refund' | 'credit') => el.querySelector(`[data-stage="${name}"]`) as HTMLElement;
  return { fixture, el, stage };
}

function createQuotedCase(): void {
  TestBed.inject(CancellationStore).createCase({
    bookingId: 'b1',
    contractKind: 'passenger_car',
    responsibility: 'customer',
    reason: 'customer_change_of_mind',
    requestedAt: '2026-10-01T02:00:00.000Z',
    ruleVersion: '2026.1',
    originalDepositPaid: 500,
    originalOtherPrepayment: 0,
    quote: quotedCase,
  });
}

describe('OrderCancellationTabComponent（4.6：取消 → 退款 → 保留金）', () => {
  it('分三段、依序各有小標', () => {
    const { el } = setup('reserved');
    const titles = Array.from(el.querySelectorAll('.cancellation-tab__title')).map((h) => h.textContent?.replace(/\d/g, '').trim());
    expect(titles).toEqual([
      t.orderDetail.cancellationStages.cancel,
      t.orderDetail.cancellationStages.refund,
      t.orderDetail.cancellationStages.credit,
    ]);
  });

  it('已預訂：取消段有建立取消案件與業者復原；退款、保留金段目前沒有能做的事，各收成一行淡色說明', () => {
    const { stage } = setup('reserved');
    expect(stage('cancel').textContent).toContain(t.cancellationPanel.newCaseTitle);
    expect(stage('cancel').querySelector('.cancellation-panel__form')).not.toBeNull();
    expect(stage('cancel').textContent).toContain(t.operatorRecoveryPanel.newCaseTitle);
    // 業者復原的說明寫「請先於下方『業者復原』嘗試…」：業者復原確實排在取消表單下方。
    const panels = Array.from(stage('cancel').children).map((c) => c.tagName.toLowerCase());
    expect(panels.indexOf('app-cancellation-panel')).toBeLessThan(panels.indexOf('app-operator-recovery-panel'));

    expect(stage('refund').querySelector('form')).toBeNull();
    expect(stage('refund').querySelector('.muted')?.textContent).toContain(t.customerCreditPanel.noDisposableCases);
    expect(stage('credit').querySelector('form')).toBeNull();
    expect(stage('credit').querySelector('.muted')?.textContent).toContain(t.customerCreditPanel.noCreditToExtend);
  });

  it('不能取消的訂單（出租中、已完成、已取消）：取消段只剩一行說明，不給任何建案表單', () => {
    for (const status of ['in_progress', 'completed', 'cancelled'] as const) {
      TestBed.resetTestingModule();
      const { stage } = setup(status);
      const cancel = stage('cancel');
      expect(cancel.querySelector('.cancellation-panel__empty')?.textContent?.trim()).toBe(
        t.cancellationPanel.notApplicableNotice,
      );
      expect(cancel.querySelector('form')).toBeNull();
      expect(cancel.querySelector('.operator-recovery-panel')).toBeNull();
    }
  });

  it('試算完成的取消案件：退款段出現撥付表單；取消段列出案件', () => {
    const { stage } = setup('reserved', { before: createQuotedCase });
    expect(stage('refund').querySelector('form')).not.toBeNull();
    expect(stage('refund').textContent).toContain(t.customerCreditPanel.submitDisposition);
    expect(stage('cancel').textContent).toContain(t.cancellationPanel.statusLabels['quoted']);
    // 撥付表單只在退款段，不會重複出現在保留金段
    expect(stage('credit').textContent).not.toContain(t.customerCreditPanel.submitDisposition);
  });

  it('已取消、退款處理中（種子 b7 的情境）：退款段列出那筆退款紀錄，「退款待處理」點進來看得到', () => {
    const { stage } = setup('cancelled', {
      refunds: [{ id: 'r1', bookingId: 'b1', amount: 300, method: 'cash', status: 'pending', handledBy: 'staff' }],
    });
    const refund = stage('refund');
    expect(refund.textContent).toContain(t.customerCreditPanel.refundsTitle);
    expect(refund.querySelector('.customer-credit-panel__refunds')?.textContent).toContain('NT$300');
    expect(refund.querySelector('.customer-credit-panel__refunds')?.textContent).toContain(
      t.activityTimeline.refundStatusLabels['pending'],
    );
  });

  it('有保留金才出現展延表單', () => {
    const { stage } = setup('completed', {
      before: () =>
        TestBed.inject(CreditStore).issue({
          memberId: 'm1',
          amount: 200,
          occurredAt: '2026-07-01T00:00:00.000Z',
          handledBy: 'staff',
        }),
    });
    expect(stage('credit').querySelector('form')).not.toBeNull();
    expect(stage('credit').textContent).toContain(t.customerCreditPanel.submitExtend);
  });
});
