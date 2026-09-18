import { Injectable } from '@angular/core';
import { DriverCredentialType } from '@car-rental/domain';
import {
  DriverEligibilityCheckInput,
  DriverEligibilityGateway,
  DriverEligibilityResult,
} from './driver-eligibility.gateway';

function microtaskBoundary(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function fixtureKey(issuingCountry: string, credentialType: DriverCredentialType): string {
  return `${issuingCountry}:${credentialType}`;
}

/**
 * 開發期 Mock 互惠資格查核：沒有真正串接任何外部互惠清單，所以除非測試／展示
 * 明確用 setFixture 掛上「符合」的規則，一律回傳 manual_review —— 沒有真正的資料源時，
 * 系統不能假裝自己知道答案（見設計文件第 4.3 節與 evaluatePickupReadiness 的使用方式）。
 */
@Injectable()
export class MockDriverEligibilityGateway implements DriverEligibilityGateway {
  private readonly fixtures = new Map<string, DriverEligibilityResult>();

  async checkReciprocity(input: DriverEligibilityCheckInput): Promise<DriverEligibilityResult> {
    await microtaskBoundary();
    const fixture = this.fixtures.get(fixtureKey(input.issuingCountry, input.credentialType));
    if (fixture) return fixture;
    return {
      reciprocityStatus: 'manual_review',
      note: '尚未設定此國家／證件類型的互惠規則，需人工審查',
    };
  }

  setFixture(
    issuingCountry: string,
    credentialType: DriverCredentialType,
    result: DriverEligibilityResult,
  ): void {
    this.fixtures.set(fixtureKey(issuingCountry, credentialType), result);
  }

  clearFixtures(): void {
    this.fixtures.clear();
  }
}
