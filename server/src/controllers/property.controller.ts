import type { Request, Response } from 'express';
import * as propertyModel from '../models/property.model.js';
import * as attomService from '../services/attom.service.js';
import { AppError } from '../middleware/errorHandler.js';
import type { PropertyFilters } from '../utils/filterBuilder.js';

export async function search(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

  const filters: PropertyFilters = {
    zip: req.query.zip as string,
    city: req.query.city as string,
    state: req.query.state as string,
    county: req.query.county as string,
    address: req.query.address as string,
    sw_lat: req.query.sw_lat ? parseFloat(req.query.sw_lat as string) : undefined,
    sw_lng: req.query.sw_lng ? parseFloat(req.query.sw_lng as string) : undefined,
    ne_lat: req.query.ne_lat ? parseFloat(req.query.ne_lat as string) : undefined,
    ne_lng: req.query.ne_lng ? parseFloat(req.query.ne_lng as string) : undefined,
    lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
    lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
    radius_miles: req.query.radius_miles ? parseFloat(req.query.radius_miles as string) : undefined,
    property_type: req.query.property_type as string,
    min_value: req.query.min_value ? parseInt(req.query.min_value as string) : undefined,
    max_value: req.query.max_value ? parseInt(req.query.max_value as string) : undefined,
    min_beds: req.query.min_beds ? parseInt(req.query.min_beds as string) : undefined,
    max_beds: req.query.max_beds ? parseInt(req.query.max_beds as string) : undefined,
    min_baths: req.query.min_baths ? parseFloat(req.query.min_baths as string) : undefined,
    max_baths: req.query.max_baths ? parseFloat(req.query.max_baths as string) : undefined,
    min_sqft: req.query.min_sqft ? parseInt(req.query.min_sqft as string) : undefined,
    max_sqft: req.query.max_sqft ? parseInt(req.query.max_sqft as string) : undefined,
    min_year_built: req.query.min_year_built ? parseInt(req.query.min_year_built as string) : undefined,
    max_year_built: req.query.max_year_built ? parseInt(req.query.max_year_built as string) : undefined,
    min_lot_sqft: req.query.min_lot_sqft ? parseInt(req.query.min_lot_sqft as string) : undefined,
    max_lot_sqft: req.query.max_lot_sqft ? parseInt(req.query.max_lot_sqft as string) : undefined,
    owner_occupied: req.query.owner_occupied != null ? req.query.owner_occupied === 'true' : undefined,
    absentee_owner: req.query.absentee_owner != null ? req.query.absentee_owner === 'true' : undefined,
    corporate_owned: req.query.corporate_owned != null ? req.query.corporate_owned === 'true' : undefined,
    foreclosure_status: req.query.foreclosure_status as string,
    tax_delinquent: req.query.tax_delinquent != null ? req.query.tax_delinquent === 'true' : undefined,
    vacant: req.query.vacant != null ? req.query.vacant === 'true' : undefined,
    min_years_owned: req.query.min_years_owned ? parseFloat(req.query.min_years_owned as string) : undefined,
    max_years_owned: req.query.max_years_owned ? parseFloat(req.query.max_years_owned as string) : undefined,
    min_equity_percent: req.query.min_equity_percent ? parseFloat(req.query.min_equity_percent as string) : undefined,
    max_equity_percent: req.query.max_equity_percent ? parseFloat(req.query.max_equity_percent as string) : undefined,
  };

  // Remove undefined values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined)
  ) as PropertyFilters;

  const { properties, total } = await propertyModel.search(cleanFilters, page, limit);

  res.json({
    success: true,
    data: {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}

export async function searchGeoJSON(req: Request, res: Response): Promise<void> {
  const filters: PropertyFilters = {
    sw_lat: req.query.sw_lat ? parseFloat(req.query.sw_lat as string) : undefined,
    sw_lng: req.query.sw_lng ? parseFloat(req.query.sw_lng as string) : undefined,
    ne_lat: req.query.ne_lat ? parseFloat(req.query.ne_lat as string) : undefined,
    ne_lng: req.query.ne_lng ? parseFloat(req.query.ne_lng as string) : undefined,
    zip: req.query.zip as string,
    city: req.query.city as string,
    state: req.query.state as string,
    property_type: req.query.property_type as string,
    min_value: req.query.min_value ? parseInt(req.query.min_value as string) : undefined,
    max_value: req.query.max_value ? parseInt(req.query.max_value as string) : undefined,
    foreclosure_status: req.query.foreclosure_status as string,
  };

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined)
  ) as PropertyFilters;

  const geojson = await propertyModel.searchGeoJSON(cleanFilters);
  res.json({ success: true, data: geojson });
}

export async function getDetail(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new AppError(400, 'Invalid property ID');

  const property = await propertyModel.findById(id);
  if (!property) throw new AppError(404, 'Property not found');

  const owner = await propertyModel.getOwnerByPropertyId(id);

  res.json({
    success: true,
    data: { property, owner },
  });
}
