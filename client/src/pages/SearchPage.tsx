import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, List, CheckSquare, LayoutGrid } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';
import { usePropertySearch, usePropertyGeoJSON } from '../hooks/usePropertySearch';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import PropertyList from '../components/search/PropertyList';
import PropertyMap from '../components/map/PropertyMap';
import './SearchPage.css';

export default function SearchPage() {
  const navigate = useNavigate();
  const { filters, view, setView, setFilters, selectMode, toggleSelectMode, selectedPropertyIds } = useSearchStore();

  const { data: searchData, isLoading } = usePropertySearch(filters);
  const { data: geoData } = usePropertyGeoJSON(filters);

  const properties = searchData?.data?.properties || [];
  const pagination = searchData?.data?.pagination || { total: 0, page: 1, pages: 0 };
  const geojson = geoData?.data || { type: 'FeatureCollection', features: [] };

  const handleBoundsChange = useCallback((bounds: any) => {
    // Only update if we don't already have a location filter
    if (!filters.zip && !filters.city && !filters.address) {
      setFilters(bounds);
    }
  }, [filters.zip, filters.city, filters.address]);

  const handlePropertyClick = useCallback((id: number) => {
    navigate(`/property/${id}`);
  }, [navigate]);

  return (
    <div className="search-page">
      <div className="search-toolbar">
        <SearchBar />
        <div className="toolbar-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'split' ? 'active' : ''}`}
              onClick={() => setView('split')}
              title="Split View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`toggle-btn ${view === 'map' ? 'active' : ''}`}
              onClick={() => setView('map')}
              title="Map View"
            >
              <Map size={16} />
            </button>
            <button
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
          <button
            className={`btn btn-sm ${selectMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={toggleSelectMode}
          >
            <CheckSquare size={14} />
            {selectMode ? `${selectedPropertyIds.size} selected` : 'Select'}
          </button>
        </div>
      </div>

      <div className="search-body">
        <FilterPanel />

        <div className="search-content">
          {(view === 'split' || view === 'map') && (
            <div className={`map-panel ${view === 'map' ? 'full' : ''}`}>
              <PropertyMap
                geojson={geojson}
                onBoundsChange={handleBoundsChange}
                onPropertyClick={handlePropertyClick}
              />
            </div>
          )}

          {(view === 'split' || view === 'list') && (
            <div className={`list-panel ${view === 'list' ? 'full' : ''}`}>
              {isLoading ? (
                <div className="loading-state">Searching properties...</div>
              ) : (
                <PropertyList
                  properties={properties}
                  total={pagination.total}
                  page={pagination.page}
                  pages={pagination.pages}
                  onPageChange={(page) => setFilters({ page })}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
