import { DataTableColumn } from './data-table.types';

export function exportFileName(name: string, date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  return `${name}-${stamp}.xlsx`;
}

/** 把資料列轉成 SheetJS 的 aoa（array of arrays）：第一列是標題。 */
export function rowsToAoa<T>(
  columns: DataTableColumn<T>[],
  rows: readonly T[],
): (string | number)[][] {
  const cols = columns.filter((c) => !c.exportSkip);
  const header = cols.map((c) => c.label);
  const body = rows.map((row) =>
    cols.map((col) => {
      const raw = col.exportValue
        ? col.exportValue(row)
        : (row as Record<string, unknown>)[col.key];
      if (raw === null || raw === undefined) return '';
      return typeof raw === 'number' ? raw : String(raw);
    }),
  );
  return [header, ...body];
}
