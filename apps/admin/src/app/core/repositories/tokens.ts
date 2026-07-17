import { InjectionToken } from '@angular/core';
import { Repository } from '@car-rental/domain';
import { MaintenanceRecord } from '../models';

export {
  VEHICLE_REPO,
  CUSTOMER_REPO,
  BOOKING_REPO,
  PRICING_PLAN_REPO,
  SEASON_CALENDAR_REPO,
  ADDON_REPO,
  COUPON_REPO,
} from '@car-rental/domain';
export const MAINTENANCE_REPO = new InjectionToken<Repository<MaintenanceRecord>>(
  'MAINTENANCE_REPO',
);
