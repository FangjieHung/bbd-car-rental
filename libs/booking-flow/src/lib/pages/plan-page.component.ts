import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import {
  deriveEnergyTypeFallback,
  InsurancePlan,
  PriceBreakdown,
  Vehicle,
  VEHICLE_REPO,
} from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { injectBookingFlowI18n } from '../i18n/booking-flow-i18n';
import { toVehicleGroup } from '../date-range';
import { QuoteService } from '../quote.service';
import { OrderSummaryCardComponent } from '../components/order-summary-card.component';

/**
 * 選車詳情／保險方案頁：search 選完車、order 填配件送出之間的中繼頁。
 * 只做「選保險方案」這一件事，不動 order-page 現有的單頁式 checkout。
 */
@Component({
  selector: 'lib-plan-page',
  imports: [MatButtonModule, OrderSummaryCardComponent],
  templateUrl: './plan-page.component.html',
  styleUrl: './plan-page.component.scss',
})
export class PlanPageComponent {
  /** 電動車沒有「油」；同一個 fuelPolicy 欄位在電動車要用電量的說法。 */
  protected energyPolicyLabel(v: Vehicle): { title: string; value: string } {
    const electric = (v.energyType ?? deriveEnergyTypeFallback(v.category)) === 'electric';
    const plan = this.i18n.t().plan;
    const policy = v.fuelPolicy ?? 'same_level';
    return electric
      ? { title: plan.energyTitle, value: plan.energyPolicy[policy] }
      : { title: plan.fuelTitle, value: plan.fuelPolicy[policy] };
  }

  protected readonly i18n = injectBookingFlowI18n();

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quote = inject(QuoteService);
  private readonly context = inject(BOOKING_CONTEXT);
  private readonly vehicleRepo = inject(VEHICLE_REPO);

  readonly partner = this.context.partner;

  private readonly vehicleId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('vehicleId') ?? '')),
    { initialValue: '' },
  );
  private readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => ({
        start: p.get('start') ?? '',
        end: p.get('end') ?? '',
        group: toVehicleGroup(p.get('group')),
      })),
    ),
    { initialValue: { start: '', end: '', group: undefined } },
  );

  readonly vehicle = computed<Vehicle | null>(() => this.vehicleRepo.getById(this.vehicleId()) ?? null);
  readonly startDate = computed(() => this.params().start.slice(0, 10));
  readonly endDate = computed(() => this.params().end.slice(0, 10));

  readonly selectedPlanId = signal<string | null>(null);

  readonly selectedPlan = computed<InsurancePlan | null>(() => {
    const plans = this.vehicle()?.insurancePlans ?? [];
    if (plans.length === 0) return null;
    const id = this.selectedPlanId();
    return plans.find((p) => p.id === id) ?? plans[0];
  });

  readonly priceBreakdown = computed<PriceBreakdown | null>(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return null;
    return this.quote.quote({
      vehicle,
      startDate: this.startDate(),
      endDate: this.endDate(),
      addOnLines: [],
      insurancePlan: this.selectedPlan() ?? undefined,
      partnerDiscountPercent: this.partner()?.discountPercent,
    });
  });

  private readonly guardEffect = effect(() => {
    this.ensureValidOrRedirect();
  });

  ensureValidOrRedirect(): boolean {
    if (this.vehicle() && this.startDate() && this.endDate()) return true;
    this.goToSearch();
    return false;
  }

  private goToSearch(): void {
    const { start, end, group } = this.params();
    this.router.navigate([...this.context.basePath(), 'search'], {
      queryParams: start && end ? { start, end, group: group ?? null } : {},
    });
  }

  selectPlan(planId: string): void {
    this.selectedPlanId.set(planId);
  }

  onNext(): void {
    if (!this.ensureValidOrRedirect()) return;
    const vehicle = this.vehicle()!;
    const { start, end, group } = this.params();
    this.router.navigate([...this.context.basePath(), 'order', vehicle.id], {
      queryParams: { start, end, group: group ?? null, planId: this.selectedPlan()?.id ?? null },
    });
  }
}
