import { DecimalPipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { Vehicle, VehicleCategory } from '@car-rental/domain';

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

@Component({
  selector: 'app-vehicle-step',
  imports: [DecimalPipe],
  templateUrl: './vehicle-step.component.html',
  styleUrl: './vehicle-step.component.scss',
})
export class VehicleStepComponent {
  private readonly _vehicles = signal<Vehicle[]>([]);
  @Input() set vehicles(value: Vehicle[]) {
    this._vehicles.set(value ?? []);
  }
  get vehicles(): Vehicle[] {
    return this._vehicles();
  }

  @Input() selectedVehicle: Vehicle | null = null;
  /** priceForVehicle 回傳的是整段租期總價；租期天數用來換算「每日最低價格」 */
  @Input() priceForVehicle: (vehicle: Vehicle) => number | null = () => null;
  @Input() days = 1;
  @Output() vehicleSelect = new EventEmitter<Vehicle>();

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
}
