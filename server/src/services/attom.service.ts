import { env } from '../config/env.js';
import { cacheGet, cacheSet, TTL } from './cache.service.js';
import { normalizeProperty, normalizeOwner } from '../utils/attomNormalizer.js';
import type { Property, Owner } from '../types/index.js';

const ATTOM_BASE = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

async function attomFetch(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (env.USE_MOCK) {
    return null; // Mock mode — caller falls back to local DB
  }

  const url = new URL(`${ATTOM_BASE}${endpoint}`);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  const response = await fetch(url.toString(), {
    headers: {
      apikey: env.ATTOM_API_KEY,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`ATTOM API error ${response.status}: ${text}`);
    return null;
  }

  return response.json();
}

export async function searchByZip(zip: string): Promise<Partial<Property>[]> {
  const cacheKey = `attom:search:zip:${zip}`;
  const cached = await cacheGet<Partial<Property>[]>(cacheKey);
  if (cached) return cached;

  const data = await attomFetch('/property/snapshot', { postalcode: zip, pagesize: '50' });
  if (!data?.property) return [];

  const properties = data.property.map((p: any) => normalizeProperty({ property: [p] }));
  await cacheSet(cacheKey, properties, TTL.SEARCH_RESULTS);
  return properties;
}

export async function searchByAddress(address: string): Promise<Partial<Property>[]> {
  const cacheKey = `attom:search:addr:${address}`;
  const cached = await cacheGet<Partial<Property>[]>(cacheKey);
  if (cached) return cached;

  const data = await attomFetch('/property/address', { address1: address });
  if (!data?.property) return [];

  const properties = data.property.map((p: any) => normalizeProperty({ property: [p] }));
  await cacheSet(cacheKey, properties, TTL.SEARCH_RESULTS);
  return properties;
}

export async function searchByArea(params: {
  city?: string;
  state?: string;
  county?: string;
  zip?: string;
}): Promise<Partial<Property>[]> {
  const queryParams: Record<string, string> = { pagesize: '50' };
  if (params.zip) queryParams.postalcode = params.zip;
  if (params.city) queryParams.cityname = params.city;
  if (params.state) queryParams.statecode = params.state;
  if (params.county) queryParams.countyname = params.county;

  const cacheKey = `attom:search:area:${JSON.stringify(queryParams)}`;
  const cached = await cacheGet<Partial<Property>[]>(cacheKey);
  if (cached) return cached;

  const data = await attomFetch('/property/snapshot', queryParams);
  if (!data?.property) return [];

  const properties = data.property.map((p: any) => normalizeProperty({ property: [p] }));
  await cacheSet(cacheKey, properties, TTL.SEARCH_RESULTS);
  return properties;
}

export async function getPropertyDetail(attomId: string): Promise<Partial<Property> | null> {
  const cacheKey = `attom:detail:${attomId}`;
  const cached = await cacheGet<Partial<Property>>(cacheKey);
  if (cached) return cached;

  const data = await attomFetch('/property/detail', { attomid: attomId });
  if (!data?.property) return null;

  const property = normalizeProperty(data);
  await cacheSet(cacheKey, property, TTL.PROPERTY_DETAIL);
  return property;
}

export async function getOwnerDetail(attomId: string, propertyId: number): Promise<Partial<Owner> | null> {
  const cacheKey = `attom:owner:${attomId}`;
  const cached = await cacheGet<Partial<Owner>>(cacheKey);
  if (cached) return cached;

  const data = await attomFetch('/property/detail', { attomid: attomId });
  if (!data?.property) return null;

  const owner = normalizeOwner(data.property[0], propertyId);
  await cacheSet(cacheKey, owner, TTL.OWNER);
  return owner;
}

export async function getAVM(attomId: string): Promise<{ estimatedValue: number; low: number; high: number } | null> {
  const cacheKey = `attom:avm:${attomId}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  const data = await attomFetch('/valuation/homeequity', { attomid: attomId });
  if (!data?.property) return null;

  const val = data.property[0]?.avm || {};
  const result = {
    estimatedValue: val.amount?.value || 0,
    low: val.amount?.low || 0,
    high: val.amount?.high || 0,
  };

  await cacheSet(cacheKey, result, TTL.AVM);
  return result;
}

export async function getSalesHistory(attomId: string): Promise<any[]> {
  const cacheKey = `attom:sales:${attomId}`;
  const cached = await cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const data = await attomFetch('/sale/detail', { attomid: attomId });
  if (!data?.property) return [];

  const sales = data.property[0]?.saleHistory || [];
  await cacheSet(cacheKey, sales, TTL.PROPERTY_DETAIL);
  return sales;
}
