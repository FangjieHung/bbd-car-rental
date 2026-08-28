export interface InsuranceCoverageItem {
  name: string;
  deductibleMin: number;
  deductibleMax: number;
  currency: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
  dailyPriceFrom: number;
  tags: string[];
  coverageItems: InsuranceCoverageItem[];
  detailsUrl?: string;
}
