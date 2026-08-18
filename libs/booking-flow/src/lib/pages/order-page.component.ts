import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AddOn, PriceBreakdown, Vehicle, VEHICLE_REPO } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { CatalogStore } from '../catalog.store';
import { CouponResult, QuoteService } from '../quote.service';
import { OrderSummaryCardComponent } from '../components/order-summary-card.component';
import { SearchCriteriaBarComponent } from '../components/search-criteria-bar.component';
import { AddonStepComponent } from '../steps/addon-step.component';
import { CouponStepComponent } from '../steps/coupon-step.component';
import { ConfirmFormValue, ConfirmStepComponent } from '../steps/confirm-step.component';

/**
 * 下單頁：單頁 checkout。車與租期來自 URL，配件與優惠碼只活在這一頁。
 * 送出後訂單狀態為 pending_payment，實際扣款由付款頁負責。
 */
@Component({
  selector: 'app-order-page',
  imports: [
    SearchCriteriaBarComponent,
    AddonStepComponent,
    CouponStepComponent,
    ConfirmStepComponent,
    OrderSummaryCardComponent,
  ],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss',
})
export class OrderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogStore);
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
      map((p) => ({ start: p.get('start') ?? '', end: p.get('end') ?? '' })),
    ),
    { initialValue: { start: '', end: '' } },
  );

  readonly vehicle = computed<Vehicle | null>(
    () => this.vehicleRepo.getById(this.vehicleId()) ?? null,
  );
  readonly startDate = computed(() => this.params().start.slice(0, 10));
  readonly endDate = computed(() => this.params().end.slice(0, 10));
  readonly days = computed(() => this.quote.daysBetween(this.startDate(), this.endDate()));

  readonly addOnQty = signal<Record<string, number>>({});
  readonly couponCode = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal('');

  readonly addOns = computed<AddOn[]>(() => this.catalog.addOns());

  readonly selectedAddOnLines = computed<{ addOn: AddOn; qty: number }[]>(() => {
    const qtyMap = this.addOnQty();
    return this.addOns()
      .map((addOn) => ({ addOn, qty: qtyMap[addOn.id] ?? 0 }))
      .filter((line) => line.qty > 0);
  });

  readonly couponResult = computed<CouponResult | null>(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return null;
    return this.quote.validateCoupon(this.couponCode(), {
      startDate: this.startDate(),
      days: this.days(),
      category: vehicle.category,
    });
  });

  readonly priceBreakdown = computed<PriceBreakdown | null>(() => {
    const vehicle = this.vehicle();
    if (!vehicle) return null;
    const result = this.couponResult();
    return this.quote.quote({
      vehicle,
      startDate: this.startDate(),
      endDate: this.endDate(),
      addOnLines: this.selectedAddOnLines(),
      coupon: result?.ok ? result.coupon : undefined,
      partnerDiscountPercent: this.partner()?.discountPercent,
    });
  });

  /** 車或租期不成立就沒有可下單的內容，導回搜尋頁重來 */
  ensureValidOrRedirect(): boolean {
    if (this.vehicle() && this.startDate() && this.endDate()) return true;
    this.goToSearch();
    return false;
  }

  goToSearch(): void {
    const { start, end } = this.params();
    this.router.navigate([...this.context.basePath(), 'search'], {
      queryParams: start && end ? { start, end } : {},
    });
  }

  onAddOnQtyChange(addOnId: string, qty: number): void {
    this.addOnQty.update((map) => ({ ...map, [addOnId]: qty }));
  }

  onCouponCodeChange(code: string): void {
    this.couponCode.set(code);
  }

  onConfirmSubmit(form: ConfirmFormValue): void {
    if (!this.ensureValidOrRedirect()) return;
    const vehicle = this.vehicle()!;
    const { start, end } = this.params();
    this.submitting.set(true);
    this.submitError.set('');
    try {
      const result = this.couponResult();
      const booking = this.catalog.submitBooking({
        vehicleId: vehicle.id,
        startTime: start,
        endTime: end,
        pickupLocation: '馬公',
        returnLocation: '馬公',
        customer: { name: form.name, phone: form.phone, email: form.email },
        category: vehicle.category,
        startDate: this.startDate(),
        endDate: this.endDate(),
        addOns: this.selectedAddOnLines(),
        couponCode: result?.ok ? result.coupon?.code : undefined,
        paymentMethod: form.paymentMethod,
        partnerDiscountPercent: this.partner()?.discountPercent,
        sourcePartnerId: this.partner()?.id,
      });
      this.router.navigate([...this.context.basePath(), 'pay', booking.id]);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : '送出失敗，請稍後再試');
    } finally {
      this.submitting.set(false);
    }
  }
}
