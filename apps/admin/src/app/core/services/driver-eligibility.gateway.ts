import { DriverCredentialType, ReciprocityStatus } from '@car-rental/domain';

export interface DriverEligibilityCheckInput {
  issuingCountry: string;
  credentialType: DriverCredentialType;
}

export interface DriverEligibilityResult {
  reciprocityStatus: ReciprocityStatus;
  /** 合法使用截止日；查無明確規則或非 eligible 時不提供。 */
  legalUseThroughDate?: string;
  note?: string;
}

/**
 * 外國旅客駕照互惠資格查核介面。真正的查核依據（駐外單位公告的互惠國家清單）
 * 屬於外部資料源，這裡只定義呼叫端需要的窄介面。
 */
export abstract class DriverEligibilityGateway {
  abstract checkReciprocity(input: DriverEligibilityCheckInput): Promise<DriverEligibilityResult>;
}
