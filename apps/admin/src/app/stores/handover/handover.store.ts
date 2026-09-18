import { Injectable, Signal, inject, signal } from '@angular/core';
import {
  HandoverRecord,
  PickupReadiness,
  PickupReadinessInput,
  ReturnChargeInput,
  ReturnChargeResult,
  calculateReturnCharges,
  evaluatePickupReadiness,
} from '@car-rental/domain';
import { HANDOVER_RECORD_REPO } from '../../core/repositories/tokens';

/**
 * 取還車紀錄的薄封裝：CRUD 寫入 HANDOVER_RECORD_REPO，
 * 取車就緒判斷與還車費用試算全部委派給 Task 5 的純函式，這裡只負責留存紀錄。
 */
@Injectable({ providedIn: 'root' })
export class HandoverStore {
  private readonly repo = inject(HANDOVER_RECORD_REPO);

  private readonly _records = signal<HandoverRecord[]>(this.repo.getAll());
  readonly records: Signal<HandoverRecord[]> = this._records.asReadonly();

  recordsFor(bookingId: string): HandoverRecord[] {
    return this._records().filter((r) => r.bookingId === bookingId);
  }

  pickupFor(bookingId: string): HandoverRecord | undefined {
    return this.recordsFor(bookingId).find((r) => r.kind === 'pickup');
  }

  returnFor(bookingId: string): HandoverRecord | undefined {
    return this.recordsFor(bookingId).find((r) => r.kind === 'return');
  }

  recordPickup(input: Omit<HandoverRecord, 'id' | 'kind'>): HandoverRecord {
    const record: HandoverRecord = { id: crypto.randomUUID(), kind: 'pickup', ...input };
    this.repo.create(record);
    this.reload();
    return record;
  }

  recordReturn(input: Omit<HandoverRecord, 'id' | 'kind'>): HandoverRecord {
    const record: HandoverRecord = { id: crypto.randomUUID(), kind: 'return', ...input };
    this.repo.create(record);
    this.reload();
    return record;
  }

  evaluateReadiness(input: PickupReadinessInput): PickupReadiness {
    return evaluatePickupReadiness(input);
  }

  calculateCharges(input: ReturnChargeInput): ReturnChargeResult {
    return calculateReturnCharges(input);
  }

  private reload(): void {
    this._records.set(this.repo.getAll());
  }
}
