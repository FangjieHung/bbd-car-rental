import { ContractSnapshot } from '../models/contract-version';

export interface ContractChangeEvaluation {
  /** true 代表本次異動屬於重大異動，須產生新版本並使已簽署版本失效。 */
  supersedes: boolean;
  /** 變動的欄位名稱，供操作介面顯示「哪裡變了」；internalNote 異動不計入。 */
  changedFields: string[];
}

/**
 * 純函式：比對合約快照的前後版本，判斷是否構成設計文件第 4.4 節列出的重大異動——
 * 承租人或駕駛人、車輛、租期或地點、租金、保險或其他契約核心內容。
 * 判斷方式是逐欄位深比對快照裡除 internalNote 以外的所有欄位：只要有任何差異即視為
 * 「其他契約核心內容」變動而構成重大異動，internalNote（內部備註）刻意排除在比對之外，
 * 因為它不影響已簽署版本的法律效力。
 *
 * 不查詢、不寫入任何資料，也不負責實際建立新版本或標記 superseded——
 * 那是呼叫端在拿到 supersedes === true 後的職責。
 */
export function evaluateContractChange(
  previous: ContractSnapshot,
  next: ContractSnapshot,
): ContractChangeEvaluation {
  const changedFields: string[] = [];

  const compare = (field: string, a: unknown, b: unknown): void => {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changedFields.push(field);
    }
  };

  compare('renter', previous.renter, next.renter);
  compare('driver', previous.driver, next.driver);
  compare('vehicle', previous.vehicle, next.vehicle);
  compare('rentalStartTime', previous.rentalStartTime, next.rentalStartTime);
  compare('rentalEndTime', previous.rentalEndTime, next.rentalEndTime);
  compare('pickupLocation', previous.pickupLocation, next.pickupLocation);
  compare('returnLocation', previous.returnLocation, next.returnLocation);
  compare('depositRequired', previous.depositRequired, next.depositRequired);
  compare('pricing', previous.pricing, next.pricing);
  compare('disclosedRules', previous.disclosedRules, next.disclosedRules);
  // internalNote 有意不比較：內部備註異動不構成重大異動。

  return { supersedes: changedFields.length > 0, changedFields };
}
