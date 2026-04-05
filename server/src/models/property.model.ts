import { query } from '../config/database.js';
import { buildFilters, type PropertyFilters } from '../utils/filterBuilder.js';
import type { Property, Owner } from '../types/index.js';

export async function search(filters: PropertyFilters, page = 1, limit = 50): Promise<{ properties: Property[]; total: number }> {
  const { where, params } = buildFilters(filters);
  const offset = (page - 1) * limit;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM properties p ${where}`,
    params
  );

  const dataParams = [...params, limit, offset];
  const result = await query<Property>(
    `SELECT p.*,
      ST_Y(p.location::geometry) as latitude,
      ST_X(p.location::geometry) as longitude
     FROM properties p
     ${where}
     ORDER BY p.updated_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    dataParams
  );

  return {
    properties: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

export async function findById(id: number): Promise<Property | null> {
  const result = await query<Property>(
    `SELECT p.*,
      ST_Y(p.location::geometry) as latitude,
      ST_X(p.location::geometry) as longitude
     FROM properties p WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findByAttomId(attomId: string): Promise<Property | null> {
  const result = await query<Property>(
    `SELECT p.*,
      ST_Y(p.location::geometry) as latitude,
      ST_X(p.location::geometry) as longitude
     FROM properties p WHERE p.attom_id = $1`,
    [attomId]
  );
  return result.rows[0] || null;
}

export async function upsertFromAttom(data: Partial<Property>): Promise<Property> {
  const result = await query<Property>(
    `INSERT INTO properties (
      attom_id, address_line1, address_line2, city, state, zip, county, fips, apn,
      location, lot_size_sqft, building_sqft, bedrooms, bathrooms, year_built,
      property_type, estimated_value, assessed_value, tax_amount, tax_year,
      owner_occupied, vacant, condition_score, last_sale_date, last_sale_price,
      equity_percent, mortgage_amount, mortgage_date, mortgage_rate, lender_name,
      foreclosure_status, years_owned, absentee_owner, corporate_owned, tax_delinquent,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      CASE WHEN $10::float IS NOT NULL AND $11::float IS NOT NULL
        THEN ST_SetSRID(ST_MakePoint($11, $10), 4326)::geography
        ELSE NULL END,
      $12, $13, $14, $15, $16, COALESCE($17, 'single_family')::property_type,
      $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
      $28, $29, $30, $31, COALESCE($32, 'none')::foreclosure_status,
      $33, $34, $35, $36, NOW()
    )
    ON CONFLICT (attom_id) DO UPDATE SET
      estimated_value = COALESCE(EXCLUDED.estimated_value, properties.estimated_value),
      assessed_value = COALESCE(EXCLUDED.assessed_value, properties.assessed_value),
      tax_amount = COALESCE(EXCLUDED.tax_amount, properties.tax_amount),
      owner_occupied = COALESCE(EXCLUDED.owner_occupied, properties.owner_occupied),
      foreclosure_status = COALESCE(EXCLUDED.foreclosure_status, properties.foreclosure_status),
      mortgage_amount = COALESCE(EXCLUDED.mortgage_amount, properties.mortgage_amount),
      updated_at = NOW()
    RETURNING *,
      ST_Y(location::geometry) as latitude,
      ST_X(location::geometry) as longitude`,
    [
      data.attom_id, data.address_line1, data.address_line2, data.city, data.state,
      data.zip, data.county, data.fips, data.apn,
      data.latitude, data.longitude,
      data.lot_size_sqft, data.building_sqft, data.bedrooms, data.bathrooms,
      data.year_built, data.property_type,
      data.estimated_value, data.assessed_value, data.tax_amount, data.tax_year,
      data.owner_occupied, data.vacant, data.condition_score,
      data.last_sale_date, data.last_sale_price, data.equity_percent,
      data.mortgage_amount, data.mortgage_date, data.mortgage_rate, data.lender_name,
      data.foreclosure_status, data.years_owned, data.absentee_owner,
      data.corporate_owned, data.tax_delinquent,
    ]
  );

  return result.rows[0];
}

export async function getOwnerByPropertyId(propertyId: number): Promise<Owner | null> {
  const result = await query<Owner>(
    'SELECT * FROM owners WHERE property_id = $1 ORDER BY id DESC LIMIT 1',
    [propertyId]
  );
  return result.rows[0] || null;
}

export async function searchGeoJSON(filters: PropertyFilters, limit = 500): Promise<any> {
  const { where, params } = buildFilters(filters);

  const result = await query(
    `SELECT
      p.id, p.address_line1, p.city, p.state, p.zip,
      p.bedrooms, p.bathrooms, p.building_sqft, p.estimated_value,
      p.property_type, p.foreclosure_status, p.owner_occupied,
      ST_Y(p.location::geometry) as latitude,
      ST_X(p.location::geometry) as longitude
     FROM properties p
     ${where}
     AND p.location IS NOT NULL
     LIMIT $${params.length + 1}`,
    [...params, limit]
  );

  return {
    type: 'FeatureCollection',
    features: result.rows.map((row: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [row.longitude, row.latitude],
      },
      properties: {
        id: row.id,
        address: row.address_line1,
        city: row.city,
        state: row.state,
        zip: row.zip,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        sqft: row.building_sqft,
        value: row.estimated_value,
        type: row.property_type,
        foreclosure: row.foreclosure_status,
        owner_occupied: row.owner_occupied,
      },
    })),
  };
}
