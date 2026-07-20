import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { PayoutStatus } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { PartnerStore } from '../../../stores/partner/partner.store';
import { CommissionStore } from '../../../stores/commission/commission.store';

@Component({
  selector: 'app-commission-page',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule],
  templateUrl: './commission-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class CommissionPageComponent {
  protected readonly t = ZH_TW;
  readonly partnerStore = inject(PartnerStore);
  private commissionStore = inject(CommissionStore);

  readonly columns = ['bookingId', 'vehicleLabel', 'period', 'rentalSubtotal', 'commission'];

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

  exportCsv(): void {
    const report = this.report();
    if (!report) return;
    const csv = this.commissionStore.toCsv(report.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-${this.selectedPartnerId()}-${this.selectedMonth()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
