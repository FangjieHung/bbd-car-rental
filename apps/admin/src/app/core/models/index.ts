export * from '@car-rental/domain';

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
