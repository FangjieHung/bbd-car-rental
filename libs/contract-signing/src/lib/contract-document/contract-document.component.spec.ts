import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ContractSnapshot } from '@car-rental/domain';
import { CONTRACT_SIGNING_LABELS, DEFAULT_CONTRACT_SIGNING_LABELS } from '../contract-signing-labels';
import { ContractDocumentComponent } from './contract-document.component';

function sampleSnapshot(overrides: Partial<ContractSnapshot> = {}): ContractSnapshot {
  return {
    renter: { memberId: 'c1', name: '王小明', phone: '0912345678', idNumber: 'A123456789' },
    driver: { memberId: 'c2', name: '林小華', phone: '0922333444' },
    vehicle: {
      vehicleId: 'v1',
      plateNumber: 'ABC-123',
      brand: 'Toyota',
      model: 'Yaris',
      category: 'car',
      fuelPolicy: 'full_to_full',
      mileagePolicy: 'unlimited',
      energyType: 'gasoline',
    },
    rentalStartTime: '2026-07-20T09:00:00.000Z',
    rentalEndTime: '2026-07-22T18:00:00.000Z',
    pickupLocation: '馬公門市',
    returnLocation: '機場櫃檯',
    depositRequired: 1000,
    pricing: {
      dailyLines: [],
      rentalRaw: 4000,
      tierDiscountPercent: 0,
      tierDiscountAmount: 0,
      rentalSubtotal: 4000,
      partnerDiscountPercent: 0,
      partnerDiscount: 0,
      addOnLines: [{ addOnId: 'a1', name: '兒童安全座椅', qty: 1, amount: 200 }],
      addOnSubtotal: 200,
      insuranceSubtotal: 300,
      couponDiscount: 0,
      total: 4500,
    },
    disclosedRules: {
      cancellationContractKind: 'passenger_car',
      cancellationRuleVersion: 'v1',
      lateReturnPolicy: { graceMinutes: 30, unitMinutes: 60, feePerUnit: 100, dailyCap: 500 },
      energyReturnPolicy: { measure: 'eighths', feePerUnit: 50, serviceFee: 100 },
      otherDisclosures: ['禁止攜帶寵物'],
    },
    ...overrides,
  };
}

function render(snapshot: ContractSnapshot, version?: { version: number; createdAt: string; signedAt?: string }) {
  const fixture = TestBed.createComponent(ContractDocumentComponent);
  fixture.componentRef.setInput('snapshot', snapshot);
  if (version) fixture.componentRef.setInput('version', version);
  fixture.detectChanges();
  return { fixture, text: () => (fixture.nativeElement as HTMLElement).textContent ?? '' };
}

const L = DEFAULT_CONTRACT_SIGNING_LABELS.document;

describe('ContractDocumentComponent', () => {
  it('完整渲染快照：承租人、駕駛人、車輛、租期地點、計價、加購、逾時/能源規則、其他揭露事項與免責提示', () => {
    const { text } = render(sampleSnapshot());
    const content = text();

    expect(content).toContain('王小明');
    expect(content).toContain('A123456789');
    expect(content).toContain('林小華');
    expect(content).toContain('ABC-123');
    expect(content).toContain('Yaris');
    expect(content).toContain(L.vehicleCategoryLabels.car);
    expect(content).toContain(L.fuelPolicyLabels.full_to_full);
    expect(content).toContain('馬公門市');
    expect(content).toContain('機場櫃檯');
    expect(content).toContain('2026/07/20 17:00');
    expect(content).toContain('4,500');
    expect(content).toContain('1,000');
    expect(content).toContain('兒童安全座椅');
    expect(content).toContain(L.cancellationContractKindLabels.passenger_car);
    expect(content).toContain(L.energyMeasureLabels.eighths);
    expect(content).toContain('禁止攜帶寵物');
    expect(content).toContain(L.disclaimer);
  });

  it('駕駛人與承租人是同一會員時顯示「同承租人」，不重複列出駕駛人資料', () => {
    const base = sampleSnapshot();
    const { text } = render(sampleSnapshot({ driver: base.renter }));

    expect(text()).toContain(L.sameAsRenter);
    expect(text()).not.toContain('林小華');
  });

  it('未提供 version 時不顯示建立／簽署時間；提供時顯示，已簽署才顯示簽署時間', () => {
    expect(render(sampleSnapshot()).text()).not.toContain(L.createdAt);

    const draft = render(sampleSnapshot(), { version: 1, createdAt: '2026-07-01T08:00:00.000Z' }).text();
    expect(draft).toContain(L.createdAt);
    expect(draft).toContain('2026/07/01 16:00');
    expect(draft).not.toContain(L.signedAt);

    const signed = render(sampleSnapshot(), {
      version: 1,
      createdAt: '2026-07-01T08:00:00.000Z',
      signedAt: '2026-07-02T10:30:00.000Z',
    }).text();
    expect(signed).toContain(L.signedAt);
    expect(signed).toContain('2026/07/02 18:30');
  });

  it('時間一律以台灣時間顯示，不顯示 UTC 原始字串（合約是給客人簽的文件）', () => {
    const content = render(
      sampleSnapshot({ rentalStartTime: '2026-09-24T01:00:00.000Z', rentalEndTime: '2026-09-24T16:30:00.000Z' }),
    ).text();
    expect(content).toContain('2026/09/24 09:00');
    expect(content).toContain('2026/09/25 00:30');
    expect(content).not.toContain('T01:00');
  });

  it('文案來自 CONTRACT_SIGNING_LABELS，可由消費端替換', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CONTRACT_SIGNING_LABELS,
          useValue: {
            ...DEFAULT_CONTRACT_SIGNING_LABELS,
            document: { ...L, renterSection: 'Renter' },
          },
        },
      ],
    });
    expect(render(sampleSnapshot()).text()).toContain('Renter');
  });
});
