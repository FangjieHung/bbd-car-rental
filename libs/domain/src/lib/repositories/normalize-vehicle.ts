import { Vehicle } from '../models/vehicle';
import { normalizeBranchId } from '../models/branch';

interface LegacyVehicleShape extends Record<string, unknown> {
  branchId?: string;
  /** 2026-09 更名前的欄位名，值同 branchId。 */
  location?: string;
}

/**
 * 把 localStorage 裡可能還是舊 schema 的車輛資料，轉成目前的 Vehicle 形狀：
 * location 欄位改名為 branchId（兩者並存時以新欄位為準）；
 * 值可能還是舊版的據點類型文字（機場/港口/店舖）或門市全名（馬公門市），
 * 用 normalizeBranchId 統一遷移成目前的據點 id；已經是合法 id、查無對應遷移規則、
 * 或本來就沒填的值原樣保留（未填代表「不確定」，不硬塞一個猜測值）。
 */
export function normalizeVehicle(item: unknown): Vehicle {
  const raw = item as LegacyVehicleShape;
  const { location, ...restWithBranch } = raw;
  const { branchId = location, ...rest } = restWithBranch;
  return {
    ...(rest as unknown as Vehicle),
    ...(branchId !== undefined ? { branchId: normalizeBranchId(branchId) } : {}),
  };
}
