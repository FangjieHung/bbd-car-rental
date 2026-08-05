import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DataTableComponent } from './data-table.component';
import { DataTableCellDirective } from './data-table-cell.directive';
import { DataTableBodyDirective, DataTableHeadDirective } from './data-table-slot.directives';
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

interface RowWithoutId {
  name: string;
}

@Component({
  imports: [DataTableComponent],
  template: `<lib-data-table [columns]="columns" [rows]="rows" [labels]="labels" />`,
})
class NoIdHostComponent {
  readonly labels = LABELS;
  readonly columns: DataTableColumn<RowWithoutId>[] = [{ key: 'name', label: '名稱' }];
  readonly rows: RowWithoutId[] = [{ name: 'foo' }];
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

  it('資料列沒有 id 欄位且未指定 rowId 時，預設 rowId 丟出明確錯誤', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [NoIdHostComponent] }).compileComponents();
    const noIdFixture = TestBed.createComponent(NoIdHostComponent);
    expect(() => noIdFixture.detectChanges()).toThrow(
      'DataTable：資料列沒有 id 欄位，請傳入 [rowId] 指定識別欄位',
    );
  });
});

describe('DataTableComponent 手機版 DOM 不變性', () => {
  it('thead 不使用 display:none（SheetJS 會跳過隱藏節點，此迴歸守衛只在手機斷點才擋得住這個 bug，桌機測不出來）', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const scss = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'data-table.component.scss'),
      'utf-8',
    );
    const mobileBlock = scss.split('@media (max-width: 640px)')[1] ?? '';
    expect(mobileBlock).toContain('clip-path');
    expect(mobileBlock).not.toMatch(/thead[^}]*display:\s*none/);
  });

  it('非 primary 欄位帶 is-secondary class（供手機版收合）', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const mileageCell = el.querySelector('tbody tr td[data-label="里程"]');
    const plateCell = el.querySelector('tbody tr td[data-label="車牌"]');
    expect(mileageCell?.classList.contains('is-secondary')).toBe(true);
    expect(plateCell?.classList.contains('is-secondary')).toBe(false);
  });
});

describe('DataTableComponent 展開／收合', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('有次要欄位時每列渲染一顆展開鈕', () => {
    expect(el.querySelectorAll('tbody .dt-expand-btn')).toHaveLength(2);
  });

  it('展開鈕預設 aria-expanded 為 false', () => {
    const btn = el.querySelector('tbody .dt-expand-btn');
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
  });

  it('點擊後該列加上 is-expanded，且 DOM 節點數不變', async () => {
    const before = el.querySelectorAll('tbody td').length;
    (el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr')[0].classList.contains('is-expanded')).toBe(true);
    expect(el.querySelectorAll('tbody td').length).toBe(before);
  });

  it('展開一列不影響其他列', async () => {
    (el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr')[1].classList.contains('is-expanded')).toBe(false);
  });

  it('再次點擊收合', async () => {
    const btn = el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    btn.click();
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr')[0].classList.contains('is-expanded')).toBe(false);
  });

  it('展開時 aria-label 換成收合文案', async () => {
    const btn = el.querySelector('tbody .dt-expand-btn') as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    expect(btn.getAttribute('aria-label')).toBe('收合詳細資料');
  });

  it('所有欄位都是 primary 時不渲染展開鈕', async () => {
    fixture.componentInstance.columns.set([
      { key: 'name', label: '車牌', primary: true },
      { key: 'status', label: '狀態', primary: true },
    ]);
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody .dt-expand-btn')).toHaveLength(0);
  });
});

@Component({
  imports: [DataTableComponent, DataTableHeadDirective, DataTableBodyDirective],
  template: `
    <lib-data-table [columns]="columns" [labels]="labels" exportName="settlement">
      <ng-template dtHead>
        <tr>
          <th rowspan="2">合作夥伴</th>
          <th colspan="2">本季</th>
        </tr>
        <tr>
          <th>訂單數</th>
          <th>退佣</th>
        </tr>
      </ng-template>
      <ng-template dtBody>
        <tr>
          <td>海邊民宿</td>
          <td>12</td>
          <td>3600</td>
        </tr>
      </ng-template>
    </lib-data-table>
  `,
})
class CustomHostComponent {
  readonly labels = LABELS;
  // 逃生門模式下應被忽略
  readonly columns: DataTableColumn<unknown>[] = [{ key: 'ignored', label: '不該出現' }];
}

describe('DataTableComponent 逃生門模式', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CustomHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CustomHostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('渲染頁面提供的 thead，保留 colspan / rowspan', () => {
    expect(el.querySelector('thead th[rowspan="2"]')?.textContent?.trim()).toBe('合作夥伴');
    expect(el.querySelector('thead th[colspan="2"]')?.textContent?.trim()).toBe('本季');
  });

  it('忽略 columns，不渲染其 label', () => {
    expect(el.textContent).not.toContain('不該出現');
  });

  it('不注入 data-label', () => {
    expect(el.querySelector('tbody td[data-label]')).toBeNull();
  });

  it('不渲染展開鈕', () => {
    expect(el.querySelector('.dt-expand-btn')).toBeNull();
  });

  it('mobile 預設為 scroll', () => {
    expect(el.querySelector('.dt-wrap')?.classList.contains('dt-wrap--scroll')).toBe(true);
  });

  it('rows 為空也不顯示 emptyText（列由 dtBody 決定）', () => {
    expect(el.querySelector('table')).toBeTruthy();
  });
});

@Component({
  imports: [DataTableComponent, DataTableHeadDirective],
  template: `
    <lib-data-table [columns]="columns" [labels]="labels">
      <ng-template dtHead>
        <tr>
          <th>合作夥伴</th>
        </tr>
      </ng-template>
    </lib-data-table>
  `,
})
class HeadOnlyHostComponent {
  readonly labels = LABELS;
  readonly columns: DataTableColumn<unknown>[] = [];
}

@Component({
  imports: [DataTableComponent, DataTableBodyDirective],
  template: `
    <lib-data-table [columns]="columns" [labels]="labels">
      <ng-template dtBody>
        <tr>
          <td>海邊民宿</td>
        </tr>
      </ng-template>
    </lib-data-table>
  `,
})
class BodyOnlyHostComponent {
  readonly labels = LABELS;
  readonly columns: DataTableColumn<unknown>[] = [];
}

describe('DataTableComponent 逃生門模式守衛', () => {
  it('只給 dtHead 沒給 dtBody 時丟出明確錯誤', async () => {
    await TestBed.configureTestingModule({
      imports: [HeadOnlyHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeadOnlyHostComponent);
    expect(() => fixture.detectChanges()).toThrow(
      'DataTable：逃生門模式需同時提供 dtHead 與 dtBody',
    );
  });

  it('只給 dtBody 沒給 dtHead 時丟出明確錯誤', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BodyOnlyHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(BodyOnlyHostComponent);
    expect(() => fixture.detectChanges()).toThrow(
      'DataTable：逃生門模式需同時提供 dtHead 與 dtBody',
    );
  });
});
