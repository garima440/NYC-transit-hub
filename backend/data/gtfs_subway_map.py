# 📁 File: backend/data/gtfs_subway_map.py
import csv
import os
from collections import defaultdict

def load_routes(file_path='data/gtfs_subway/routes.txt'):
    route_colors = {}
    route_names = {}

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            route_id = row['route_id']
            color = row.get('route_color', '888888')
            short_name = row.get('route_short_name', '')
            route_colors[route_id] = f"#{color}"
            route_names[route_id] = short_name

    return route_colors, route_names

def map_shape_to_route(trips_file='data/gtfs_subway/trips.txt'):
    shape_to_route = {}
    with open(trips_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            shape_id = row['shape_id']
            route_id = row['route_id']
            shape_to_route[shape_id] = route_id
    return shape_to_route

def load_shapes(shape_file='data/gtfs_subway/shapes.txt'):
    shapes = defaultdict(list)
    with open(shape_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            shape_id = row['shape_id']
            lat = float(row['shape_pt_lat'])
            lon = float(row['shape_pt_lon'])
            seq = int(row['shape_pt_sequence'])
            shapes[shape_id].append((seq, lon, lat))
    return shapes

def generate_lines_geojson():
    shape_to_route = map_shape_to_route()
    route_colors, route_names = load_routes()
    shapes = load_shapes()

    features = []
    for shape_id, points in shapes.items():
        coords = [coord[1:] for coord in sorted(points)]
        route_id = shape_to_route.get(shape_id)
        if not route_id:
            continue

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            },
            "properties": {
                "shape_id": shape_id,
                "route_id": route_id,
                "route_name": route_names.get(route_id, route_id),
                "color": route_colors.get(route_id, "#888888")
            }
        })

    return {"type": "FeatureCollection", "features": features}

def generate_stops_geojson(stop_file='data/gtfs_subway/stops.txt'):
    features = []
    with open(stop_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                stop_id = row['stop_id']
                lat = float(row['stop_lat'])
                lon = float(row['stop_lon'])
                name = row['stop_name']
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    },
                    "properties": {
                        "stop_id": stop_id,
                        "stop_name": name
                    }
                })
            except Exception as e:
                print(f"Error parsing stop: {e}")

    return {"type": "FeatureCollection", "features": features}
