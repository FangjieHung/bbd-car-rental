import {
  Vehicle,
  Member,
  RentalBooking,
  PricingPlan,
  SeasonCalendar,
  AddOn,
  Coupon,
  Partner,
  MonthlyPayout,
  PaymentRecord,
  RefundRecord,
  ChargeAdjustment,
  IdentityDocument,
  DriverCredential,
  ContractVersion,
  ContractSnapshot,
  HandoverRecord,
  CancellationCase,
  CustomerCreditLedgerEntry,
  ReminderStatus,
  OperatorRecoveryCase,
  AuditEntry,
  PriceBreakdown,
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
      // 目前正由 b9 出租中（已逾還車時間未還車，見 seedHandoverRecords 的逾期還車示範案例）。
      status: 'rented',
      mileage: 4800,
      insuranceExpiry: isoAt(120, 0),
      createdAt: isoAt(-90, 9),
      classLabel: '電動機車',
      seats: 2,
      luggage: 1,
      hasAirConditioner: false,
      transmission: 'auto',
      instantConfirm: true,
      supplierCount: 1,
      location: '機場',
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
      classLabel: '重型機車',
      seats: 2,
      luggage: 1,
      hasAirConditioner: false,
      transmission: 'auto',
      instantConfirm: false,
      supplierCount: 2,
      location: '店舖',
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
      classLabel: '小型轎車',
      seats: 5,
      luggage: 2,
      hasAirConditioner: true,
      transmission: 'auto',
      instantConfirm: true,
      supplierCount: 1,
      location: '機場',
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
      classLabel: '七人座休旅車',
      seats: 7,
      luggage: 4,
      hasAirConditioner: true,
      transmission: 'auto',
      instantConfirm: false,
      supplierCount: 1,
      location: '港口',
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
      classLabel: '輕型機車',
      seats: 2,
      luggage: 1,
      hasAirConditioner: false,
      transmission: 'auto',
      instantConfirm: true,
      supplierCount: 3,
      location: '機場',
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
      classLabel: '跨界休旅車',
      seats: 5,
      luggage: 3,
      hasAirConditioner: true,
      transmission: 'auto',
      instantConfirm: true,
      supplierCount: 2,
      location: '港口',
    },
  ];
}

export function seedMembers(): Member[] {
  return [
    { id: 'c1', name: '王小明', phone: '0912-345-678', kind: 'local' },
    { id: 'c2', name: '林美惠', phone: '0922-111-222', idNumber: 'A123456789', kind: 'local' },
    { id: 'c3', name: '陳大同', phone: '0933-333-444', note: '常客', kind: 'local' },
    { id: 'c4', name: '佐藤健', phone: '+81-90-1234-5678', note: '日本旅客', kind: 'foreign_visitor' },
  ];
}

