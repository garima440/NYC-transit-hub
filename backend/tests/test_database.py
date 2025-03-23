import sqlite3

def test_database():
    conn = sqlite3.connect('nyc_transit_hub.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("Testing database connections...")
    
    # Test routes
    routes = cursor.execute('SELECT * FROM transit_routes').fetchall()
    print(f"Found {len(routes)} routes:")
    for route in routes:
        print(f" - {route['route_name']} ({route['route_id']})")
    
    # Test stations
    stations = cursor.execute('SELECT * FROM stations').fetchall()
    print(f"\nFound {len(stations)} stations:")
    for station in stations:
        print(f" - {station['station_name']}")
    
    # Test route-station mappings
    mappings = cursor.execute('''
        SELECT r.route_name, s.station_name 
        FROM route_stations rs
        JOIN transit_routes r ON rs.route_id = r.route_id
        JOIN stations s ON rs.station_id = s.station_id
    ''').fetchall()
    
    print(f"\nFound {len(mappings)} route-station mappings:")
    for mapping in mappings:
        print(f" - {mapping['route_name']} stops at {mapping['station_name']}")
    
    conn.close()

if __name__ == "__main__":
    test_database()