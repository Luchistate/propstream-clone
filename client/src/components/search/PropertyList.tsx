import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../../store/searchStore';
import { MapPin, Home, DollarSign } from 'lucide-react';
import './PropertyList.css';

interface Property {
  id: number;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number | null;
  bathrooms: number | null;
  building_sqft: number | null;
  estimated_value: number | null;
  property_type: string;
  foreclosure_status: string;
  owner_occupied: boolean;
}

interface Props {
  properties: Property[];
  total: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

function formatPrice(value: number | null): string {
  if (!value) return 'N/A';
  return '$' + value.toLocaleString();
}

function formatType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function PropertyList({ properties, total, page, pages, onPageChange }: Props) {
  const navigate = useNavigate();
  const { selectMode, selectedPropertyIds, togglePropertySelection } = useSearchStore();

  return (
    <div className="property-list">
      <div className="list-header">
        <span className="list-count">{total.toLocaleString()} properties</span>
      </div>

      <div className="list-items">
        {properties.map((p) => (
          <div
            key={p.id}
            className={`property-row ${selectedPropertyIds.has(p.id) ? 'selected' : ''}`}
            onClick={() => selectMode ? togglePropertySelection(p.id) : navigate(`/property/${p.id}`)}
          >
            {selectMode && (
              <input
                type="checkbox"
                checked={selectedPropertyIds.has(p.id)}
                onChange={() => togglePropertySelection(p.id)}
                onClick={(e) => e.stopPropagation()}
                className="row-checkbox"
              />
            )}
            <div className="row-main">
              <div className="row-address">
                <MapPin size={14} />
                <span>{p.address_line1}</span>
              </div>
              <div className="row-location">{p.city}, {p.state} {p.zip}</div>
            </div>
            <div className="row-details">
              <span className="detail-item">
                <Home size={12} />
                {p.bedrooms ?? '-'}bd / {p.bathrooms ?? '-'}ba
              </span>
              <span className="detail-item">{p.building_sqft?.toLocaleString() ?? '-'} sqft</span>
              <span className="detail-type">{formatType(p.property_type)}</span>
            </div>
            <div className="row-value">
              <DollarSign size={14} />
              <span>{formatPrice(p.estimated_value)}</span>
            </div>
            {p.foreclosure_status !== 'none' && (
              <span className="row-badge-distressed">{formatType(p.foreclosure_status)}</span>
            )}
          </div>
        ))}

        {properties.length === 0 && (
          <div className="empty-list">
            <p>No properties found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="list-pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span className="page-info">Page {page} of {pages}</span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
