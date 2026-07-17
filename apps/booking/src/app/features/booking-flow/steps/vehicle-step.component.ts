import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Vehicle, VehicleCategory } from '@car-rental/domain';

const CATEGORY_LABEL: Record<VehicleCategory, string> = {
  car: '汽車',
  scooter: '機車',
  ev: '電動車',
};

interface VehicleGroup {
  category: VehicleCategory;
  label: string;
  vehicles: Vehicle[];
}

@Component({
  selector: 'app-vehicle-step',
  imports: [MatButtonModule, MatCardModule],
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
  @Input() priceForVehicle: (vehicle: Vehicle) => number | null = () => null;
  @Output() vehicleSelect = new EventEmitter<Vehicle>();

  readonly groups = computed<VehicleGroup[]>(() => {
    const byCategory = new Map<VehicleCategory, Vehicle[]>();
    for (const v of this._vehicles()) {
      const list = byCategory.get(v.category) ?? [];
      list.push(v);
      byCategory.set(v.category, list);
    }
    return Array.from(byCategory.entries()).map(([category, list]) => ({
      category,
      label: CATEGORY_LABEL[category],
      vehicles: list,
    }));
  });

  protected select(vehicle: Vehicle): void {
    this.vehicleSelect.emit(vehicle);
  }
}
