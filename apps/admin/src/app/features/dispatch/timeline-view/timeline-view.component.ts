import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  RentalBooking,
  Vehicle,
  branchName,
  needsDispatch as computeNeedsDispatch,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { addDays, diffDays, fmtDate, startOfDay, startOfWeek } from '../../../core/date-utils';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { OrderDetailNavigation } from '../../orders/navigation/order-detail-navigation';

export interface TimelineBlock {
  startCol: number;
  span: number;
  kind: 'reserved' | 'in_progress';
  bookingId: string;
  memberId: string;
  pickupLocation: string;
  /** 出租中且預定還車時間已過（色塊已延伸到今天）。 */
  overdue: boolean;
  /** 只對 reserved 有意義：取車據點與車輛所在據點不同。 */
  needsDispatch: boolean;
  /** 逾時延伸後與這筆重疊的另一筆訂單（通常是同車下一筆預訂）。 */
  conflict: boolean;
  /**
   * 打磨（3.5）：同一台車、同一段可視範圍裡的第幾條（0 起算）。互相重疊的色塊（例如逾時延伸段
   * 蓋到同車下一筆預訂）會被分配到不同 lane，畫面上上下兩條顯示，兩筆都完整可讀，不再互相蓋住。
   * 沒有重疊的色塊一律是 lane 0。
   */
  lane: number;
}

/**
 * 出租中且預定還車時間已過——與 features/bookings/booking-urgency.ts 的 isOverdueReturn()
 * 同一個判斷，這裡刻意內聯一份並多接受 `now` 參數：那個檔案固定讀 Date.now()、不在本批次
 * 可改動的檔案清單內，而純函式要能在測試裡指定固定的「現在」時間（同 core/date-utils.ts
 * 的 fmtDateTime(iso, now) 一樣的理由），不能依賴執行當下的實際時間。
 */
function isOverdue(booking: RentalBooking, now: Date): boolean {
  return booking.status === 'in_progress' && new Date(booking.endTime).getTime() < now.getTime();
}

export function computeBlocks(
  bookings: RentalBooking[],
  vehicleId: string,
  vehicleLocation: string | null | undefined,
  rangeStart: Date,
  days: number,
  now: Date = new Date(),
): TimelineBlock[] {
  const todayIdx = diffDays(startOfDay(now), rangeStart);
  const blocks: TimelineBlock[] = [];

  for (const b of bookings) {
    if (b.vehicleId !== vehicleId) continue;
    if (b.status !== 'reserved' && b.status !== 'in_progress') continue;

    const startIdx = diffDays(new Date(b.startTime), rangeStart);
    const overdue = isOverdue(b, now);
    // 逾時未還：色塊延伸到今天，讓仍佔用中的車輛在時間軸上看得出來（不再只畫到原訂還車時間）。
    const rawEndIdx = diffDays(new Date(b.endTime), rangeStart);
    const endIdx = overdue ? Math.max(rawEndIdx, todayIdx) : rawEndIdx;
    if (endIdx < 0 || startIdx > days - 1) continue;

    const from = Math.max(startIdx, 0);
    const to = Math.min(endIdx, days - 1);
    blocks.push({
      startCol: from + 1,
      span: to - from + 1,
      kind: b.status as 'reserved' | 'in_progress',
      bookingId: b.id,
      memberId: b.memberId,
      pickupLocation: b.pickupLocation,
      overdue,
      needsDispatch: b.status === 'reserved' && computeNeedsDispatch(vehicleLocation, b.pickupLocation),
      conflict: false,
      lane: 0,
    });
  }

  // 逾時延伸後若與同一台車的下一筆預訂重疊，那一筆也要標出衝突（例如警示框線）。
  for (const overdueBlock of blocks.filter((blk) => blk.overdue)) {
    const overdueEnd = overdueBlock.startCol + overdueBlock.span - 1;
    for (const other of blocks) {
      if (other === overdueBlock || other.kind !== 'reserved') continue;
      const otherEnd = other.startCol + other.span - 1;
      const overlaps = other.startCol <= overdueEnd && otherEnd >= overdueBlock.startCol;
      if (overlaps) other.conflict = true;
    }
  }

  assignLanes(blocks);

  return blocks;
}

/**
 * 打磨（3.5）：貪婪區間排程——依起始欄排序，每筆色塊放進「第一個結束欄小於自己起始欄」的
 * lane；沒有既有 lane 可用就開一條新的。同一台車同時間最多只會有一筆逾時延伸＋一筆下一筆預訂
 * 重疊（reserved 與 in_progress 互斥、每筆訂單各自連續），但演算法本身不假設只會有兩筆重疊，
 * 需要三筆以上重疊時一樣會分配到三個以上的 lane。直接 mutate 傳入的 block 物件。
 */
