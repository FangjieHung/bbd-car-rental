import { DecimalPipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { RENTAL_LOCATIONS, RentalLocation, Vehicle, VehicleCategory } from '@car-rental/domain';

const CATEGORY_LABEL: Record<VehicleCategory, string> = {
  car: '汽車',
  scooter: '機車',
  ev: '電動車',
};

const CATEGORY_ICON: Record<VehicleCategory, string> = {
  car: 'directions_car',
  scooter: 'two_wheeler',
  ev: 'electric_moped',
};

type SeatBucket = 'le2' | 'mid' | 'ge6';

const SEAT_BUCKETS: { value: SeatBucket; label: string }[] = [
  { value: 'le2', label: '2人以下' },
  { value: 'mid', label: '3-5人' },
  { value: 'ge6', label: '6人以上' },
];

type SortOrder = 'default' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'default', label: '預設排序' },
  { value: 'price-asc', label: '價格低到高' },
  { value: 'price-desc', label: '價格高到低' },
];

interface TypeOption {
  label: string;
  minPrice: number | null;
}

@Component({
  selector: 'app-vehicle-step',
  imports: [
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatSliderModule,
    MatTimepickerModule,
  ],
  templateUrl: './vehicle-step.component.html',
  styleUrl: './vehicle-step.component.scss',
})
export class VehicleStepComponent {
  private readonly _vehicles = signal<Vehicle[]>([]);
  @Input() set vehicles(value: Vehicle[]) {
    this._vehicles.set(value ?? []);
    this.selectedType.set(null);
    this.priceLow.set(null);
    this.priceHigh.set(null);
    this.selectedSeatBucket.set(null);
    this.selectedLocation.set(null);
    this.sortOrder.set('default');
  }
  get vehicles(): Vehicle[] {
    return this._vehicles();
  }

  @Input() selectedVehicle: Vehicle | null = null;
  /** priceForVehicle 回傳的是整段租期總價；租期天數用來換算「每日最低價格」 */
  @Input() priceForVehicle: (vehicle: Vehicle) => number | null = () => null;
  @Input() days = 1;
  @Output() vehicleSelect = new EventEmitter<Vehicle>();

  /** 取還車時間篩選器：日期在上一步已選定，這裡只調整時間並即時重新篩選車輛 */
  @Input() startTime: Date | null = null;
  @Input() endTime: Date | null = null;
  @Output() timeChange = new EventEmitter<{ startTime: Date; endTime: Date }>();

  protected readonly locations = RENTAL_LOCATIONS;
  protected readonly seatBuckets = SEAT_BUCKETS;
  protected readonly sortOptions = SORT_OPTIONS;

  protected readonly selectedType = signal<string | null>(null);
  protected readonly priceLow = signal<number | null>(null);
  protected readonly priceHigh = signal<number | null>(null);
  protected readonly selectedSeatBucket = signal<SeatBucket | null>(null);
  protected readonly selectedLocation = signal<RentalLocation | null>(null);
  protected readonly sortOrder = signal<SortOrder>('default');

  /** 車型 tabs 跟價格滑桿的範圍，都取「這批可租車輛」整體算，不受其他篩選條件影響，數字才不會一直跳動 */
  protected readonly typeOptions = computed<TypeOption[]>(() => {
    const byLabel = new Map<string, number | null>();
    for (const vehicle of this._vehicles()) {
      const label = this.classLabel(vehicle);
      const price = this.totalPrice(vehicle);
      const current = byLabel.get(label);
      if (!byLabel.has(label) || (price !== null && (current === null || current === undefined || price < current))) {
        byLabel.set(label, price);
      }
    }
    return Array.from(byLabel, ([label, minPrice]) => ({ label, minPrice }));
  });

  protected readonly priceBounds = computed<{ min: number; max: number }>(() => {
    const prices = this._vehicles()
      .map((v) => this.totalPrice(v))
      .filter((p): p is number => p !== null);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  });

  protected readonly effectivePriceLow = computed(() => this.priceLow() ?? this.priceBounds().min);
  protected readonly effectivePriceHigh = computed(() => this.priceHigh() ?? this.priceBounds().max);
  protected readonly priceStep = computed(() =>
    Math.max(1, Math.round((this.priceBounds().max - this.priceBounds().min) / 20)),
  );

  protected readonly filteredVehicles = computed<Vehicle[]>(() => {
    const type = this.selectedType();
    const location = this.selectedLocation();
    const seatBucket = this.selectedSeatBucket();
    const lo = this.effectivePriceLow();
    const hi = this.effectivePriceHigh();

    let list = this._vehicles().filter((vehicle) => {
      if (type && this.classLabel(vehicle) !== type) return false;
      if (location && vehicle.location !== location) return false;
      if (seatBucket && this.seatBucketOf(vehicle) !== seatBucket) return false;
      const price = this.totalPrice(vehicle);
      if (price !== null && (price < lo || price > hi)) return false;
      return true;
    });

    const order = this.sortOrder();
    if (order !== 'default') {
      list = [...list].sort((a, b) => {
        const priceA = this.totalPrice(a) ?? Infinity;
        const priceB = this.totalPrice(b) ?? Infinity;
        return order === 'price-asc' ? priceA - priceB : priceB - priceA;
      });
    }
    return list;
  });

  protected onTypeChange(label: string | null): void {
    this.selectedType.set(this.selectedType() === label ? null : label);
  }

  protected onPriceLowChange(value: number): void {
    this.priceLow.set(value);
  }

  protected onPriceHighChange(value: number): void {
    this.priceHigh.set(value);
  }

  protected onStartTimeChange(time: Date | null): void {
    if (!time || !this.endTime) return;
    this.timeChange.emit({ startTime: time, endTime: this.endTime });
  }

  protected onEndTimeChange(time: Date | null): void {
    if (!time || !this.startTime) return;
    this.timeChange.emit({ startTime: this.startTime, endTime: time });
  }

  protected select(vehicle: Vehicle): void {
    if (this.priceForVehicle(vehicle) === null) return;
    this.vehicleSelect.emit(vehicle);
  }

  protected isUnpriced(vehicle: Vehicle): boolean {
    return this.priceForVehicle(vehicle) === null;
  }

  /** 每日單價：總價 ÷ 租期天數（無定價時回 null） */
  protected dailyPrice(vehicle: Vehicle): number | null {
    const total = this.priceForVehicle(vehicle);
    if (total === null) return null;
    return Math.round(total / Math.max(1, this.days));
  }

  protected totalPrice(vehicle: Vehicle): number | null {
    return this.priceForVehicle(vehicle);
  }

  protected classLabel(vehicle: Vehicle): string {
    return vehicle.classLabel ?? CATEGORY_LABEL[vehicle.category];
  }

  protected categoryIcon(vehicle: Vehicle): string {
    return CATEGORY_ICON[vehicle.category];
  }

  protected transmissionLabel(vehicle: Vehicle): string {
    return vehicle.transmission === 'manual' ? '手排' : '自排';
  }

  protected transmissionMark(vehicle: Vehicle): string {
    return vehicle.transmission === 'manual' ? 'M' : 'A';
  }

  private seatBucketOf(vehicle: Vehicle): SeatBucket | null {
    if (vehicle.seats == null) return null;
    if (vehicle.seats <= 2) return 'le2';
    if (vehicle.seats <= 5) return 'mid';
    return 'ge6';
  }
}
