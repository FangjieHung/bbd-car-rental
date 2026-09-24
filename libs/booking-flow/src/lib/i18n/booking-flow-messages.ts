import {
  ADD_ON_UNIT_OPTIONS,
  AddOn,
  FuelPolicy,
  MileagePolicy,
  optionLabelMap,
  PAYMENT_PREFERENCE_OPTIONS,
  PaymentPreference,
  Transmission,
  VEHICLE_CATEGORY_OPTIONS,
  VehicleCategory,
} from '@car-rental/domain';
import { VehicleGroup } from '../date-range';

/** 座位數區間：篩選用的粗分級距，不是真實資料欄位。 */
export type SeatBucket = 'le2' | 'mid' | 'ge6';

/** 車卡排序方式。 */
export type SortOrder = 'default' | 'price-asc' | 'price-desc';

/** 優惠碼不能用的原因；CatalogStore.validateCoupon 回傳代碼，畫面依語言查文案。 */
export type CouponRejectReason = 'not_found' | 'not_applicable';

/** CatalogStore 丟給畫面的錯誤代碼（見 BookingFlowError）。 */
export type BookingFlowErrorCode =
  | 'no_pricing_plan'
  | 'vehicle_not_found'
  | 'vehicle_unavailable'
  | 'order_not_found';

/** 選項類的分類標籤（值是程式裡的列舉，標籤是文案，要翻）。 */
export interface BookingFlowLabels {
  vehicleCategory: Record<VehicleCategory, string>;
  seatBuckets: { value: SeatBucket; label: string }[];
  sortOptions: { value: SortOrder; label: string }[];
  transmission: Record<Transmission, string>;
  addOnUnit: Record<AddOn['unit'], string>;
  vehicleGroups: { value: VehicleGroup; label: string }[];
  paymentPreference: Record<PaymentPreference, string>;
  /**
   * 雙月日期區間選擇器的文字。選擇器本身已搬到 libs/ui（admin 也在用），它不內建任何
   * 使用者可見字串，由使用端經 DUAL_MONTH_RANGE_PICKER_LABELS 帶入——官網這一份要跟著翻。
   */
  dateRangePicker: {
    field: string;
    placeholder: string;
    prevMonth: string;
    nextMonth: string;
    monthTitle: string;
  };
}

/**
 * 官網訂車流程的全部文案。
 *
 * 界線（2026-09-22 定案）：**會隨資料庫變動的是資料、不翻**——據點名稱、車款型號、車型分類標籤
 * （classLabel）、保險方案與配件名稱、客人姓名；**寫死在程式裡的是文案、要翻**——按鈕、欄位名、
 * 選項的分類標籤、提示訊息。
 *
 * 需要帶入數值的文案寫成函式，讓各語言自己決定語序；金額與日期由 BookingFlowI18n 先格式化成字串再帶入。
 * 三個語言都必須實作完整的介面，缺翻譯會在編譯時失敗，不會在畫面上默默露出繁中。
 */
