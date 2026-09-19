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

  /**
   * reserved → in_progress，並連動車輛轉 rented（先車輛後訂單）。狀態機本身只管轉換合法性，
   * 不管是否已達取車就緒條件（訂金、合約簽署、證件核對等）——那是 HandoverStore.performPickup()
   * 的職責，它在呼叫這裡之前會先跑 evaluatePickupReadiness 並處理主管覆核。
   */
  pickUp(id: string): void {
    const b = this.mustGet(id);
    if (b.status !== 'reserved') throw new Error(ZH_TW.booking.invalidTransition);
    this.vehicleStore.transition(b.vehicleId, 'rented');
    this.repo.update(id, { status: 'in_progress' });
    this.reload();
  }

  /**
   * in_progress → completed，並連動車輛轉 available（先車輛後訂單）。同樣只管狀態轉換本身，
   * 費用試算／確認與還車紀錄留存是 HandoverStore.performReturn() 的職責，它會在呼叫這裡之前
   * 先存還車紀錄、確認費用調整，呼叫這裡之後才附加稽核紀錄。
   */
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
   * 不能用這個通用取消繞過去 —— 還車流程見 HandoverStore.performReturn()（Task 13），
   * 它是 in_progress 訂單唯一合法的結束路徑，內部仍是呼叫這裡的 complete() 做狀態轉換。
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
