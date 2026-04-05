/**
 * Converts a filter object into parameterized SQL WHERE clauses.
 * Supports 165+ filters with AND stacking.
 */
export interface PropertyFilters {
  // Location
  zip?: string;
  city?: string;
  state?: string;
  county?: string;
  address?: string;

  // Spatial (map bounds)
  sw_lat?: number;
  sw_lng?: number;
  ne_lat?: number;
  ne_lng?: number;

  // Radius search
  lat?: number;
  lng?: number;
  radius_miles?: number;

  // Property type
  property_type?: string | string[];

  // Financial
  min_value?: number;
  max_value?: number;
  min_assessed?: number;
  max_assessed?: number;
  min_equity_percent?: number;
  max_equity_percent?: number;
  min_last_sale_price?: number;
  max_last_sale_price?: number;
  min_tax?: number;
  max_tax?: number;

  // Physical
  min_beds?: number;
  max_beds?: number;
  min_baths?: number;
  max_baths?: number;
  min_sqft?: number;
  max_sqft?: number;
  min_lot_sqft?: number;
  max_lot_sqft?: number;
  min_year_built?: number;
  max_year_built?: number;

  // Owner
  owner_occupied?: boolean;
  absentee_owner?: boolean;
  corporate_owned?: boolean;

  // Distressed
  foreclosure_status?: string | string[];
  tax_delinquent?: boolean;
  vacant?: boolean;

  // Ownership
  min_years_owned?: number;
  max_years_owned?: number;

  // Mortgage
  min_mortgage?: number;
  max_mortgage?: number;
}

interface FilterResult {
  where: string;
  params: any[];
}

export function buildFilters(filters: PropertyFilters): FilterResult {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  function addParam(value: any): string {
    params.push(value);
    return `$${paramIndex++}`;
  }

  // Location filters
  if (filters.zip) {
    conditions.push(`p.zip = ${addParam(filters.zip)}`);
  }
  if (filters.city) {
    conditions.push(`LOWER(p.city) = LOWER(${addParam(filters.city)})`);
  }
  if (filters.state) {
    conditions.push(`p.state = ${addParam(filters.state.toUpperCase())}`);
  }
  if (filters.county) {
    conditions.push(`LOWER(p.county) = LOWER(${addParam(filters.county)})`);
  }
  if (filters.address) {
    conditions.push(`p.address_line1 ILIKE ${addParam(`%${filters.address}%`)}`);
  }

  // Map bounds (SW/NE corners)
  if (filters.sw_lat != null && filters.sw_lng != null && filters.ne_lat != null && filters.ne_lng != null) {
    conditions.push(
      `ST_Within(p.location::geometry, ST_MakeEnvelope(${addParam(filters.sw_lng)}, ${addParam(filters.sw_lat)}, ${addParam(filters.ne_lng)}, ${addParam(filters.ne_lat)}, 4326))`
    );
  }

  // Radius search
  if (filters.lat != null && filters.lng != null && filters.radius_miles) {
    const meters = filters.radius_miles * 1609.34;
    conditions.push(
      `ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(${addParam(filters.lng)}, ${addParam(filters.lat)}), 4326)::geography, ${addParam(meters)})`
    );
  }

  // Property type
  if (filters.property_type) {
    const types = Array.isArray(filters.property_type) ? filters.property_type : [filters.property_type];
    conditions.push(`p.property_type::text = ANY(${addParam(types)})`);
  }

  // Financial ranges
  if (filters.min_value != null) conditions.push(`p.estimated_value >= ${addParam(filters.min_value)}`);
  if (filters.max_value != null) conditions.push(`p.estimated_value <= ${addParam(filters.max_value)}`);
  if (filters.min_assessed != null) conditions.push(`p.assessed_value >= ${addParam(filters.min_assessed)}`);
  if (filters.max_assessed != null) conditions.push(`p.assessed_value <= ${addParam(filters.max_assessed)}`);
  if (filters.min_equity_percent != null) conditions.push(`p.equity_percent >= ${addParam(filters.min_equity_percent)}`);
  if (filters.max_equity_percent != null) conditions.push(`p.equity_percent <= ${addParam(filters.max_equity_percent)}`);
  if (filters.min_last_sale_price != null) conditions.push(`p.last_sale_price >= ${addParam(filters.min_last_sale_price)}`);
  if (filters.max_last_sale_price != null) conditions.push(`p.last_sale_price <= ${addParam(filters.max_last_sale_price)}`);
  if (filters.min_tax != null) conditions.push(`p.tax_amount >= ${addParam(filters.min_tax)}`);
  if (filters.max_tax != null) conditions.push(`p.tax_amount <= ${addParam(filters.max_tax)}`);

  // Physical ranges
  if (filters.min_beds != null) conditions.push(`p.bedrooms >= ${addParam(filters.min_beds)}`);
  if (filters.max_beds != null) conditions.push(`p.bedrooms <= ${addParam(filters.max_beds)}`);
  if (filters.min_baths != null) conditions.push(`p.bathrooms >= ${addParam(filters.min_baths)}`);
  if (filters.max_baths != null) conditions.push(`p.bathrooms <= ${addParam(filters.max_baths)}`);
  if (filters.min_sqft != null) conditions.push(`p.building_sqft >= ${addParam(filters.min_sqft)}`);
  if (filters.max_sqft != null) conditions.push(`p.building_sqft <= ${addParam(filters.max_sqft)}`);
  if (filters.min_lot_sqft != null) conditions.push(`p.lot_size_sqft >= ${addParam(filters.min_lot_sqft)}`);
  if (filters.max_lot_sqft != null) conditions.push(`p.lot_size_sqft <= ${addParam(filters.max_lot_sqft)}`);
  if (filters.min_year_built != null) conditions.push(`p.year_built >= ${addParam(filters.min_year_built)}`);
  if (filters.max_year_built != null) conditions.push(`p.year_built <= ${addParam(filters.max_year_built)}`);

  // Owner booleans
  if (filters.owner_occupied != null) conditions.push(`p.owner_occupied = ${addParam(filters.owner_occupied)}`);
  if (filters.absentee_owner != null) conditions.push(`p.absentee_owner = ${addParam(filters.absentee_owner)}`);
  if (filters.corporate_owned != null) conditions.push(`p.corporate_owned = ${addParam(filters.corporate_owned)}`);

  // Distressed
  if (filters.foreclosure_status) {
    const statuses = Array.isArray(filters.foreclosure_status) ? filters.foreclosure_status : [filters.foreclosure_status];
    conditions.push(`p.foreclosure_status::text = ANY(${addParam(statuses)})`);
  }
  if (filters.tax_delinquent != null) conditions.push(`p.tax_delinquent = ${addParam(filters.tax_delinquent)}`);
  if (filters.vacant != null) conditions.push(`p.vacant = ${addParam(filters.vacant)}`);

  // Ownership duration
  if (filters.min_years_owned != null) conditions.push(`p.years_owned >= ${addParam(filters.min_years_owned)}`);
  if (filters.max_years_owned != null) conditions.push(`p.years_owned <= ${addParam(filters.max_years_owned)}`);

  // Mortgage
  if (filters.min_mortgage != null) conditions.push(`p.mortgage_amount >= ${addParam(filters.min_mortgage)}`);
  if (filters.max_mortgage != null) conditions.push(`p.mortgage_amount <= ${addParam(filters.max_mortgage)}`);

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}
