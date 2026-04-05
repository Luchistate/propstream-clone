import type { Property, Owner } from '../types/index.js';

/**
 * Normalizes raw ATTOM API responses into our app types.
 * ATTOM returns deeply nested JSON — this flattens it.
 */
export function normalizeProperty(raw: any): Partial<Property> {
  const prop = raw.property?.[0] || raw;
  const address = prop.address || {};
  const summary = prop.summary || prop.building?.summary || {};
  const lot = prop.lot || {};
  const assessment = prop.assessment || {};
  const sale = prop.sale || {};
  const mortgage = prop.mortgage || {};
  const owner = prop.owner || {};

  return {
    attom_id: prop.identifier?.attomId?.toString() || null,
    address_line1: address.line1 || address.oneLine || '',
    address_line2: address.line2 || null,
    city: address.locality || '',
    state: address.countrySubd || '',
    zip: address.postal1 || '',
    county: address.county || null,
    fips: prop.identifier?.fips || null,
    apn: prop.identifier?.apn || null,
    latitude: prop.location?.latitude ? parseFloat(prop.location.latitude) : null,
    longitude: prop.location?.longitude ? parseFloat(prop.location.longitude) : null,
    lot_size_sqft: lot.lotSize1 || lot.lotsize1 || null,
    building_sqft: summary.sizeInd || summary.livingSize || null,
    bedrooms: summary.bedrooms || null,
    bathrooms: summary.bathrooms || null,
    year_built: summary.yearBuilt || null,
    property_type: mapPropertyType(summary.propertyType || ''),
    estimated_value: assessment.market?.mktTtlValue || null,
    assessed_value: assessment.assessed?.assdTtlValue || null,
    tax_amount: assessment.tax?.taxAmt || null,
    tax_year: assessment.tax?.taxYear || null,
    owner_occupied: owner.absenteeInd === 'O',
    absentee_owner: owner.absenteeInd === 'A',
    corporate_owned: owner.corporateIndicator === 'Y',
    last_sale_date: sale.saleTransDate || null,
    last_sale_price: sale.amount?.saleAmt || null,
    mortgage_amount: mortgage.amount?.mortgageAmt || null,
    mortgage_date: mortgage.mortgageDate || null,
    lender_name: mortgage.lender?.lenderName || null,
  };
}

export function normalizeOwner(raw: any, propertyId: number): Partial<Owner> {
  const owner = raw.owner || raw;
  return {
    property_id: propertyId,
    first_name: owner.owner1?.firstName || null,
    last_name: owner.owner1?.lastName || null,
    full_name: owner.owner1?.fullName || [owner.owner1?.firstName, owner.owner1?.lastName].filter(Boolean).join(' ') || null,
    entity_name: owner.corporateName || null,
    entity_type: owner.corporateIndicator === 'Y' ? 'corporate' : 'individual',
    mailing_address: owner.mailingAddress?.line1 || null,
    mailing_city: owner.mailingAddress?.locality || null,
    mailing_state: owner.mailingAddress?.countrySubd || null,
    mailing_zip: owner.mailingAddress?.postal1 || null,
  };
}

function mapPropertyType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('single') || lower.includes('sfr')) return 'single_family';
  if (lower.includes('multi') || lower.includes('duplex') || lower.includes('triplex')) return 'multi_family';
  if (lower.includes('condo')) return 'condo';
  if (lower.includes('town')) return 'townhouse';
  if (lower.includes('manufact') || lower.includes('mobile')) return 'manufactured';
  if (lower.includes('land') || lower.includes('lot')) return 'land';
  if (lower.includes('commercial')) return 'commercial';
  if (lower.includes('apart')) return 'apartment';
  return 'single_family';
}
