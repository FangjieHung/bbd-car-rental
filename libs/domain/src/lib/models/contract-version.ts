import { CancellationContractKind } from './cancellation-case';
import { PriceBreakdown } from './price-breakdown';
import { EnergyReturnPolicy, LateReturnPolicy } from './pricing-plan';
import { EnergyType, FuelPolicy, MileagePolicy, VehicleCategory } from './vehicle';

/**
 * 合約快照裡的承租人／駕駛人資料：存文字快照而非只存 memberId 參照，
 * 避免日後更新會員資料而改動舊合約（設計文件第 4.3 節「訂單保存本次使用的版本參照與文字快照」）。
 */
export interface ContractPartySnapshot {
  memberId: string;
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  driverLicenseNumber?: string;
}

/** 合約快照裡的車輛資料：同樣是當下的文字快照，車籍資料日後更新不影響已產生的合約。 */
export interface ContractVehicleSnapshot {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  /** 取還車費用試算需要的規則，隨快照一併固定，設計文件第 4.4 節「取還車紀錄需要的欄位」。 */
  fuelPolicy?: FuelPolicy;
  mileagePolicy?: MileagePolicy;
  energyType?: EnergyType;
}

/**
 * 合約快照裡已揭露的取消、逾時、能源等規則。取消規則只存契約類型與規則版本
 * （實際退費表由 quoteCancellation 依版本查表試算，不在此重複整份級距表）；
 * 逾時與能源規則直接快照當下適用的 PricingPlan 子規則，因為之後方案調整不能回頭改舊合約。
 */
export interface ContractDisclosedRules {
  cancellationContractKind: CancellationContractKind;
  cancellationRuleVersion: string;
  lateReturnPolicy?: LateReturnPolicy;
  energyReturnPolicy?: EnergyReturnPolicy;
  otherDisclosures?: string[];
}

/**
 * 訂單成立時或發生重大異動後產生的合約完整快照（設計文件第 4.4 節列出的必要內容：
 * 出租人與承租人資料、車牌車型及車輛資料、租期與取還車地點、租金訂金保險配件計價明細、
 * 已揭露規則、取還車紀錄需要的欄位）。內部備註（internalNote）不影響合約效力，
 * 見 contract-versioning 的 evaluateContractChange 刻意不比較這個欄位。
 */
export interface ContractSnapshot {
  renter: ContractPartySnapshot;
  driver: ContractPartySnapshot;
  vehicle: ContractVehicleSnapshot;
  rentalStartTime: string; // ISO
  rentalEndTime: string; // ISO
  pickupLocation: string;
  returnLocation: string;
  depositRequired: number;
  /** 建立當下鎖定的報價明細（租金、加購、保險、優惠券等）。 */
  pricing: PriceBreakdown;
  disclosedRules: ContractDisclosedRules;
  internalNote?: string;
}

export type ContractVersionStatus = 'draft' | 'signed' | 'superseded';

/**
 * 一筆合約版本紀錄。snapshot 是完整、不可變的內容快照，不只是指向活資料的參照——
 * 已簽署版本不可覆寫；發生重大異動時建立新版本，並將原簽署版標記為 superseded
 * 連同 supersededReason（見 contract-versioning）。
 */
export interface ContractVersion {
  id: string;
  bookingId: string;
  /** 版本號，從 1 起算。 */
  version: number;
  status: ContractVersionStatus;
  snapshot: ContractSnapshot;
  /** 簽名證據的 asset ID；正式 PDF、雜湊與簽署證據由後端接手，前端 MVP 僅存簽名圖檔參照。 */
  signatureAssetIds?: string[];
  createdAt: string; // ISO
  signedAt?: string; // ISO
  /** 本版本因何種重大異動被下一版取代；status 非 superseded 時不提供。 */
  supersededReason?: string;
}
