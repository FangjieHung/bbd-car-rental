import { describe, it, expect } from 'vitest';
import { evaluateContractChange } from './contract-versioning';
import { ContractSnapshot } from '../models/contract-version';

function baseSnapshot(): ContractSnapshot {
  return {
    renter: {
      memberId: 'c1',
      name: '王小明',
      phone: '0912-345-678',
      email: 'ming@example.com',
      idNumber: 'A123456789',
    },
    driver: {
      memberId: 'c1',
      name: '王小明',
      phone: '0912-345-678',
      driverLicenseNumber: 'D1234567',
    },
    vehicle: {
      vehicleId: 'v1',
      plateNumber: 'ABC-1234',
      brand: 'Toyota',
      model: 'Altis',
      category: 'car',
      fuelPolicy: 'full_to_full',
      mileagePolicy: 'unlimited',
      energyType: 'gasoline',
    },
    rentalStartTime: '2026-10-15T09:00:00+08:00',
    rentalEndTime: '2026-10-18T09:00:00+08:00',
    pickupLocation: '馬公門市',
    returnLocation: '馬公門市',
    depositRequired: 3_000,
    pricing: {
      dailyLines: [],
      rentalRaw: 6_000,
      tierDiscountPercent: 0,
      tierDiscountAmount: 0,
      rentalSubtotal: 6_000,
      partnerDiscountPercent: 0,
      partnerDiscount: 0,
      addOnLines: [],
      addOnSubtotal: 0,
      insuranceSubtotal: 500,
      couponDiscount: 0,
      total: 6_500,
    },
    disclosedRules: {
      cancellationContractKind: 'passenger_car',
      cancellationRuleVersion: '2026-09-18',
      lateReturnPolicy: { graceMinutes: 30, unitMinutes: 60, feePerUnit: 200, dailyCap: 2_000 },
      energyReturnPolicy: { measure: 'eighths', feePerUnit: 100, serviceFee: 150 },
    },
    internalNote: '常客，續租機率高',
  };
}

describe('evaluateContractChange', () => {
  it('沒有任何異動時不構成重大異動', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(false);
    expect(result.changedFields).toEqual([]);
  });

  it('承租人或駕駛人變動會使已簽署版本失效', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();
    next.driver = { ...next.driver, memberId: 'c2', name: '林美惠', phone: '0922-111-222' };

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(true);
    expect(result.changedFields).toContain('driver');
  });

  it('車輛變動會使已簽署版本失效', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();
    next.vehicle = { ...next.vehicle, vehicleId: 'v2', plateNumber: 'XYZ-9999' };

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(true);
    expect(result.changedFields).toContain('vehicle');
  });

  it('租期變動會使已簽署版本失效', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();
    next.rentalEndTime = '2026-10-20T09:00:00+08:00';

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(true);
    expect(result.changedFields).toContain('rentalEndTime');
  });

  it('取還車地點變動會使已簽署版本失效', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();
    next.returnLocation = '馬公機場';

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(true);
    expect(result.changedFields).toContain('returnLocation');
  });

  it('租金（含計價明細）變動會使已簽署版本失效', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();
    next.pricing = { ...next.pricing, rentalRaw: 7_000, rentalSubtotal: 7_000, total: 7_500 };

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(true);
    expect(result.changedFields).toContain('pricing');
  });

  it('保險內容變動會使已簽署版本失效', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();
    next.pricing = { ...next.pricing, insuranceSubtotal: 800, total: 6_800 };

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(true);
    expect(result.changedFields).toContain('pricing');
  });

  it('內部備註變動不構成重大異動', () => {
    const previous = baseSnapshot();
    const next = baseSnapshot();
    next.internalNote = '已改為長期租客，備註更新';

    const result = evaluateContractChange(previous, next);

    expect(result.supersedes).toBe(false);
    expect(result.changedFields).toEqual([]);
  });
});
