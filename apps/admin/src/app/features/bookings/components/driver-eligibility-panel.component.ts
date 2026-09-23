import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DriverCredentialType, ReciprocityStatus } from '@car-rental/domain';
import { DriverEligibilityGateway, DriverEligibilityResult } from '../../../core/services/driver-eligibility.gateway';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtIsoDate } from '../../../core/date-utils';

/**
 * 外國旅客駕照互惠資格查核面板。設計文件第 5/7 節：
 * 結果分符合／不符合／需人工審查三態，附原因與合法使用截止日；
 * 這是開發期 adapter 模擬（見 MockDriverEligibilityGateway），永遠不能被誤認為正式核定，
 * 因此固定顯示開發模擬徽章，不因查核結果而隱藏。
 */
@Component({
  selector: 'app-driver-eligibility-panel',
  imports: [MatButtonModule],
  templateUrl: './driver-eligibility-panel.component.html',
  styleUrl: './driver-eligibility-panel.component.scss',
})
export class DriverEligibilityPanelComponent {
  protected readonly t = ZH_TW;
  /** 合法使用截止日是純日期（無時間意義），用 fmtIsoDate 而非 fmtDateTime。 */
  protected readonly fmtIsoDate = fmtIsoDate;
  private readonly gateway = inject(DriverEligibilityGateway);

  readonly issuingCountry = input<string>('');
  readonly credentialType = input<DriverCredentialType>('foreign_license');

  protected readonly checking = signal(false);
  protected readonly result = signal<DriverEligibilityResult | undefined>(undefined);

  protected readonly status = () => (this.result()?.reciprocityStatus ?? 'pending') as ReciprocityStatus | 'pending';

  async check(): Promise<void> {
    const issuingCountry = this.issuingCountry();
    if (!issuingCountry) return;
    this.checking.set(true);
    try {
      const result = await this.gateway.checkReciprocity({
        issuingCountry,
        credentialType: this.credentialType(),
      });
      this.result.set(result);
    } finally {
      this.checking.set(false);
    }
  }
}
