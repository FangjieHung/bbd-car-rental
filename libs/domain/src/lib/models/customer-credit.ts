/**
 * 會員購物金帳本：append-only。不存可變的 balance 欄位 ——
 * 餘額一律由這張表的所有 entry 加總推導，避免帳本與快取欄位兜不起來。
 */
export interface CustomerCreditLedgerEntry {
  id: string;
  memberId: string;
  sourceCancellationCaseId?: string;
  type: 'issued' | 'redeemed' | 'expired' | 'extended' | 'reversed';
  amount: number;
  occurredAt: string;
  expiresAt?: string;
  handledBy: string;
  reason?: string;
}