function assignLanes(blocks: TimelineBlock[]): void {
  const ordered = [...blocks].sort((a, b) => a.startCol - b.startCol || a.span - b.span);
  const laneEndCol: number[] = [];
  for (const block of ordered) {
    const endCol = block.startCol + block.span - 1;
    let lane = laneEndCol.findIndex((end) => end < block.startCol);
    if (lane === -1) lane = laneEndCol.length;
    laneEndCol[lane] = endCol;
    block.lane = lane;
  }
}

/** 打磨（3.5）：這一列（車輛）需要幾條 lane 才能放下所有色塊；沒有色塊時仍是 1（不縮成 0）。 */
export function laneCountOf(blocks: TimelineBlock[]): number {
  return blocks.reduce((max, b) => Math.max(max, b.lane + 1), 1);
}

/**
 * 打磨（3.5）：時間軸日期欄的精簡標題——「9/20」，月份、日期都不補零；跨月（例如 9/30 → 10/1）
 * 讀起來自然看得出換月，不需要額外標示。完整日期（含年份）改放 aria-label／title
 * （fmtDate 的「YYYY/MM/DD」），標題本身不重複印年份，14 欄在 56px 欄寬也放得下。
 */
export function shortDateLabel(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
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
  private memberStore = inject(MemberStore);
  private orderDetail = inject(OrderDetailNavigation);
  readonly fmtDate = fmtDate;
  readonly shortDateLabel = shortDateLabel;
  readonly laneCountOf = laneCountOf;
  readonly gridCols = `140px repeat(${DAYS}, minmax(56px, 1fr))`;
  readonly targetDate = input<Date>(startOfDay(new Date()));
  readonly vehicles = input<Vehicle[] | null>(null);
  /** 點日期欄標題時送出，讓總覽用它選取那一天（見設計文件 3.5）。 */
  readonly dateSelect = output<Date>();

  readonly rows = computed(() => this.vehicles() ?? this.vehicleStore.vehicles());

  readonly rangeStart = signal(startOfWeek(startOfDay(new Date())));
  readonly days = computed(() =>
    Array.from({ length: DAYS }, (_, i) => addDays(this.rangeStart(), i)),
  );
  readonly todayIdx = computed(() => diffDays(new Date(), this.rangeStart()));
  readonly selectedIdx = computed(() => diffDays(startOfDay(this.targetDate()), this.rangeStart()));

  /** 只有第一次執行（元件剛建立）才無條件對齊 targetDate；之後只在新日期落到目前範圍外才移動範圍。 */
  private rangeInitialized = false;

  constructor() {
    effect(() => {
      const target = startOfDay(this.targetDate());
      if (!this.rangeInitialized) {
        this.rangeStart.set(startOfWeek(target));
        this.rangeInitialized = true;
        return;
      }
      const currentStart = untracked(() => this.rangeStart());
      const offset = diffDays(target, currentStart);
      if (offset < 0 || offset >= DAYS) {
        this.rangeStart.set(startOfWeek(target));
      }
    });
  }

  shift(n: number): void {
    this.rangeStart.update((d) => addDays(d, n));
  }

  selectDate(d: Date): void {
    this.dateSelect.emit(d);
  }

  blocksOf(v: Vehicle): TimelineBlock[] {
    return computeBlocks(this.bookingStore.bookings(), v.id, v.location, this.rangeStart(), DAYS);
  }

  /** 列首所在據點：淡色小字，未設定時顯示完整說法（不是車輛清單用的「—」，見 zh-tw.ts 註解）。 */
  locationLabel(v: Vehicle): string {
    return v.location ? branchName(v.location) : this.t.timeline.locationUnset;
  }

  /** 日期欄標題下行的星期字（單一個字，例如「三」）。 */
  weekdayLabel(d: Date): string {
    return this.t.dispatch.weekdays[d.getDay()];
  }

  renterName(block: TimelineBlock): string {
    return this.memberStore.nameOf(block.memberId);
  }

  pickupBranchName(block: TimelineBlock): string {
    return branchName(block.pickupLocation);
  }

  /** 色塊上顯示的文字：承租人姓名與取車據點；空間不夠時樣板用 CSS truncate 截斷。 */
  blockLabel(block: TimelineBlock): string {
    return `${this.renterName(block)}・${this.pickupBranchName(block)}`;
  }

  /** title／aria-label 用的完整資訊：狀態＋色塊文字＋逾時／需調度標示。 */
  blockTitle(block: TimelineBlock): string {
    const parts = [this.t.booking.statusLabels[block.kind], this.blockLabel(block)];
    if (block.overdue) parts.push(this.t.timeline.overdue);
    if (block.needsDispatch) parts.push(this.t.dispatch.workList.needsDispatch);
    return parts.join('・');
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
