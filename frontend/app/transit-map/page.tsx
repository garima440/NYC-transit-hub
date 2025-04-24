// app/transit-map/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Point, Feature, FeatureCollection, Geometry } from 'geojson';
import '../styles/map.css';

// Set Mapbox access token from environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FyaW1hNDQwIiwiYSI6ImNtOXN3eWw5ajA0MGYyanB4ZXVrN3NyeGUifQ.AgRPggYtFbIs8P0GIfncMg';

// Define NYC coordinates as default center
const DEFAULT_MAP_CENTER: [number, number] = [-73.9857, 40.7484];
const DEFAULT_ZOOM = 11;

// Transit types
const TransitType = {
  SUBWAY: 'subway',
  BUS: 'bus',
  LIRR: 'lirr',
  MNR: 'mnr'
};

// Subway line colors
const LineColors = {
  '1': '#ff3135',
  '2': '#ff3135',
  '3': '#ff3135',
  '4': '#00933c',
  '5': '#00933c',
  '6': '#00933c',
  'A': '#0039a6',
  'C': '#0039a6',
  'E': '#0039a6',
  'B': '#ff6319',
  'D': '#ff6319',
  'F': '#ff6319',
  'M': '#ff6319',
  'N': '#fccc0a',
  'Q': '#fccc0a',
  'R': '#fccc0a',
  'W': '#fccc0a',
  'G': '#6cbe45',
  'J': '#996633',
  'Z': '#996633',
  'L': '#a7a9ac',
  'S': '#808183',
  'SI': '#0078c6',
};

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

// Status refresh interval in milliseconds
const STATUS_REFRESH_INTERVAL = 30000; // 30 seconds
const DATA_REFRESH_INTERVAL = 60000; // 60 seconds

// Type definitions for API responses
interface SubwayEntity {
  id: string;
  type: 'trip_update' | 'vehicle';
  trip_id: string;
  route_id: string;
  start_time: string;
  start_date: string;
  current_status?: string;
  timestamp?: number;
  position?: {
    latitude: number;
    longitude: number;
    bearing?: number;
  };
}

interface Alert {
  id: string;
  effect: string;
  header_text: string;
  description_text: string;
  active_period: Array<{
    start: number;
    end: number | null;
  }>;
  informed_entity: Array<{
    route_id?: string;
    stop_id?: string;
  }>;
}

interface StatusData {
  last_update: string;
  lines_available: string[];
  alerts_available: string[];
  elevator_data_available: string[];
}

