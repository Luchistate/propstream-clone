import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ListChecks, Trash2, Users } from 'lucide-react';
import { getLists, createList, deleteList } from '../services/list.service';
import './ListsPage.css';

export default function ListsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: getLists,
  });

  const createMutation = useMutation({
    mutationFn: () => createList({ name: newName, description: newDesc }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteList,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  const lists = data?.data || [];

  return (
    <div className="lists-page">
      <div className="lists-header">
        <div>
          <h1>Lead Lists</h1>
          <p>Build and manage your motivated seller lists</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New List
        </button>
      </div>

      {showCreate && (
        <div className="create-list-form card">
          <h3>Create New List</h3>
          <div className="form-group">
            <label>List Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Houston Pre-Foreclosures"
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Notes about this list"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim()}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">Loading lists...</div>
      ) : lists.length === 0 ? (
        <div className="empty-state card">
          <ListChecks size={48} />
          <h3>No lists yet</h3>
          <p>Create a list to start organizing your leads. Search for properties and add them to a list.</p>
        </div>
      ) : (
        <div className="lists-grid">
          {lists.map((list: any) => (
            <div key={list.id} className="list-card card" onClick={() => navigate(`/lists/${list.id}`)}>
              <div className="list-card-header">
                <h3>{list.name}</h3>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this list?')) deleteMutation.mutate(list.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {list.description && <p className="list-desc">{list.description}</p>}
              <div className="list-card-stats">
                <Users size={14} />
                <span>{list.item_count || 0} leads</span>
                <span className="list-type">{list.list_type}</span>
              </div>
              <div className="list-date">
                Updated {new Date(list.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
