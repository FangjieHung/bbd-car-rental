import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { DataTableCellDirective } from './data-table-cell.directive';
import { DataTableColumn, DataTableLabels } from './data-table.types';

interface Row {
  id: string;
  name: string;
  status: 'available' | 'rented';
  mileage: number;
}

const LABELS: DataTableLabels = {
  exportExcel: '匯出 Excel',
  expandRow: '展開詳細資料',
  collapseRow: '收合詳細資料',
};

@Component({
  imports: [DataTableComponent, DataTableCellDirective],
  template: `
    <lib-data-table
      [columns]="columns()"
      [rows]="rows()"
      [labels]="labels"
      emptyText="目前沒有資料"
    >
      <ng-template dtCell="status" let-row>
        <span class="chip">{{ row.status }}</span>
      </ng-template>
    </lib-data-table>
  `,
})
class HostComponent {
  readonly labels = LABELS;
  readonly columns = signal<DataTableColumn<Row>[]>([
    { key: 'name', label: '車牌', primary: true },
    { key: 'status', label: '狀態', primary: true },
    { key: 'mileage', label: '里程', align: 'end' },
  ]);
  readonly rows = signal<Row[]>([
    { id: 'v1', name: 'ABC-123', status: 'available', mileage: 12000 },
    { id: 'v2', name: 'XYZ-789', status: 'rented', mileage: 34000 },
  ]);
}

describe('DataTableComponent 標準模式', () => {
  let el: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('渲染出原生 table 元素', () => {
    expect(el.querySelector('table')).toBeTruthy();
  });

  it('表頭來自 columns 的 label', () => {
    const heads = [...el.querySelectorAll('thead th')].map((th) => th.textContent?.trim());
    expect(heads.slice(0, 3)).toEqual(['車牌', '狀態', '里程']);
  });

  it('每個 td 都帶上對應欄位的 data-label', () => {
    const firstRowCells = [...el.querySelectorAll('tbody tr')[0].querySelectorAll('td')];
    expect(firstRowCells.slice(0, 3).map((td) => td.getAttribute('data-label'))).toEqual([
      '車牌',
      '狀態',
      '里程',
    ]);
  });

  it('沒有 dtCell template 的欄位直接印 row[key]', () => {
    const cell = el.querySelector('tbody tr td[data-label="車牌"]');
    expect(cell?.textContent?.trim()).toBe('ABC-123');
  });

  it('有 dtCell template 的欄位改用 template 渲染', () => {
    const cell = el.querySelector('tbody tr td[data-label="狀態"]');
    expect(cell?.querySelector('.chip')?.textContent?.trim()).toBe('available');
  });

  it('align 欄位加上對齊 class', () => {
    const cell = el.querySelector('tbody tr td[data-label="里程"]');
    expect(cell?.classList.contains('dt-align-end')).toBe(true);
  });

  it('值為 null 時渲染空字串而非 "null"', async () => {
    fixture.componentInstance.rows.set([
      { id: 'v3', name: null, status: 'available', mileage: 0 } as unknown as Row,
    ]);
    await fixture.whenStable();
    const cell = el.querySelector('tbody tr td[data-label="車牌"]');
    expect(cell?.textContent?.trim()).toBe('');
  });

  it('rows 為空時顯示 emptyText 且不渲染 table', async () => {
    fixture.componentInstance.rows.set([]);
    await fixture.whenStable();
    expect(el.querySelector('table')).toBeNull();
    expect(el.textContent).toContain('目前沒有資料');
  });
});
