import { VehicleStatus } from './enums';

export type VehicleType = 'scooter' | 'car';

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string;
  status: VehicleStatus;
  mileage: number;
  createdAt: string; // ISO
}
