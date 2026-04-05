import { query } from '../config/database.js';
import type { List, ListItem } from '../types/index.js';

export async function create(userId: number, name: string, description?: string, listType = 'static', filterCriteria?: any): Promise<List> {
  const result = await query<List>(
    `INSERT INTO lists (user_id, name, description, list_type, filter_criteria)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, name, description || null, listType, filterCriteria ? JSON.stringify(filterCriteria) : null]
  );
  return result.rows[0];
}

export async function findByUserId(userId: number): Promise<List[]> {
  const result = await query<List>(
    `SELECT l.*,
      (SELECT COUNT(*) FROM list_items li WHERE li.list_id = l.id) as item_count
     FROM lists l
     WHERE l.user_id = $1
     ORDER BY l.updated_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findById(id: number, userId: number): Promise<List | null> {
  const result = await query<List>(
    `SELECT l.*,
      (SELECT COUNT(*) FROM list_items li WHERE li.list_id = l.id) as item_count
     FROM lists l WHERE l.id = $1 AND l.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function update(id: number, userId: number, data: Partial<List>): Promise<List | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 3;

  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (fields.length === 0) return findById(id, userId);

  fields.push('updated_at = NOW()');

  const result = await query<List>(
    `UPDATE lists SET ${fields.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, ...values]
  );
  return result.rows[0] || null;
}

export async function remove(id: number, userId: number): Promise<boolean> {
  const result = await query('DELETE FROM lists WHERE id = $1 AND user_id = $2', [id, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function addItems(listId: number, propertyIds: number[]): Promise<number> {
  if (propertyIds.length === 0) return 0;

  const values = propertyIds.map((_, i) => `($1, $${i + 2})`).join(', ');
  const result = await query(
    `INSERT INTO list_items (list_id, property_id) VALUES ${values}
     ON CONFLICT (list_id, property_id) DO NOTHING`,
    [listId, ...propertyIds]
  );

  await query('UPDATE lists SET updated_at = NOW() WHERE id = $1', [listId]);
  return result.rowCount ?? 0;
}

export async function removeItems(listId: number, itemIds: number[]): Promise<number> {
  if (itemIds.length === 0) return 0;
  const result = await query(
    `DELETE FROM list_items WHERE list_id = $1 AND id = ANY($2)`,
    [listId, itemIds]
  );
  return result.rowCount ?? 0;
}

export async function updateItemStatus(itemId: number, status: string, notes?: string): Promise<ListItem | null> {
  const result = await query<ListItem>(
    `UPDATE list_items SET lead_status = $2::lead_status, notes = COALESCE($3, notes), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [itemId, status, notes || null]
  );
  return result.rows[0] || null;
}

export async function getItems(listId: number, page = 1, limit = 50, statusFilter?: string): Promise<{ items: any[]; total: number }> {
  const offset = (page - 1) * limit;
  const statusClause = statusFilter ? `AND li.lead_status = $4::lead_status` : '';
  const params: any[] = [listId, limit, offset];
  if (statusFilter) params.push(statusFilter);

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM list_items li WHERE li.list_id = $1 ${statusClause}`,
    statusFilter ? [listId, statusFilter] : [listId]
  );

  const result = await query(
    `SELECT li.*,
      p.address_line1, p.city, p.state, p.zip, p.bedrooms, p.bathrooms,
      p.building_sqft, p.estimated_value, p.property_type, p.foreclosure_status,
      o.full_name as owner_name, o.entity_type as owner_type,
      st.phone_numbers, st.email_addresses
     FROM list_items li
     JOIN properties p ON p.id = li.property_id
     LEFT JOIN owners o ON o.property_id = p.id
     LEFT JOIN skip_trace_results st ON st.property_id = p.id
     WHERE li.list_id = $1 ${statusClause}
     ORDER BY li.added_at DESC
     LIMIT $2 OFFSET $3`,
    params
  );

  return {
    items: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

export async function getListStats(listId: number): Promise<any> {
  const result = await query(
    `SELECT lead_status, COUNT(*) as count
     FROM list_items WHERE list_id = $1
     GROUP BY lead_status`,
    [listId]
  );
  return result.rows;
}

export async function exportList(listId: number): Promise<any[]> {
  const result = await query(
    `SELECT
      p.address_line1, p.city, p.state, p.zip, p.county,
      p.bedrooms, p.bathrooms, p.building_sqft, p.lot_size_sqft,
      p.year_built, p.property_type, p.estimated_value, p.assessed_value,
      p.tax_amount, p.last_sale_date, p.last_sale_price,
      p.mortgage_amount, p.foreclosure_status, p.owner_occupied,
      o.full_name as owner_name, o.entity_type as owner_type,
      o.mailing_address, o.mailing_city, o.mailing_state, o.mailing_zip,
      st.phone_numbers, st.email_addresses,
      li.lead_status, li.notes
     FROM list_items li
     JOIN properties p ON p.id = li.property_id
     LEFT JOIN owners o ON o.property_id = p.id
     LEFT JOIN skip_trace_results st ON st.property_id = p.id
     WHERE li.list_id = $1
     ORDER BY li.added_at DESC`,
    [listId]
  );
  return result.rows;
}
