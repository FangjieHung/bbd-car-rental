import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Vehicle } from '@car-rental/domain';
import { BOOKING_CONTEXT } from '../booking-context';
import { CatalogStore } from '../catalog.store';
import { DateRange, VEHICLE_GROUP_CATEGORIES, toVehicleGroup } from '../date-range';
import { QuoteService } from '../quote.service';
import { DateStepComponent } from '../steps/date-step.component';
import { VehicleStepComponent } from '../steps/vehicle-step.component';

/**
 * 搜尋頁：選租期 + 挑車。
 * 租期是 URL query params 的投影,元件本身不保存狀態 —— 使用者才能分享網址、重整、按上一頁。
 * 取車地點不在這裡選——選車時直接吃該車的所屬據點；還車地點留到下單頁的 confirm-step 再選。
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
        group: toVehicleGroup(p.get('group')),
      })),
    ),
    { initialValue: { start: '', end: '', group: undefined } },
  );

  readonly dateRange = computed<DateRange | null>(() => {
    const { start, end, group } = this.params();
    if (!start || !end) return null;
    return {
      startDateTime: start,
      endDateTime: end,
      vehicleGroup: group,
    };
  });

  readonly startDate = computed(() => this.params().start.slice(0, 10));
  readonly endDate = computed(() => this.params().end.slice(0, 10));
  readonly days = computed(() => this.quote.daysBetween(this.startDate(), this.endDate()));

  readonly startTime = computed<Date | null>(() => {
    const start = this.params().start;
    return start ? new Date(start) : null;
  });
  readonly endTime = computed<Date | null>(() => {
    const end = this.params().end;
    return end ? new Date(end) : null;
  });

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
        group: range.vehicleGroup ?? null,
      },
      replaceUrl: true,
    });
  }

  onTimeChange(times: { startTime: Date; endTime: Date }): void {
    const { start, end, group } = this.params();
    if (!start || !end) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        start: this.combine(start, times.startTime),
        end: this.combine(end, times.endTime),
        group: group ?? null,
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
        group: range.vehicleGroup ?? null,
      },
    });
  }

  private combine(dateTimeIso: string, time: Date): string {
    const combined = new Date(dateTimeIso);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(combined.getHours())}:${pad(combined.getMinutes())}`;
  }
}
