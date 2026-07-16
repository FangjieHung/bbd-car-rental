import { InjectionToken } from '@angular/core';
import { Vehicle, Customer, RentalBooking, MaintenanceRecord } from '../models';
import { Repository } from './repository';

export const VEHICLE_REPO = new InjectionToken<Repository<Vehicle>>('VEHICLE_REPO');
export const CUSTOMER_REPO = new InjectionToken<Repository<Customer>>('CUSTOMER_REPO');
export const BOOKING_REPO = new InjectionToken<Repository<RentalBooking>>('BOOKING_REPO');
export const MAINTENANCE_REPO = new InjectionToken<Repository<MaintenanceRecord>>(
  'MAINTENANCE_REPO',
);
