
export enum AgeRange {
  RANGE_0_18 = '0-18',
  RANGE_19_23 = '19-23',
  RANGE_24_28 = '24-28',
  RANGE_29_33 = '29-33',
  RANGE_34_38 = '34-38',
  RANGE_39_43 = '39-43',
  RANGE_44_48 = '44-48',
  RANGE_49_53 = '49-53',
  RANGE_54_58 = '54-58',
  RANGE_59_PLUS = '59+',
}

export type QuoteCategory = 'PF' | 'PME_1' | 'PME_2' | 'PME_30';

export type CoparticipationType = 'full' | 'partial' | 'none';

export interface User {
  id?: string; // Supabase Auth UUID
  cpf: string;
  password?: string; 
  name: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt?: string;
  
  // Supabase DB fields mapping (snake_case)
  is_admin?: boolean;
  created_at?: string;
}

export interface PlanPriceTable {
  [key: string]: number; 
}

export interface HealthPlan {
  id: string;
  name: string;
  operator: string;
  type: 'Enfermaria' | 'Apartamento';
  coparticipationType: CoparticipationType;
  logoColor: string;
  prices: PlanPriceTable;
  hospitals: string[];
  description: string; 
  categories: QuoteCategory[];
  coverage: string;
  gracePeriods: string[];
  copayFees: { service: string; value: string }[];
}

export interface UserSelection {
  [key: string]: number; 
}

export interface CalculatedPlan {
  plan: HealthPlan;
  totalPrice: number;
  details: { ageRange: string; count: number; unitPrice: number; subtotal: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
