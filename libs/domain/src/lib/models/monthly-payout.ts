export type PayoutStatus = 'pending' | 'paid';

export interface MonthlyPayout {
  id: string;
  partnerId: string;
  month: string; // 'YYYY-MM'
  status: PayoutStatus;
}
