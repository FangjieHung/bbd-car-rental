import { Component, computed, input, signal } from '@angular/core';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { TwdPipe } from '../../../shared/pipes/twd.pipe';
import { OrderSummaryView } from './order-summary';

let nextId = 0;

/**
 * 建立訂單頁的「訂單摘要」欄（2.2）：每一步都在，送出前可以一眼核對車輛、租期、據點、承租人、
 * 保險、金額，以及「建立訂單需要」與「建立後待補」。只負責顯示；內容由頁面組好（buildOrderSummary）。
 *
 * 版面依視窗寬度切換（CSS media query，DOM 不變）：
 * - ≥ 1280px：卡片左側整欄，內容全部展開。
 * - < 1280px：卡片頂端一條摘要列（車牌 · 租期 · 報價合計），按一下展開完整內容。
 */
@Component({
  selector: 'app-order-summary',
  imports: [TwdPipe],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  protected readonly t = ZH_TW;
  protected readonly s = ZH_TW.orderSummary;

  readonly summary = input.required<OrderSummaryView>();

  /** 窄版摘要列是否展開（寬版一律展開，不看這個值）。 */
  readonly expanded = signal(false);

  private readonly id = nextId++;
  protected readonly titleId = `order-summary-title-${this.id}`;
  protected readonly detailsId = `order-summary-details-${this.id}`;

  /** 窄版摘要列的租期：「09/25 09:00 → 09/27 09:00」，未填時顯示「未填租期」。 */
  protected readonly barPeriod = computed(() => {
    const { pickupAt, returnAt } = this.summary();
    return pickupAt && returnAt ? `${pickupAt}${this.s.periodArrow}${returnAt}` : this.s.noPeriod;
  });

  /**
   * 「建立訂單需要」四項是否都打勾了。還沒齊之前，「建立後待補」列出的項目（未提供 Email、
   * 合約未簽署…）都還沒意義——車、租期、承租人都還沒定，談不上補；只顯示一行淡色說明。
   */
  protected readonly requirementsMet = computed(() => this.summary().requirements.every((r) => r.met));

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}
