import { useQuery } from '@tanstack/react-query';
import { searchProperties, searchGeoJSON, type SearchParams } from '../services/property.service';

export function usePropertySearch(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: ['properties', 'search', params],
    queryFn: () => searchProperties(params),
    enabled: enabled && Object.keys(params).some(k => k !== 'page' && k !== 'limit'),
    staleTime: 30 * 1000,
  });
}

export function usePropertyGeoJSON(params: Partial<SearchParams>, enabled = true) {
  return useQuery({
    queryKey: ['properties', 'geojson', params],
    queryFn: () => searchGeoJSON(params),
    enabled: enabled && Object.keys(params).length > 0,
    staleTime: 30 * 1000,
  });
}
