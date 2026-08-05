import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { PayoutStatus } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { PartnerStore } from '../../../stores/partner/partner.store';
import { CommissionReportRow, CommissionStore } from '../../../stores/commission/commission.store';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';

@Component({
  selector: 'app-commission-page',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DataTableComponent,
    DataTableCellDirective,
  ],
  templateUrl: './commission-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class CommissionPageComponent {
  protected readonly t = ZH_TW;
  readonly partnerStore = inject(PartnerStore);
  private commissionStore = inject(CommissionStore);
  private snackBar = inject(MatSnackBar);

  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<CommissionReportRow>[] = [
    { key: 'bookingId', label: this.t.commission.bookingId, primary: true },
    { key: 'vehicleLabel', label: this.t.commission.vehicleLabel, primary: true },
    {
      key: 'period',
      label: this.t.commission.period,
      exportValue: (r) => `${r.startTime} ~ ${r.endTime}`,
    },
    { key: 'rentalSubtotal', label: this.t.commission.rentalSubtotal, align: 'end' },
    { key: 'commission', label: this.t.commission.commissionAmount, align: 'end' },
  ];

  /** CommissionReportRow 無 id 欄位，DataTable 預設 rowId 會丟錯，改用 bookingId 當識別欄位。 */
  readonly rowId = (r: CommissionReportRow) => r.bookingId;

  selectedPartnerId = signal<string | null>(null);
  selectedMonth = signal<string>('');
  private payoutVersion = signal(0);

  readonly report = computed(() => {
    const partnerId = this.selectedPartnerId();
    const month = this.selectedMonth();
    if (!partnerId || !month) return null;
    return this.commissionStore.monthlyReport(partnerId, month);
  });

  readonly payoutStatus = computed<PayoutStatus | null>(() => {
    const partnerId = this.selectedPartnerId();
    const month = this.selectedMonth();
    this.payoutVersion();
    if (!partnerId || !month) return null;
    return this.commissionStore.getPayoutStatus(partnerId, month);
  });

  /** 依目前選定的合作夥伴與月份組出匯出檔名，否則多筆匯出只會拿到 commission-20260805 (1).xlsx 這種無法分辨的檔名。 */
  readonly exportName = computed(() => `commission-${this.selectedPartnerId()}-${this.selectedMonth()}`);

  onExportFailed(e: Error): void {
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  onPartnerChange(id: string): void {
    this.selectedPartnerId.set(id);
  }

  onMonthChange(month: string): void {
    this.selectedMonth.set(month);
  }

  markPaid(): void {
    const partnerId = this.selectedPartnerId();
    const month = this.selectedMonth();
    if (!partnerId || !month) return;
    this.commissionStore.markPaid(partnerId, month);
    this.payoutVersion.update((v) => v + 1);
  }
}
