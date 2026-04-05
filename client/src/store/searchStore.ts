import { create } from 'zustand';
import type { SearchParams } from '../services/property.service';

interface SearchState {
  filters: SearchParams;
  view: 'split' | 'map' | 'list';
  selectedPropertyIds: Set<number>;
  selectMode: boolean;

  setFilters: (filters: Partial<SearchParams>) => void;
  clearFilters: () => void;
  setView: (view: 'split' | 'map' | 'list') => void;
  toggleSelectMode: () => void;
  togglePropertySelection: (id: number) => void;
  clearSelection: () => void;
  selectAll: (ids: number[]) => void;
}

const defaultFilters: SearchParams = {
  page: 1,
  limit: 50,
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: { ...defaultFilters },
  view: 'split',
  selectedPropertyIds: new Set(),
  selectMode: false,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
    })),

  clearFilters: () => set({ filters: { ...defaultFilters } }),

  setView: (view) => set({ view }),

  toggleSelectMode: () =>
    set((state) => ({
      selectMode: !state.selectMode,
      selectedPropertyIds: new Set(),
    })),

  togglePropertySelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedPropertyIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedPropertyIds: next };
    }),

  clearSelection: () => set({ selectedPropertyIds: new Set() }),

  selectAll: (ids) => set({ selectedPropertyIds: new Set(ids) }),
}));
