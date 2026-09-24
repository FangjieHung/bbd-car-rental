import {
  ContractSigningState,
  ContractVersion,
  DriverCredential,
  IdentityDocument,
  IdentityDocumentType,
  Member,
  MemberKind,
  PaymentRecord,
  PaymentSummary,
  RentalOrder,
  contractSigningState,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import type { OrderFormValue } from '@car-rental/order-form';
import {
  driverCredentialDraftOf,
  sameDriverCredential,
} from '@car-rental/order-form';
import type { OrderDetailSection } from '../navigation/order-detail-sections';

/**
 * 待補項目（CONTEXT.md「待補項目」：訂單已成立、但尚未完成的事項）的共用規則。
 *
 * 建立訂單頁摘要欄的「建立後待補」吃表單值，訂單詳情與訂單列表的「待補」吃已成立訂單的實際紀錄
 * （款項、合約版本、會員的證件）。兩邊先各自整理成同一份 `OrderIncompleteFacts`，再交給同一個
 * `orderIncompleteKinds` 判斷——規則只寫在這裡一次，同樣的情況兩邊一定列出同樣的項目。
 */

const t = ZH_TW;

/** 證件／駕駛資格的查核狀態：沒有紀錄、有紀錄但還沒核對完成、已核對。 */
export type CredentialCheck = 'missing' | 'unverified' | 'verified';

export interface OrderIncompleteFacts {
  /** 承租人 Email；空字串代表沒有。 */
  renterEmail: string;
  depositRequired: number;
  /** 已收訂金：建單＝本次收款中用途為訂金的合計；訂單＝已確認的訂金款項合計（與取車判斷同一個算法）。 */
  depositCollected: number;
  /**
   * 應收總額：建單＝報價合計；訂單＝報價合計＋已確認的費用調整（款項分頁的「最新應付總額」）。
   * 沒有報價時為 undefined——算不出應收就不判斷「租金尚未收足」，不假裝應收是 0。
   */
  amountDue: number | undefined;
  /** 已收合計：建單＝本次收款合計；訂單＝淨實收（已確認款項−已完成退款）。 */
  collected: number;
  contract: ContractSigningState;
  /** 承租人類型要求的身分證明文件（本國人身分證、外國旅客護照、持居留證者居留證）。 */
  identity: CredentialCheck;
  /** 駕駛人的駕駛資格；外國旅客另外要互惠資格查核為「符合」才算查核完成。 */
  driver: CredentialCheck;
}

/** 待補項目的種類，依畫面顯示順序排列。 */
export const ORDER_INCOMPLETE_KINDS = [
  'missingEmail',
  'depositNotCollected',
  'contractNotSigned',
  'contractNeedsResign',
  'identityNotVerified',
  'driverNotVerified',
  'balanceNotCollected',
] as const;
export type OrderIncompleteKind = (typeof ORDER_INCOMPLETE_KINDS)[number];

/** 規則本身：依整理好的事實列出待補種類。 */
export function orderIncompleteKinds(facts: OrderIncompleteFacts): OrderIncompleteKind[] {
  const kinds: OrderIncompleteKind[] = [];
  if (!facts.renterEmail.trim()) kinds.push('missingEmail');
  if (facts.depositRequired > 0 && facts.depositCollected < facts.depositRequired) kinds.push('depositNotCollected');
  // 還沒有任何合約版本（none）對客人而言一樣是「還沒簽」。
  if (facts.contract === 'none' || facts.contract === 'unsigned') kinds.push('contractNotSigned');
  // 需重新簽署對交車等同未簽署（CONTEXT.md），但以專屬文字提示。
  if (facts.contract === 'needs_resign') kinds.push('contractNeedsResign');
  if (facts.identity !== 'verified') kinds.push('identityNotVerified');
  if (facts.driver !== 'verified') kinds.push('driverNotVerified');
  if (facts.amountDue !== undefined && facts.amountDue > 0 && facts.collected < facts.amountDue) {
    kinds.push('balanceNotCollected');
  }
  return kinds;
}

/**
 * 每一項待補在哪裡處理：訂單詳情的某個分頁，或承租人的會員資料（Email、證件、駕駛資格都存在會員層，
 * 訂單詳情沒有能改它們的分頁——「文件」分頁尚未實作；編輯訂單時既有會員的欄位是鎖定的）。
 */
export type OrderIncompleteTarget = Extract<OrderDetailSection, 'payments' | 'contract'> | 'renter';

export const ORDER_INCOMPLETE_TARGET: Record<OrderIncompleteKind, OrderIncompleteTarget> = {
  missingEmail: 'renter',
  depositNotCollected: 'payments',
  contractNotSigned: 'contract',
  contractNeedsResign: 'contract',
  identityNotVerified: 'renter',
  driverNotVerified: 'renter',
  balanceNotCollected: 'payments',
};

const LABELS: Record<OrderIncompleteKind, string> = {
  missingEmail: t.orderForm.incomplete.missingEmail,
  depositNotCollected: t.orderForm.incomplete.depositNotCollected,
  contractNotSigned: t.orderForm.incomplete.contractNotSigned,
  contractNeedsResign: t.orderForm.incomplete.contractNeedsResign,
  identityNotVerified: t.orderForm.incomplete.identityNotVerified,
  driverNotVerified: t.orderForm.incomplete.driverNotVerified,
  balanceNotCollected: t.orderForm.incomplete.balanceNotCollected,
};

export interface OrderIncompleteItem {
  kind: OrderIncompleteKind;
  label: string;
  target: OrderIncompleteTarget;
}

export function orderIncompleteItems(facts: OrderIncompleteFacts): OrderIncompleteItem[] {
  return orderIncompleteKinds(facts).map((kind) => ({ kind, label: LABELS[kind], target: ORDER_INCOMPLETE_TARGET[kind] }));
}

// ---------------------------------------------------------------------------
// 證件：與取車判斷（handover-panel 的 readinessInput）同一套取法——同種文件取版本號最大的一筆。
// ---------------------------------------------------------------------------

/** 依承租人類型要求的身分證明文件：本國人身分證、外國旅客護照、持居留證者居留證。 */
export function requiredIdentityDocumentType(kind: MemberKind | undefined): IdentityDocumentType {
  if (kind === 'foreign_visitor') return 'passport';
  if (kind === 'resident') return 'resident_permit';
  return 'taiwan_id';
}

/** 同一位會員的證件可能有多個版本，取版本號最大的一筆。 */
export function latestByVersion<T extends { version: number }>(items: readonly T[]): T | undefined {
  return items.reduce<T | undefined>((latest, item) => (!latest || item.version > latest.version ? item : latest), undefined);
}

export function identityCheckOf(documents: readonly IdentityDocument[], kind: MemberKind | undefined): CredentialCheck {
  const type = requiredIdentityDocumentType(kind);
  const latest = latestByVersion(documents.filter((d) => d.type === type));
  if (!latest) return 'missing';
  return latest.verification.state === 'verified' ? 'verified' : 'unverified';
}

/** 外國旅客的駕駛資格還要互惠資格查核為「符合」（取車時同樣會擋，見 evaluatePickupReadiness）。 */
export function driverCheckOf(credential: DriverCredential | undefined, kind: MemberKind | undefined): CredentialCheck {
  if (!credential) return 'missing';
  if (credential.verification.state !== 'verified') return 'unverified';
  if (kind === 'foreign_visitor' && credential.reciprocityStatus !== 'eligible') return 'unverified';
  return 'verified';
}

// ---------------------------------------------------------------------------
// 兩種來源 → 同一份事實
// ---------------------------------------------------------------------------

/** 已成立訂單的實際紀錄。 */
export interface OrderRecords {
  order: RentalOrder;
  member: Member | undefined;
  payments: readonly PaymentRecord[];
  paymentSummary: Pick<PaymentSummary, 'requiredTotal' | 'netPaid'>;
  contractVersions: readonly ContractVersion[];
  identityDocuments: readonly IdentityDocument[];
  driverCredentials: readonly DriverCredential[];
}

export function incompleteFactsFromOrder(records: OrderRecords): OrderIncompleteFacts {
  const { order, member } = records;
  return {
    renterEmail: member?.email ?? '',
    depositRequired: order.depositRequired,
    depositCollected: records.payments
      .filter((p) => p.purpose === 'deposit' && p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0),
    amountDue: order.priceBreakdown ? records.paymentSummary.requiredTotal : undefined,
    collected: records.paymentSummary.netPaid,
    contract: contractSigningState(records.contractVersions),
    identity: identityCheckOf(records.identityDocuments, member?.kind),
    // 目前駕駛人＝承租人：看承租人自己的駕駛資格。
    driver: driverCheckOf(latestByVersion(records.driverCredentials), member?.kind),
  };
}

/** 建立訂單時的輸入：表單值，加上選了既有會員時他已有的證件紀錄。 */
export interface OrderFormIncompleteInput {
  value: OrderFormValue;
  /** 報價合計；還試算不出報價時為 undefined。 */
  quoteTotal: number | undefined;
  contract: ContractSigningState;
  /** 選了既有會員時他已有的證件紀錄（所有版本）；新承租人不用提供。 */
  memberRecords?: {
    identityDocuments: readonly IdentityDocument[];
    driverCredentials: readonly DriverCredential[];
  };
}

/**
 * 表單值 → 事實。送出時的寫入規則（admin-order-submit.gateway）決定了建立後的紀錄長什麼樣，
 * 這裡照同一套規則預估，摘要欄列出的就是建立後訂單詳情會看到的待補：
 * - 新承租人填了證件號碼：建立時一併建立身分證明文件並由櫃檯確認（同會員視窗）→ 已查核。
 * - 填了駕照：與既有駕駛資格相同就沿用那筆的狀態；新填或改過的，建立時一併建立並確認→ 已查核
 *   （外國旅客還要在這一步查核互惠資格為「符合」）。
 */
export function incompleteFactsFromForm(input: OrderFormIncompleteInput): OrderIncompleteFacts {
  const { value, memberRecords } = input;
  const drafts = value.payments.drafts;
  const sum = (rows: readonly { amount: number | null }[]) => rows.reduce((total, d) => total + (d.amount ?? 0), 0);
  return {
    renterEmail: value.renter.email,
    depositRequired: value.pricing.depositRequired,
    depositCollected: sum(drafts.filter((d) => d.purpose === 'deposit')),
    amountDue: input.quoteTotal,
    collected: sum(drafts),
    contract: input.contract,
    identity: value.renter.memberId
      ? identityCheckOf(memberRecords?.identityDocuments ?? [], value.renter.kind)
      : value.renter.idNumber.trim()
        ? 'verified'
        : 'missing',
    driver: driverCheckFromForm(value, value.renter.memberId ? latestByVersion(memberRecords?.driverCredentials ?? []) : undefined),
  };
}

function driverCheckFromForm(value: OrderFormValue, existing: DriverCredential | undefined): CredentialCheck {
  const draft = driverCredentialDraftOf(value);
  if (!draft) return 'missing';
  if (existing && sameDriverCredential(existing, draft)) return driverCheckOf(existing, value.renter.kind);
  if (value.renter.kind === 'foreign_visitor') {
    return value.driver.reciprocityStatus === 'eligible' ? 'verified' : 'unverified';
  }
  return 'verified';
}
