import { Injectable, Signal, inject, signal } from '@angular/core';
import { CustomerCreditLedgerEntry } from '@car-rental/domain';
import { CUSTOMER_CREDIT_LEDGER_REPO } from '../../core/repositories/tokens';

type AppendInput = Omit<CustomerCreditLedgerEntry, 'id' | 'type'>;

/**
 * 會員購物金帳本的薄封裝：append-only 寫入 CUSTOMER_CREDIT_LEDGER_REPO，
 * 餘額一律由 entry 加總推導（見 CustomerCreditLedgerEntry 的模型註解），不額外存快取欄位。
 */
@Injectable({ providedIn: 'root' })
export class CreditStore {
  private readonly repo = inject(CUSTOMER_CREDIT_LEDGER_REPO);

  private readonly _entries = signal<CustomerCreditLedgerEntry[]>(this.repo.getAll());
  readonly entries: Signal<CustomerCreditLedgerEntry[]> = this._entries.asReadonly();

  entriesFor(memberId: string): CustomerCreditLedgerEntry[] {
    return this._entries().filter((e) => e.memberId === memberId);
  }

  balanceFor(memberId: string): number {
    return this.entriesFor(memberId).reduce((balance, entry) => {
      switch (entry.type) {
        case 'issued':
        case 'extended':
          return balance + entry.amount;
        case 'redeemed':
        case 'expired':
        case 'reversed':
          return balance - entry.amount;
        default:
          return balance;
      }
    }, 0);
  }

  issue(input: AppendInput): CustomerCreditLedgerEntry {
    return this.append({ ...input, type: 'issued' });
  }

  /** 折抵前檢查餘額是否足夠——帳本本身的完整性守則，不是新的業務規則。 */
  redeem(input: AppendInput): CustomerCreditLedgerEntry {
    const balance = this.balanceFor(input.memberId);
    if (input.amount > balance) {
      throw new Error(`購物金餘額不足：可用 ${balance}，欲折抵 ${input.amount}`);
    }
    return this.append({ ...input, type: 'redeemed' });
  }

  extend(input: AppendInput): CustomerCreditLedgerEntry {
    return this.append({ ...input, type: 'extended' });
  }

  expire(input: AppendInput): CustomerCreditLedgerEntry {
    return this.append({ ...input, type: 'expired' });
  }

  reverse(input: AppendInput): CustomerCreditLedgerEntry {
    return this.append({ ...input, type: 'reversed' });
  }

  private append(entry: Omit<CustomerCreditLedgerEntry, 'id'>): CustomerCreditLedgerEntry {
    const record: CustomerCreditLedgerEntry = { id: crypto.randomUUID(), ...entry };
    this.repo.create(record);
    this.reload();
    return record;
  }

  private reload(): void {
    this._entries.set(this.repo.getAll());
  }
}
