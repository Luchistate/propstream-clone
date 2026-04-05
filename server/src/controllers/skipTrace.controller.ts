import type { Request, Response } from 'express';
import * as skipTraceService from '../services/skipTrace.service.js';
import * as propertyModel from '../models/property.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { query } from '../config/database.js';

export async function traceSingle(req: Request, res: Response): Promise<void> {
  const { property_id } = req.body;
  if (!property_id) throw new AppError(400, 'property_id is required');

  // Check credits
  const credits = await skipTraceService.getCredits(req.user!.user_id);
  if (credits < 1) throw new AppError(402, 'Insufficient skip trace credits');

  // Get property and owner info
  const property = await propertyModel.findById(property_id);
  if (!property) throw new AppError(404, 'Property not found');

  const owner = await propertyModel.getOwnerByPropertyId(property_id);

  const result = await skipTraceService.traceProperty({
    propertyId: property_id,
    ownerName: owner?.full_name || undefined,
    address: property.address_line1,
    city: property.city,
    state: property.state,
    zip: property.zip,
  });

  // Deduct credit
  await skipTraceService.deductCredits(req.user!.user_id, 1);

  res.json({ success: true, data: result });
}

export async function traceBulk(req: Request, res: Response): Promise<void> {
  const { property_ids, list_id } = req.body;

  let ids: number[] = property_ids || [];

  // If list_id provided, get all property IDs from that list
  if (list_id && !property_ids) {
    const result = await query<{ property_id: number }>(
      'SELECT property_id FROM list_items WHERE list_id = $1',
      [list_id]
    );
    ids = result.rows.map(r => r.property_id);
  }

  if (ids.length === 0) throw new AppError(400, 'No properties to trace');

  // Check credits
  const credits = await skipTraceService.getCredits(req.user!.user_id);
  if (credits < ids.length) {
    throw new AppError(402, `Insufficient credits. Need ${ids.length}, have ${credits}`);
  }

  // Process each property
  const results = [];
  for (const propertyId of ids) {
    const property = await propertyModel.findById(propertyId);
    if (!property) continue;

    const owner = await propertyModel.getOwnerByPropertyId(propertyId);
    const result = await skipTraceService.traceProperty({
      propertyId,
      ownerName: owner?.full_name || undefined,
      address: property.address_line1,
      city: property.city,
      state: property.state,
      zip: property.zip,
    });
    results.push(result);
  }

  // Deduct credits
  await skipTraceService.deductCredits(req.user!.user_id, results.length);

  res.json({
    success: true,
    data: {
      traced: results.length,
      results,
    },
  });
}

export async function getResult(req: Request, res: Response): Promise<void> {
  const propertyId = parseInt(req.params.propertyId);
  const result = await query(
    'SELECT * FROM skip_trace_results WHERE property_id = $1 ORDER BY created_at DESC LIMIT 1',
    [propertyId]
  );

  res.json({
    success: true,
    data: result.rows[0] || null,
  });
}

export async function getCredits(req: Request, res: Response): Promise<void> {
  const credits = await skipTraceService.getCredits(req.user!.user_id);
  res.json({ success: true, data: { credits } });
}
