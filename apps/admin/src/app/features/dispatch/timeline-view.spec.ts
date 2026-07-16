import { describe, it, expect } from 'vitest';
import { computeBlocks } from './timeline-view.component';
import { RentalBooking } from '../../core/models';

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
