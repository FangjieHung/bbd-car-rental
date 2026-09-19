import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DriverEligibilityCheckInput, DriverEligibilityGateway, DriverEligibilityResult } from '../../../core/services/driver-eligibility.gateway';
import { DriverEligibilityPanelComponent } from './driver-eligibility-panel.component';

class FakeDriverEligibilityGateway implements DriverEligibilityGateway {
  result: DriverEligibilityResult = { reciprocityStatus: 'manual_review', note: '尚未設定規則' };
  readonly calls: DriverEligibilityCheckInput[] = [];

  checkReciprocity(input: DriverEligibilityCheckInput): Promise<DriverEligibilityResult> {
    this.calls.push(input);
    return Promise.resolve(this.result);
  }
}

describe('DriverEligibilityPanelComponent', () => {
  let gateway: FakeDriverEligibilityGateway;

  beforeEach(() => {
    gateway = new FakeDriverEligibilityGateway();
    TestBed.configureTestingModule({
      providers: [{ provide: DriverEligibilityGateway, useValue: gateway }],
    });
  });

  function createFixture(issuingCountry = 'JP') {
    const fixture = TestBed.createComponent(DriverEligibilityPanelComponent);
    fixture.componentRef.setInput('issuingCountry', issuingCountry);
    fixture.componentRef.setInput('credentialType', 'foreign_license');
    fixture.detectChanges();
    return fixture;
  }

  it('一律顯示開發模擬資料的醒目標示，不宣稱是正式互惠資格認定', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('開發模擬資料');
  });

  it('查核前顯示「尚未查核」，並提供查核按鈕', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('尚未查核');
    const button = el.querySelector('button');
    expect(button?.textContent?.trim()).toContain('查核互惠資格');
  });

  it('沒有發照國家時查核按鈕停用', () => {
    const fixture = createFixture('');
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.disabled).toBe(true);
  });

  it('查核結果為 eligible 時顯示綠色符合狀態與合法使用截止日', async () => {
    gateway.result = { reciprocityStatus: 'eligible', legalUseThroughDate: '2026-12-31' };
    const fixture = createFixture('JP');

    await fixture.componentInstance.check();
    fixture.detectChanges();

    expect(gateway.calls).toEqual([{ issuingCountry: 'JP', credentialType: 'foreign_license' }]);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('符合互惠資格');
    expect(el.textContent).toContain('2026-12-31');
    expect(el.querySelector('.driver-eligibility__status--eligible')).toBeTruthy();
  });

  it('查核結果為 ineligible 時顯示紅色不符合狀態與原因說明', async () => {
    gateway.result = { reciprocityStatus: 'ineligible', note: '該國未列入互惠名單' };
    const fixture = createFixture('XX');

    await fixture.componentInstance.check();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('不符合互惠資格');
    expect(el.textContent).toContain('該國未列入互惠名單');
    expect(el.querySelector('.driver-eligibility__status--ineligible')).toBeTruthy();
  });

  it('查無夾具時預設回傳 manual_review，顯示需人工審查且不假裝已核定', async () => {
    const fixture = createFixture('JP');

    await fixture.componentInstance.check();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('需人工審查');
    expect(el.textContent).toContain('尚未設定規則');
    expect(el.querySelector('.driver-eligibility__status--manual_review')).toBeTruthy();
  });
});
