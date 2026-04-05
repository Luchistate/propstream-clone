import api from './api';

export async function getLists() {
  const res = await api.get('/lists');
  return res.data;
}

export async function createList(data: { name: string; description?: string; list_type?: string; filter_criteria?: any }) {
  const res = await api.post('/lists', data);
  return res.data;
}

export async function getList(id: number) {
  const res = await api.get(`/lists/${id}`);
  return res.data;
}

export async function updateList(id: number, data: { name?: string; description?: string }) {
  const res = await api.put(`/lists/${id}`, data);
  return res.data;
}

export async function deleteList(id: number) {
  const res = await api.delete(`/lists/${id}`);
  return res.data;
}

export async function addItemsToList(listId: number, propertyIds: number[]) {
  const res = await api.post(`/lists/${listId}/items`, { property_ids: propertyIds });
  return res.data;
}

export async function removeItemsFromList(listId: number, itemIds: number[]) {
  const res = await api.delete(`/lists/${listId}/items`, { data: { item_ids: itemIds } });
  return res.data;
}

export async function updateItemStatus(listId: number, itemId: number, status: string, notes?: string) {
  const res = await api.patch(`/lists/${listId}/items/${itemId}`, { status, notes });
  return res.data;
}

export async function getListItems(listId: number, page = 1, limit = 50, status?: string) {
  const params: any = { page, limit };
  if (status) params.status = status;
  const res = await api.get(`/lists/${listId}/items`, { params });
  return res.data;
}

export async function exportList(listId: number) {
  const res = await api.get(`/lists/${listId}/export`, { responseType: 'blob' });
  return res.data;
}
