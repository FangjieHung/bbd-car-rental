import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RentalBooking } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { addDays, diffDays, fmtDate, startOfDay } from '../../core/date-utils';
import { BookingStore } from '../../stores/booking.store';
import { VehicleStore } from '../../stores/vehicle.store';
import { BookingDetailDialogComponent } from './booking-detail-dialog.component';

export interface TimelineBlock {
  startCol: number;
  span: number;
  kind: 'confirmed' | 'in_progress';
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
    if (b.status !== 'confirmed' && b.status !== 'in_progress') continue;
    const startIdx = diffDays(new Date(b.startTime), rangeStart);
    const endIdx = diffDays(new Date(b.endTime), rangeStart); // 含結束日
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
  template: `
    <div class="flex items-center gap-2">
      <button mat-button (click)="shift(-14)">{{ t.dispatch.prevRange }}</button>
      <button mat-button (click)="shift(14)">{{ t.dispatch.nextRange }}</button>
    </div>
    <div class="v-card overflow-x-auto !p-0">
      <div class="min-w-[900px]">
        <!-- 表頭列 -->
        <div class="grid" [style.grid-template-columns]="gridCols">
          <div class="text-xs font-bold p-2">{{ t.booking.vehicle }}</div>
          @for (d of days(); track $index) {
            <div class="text-xs text-center p-2" style="color: var(--text-tertiary); border-left: 1px solid var(--border-subtle)">{{ fmtDate(d) }}</div>
          }
        </div>
        <!-- 每台車一列 -->
        @for (v of vehicleStore.vehicles(); track v.id) {
          <div class="relative" style="border-top: 1px solid var(--border-subtle)">
            <div class="grid" [style.grid-template-columns]="gridCols">
              <div class="text-sm p-2 whitespace-nowrap">
                {{ v.plateNumber }}
                @if (v.status === 'maintenance') {
                  <span class="text-xs" style="color: var(--text-tertiary)">（{{ t.dispatch.maintenanceBlock }}）</span>
                }
              </div>
              @for (d of days(); track $index) {
                <div class="min-h-10"
                     style="border-left: 1px solid var(--border-subtle)"
                     [style.background]="v.status === 'maintenance' && $index === todayIdx() ? 'var(--cream-300)' : null"></div>
              }
            </div>
            <!-- 色塊層 -->
            <div class="absolute inset-0 grid pointer-events-none" [style.grid-template-columns]="gridCols">
              <div></div>
              @for (block of blocksOf(v.id); track block.bookingId) {
                <button
                  class="pointer-events-auto self-center h-6 rounded text-xs truncate px-1.5 cursor-pointer font-semibold"
                  style="color: #fff"
                  [style.background]="block.kind === 'confirmed' ? 'var(--teal-500)' : 'var(--sage-500)'"
                  [style.grid-column]="(block.startCol + 1) + ' / span ' + block.span"
                  [style.grid-row]="1"
                  (click)="openDetail(block.bookingId)">
                  {{ t.booking.statusLabels[block.kind] }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TimelineViewComponent {
  protected readonly t = ZH_TW;
  readonly vehicleStore = inject(VehicleStore);
  private bookingStore = inject(BookingStore);
  private dialog = inject(MatDialog);
  readonly fmtDate = fmtDate;
  readonly gridCols = `120px repeat(${DAYS}, minmax(48px, 1fr))`;

  readonly rangeStart = signal(startOfDay(new Date()));
  readonly days = computed(() => Array.from({ length: DAYS }, (_, i) => addDays(this.rangeStart(), i)));
  readonly todayIdx = computed(() => diffDays(new Date(), this.rangeStart()));

  shift(n: number): void {
    this.rangeStart.update(d => addDays(d, n));
  }

  blocksOf(vehicleId: string): TimelineBlock[] {
    return computeBlocks(this.bookingStore.bookings(), vehicleId, this.rangeStart(), DAYS);
  }

  openDetail(bookingId: string): void {
    const booking = this.bookingStore.bookings().find(b => b.id === bookingId);
    if (booking) this.dialog.open(BookingDetailDialogComponent, { data: booking, width: '360px' });
  }
}
