# backend/data/stop_locations.py
from data.gtfs_parser import load_stop_locations, load_route_colors

# Load stop locations from GTFS data
STOP_LOCATIONS = load_stop_locations()

# Fallback to hardcoded locations if GTFS data is not available or incomplete
HARDCODED_STOPS = {
    # Your existing hardcoded locations
    "101N": [40.7132, -74.0079],  # South Ferry
    # ... other stops ...
}

# Merge the two, preferring GTFS data when available
for stop_id, coords in HARDCODED_STOPS.items():
    if stop_id not in STOP_LOCATIONS:
        STOP_LOCATIONS[stop_id] = coords

# For stops not in our mapping, provide default coordinates
DEFAULT_COORDINATES = [40.7128, -74.0060]  # Lower Manhattan

def get_stop_coordinates(stop_id):
    """Get coordinates for a stop ID or return default coordinates if not found"""
    return STOP_LOCATIONS.get(stop_id, DEFAULT_COORDINATES)

# Load route colors from GTFS data
ROUTE_COLORS = load_route_colors()