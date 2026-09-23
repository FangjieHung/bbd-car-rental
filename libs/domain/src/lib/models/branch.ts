import { SelectOption } from './select-option';

/** 據點類型：分類，不是地點——不能拿來當取車地址（見 CONTEXT.md「據點類型」）。 */
export type BranchType = 'airport' | 'port' | 'store';

export const BRANCH_TYPE_OPTIONS: SelectOption<BranchType>[] = [
  { value: 'airport', label: '機場' },
  { value: 'port', label: '港口' },
  { value: 'store', label: '店舖' },
];

/** 一個具體的營業地點：有名稱與地址，是車輛所在據點、取車據點、還車據點共用的同一份清單。 */
export interface RentalBranch {
  id: string;
  name: string;
  type: BranchType;
  address: string;
}

export const RENTAL_BRANCHES: readonly RentalBranch[] = [
  {
    id: 'mzg-airport',
    name: '馬公機場櫃檯',
    type: 'airport',
    address: '澎湖縣湖西鄉 馬公機場航廈一樓',
  },
  {
    id: 'mzg-port',
    name: '馬公港櫃檯',
    type: 'port',
    address: '澎湖縣馬公市 臨海路 南海遊客中心',
  },
  {
    id: 'mzg-store',
    name: '馬公中正門市',
    type: 'store',
    address: '澎湖縣馬公市 中正路',
  },
  {
    id: 'huxi-store',
    name: '湖西門市',
    type: 'store',
    address: '澎湖縣湖西鄉 湖西村',
  },
];

/** 依 id 查據點；查不到（未知 id、空值）回傳 undefined。 */
export function findBranch(id: string | null | undefined): RentalBranch | undefined {
  if (!id) return undefined;
  return RENTAL_BRANCHES.find((branch) => branch.id === id);
}

/**
 * 顯示用：據點 id → 名稱。查不到的值（尚未遷移的舊資料、外部帶入的未知字串）原樣回傳，
 * 不讓畫面因為查不到而顯示空白或報錯；空值統一顯示「—」。
 */
export function branchName(idOrLegacy: string | null | undefined): string {
  if (!idOrLegacy) return '—';
  return findBranch(idOrLegacy)?.name ?? idOrLegacy;
}

/** 舊版曾經用「據點類型」或特定門市全名充當據點的資料，遷移成目前的據點 id。 */
const LEGACY_BRANCH_MIGRATION: Record<string, string> = {
  機場: 'mzg-airport',
  港口: 'mzg-port',
  店舖: 'mzg-store',
  馬公門市: 'mzg-store',
};

/**
 * 舊資料遷移：把可能還是舊格式（據點類型文字、門市全名）的值轉成目前的據點 id；
 * 已經是合法據點 id、或查無對應遷移規則的其餘值，一律原樣回傳（不猜測、不丟資料）。
 * 空值回傳 undefined。
 */
export function normalizeBranchId(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  return LEGACY_BRANCH_MIGRATION[value] ?? value;
}

/**
 * 需調度：取車據點與車輛所在據點不同，車輛必須在取車前被移到取車據點（見 CONTEXT.md「需調度」）。
 * 是由兩個據點比對出來的狀態，任一邊是未知/空值時視為不確定，保守回傳 false
 * （沿用「車輛據點未填時視為不確定，不當作已需要調度」的既有語意）。
 */
export function needsDispatch(
  vehicleBranchId: string | null | undefined,
  pickupBranchId: string | null | undefined,
): boolean {
  const vehicleBranch = findBranch(vehicleBranchId);
  const pickupBranch = findBranch(pickupBranchId);
  if (!vehicleBranch || !pickupBranch) return false;
  return vehicleBranch.id !== pickupBranch.id;
}
