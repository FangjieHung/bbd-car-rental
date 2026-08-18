import { Component, Signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PARTNER_REPO, Partner } from '@car-rental/domain';
import { BOOKING_CONTEXT, BookingContext, createPartnerBookingContext } from '@car-rental/booking-flow';

/**
 * 夥伴入口的路由 shell。存在的理由是提供 BOOKING_CONTEXT ——
 * route 層的 providers 建立的是 environment injector，拿不到 ActivatedRoute，
 * 元件層的 providers 才可以。子路由的頁面元件由此繼承到夥伴情境。
 *
 * 找不到對應 partner 時（slug 為空或無匹配）顯示「連結無效」，不渲染 router-outlet ——
 * partner 的查找只在 useFactory 這一處做，這裡透過讀回自己 provide 的 BOOKING_CONTEXT
 * 取得同一個 partner signal，不重複查找邏輯。
 */
@Component({
  selector: 'app-partner-shell',
  imports: [RouterOutlet],
  templateUrl: './partner-shell.component.html',
  providers: [
    {
      provide: BOOKING_CONTEXT,
      useFactory: (): BookingContext => {
        const route = inject(ActivatedRoute);
        const partnerRepo = inject(PARTNER_REPO);
        const slug: Signal<string> = toSignal(
          route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
          { initialValue: '' },
        );
        const partner = computed<Partner | null>(
          () => partnerRepo.getAll().find((p) => p.slug === slug()) ?? null,
        );
        return createPartnerBookingContext(partner, slug);
      },
    },
  ],
})
export class PartnerShellComponent {
  private readonly context = inject(BOOKING_CONTEXT);
  protected readonly partner: Signal<Partner | null> = this.context.partner;
}
