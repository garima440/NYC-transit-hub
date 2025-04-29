const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default {
  base: API_BASE_URL,
  endpoints: {
    // Subway data endpoints
    subwayAll: `${API_BASE_URL}/api/subway/all`,
    subwayGeoJson: `${API_BASE_URL}/api/subway/geojson`,
    subwayLines: `${API_BASE_URL}/api/subway/lines`,
    subwayStops: `${API_BASE_URL}/api/subway/stops`,
    subwayShapes: `${API_BASE_URL}/api/subway/shapes`,
    subwayByLine: (line: string) => `${API_BASE_URL}/api/subway/${line}`,
    
    // Status endpoints
    status: `${API_BASE_URL}/api/status`,
    alerts: (system: string = 'subway') => `${API_BASE_URL}/api/alerts/${system}`,
    elevator: (statusType: string = 'current') => `${API_BASE_URL}/api/elevator/${statusType}`,
  }
};