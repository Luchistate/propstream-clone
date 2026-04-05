import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useSearchStore } from '../../store/searchStore';
import './PropertyMap.css';

interface Props {
  geojson: any;
  onBoundsChange?: (bounds: { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number }) => void;
  onPropertyClick?: (id: number) => void;
}

// Token set from env or empty for development
mapboxgl.accessToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';

export default function PropertyMap({ geojson, onBoundsChange, onPropertyClick }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    if (!mapboxgl.accessToken) {
      // Show placeholder if no token
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f1f5f9;color:#64748b;font-size:14px;text-align:center;padding:20px;">
            <div>
              <p style="font-size:18px;font-weight:600;margin-bottom:8px;">Map View</p>
              <p>Set VITE_MAPBOX_TOKEN in your .env to enable the interactive map.</p>
              <p style="margin-top:12px;font-size:12px;">Properties: ${geojson?.features?.length || 0}</p>
            </div>
          </div>
        `;
      }
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.36, 29.76], // Houston default
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      addSourceAndLayers();
    });

    map.current.on('moveend', () => {
      if (!map.current || !onBoundsChange) return;
      const bounds = map.current.getBounds();
      onBoundsChange({
        sw_lat: bounds.getSouth(),
        sw_lng: bounds.getWest(),
        ne_lat: bounds.getNorth(),
        ne_lng: bounds.getEast(),
      });
    });
  }, []);

  function addSourceAndLayers() {
    if (!map.current) return;

    // Remove existing if re-adding
    if (map.current.getSource('properties')) {
      map.current.removeLayer('clusters');
      map.current.removeLayer('cluster-count');
      map.current.removeLayer('unclustered-point');
      map.current.removeSource('properties');
    }

    map.current.addSource('properties', {
      type: 'geojson',
      data: geojson || { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'properties',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          '#3b82f6', 10,
          '#2563eb', 30,
          '#1d4ed8'
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          20, 10,
          30, 30,
          40
        ],
      },
    });

    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'properties',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: { 'text-color': '#ffffff' },
    });

    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'properties',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match', ['get', 'foreclosure'],
          'pre_foreclosure', '#ef4444',
          'auction', '#f59e0b',
          'bank_owned', '#dc2626',
          '#3b82f6'
        ],
        'circle-radius': 7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Click cluster to zoom
    map.current.on('click', 'clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties!.cluster_id;
      (map.current!.getSource('properties') as mapboxgl.GeoJSONSource)
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !zoom) return;
          map.current!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom,
          });
        });
    });

    // Click property for popup
    map.current.on('click', 'unclustered-point', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const coords = (feature.geometry as any).coordinates.slice();
      const props = feature.properties!;

      if (popup.current) popup.current.remove();

      popup.current = new mapboxgl.Popup({ offset: 15, maxWidth: '280px' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family:system-ui;font-size:13px;">
            <strong style="font-size:14px;">${props.address}</strong>
            <div style="color:#6b7280;margin:4px 0;">${props.city}, ${props.state} ${props.zip}</div>
            <div style="display:flex;gap:12px;margin:8px 0;">
              <span>${props.bedrooms || '-'}bd / ${props.bathrooms || '-'}ba</span>
              <span>${props.sqft ? Number(props.sqft).toLocaleString() + ' sqft' : ''}</span>
            </div>
            <div style="font-size:16px;font-weight:700;color:#16a34a;">
              ${props.value ? '$' + Number(props.value).toLocaleString() : 'N/A'}
            </div>
            <button onclick="window.__viewProperty(${props.id})" style="margin-top:8px;padding:6px 12px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">
              View Details
            </button>
          </div>
        `)
        .addTo(map.current!);
    });

    // Cursor changes
    map.current.on('mouseenter', 'clusters', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current!.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = '';
    });
  }

  // Setup global click handler for popup buttons
  useEffect(() => {
    (window as any).__viewProperty = (id: number) => {
      onPropertyClick?.(id);
    };
    return () => { delete (window as any).__viewProperty; };
  }, [onPropertyClick]);

  useEffect(() => {
    initMap();
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update data when geojson changes
  useEffect(() => {
    if (!map.current || !geojson) return;

    if (map.current.isStyleLoaded()) {
      const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geojson);
      } else {
        addSourceAndLayers();
      }
    }
  }, [geojson]);

  return <div ref={mapContainer} className="property-map" />;
}
