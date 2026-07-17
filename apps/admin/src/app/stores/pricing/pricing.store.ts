import { Injectable, Signal, inject, signal } from '@angular/core';
import { PricingPlan, SeasonCalendar } from '../../core/models';
import { PRICING_PLAN_REPO, SEASON_CALENDAR_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class PricingStore {
  private planRepo = inject(PRICING_PLAN_REPO);
  private calRepo = inject(SEASON_CALENDAR_REPO);

  private _plans = signal<PricingPlan[]>(this.planRepo.getAll());
  private _cal = signal<SeasonCalendar>(this.calRepo.getAll()[0]);
  readonly plans: Signal<PricingPlan[]> = this._plans.asReadonly();
  readonly calendar: Signal<SeasonCalendar> = this._cal.asReadonly();

  createPlan(input: Omit<PricingPlan, 'id'>): PricingPlan {
    const plan: PricingPlan = { id: crypto.randomUUID(), ...input };
    this.planRepo.create(plan);
    this._plans.set(this.planRepo.getAll());
    return plan;
  }

  updatePlan(id: string, patch: Partial<PricingPlan>): void {
    this.planRepo.update(id, patch);
    this._plans.set(this.planRepo.getAll());
  }

  removePlan(id: string): void {
    this.planRepo.remove(id);
    this._plans.set(this.planRepo.getAll());
  }

  updateCalendar(patch: Partial<SeasonCalendar>): void {
    const cur = this._cal();
    this.calRepo.update(cur.id, patch);
    this._cal.set(this.calRepo.getAll()[0]);
  }
}
