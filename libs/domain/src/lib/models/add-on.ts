export type AddOnUnit = 'per_rental' | 'per_day';
export interface AddOn { id: string; name: string; unitPrice: number; unit: AddOnUnit; }
