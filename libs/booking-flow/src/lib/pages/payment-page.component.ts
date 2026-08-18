import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { BOOKING_REPO, PaymentMethod, RentalBooking } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { CatalogStore } from '../catalog.store';

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  credit_card: '信用卡',
  line_pay: 'LINE Pay',
  on_site: '現場付款',
  bank_transfer: '轉帳',
};

/**
 * 佔位付款頁。目前用兩顆按鈕模擬金流結果。
 * 串接真金流時，只需把 onPaySuccess/onPayFailure 換成 SDK 呼叫或 redirect，
 * 並新增回調路由 pay/:bookingId/result —— 流程結構不必再動。
 */
@Component({
  selector: 'app-payment-page',
  imports: [MatButtonModule],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogStore);
  private readonly context = inject(BOOKING_CONTEXT);
  private readonly bookingRepo = inject(BOOKING_REPO);

  readonly bookingId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('bookingId') ?? '')),
    { initialValue: '' },
  );

  readonly booking = computed<RentalBooking | null>(
    () => this.bookingRepo.getById(this.bookingId()) ?? null,
  );

  readonly amount = computed(() => this.booking()?.priceBreakdown?.total ?? 0);
  readonly paymentMethodLabel = computed(() => {
    const method = this.booking()?.paymentMethod;
    return method ? PAYMENT_METHOD_LABEL[method] : '未指定';
  });

  readonly payError = signal('');
  readonly paying = signal(false);

  /**
   * 進頁面就檢查一次，訂單不存在或早就不是待付款（分享的舊網址、上一步按了兩次）
   * 不必等使用者按下按鈕才發現。付款成功那條路徑另外用 onPaySuccess 裡的顯式
   * 呼叫立即導頁，這裡的自動檢查是給「載入當下就已經不可付款」的情況兜底。
   */
  private readonly guardEffect = effect(() => {
    this.redirectIfNotPayable();
  });

  /** 訂單不存在或已付過款，就沒有付款這件事可做，直接看結果頁 */
  redirectIfNotPayable(): boolean {
    const booking = this.booking();
    if (booking && booking.status === 'pending_payment') return true;
    this.goToDone();
    return false;
  }

  onPaySuccess(): void {
    this.paying.set(true);
    this.payError.set('');
    try {
      this.catalog.markBookingPaid(this.bookingId());
      this.goToDone();
    } catch (err) {
      this.payError.set(err instanceof Error ? err.message : '付款失敗，請稍後再試');
    } finally {
      this.paying.set(false);
    }
  }

  onPayFailure(): void {
    this.payError.set('付款未完成，請重新嘗試或改用其他付款方式。');
  }

  /**
   * 導向完成頁有兩條觸發路徑：onPaySuccess 的顯式呼叫（讓使用者按下按鈕當下就導頁，
   * 不必等一輪 change detection），以及 guardEffect 因 booking() 改變而重新求值。
   */
  private goToDone(): void {
    const target = [...this.context.basePath(), 'done', this.bookingId()];
    this.router.navigate(target);
  }
}
