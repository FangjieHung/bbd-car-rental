/**
 * 承租人類型：本國人、外國旅客、持居留證者。設計文件第 4.3 節。
 * 只有 foreign_visitor 需要查核駕照互惠資格（見 IdentityDocument 的 ReciprocityStatus）。
 */
export type MemberKind = 'local' | 'foreign_visitor' | 'resident';

/**
 * 會員基本資料。刻意不保存任何證件圖檔參照或 OCR／核對狀態——
 * 正式證件圖檔與驗證狀態只存在 IdentityDocument／DriverCredential（設計原則 #7：
 * 「正式證件圖檔不放 localStorage」）。這兩種證件透過 memberId 反向參照本會員，
 * 可跨訂單重用；訂單成立時另外保存當次版本參照與文字快照（見 ContractVersion）。
 */
export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  kind: MemberKind;
  nationality?: string;
  birthDate?: string;
  address?: string;
  idNumber?: string;
  note?: string;
}
