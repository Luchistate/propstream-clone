import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useSearchStore } from '../../store/searchStore';
import './FilterPanel.css';

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterGroup({ title, children, defaultOpen = false }: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-group">
      <button className="filter-group-header" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>{title}</span>
      </button>
      {open && <div className="filter-group-content">{children}</div>}
    </div>
  );
}

function RangeFilter({ label, minKey, maxKey, prefix = '' }: {
  label: string; minKey: string; maxKey: string; prefix?: string;
}) {
  const { filters, setFilters } = useSearchStore();
  return (
    <div className="filter-range">
      <label className="filter-label">{label}</label>
      <div className="range-inputs">
        <input
          type="number"
          placeholder={`${prefix}Min`}
          value={(filters as any)[minKey] ?? ''}
          onChange={(e) => setFilters({ [minKey]: e.target.value ? Number(e.target.value) : undefined })}
        />
        <span>to</span>
        <input
          type="number"
          placeholder={`${prefix}Max`}
          value={(filters as any)[maxKey] ?? ''}
          onChange={(e) => setFilters({ [maxKey]: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </div>
  );
}

function BooleanFilter({ label, filterKey }: { label: string; filterKey: string }) {
  const { filters, setFilters } = useSearchStore();
  const value = (filters as any)[filterKey];
  return (
    <label className="filter-checkbox">
      <input
        type="checkbox"
        checked={value === true}
        onChange={(e) => setFilters({ [filterKey]: e.target.checked ? true : undefined })}
      />
      <span>{label}</span>
    </label>
  );
}

function SelectFilter({ label, filterKey, options }: {
  label: string; filterKey: string; options: { value: string; label: string }[];
}) {
  const { filters, setFilters } = useSearchStore();
  return (
    <div className="filter-select">
      <label className="filter-label">{label}</label>
      <select
        value={(filters as any)[filterKey] ?? ''}
        onChange={(e) => setFilters({ [filterKey]: e.target.value || undefined })}
      >
        <option value="">Any</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel() {
  const { filters, clearFilters } = useSearchStore();
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v !== undefined && k !== 'page' && k !== 'limit'
  ).length;

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters {activeCount > 0 && <span className="filter-count">{activeCount}</span>}</h3>
        {activeCount > 0 && (
          <button className="clear-filters" onClick={clearFilters}>
            <X size={14} /> Clear All
          </button>
        )}
      </div>

      <div className="filter-groups">
        <FilterGroup title="Property Type" defaultOpen>
          <SelectFilter
            label="Type"
            filterKey="property_type"
            options={[
              { value: 'single_family', label: 'Single Family' },
              { value: 'multi_family', label: 'Multi Family' },
              { value: 'condo', label: 'Condo' },
              { value: 'townhouse', label: 'Townhouse' },
              { value: 'manufactured', label: 'Manufactured' },
              { value: 'land', label: 'Land' },
              { value: 'commercial', label: 'Commercial' },
            ]}
          />
        </FilterGroup>

        <FilterGroup title="Financial" defaultOpen>
          <RangeFilter label="Estimated Value" minKey="min_value" maxKey="max_value" prefix="$" />
          <RangeFilter label="Equity %" minKey="min_equity_percent" maxKey="max_equity_percent" />
        </FilterGroup>

        <FilterGroup title="Physical">
          <RangeFilter label="Bedrooms" minKey="min_beds" maxKey="max_beds" />
          <RangeFilter label="Bathrooms" minKey="min_baths" maxKey="max_baths" />
          <RangeFilter label="Sq Ft" minKey="min_sqft" maxKey="max_sqft" />
          <RangeFilter label="Year Built" minKey="min_year_built" maxKey="max_year_built" />
          <RangeFilter label="Lot Size (sqft)" minKey="min_lot_sqft" maxKey="max_lot_sqft" />
        </FilterGroup>

        <FilterGroup title="Owner">
          <BooleanFilter label="Owner Occupied" filterKey="owner_occupied" />
          <BooleanFilter label="Absentee Owner" filterKey="absentee_owner" />
          <BooleanFilter label="Corporate Owned" filterKey="corporate_owned" />
          <RangeFilter label="Years Owned" minKey="min_years_owned" maxKey="max_years_owned" />
        </FilterGroup>

        <FilterGroup title="Distressed">
          <SelectFilter
            label="Foreclosure Status"
            filterKey="foreclosure_status"
            options={[
              { value: 'pre_foreclosure', label: 'Pre-Foreclosure' },
              { value: 'auction', label: 'Auction' },
              { value: 'bank_owned', label: 'Bank Owned / REO' },
            ]}
          />
          <BooleanFilter label="Tax Delinquent" filterKey="tax_delinquent" />
          <BooleanFilter label="Vacant" filterKey="vacant" />
        </FilterGroup>
      </div>
    </div>
  );
}
