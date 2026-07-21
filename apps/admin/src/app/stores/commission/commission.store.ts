import { Injectable, inject } from '@angular/core';
import { calculateCommission, rentalDaysOf } from '@car-rental/domain';
import { PayoutStatus } from '../../core/models';
import { BOOKING_REPO, PARTNER_REPO, PAYOUT_REPO, VEHICLE_REPO } from '../../core/repositories/tokens';

export interface CommissionReportRow {
  bookingId: string;
  vehicleLabel: string;
  startTime: string;
  endTime: string;
  rentalSubtotal: number;
  commission: number;
}

export interface CommissionReport {
  rows: CommissionReportRow[];
  total: number;
}

const CSV_BOM = '﻿';

@Injectable({ providedIn: 'root' })
export class CommissionStore {
  private bookingRepo = inject(BOOKING_REPO);
  private partnerRepo = inject(PARTNER_REPO);
  private vehicleRepo = inject(VEHICLE_REPO);
  private payoutRepo = inject(PAYOUT_REPO);

  monthlyReport(partnerId: string, yyyyMm: string): CommissionReport {
    const partner = this.partnerRepo.getById(partnerId);
    if (!partner) return { rows: [], total: 0 };

    const bookings = this.bookingRepo
      .getAll()
      .filter((b) => b.sourcePartnerId === partnerId && b.startTime.slice(0, 7) === yyyyMm);

    const rows: CommissionReportRow[] = bookings.map((b) => {
      const vehicle = this.vehicleRepo.getById(b.vehicleId);
      const rentalSubtotal = b.priceBreakdown?.rentalSubtotal ?? 0;
      const days = rentalDaysOf(b);
      const commission = calculateCommission({ rule: partner.commission, rentalSubtotal, days });
      return {
        bookingId: b.id,
        vehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model}` : b.vehicleId,
        startTime: b.startTime,
        endTime: b.endTime,
        rentalSubtotal,
        commission,
      };
    });

    const total = rows.reduce((sum, r) => sum + r.commission, 0);
    return { rows, total };
  }

  toCsv(rows: CommissionReportRow[]): string {
    const header = ['訂單編號', '車款', '租期起訖', '租金小計', '退佣'];
    const lines = rows.map((r) =>
      [r.bookingId, r.vehicleLabel, `${r.startTime} ~ ${r.endTime}`, r.rentalSubtotal, r.commission]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return CSV_BOM + [header.join(','), ...lines].join('\n');
  }

  getPayoutStatus(partnerId: string, yyyyMm: string): PayoutStatus {
    const record = this.payoutRepo.getAll().find((p) => p.partnerId === partnerId && p.month === yyyyMm);
    return record?.status ?? 'pending';
  }

  markPaid(partnerId: string, yyyyMm: string): void {
    const record = this.payoutRepo.getAll().find((p) => p.partnerId === partnerId && p.month === yyyyMm);
    if (record) {
      this.payoutRepo.update(record.id, { status: 'paid' });
    } else {
      this.payoutRepo.create({ id: crypto.randomUUID(), partnerId, month: yyyyMm, status: 'paid' });
    }
  }
}
