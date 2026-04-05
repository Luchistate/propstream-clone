export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  user_id: number;
  email: string;
  tier: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface Property {
  id: number;
  attom_id: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  county: string | null;
  fips: string | null;
  apn: string | null;
  latitude: number | null;
  longitude: number | null;
  lot_size_sqft: number | null;
  building_sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  year_built: number | null;
  property_type: string;
  estimated_value: number | null;
  assessed_value: number | null;
  tax_amount: number | null;
  tax_year: number | null;
  owner_occupied: boolean;
  vacant: boolean;
  condition_score: number | null;
  last_sale_date: string | null;
  last_sale_price: number | null;
  equity_percent: number | null;
  mortgage_amount: number | null;
  mortgage_date: string | null;
  mortgage_rate: number | null;
  lender_name: string | null;
  foreclosure_status: string;
  years_owned: number | null;
  absentee_owner: boolean;
  corporate_owned: boolean;
  tax_delinquent: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Owner {
  id: number;
  property_id: number;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  entity_name: string | null;
  entity_type: string;
  mailing_address: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
}

export interface List {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  list_type: string;
  filter_criteria: any;
  created_at: Date;
  updated_at: Date;
  item_count?: number;
}

export interface ListItem {
  id: number;
  list_id: number;
  property_id: number;
  lead_status: string;
  notes: string | null;
  added_at: Date;
  property?: Property;
  owner?: Owner;
  skip_trace?: SkipTraceResult;
}

export interface SkipTraceResult {
  id: number;
  property_id: number;
  owner_id: number | null;
  phone_numbers: PhoneResult[];
  email_addresses: EmailResult[];
  provider: string;
  confidence_score: number;
  created_at: Date;
}

export interface PhoneResult {
  number: string;
  type: 'mobile' | 'landline' | 'voip';
  confidence: number;
  dnc: boolean;
}

export interface EmailResult {
  address: string;
  confidence: number;
}

export interface CallLog {
  id: number;
  user_id: number;
  property_id: number | null;
  list_id: number | null;
  phone_number: string;
  direction: string;
  duration_seconds: number | null;
  outcome: string | null;
  notes: string | null;
  recording_url: string | null;
  called_at: Date;
  ended_at: Date | null;
}