export interface BookingFlowMessages {
  labels: BookingFlowLabels;
  common: {
    partnerBanner: (partnerName: string) => string;
    next: string;
    orSimilar: string;
    orSimilarHint: string;
    seats: (count: number) => string;
    luggage: (count: number) => string;
    airConditioner: string;
    perDay: string;
    priceBreakdown: string;
    rentalSubtotal: string;
    couponDiscount: (code: string) => string;
    paymentMethod: string;
    orderNumber: string;
    processing: string;
  };
  language: {
    label: string;
  };
  search: {
    title: string;
  };
  dateStep: {
    vehicleType: string;
    searchAria: string;
  };
  rangePicker: {
    label: string;
    placeholder: string;
    prevMonth: string;
    nextMonth: string;
  };
  vehicleStep: {
    pickupTime: string;
    returnTime: string;
    openPickupTimePicker: string;
    openReturnTimePicker: string;
    vehicleClass: string;
    all: string;
    fromPrice: (price: string) => string;
    priceMin: string;
    priceMax: string;
    seats: string;
    noPreference: string;
    pickupBranch: string;
    chooseDatesFirst: string;
    noMatch: string;
    instantConfirm: string;
    unpriced: string;
    total: (price: string) => string;
    selectVehicle: (name: string) => string;
    vehicleSelected: (name: string) => string;
  };
  criteria: {
    summary: (place: string, start: string, end: string, days: number) => string;
    pickupAndReturn: (pickup: string, dropoff: string) => string;
    edit: string;
  };
  plan: {
    photoTag: string;
    lateFeeNotice: string;
    chooseTitle: string;
    dailyFrom: (price: string) => string;
    deductible: (min: string, max: string) => string;
    insuranceDetails: string;
    fuelTitle: string;
    energyTitle: string;
    fuelPolicy: Record<FuelPolicy, string>;
    energyPolicy: Record<FuelPolicy, string>;
    mileageTitle: string;
    mileagePolicy: Record<MileagePolicy, string>;
    onlinePayment: string;
  };
  order: {
    title: string;
    submitFailed: string;
  };
  addOnStep: {
    title: string;
    empty: string;
    quantity: string;
    unitPrice: (price: string, unit: string) => string;
  };
  couponStep: {
    title: string;
    code: string;
    placeholder: string;
    valid: (code: string) => string;
    reasons: Record<CouponRejectReason, string>;
    addOnFee: string;
    total: string;
    completePreviousSteps: string;
  };
  confirmStep: {
    title: string;
    returnBranch: string;
    payer: string;
    name: string;
    phone: string;
    email: string;
    submit: string;
  };
  summary: {
    pickup: string;
    dropoff: string;
    addOns: string;
    noVehicle: string;
    rentalRaw: string;
    tierDiscount: (percent: number) => string;
    partnerDiscount: (percent: number) => string;
    addOnSubtotal: string;
    insurance: string;
    grandTotal: string;
  };
  payment: {
    title: string;
    amountDue: string;
    simulateSuccess: string;
    simulateFailure: string;
    placeholderNote: string;
    notFound: string;
    unspecified: string;
    payFailed: string;
    payIncomplete: string;
  };
  done: {
    title: string;
    message: string;
    orderNumber: (id: string) => string;
    backHome: string;
  };
  errors: Record<BookingFlowErrorCode, string>;
}

/** 繁中的選項分類標籤直接沿用 libs/domain 的預設標籤，不另外維護一份。 */
const VEHICLE_CATEGORY_LABEL = optionLabelMap(VEHICLE_CATEGORY_OPTIONS);

