import {
  ContractPartySnapshot,
  ContractSnapshot,
  PriceBreakdown,
  Vehicle,
  branchName,
  evaluateContractChange,
} from '../../../core/models';
import type { OrderFormValue } from './order-form';

/**
 * 由表單內容組出合約快照（純函式）。「簽署前預覽」與「正式送出」共用這一個函式，
 * 確保兩者對同一份表單內容產出相同的條款——這是判斷「簽署後條款有沒有變」的基礎。
 * 預覽時新客人還沒有會員 id，`memberId` 傳空字串即可（比對條款時會忽略 memberId）。
 */
export function buildContractSnapshot(
  vehicle: Vehicle,
  quote: PriceBreakdown,
  memberId: string,
  v: OrderFormValue,
): ContractSnapshot {
  const party: ContractPartySnapshot = {
    memberId,
    name: v.renter.name,
    phone: v.renter.phone,
    ...(v.renter.email ? { email: v.renter.email } : {}),
    ...(v.renter.idNumber ? { idNumber: v.renter.idNumber } : {}),
  };
  return {
    renter: party,
    // 目前不區分承租人與實際駕駛人，兩者共用同一份快照。
    driver: party,
    vehicle: {
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      category: vehicle.category,
      ...(vehicle.fuelPolicy ? { fuelPolicy: vehicle.fuelPolicy } : {}),
      ...(vehicle.mileagePolicy ? { mileagePolicy: vehicle.mileagePolicy } : {}),
      ...(vehicle.energyType ? { energyType: vehicle.energyType } : {}),
    },
    rentalStartTime: new Date(v.rental.startLocal).toISOString(),
    rentalEndTime: new Date(v.rental.endLocal).toISOString(),
    // 合約快照存據點「名稱」文字（不可變快照），表單／訂單存據點 id。
    pickupBranchId: branchName(v.rental.pickupBranchId),
    returnBranchId: branchName(v.rental.returnBranchId),
    depositRequired: v.pricing.depositRequired,
    pricing: quote,
    disclosedRules: {
      // ev 目前比照 scooter 歸類（機車／電動機車皆尚未訂出完整的取消退費級距表）。
      cancellationContractKind: vehicle.category === 'car' ? 'passenger_car' : 'scooter',
      cancellationRuleVersion: 'v1',
    },
    ...(v.contract.internalNote ? { internalNote: v.contract.internalNote } : {}),
  };
}

function withoutMemberId(snapshot: ContractSnapshot): ContractSnapshot {
  const strip = (p: ContractPartySnapshot): ContractPartySnapshot => ({ ...p, memberId: '' });
  return { ...snapshot, renter: strip(snapshot.renter), driver: strip(snapshot.driver) };
}

/**
 * 兩份快照的合約條款是否一致：沿用合約版本的重大異動判斷（`evaluateContractChange`，已排除內部備註），
 * 並忽略會員 id——預覽時新客人尚未建立會員，id 只是識別碼、不是條款內容。
 */
export function sameContractTerms(a: ContractSnapshot, b: ContractSnapshot): boolean {
  return !evaluateContractChange(withoutMemberId(a), withoutMemberId(b)).supersedes;
}
