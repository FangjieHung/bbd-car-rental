import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BOOKING_REPO } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';

@Component({
  selector: 'app-booking-done',
  imports: [RouterLink],
  templateUrl: './done.component.html',
  styleUrl: './done.component.scss',
})
export class DoneComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly context = inject(BOOKING_CONTEXT);
  private readonly bookingRepo = inject(BOOKING_REPO);

  readonly bookingId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  private readonly booking = computed(() => this.bookingRepo.getById(this.bookingId()) ?? null);

  /**
   * 正常路徑（search → order → pay 成功 → done）走到這裡時訂單已是 confirmed，
   * 文案要如實反映；PaymentPageComponent 對非待付款訂單、以及舊版
   * /book/done/:id 連結，也會落在這頁，此時訂單仍是 pending_payment，
   * 沿用「待付款/待人工確認」的文案。查無訂單（例如假的訂單編號）也視同待處理。
   */
  protected readonly statusMessage = computed(() =>
    this.booking()?.status === 'confirmed'
      ? '您的訂單已成立並確認，我們將盡快為您準備車輛。'
      : '您的訂單已成立，狀態為「待付款/待人工確認」，我們將盡快為您處理。',
  );

  /** 夥伴情境要回到夥伴的搜尋頁，不能把客人踢出夥伴品牌的網址 */
  protected readonly homeLink = this.context.basePath;
}
