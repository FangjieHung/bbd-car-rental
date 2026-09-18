/** 取車或還車紀錄。設計文件第 4.5 節「取還車與費用調整」。 */
export type HandoverKind = 'pickup' | 'return';

/** 單一簽署／確認：誰、什麼時候。取還車各自需要操作人與承租人兩份確認。 */
export interface HandoverConfirmation {
  confirmedBy: string;
  confirmedAt: string; // ISO
}

/**
 * 一筆取車或還車的完整快照：實際時間、里程、能源讀數（汽油／機車為八分格，
 * 電動車為電量百分比，依 Vehicle.energyType 決定如何解讀 energyLevel）、
 * 儀表與車況照片參照、證件正本是否已於本次核對、操作人與承租人的簽署確認、備註。
 */
export interface HandoverRecord {
  id: string;
  bookingId: string;
  kind: HandoverKind;
  actualAt: string; // ISO
  mileage: number;
  /** 能源讀數：汽油／機車為 0–8 格，電動車為 0–100 百分比。 */
  energyLevel: number;
  /** 儀表與車況照片的 asset ID。 */
  photoAssetIds: string[];
  /** 本次是否已核對證件正本（設計文件第 7 節「本次尚未確認核對證件正本」的阻擋依據）。 */
  originalDocumentChecked: boolean;
  operatorConfirmation: HandoverConfirmation;
  customerConfirmation?: HandoverConfirmation;
  notes?: string;
}
