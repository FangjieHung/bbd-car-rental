import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HandoverRecord } from '@car-rental/domain';
import { HANDOVER_RECORD_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { HandoverStore } from './handover.store';

describe('HandoverStore', () => {
  let store: HandoverStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HANDOVER_RECORD_REPO, useValue: createInMemoryRepo<HandoverRecord>() }],
    });
    store = TestBed.inject(HandoverStore);
  });

  it('依序記錄取車與還車紀錄，各自可依訂單查到對應那一筆', () => {
    expect(store.pickupFor('b1')).toBeUndefined();

    const pickup = store.recordPickup({
      bookingId: 'b1',
      actualAt: '2026-07-20T09:10:00.000Z',
      mileage: 1000,
      energyLevel: 8,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: 'staff1', confirmedAt: '2026-07-20T09:10:00.000Z' },
    });
    expect(pickup.kind).toBe('pickup');
    expect(store.pickupFor('b1')?.id).toBe(pickup.id);
    expect(store.returnFor('b1')).toBeUndefined();

    const ret = store.recordReturn({
      bookingId: 'b1',
      actualAt: '2026-07-22T18:30:00.000Z',
      mileage: 1150,
      energyLevel: 6,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: 'staff1', confirmedAt: '2026-07-22T18:30:00.000Z' },
    });
    expect(ret.kind).toBe('return');
    expect(store.returnFor('b1')?.id).toBe(ret.id);
    expect(store.recordsFor('b1')).toHaveLength(2);
  });

  it('evaluateReadiness／calculateCharges 直接委派給 Task 5 純函式', () => {
    const readiness = store.evaluateReadiness({
      evaluatedAt: '2026-07-20T09:00:00.000Z',
      depositRequired: 0,
      depositPaid: 0,
      latestContractSigned: true,
      requiredDocuments: [],
      driverCredential: {
        present: true,
        matchesVehicleClass: true,
        isForeignVisitor: false,
        reciprocityStatus: 'not_applicable',
      },
      originalDocumentCheckedThisVisit: true,
      vehicle: { status: 'available', hasSchedulingConflict: false },
    });
    expect(readiness.ready).toBe(true);

    const charges = store.calculateCharges({
      scheduledReturnAt: '2026-07-22T18:00:00.000Z',
      actualReturnAt: '2026-07-22T18:00:00.000Z',
      lateReturnPolicy: { graceMinutes: 15, unitMinutes: 30, feePerUnit: 100, dailyCap: 1000 },
      energyReturnPolicy: { measure: 'eighths', feePerUnit: 50, serviceFee: 100 },
      pickupEnergyLevel: 8,
      returnEnergyLevel: 8,
    });
    expect(charges.finalTotalCharge).toBe(0);
  });
});
