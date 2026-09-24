import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MonthlyPayout, Partner, PriceBreakdown, RentalBooking, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { BOOKING_REPO, PARTNER_REPO, PAYOUT_REPO, VEHICLE_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { CommissionPageComponent } from './commission-page.component';

const t = ZH_TW;

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 8,
  commission: { type: 'percent', value: 10 },
};

const vehicle: Vehicle = {
  id: 'v1',
  plateNumber: 'ABC-123',
  category: 'car',
  model: 'Yaris',
  brand: 'Toyota',
  year: 2023,
  status: 'available',
  mileage: 1000,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function booking(id: string, priceBreakdown?: PriceBreakdown): RentalBooking {
  return {
    id,
    vehicleId: 'v1',
    memberId: 'c1',
    startTime: '2026-07-05T01:00:00.000Z',
    endTime: '2026-07-08T01:00:00.000Z',
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
    status: 'completed',
    depositRequired: 0,
    sourcePartnerId: 'pt1',
    ...(priceBreakdown ? { priceBreakdown } : {}),
  };
}

function setup(bookings: RentalBooking[]) {
  TestBed.configureTestingModule({
    providers: [
      { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>(bookings) },
      { provide: PARTNER_REPO, useValue: createInMemoryRepo<Partner>([partner]) },
      { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([vehicle]) },
      { provide: PAYOUT_REPO, useValue: createInMemoryRepo<MonthlyPayout>([]) },
    ],
  });
  const fixture = TestBed.createComponent(CommissionPageComponent);
  fixture.componentInstance.onPartnerChange('pt1');
  fixture.componentInstance.onMonthChange('2026-07');
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

function row(el: HTMLElement, bookingId: string): HTMLElement {
  const tr = Array.from(el.querySelectorAll('tbody tr')).find((r) => r.textContent?.includes(bookingId));
  if (!tr) throw new Error(`row ${bookingId} missing`);
  return tr as HTMLElement;
}

describe('CommissionPageComponent 沒有報價紀錄的訂單', () => {
  const quoted = { dailyLines: [], rentalSubtotal: 3000, total: 2760 } as unknown as PriceBreakdown;

  it('租金小計與退佣顯示淡色「未報價」，報表上方提示幾筆未計入；有報價的照舊', () => {
    const { el } = setup([booking('b-quoted', quoted), booking('b-old')]);

    const notice = el.querySelector('.commission-unquoted-notice');
    expect(notice?.textContent?.trim()).toBe(t.commission.unquotedNotice.replace('{count}', '1'));

    const old = row(el, 'b-old');
    const unquotedCells = Array.from(old.querySelectorAll('.muted')).map((c) => c.textContent?.trim());
    expect(unquotedCells).toEqual([t.commission.unquoted, t.commission.unquoted]);
    expect(old.textContent).not.toContain('NT$0');

    const quotedRow = row(el, 'b-quoted');
    expect(quotedRow.textContent).toContain('NT$3,000');
    expect(quotedRow.textContent).toContain('NT$300');
    expect(el.textContent).toContain(`${t.commission.total}：NT$300`);
  });

  it('全部都有報價時不顯示提示', () => {
    const { el } = setup([booking('b-quoted', quoted)]);
    expect(el.querySelector('.commission-unquoted-notice')).toBeNull();
  });
});
