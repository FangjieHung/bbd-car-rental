import { VehicleStatus } from './enums';

export type VehicleCategory = 'car' | 'scooter' | 'ev';

export interface Vehicle {
  id: string;
  plateNumber: string;
  category: VehicleCategory;
  model: string;
  brand: string;
  displacement?: number;
  year: number;
  status: VehicleStatus;
  mileage: number;
  nextServiceMileage?: number;
  insuranceExpiry?: string;
  createdAt: string; // ISO
}
