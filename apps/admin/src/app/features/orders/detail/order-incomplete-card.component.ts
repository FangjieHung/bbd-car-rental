import { Component, input, output } from '@angular/core';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { OrderIncompleteItem } from '../incomplete/order-incomplete';

let nextId = 0;

/**
 * 訂單詳情總覽最上方的「待補」卡（4.1）：列出這筆訂單目前還缺的事，每一項可點，
 * 到能處理它的地方（款項／合約分頁，或承租人的會員資料）。規則與建立訂單摘要欄的「建立後待補」同一套。
 * 只負責顯示；沒有待補時整張卡不出現（由頁面決定，這裡不處理空清單）。
 */
@Component({
  selector: 'app-order-incomplete-card',
  templateUrl: './order-incomplete-card.component.html',
  styleUrl: './order-incomplete-card.component.scss',
})
export class OrderIncompleteCardComponent {
  protected readonly t = ZH_TW;

  readonly items = input.required<OrderIncompleteItem[]>();
  /** 點了某一項：由頁面決定怎麼帶過去（切分頁或開會員資料）。 */
  readonly selectItem = output<OrderIncompleteItem>();

  protected readonly titleId = `order-incomplete-title-${nextId++}`;
}
