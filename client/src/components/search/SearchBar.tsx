import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useSearchStore } from '../../store/searchStore';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { setFilters } = useSearchStore();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Detect if input is a zip code, city/state, or address
    const trimmed = query.trim();
    const zipMatch = trimmed.match(/^\d{5}$/);
    const cityStateMatch = trimmed.match(/^([^,]+),\s*([A-Za-z]{2})$/);

    if (zipMatch) {
      setFilters({ zip: trimmed, city: undefined, state: undefined, address: undefined });
    } else if (cityStateMatch) {
      setFilters({
        city: cityStateMatch[1].trim(),
        state: cityStateMatch[2].trim().toUpperCase(),
        zip: undefined,
        address: undefined,
      });
    } else {
      setFilters({ address: trimmed, zip: undefined, city: undefined, state: undefined });
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <Search size={20} className="search-icon" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search by address, city/state, or zip code (e.g. "Houston, TX" or "77002")'
        className="search-input"
      />
      <button type="submit" className="btn btn-primary btn-sm">
        Search
      </button>
    </form>
  );
}
