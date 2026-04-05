import type { Request, Response } from 'express';
import * as listModel from '../models/list.model.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getLists(req: Request, res: Response): Promise<void> {
  const lists = await listModel.findByUserId(req.user!.user_id);
  res.json({ success: true, data: lists });
}

export async function createList(req: Request, res: Response): Promise<void> {
  const { name, description, list_type, filter_criteria } = req.body;
  if (!name) throw new AppError(400, 'List name is required');

  const list = await listModel.create(req.user!.user_id, name, description, list_type, filter_criteria);
  res.status(201).json({ success: true, data: list });
}

export async function getList(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const list = await listModel.findById(id, req.user!.user_id);
  if (!list) throw new AppError(404, 'List not found');

  const stats = await listModel.getListStats(id);
  res.json({ success: true, data: { ...list, stats } });
}

export async function updateList(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const list = await listModel.update(id, req.user!.user_id, req.body);
  if (!list) throw new AppError(404, 'List not found');
  res.json({ success: true, data: list });
}

export async function deleteList(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const deleted = await listModel.remove(id, req.user!.user_id);
  if (!deleted) throw new AppError(404, 'List not found');
  res.json({ success: true, message: 'List deleted' });
}

export async function addItems(req: Request, res: Response): Promise<void> {
  const listId = parseInt(req.params.id);
  const { property_ids } = req.body;
  if (!Array.isArray(property_ids) || property_ids.length === 0) {
    throw new AppError(400, 'property_ids array is required');
  }

  const list = await listModel.findById(listId, req.user!.user_id);
  if (!list) throw new AppError(404, 'List not found');

  const added = await listModel.addItems(listId, property_ids);
  res.json({ success: true, data: { added } });
}

export async function removeItems(req: Request, res: Response): Promise<void> {
  const listId = parseInt(req.params.id);
  const { item_ids } = req.body;
  if (!Array.isArray(item_ids)) throw new AppError(400, 'item_ids array is required');

  const removed = await listModel.removeItems(listId, item_ids);
  res.json({ success: true, data: { removed } });
}

export async function updateItemStatus(req: Request, res: Response): Promise<void> {
  const itemId = parseInt(req.params.itemId);
  const { status, notes } = req.body;
  if (!status) throw new AppError(400, 'status is required');

  const item = await listModel.updateItemStatus(itemId, status, notes);
  if (!item) throw new AppError(404, 'List item not found');
  res.json({ success: true, data: item });
}

export async function getItems(req: Request, res: Response): Promise<void> {
  const listId = parseInt(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const status = req.query.status as string | undefined;

  const list = await listModel.findById(listId, req.user!.user_id);
  if (!list) throw new AppError(404, 'List not found');

  const { items, total } = await listModel.getItems(listId, page, limit, status);
  res.json({
    success: true,
    data: {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}

export async function exportList(req: Request, res: Response): Promise<void> {
  const listId = parseInt(req.params.id);
  const list = await listModel.findById(listId, req.user!.user_id);
  if (!list) throw new AppError(404, 'List not found');

  const rows = await listModel.exportList(listId);

  // Build CSV
  if (rows.length === 0) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${list.name}.csv"`);
    res.send('No data');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = (row as any)[h];
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${list.name}.csv"`);
  res.send(csv);
}
