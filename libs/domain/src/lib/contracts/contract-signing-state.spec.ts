import { describe, it, expect } from 'vitest';
import { contractSigningState } from './contract-signing-state';
import { ContractSnapshot, ContractVersion, ContractVersionStatus } from '../models/contract-version';

const SNAPSHOT = {} as ContractSnapshot; // 本函式不讀快照內容

function v(
  version: number,
  status: ContractVersionStatus,
  extra: Partial<ContractVersion> = {},
): ContractVersion {
  return {
    id: `cv-${version}`,
    bookingId: 'b1',
    version,
    status,
    snapshot: SNAPSHOT,
    createdAt: '2026-09-01T00:00:00.000Z',
    ...extra,
  };
}

const SIGNED_AT = '2026-09-02T00:00:00.000Z';

describe('contractSigningState', () => {
  it('沒有任何版本 → none', () => {
    expect(contractSigningState([])).toBe('none');
  });

  it('只有一版草稿 → unsigned', () => {
    expect(contractSigningState([v(1, 'draft')])).toBe('unsigned');
  });

  it('只有一版且已簽署 → signed', () => {
    expect(contractSigningState([v(1, 'signed', { signedAt: SIGNED_AT })])).toBe('signed');
  });

  it('舊版已簽後被取代、新版草稿未簽 → needs_resign', () => {
    const versions = [v(1, 'superseded', { signedAt: SIGNED_AT, supersededReason: 'vehicle' }), v(2, 'draft')];
    expect(contractSigningState(versions)).toBe('needs_resign');
  });

  it('舊版未簽就被取代、新版草稿未簽 → unsigned（客人從未簽過任何版本）', () => {
    const versions = [v(1, 'superseded', { supersededReason: 'vehicle' }), v(2, 'draft')];
    expect(contractSigningState(versions)).toBe('unsigned');
  });

  it('舊版仍標記 signed（未走取代流程）但已有更新的草稿 → needs_resign，目前有效版本是最新那一版', () => {
    const versions = [v(1, 'signed', { signedAt: SIGNED_AT }), v(2, 'draft')];
    expect(contractSigningState(versions)).toBe('needs_resign');
  });

  it('舊版簽過、被取代，新版也已重新簽署 → signed', () => {
    const versions = [
      v(1, 'superseded', { signedAt: SIGNED_AT }),
      v(2, 'signed', { signedAt: '2026-09-03T00:00:00.000Z' }),
    ];
    expect(contractSigningState(versions)).toBe('signed');
  });

  it('多版但全部 superseded 且都沒簽過 → unsigned（沒有有效版本，不算已簽署）', () => {
    const versions = [v(1, 'superseded'), v(2, 'superseded')];
    expect(contractSigningState(versions)).toBe('unsigned');
  });

  it('多版全部 superseded、其中曾有簽署 → needs_resign', () => {
    const versions = [v(1, 'superseded', { signedAt: SIGNED_AT }), v(2, 'superseded')];
    expect(contractSigningState(versions)).toBe('needs_resign');
  });

  it('最新一版已被取代時，不會退回把較舊的 signed 版本當成有效版本 → needs_resign', () => {
    const versions = [v(1, 'signed', { signedAt: SIGNED_AT }), v(2, 'superseded')];
    expect(contractSigningState(versions)).toBe('needs_resign');
  });

  it('輸入順序不影響結果（依版本號判斷最新版），且不修改輸入陣列', () => {
    const versions = [v(2, 'draft'), v(1, 'superseded', { signedAt: SIGNED_AT })];
    const copy = [...versions];
    expect(contractSigningState(versions)).toBe('needs_resign');
    expect(versions).toEqual(copy);

    expect(contractSigningState([v(2, 'signed', { signedAt: SIGNED_AT }), v(1, 'superseded')])).toBe('signed');
  });
});
