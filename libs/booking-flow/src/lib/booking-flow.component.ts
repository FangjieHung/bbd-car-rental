import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { AddOn, Coupon, PriceBreakdown, Vehicle, VehicleCategory } from '@car-rental/domain';
import { CatalogStore } from './catalog.store';
import { FlowMode } from './flow-mode';
import { DateStepComponent } from './steps/date-step.component';
import { VehicleStepComponent } from './steps/vehicle-step.component';
import { AddonStepComponent } from './steps/addon-step.component';
import { CouponStepComponent } from './steps/coupon-step.component';
import { ConfirmFormValue, ConfirmStepComponent } from './steps/confirm-step.component';

/** 車輛大類：對客顯示只分機車/汽車，實際車輛分類（含 ev 電動機車）再往下對應 */
export type VehicleGroup = 'car' | 'scooter';

export const VEHICLE_GROUP_CATEGORIES: Record<VehicleGroup, VehicleCategory[]> = {
  car: ['car'],
  scooter: ['scooter', 'ev'],
};

export interface DateRange {
  startDateTime: string;
  endDateTime: string;
  pickupLocation: string;
  returnLocation: string;
  /** 預設汽車；缺省時視為不篩選（相容舊資料） */
  vehicleGroup?: VehicleGroup;
}

@Component({
  selector: 'app-booking-flow',
  imports: [
    MatStepperModule,
    MatButtonModule,
    DateStepComponent,
    VehicleStepComponent,
    AddonStepComponent,
    CouponStepComponent,
    ConfirmStepComponent,
  ],
  templateUrl: './booking-flow.component.html',
  styleUrl: './booking-flow.component.scss',
})
export class BookingFlowComponent {
  private readonly catalog = inject(CatalogStore);
  private readonly router = inject(Router);

  readonly mode = input<FlowMode>({ kind: 'consumer' });

  readonly partner = computed(() => {
    const m = this.mode();
    return m.kind === 'partner' ? m.partner : null;
  });

  readonly dateRange = signal<DateRange | null>(null);
  readonly selectedVehicle = signal<Vehicle | null>(null);
  readonly addOnQty = signal<Record<string, number>>({});
  readonly couponCode = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal('');

  readonly dateStepDone = computed(() => !!this.dateRange());
  readonly vehicleStepDone = computed(() => !!this.selectedVehicle());

  readonly startDate = computed(() => this.dateRange()?.startDateTime.slice(0, 10) ?? '');
  readonly endDate = computed(() => this.dateRange()?.endDateTime.slice(0, 10) ?? '');

  readonly availableVehicles = computed<Vehicle[]>(() => {
    const range = this.dateRange();
    if (!range) return [];
    const vehicles = this.catalog.availableVehicles(range.startDateTime, range.endDateTime);
    if (!range.vehicleGroup) return vehicles;
    const categories = VEHICLE_GROUP_CATEGORIES[range.vehicleGroup];
    return vehicles.filter((v) => categories.includes(v.category));
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
      partnerDiscountPercent: this.partner()?.discountPercent,
    });
  });

  priceForVehicle(vehicle: Vehicle): number | null {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) return null;
    try {
      return this.catalog.price({
        category: vehicle.category,
        startDate: start,
        endDate: end,
        addOns: [],
        partnerDiscountPercent: this.partner()?.discountPercent,
      }).total;
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

  onConfirmSubmit(form: ConfirmFormValue): void {
    const vehicle = this.selectedVehicle();
    const range = this.dateRange();
    if (!vehicle || !range) return;
    this.submitting.set(true);
    this.submitError.set('');
    try {
      const result = this.couponResult();
      const booking = this.catalog.submitBooking({
        vehicleId: vehicle.id,
        startTime: range.startDateTime,
        endTime: range.endDateTime,
        pickupLocation: range.pickupLocation,
        returnLocation: range.returnLocation,
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
      this.router.navigate(['/book/done', booking.id]);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : '送出失敗，請稍後再試');
    } finally {
      this.submitting.set(false);
    }
  }
}
