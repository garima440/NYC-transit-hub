import sqlite3

def seed_database():
    conn = sqlite3.connect('nyc_transit_hub.db')
    cursor = conn.cursor()
    
    # Insert sample subway routes
    subway_routes = [
        ('1', '1 Train', 'subway', 'FF0000', 'Broadway Local'),
        ('2', '2 Train', 'subway', 'FF0000', 'Broadway Express'),
        ('3', '3 Train', 'subway', 'FF0000', 'Broadway Express'),
        ('4', '4 Train', 'subway', '00FF00', 'Lexington Avenue Express'),
        ('5', '5 Train', 'subway', '00FF00', 'Lexington Avenue Express'),
        ('6', '6 Train', 'subway', '00FF00', 'Lexington Avenue Local')
    ]
    
    cursor.executemany('''
    INSERT OR IGNORE INTO transit_routes (route_id, route_name, route_type, route_color, route_description)
    VALUES (?, ?, ?, ?, ?)
    ''', subway_routes)
    
    # Insert sample stations
    stations = [
        ('101', 'Times Square', 40.755290, -73.987495, True, True, True),
        ('102', 'Grand Central', 40.752726, -73.977229, True, True, True),
        ('103', 'Union Square', 40.734673, -73.989951, True, True, True)
    ]
    
    cursor.executemany('''
    INSERT OR IGNORE INTO stations (station_id, station_name, latitude, longitude, has_elevator, has_escalator, wheelchair_accessible)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', stations)
    
    # Map routes to stations
    route_stations = [
        (1, '1', '101', 1),
        (2, '1', '103', 2),
        (3, '4', '102', 1),
        (4, '4', '103', 2)
    ]
    
    cursor.executemany('''
    INSERT OR IGNORE INTO route_stations (id, route_id, station_id, stop_sequence)
    VALUES (?, ?, ?, ?)
    ''', route_stations)
    
    conn.commit()
    conn.close()
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()