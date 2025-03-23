import sqlite3
import datetime

def create_database():
    conn = sqlite3.connect('nyc_transit_hub.db')
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        preferred_language TEXT DEFAULT 'en'
    )
    ''')
    
    # Create Transit Routes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transit_routes (
        route_id TEXT PRIMARY KEY,
        route_name TEXT NOT NULL,
        route_type TEXT NOT NULL,
        route_color TEXT,
        route_description TEXT
    )
    ''')
    
    # Create Stations table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS stations (
        station_id TEXT PRIMARY KEY,
        station_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        has_elevator BOOLEAN DEFAULT FALSE,
        has_escalator BOOLEAN DEFAULT FALSE,
        wheelchair_accessible BOOLEAN DEFAULT FALSE
    )
    ''')
    
    # Create Route-Station Mapping table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS route_stations (
        id INTEGER PRIMARY KEY,
        route_id TEXT NOT NULL,
        station_id TEXT NOT NULL,
        stop_sequence INTEGER NOT NULL,
        FOREIGN KEY (route_id) REFERENCES transit_routes(route_id),
        FOREIGN KEY (station_id) REFERENCES stations(station_id),
        UNIQUE(route_id, station_id, stop_sequence)
    )
    ''')
    
    # Create Service Status table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS service_status (
        status_id INTEGER PRIMARY KEY,
        route_id TEXT NOT NULL,
        status_type TEXT NOT NULL,
        status_description TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (route_id) REFERENCES transit_routes(route_id)
    )
    ''')
    
    # Create User Favorites table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_favorites (
        favorite_id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        favorite_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        UNIQUE(user_id, favorite_type, item_id)
    )
    ''')
    
    # Create User Alerts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_alerts (
        alert_id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        route_id TEXT,
        station_id TEXT,
        alert_type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (route_id) REFERENCES transit_routes(route_id),
        FOREIGN KEY (station_id) REFERENCES stations(station_id)
    )
    ''')
    
    # Create Elevator/Escalator Status table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS accessibility_status (
        status_id INTEGER PRIMARY KEY,
        station_id TEXT NOT NULL,
        equipment_id TEXT NOT NULL,
        equipment_type TEXT NOT NULL,
        is_operational BOOLEAN DEFAULT TRUE,
        reason_if_down TEXT,
        estimated_fix_date TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(station_id)
    )
    ''')
    
    # Create Schedules table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS schedules (
        schedule_id INTEGER PRIMARY KEY,
        route_id TEXT NOT NULL,
        station_id TEXT NOT NULL,
        arrival_time TIMESTAMP NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        direction TEXT NOT NULL,
        trip_id TEXT,
        FOREIGN KEY (route_id) REFERENCES transit_routes(route_id),
        FOREIGN KEY (station_id) REFERENCES stations(station_id)
    )
    ''')
    
    # Create Service Announcements table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS service_announcements (
        announcement_id INTEGER PRIMARY KEY,
        route_id TEXT,
        station_id TEXT,
        announcement_text TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (route_id) REFERENCES transit_routes(route_id),
        FOREIGN KEY (station_id) REFERENCES stations(station_id)
    )
    ''')

    # Create Vehicle Positions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS vehicle_positions (
        id INTEGER PRIMARY KEY,
        vehicle_id TEXT NOT NULL,
        trip_id TEXT,
        route_id TEXT NOT NULL,
        direction_id INTEGER,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        bearing REAL,
        current_status TEXT,
        current_stop_id TEXT,
        timestamp INTEGER NOT NULL,
        vehicle_type TEXT NOT NULL,
        FOREIGN KEY (route_id) REFERENCES transit_routes(route_id)
    )
    ''')

    # Create Trip Updates table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trip_updates (
        id INTEGER PRIMARY KEY,
        trip_id TEXT NOT NULL,
        route_id TEXT NOT NULL,
        direction_id INTEGER,
        start_time TEXT,
        schedule_relationship TEXT,
        timestamp INTEGER NOT NULL,
        vehicle_type TEXT NOT NULL,
        FOREIGN KEY (route_id) REFERENCES transit_routes(route_id)
    )
    ''')

    # Create Stop Time Updates table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS stop_time_updates (
        id INTEGER PRIMARY KEY,
        trip_update_id INTEGER NOT NULL,
        stop_id TEXT NOT NULL,
        stop_sequence INTEGER,
        arrival_time INTEGER,
        departure_time INTEGER,
        schedule_relationship TEXT,
        FOREIGN KEY (trip_update_id) REFERENCES trip_updates(id),
        FOREIGN KEY (stop_id) REFERENCES stations(station_id)
    )
    ''')

    # Create Alerts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY,
        alert_id TEXT NOT NULL,
        effect TEXT NOT NULL,
        cause TEXT,
        header_text TEXT,
        description_text TEXT,
        start_time INTEGER,
        end_time INTEGER,
        alert_type TEXT NOT NULL,
        last_updated INTEGER NOT NULL
    )
    ''')

    # Create Alert-Entity Relations table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alert_entities (
        id INTEGER PRIMARY KEY,
        alert_id INTEGER NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        FOREIGN KEY (alert_id) REFERENCES alerts(id)
    )
    ''')

    # Create Elevator/Escalator Status table (more detailed version)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS accessibility_equipment (
        id INTEGER PRIMARY KEY,
        equipment_id TEXT NOT NULL UNIQUE,
        station_id TEXT NOT NULL,
        equipment_type TEXT NOT NULL,
        location TEXT,
        serving TEXT,
        FOREIGN KEY (station_id) REFERENCES stations(station_id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS accessibility_outages (
        id INTEGER PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        outage_id TEXT NOT NULL UNIQUE,
        reason TEXT,
        outage_start INTEGER NOT NULL,
        estimated_return INTEGER,
        is_upcoming BOOLEAN DEFAULT FALSE,
        last_updated INTEGER NOT NULL,
        FOREIGN KEY (equipment_id) REFERENCES accessibility_equipment(equipment_id)
    )
    ''')
    
    conn.commit()
    conn.close()
    
    print("Database created successfully!")

if __name__ == "__main__":
    create_database()