import { beforeEach, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { computeBlocks, TimelineViewComponent } from './timeline-view/timeline-view.component';
import { RentalBooking } from '../../core/models';
import { VEHICLE_REPO, BOOKING_REPO, MAINTENANCE_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { MatDialog } from '@angular/material/dialog';

const rangeStart = new Date(2026, 6, 20); // 2026-07-20 local
const mk = (partial: Partial<RentalBooking>): RentalBooking => ({
  id: 'b1',
  vehicleId: 'v1',
  customerId: 'c1',
  startTime: new Date(2026, 6, 21, 9).toISOString(),
  endTime: new Date(2026, 6, 23, 18).toISOString(),
  pickupLocation: '',
  returnLocation: '',
  status: 'confirmed',
  ...partial,
});

describe('computeBlocks', () => {
  it('範圍內的訂單：startCol 依日差、span 含首尾日', () => {
    const blocks = computeBlocks([mk({})], 'v1', rangeStart, 14);
    expect(blocks).toEqual([{ startCol: 2, span: 3, kind: 'confirmed', bookingId: 'b1' }]);
  });

  it('跨範圍起點的訂單被裁切到第 1 欄', () => {
    const blocks = computeBlocks(
      [
        mk({
          startTime: new Date(2026, 6, 15, 9).toISOString(),
          endTime: new Date(2026, 6, 21, 18).toISOString(),
        }),
      ],
      'v1',
      rangeStart,
      14,
    );
    expect(blocks[0].startCol).toBe(1);
    expect(blocks[0].span).toBe(2);
  });

  it('完全在範圍外或 cancelled/completed 不產生 block', () => {
    expect(
      computeBlocks(
        [
          mk({
            startTime: new Date(2026, 7, 20).toISOString(),
            endTime: new Date(2026, 7, 22).toISOString(),
          }),
        ],
        'v1',
        rangeStart,
        14,
      ),
    ).toEqual([]);
    expect(computeBlocks([mk({ status: 'cancelled' })], 'v1', rangeStart, 14)).toEqual([]);
    expect(computeBlocks([mk({ vehicleId: 'v2' })], 'v1', rangeStart, 14)).toEqual([]);
  });
});

describe('TimelineViewComponent supplied date', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TimelineViewComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo([]) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo([]) },
        { provide: MatDialog, useValue: { open: () => undefined } },
      ],
    });
    fixture = TestBed.createComponent(TimelineViewComponent);
  });

  it('以 supplied date 作為第一個可見日', () => {
    const suppliedDate = new Date(2026, 6, 23, 15);

    fixture.componentRef.setInput('targetDate', suppliedDate);
    fixture.detectChanges();

    expect(fixture.componentInstance.days()[0]).toEqual(new Date(2026, 6, 23));
  });

  it('前後移動後，未變更 supplied date 時保留 rangeStart', () => {
    const suppliedDate = new Date(2026, 6, 23, 15);

    fixture.componentRef.setInput('targetDate', suppliedDate);
    fixture.detectChanges();
    fixture.componentInstance.shift(14);
    const shiftedStart = fixture.componentInstance.rangeStart();

    fixture.detectChanges();

    expect(fixture.componentInstance.rangeStart()).toEqual(shiftedStart);
  });
});
