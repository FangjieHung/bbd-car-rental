import { describe, it, expect } from 'vitest';
import { normalizeVehicle } from './normalize-vehicle';

const base = {
  id: 'v1',
  plateNumber: 'ABC-123',
  category: 'car',
  model: 'Yaris',
  brand: 'Toyota',
  year: 2024,
  status: 'available',
  mileage: 0,
  createdAt: '2026-01-01T00:00:00',
};

describe('normalizeVehicle', () => {
  it('舊欄位 location 改名為 branchId，值一併遷移成據點 id', () => {
    const result = normalizeVehicle({ ...base, location: '機場' }) as unknown as Record<string, unknown>;
    expect(result['branchId']).toBe('mzg-airport');
    expect('location' in result).toBe(false);
  });

  it('新舊欄位並存時以新欄位為準', () => {
    expect(normalizeVehicle({ ...base, location: '機場', branchId: 'mzg-port' }).branchId).toBe('mzg-port');
  });

  it('已經是據點 id 的現行資料維持不變', () => {
    expect(normalizeVehicle({ ...base, branchId: 'mzg-store' }).branchId).toBe('mzg-store');
  });

  it('沒有填據點時不硬塞值', () => {
    expect('branchId' in normalizeVehicle(base)).toBe(false);
  });
});
