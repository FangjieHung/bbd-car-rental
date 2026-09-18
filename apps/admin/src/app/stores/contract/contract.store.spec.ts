import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ContractSnapshot, ContractVersion } from '@car-rental/domain';
import { CONTRACT_VERSION_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { ContractStore } from './contract.store';

function snapshot(overrides: Partial<ContractSnapshot> = {}): ContractSnapshot {
  return {
    renter: { memberId: 'c1', name: '王小明', phone: '0912345678' },
    driver: { memberId: 'c1', name: '王小明', phone: '0912345678' },
    vehicle: { vehicleId: 'v1', plateNumber: 'ABC-123', brand: 'Toyota', model: 'Yaris', category: 'car' },
    rentalStartTime: '2026-07-20T09:00:00.000Z',
    rentalEndTime: '2026-07-22T18:00:00.000Z',
    pickupLocation: '馬公',
    returnLocation: '馬公',
    depositRequired: 1000,
    pricing: {
      dailyLines: [],
      rentalRaw: 4000,
      tierDiscountPercent: 0,
      tierDiscountAmount: 0,
      rentalSubtotal: 4000,
      partnerDiscountPercent: 0,
      partnerDiscount: 0,
      addOnLines: [],
      addOnSubtotal: 0,
      insuranceSubtotal: 0,
      couponDiscount: 0,
      total: 4000,
    },
    disclosedRules: { cancellationContractKind: 'passenger_car', cancellationRuleVersion: '2026.1' },
    ...overrides,
  };
}

describe('ContractStore', () => {
  let store: ContractStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>() }],
    });
    store = TestBed.inject(ContractStore);
  });

  it('建立草稿、簽署，異動後重大異動觸發舊版 superseded 並開新版草稿', () => {
    const draft = store.createDraft('b1', snapshot());
    expect(draft.version).toBe(1);
    expect(draft.status).toBe('draft');

    const signed = store.sign(draft.id, ['sig-asset-1']);
    expect(signed.status).toBe('signed');
    expect(signed.signedAt).toBeTruthy();

    // 租期異動屬於重大異動
    const revised = store.reviseIfChanged('b1', snapshot({ rentalEndTime: '2026-07-23T18:00:00.000Z' }));
    expect(revised.version).toBe(2);
    expect(revised.status).toBe('draft');

    const versions = store.versionsFor('b1');
    expect(versions).toHaveLength(2);
    expect(versions[0].status).toBe('superseded');
    expect(versions[0].supersededReason).toContain('rentalEndTime');
  });

  it('沒有重大異動時不建立新版本', () => {
    const draft = store.createDraft('b2', snapshot());
    store.sign(draft.id, ['sig-asset-2']);

    const unchanged = store.reviseIfChanged('b2', snapshot({ internalNote: '內部備註異動不算重大異動' }));
    expect(unchanged.id).toBe(draft.id);
    expect(store.versionsFor('b2')).toHaveLength(1);
  });
});
