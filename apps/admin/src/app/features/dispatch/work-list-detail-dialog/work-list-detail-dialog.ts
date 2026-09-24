import { PickupBlocker, PickupWarning } from '../../../core/models';

/** 明細視窗底部的快捷操作；實際要開哪一頁由呼叫端（月曆工作清單）決定。 */
export type WorkListDetailActionKey =
  | 'pay'
  | 'edit'
  | 'contract'
  | 'cancel'
  | 'pickup'
  | 'view'
  | 'return';

/** ui-chip 的色調修飾；null＝只用基礎 .ui-chip。 */
export type WorkListDetailChipTone = 'positive' | 'warning' | 'neutral' | 'info' | null;

/** 狀態徽章：永遠是 icon + 文字（見設計原則「狀態不只靠顏色」），tone 只負責底色。 */
export interface WorkListDetailChip {
  tone: WorkListDetailChipTone;
  icon: string;
  text: string;
  /** 清單列上同一顆徽章用的辨識 class，樣式與測試沿用（例：work-list-row__readiness）。 */
  className?: string;
}

export interface WorkListDetailField {
  term: string;
  value: string;
}

/** 阻擋（紅）與提醒（黃）；按「前往處理」時把原始物件交還給呼叫端決定去哪一頁。 */
export type WorkListDetailSeverity =
  | { kind: 'blocker'; key: string; message: string; blocker: PickupBlocker }
  | { kind: 'warning'; key: string; message: string; warning: PickupWarning };

export interface WorkListDetailAction {
  key: WorkListDetailActionKey;
  label: string;
  icon: string;
  variant: 'tonal' | 'filled';
}

/** 明細視窗要顯示的全部內容；由月曆工作清單組好，視窗本身只負責排版。 */
export interface WorkListDetailData {
  /** 車牌。 */
  title: string;
  /** 車款 · 客人。 */
  subtitle: string;
  /** 「取車時間」／「還車時間」。 */
  timeTerm: string;
  /** HH:mm。 */
  time: string;
  chips: WorkListDetailChip[];
  member: {
    name: string;
    phone: { href: string; label: string; ariaLabel: string } | null;
  };
  fields: WorkListDetailField[];
  severities: WorkListDetailSeverity[];
  actions: WorkListDetailAction[];
}

/** 視窗關閉時回傳的選擇；undefined＝直接關掉，什麼都不做。 */
export type WorkListDetailResult =
  | { kind: 'action'; key: WorkListDetailActionKey }
  | { kind: 'severity'; severity: WorkListDetailSeverity };
