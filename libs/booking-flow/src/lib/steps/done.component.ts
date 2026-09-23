import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ORDER_REPO } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';

@Component({
  selector: 'lib-booking-done',
  imports: [RouterLink],
  templateUrl: './done.component.html',
  styleUrl: './done.component.scss',
})
export class DoneComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly context = inject(BOOKING_CONTEXT);
  private readonly orderRepo = inject(ORDER_REPO);

  readonly bookingId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  private readonly booking = computed(() => this.orderRepo.getById(this.bookingId()) ?? null);

  /**
   * 訂單的履約狀態（reserved）不代表付款是否完成 —— 在 Task 7 接上真正的付款分類帳、
   * 讓這頁可以查詢實際付款結果之前，不能再用 status 猜「已確認」還是「待付款」，
   * 一律顯示中性文案。查無訂單（例如假的訂單編號）也沿用同一段文案。
   */
  protected readonly statusMessage = computed(
    () => '您的訂單已成立，我們將盡快為您準備車輛，並確認後續付款事宜。',
  );

  /** 夥伴情境要回到夥伴的搜尋頁，不能把客人踢出夥伴品牌的網址 */
  protected readonly homeLink = this.context.basePath;
}
