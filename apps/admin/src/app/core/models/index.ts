export type VehicleType = 'scooter' | 'car';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string;
  status: VehicleStatus;
  mileage: number;
  createdAt: string; // ISO
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idNumber?: string;
  note?: string;
}

export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;
}

export type MaintenanceType = 'oil_change' | 'tire' | 'brake' | 'inspection' | 'other';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  performedAt: string; // ISO
  mileageAtService: number;
  nextDueMileage?: number;
  nextDueDate?: string; // ISO
  cost: number;
  notes: string;
}

export interface MaintenanceAlert {
  vehicleId: string;
  ruleType: 'mileage' | 'date';
  threshold: number | string;
  status: 'upcoming' | 'overdue';
}
