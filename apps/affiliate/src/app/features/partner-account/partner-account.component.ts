import { Component, computed, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DataTableCellDirective, DataTableColumn, DataTableComponent, DataTableLabels } from '@car-rental/ui';
import { CommissionLine, PartnerAccountStore } from '../../stores/partner-account.store';

@Component({
  selector: 'app-partner-account',
  imports: [SlicePipe, DataTableComponent, DataTableCellDirective],
  templateUrl: './partner-account.component.html',
  styleUrl: './partner-account.component.scss',
})
export class PartnerAccountComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PartnerAccountStore);

  readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly account = computed(() => {
    const slug = this.slug();
    if (!slug) return null;
    return this.store.getAccount(slug);
  });

  readonly tableLabels: DataTableLabels = {
    exportExcel: '匯出 Excel',
    expandRow: '展開詳細資料',
    collapseRow: '收合詳細資料',
  };

  readonly commissionColumns: DataTableColumn<CommissionLine>[] = [
    { key: 'bookingId', label: '訂單編號', primary: true, exportValue: (l) => l.booking.id },
    {
      key: 'period',
      label: '租期',
      exportValue: (l) => `${l.booking.startTime.slice(0, 10)} ~ ${l.booking.endTime.slice(0, 10)}`,
    },
    { key: 'days', label: '天數', align: 'end' },
    {
      key: 'rentalSubtotal',
      label: '租金小計',
      align: 'end',
      exportValue: (l) => l.booking.priceBreakdown?.rentalSubtotal ?? '',
    },
    { key: 'commission', label: '退佣', primary: true, align: 'end' },
  ];

  /** CommissionLine 沒有 id 欄位，改用 booking.id 當識別欄位。 */
  readonly commissionRowId = (l: CommissionLine) => l.booking.id;
}
