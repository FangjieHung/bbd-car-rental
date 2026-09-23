import { ContractVersion } from '../models/contract-version';

/**
 * 一筆訂單的合約簽署狀態（對應 CONTEXT.md「簽署」「需重新簽署」）：
 * - `none`：尚未建立任何合約版本。
 * - `unsigned`：目前有效版本尚未簽署，且客人從未簽過這筆訂單的任何版本。
 * - `signed`：目前有效版本已簽署。
 * - `needs_resign`：客人簽過較早的版本，但目前有效版本尚未簽署——對交車而言等同未簽署。
 */
export type ContractSigningState = 'none' | 'unsigned' | 'signed' | 'needs_resign';

/**
 * 純函式：依一筆訂單的所有合約版本判斷簽署狀態。
 *
 * 「目前有效版本」＝版本號最大的那一版，且它本身不是 `superseded`。
 * 刻意不往回找「較舊但未被取代」的版本當有效版本：合約版本只會由新版取代舊版，
 * 最新一版若已被取代，代表資料處於異常中間態（例如新版尚未建立），此時視為沒有有效版本、
 * 一律不算已簽署——寧可擋下交車，也不要誤把舊條款當成目前條款。
 * 這也與既有取車判斷（`ContractStore.latestFor(...)?.status === 'signed'`）的語意完全一致。
 *
 * 「簽過較早版本」的判斷依據：任何一個非有效版本的版本曾經簽署過——狀態為 `signed`，
 * 或已被取代但留有 `signedAt`（被取代前曾簽署）。
 *
 * 輸入陣列順序不影響結果（內部依 `version` 排序），也不會修改輸入。
 */
export function contractSigningState(versions: readonly ContractVersion[]): ContractSigningState {
  if (versions.length === 0) return 'none';

  const sorted = [...versions].sort((a, b) => a.version - b.version);
  const latest = sorted[sorted.length - 1];
  const current = latest.status === 'superseded' ? undefined : latest;

  if (current?.status === 'signed') return 'signed';

  const signedEarlier = sorted.some(
    (v) => v !== current && (v.status === 'signed' || (v.status === 'superseded' && !!v.signedAt)),
  );
  return signedEarlier ? 'needs_resign' : 'unsigned';
}
