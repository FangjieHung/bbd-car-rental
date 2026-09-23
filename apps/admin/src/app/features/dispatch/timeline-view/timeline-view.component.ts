import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RentalBooking, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { addDays, diffDays, fmtDate, startOfDay } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { OrderDetailNavigation } from '../../orders/navigation/order-detail-navigation';

export interface TimelineBlock {
  startCol: number;
  span: number;
  kind: 'reserved' | 'in_progress';
  bookingId: string;
}

export function computeBlocks(
  bookings: RentalBooking[],
  vehicleId: string,
  rangeStart: Date,
  days: number,
): TimelineBlock[] {
  const blocks: TimelineBlock[] = [];
  for (const b of bookings) {
    if (b.vehicleId !== vehicleId) continue;
    if (b.status !== 'reserved' && b.status !== 'in_progress') continue;
    const startIdx = diffDays(new Date(b.startTime), rangeStart);
    const endIdx = diffDays(new Date(b.endTime), rangeStart);
    if (endIdx < 0 || startIdx > days - 1) continue;
    const from = Math.max(startIdx, 0);
    const to = Math.min(endIdx, days - 1);
    blocks.push({ startCol: from + 1, span: to - from + 1, kind: b.status, bookingId: b.id });
  }
  return blocks;
}

const DAYS = 14;

@Component({
  selector: 'app-timeline-view',
  imports: [MatButtonModule],
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.scss'],
})
export class TimelineViewComponent {
  protected readonly t = ZH_TW;
  readonly vehicleStore = inject(VehicleStore);
  private bookingStore = inject(BookingStore);
  private orderDetail = inject(OrderDetailNavigation);
  readonly fmtDate = fmtDate;
  readonly gridCols = `120px repeat(${DAYS}, minmax(48px, 1fr))`;
  readonly targetDate = input<Date>(startOfDay(new Date()));
  readonly vehicles = input<Vehicle[] | null>(null);

  readonly rows = computed(() => this.vehicles() ?? this.vehicleStore.vehicles());

  readonly rangeStart = signal(startOfDay(new Date()));
  readonly days = computed(() =>
    Array.from({ length: DAYS }, (_, i) => addDays(this.rangeStart(), i)),
  );
  readonly todayIdx = computed(() => diffDays(new Date(), this.rangeStart()));

  constructor() {
    effect(() => {
      this.rangeStart.set(startOfDay(this.targetDate()));
    });
  }

  shift(n: number): void {
    this.rangeStart.update((d) => addDays(d, n));
  }

  blocksOf(vehicleId: string): TimelineBlock[] {
    return computeBlocks(this.bookingStore.bookings(), vehicleId, this.rangeStart(), DAYS);
  }

  /**
   * 原本開一個只有唯讀欄位的簡化 detail dialog；訂單詳情已經是唯一的訂單檢視／操作入口
   * （見設計文件第 6 節），這裡直接前往訂單詳情，不再維護第二套簡化版本。
   */
  openDetail(bookingId: string): void {
    const booking = this.bookingStore.bookings().find((b) => b.id === bookingId);
    if (booking) void this.orderDetail.open(booking.id);
  }
}
