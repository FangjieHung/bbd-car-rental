import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Vehicle } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { CatalogStore } from '../catalog.store';
import {
  DateRange,
  DEFAULT_LOCATION,
  VEHICLE_GROUP_CATEGORIES,
  toVehicleGroup,
} from '../date-range';
import { QuoteService } from '../quote.service';
import { DateStepComponent } from '../steps/date-step.component';
import { VehicleStepComponent } from '../steps/vehicle-step.component';

/**
 * 搜尋頁：選租期 + 挑車。
 * 租期是 URL query params 的投影,元件本身不保存狀態 —— 使用者才能分享網址、重整、按上一頁。
 */
@Component({
  selector: 'app-search-page',
  imports: [DateStepComponent, VehicleStepComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogStore);
  private readonly quote = inject(QuoteService);
  private readonly context = inject(BOOKING_CONTEXT);

  readonly partner = this.context.partner;

  private readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => ({
        start: p.get('start') ?? '',
        end: p.get('end') ?? '',
        pickup: p.get('pickup') ?? '',
        return: p.get('return') ?? '',
        group: toVehicleGroup(p.get('group')),
      })),
    ),
    { initialValue: { start: '', end: '', pickup: '', return: '', group: undefined } },
  );

  readonly dateRange = computed<DateRange | null>(() => {
    const { start, end, pickup, return: returnLocation, group } = this.params();
    if (!start || !end) return null;
    // 地點缺省時（例如加了取還地點之前發出的連結）退回預設值，
    // 讓舊連結的行為等同重新進站，而不是連日期都一起消失。
    return {
      startDateTime: start,
      endDateTime: end,
      pickupLocation: pickup || DEFAULT_LOCATION,
      returnLocation: returnLocation || DEFAULT_LOCATION,
      vehicleGroup: group,
    };
  });

  readonly startDate = computed(() => this.params().start.slice(0, 10));
  readonly endDate = computed(() => this.params().end.slice(0, 10));
  readonly days = computed(() => this.quote.daysBetween(this.startDate(), this.endDate()));

  readonly selectedVehicle = signal<Vehicle | null>(null);

  readonly availableVehicles = computed<Vehicle[]>(() => {
    const range = this.dateRange();
    if (!range) return [];
    const vehicles = this.catalog.availableVehicles(range.startDateTime, range.endDateTime);
    if (!range.vehicleGroup) return vehicles;
    const categories = VEHICLE_GROUP_CATEGORIES[range.vehicleGroup];
    return vehicles.filter((v) => categories.includes(v.category));
  });

  priceForVehicle = (vehicle: Vehicle): number | null =>
    this.quote.vehicleTotal(vehicle, {
      startDate: this.startDate(),
      endDate: this.endDate(),
      partnerDiscountPercent: this.partner()?.discountPercent,
    });

  onDateRangeChange(range: DateRange): void {
    this.selectedVehicle.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        start: range.startDateTime,
        end: range.endDateTime,
        pickup: range.pickupLocation,
        return: range.returnLocation,
        group: range.vehicleGroup ?? null,
      },
      replaceUrl: true,
    });
  }

  onVehicleSelect(vehicle: Vehicle): void {
    const range = this.dateRange();
    if (!range) return;
    this.router.navigate([...this.context.basePath(), 'order', vehicle.id], {
      queryParams: {
        start: range.startDateTime,
        end: range.endDateTime,
        pickup: range.pickupLocation,
        return: range.returnLocation,
        group: range.vehicleGroup ?? null,
      },
    });
  }
}
