import { describe, it, expect } from 'vitest';
import { isNavGroup } from './nav-item.model';

describe('isNavGroup', () => {
  it('有 children 的項目判斷為 group', () => {
    expect(isNavGroup({ label: '商品管理', icon: 'inventory_2', children: [] })).toBe(true);
  });

  it('沒有 children 的項目判斷為 leaf', () => {
    expect(isNavGroup({ route: '/dashboard', label: '總覽', icon: 'dashboard' })).toBe(false);
  });
});
