export interface NavLeaf {
  route: string;
  label: string;
  icon: string;
  /** 其他也歸屬這個選單項目的路徑前綴（例如從訂單列表進入的 `/members` 屬於「訂單管理」），用於頁首標題。 */
  matchPrefixes?: string[];
}

export interface NavGroup {
  label: string;
  icon: string;
  children: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}
