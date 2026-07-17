import { CommissionRule } from './commission';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  discountPercent: number; // 協議折扣 0–100
  commission: CommissionRule;
}