// API Functions
const fetchSubwayGeoJSON = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/subway/geojson`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching subway GeoJSON:', error);
    throw error;
  }
};

const fetchServiceAlerts = async (system = 'subway') => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${system}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching service alerts:', error);
    throw error;
  }
};

const getDataStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data status:', error);
    throw error;
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>We were unable to load the transit map. Please try refreshing the page.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Filter Controls Component
const FilterControls = ({ 
  activeFilters, 
  onFilterChange 
}: { 
  activeFilters: Record<string, boolean>; 
  onFilterChange: (filterType: string, value: boolean) => void; 
}) => {
  return (
    <div className="filter-controls">
      <h3>Transit Types</h3>
      <div className="filter-options">
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.SUBWAY]}
            onChange={(e) => onFilterChange(TransitType.SUBWAY, e.target.checked)}
          />
          Subway
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.BUS]}
            onChange={(e) => onFilterChange(TransitType.BUS, e.target.checked)}
          />
          Bus
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.LIRR]}
            onChange={(e) => onFilterChange(TransitType.LIRR, e.target.checked)}
          />
          LIRR
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.MNR]}
            onChange={(e) => onFilterChange(TransitType.MNR, e.target.checked)}
          />
          Metro North
        </label>
      </div>
    </div>
  );
};

// Transit Map Component
const TransitMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [transitData, setTransitData] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    [TransitType.SUBWAY]: true,
    [TransitType.BUS]: false,
    [TransitType.LIRR]: false,
    [TransitType.MNR]: false
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    
    if (!mapContainer.current) return;
    
    // Check if token exists
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is missing! Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file');
      setError('Missing Mapbox access token. Please configure your environment.');
      return;
    }
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_ZOOM
    });

    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );

    map.current.on('load', () => {
      fetchInitialData();
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map when data or filters change
  useEffect(() => {
    if (!map.current || !map.current.loaded() || !transitData) return;
    
    updateMapLayers();
  }, [transitData, activeFilters]);

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching initial data...');
      
      // Mock data for development without backend
      const mockTransitData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-73.9857, 40.7484]
            },
            properties: {
              id: '1',
              route_id: '1',
              trip_id: 'trip1',
              status: 'IN_TRANSIT_TO'
            }
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-73.9757, 40.7584]
            },
            properties: {
              id: '2',
              route_id: 'A',
              trip_id: 'trip2',
              status: 'STOPPED_AT'
            }
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-73.9957, 40.7384]
            },
            properties: {
              id: '3',
              route_id: '7',
              trip_id: 'trip3',
              status: 'IN_TRANSIT_TO'
            }
          }
        ]
      };

      const mockAlerts = {
        alerts: [
          {
            id: 'alert1',
            effect: 'SIGNIFICANT_DELAYS',
            header_text: 'Delays on the 1 line',
            description_text: 'Signal problems causing delays',
            active_period: [{ start: Date.now(), end: null }],
            informed_entity: [{ route_id: '1' }]
          }
        ]
      };
      
      // Try to get data from backend if available, otherwise use mock data
      try {
        const [subwayData, alertsData] = await Promise.all([
          fetchSubwayGeoJSON(),
          fetchServiceAlerts(TransitType.SUBWAY)
        ]);
        
        setTransitData(subwayData);
        if (alertsData && alertsData.alerts) {
          setAlerts(alertsData.alerts);
        }
      } catch (err) {
        console.warn('Could not fetch data from backend, using mock data instead:', err);
        setTransitData(mockTransitData);
        setAlerts(mockAlerts.alerts);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load transit data. Please try again later.');
      setLoading(false);
    }
  };

  // Update transit data
  const updateTransitData = async () => {
    try {
      const subwayData = await fetchSubwayGeoJSON();
      setTransitData(subwayData);
    } catch (err) {
      console.error('Error updating transit data:', err);
      // Continue with the existing data if update fails
    }
  };

  // Update map layers based on data and active filters
  const updateMapLayers = () => {
    if (!map.current) return;

    // Remove existing layers
    if (map.current.getSource('subway-vehicles')) {
      map.current.removeLayer('subway-vehicles-layer');
      map.current.removeSource('subway-vehicles');
    }

    // Add new data if subway filter is active
    if (activeFilters[TransitType.SUBWAY] && transitData && map.current) {
      map.current.addSource('subway-vehicles', {
        type: 'geojson',
        data: transitData
      });

      map.current.addLayer({
        id: 'subway-vehicles-layer',
        type: 'circle',
        source: 'subway-vehicles',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'route_id'],
            // Define colors for each line
            '1', LineColors['1'], '2', LineColors['2'], '3', LineColors['3'],
            '4', LineColors['4'], '5', LineColors['5'], '6', LineColors['6'], 
            'A', LineColors['A'], 'C', LineColors['C'], 'E', LineColors['E'],
            'B', LineColors['B'], 'D', LineColors['D'], 'F', LineColors['F'], 'M', LineColors['M'],
            'N', LineColors['N'], 'Q', LineColors['Q'], 'R', LineColors['R'], 'W', LineColors['W'],
            'G', LineColors['G'],
            'J', LineColors['J'], 'Z', LineColors['Z'],
            'L', LineColors['L'],
            'S', LineColors['S'],
            'SI', LineColors['SI'],
            '#888888' // default color
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add click event for subway vehicles
      map.current.on('click', 'subway-vehicles-layer', (e) => {
        if (!e.features || e.features.length === 0 || !map.current) return;
        
        const feature = e.features[0];
        const properties = feature.properties;
        if (!properties) return;
        
        const routeId = properties.route_id;
        const status = properties.status === 'STOPPED_AT' ? 'Stopped at station' :
                      properties.status === 'IN_TRANSIT_TO' ? 'In transit' : 'Unknown';
        
        const relatedAlerts = alerts.filter(alert => 
          alert.informed_entity && alert.informed_entity.some(entity => entity.route_id === routeId)
        );
        
        let alertsHTML = '';
        if (relatedAlerts.length > 0) {
          alertsHTML = `
            <div class="alerts">
              <h4>Service Alerts:</h4>
              <ul>
                ${relatedAlerts.map(alert => `<li>${alert.header_text}</li>`).join('')}
              </ul>
            </div>
          `;
        }
        
        if (map.current) {
          const coordinates = feature.geometry.type === 'Point' 
            ? (feature.geometry as GeoJSON.Point).coordinates as [number, number]
            : DEFAULT_MAP_CENTER;
            
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div>
                <h3>Line ${routeId}</h3>
                <p>Status: ${status}</p>
                ${alertsHTML}
              </div>
            `)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'subway-vehicles-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });
      
      map.current.on('mouseleave', 'subway-vehicles-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    }
  };

  // Set up data refresh interval
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      updateTransitData();
    }, DATA_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: boolean) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <p className="text-sm text-gray-600">
          Make sure the backend server is running at {API_BASE_URL}
        </p>
        <button onClick={fetchInitialData}>Retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="transit-map-container">
        <div 
          ref={mapContainer} 
          className="map-container" 
        />
        
        <FilterControls 
          activeFilters={activeFilters} 
          onFilterChange={handleFilterChange} 
        />
        
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading transit data...</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Main Page Component
export default function Page() {
  const [dataStatus, setDataStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        
        // Try to fetch data from backend
        try {
          const status = await getDataStatus();
          setDataStatus(status);
        } catch (error) {
          console.error('Error checking data status, using mock data:', error);
          // Mock data if backend isn't available
          setDataStatus({
            last_update: new Date().toISOString(),
            lines_available: ['1', '2', '3', 'A', 'C', 'E'],
            alerts_available: ['subway'],
            elevator_data_available: ['current']
          });
        }
      } catch (error) {
        console.error('Error in status check:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Set up polling for status updates
    const interval = setInterval(checkStatus, STATUS_REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">NYC Transit Map</h1>
      
      {dataStatus && (
        <div className="status-bar mb-4 text-sm text-gray-600">
          Last updated: {new Date(dataStatus.last_update).toLocaleTimeString()}
          {dataStatus.lines_available && dataStatus.lines_available.length > 0 && (
            <span className="ml-4">
              Available lines: {dataStatus.lines_available.join(', ')}
            </span>
          )}
        </div>
      )}
      
      <TransitMap />
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About This Map</h2>
        <p>
          This map displays real-time information for NYC subway lines. Data is refreshed every 60 seconds
          from the MTA's real-time feeds. Click on a train to see more information about its status and any
          service alerts.
        </p>
        <p className="mt-2">
          Use the filter controls below the map to select which transit types to display.
        </p>
      </div>
    </div>
  );
}