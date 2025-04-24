// frontend/app/lib/api.ts

// Define types for API responses
export interface SubwayEntity {
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
  stop_time_updates?: Array<{
    stop_id: string;
    arrival: number | null;
    departure: number | null;
  }>;
}

export interface SubwayData {
  header: {
    timestamp: number;
    version: string;
  };
  entities: SubwayEntity[];
}

export interface AlertPeriod {
  start: number;
  end: number | null;
}

export interface InformedEntity {
  route_id?: string;
  stop_id?: string;
}

export interface Alert {
  id: string;
  effect: string;
  header_text: string;
  description_text: string;
  active_period: AlertPeriod[];
  informed_entity: InformedEntity[];
}

export interface ServiceAlerts {
  header: {
    timestamp: number;
    version: string;
  };
  alerts: Alert[];
}

export interface ElevatorData {
  [key: string]: any; // This would be more specific based on the actual data structure
}

export interface StatusData {
  last_update: string;
  lines_available: string[];
  alerts_available: string[];
  elevator_data_available: string[];
}

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetch subway data for a specific line
 */
export const fetchSubwayData = async (line: string): Promise<SubwayData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subway/${line}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subway data:', error);
    throw error;
  }
};

/**
 * Fetch all subway data as GeoJSON
 */
export const fetchSubwayGeoJSON = async (): Promise<GeoJSON.FeatureCollection> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subway/geojson`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subway GeoJSON:', error);
    throw error;
  }
};

/**
 * Fetch service alerts for a specified system
 */
export const fetchServiceAlerts = async (system: string = 'subway'): Promise<ServiceAlerts> => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${system}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching service alerts:', error);
    throw error;
  }
};

/**
 * Fetch elevator and escalator status
 */
export const fetchElevatorStatus = async (statusType: string = 'current'): Promise<ElevatorData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/elevator/${statusType}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching elevator status:', error);
    throw error;
  }
};

/**
 * Get current data status
 */
export const getDataStatus = async (): Promise<StatusData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data status:', error);
    throw error;
  }
};