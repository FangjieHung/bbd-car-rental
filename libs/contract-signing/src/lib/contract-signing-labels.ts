import { InjectionToken } from '@angular/core';
import {
  CancellationContractKind,
  ContractVersionStatus,
  EnergyReturnPolicy,
  EnergyType,
  FuelPolicy,
  MileagePolicy,
  VehicleCategory,
} from '@car-rental/domain';

/** 合約內容（ContractDocumentComponent）用到的文字。 */
export interface ContractDocumentLabels {
  /** 開發期模擬合約免責提示，顯示在合約內容最上方。 */
  disclaimer: string;
  versionLabel: string;
  statusLabels: Record<ContractVersionStatus, string>;
  createdAt: string;
  signedAt: string;

  renterSection: string;
  driverSection: string;
  sameAsRenter: string;
  partyName: string;
  partyPhone: string;
  partyIdNumber: string;

  vehicleSection: string;
  plateNumber: string;
  brand: string;
  model: string;
  vehicleCategory: string;
  vehicleCategoryLabels: Record<VehicleCategory, string>;
  fuelPolicy: string;
  fuelPolicyLabels: Record<FuelPolicy, string>;
  mileagePolicy: string;
  mileagePolicyLabels: Record<MileagePolicy, string>;
  energyType: string;
  energyTypeLabels: Record<EnergyType, string>;

  periodSection: string;
  startTime: string;
  endTime: string;
  pickupLocation: string;
  returnLocation: string;

  pricingSection: string;
  rentalSubtotal: string;
  addOnSubtotal: string;
  insuranceSubtotal: string;
  total: string;
  deposit: string;
  addOnsSection: string;

  disclosedRulesSection: string;
  cancellationRule: string;
  cancellationContractKindLabels: Record<CancellationContractKind, string>;
  ruleVersion: string;
  lateReturnPolicy: string;
  graceMinutes: string;
  unitMinutes: string;
  feePerUnit: string;
  dailyCap: string;
  energyReturnPolicy: string;
  energyMeasureLabels: Record<EnergyReturnPolicy['measure'], string>;
  serviceFee: string;
  otherDisclosures: string;
}

/** 簽名板（SignaturePadComponent）用到的文字。 */
export interface SignaturePadLabels {
  drawTab: string;
  typeTab: string;
  canvasAriaLabel: string;
  emptyDrawHint: string;
  typedNameLabel: string;
  typedNamePlaceholder: string;
  clear: string;
  acknowledge: string;
  mockNotice: string;
  confirmSign: string;
  signing: string;
}

/** 簽署 dialog（ContractSigningDialogComponent）用到的文字。 */
export interface ContractSigningDialogLabels {
  title: string;
  cancel: string;
  confirm: string;
  signing: string;
}

/**
 * 本 lib 所有畫面文字的單一來源，也是日後疊加 i18n 的可替換接口：
 * 消費端（admin／booking）要換語系或改字時，直接 provide 一份新的 `CONTRACT_SIGNING_LABELS`。
 */
export interface ContractSigningLabels {
  document: ContractDocumentLabels;
  signaturePad: SignaturePadLabels;
  dialog: ContractSigningDialogLabels;
  /**
   * 「需重新簽署」提示（CONTEXT.md：客人簽過較早版本，但目前有效版本尚未簽署）。
   * 放在共用 lib 而非 admin，是因為櫃檯與官網客人面對的是同一個合約狀態、需要同一句話。
   */
  needsResignNotice: string;
}

/**
 * 預設繁中文案。文字刻意與搬遷前 admin `zh-tw.ts` 的 contractPanel／signaturePad
 * （以及合約內容引用的 member／vehicle／booking／bookingForm 欄位名稱）逐字一致，不自創新詞。
 */
export const DEFAULT_CONTRACT_SIGNING_LABELS: ContractSigningLabels = {
  document: {
    disclaimer: '本頁僅為開發期模擬合約，非正式具法律效力的用印 PDF；正式合約 PDF、雜湊與簽署證據由後端接手。',
    versionLabel: '版本',
    statusLabels: {
      draft: '草稿',
      signed: '已簽署',
      superseded: '已被取代',
    },
    createdAt: '建立時間',
    signedAt: '簽署時間',

    renterSection: '出租人與承租人',
    driverSection: '駕駛人',
    sameAsRenter: '同承租人',
    partyName: '姓名',
    partyPhone: '電話',
    partyIdNumber: '證件號',

    vehicleSection: '車輛資料',
    plateNumber: '車牌',
    brand: '廠牌',
    model: '型號',
    vehicleCategory: '車型',
    vehicleCategoryLabels: { scooter: '機車', car: '汽車', ev: '電動車' },
    fuelPolicy: '油量政策',
    fuelPolicyLabels: {
      full_to_full: '滿油還滿油',
      full_to_empty: '滿油可還空油',
      same_level: '還車同取車油量',
    },
    mileagePolicy: '里程政策',
    mileagePolicyLabels: {
      unlimited: '不限里程',
      limited: '限制里程',
    },
    energyType: '能源種類',
    energyTypeLabels: {
      gasoline: '燃油',
      electric: '電動',
    },

    periodSection: '租期與取還車地點',
    startTime: '開始時間',
    endTime: '結束時間',
    pickupLocation: '取車地點',
    returnLocation: '還車地點',

    pricingSection: '租金、保險與計價明細',
    rentalSubtotal: '租金小計',
    addOnSubtotal: '配件小計',
    insuranceSubtotal: '保險小計',
    total: '報價合計',
    deposit: '訂金',
    addOnsSection: '加購配件',

    disclosedRulesSection: '已揭露規則',
    cancellationRule: '取消規則',
    cancellationContractKindLabels: {
      passenger_car: '小客車',
      scooter: '機車',
    },
    ruleVersion: '規則版本',
    lateReturnPolicy: '逾時規則',
    graceMinutes: '免費寬限（分鐘）',
    unitMinutes: '計費單位（分鐘）',
    feePerUnit: '每單位費用',
    dailyCap: '單日上限',
    energyReturnPolicy: '能源補繳規則',
    energyMeasureLabels: {
      eighths: '油量八分格',
      percent: '電量百分比',
    },
    serviceFee: '處理費',
    otherDisclosures: '其他已揭露事項',
  },
  signaturePad: {
    drawTab: '手寫簽名',
    typeTab: '打字簽名',
    canvasAriaLabel: '簽名畫布',
    emptyDrawHint: '請於下方框內用滑鼠或觸控簽名',
    typedNameLabel: '簽署人姓名（代替簽名）',
    typedNamePlaceholder: '請輸入姓名',
    clear: '清除重寫',
    acknowledge: '本人確認已閱讀並同意上列合約內容',
    mockNotice: '本簽名為開發期模擬存證，非正式具法律效力的用印簽署',
    confirmSign: '確認簽署',
    signing: '處理中…',
  },
  dialog: {
    title: '簽署最新版本',
    cancel: '取消',
    confirm: '確認簽署',
    signing: '處理中…',
  },
  needsResignNotice: '條款已變更，需重新簽署',
};

export const CONTRACT_SIGNING_LABELS = new InjectionToken<ContractSigningLabels>('CONTRACT_SIGNING_LABELS', {
  providedIn: 'root',
  factory: () => DEFAULT_CONTRACT_SIGNING_LABELS,
});
