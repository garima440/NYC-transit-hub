// frontend/app/types/mapbox-gl.d.ts

// This file ensures TypeScript understands the mapbox-gl module
import * as mapboxgl from 'mapbox-gl';

declare global {
  interface Window {
    mapboxgl: typeof mapboxgl;
  }
}

declare module 'mapbox-gl' {
  export interface MapboxGeoJSONFeature {
    properties: {
      id?: string;
      route_id?: string;
      trip_id?: string;
      status?: string;
      timestamp?: number;
      [key: string]: any;
    };
  }
}