export const ZH_TW_MESSAGES: BookingFlowMessages = {
  labels: {
    vehicleCategory: VEHICLE_CATEGORY_LABEL,
    seatBuckets: [
      { value: 'le2', label: '2人以下' },
      { value: 'mid', label: '3-5人' },
      { value: 'ge6', label: '6人以上' },
    ],
    sortOptions: [
      { value: 'default', label: '預設排序' },
      { value: 'price-asc', label: '價格低到高' },
      { value: 'price-desc', label: '價格高到低' },
    ],
    transmission: { auto: '自排', manual: '手排' },
    addOnUnit: optionLabelMap(ADD_ON_UNIT_OPTIONS),
    dateRangePicker: {
      field: '租期',
      placeholder: '選擇日期範圍',
      prevMonth: '上個月',
      nextMonth: '下個月',
      monthTitle: '{year}年{month}月',
    },
    vehicleGroups: [
      { value: 'scooter', label: VEHICLE_CATEGORY_LABEL.scooter },
      { value: 'car', label: VEHICLE_CATEGORY_LABEL.car },
    ],
    paymentPreference: optionLabelMap(PAYMENT_PREFERENCE_OPTIONS),
  },
  common: {
    partnerBanner: (partnerName) => `${partnerName} 專屬預約`,
    next: '下一步',
    orSimilar: '或同級',
    orSimilarHint: '實際車輛以現場配車為準，將提供同等級或以上車款',
    seats: (count) => `${count}人座`,
    luggage: (count) => `${count}件行李`,
    airConditioner: '空調',
    perDay: '/ 天',
    priceBreakdown: '試算明細',
    rentalSubtotal: '租金小計',
    couponDiscount: (code) => `優惠折抵（${code}）`,
    paymentMethod: '付款方式',
    orderNumber: '訂單編號',
    processing: '處理中…',
  },
  language: {
    label: '語言',
  },
  search: {
    title: '租車預約',
  },
  dateStep: {
    vehicleType: '車輛類型',
    searchAria: '搜尋可用車輛',
  },
  rangePicker: {
    label: '租期',
    placeholder: '選擇日期範圍',
    prevMonth: '上個月',
    nextMonth: '下個月',
  },
  vehicleStep: {
    pickupTime: '取車時間',
    returnTime: '還車時間',
    openPickupTimePicker: '開啟取車時間選擇器',
    openReturnTimePicker: '開啟還車時間選擇器',
    vehicleClass: '車型',
    all: '全部',
    fromPrice: (price) => `最低 ${price}`,
    priceMin: '最低',
    priceMax: '最高',
    seats: '座位數',
    noPreference: '不限',
    pickupBranch: '取車地點',
    chooseDatesFirst: '請先選擇租期以查看可租車輛。',
    noMatch: '沒有符合篩選條件的車輛，請試著調整篩選條件。',
    instantConfirm: '立即確認',
    unpriced: '暫無定價',
    total: (price) => `總計 ${price}`,
    selectVehicle: (name) => `選擇 ${name}`,
    vehicleSelected: (name) => `已選擇 ${name}`,
  },
  criteria: {
    summary: (place, start, end, days) => `${place} · ${start} ～ ${end} · 共 ${days} 天`,
    pickupAndReturn: (pickup, dropoff) => `取車 ${pickup} ・ 還車 ${dropoff}`,
    edit: '修改',
  },
  plan: {
    photoTag: '實拍照',
    lateFeeNotice: '特別提醒 如超過預約的時間，於額外收費時段取車，需額外支付服務費',
    chooseTitle: '選擇方案',
    dailyFrom: (price) => `${price}起 / 天`,
    deductible: (min, max) => `自付額 ${min} - ${max}`,
    insuranceDetails: '查看保險詳情',
    fuelTitle: '燃油規定',
    energyTitle: '電量規定',
    fuelPolicy: {
      full_to_full: '滿油取還車',
      full_to_empty: '滿油取車、可空車還車',
      same_level: '原油量還車',
    },
    energyPolicy: {
      full_to_full: '滿電取還車',
      full_to_empty: '滿電取車、可低電量還車',
      same_level: '原電量還車',
    },
    mileageTitle: '里程政策',
    mileagePolicy: { unlimited: '無限里程', limited: '有里程限制' },
    onlinePayment: '線上付款',
  },
  order: {
    title: '填寫訂單',
    submitFailed: '送出失敗，請稍後再試',
  },
  addOnStep: {
    title: '加購配件',
    empty: '目前無可加購配件。',
    quantity: '數量',
    unitPrice: (price, unit) => `${price} / ${unit}`,
  },
  couponStep: {
    title: '優惠券',
    code: '優惠碼',
    placeholder: '輸入優惠碼',
    valid: (code) => `優惠碼可用：${code}`,
    reasons: { not_found: '查無此優惠碼', not_applicable: '不符使用條件' },
    addOnFee: '配件費用',
    total: '總計',
    completePreviousSteps: '請先完成前面步驟以查看試算。',
  },
  confirmStep: {
    title: '確認並送出',
    returnBranch: '還車地點',
    payer: '付款人資訊',
    name: '姓名',
    phone: '電話',
    email: 'Email',
    submit: '前往付款',
  },
  summary: {
    pickup: '取車',
    dropoff: '還車',
    addOns: '加購配件',
    noVehicle: '尚未選擇車輛。',
    rentalRaw: '租金原價',
    tierDiscount: (percent) => `累租折扣（${percent}%）`,
    partnerDiscount: (percent) => `夥伴折扣（${percent}%）`,
    addOnSubtotal: '配件費用小計',
    insurance: '保險費用',
    grandTotal: '應付總計',
  },
  payment: {
    title: '付款',
    amountDue: '應付金額',
    simulateSuccess: '模擬付款成功',
    simulateFailure: '模擬付款失敗',
    placeholderNote: '此為佔位付款頁，尚未串接金流。',
    notFound: '查無此訂單。',
    unspecified: '未指定',
    payFailed: '付款失敗，請稍後再試',
    payIncomplete: '付款未完成，請重新嘗試或改用其他付款方式。',
  },
  done: {
    title: '訂單成立',
    message: '您的訂單已成立，我們將盡快為您準備車輛，並確認後續付款事宜。',
    orderNumber: (id) => `訂單編號：${id}`,
    backHome: '返回首頁',
  },
  errors: {
    no_pricing_plan: '無此車型定價',
    vehicle_not_found: '查無車輛',
    vehicle_unavailable: '車輛已被預約',
    order_not_found: '查無訂單',
  },
};
