import { Injectable, inject } from '@angular/core';
import {
  BOOKING_REPO,
  PARTNER_REPO,
  PAYOUT_REPO,
  Partner,
  PayoutStatus,
  RentalBooking,
  calculateCommission,
  rentalDaysOf,
} from '@car-rental/domain';

export interface CommissionLine {
  booking: RentalBooking;
  days: number;
  commission: number;
  month: string; // 'YYYY-MM'
}

export interface MonthlyPayoutProgress {
  month: string; // 'YYYY-MM'
  status: PayoutStatus;
}

export interface PartnerAccount {
  partner: Partner;
  commissionLines: CommissionLine[];
  totalCommission: number;
  payoutsByMonth: MonthlyPayoutProgress[];
}

function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

@Injectable({ providedIn: 'root' })
export class PartnerAccountStore {
  private readonly partnerRepo = inject(PARTNER_REPO);
  private readonly bookingRepo = inject(BOOKING_REPO);
  private readonly payoutRepo = inject(PAYOUT_REPO);

  findPartnerBySlug(slug: string): Partner | null {
    return this.partnerRepo.getAll().find((p) => p.slug === slug) ?? null;
  }

  getAccount(slug: string): PartnerAccount | null {
    const partner = this.findPartnerBySlug(slug);
    if (!partner) return null;

    const commissionLines: CommissionLine[] = this.bookingRepo
      .getAll()
      .filter((b) => b.sourcePartnerId === partner.id && b.priceBreakdown)
      .map((booking) => {
        const days = rentalDaysOf(booking);
        const commission = calculateCommission({
          rule: partner.commission,
          rentalSubtotal: booking.priceBreakdown!.rentalSubtotal,
          days,
        });
        return { booking, days, commission, month: monthOf(booking.startTime) };
      });

    const totalCommission = commissionLines.reduce((sum, line) => sum + line.commission, 0);

    const months = Array.from(new Set(commissionLines.map((l) => l.month))).sort();
    const payouts = this.payoutRepo.getAll();
    const payoutsByMonth: MonthlyPayoutProgress[] = months.map((month) => {
      const record = payouts.find((p) => p.partnerId === partner.id && p.month === month);
      return { month, status: record?.status ?? 'pending' };
    });

    return { partner, commissionLines, totalCommission, payoutsByMonth };
  }
}
