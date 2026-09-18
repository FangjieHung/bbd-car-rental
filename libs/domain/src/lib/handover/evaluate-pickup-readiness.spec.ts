import { describe, it, expect } from 'vitest';
import { evaluatePickupReadiness, PickupReadinessInput } from './evaluate-pickup-readiness';

const NOW = '2026-10-01T09:00:00+08:00';

/** 一份完全放行、無任何阻擋或警示的基準輸入；各測試只覆寫要驗證的那個欄位。 */
function baseInput(overrides: Partial<PickupReadinessInput> = {}): PickupReadinessInput {
  return {
    evaluatedAt: NOW,
    depositRequired: 3_000,
    depositPaid: 3_000,
    latestContractSigned: true,
    requiredDocuments: [{ kind: 'national_id', present: true }],
    driverCredential: {
      present: true,
      matchesVehicleClass: true,
      isForeignVisitor: false,
      reciprocityStatus: 'not_applicable',
    },
    originalDocumentCheckedThisVisit: true,
    vehicle: { status: 'reserved', hasSchedulingConflict: false },
    memberEmail: 'customer@example.com',
    ...overrides,
  };
}

describe('evaluatePickupReadiness', () => {
  it('is ready with no blockers or warnings when everything checks out', () => {
    const result = evaluatePickupReadiness(baseInput());

    expect(result.ready).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('blocks when the deposit paid is below the required threshold', () => {
    const result = evaluatePickupReadiness(baseInput({ depositPaid: 1_000 }));

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({ type: 'deposit_below_threshold' }),
    ]);
  });

  it('blocks when the latest contract version is unsigned', () => {
    const result = evaluatePickupReadiness(baseInput({ latestContractSigned: false }));

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({ type: 'latest_contract_unsigned' }),
    ]);
  });

  it('blocks when a required identity document is missing', () => {
    const result = evaluatePickupReadiness(
      baseInput({ requiredDocuments: [{ kind: 'national_id', present: false }] }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({
        type: 'required_document_missing_or_expired',
        reason: 'missing_document:national_id',
      }),
    ]);
  });

  it('blocks when the driver credential is expired', () => {
    const result = evaluatePickupReadiness(
      baseInput({
        driverCredential: {
          present: true,
          expiryDate: '2026-09-01', // before evaluatedAt
          matchesVehicleClass: true,
          isForeignVisitor: false,
          reciprocityStatus: 'not_applicable',
        },
      }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({
        type: 'required_document_missing_or_expired',
        reason: 'expired_driver_credential',
      }),
    ]);
  });

  it('blocks when the driver credential does not match the permitted vehicle class', () => {
    const result = evaluatePickupReadiness(
      baseInput({
        driverCredential: {
          present: true,
          matchesVehicleClass: false,
          isForeignVisitor: false,
          reciprocityStatus: 'not_applicable',
        },
      }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({
        type: 'foreign_reciprocity_or_vehicle_class_mismatch',
        reason: 'vehicle_class_mismatch',
      }),
    ]);
  });

  it('blocks a foreign visitor whose reciprocity eligibility is not confirmed', () => {
    const result = evaluatePickupReadiness(
      baseInput({
        driverCredential: {
          present: true,
          matchesVehicleClass: true,
          isForeignVisitor: true,
          reciprocityStatus: 'pending',
        },
      }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({
        type: 'foreign_reciprocity_or_vehicle_class_mismatch',
        reason: 'reciprocity_not_eligible',
      }),
    ]);
  });

  it('blocks when the original document has not been checked this visit', () => {
    const result = evaluatePickupReadiness(baseInput({ originalDocumentCheckedThisVisit: false }));

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({ type: 'original_document_not_confirmed' }),
    ]);
  });

  it('blocks when the vehicle is under maintenance', () => {
    const result = evaluatePickupReadiness(
      baseInput({ vehicle: { status: 'maintenance', hasSchedulingConflict: false } }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({
        type: 'vehicle_not_deliverable',
        reason: 'vehicle_under_maintenance',
      }),
    ]);
  });

  it('blocks when the vehicle has a scheduling conflict', () => {
    const result = evaluatePickupReadiness(
      baseInput({ vehicle: { status: 'reserved', hasSchedulingConflict: true } }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      expect.objectContaining({
        type: 'vehicle_not_deliverable',
        reason: 'vehicle_time_conflict',
      }),
    ]);
  });

  describe('non-blocking warnings', () => {
    it('warns, but does not block, when the member email is missing', () => {
      const result = evaluatePickupReadiness(baseInput({ memberEmail: undefined }));

      expect(result.ready).toBe(true);
      expect(result.blockers).toEqual([]);
      expect(result.warnings).toEqual([expect.objectContaining({ type: 'missing_email' })]);
    });

    it('warns, but does not block, on low-confidence OCR', () => {
      const result = evaluatePickupReadiness(
        baseInput({
          requiredDocuments: [{ kind: 'national_id', present: true, ocrConfidence: 0.3 }],
        }),
      );

      expect(result.ready).toBe(true);
      expect(result.blockers).toEqual([]);
      expect(result.warnings).toEqual([expect.objectContaining({ type: 'low_confidence_ocr' })]);
    });

    it('warns, but does not block, when a document is nearing expiry', () => {
      const result = evaluatePickupReadiness(
        baseInput({
          requiredDocuments: [
            { kind: 'national_id', present: true, expiryDate: '2026-10-10' }, // 9 days out
          ],
        }),
      );

      expect(result.ready).toBe(true);
      expect(result.blockers).toEqual([]);
      expect(result.warnings).toEqual([
        expect.objectContaining({ type: 'document_near_expiry' }),
      ]);
    });

    it('warns, but does not block, when there is a special note', () => {
      const result = evaluatePickupReadiness(baseInput({ specialNotes: '顧客要求延後 30 分鐘取車' }));

      expect(result.ready).toBe(true);
      expect(result.blockers).toEqual([]);
      expect(result.warnings).toEqual([expect.objectContaining({ type: 'special_note' })]);
    });
  });

  it('collects multiple blockers and warnings at once, rather than stopping at the first', () => {
    const result = evaluatePickupReadiness(
      baseInput({
        depositPaid: 0,
        latestContractSigned: false,
        memberEmail: undefined,
      }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers.map((b) => b.type).sort()).toEqual(
      ['deposit_below_threshold', 'latest_contract_unsigned'].sort(),
    );
    expect(result.warnings).toEqual([expect.objectContaining({ type: 'missing_email' })]);
  });
});
