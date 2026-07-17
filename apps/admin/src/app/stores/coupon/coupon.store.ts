import { Injectable, Signal, inject, signal } from '@angular/core';
import { Coupon } from '../../core/models';
import { COUPON_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class CouponStore {
  private repo = inject(COUPON_REPO);
  private _coupons = signal<Coupon[]>(this.repo.getAll());
  readonly coupons: Signal<Coupon[]> = this._coupons.asReadonly();
  findByCode(code: string): Coupon | undefined {
    return this.repo.getAll().find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  }
  create(input: Omit<Coupon, 'id'>): Coupon {
    const c: Coupon = { id: crypto.randomUUID(), ...input };
    this.repo.create(c); this._coupons.set(this.repo.getAll()); return c;
  }
  update(id: string, patch: Partial<Coupon>): void { this.repo.update(id, patch); this._coupons.set(this.repo.getAll()); }
  remove(id: string): void { this.repo.remove(id); this._coupons.set(this.repo.getAll()); }
}
