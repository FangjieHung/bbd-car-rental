import { InjectionToken } from '@angular/core';
import { Vehicle, Customer, RentalBooking, PricingPlan, SeasonCalendar, AddOn, Coupon } from '../models';
import { Repository } from './repository';

export const VEHICLE_REPO = new InjectionToken<Repository<Vehicle>>('VEHICLE_REPO');
export const CUSTOMER_REPO = new InjectionToken<Repository<Customer>>('CUSTOMER_REPO');
export const BOOKING_REPO = new InjectionToken<Repository<RentalBooking>>('BOOKING_REPO');
export const PRICING_PLAN_REPO = new InjectionToken<Repository<PricingPlan>>('PRICING_PLAN_REPO');
export const SEASON_CALENDAR_REPO = new InjectionToken<Repository<SeasonCalendar>>(
  'SEASON_CALENDAR_REPO',
);
export const ADDON_REPO = new InjectionToken<Repository<AddOn>>('ADDON_REPO');
export const COUPON_REPO = new InjectionToken<Repository<Coupon>>('COUPON_REPO');
