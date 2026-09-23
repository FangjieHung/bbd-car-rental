import { describe, it, expect } from 'vitest';
import * as models from './index';
import { SelectOption } from './select-option';

const optionLists = (Object.entries(models) as [string, unknown][])
  .filter(([name, value]) => name.endsWith('_OPTIONS') && Array.isArray(value))
  .map(([name, value]) => [name, value as SelectOption[]] as const);

describe('libs/domain 的選項清單（*_OPTIONS）', () => {
  it('確實收集到各組選項', () => {
    expect(optionLists.length).toBeGreaterThanOrEqual(20);
  });

  it.each(optionLists)('%s：值不重複、每個值都有非空白的預設標籤', (_name, options) => {
    const values = options.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
    expect(options.every((o) => o.label.trim().length > 0)).toBe(true);
  });

  it('佔用車輛的訂單狀態只有 reserved 與 in_progress', () => {
    expect(models.ORDER_STATUS_OPTIONS.filter((o) => models.isOccupyingStatus(o.value)).map((o) => o.value)).toEqual([
      'reserved',
      'in_progress',
    ]);
  });
});
