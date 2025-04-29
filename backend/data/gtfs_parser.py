# backend/data/gtfs_parser.py
import csv
import os
from collections import defaultdict

def load_stop_locations(file_path='data/gtfs_subway/stops.txt'):
    """Load stop locations from GTFS stops.txt file"""
    stop_locations = {}
    
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found. Using default stop locations.")
        return stop_locations
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    stop_id = row['stop_id']
                    lat = float(row['stop_lat'])
                    lon = float(row['stop_lon'])
                    stop_locations[stop_id] = [lat, lon]
                except (ValueError, KeyError) as e:
                    print(f"Error parsing stop {row.get('stop_id', 'unknown')}: {e}")
    except Exception as e:
        print(f"Error loading stops.txt: {e}")
    
    print(f"Loaded {len(stop_locations)} stop locations from GTFS data")
    return stop_locations

def load_route_colors(file_path='data/gtfs_sabway/routes.txt'):
    """Load route colors from GTFS routes.txt file"""
    route_colors = {}
    
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found. Using default route colors.")
        return route_colors
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    route_id = row['route_id']
                    color = row.get('route_color', '')
                    if color:
                        route_colors[route_id] = f"#{color}"
                except (KeyError) as e:
                    print(f"Error parsing route {row.get('route_id', 'unknown')}: {e}")
    except Exception as e:
        print(f"Error loading routes.txt: {e}")
    
    print(f"Loaded {len(route_colors)} route colors from GTFS data")
    return route_colors

def load_shapes(file_path='data/gtfs_subway/shapes.txt'):
    """
    Load and group GTFS shape points into LineStrings by shape_id.
    Returns a list of GeoJSON features.
    """
    if not os.path.exists(file_path):
        print(f"shapes.txt not found at {file_path}")
        return []

    shapes = defaultdict(list)

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                shape_id = row['shape_id']
                lat = float(row['shape_pt_lat'])
                lon = float(row['shape_pt_lon'])
                seq = int(row['shape_pt_sequence'])
                shapes[shape_id].append((seq, lon, lat))
            except Exception as e:
                print(f"Error parsing shape row: {e}")

    features = []
    for shape_id, points in shapes.items():
        sorted_points = [coord[1:] for coord in sorted(points)]
        features.append({
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': sorted_points
            },
            'properties': {
                'shape_id': shape_id
            }
        })

    return {
        'type': 'FeatureCollection',
        'features': features
    }
