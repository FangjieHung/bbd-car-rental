import { Injectable, inject } from '@angular/core';
import { calculateCommission, rentalDaysOf } from '@car-rental/domain';
import { PayoutStatus } from '../../core/models';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { BOOKING_REPO, PARTNER_REPO, PAYOUT_REPO, VEHICLE_REPO } from '../../core/repositories/tokens';

export interface CommissionReportRow {
  bookingId: string;
  vehicleLabel: string;
  startTime: string;
  endTime: string;
  /** 租金小計；沒有報價快照的訂單算不出來，為 null（「未報價」），不是 0。 */
  rentalSubtotal: number | null;
  /** 退佣；沒有報價快照的訂單為 null，不計入合計。 */
  commission: number | null;
}

export interface CommissionReport {
  rows: CommissionReportRow[];
  /** 合計退佣：只加有報價的訂單。 */
  total: number;
  /** 沒有報價快照、未計入退佣的訂單數（報表上方提示用）。 */
  unquotedCount: number;
}

const CSV_BOM = '﻿';

@Injectable({ providedIn: 'root' })
export class CommissionStore {
  private bookingRepo = inject(BOOKING_REPO);
  private partnerRepo = inject(PARTNER_REPO);
  private vehicleRepo = inject(VEHICLE_REPO);
  private payoutRepo = inject(PAYOUT_REPO);

  /**
   * 某民宿某月的退佣報表。沒有報價快照的訂單（舊資料）算不出租金小計：以前會當成 NT$0 算出退佣 0，
   * 報表看起來像「這筆沒有退佣」，容易變成對帳爭議；現在標成未報價（null）、不計入合計，並回報筆數。
   */
  monthlyReport(partnerId: string, yyyyMm: string): CommissionReport {
    const partner = this.partnerRepo.getById(partnerId);
    if (!partner) return { rows: [], total: 0, unquotedCount: 0 };

    const bookings = this.bookingRepo
      .getAll()
      .filter((b) => b.sourcePartnerId === partnerId && b.startTime.slice(0, 7) === yyyyMm);

    const rows: CommissionReportRow[] = bookings.map((b) => {
      const vehicle = this.vehicleRepo.getById(b.vehicleId);
      const rentalSubtotal = b.priceBreakdown ? b.priceBreakdown.rentalSubtotal : null;
      const commission =
        rentalSubtotal === null
          ? null
          : calculateCommission({ rule: partner.commission, rentalSubtotal, days: rentalDaysOf(b) });
      return {
        bookingId: b.id,
        vehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model}` : b.vehicleId,
        startTime: b.startTime,
        endTime: b.endTime,
        rentalSubtotal,
        commission,
      };
    });

    const total = rows.reduce((sum, r) => sum + (r.commission ?? 0), 0);
    const unquotedCount = rows.filter((r) => r.commission === null).length;
    return { rows, total, unquotedCount };
  }

  toCsv(rows: CommissionReportRow[]): string {
    const header = ['訂單編號', '車款', '租期起訖', '租金小計', '退佣'];
    const amount = (value: number | null) => value ?? ZH_TW.commission.unquoted;
    const lines = rows.map((r) =>
      [r.bookingId, r.vehicleLabel, `${r.startTime} ~ ${r.endTime}`, amount(r.rentalSubtotal), amount(r.commission)]
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
