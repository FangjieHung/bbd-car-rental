import { describe, it, expect } from 'vitest';
import { branchName, findBranch, needsDispatch, normalizeBranchId, RENTAL_BRANCHES } from './branch';
import { optionLabelMap } from './select-option';
import { BRANCH_TYPE_OPTIONS } from './branch';

describe('findBranch', () => {
  it('依 id 找到既有據點', () => {
    expect(findBranch('mzg-airport')?.name).toBe('馬公機場櫃檯');
  });

  it('查無對應 id 時回傳 undefined', () => {
    expect(findBranch('no-such-branch')).toBeUndefined();
  });

  it('空值回傳 undefined', () => {
    expect(findBranch(undefined)).toBeUndefined();
    expect(findBranch(null)).toBeUndefined();
    expect(findBranch('')).toBeUndefined();
  });
});

describe('branchName', () => {
  it('已知 id 回傳據點名稱', () => {
    expect(branchName('mzg-port')).toBe('馬公港櫃檯');
  });

  it('未知值原樣回傳（相容尚未遷移的舊資料）', () => {
    expect(branchName('某個手key的地址')).toBe('某個手key的地址');
  });

  it('空值回傳「—」', () => {
    expect(branchName(undefined)).toBe('—');
    expect(branchName(null)).toBe('—');
    expect(branchName('')).toBe('—');
  });
});

describe('normalizeBranchId', () => {
  it('舊版據點類型文字遷移成對應的據點 id', () => {
    expect(normalizeBranchId('機場')).toBe('mzg-airport');
    expect(normalizeBranchId('港口')).toBe('mzg-port');
    expect(normalizeBranchId('店舖')).toBe('mzg-store');
  });

  it('舊版門市全名遷移成 mzg-store', () => {
    expect(normalizeBranchId('馬公門市')).toBe('mzg-store');
  });

  it('已經是合法據點 id 時原樣回傳', () => {
    expect(normalizeBranchId('huxi-store')).toBe('huxi-store');
  });

  it('查無對應遷移規則的其餘值原樣回傳', () => {
    expect(normalizeBranchId('某個未知值')).toBe('某個未知值');
  });

  it('空值回傳 undefined', () => {
    expect(normalizeBranchId(null)).toBeUndefined();
    expect(normalizeBranchId(undefined)).toBeUndefined();
  });
});

describe('needsDispatch', () => {
  it('兩個據點皆已知且不同時回傳 true', () => {
    expect(needsDispatch('mzg-airport', 'mzg-store')).toBe(true);
  });

  it('兩個據點皆已知且相同時回傳 false', () => {
    expect(needsDispatch('mzg-port', 'mzg-port')).toBe(false);
  });

  it('車輛據點未知時回傳 false（未填視為不確定，不當作已需要調度）', () => {
    expect(needsDispatch(undefined, 'mzg-airport')).toBe(false);
    expect(needsDispatch('', 'mzg-airport')).toBe(false);
  });

  it('取車據點未知時回傳 false', () => {
    expect(needsDispatch('mzg-airport', undefined)).toBe(false);
  });

  it('兩者皆未知時回傳 false', () => {
    expect(needsDispatch(undefined, undefined)).toBe(false);
  });

  it('任一邊是無法辨識的舊值（尚未 normalize）時回傳 false', () => {
    expect(needsDispatch('機場', 'mzg-airport')).toBe(false);
  });
});

describe('RENTAL_BRANCHES', () => {
  it('每個據點都有唯一 id', () => {
    const ids = RENTAL_BRANCHES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('optionLabelMap', () => {
  it('把 SelectOption 陣列攤平成 value→label 查找表', () => {
    expect(optionLabelMap(BRANCH_TYPE_OPTIONS)).toEqual({
      airport: '機場',
      port: '港口',
      store: '店舖',
    });
  });

  it('空陣列回傳空物件', () => {
    expect(optionLabelMap([])).toEqual({});
  });
});
