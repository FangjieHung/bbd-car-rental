import { Component, computed, inject, signal } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { AddOn, Coupon, PriceBreakdown, Vehicle } from '@car-rental/domain';
import { CatalogStore } from '../../stores/catalog.store';
import { DateStepComponent } from './steps/date-step.component';
import { VehicleStepComponent } from './steps/vehicle-step.component';
import { AddonStepComponent } from './steps/addon-step.component';
import { CouponStepComponent } from './steps/coupon-step.component';

export interface DateRange {
  startDateTime: string;
  endDateTime: string;
}

@Component({
  selector: 'app-booking-flow',
  imports: [MatStepperModule, DateStepComponent, VehicleStepComponent, AddonStepComponent, CouponStepComponent],
  templateUrl: './booking-flow.component.html',
  styleUrl: './booking-flow.component.scss',
})
export class BookingFlowComponent {
  private readonly catalog = inject(CatalogStore);

  readonly dateRange = signal<DateRange | null>(null);
  readonly selectedVehicle = signal<Vehicle | null>(null);
  readonly addOnQty = signal<Record<string, number>>({});
  readonly couponCode = signal('');

  readonly startDate = computed(() => this.dateRange()?.startDateTime.slice(0, 10) ?? '');
  readonly endDate = computed(() => this.dateRange()?.endDateTime.slice(0, 10) ?? '');

  readonly availableVehicles = computed<Vehicle[]>(() => {
    const range = this.dateRange();
    if (!range) return [];
    return this.catalog.availableVehicles(range.startDateTime, range.endDateTime);
  });

  readonly addOns = computed<AddOn[]>(() => this.catalog.addOns());

  readonly selectedAddOnLines = computed<{ addOn: AddOn; qty: number }[]>(() => {
    const qtyMap = this.addOnQty();
    return this.addOns()
      .map((addOn) => ({ addOn, qty: qtyMap[addOn.id] ?? 0 }))
      .filter((line) => line.qty > 0);
  });

  readonly days = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) return 0;
    const ms = new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime();
    return Math.max(0, Math.round(ms / 86400000));
  });

  readonly couponResult = computed<{ ok: boolean; coupon?: Coupon; reason?: string } | null>(() => {
    const code = this.couponCode().trim();
    const vehicle = this.selectedVehicle();
    if (!code || !vehicle) return null;
    return this.catalog.validateCoupon(code, {
      startDate: this.startDate(),
      days: this.days(),
      category: vehicle.category,
    });
  });

  readonly priceBreakdown = computed<PriceBreakdown | null>(() => {
    const vehicle = this.selectedVehicle();
    const start = this.startDate();
    const end = this.endDate();
    if (!vehicle || !start || !end) return null;
    const result = this.couponResult();
    return this.catalog.price({
      category: vehicle.category,
      startDate: start,
      endDate: end,
      addOns: this.selectedAddOnLines(),
      coupon: result?.ok ? result.coupon : undefined,
    });
  });

  priceForVehicle(vehicle: Vehicle): number | null {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) return null;
    try {
      return this.catalog.price({ category: vehicle.category, startDate: start, endDate: end, addOns: [] })
        .total;
    } catch {
      return null;
    }
  }

  onDateRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.selectedVehicle.set(null);
  }

  onVehicleSelect(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
  }

  onAddOnQtyChange(addOnId: string, qty: number): void {
    this.addOnQty.update((map) => ({ ...map, [addOnId]: qty }));
  }

  onCouponCodeChange(code: string): void {
    this.couponCode.set(code);
  }
}
