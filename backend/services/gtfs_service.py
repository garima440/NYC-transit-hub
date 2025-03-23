import requests
import time
import json
from google.transit import gtfs_realtime_pb2
import sqlite3
import os

class GTFSService:
    BASE_URL = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/'
    
    @staticmethod
    def get_db_connection():
        """Create a database connection"""
        conn = sqlite3.connect('nyc_transit_hub.db')
        conn.row_factory = sqlite3.Row
        return conn
    
    @staticmethod
    def fetch_protobuf_feed(feed_id):
        """Fetch and parse a GTFS protobuf feed"""
        try:
            url = f"{GTFSService.BASE_URL}{feed_id}"
            response = requests.get(url)
            
            if response.status_code != 200:
                print(f"Error fetching feed {feed_id}: {response.status_code}")
                return None
            
            # Parse the protobuf data
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)
            return feed
            
        except Exception as e:
            print(f"Exception fetching feed {feed_id}: {e}")
            return None
    
    @staticmethod
    def fetch_json_feed(feed_id):
        """Fetch and parse a JSON feed"""
        try:
            url = f"{GTFSService.BASE_URL}{feed_id}"
            response = requests.get(url)
            
            if response.status_code != 200:
                print(f"Error fetching JSON feed {feed_id}: {response.status_code}")
                return None
            
            return response.json()
            
        except Exception as e:
            print(f"Exception fetching JSON feed {feed_id}: {e}")
            return None
    
    @staticmethod
    def update_subway_positions():
        """Update subway positions from all subway feeds"""
        subway_feeds = [
            'nyct%2Fgtfs', 'nyct%2Fgtfs-ace', 'nyct%2Fgtfs-bdfm', 
            'nyct%2Fgtfs-g', 'nyct%2Fgtfs-jz', 'nyct%2Fgtfs-l', 
            'nyct%2Fgtfs-nqrw', 'nyct%2Fgtfs-si'
        ]
        
        conn = GTFSService.get_db_connection()
        cursor = conn.cursor()
        
        # Clear current subway positions older than 10 minutes
        current_time = int(time.time())
        ten_minutes_ago = current_time - 600
        cursor.execute('DELETE FROM vehicle_positions WHERE vehicle_type = "subway" AND timestamp < ?', 
                      (ten_minutes_ago,))
        
        vehicles_added = 0
        
        for feed_id in subway_feeds:
            feed = GTFSService.fetch_protobuf_feed(feed_id)
            if not feed:
                continue
            
            for entity in feed.entity:
                if entity.HasField('vehicle'):
                    vehicle = entity.vehicle
                    
                    # Extract data
                    vehicle_id = vehicle.vehicle.id if vehicle.HasField('vehicle') else ''
                    trip_id = vehicle.trip.trip_id if vehicle.HasField('trip') else ''
                    route_id = vehicle.trip.route_id if vehicle.HasField('trip') else ''
                    direction_id = vehicle.trip.direction_id if vehicle.trip.HasField('direction_id') else None
                    
                    # Position data
                    latitude = vehicle.position.latitude if vehicle.HasField('position') else 0
                    longitude = vehicle.position.longitude if vehicle.HasField('position') else 0
                    bearing = vehicle.position.bearing if vehicle.position.HasField('bearing') else None
                    
                    # Status
                    current_status = vehicle.current_status if vehicle.HasField('current_status') else ''
                    current_stop_id = vehicle.stop_id if vehicle.HasField('stop_id') else ''
                    timestamp = vehicle.timestamp if vehicle.HasField('timestamp') else current_time
                    
                    # Insert into database
                    cursor.execute('''
                        INSERT INTO vehicle_positions
                        (vehicle_id, trip_id, route_id, direction_id, 
                         latitude, longitude, bearing, current_status, 
                         current_stop_id, timestamp, vehicle_type)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        vehicle_id, trip_id, route_id, direction_id,
                        latitude, longitude, bearing, str(current_status),
                        current_stop_id, timestamp, "subway"
                    ))
                    vehicles_added += 1
        
        conn.commit()
        conn.close()
        print(f"Updated subway positions at {time.strftime('%Y-%m-%d %H:%M:%S')}, {vehicles_added} vehicles added")
        return vehicles_added
    
    @staticmethod
    def update_trip_updates():
        """Update trip and stop time updates"""
        subway_feeds = [
            'nyct%2Fgtfs', 'nyct%2Fgtfs-ace', 'nyct%2Fgtfs-bdfm', 
            'nyct%2Fgtfs-g', 'nyct%2Fgtfs-jz', 'nyct%2Fgtfs-l', 
            'nyct%2Fgtfs-nqrw', 'nyct%2Fgtfs-si'
        ]
        
        conn = GTFSService.get_db_connection()
        cursor = conn.cursor()
        
        # Clear data older than 10 minutes
        current_time = int(time.time())
        ten_minutes_ago = current_time - 600
        
        cursor.execute('DELETE FROM trip_updates WHERE timestamp < ?', (ten_minutes_ago,))
        cursor.execute('DELETE FROM stop_time_updates WHERE trip_update_id NOT IN (SELECT id FROM trip_updates)')
        
        trips_added = 0
        stops_added = 0
        
        for feed_id in subway_feeds:
            feed = GTFSService.fetch_protobuf_feed(feed_id)
            if not feed:
                continue
            
            for entity in feed.entity:
                if entity.HasField('trip_update'):
                    trip_update = entity.trip_update
                    
                    # Extract trip data
                    trip_id = trip_update.trip.trip_id
                    route_id = trip_update.trip.route_id
                    direction_id = trip_update.trip.direction_id if trip_update.trip.HasField('direction_id') else None
                    start_time = trip_update.trip.start_time if trip_update.trip.HasField('start_time') else ''
                    schedule_relationship = str(trip_update.trip.schedule_relationship) if trip_update.trip.HasField('schedule_relationship') else ''
                    timestamp = trip_update.timestamp if trip_update.HasField('timestamp') else current_time
                    
                    # Insert trip update
                    cursor.execute('''
                        INSERT INTO trip_updates
                        (trip_id, route_id, direction_id, start_time, 
                        schedule_relationship, timestamp, vehicle_type)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        trip_id, route_id, direction_id, start_time,
                        schedule_relationship, timestamp, "subway"
                    ))
                    
                    trip_update_id = cursor.lastrowid
                    trips_added += 1
                    
                    # Process stop time updates - this is a repeated field, so we iterate over it directly
                    for stop_update in trip_update.stop_time_update:
                        stop_id = stop_update.stop_id
                        stop_sequence = stop_update.stop_sequence if stop_update.HasField('stop_sequence') else None
                        
                        arrival_time = None
                        if stop_update.HasField('arrival'):
                            arrival_time = stop_update.arrival.time if stop_update.arrival.HasField('time') else None
                        
                        departure_time = None
                        if stop_update.HasField('departure'):
                            departure_time = stop_update.departure.time if stop_update.departure.HasField('time') else None
                        
                        schedule_relationship = str(stop_update.schedule_relationship) if stop_update.HasField('schedule_relationship') else ''
                        
                        # Insert stop time update
                        cursor.execute('''
                            INSERT INTO stop_time_updates
                            (trip_update_id, stop_id, stop_sequence, 
                            arrival_time, departure_time, schedule_relationship)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (
                            trip_update_id, stop_id, stop_sequence,
                            arrival_time, departure_time, schedule_relationship
                        ))
                        stops_added += 1
        
        conn.commit()
        conn.close()
        print(f"Updated trip and stop information at {time.strftime('%Y-%m-%d %H:%M:%S')}, {trips_added} trips, {stops_added} stops")
        return trips_added, stops_added

    @staticmethod
    def update_alerts():
        """Update service alerts from JSON feeds"""
        alert_feeds = [
            ('camsys%2Fall-alerts.json', 'all'),
            ('camsys%2Fsubway-alerts.json', 'subway'),
            ('camsys%2Fbus-alerts.json', 'bus'),
            ('camsys%2Flirr-alerts.json', 'lirr'),
            ('camsys%2Fmnr-alerts.json', 'mnr')
        ]
        
        conn = GTFSService.get_db_connection()
        cursor = conn.cursor()
        
        # Clear current alerts
        cursor.execute('DELETE FROM alerts')
        cursor.execute('DELETE FROM alert_entities')
        
        alerts_added = 0
        entities_added = 0
        current_time = int(time.time())
        
        for feed_id, alert_type in alert_feeds:
            data = GTFSService.fetch_json_feed(feed_id)
            if not data:
                continue
            
            for alert in data:
                # Get header text and description
                header = ""
                if 'header_text' in alert and 'translations' in alert['header_text']:
                    for translation in alert['header_text']['translations']:
                        if 'text' in translation:
                            header = translation['text']
                            break
                
                description = ""
                if 'description_text' in alert and 'translations' in alert['description_text']:
                    for translation in alert['description_text']['translations']:
                        if 'text' in translation:
                            description = translation['text']
                            break
                
                # Get start and end times
                start_time = 0
                end_time = 0
                if 'active_period' in alert and len(alert['active_period']) > 0:
                    start_time = alert['active_period'][0].get('start', 0)
                    end_time = alert['active_period'][0].get('end', 0)
                
                # Insert alert
                cursor.execute('''
                    INSERT INTO alerts
                    (alert_id, effect, cause, header_text, description_text,
                     start_time, end_time, alert_type, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    alert.get('id', ''),
                    alert.get('effect', ''),
                    alert.get('cause', ''),
                    header,
                    description,
                    start_time,
                    end_time,
                    alert_type,
                    current_time
                ))
                
                alert_id = cursor.lastrowid
                alerts_added += 1
                
                # Process affected entities
                if 'informed_entity' in alert:
                    for entity in alert['informed_entity']:
                        entity_type = 'unknown'
                        entity_id = ''
                        
                        if 'route_id' in entity:
                            entity_type = 'route'
                            entity_id = entity['route_id']
                        elif 'stop_id' in entity:
                            entity_type = 'station'
                            entity_id = entity['stop_id']
                        elif 'agency_id' in entity:
                            entity_type = 'agency'
                            entity_id = entity['agency_id']
                        
                        if entity_id:
                            cursor.execute('''
                                INSERT INTO alert_entities
                                (alert_id, entity_type, entity_id)
                                VALUES (?, ?, ?)
                            ''', (alert_id, entity_type, entity_id))
                            entities_added += 1
        
        conn.commit()
        conn.close()
        print(f"Updated alerts at {time.strftime('%Y-%m-%d %H:%M:%S')}, {alerts_added} alerts, {entities_added} affected entities")
        return alerts_added, entities_added
    
    @staticmethod
    def update_accessibility():
        """Update elevator and escalator data"""
        equipment_url = 'nyct%2Fnyct_ene_equipments.json'
        outages_url = 'nyct%2Fnyct_ene.json'
        upcoming_url = 'nyct%2Fnyct_ene_upcoming.json'
        
        conn = GTFSService.get_db_connection()
        cursor = conn.cursor()
        
        # Get equipment data
        equipment_data = GTFSService.fetch_json_feed(equipment_url)
        if equipment_data:
            # Insert or update equipment
            for equipment in equipment_data:
                cursor.execute('''
                    INSERT OR REPLACE INTO accessibility_equipment
                    (equipment_id, station_id, equipment_type, location, serving)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    equipment.get('equipment_id', ''),
                    equipment.get('station_id', ''),
                    equipment.get('equipment_type', ''),
                    equipment.get('location', ''),
                    equipment.get('serving', '')
                ))
        
        # Clear current outages
        cursor.execute('DELETE FROM accessibility_outages')
        
        current_time = int(time.time())
        outages_added = 0
        
        # Get current outages
        outages_data = GTFSService.fetch_json_feed(outages_url)
        if outages_data:
            for outage in outages_data:
                cursor.execute('''
                    INSERT INTO accessibility_outages
                    (equipment_id, outage_id, reason, outage_start, estimated_return, 
                     is_upcoming, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    outage.get('equipment_id', ''),
                    outage.get('outage_id', ''),
                    outage.get('reason', ''),
                    outage.get('outage_date', 0),  # Note field name might differ in actual API
                    outage.get('estimated_return_date', 0),  # Note field name might differ
                    False,
                    current_time
                ))
                outages_added += 1
        
        # Get upcoming outages
        upcoming_data = GTFSService.fetch_json_feed(upcoming_url)
        if upcoming_data:
            for outage in upcoming_data:
                cursor.execute('''
                    INSERT INTO accessibility_outages
                    (equipment_id, outage_id, reason, outage_start, estimated_return, 
                     is_upcoming, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    outage.get('equipment_id', ''),
                    outage.get('outage_id', ''),
                    outage.get('reason', ''),
                    outage.get('outage_date', 0),  # Note field name might differ in actual API
                    outage.get('estimated_return_date', 0),  # Note field name might differ
                    True,
                    current_time
                ))
                outages_added += 1
        
        conn.commit()
        conn.close()
        print(f"Updated accessibility data at {time.strftime('%Y-%m-%d %H:%M:%S')}, {outages_added} outages")
        return outages_added
    
    @staticmethod
    def debug_json_feeds():
        """Debug the JSON feed structures"""
        import json
        import os
        
        os.makedirs("debug", exist_ok=True)
        
        feeds = [
            'camsys%2Fall-alerts.json',
            'camsys%2Fsubway-alerts.json',
            'camsys%2Fbus-alerts.json',
            'camsys%2Flirr-alerts.json',
            'camsys%2Fmnr-alerts.json',
            'nyct%2Fnyct_ene_equipments.json',
            'nyct%2Fnyct_ene.json',
            'nyct%2Fnyct_ene_upcoming.json'
        ]
        
        for feed_id in feeds:
            data = GTFSService.fetch_json_feed(feed_id)
            if data:
                with open(f"debug/{feed_id.replace('%2F', '_')}", "w") as f:
                    json.dump(data, f, indent=2)
                print(f"Dumped {feed_id} to debug file")
            else:
                print(f"Failed to fetch {feed_id}")