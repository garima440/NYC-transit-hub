const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Generic fetch function with error handling
async function fetchApi(endpoint: string, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Transit-specific API functions
export const transitApi = {
  // Get transit system status
  getSystemStatus: () => fetchApi("/api/status"),

  // Get route information
  getRoutes: () => fetchApi("/api/routes"),

  // Get specific route details
  getRouteDetails: (routeId: string) => fetchApi(`/api/routes/${routeId}`),

  // Get station information
  getStations: () => fetchApi("/api/stations"),

  // Get specific station details
  getStationDetails: (stationId: string) =>
    fetchApi(`/api/stations/${stationId}`),
};