export function seedBookings(): RentalBooking[] {
  return [
    {
      id: 'b1',
      vehicleId: 'v2',
      memberId: 'c1',
      startTime: isoAt(-1, 9),
      endTime: isoAt(1, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'in_progress',
      depositRequired: 0,
    },
    {
      id: 'b2',
      vehicleId: 'v5',
      memberId: 'c2',
      startTime: isoAt(0, 10),
      endTime: isoAt(2, 17),
      pickupLocation: '機場',
      returnLocation: '馬公門市',
      status: 'reserved',
      depositRequired: 0,
      sourcePartnerId: 'pt1',
    },
    {
      id: 'b3',
      vehicleId: 'v1',
      memberId: 'c3',
      startTime: isoAt(2, 9),
      endTime: isoAt(4, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'reserved',
      depositRequired: 0,
    },
    {
      id: 'b4',
      vehicleId: 'v3',
      memberId: 'c4',
      startTime: isoAt(3, 9),
      endTime: isoAt(6, 12),
      pickupLocation: '機場',
      returnLocation: '機場',
      status: 'reserved',
      depositRequired: 1000,
    },
    {
      id: 'b5',
      vehicleId: 'v1',
      memberId: 'c2',
      startTime: isoAt(-5, 9),
      endTime: isoAt(-3, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'completed',
      depositRequired: 0,
      sourcePartnerId: 'pt1',
    },
    {
      id: 'b6',
      vehicleId: 'v6',
      memberId: 'c1',
      startTime: isoAt(0, 14),
      endTime: isoAt(0, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'reserved',
      depositRequired: 1500,
    },
    {
      id: 'b7',
      vehicleId: 'v3',
      memberId: 'c3',
      startTime: isoAt(-10, 9),
      endTime: isoAt(-8, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'cancelled',
      depositRequired: 1000,
    },
    {
      id: 'b8',
      vehicleId: 'v6',
      memberId: 'c4',
      startTime: isoAt(7, 9),
      endTime: isoAt(9, 18),
      pickupLocation: '機場',
      returnLocation: '機場',
      status: 'reserved',
      depositRequired: 1500,
    },
    // 逾期還車示範案例：已取車、預定還車時間已過但尚未還車（見 seedHandoverRecords 只有
    // pickup 紀錄、沒有 return 紀錄）。
    {
      id: 'b9',
      vehicleId: 'v1',
      memberId: 'c2',
      startTime: isoAt(-3, 9),
      endTime: isoAt(-1, 18),
      pickupLocation: '馬公門市',
      returnLocation: '馬公門市',
      status: 'in_progress',
      depositRequired: 0,
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
  return [
    { id: 'default', holidays: [], peakSeasons: [{ start: '2026-04-18', end: '2026-06-30' }] },
  ];
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
    {
      id: 'cp1',
      code: 'SUMMER10',
      type: 'percent',
      value: 10,
      minDays: 2,
      validFrom: '2026-06-01',
      validTo: '2026-08-31',
    },
    {
      id: 'cp2',
      code: 'CAR300',
      type: 'amount',
      value: 300,
      applicableCategories: ['car'],
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
    },
  ];
}

export function seedPartners(): Partner[] {
  return [
    {
      id: 'pt1',
      name: '海景民宿',
      slug: 'seaview',
      discountPercent: 8,
      commission: { type: 'percent', value: 10 },
    },
    {
      id: 'pt2',
      name: '陽光民宿',
      slug: 'sunshine',
      discountPercent: 5,
      commission: { type: 'per_vehicle_day', value: 100 },
    },
  ];
}

export function seedPayouts(): MonthlyPayout[] {
  return [{ id: 'po1', partnerId: 'pt1', month: '2026-07', status: 'pending' }];
}

// --- Task 7：租務作業工作流 seed 資料 ---
// 只鋪陳足夠串起以下五種示範情境的關聯資料，不求覆蓋每一筆既有訂單：
// 取車就緒（b3）、取車阻擋（b4）、逾期未還車（b9）、退款處理中（b7）、外國旅客待人工審查（b8）。

/** 沒有真正報價流程的 seed 訂單，用這個簡化版 PriceBreakdown 撐出一個合理總額即可。 */
function samplePriceBreakdown(total: number): PriceBreakdown {
  return {
    dailyLines: [],
    rentalRaw: total,
    tierDiscountPercent: 0,
    tierDiscountAmount: 0,
    rentalSubtotal: total,
    partnerDiscountPercent: 0,
    partnerDiscount: 0,
    addOnLines: [],
    addOnSubtotal: 0,
    insuranceSubtotal: 0,
    couponDiscount: 0,
    total,
  };
}

export function seedPayments(): PaymentRecord[] {
  return [
    {
      id: 'pay1',
      bookingId: 'b1',
      amount: 1200,
      method: 'cash',
      purpose: 'balance',
      status: 'confirmed',
      receivedAt: isoAt(-1, 9),
      handledBy: 'staff1',
    },
    {
      id: 'pay2',
      bookingId: 'b6',
      amount: 1500,
      method: 'credit_card',
      purpose: 'deposit',
      status: 'confirmed',
      receivedAt: isoAt(0, 10),
      handledBy: 'staff1',
    },
    // b4 顧客已嘗試匯款訂金但尚未確認入帳 → 取車阻擋示範案例的「未達訂金門檻」成因之一。
    {
      id: 'pay3',
      bookingId: 'b4',
      amount: 1000,
      method: 'bank_transfer',
      purpose: 'deposit',
      status: 'pending',
      receivedAt: isoAt(2, 9),
      handledBy: 'staff1',
      bankLastFive: '88888',
      note: '匯款確認中，尚未入帳',
    },
    {
      id: 'pay4',
      bookingId: 'b7',
      amount: 1000,
      method: 'cash',
      purpose: 'deposit',
      status: 'confirmed',
      receivedAt: isoAt(-10, 9),
      handledBy: 'staff2',
    },
    {
      id: 'pay5',
      bookingId: 'b9',
      amount: 700,
      method: 'line_pay',
      purpose: 'balance',
      status: 'confirmed',
      receivedAt: isoAt(-3, 9),
      handledBy: 'staff1',
    },
  ];
}

export function seedRefunds(): RefundRecord[] {
  return [
    // 退款處理中示範案例：b7 取消後試算應退 NT$300，出納尚未撥款。
    {
      id: 'ref1',
      bookingId: 'b7',
      cancellationCaseId: 'cc-b7',
      amount: 300,
      method: 'cash',
      status: 'pending',
      handledBy: 'staff2',
      note: '退款處理中，待出納撥款',
    },
  ];
}

export function seedChargeAdjustments(): ChargeAdjustment[] {
  return [
    {
      id: 'adj1',
      bookingId: 'b6',
      kind: 'manual',
      quotedAmount: 200,
      amount: 200,
      status: 'draft',
      reason: '加收清潔費',
      createdAt: isoAt(0, 10),
      handledBy: 'staff1',
    },
  ];
}

export function seedIdentityDocuments(): IdentityDocument[] {
  return [
    {
      id: 'idoc1',
      memberId: 'c1',
      type: 'taiwan_id',
      documentNumber: 'A100000001',
      issuingCountry: 'TW',
      verification: { state: 'verified', verifiedAt: isoAt(-30, 10), verifiedBy: 'staff1' },
      version: 1,
      createdAt: isoAt(-30, 10),
      updatedAt: isoAt(-30, 10),
    },
    {
      id: 'idoc2',
      memberId: 'c2',
      type: 'taiwan_id',
      documentNumber: 'A123456789',
      issuingCountry: 'TW',
      verification: { state: 'verified', verifiedAt: isoAt(-20, 10), verifiedBy: 'staff1' },
      version: 1,
      createdAt: isoAt(-20, 10),
      updatedAt: isoAt(-20, 10),
    },
    // 取車就緒示範案例：c3 的證件已核對完成。
    {
      id: 'idoc3',
      memberId: 'c3',
      type: 'taiwan_id',
      documentNumber: 'A100000003',
      issuingCountry: 'TW',
      verification: { state: 'verified', verifiedAt: isoAt(-5, 10), verifiedBy: 'staff1' },
      version: 1,
      createdAt: isoAt(-5, 10),
      updatedAt: isoAt(-5, 10),
    },
    {
      id: 'idoc4',
      memberId: 'c4',
      type: 'passport',
      documentNumber: 'TR1234567',
      issuingCountry: 'JP',
      expiryDate: isoAt(400, 0),
      verification: {
        state: 'verified',
        ocrConfidence: 0.92,
        verifiedAt: isoAt(-2, 10),
        verifiedBy: 'staff1',
      },
      version: 1,
      createdAt: isoAt(-2, 10),
      updatedAt: isoAt(-2, 10),
    },
  ];
}

export function seedDriverCredentials(): DriverCredential[] {
  return [
    {
      id: 'dcred1',
      memberId: 'c1',
      type: 'taiwan_license',
      documentNumber: 'TL-0001',
      issuingCountry: 'TW',
      originalVehicleClassText: '普通重型機車',
      standardizedVehicleClass: 'scooter',
      verification: { state: 'verified', verifiedAt: isoAt(-30, 10), verifiedBy: 'staff1' },
      // 本國籍不查核互惠資格，這個欄位型別上不可省略，值本身不會被呼叫端讀取。
      reciprocityStatus: 'eligible',
      matchesRentedVehicleClass: true,
      version: 1,
      createdAt: isoAt(-30, 10),
      updatedAt: isoAt(-30, 10),
    },
    {
      id: 'dcred2',
      memberId: 'c2',
      type: 'taiwan_license',
      documentNumber: 'TL-0002',
      issuingCountry: 'TW',
      originalVehicleClassText: '普通輕型機車',
      standardizedVehicleClass: 'ev',
      verification: { state: 'verified', verifiedAt: isoAt(-20, 10), verifiedBy: 'staff1' },
      reciprocityStatus: 'eligible',
      matchesRentedVehicleClass: true,
      version: 1,
      createdAt: isoAt(-20, 10),
      updatedAt: isoAt(-20, 10),
    },
    // 取車就緒示範案例：c3 的駕照已核對完成、准駕車種與 b3 的電動機車相符。
    {
      id: 'dcred3',
      memberId: 'c3',
      type: 'taiwan_license',
      documentNumber: 'TL-0003',
      issuingCountry: 'TW',
      originalVehicleClassText: '普通輕型機車',
      standardizedVehicleClass: 'ev',
      verification: { state: 'verified', verifiedAt: isoAt(-5, 10), verifiedBy: 'staff1' },
      reciprocityStatus: 'eligible',
      matchesRentedVehicleClass: true,
      version: 1,
      createdAt: isoAt(-5, 10),
      updatedAt: isoAt(-5, 10),
    },
    // 外國旅客待人工審查示範案例：互惠資格尚未確認符合，OCR 信心也偏低。
    {
      id: 'dcred4',
      memberId: 'c4',
      type: 'foreign_idp_visa',
      documentNumber: 'IDP-JP-0004',
      issuingCountry: 'JP',
      originalVehicleClassText: 'Category B',
      standardizedVehicleClass: 'car',
      verification: { state: 'ocr_extracted', ocrConfidence: 0.55 },
      reciprocityStatus: 'manual_review',
      legalUseThroughDate: isoAt(200, 0),
      matchesRentedVehicleClass: true,
      version: 1,
      createdAt: isoAt(-2, 10),
      updatedAt: isoAt(-2, 10),
    },
  ];
}

function contractSnapshot(input: {
  memberId: string;
  name: string;
  phone: string;
  idNumber?: string;
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  category: 'car' | 'scooter' | 'ev';
  rentalStartTime: string;
  rentalEndTime: string;
  pickupLocation: string;
  returnLocation: string;
  depositRequired: number;
  total: number;
  cancellationContractKind: 'passenger_car' | 'scooter';
}): ContractSnapshot {
  const party = {
    memberId: input.memberId,
    name: input.name,
    phone: input.phone,
    idNumber: input.idNumber,
  };
  return {
    renter: party,
    driver: party,
    vehicle: {
      vehicleId: input.vehicleId,
      plateNumber: input.plateNumber,
      brand: input.brand,
      model: input.model,
      category: input.category,
    },
    rentalStartTime: input.rentalStartTime,
    rentalEndTime: input.rentalEndTime,
    pickupLocation: input.pickupLocation,
    returnLocation: input.returnLocation,
    depositRequired: input.depositRequired,
    pricing: samplePriceBreakdown(input.total),
    disclosedRules: {
      cancellationContractKind: input.cancellationContractKind,
      cancellationRuleVersion: '2026.1',
    },
  };
}

export function seedContractVersions(): ContractVersion[] {
  return [
    {
      id: 'cv-b1',
      bookingId: 'b1',
      version: 1,
      status: 'signed',
      snapshot: contractSnapshot({
        memberId: 'c1',
        name: '王小明',
        phone: '0912-345-678',
        vehicleId: 'v2',
        plateNumber: 'DEF-456',
        brand: 'Yamaha',
        model: '勁戰六代',
        category: 'scooter',
        rentalStartTime: isoAt(-1, 9),
        rentalEndTime: isoAt(1, 18),
        pickupLocation: '馬公門市',
        returnLocation: '馬公門市',
        depositRequired: 0,
        total: 1200,
        cancellationContractKind: 'scooter',
      }),
      createdAt: isoAt(-1, 8),
      signedAt: isoAt(-1, 8),
    },
    // 取車就緒示範案例：b3 合約已簽署。
    {
      id: 'cv-b3',
      bookingId: 'b3',
      version: 1,
      status: 'signed',
      snapshot: contractSnapshot({
        memberId: 'c3',
        name: '陳大同',
        phone: '0933-333-444',
        vehicleId: 'v1',
        plateNumber: 'ABC-123',
        brand: 'Gogoro',
        model: 'Gogoro 3',
        category: 'ev',
        rentalStartTime: isoAt(2, 9),
        rentalEndTime: isoAt(4, 18),
        pickupLocation: '馬公門市',
        returnLocation: '馬公門市',
        depositRequired: 0,
        total: 900,
        cancellationContractKind: 'scooter',
      }),
      createdAt: isoAt(1, 9),
      signedAt: isoAt(1, 9),
    },
    // 取車阻擋示範案例：b4 合約仍是草稿，尚未簽署。
    {
      id: 'cv-b4',
      bookingId: 'b4',
      version: 1,
      status: 'draft',
      snapshot: contractSnapshot({
        memberId: 'c4',
        name: '佐藤健',
        phone: '+81-90-1234-5678',
        vehicleId: 'v3',
        plateNumber: 'GHI-789',
        brand: 'Toyota',
        model: 'Yaris',
        category: 'car',
        rentalStartTime: isoAt(3, 9),
        rentalEndTime: isoAt(6, 12),
        pickupLocation: '機場',
        returnLocation: '機場',
        depositRequired: 1000,
        total: 4500,
        cancellationContractKind: 'passenger_car',
      }),
      createdAt: isoAt(2, 9),
    },
    {
      id: 'cv-b6',
      bookingId: 'b6',
      version: 1,
      status: 'signed',
      snapshot: contractSnapshot({
        memberId: 'c1',
        name: '王小明',
        phone: '0912-345-678',
        vehicleId: 'v6',
        plateNumber: 'PQR-678',
        brand: 'Toyota',
        model: 'Corolla Cross',
        category: 'car',
        rentalStartTime: isoAt(0, 14),
        rentalEndTime: isoAt(0, 18),
        pickupLocation: '馬公門市',
        returnLocation: '馬公門市',
        depositRequired: 1500,
        total: 2200,
        cancellationContractKind: 'passenger_car',
      }),
      createdAt: isoAt(0, 10),
      signedAt: isoAt(0, 10),
    },
    // 退款處理中示範案例：b7 取消前簽署的合約，維持 signed（模型未強制取消要改狀態）。
    {
      id: 'cv-b7',
      bookingId: 'b7',
      version: 1,
      status: 'signed',
      snapshot: contractSnapshot({
        memberId: 'c3',
        name: '陳大同',
        phone: '0933-333-444',
        vehicleId: 'v3',
        plateNumber: 'GHI-789',
        brand: 'Toyota',
        model: 'Yaris',
        category: 'car',
        rentalStartTime: isoAt(-10, 9),
        rentalEndTime: isoAt(-8, 18),
        pickupLocation: '馬公門市',
        returnLocation: '馬公門市',
        depositRequired: 1000,
        total: 4200,
        cancellationContractKind: 'passenger_car',
      }),
      createdAt: isoAt(-10, 8),
      signedAt: isoAt(-10, 8),
    },
    // 外國旅客待人工審查示範案例：合約本身已簽署，唯一的阻擋只來自駕照互惠資格。
    {
      id: 'cv-b8',
      bookingId: 'b8',
      version: 1,
      status: 'signed',
      snapshot: contractSnapshot({
        memberId: 'c4',
        name: '佐藤健',
        phone: '+81-90-1234-5678',
        vehicleId: 'v6',
        plateNumber: 'PQR-678',
        brand: 'Toyota',
        model: 'Corolla Cross',
        category: 'car',
        rentalStartTime: isoAt(7, 9),
        rentalEndTime: isoAt(9, 18),
        pickupLocation: '機場',
        returnLocation: '機場',
        depositRequired: 1500,
        total: 4400,
        cancellationContractKind: 'passenger_car',
      }),
      createdAt: isoAt(6, 9),
      signedAt: isoAt(6, 9),
    },
    // 逾期還車示範案例：b9 合約已簽署。
    {
      id: 'cv-b9',
      bookingId: 'b9',
      version: 1,
      status: 'signed',
      snapshot: contractSnapshot({
        memberId: 'c2',
        name: '林美惠',
        phone: '0922-111-222',
        idNumber: 'A123456789',
        vehicleId: 'v1',
        plateNumber: 'ABC-123',
        brand: 'Gogoro',
        model: 'Gogoro 3',
        category: 'ev',
        rentalStartTime: isoAt(-3, 9),
        rentalEndTime: isoAt(-1, 18),
        pickupLocation: '馬公門市',
        returnLocation: '馬公門市',
        depositRequired: 0,
        total: 700,
        cancellationContractKind: 'scooter',
      }),
      createdAt: isoAt(-3, 9),
      signedAt: isoAt(-3, 9),
    },
  ];
}

export function seedHandoverRecords(): HandoverRecord[] {
  return [
    {
      id: 'hr-b1-pickup',
      bookingId: 'b1',
      kind: 'pickup',
      actualAt: isoAt(-1, 9),
      mileage: 12050,
      energyLevel: 8,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: 'staff1', confirmedAt: isoAt(-1, 9) },
      customerConfirmation: { confirmedBy: '王小明', confirmedAt: isoAt(-1, 9) },
    },
    // 逾期還車示範案例：只有取車紀錄、沒有還車紀錄，且租期已於 isoAt(-1, 18) 屆滿。
    {
      id: 'hr-b9-pickup',
      bookingId: 'b9',
      kind: 'pickup',
      actualAt: isoAt(-3, 9),
      mileage: 4700,
      energyLevel: 100,
      photoAssetIds: [],
      originalDocumentChecked: true,
      operatorConfirmation: { confirmedBy: 'staff1', confirmedAt: isoAt(-3, 9) },
      customerConfirmation: { confirmedBy: '林美惠', confirmedAt: isoAt(-3, 9) },
    },
  ];
}

export function seedCancellationCases(): CancellationCase[] {
  return [
    // 退款處理中示範案例：取車前 2 天取消，依小客車顧客取消級距表適用 30%，
    // 訂金退費 300 元，退款仍在處理中（見 seedRefunds 的 ref1）。
    {
      id: 'cc-b7',
      bookingId: 'b7',
      contractKind: 'passenger_car',
      responsibility: 'customer',
      reason: 'customer_change_of_mind',
      requestedAt: isoAt(-12, 10),
      ruleVersion: '2026.1',
      originalDepositPaid: 1000,
      originalOtherPrepayment: 0,
      refundLines: [{ label: 'deposit', amount: 300 }],
      transferFee: 0,
      disposition: 'refund',
      status: 'settled',
      approvedBy: 'staff2',
      approvedAt: isoAt(-11, 9),
      evidenceAssetIds: [],
    },
  ];
}

export function seedCustomerCreditLedger(): CustomerCreditLedgerEntry[] {
  return [
    {
      id: 'cred1',
      memberId: 'c3',
      type: 'issued',
      amount: 500,
      occurredAt: isoAt(-20, 9),
      expiresAt: isoAt(160, 9),
      handledBy: 'staff1',
      reason: '客訴補償',
    },
    {
      id: 'cred2',
      memberId: 'c3',
      type: 'redeemed',
      amount: 200,
      occurredAt: isoAt(-5, 9),
      handledBy: 'staff1',
      reason: '折抵訂單餘額',
    },
  ];
}

export function seedReminderStatuses(): ReminderStatus[] {
  return [
    // 逾期還車示範案例：還車前的兩次提醒都已寄出，但顧客仍未還車。
    {
      id: 'rem-b9-24h',
      bookingId: 'b9',
      offset: '24h_before_return',
      state: 'sent',
      sentAt: isoAt(-2, 18),
      updatedAt: isoAt(-2, 18),
    },
    {
      id: 'rem-b9-2h',
      bookingId: 'b9',
      offset: '2h_before_return',
      state: 'sent',
      sentAt: isoAt(-1, 16),
      updatedAt: isoAt(-1, 16),
    },
    {
      id: 'rem-b3-24h',
      bookingId: 'b3',
      offset: '24h_before_return',
      state: 'scheduled',
      scheduledFor: isoAt(3, 18),
      updatedAt: isoAt(1, 9),
    },
    // 取車阻擋示範案例：c4 未留存 Email，提醒排程缺少寄送對象。
    {
      id: 'rem-b4-24h',
      bookingId: 'b4',
      offset: '24h_before_return',
      state: 'missing_email',
      updatedAt: isoAt(2, 9),
    },
  ];
}

/**
 * OperatorRecoveryCase 的完整設計屬於 Task 15；Task 7 只先讓 repository 就位，
 * 不在尚未定案的欄位上捏造示範資料，維持誠實的空陣列。
 */
export function seedOperatorRecoveryCases(): OperatorRecoveryCase[] {
  return [];
}

export function seedAuditEntries(): AuditEntry[] {
  return [
    {
      id: 'ae1',
      action: 'create',
      entityType: 'booking',
      entityId: 'b3',
      afterSummary: '建立訂單 b3（陳大同／Gogoro 3）',
      actorId: 'staff1',
      actorName: '櫃檯甲',
      createdAt: isoAt(1, 9),
      serverRecordedAt: isoAt(1, 9),
    },
    {
      id: 'ae2',
      action: 'approve',
      entityType: 'cancellation_case',
      entityId: 'cc-b7',
      beforeSummary: '狀態：quoted',
      afterSummary: '狀態：settled，核准退款 NT$300',
      reason: '顧客提出取消，符合訂金 30% 退費級距',
      actorId: 'staff2',
      actorName: '店長乙',
      createdAt: isoAt(-11, 9),
      serverRecordedAt: isoAt(-11, 9),
    },
    // 尚未同步到後端（serverRecordedAt 為 undefined），示範裝置端樂觀時間戳的情境。
    {
      id: 'ae3',
      action: 'override',
      entityType: 'contract_version',
      entityId: 'cv-b4',
      beforeSummary: '合約未簽署，取車遭系統阻擋',
      afterSummary: '主管覆核放行',
      reason: '顧客已於現場補簽紙本，系統尚未同步電子簽名',
      actorId: 'staff2',
      actorName: '店長乙',
      createdAt: isoAt(2, 10),
    },
  ];
}
