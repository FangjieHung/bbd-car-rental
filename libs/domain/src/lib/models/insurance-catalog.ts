import { InsurancePlan } from './insurance-plan';
import { VehicleCategory } from './vehicle';

/**
 * 保險方案示範資料，依車輛分類而非個別車輛定義——實務上費率與自負額是看車種決定的，
 * 同分類的車共用同一組方案。正式資料（方案內容、費率、是否為外購保單）待業主提供，
 * 見 `docs/owner-questions.md` 第 10 條；長期應由後端以主檔管理並帶生效期間。
 */
const SCOOTER_PLANS: InsurancePlan[] = [
  {
    id: 'ins-scooter-basic',
    name: '基本保障',
    dailyPriceFrom: 100,
    tags: ['有自負額', '最低保障'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 10000, deductibleMax: 30000, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 10000, deductibleMax: 30000, currency: 'TWD' },
    ],
  },
  {
    id: 'ins-scooter-standard',
    name: '安心保障',
    dailyPriceFrom: 200,
    tags: ['降低自負額'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 3000, deductibleMax: 3000, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 3000, deductibleMax: 3000, currency: 'TWD' },
    ],
  },
  {
    id: 'ins-scooter-full',
    name: '全額保障',
    dailyPriceFrom: 300,
    tags: ['零自負額', '最完整'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 0, deductibleMax: 0, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 0, deductibleMax: 0, currency: 'TWD' },
    ],
  },
];

const CAR_PLANS: InsurancePlan[] = [
  {
    id: 'ins-car-basic',
    name: '基本保障',
    dailyPriceFrom: 200,
    tags: ['有自負額', '最低保障'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 30000, deductibleMax: 60000, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 30000, deductibleMax: 60000, currency: 'TWD' },
    ],
  },
  {
    id: 'ins-car-standard',
    name: '安心保障',
    dailyPriceFrom: 400,
    tags: ['降低自負額'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 10000, deductibleMax: 10000, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 10000, deductibleMax: 10000, currency: 'TWD' },
    ],
  },
  {
    id: 'ins-car-full',
    name: '全額保障',
    dailyPriceFrom: 600,
    tags: ['零自負額', '最完整'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 0, deductibleMax: 0, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 0, deductibleMax: 0, currency: 'TWD' },
    ],
  },
];

// 車隊裡的 ev 是電動機車（Gogoro），費率貼近機車；電池另計，因為損壞求償金額與車體無關。
const EV_PLANS: InsurancePlan[] = [
  {
    id: 'ins-ev-basic',
    name: '基本保障',
    dailyPriceFrom: 120,
    tags: ['有自負額', '最低保障'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 10000, deductibleMax: 30000, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 10000, deductibleMax: 30000, currency: 'TWD' },
      { name: '電池損壞', deductibleMin: 20000, deductibleMax: 50000, currency: 'TWD' },
    ],
  },
  {
    id: 'ins-ev-standard',
    name: '安心保障',
    dailyPriceFrom: 240,
    tags: ['降低自負額'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 3000, deductibleMax: 3000, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 3000, deductibleMax: 3000, currency: 'TWD' },
      { name: '電池損壞', deductibleMin: 10000, deductibleMax: 10000, currency: 'TWD' },
    ],
  },
  {
    id: 'ins-ev-full',
    name: '全額保障',
    dailyPriceFrom: 360,
    tags: ['零自負額', '最完整'],
    coverageItems: [
      { name: '租車自負額', deductibleMin: 0, deductibleMax: 0, currency: 'TWD' },
      { name: '第三人責任險', deductibleMin: 0, deductibleMax: 0, currency: 'TWD' },
      { name: '電池損壞', deductibleMin: 0, deductibleMax: 0, currency: 'TWD' },
    ],
  },
];

export const INSURANCE_PLANS_BY_CATEGORY: Record<VehicleCategory, InsurancePlan[]> = {
  scooter: SCOOTER_PLANS,
  car: CAR_PLANS,
  ev: EV_PLANS,
};

/** 某車輛分類可選的保險方案，由低到高三個級距。 */
export function insurancePlansFor(category: VehicleCategory): InsurancePlan[] {
  return INSURANCE_PLANS_BY_CATEGORY[category];
}
