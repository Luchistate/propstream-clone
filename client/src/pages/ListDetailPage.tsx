import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, Trash2, Phone, Mail } from 'lucide-react';
import { getList, getListItems, updateItemStatus, removeItemsFromList, exportList } from '../services/list.service';
import './ListDetailPage.css';

const STATUSES = ['new', 'contacted', 'callback', 'qualified', 'not_interested', 'closed', 'dead'];

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const listId = Number(id);

  const { data: listData } = useQuery({
    queryKey: ['list', listId],
    queryFn: () => getList(listId),
  });

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['list-items', listId, page, statusFilter],
    queryFn: () => getListItems(listId, page, 50, statusFilter || undefined),
  });

  const statusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: string }) =>
      updateItemStatus(listId, itemId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', listId] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemIds: number[]) => removeItemsFromList(listId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] });
      queryClient.invalidateQueries({ queryKey: ['list', listId] });
    },
  });

  const handleExport = async () => {
    const blob = await exportList(listId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list?.name || 'list'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const list = listData?.data;
  const items = itemsData?.data?.items || [];
  const pagination = itemsData?.data?.pagination || { total: 0, pages: 0 };

  return (
    <div className="list-detail-page">
      <div className="list-detail-header">
        <button className="back-btn" onClick={() => navigate('/lists')}>
          <ArrowLeft size={20} />
        </button>
        <div className="list-detail-info">
          <h1>{list?.name || 'Loading...'}</h1>
          {list?.description && <p>{list.description}</p>}
        </div>
        <div className="list-detail-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {list?.stats && (
        <div className="status-stats">
          {list.stats.map((s: any) => (
            <button
              key={s.lead_status}
              className={`status-stat ${statusFilter === s.lead_status ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === s.lead_status ? '' : s.lead_status)}
            >
              <span className={`badge badge-${s.lead_status}`}>{s.lead_status.replace(/_/g, ' ')}</span>
              <span className="status-count">{s.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="items-table-container">
        {isLoading ? (
          <div className="loading-state">Loading leads...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>No leads in this list yet. Search for properties and add them.</p>
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Owner</th>
                <th>Beds/Baths</th>
                <th>Value</th>
                <th>Contact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} onClick={() => navigate(`/property/${item.property_id}`)}>
                  <td>
                    <div className="item-address">{item.address_line1}</div>
                    <div className="item-location">{item.city}, {item.state} {item.zip}</div>
                  </td>
                  <td>{item.owner_name || '-'}</td>
                  <td>{item.bedrooms ?? '-'} / {item.bathrooms ?? '-'}</td>
                  <td className="item-value">
                    {item.estimated_value ? '$' + Number(item.estimated_value).toLocaleString() : '-'}
                  </td>
                  <td className="item-contact">
                    {item.phone_numbers?.length > 0 && <Phone size={12} className="has-contact" />}
                    {item.email_addresses?.length > 0 && <Mail size={12} className="has-contact" />}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.lead_status}
                      onChange={(e) => statusMutation.mutate({ itemId: item.id, status: e.target.value })}
                      className={`status-select status-${item.lead_status}`}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="delete-btn"
                      onClick={() => removeMutation.mutate([item.id])}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.pages > 1 && (
          <div className="table-pagination">
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <span>Page {page} of {pagination.pages} ({pagination.total} leads)</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
