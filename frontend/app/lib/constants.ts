// frontend/app/lib/constants.ts

// Define subway line color mapping
export const LineColors: Record<string, string> = {
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
  
  /**
   * Get color for a subway route
   */
  export const getRouteColor = (routeId: string): string => {
    return LineColors[routeId] || '#888888';
  };
  
  /**
   * Get station icon based on transfer status
   */
  export const getStationIcon = (isTransfer: boolean): string => {
    return isTransfer ? 'station-transfer' : 'station';
  };
  
  // Transit types
  export enum TransitType {
    SUBWAY = 'subway',
    BUS = 'bus',
    LIRR = 'lirr',
    MNR = 'mnr'
  }
  
  // Map default settings
  export const DEFAULT_MAP_CENTER: [number, number] = [-73.9857, 40.7484]; // NYC coordinates
  export const DEFAULT_ZOOM = 11;
  
  // Refresh intervals (milliseconds)
  export const DATA_REFRESH_INTERVAL = 60000; // 60 seconds
  export const STATUS_REFRESH_INTERVAL = 30000; // 30 seconds