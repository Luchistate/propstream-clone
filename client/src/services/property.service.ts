import api from './api';

export interface SearchParams {
  zip?: string;
  city?: string;
  state?: string;
  county?: string;
  address?: string;
  sw_lat?: number;
  sw_lng?: number;
  ne_lat?: number;
  ne_lng?: number;
  lat?: number;
  lng?: number;
  radius_miles?: number;
  property_type?: string;
  min_value?: number;
  max_value?: number;
  min_beds?: number;
  max_beds?: number;
  min_baths?: number;
  max_baths?: number;
  min_sqft?: number;
  max_sqft?: number;
  min_year_built?: number;
  max_year_built?: number;
  owner_occupied?: boolean;
  absentee_owner?: boolean;
  corporate_owned?: boolean;
  foreclosure_status?: string;
  tax_delinquent?: boolean;
  vacant?: boolean;
  min_equity_percent?: number;
  max_equity_percent?: number;
  page?: number;
  limit?: number;
}

export async function searchProperties(params: SearchParams) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
  );
  const res = await api.get('/properties/search', { params: cleanParams });
  return res.data;
}

export async function searchGeoJSON(params: Partial<SearchParams>) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
  );
  const res = await api.get('/properties/geojson', { params: cleanParams });
  return res.data;
}

export async function getPropertyDetail(id: number) {
  const res = await api.get(`/properties/${id}`);
  return res.data;
}
