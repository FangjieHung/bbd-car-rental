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
    pickupBranchId: '馬公',
    returnBranchId: '馬公',
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

  it('已簽署版本不可再次簽署（不可覆寫）：對 signed 版本呼叫 sign 會拋錯，不更動 signedAt／signatureAssetIds', () => {
    const draft = store.createDraft('b3', snapshot());
    const signed = store.sign(draft.id, ['sig-asset-3']);

    expect(() => store.sign(draft.id, ['sig-asset-overwrite'])).toThrow();

    const stillSame = store.versionsFor('b3')[0];
    expect(stillSame.signedAt).toBe(signed.signedAt);
    expect(stillSame.signatureAssetIds).toEqual(['sig-asset-3']);
  });

  it('已被取代（superseded）的版本不可簽署：對舊版呼叫 sign 會拋錯', () => {
    const draft = store.createDraft('b4', snapshot());
    store.sign(draft.id, ['sig-asset-4']);
    store.reviseIfChanged('b4', snapshot({ rentalEndTime: '2026-07-23T18:00:00.000Z' }));

    const superseded = store.versionsFor('b4')[0];
    expect(superseded.status).toBe('superseded');
    expect(() => store.sign(superseded.id, ['sig-asset-late'])).toThrow();
  });
});
