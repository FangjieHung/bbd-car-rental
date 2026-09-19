import { Injectable, Signal, inject, signal } from '@angular/core';
import { CustomerCreditLedgerEntry } from '@car-rental/domain';
import { CUSTOMER_CREDIT_LEDGER_REPO } from '../../core/repositories/tokens';

type AppendInput = Omit<CustomerCreditLedgerEntry, 'id' | 'type'>;

/** 設計文件第 9.3 節「保留金預設 12 個月」。 */
const DEFAULT_EXPIRY_MONTHS = 12;

/** 從 ISO 時間加上指定月數，用 UTC 曆月加法，不受呼叫端主機所在時區影響到期日判斷。 */
export function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}

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

  /**
   * 核發保留金。設計文件第 9.3 節「保留金預設 12 個月」——未指定到期日時，依核發時間
   * （occurredAt）自動算出 12 個月後的到期日，呼叫端（例如 CancellationStore.disposeCase）
   * 不需要自己重算；仍可透過 expiresAt 明確覆寫成非預設效期。
   */
  issue(input: AppendInput): CustomerCreditLedgerEntry {
    const expiresAt = input.expiresAt ?? addMonths(input.occurredAt, DEFAULT_EXPIRY_MONTHS);
    return this.append({ ...input, expiresAt, type: 'issued' });
  }

  /** 折抵前檢查餘額是否足夠——帳本本身的完整性守則，不是新的業務規則。 */
  redeem(input: AppendInput): CustomerCreditLedgerEntry {
    const balance = this.balanceFor(input.memberId);
    if (input.amount > balance) {
      throw new Error(`購物金餘額不足：可用 ${balance}，欲折抵 ${input.amount}`);
    }
    return this.append({ ...input, type: 'redeemed' });
  }

  /**
   * 展延保留金。設計文件第 9.3 節「主管可展期且保存理由」——理由是必填的。append-only
   * 帳本本身（這筆 entry 的 handledBy／occurredAt／reason 永久保存、不可覆寫）就是這個動作
   * 的稽核紀錄，不另外疊加一份獨立的稽核實體。
   */
  extend(input: AppendInput): CustomerCreditLedgerEntry {
    if (!input.reason?.trim()) {
      throw new Error('展延保留金必須填寫理由');
    }
    return this.append({ ...input, type: 'extended' });
  }

  expire(input: AppendInput): CustomerCreditLedgerEntry {
    return this.append({ ...input, type: 'expired' });
  }

  reverse(input: AppendInput): CustomerCreditLedgerEntry {
    return this.append({ ...input, type: 'reversed' });
  }

  /**
   * 到期前 N 天（預設 30 天，設計文件第 9.3 節「到期前 30 天提醒」）內到期、尚未過期的
   * 核發／展延紀錄，給 UI 顯示提醒用。只看 issued／extended（代表「有效期限」語意的異動
   * 類型），redeemed／expired／reversed 沒有自己的到期日語意，不列入。
   */
  expiringWithin(
    memberId: string,
    days = 30,
    asOf: string = new Date().toISOString(),
  ): CustomerCreditLedgerEntry[] {
    const asOfMs = new Date(asOf).getTime();
    const thresholdMs = asOfMs + days * 24 * 60 * 60 * 1000;
    return this.entriesFor(memberId).filter((e) => {
      if (e.type !== 'issued' && e.type !== 'extended') return false;
      if (!e.expiresAt) return false;
      const expiresMs = new Date(e.expiresAt).getTime();
      return expiresMs >= asOfMs && expiresMs <= thresholdMs;
    });
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
