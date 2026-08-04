import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  input,
  signal,
} from '@angular/core';
import { DataTableCellContext, DataTableCellDirective } from './data-table-cell.directive';
import { DataTableColumn, DataTableLabels, DataTableMobileMode } from './data-table.types';

type ResolvedColumn<T> = DataTableColumn<T> & { primary: boolean };

@Component({
  selector: 'lib-data-table',
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T> {
  readonly columns = input<DataTableColumn<T>[]>([]);
  readonly rows = input<readonly T[]>([]);
  readonly rowId = input<(row: T) => unknown>((row) => {
    const id = (row as { id?: unknown }).id;
    if (id === undefined) {
      throw new Error('DataTable：資料列沒有 id 欄位，請傳入 [rowId] 指定識別欄位');
    }
    return id;
  });
  readonly mobile = input<DataTableMobileMode | null>(null);
  readonly exportName = input('export');
  readonly showExport = input(true);
  readonly emptyText = input('');
  readonly labels = input.required<DataTableLabels>();

  private readonly cellDirectives = contentChildren(DataTableCellDirective<T>);

  protected readonly mobileMode = computed<DataTableMobileMode>(() => this.mobile() ?? 'cards');

  protected readonly cellTemplates = computed(() => {
    const map = new Map<string, TemplateRef<DataTableCellContext<T>>>();
    for (const directive of this.cellDirectives()) {
      map.set(directive.dtCell(), directive.template);
    }
    return map;
  });

  /** 沒有任何欄位標 primary 時，第一欄自動視為 primary，避免手機卡片整張空白。 */
  protected readonly resolvedColumns = computed<ResolvedColumn<T>[]>(() => {
    const cols = this.columns();
    const hasPrimary = cols.some((c) => c.primary);
    return cols.map((col, i) => ({ ...col, primary: hasPrimary ? !!col.primary : i === 0 }));
  });

  protected readonly isEmpty = computed(() => this.rows().length === 0);

  protected cellContext(row: T): DataTableCellContext<T> {
    return { $implicit: row };
  }

  protected readonly hasSecondary = computed(() =>
    this.resolvedColumns().some((col) => !col.primary),
  );

  private readonly expandedIds = signal<ReadonlySet<unknown>>(new Set());

  protected isExpanded(row: T): boolean {
    return this.expandedIds().has(this.rowId()(row));
  }

  protected toggle(row: T): void {
    const id = this.rowId()(row);
    const next = new Set(this.expandedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.expandedIds.set(next);
  }

  protected valueOf(row: T, key: string): string {
    const value = (row as Record<string, unknown>)[key];
    return value === null || value === undefined ? '' : String(value);
  }
}
