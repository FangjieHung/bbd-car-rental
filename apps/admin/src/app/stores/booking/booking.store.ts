import { Injectable, Signal, inject, signal } from '@angular/core';
import { RentalBooking } from '../../core/models';
import { BOOKING_REPO } from '../../core/repositories/tokens';
import { VehicleStore } from '../vehicle/vehicle.store';
import { ZH_TW } from '../../core/i18n/zh-tw';

const ACTIVE: RentalBooking['status'][] = ['reserved', 'in_progress'];

@Injectable({ providedIn: 'root' })
export class BookingStore {
  private repo = inject(BOOKING_REPO);
  private vehicleStore = inject(VehicleStore);

  private _bookings = signal<RentalBooking[]>(this.repo.getAll());
  readonly bookings: Signal<RentalBooking[]> = this._bookings.asReadonly();

  findConflicts(
    vehicleId: string,
    startIso: string,
    endIso: string,
    excludeId?: string,
  ): RentalBooking[] {
    const start = new Date(startIso);
    const end = new Date(endIso);
    return this.repo
      .getAll()
      .filter(
        (b) =>
          b.id !== excludeId &&
          b.vehicleId === vehicleId &&
          ACTIVE.includes(b.status) &&
          start < new Date(b.endTime) &&
          end > new Date(b.startTime),
      );
  }

  create(input: Omit<RentalBooking, 'id' | 'status'>): RentalBooking {
    this.validate(input.vehicleId, input.startTime, input.endTime);
    const booking: RentalBooking = { id: crypto.randomUUID(), ...input, status: 'reserved' };
    this.repo.create(booking);
    this.reload();
    return booking;
  }

  updateBooking(id: string, patch: Partial<Omit<RentalBooking, 'id' | 'status'>>): void {
    const current = this.repo.getById(id);
    if (!current) throw new Error(`not found: ${id}`);
    const next = { ...current, ...patch };
    this.validate(next.vehicleId, next.startTime, next.endTime, id);
    this.repo.update(id, patch);
    this.reload();
  }

  pickUp(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'reserved') throw new Error(ZH_TW.booking.invalidTransition);
    this.vehicleStore.transition(b.vehicleId, 'rented');
    this.repo.update(id, { status: 'in_progress' });
    this.reload();
  }

  complete(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'in_progress') throw new Error(ZH_TW.booking.invalidTransition);
    this.vehicleStore.transition(b.vehicleId, 'available');
    this.repo.update(id, { status: 'completed' });
    this.reload();
  }

  /**
   * 一般取消只開放 reserved（車還沒交出去，取消不影響車輛狀態）。
   * in_progress 的訂單已經交車，要結束租期必須走「還車」流程（含費用結算），
   * 不能用這個通用取消繞過去 —— 還車流程在後續任務才會補上。
   */
  cancel(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'reserved') {
      throw new Error(ZH_TW.booking.invalidTransition);
    }
    this.repo.update(id, { status: 'cancelled' });
    this.reload();
  }

  private validate(vehicleId: string, startIso: string, endIso: string, excludeId?: string): void {
    if (new Date(endIso) <= new Date(startIso)) throw new Error(ZH_TW.booking.endBeforeStart);
    const conflicts = this.findConflicts(vehicleId, startIso, endIso, excludeId);
    if (conflicts.length > 0) {
      throw new Error(`${ZH_TW.booking.conflict} ${conflicts.map((c) => c.id).join(', ')}`);
    }
  }

  /**
   * 直接刪除訂單記錄，不經過狀態機驗證——只給「新增訂單精靈」在多步驟寫入序列
   * 中途失敗時，補償清除同一次嘗試裡剛建立的訂單使用（local repository 沒有真正的
   * transaction，只能靠呼叫端在失敗時自行清除本次已寫入的記錄）。一般業務流程一律走
   * cancel()，不要用這個方法取消已存在多時的訂單。
   */
  remove(id: string): void {
    this.repo.remove(id);
    this.reload();
  }

  private mustGet(id: string): RentalBooking {
    const b = this.repo.getById(id);
    if (!b) throw new Error(`not found: ${id}`);
    return b;
  }

  private reload(): void {
    this._bookings.set(this.repo.getAll());
  }
}
