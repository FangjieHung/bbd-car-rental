import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageRepository } from './local-storage-repository';

interface Item {
  id: string;
  name: string;
}
const seed = (): Item[] => [{ id: 's1', name: 'seeded' }];

describe('LocalStorageRepository', () => {
  beforeEach(() => localStorage.clear());

  it('空 storage 時回傳種子資料並寫入', () => {
    const repo = new LocalStorageRepository<Item>('test.items', seed);
    expect(repo.getAll()).toEqual([{ id: 's1', name: 'seeded' }]);
    expect(JSON.parse(localStorage.getItem('test.items')!)).toHaveLength(1);
  });

  it('CRUD 往返', () => {
    const repo = new LocalStorageRepository<Item>('test.items', () => []);
    repo.create({ id: 'a', name: 'A' });
    expect(repo.getById('a')?.name).toBe('A');
    repo.update('a', { name: 'B' });
    expect(repo.getById('a')?.name).toBe('B');
    repo.remove('a');
    expect(repo.getAll()).toEqual([]);
  });

  it('壞 JSON 時重設為種子並呼叫 onReset', () => {
    localStorage.setItem('test.items', '{not json');
    let resetCalled = false;
    const repo = new LocalStorageRepository<Item>('test.items', seed, () => (resetCalled = true));
    expect(repo.getAll()).toEqual(seed());
    expect(resetCalled).toBe(true);
  });

  it('非陣列內容也重設為種子', () => {
    localStorage.setItem('test.items', '{"a":1}');
    const repo = new LocalStorageRepository<Item>('test.items', seed);
    expect(repo.getAll()).toEqual(seed());
  });
});
