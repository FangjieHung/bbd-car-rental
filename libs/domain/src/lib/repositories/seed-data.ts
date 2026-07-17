import {
  Vehicle,
  Customer,
  RentalBooking,
  PricingPlan,
  SeasonCalendar,
  AddOn,
  Coupon,
  Partner,
  MonthlyPayout,
} from '../models';
import { isoAt } from '../date-utils';

export function seedVehicles(): Vehicle[] {
  return [
    {
      id: 'v1',
      plateNumber: 'ABC-123',
      category: 'ev',
      model: 'Gogoro 3',
      brand: 'Gogoro',
      displacement: 0,
      year: 2022,
      status: 'available',
      mileage: 4800,
      insuranceExpiry: isoAt(120, 0),
      createdAt: isoAt(-90, 9),
    },
    {
      id: 'v2',
      plateNumber: 'DEF-456',
      category: 'scooter',
      model: '勁戰六代',
      brand: 'Yamaha',
      displacement: 150,
      year: 2021,
      status: 'rented',
      mileage: 12100,
      insuranceExpiry: isoAt(90, 0),
      createdAt: isoAt(-80, 9),
    },
    {
      id: 'v3',
      plateNumber: 'GHI-789',
      category: 'car',
      model: 'Yaris',
      brand: 'Toyota',
      year: 2020,
      status: 'available',
      mileage: 30500,
      nextServiceMileage: 35000,
      insuranceExpiry: isoAt(60, 0),
      createdAt: isoAt(-70, 9),
    },
    {
      id: 'v4',
      plateNumber: 'JKL-012',
      category: 'car',
      model: 'Sienta',
      brand: 'Toyota',
      year: 2019,
      status: 'maintenance',
      mileage: 45200,
      nextServiceMileage: 46000,
      insuranceExpiry: isoAt(45, 0),
      createdAt: isoAt(-60, 9),
    },
    {
      id: 'v5',
      plateNumber: 'MNO-345',
      category: 'scooter',
      model: 'SYM 4MICA',
      brand: 'SYM',
      displacement: 125,
      year: 2023,
      status: 'reserved',
      mileage: 800,
      insuranceExpiry: isoAt(300, 0),
      createdAt: isoAt(-30, 9),
    },
    {
      id: 'v6',
      plateNumber: 'PQR-678',
      category: 'car',
      model: 'Corolla Cross',
      brand: 'Toyota',
      year: 2022,
      status: 'available',
      mileage: 15900,
      nextServiceMileage: 20000,
      insuranceExpiry: isoAt(200, 0),
      createdAt: isoAt(-20, 9),
    },
  ];
}

export function seedCustomers(): Customer[] {
  return [
    { id: 'c1', name: '王小明', phone: '0912-345-678' },
    { id: 'c2', name: '林美惠', phone: '0922-111-222', idNumber: 'A123456789' },
    { id: 'c3', name: '陳大同', phone: '0933-333-444', note: '常客' },
    { id: 'c4', name: '佐藤健', phone: '+81-90-1234-5678', note: '日本旅客' },
  ];
}

export function seedBookings(): RentalBooking[] {
  return [
    {
      id: 'b1',
      vehicleId: 'v2',
      customerId: 'c1',
      startTime: isoAt(-1, 9),
      endTime: isoAt(1, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'in_progress',
    },
    {
      id: 'b2',
      vehicleId: 'v5',
      customerId: 'c2',
      startTime: isoAt(0, 10),
      endTime: isoAt(2, 17),
      pickupLocation: '機場',
      returnLocation: '馬公門市',
      status: 'confirmed',
      sourcePartnerId: 'pt1',
    },
    {
      id: 'b3',
      vehicleId: 'v1',
      customerId: 'c3',
      startTime: isoAt(2, 9),
      endTime: isoAt(4, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'confirmed',
    },
    {
      id: 'b4',
      vehicleId: 'v3',
      customerId: 'c4',
      startTime: isoAt(3, 9),
      endTime: isoAt(6, 12),
      pickupLocation: '機場',
      returnLocation: '機場',
      status: 'confirmed',
    },
    {
      id: 'b5',
      vehicleId: 'v1',
      customerId: 'c2',
      startTime: isoAt(-5, 9),
      endTime: isoAt(-3, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'completed',
      sourcePartnerId: 'pt1',
    },
    {
      id: 'b6',
      vehicleId: 'v6',
      customerId: 'c1',
      startTime: isoAt(0, 14),
      endTime: isoAt(0, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'confirmed',
    },
    {
      id: 'b7',
      vehicleId: 'v3',
      customerId: 'c3',
      startTime: isoAt(-10, 9),
      endTime: isoAt(-8, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'cancelled',
    },
    {
      id: 'b8',
      vehicleId: 'v6',
      customerId: 'c4',
      startTime: isoAt(7, 9),
      endTime: isoAt(9, 18),
      pickupLocation: '機場',
      returnLocation: '機場',
      status: 'confirmed',
    },
  ];
}

export function seedPricingPlans(): PricingPlan[] {
  return [
    {
      id: 'pp1',
      name: '機車 125',
      appliesToCategory: 'scooter',
      dayTypeRates: { weekday: 400, weekend: 500, holiday: 600, peak: 700 },
      tiers: [
        { minDays: 3, discountPercent: 5 },
        { minDays: 7, discountPercent: 10 },
      ],
    },
    {
      id: 'pp2',
      name: '小客車',
      appliesToCategory: 'car',
      dayTypeRates: { weekday: 1500, weekend: 1800, holiday: 2200, peak: 2600 },
      tiers: [{ minDays: 3, discountPercent: 5 }],
    },
    {
      id: 'pp3',
      name: '電動車',
      appliesToCategory: 'ev',
      dayTypeRates: { weekday: 450, weekend: 550, holiday: 650, peak: 750 },
      tiers: [
        { minDays: 3, discountPercent: 5 },
        { minDays: 7, discountPercent: 10 },
      ],
    },
  ];
}

export function seedSeasonCalendar(): SeasonCalendar[] {
  return [{ id: 'default', holidays: [], peakSeasons: [{ start: '2026-04-18', end: '2026-06-30' }] }];
}

export function seedAddOns(): AddOn[] {
  return [
    { id: 'ao1', name: '安全帽', unitPrice: 0, unit: 'per_rental' },
    { id: 'ao2', name: '雨衣', unitPrice: 50, unit: 'per_rental' },
    { id: 'ao3', name: '兒童安全座椅', unitPrice: 100, unit: 'per_day' },
    { id: 'ao4', name: '手機支架', unitPrice: 30, unit: 'per_rental' },
  ];
}

export function seedCoupons(): Coupon[] {
  return [
    { id: 'cp1', code: 'SUMMER10', type: 'percent', value: 10, minDays: 2,
      validFrom: '2026-06-01', validTo: '2026-08-31' },
    { id: 'cp2', code: 'CAR300', type: 'amount', value: 300, applicableCategories: ['car'],
      validFrom: '2026-01-01', validTo: '2026-12-31' },
  ];
}

export function seedPartners(): Partner[] {
  return [
    { id: 'pt1', name: '海景民宿', slug: 'seaview', discountPercent: 8,
      commission: { type: 'percent', value: 10 } },
    { id: 'pt2', name: '陽光民宿', slug: 'sunshine', discountPercent: 5,
      commission: { type: 'per_vehicle_day', value: 100 } },
  ];
}

export function seedPayouts(): MonthlyPayout[] {
  return [{ id: 'po1', partnerId: 'pt1', month: '2026-07', status: 'pending' }];
}
