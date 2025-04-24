# backend/services/mta_service.py
import requests
from google.transit import gtfs_realtime_pb2
import json
import time
import xml.etree.ElementTree as ET
from config.config import API_BASE_URL, SUBWAY_FEEDS, SERVICE_ALERTS, ELEVATOR_FEEDS

class MTAService:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.headers = {}  # No API key needed
    
    def fetch_subway_feed(self, line):
        """Fetch subway real-time feed for a specific line"""
        if line not in SUBWAY_FEEDS:
            raise ValueError(f"Invalid subway line: {line}")
            
        try:
            url = f"{self.base_url}{SUBWAY_FEEDS[line]}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200:
                raise Exception(f"API returned status code {response.status_code}")
                
            # Parse the protobuf data
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)
            
            # Debugging output for first vehicle entity
            for entity in feed.entity:
                if entity.HasField('vehicle'):
                    print(f"\nRAW VEHICLE DATA from {line}:")
                    print(f"ID: {entity.id}")
                    print(f"Vehicle trip route_id: {entity.vehicle.trip.route_id}")
                    print(f"Has position field: {entity.vehicle.HasField('position')}")
                    if entity.vehicle.HasField('position'):
                        print(f"Position: {entity.vehicle.position.latitude}, {entity.vehicle.position.longitude}")
                    print(f"Current status: {entity.vehicle.current_status}")
                    print(f"Stop ID: {entity.vehicle.stop_id if entity.vehicle.HasField('stop_id') else 'None'}")
                    break
            
            return self._parse_subway_feed(feed)
        except Exception as e:
            print(f"Error fetching subway data for {line}: {str(e)}")
            raise
    
    def fetch_all_subway_data(self):
        """Fetch and combine data from all subway feeds"""
        all_entities = []
        
        for line, feed_url in SUBWAY_FEEDS.items():
            try:
                print(f"Fetching data for {line}...")
                data = self.fetch_subway_feed(line)
                
                # Print a sample entity if this is the first line with data
                if not all_entities and data.get('entities'):
                    print(f"\nSAMPLE DATA STRUCTURE from {line}:")
                    # Find a vehicle with position data if possible
                    sample_entity = None
                    for e in data.get('entities', []):
                        if e.get('type') == 'vehicle' and e.get('position'):
                            sample_entity = e
                            break
                    
                    if not sample_entity and data.get('entities'):
                        sample_entity = data.get('entities')[0]
                    
                    if sample_entity:
                        print(json.dumps(sample_entity, indent=2))
                        print("\n")
                
                vehicle_count = len([e for e in data.get('entities', []) if e.get('type') == 'vehicle'])
                trip_update_count = len([e for e in data.get('entities', []) if e.get('type') == 'trip_update'])
                vehicles_with_position = len([e for e in data.get('entities', []) 
                                            if e.get('type') == 'vehicle' and e.get('position')])
                
                print(f"Retrieved {len(data.get('entities', []))} entities from {line}:")
                print(f"  - {vehicle_count} vehicles ({vehicles_with_position} with position)")
                print(f"  - {trip_update_count} trip updates")
                
                all_entities.extend(data.get('entities', []))
            except Exception as e:
                print(f"Failed to retrieve data for {line}: {str(e)}")
        
        return {
            'header': {
                'timestamp': int(time.time()),
                'version': '2.0'
            },
            'entities': all_entities
        }
    
    def _parse_subway_feed(self, feed):
        """Parse the protobuf feed into a more usable format"""
        result = {
            'header': {
                'timestamp': feed.header.timestamp,
                'version': feed.header.gtfs_realtime_version
            },
            'entities': []
        }
        
        for entity in feed.entity:
            if entity.HasField('trip_update'):
                parsed_entity = self._parse_trip_update(entity)
                result['entities'].append(parsed_entity)
            elif entity.HasField('vehicle'):
                parsed_entity = self._parse_vehicle_position(entity)
                result['entities'].append(parsed_entity)
                
        return result
    
    def _parse_trip_update(self, entity):
        """Parse trip update information"""
        trip_update = entity.trip_update
        result = {
            'id': entity.id,
            'type': 'trip_update',
            'trip_id': trip_update.trip.trip_id,
            'route_id': trip_update.trip.route_id,
            'start_time': trip_update.trip.start_time,
            'start_date': trip_update.trip.start_date,
            'stop_time_updates': []
        }
        
        for stop_time_update in trip_update.stop_time_update:
            update = {
                'stop_id': stop_time_update.stop_id,
                'arrival': None,
                'departure': None
            }
            
            if stop_time_update.HasField('arrival'):
                update['arrival'] = stop_time_update.arrival.time
                
            if stop_time_update.HasField('departure'):
                update['departure'] = stop_time_update.departure.time
                
            result['stop_time_updates'].append(update)
            
        return result
    
    def _parse_vehicle_position(self, entity):
        """Parse vehicle position information"""
        vehicle = entity.vehicle
        result = {
            'id': entity.id,
            'type': 'vehicle',
            'trip_id': vehicle.trip.trip_id,
            'route_id': vehicle.trip.route_id,
            'start_time': vehicle.trip.start_time,
            'start_date': vehicle.trip.start_date,
            'current_status': vehicle.current_status,
            'timestamp': vehicle.timestamp,
            'position': None
        }
        
        if vehicle.HasField('position'):
            result['position'] = {
                'latitude': vehicle.position.latitude,
                'longitude': vehicle.position.longitude,
                'bearing': vehicle.position.bearing if vehicle.position.HasField('bearing') else None
            }
            
        return result
    
    def to_geojson(self, subway_data):
        """Convert subway data to GeoJSON for map display"""
        features = []
        
        # First, let's analyze what we're dealing with
        total_entities = len(subway_data.get('entities', []))
        trip_updates = 0
        vehicles = 0
        vehicles_with_position = 0
        
        for entity in subway_data.get('entities', []):
            if entity.get('type') == 'trip_update':
                trip_updates += 1
            elif entity.get('type') == 'vehicle':
                vehicles += 1
                if entity.get('position') and 'latitude' in entity.get('position', {}) and 'longitude' in entity.get('position', {}):
                    vehicles_with_position += 1
                    
                    # Convert to GeoJSON
                    try:
                        lat = entity['position']['latitude']
                        lng = entity['position']['longitude']
                        
                        feature = {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [lng, lat]
                            },
                            'properties': {
                                'id': entity['id'],
                                'route_id': entity['route_id'],
                                'status': entity.get('current_status'),
                                'trip_id': entity.get('trip_id')
                            }
                        }
                        features.append(feature)
                    except Exception as e:
                        print(f"Error creating GeoJSON feature: {e}")
        
        print(f"Data analysis: {total_entities} total entities, {trip_updates} trip updates, {vehicles} vehicles, {vehicles_with_position} vehicles with position")
        print(f"Created {len(features)} GeoJSON features")
        
        # If we're not getting any position data, create mock data for testing
        if len(features) == 0:
            print("No position data found. Creating mock data for testing...")
            
            # Create sample points for major subway lines in NYC
            mock_data = [
                {"route_id": "A", "lat": 40.7127, "lng": -74.0134},  # Downtown Manhattan
                {"route_id": "C", "lat": 40.7831, "lng": -73.9712},  # Upper West Side
                {"route_id": "E", "lat": 40.7506, "lng": -73.9894},  # Midtown
                {"route_id": "1", "lat": 40.7590, "lng": -73.9845},  # Times Square
                {"route_id": "2", "lat": 40.7359, "lng": -73.9911},  # Lower Manhattan
                {"route_id": "3", "lat": 40.8230, "lng": -73.9478},  # Harlem
                {"route_id": "4", "lat": 40.7545, "lng": -73.9836},  # Grand Central
                {"route_id": "5", "lat": 40.7156, "lng": -74.0090},  # Wall Street
                {"route_id": "6", "lat": 40.7823, "lng": -73.9493},  # Upper East Side
                {"route_id": "B", "lat": 40.7687, "lng": -73.9816},  # Central Park
                {"route_id": "D", "lat": 40.7038, "lng": -74.0139},  # Financial District
                {"route_id": "F", "lat": 40.7233, "lng": -73.9895},  # East Village
                {"route_id": "M", "lat": 40.7007, "lng": -73.9586},  # Williamsburg
                {"route_id": "N", "lat": 40.7450, "lng": -73.9880},  # 34th Street
                {"route_id": "Q", "lat": 40.7753, "lng": -73.9553},  # 2nd Avenue
                {"route_id": "R", "lat": 40.7484, "lng": -73.9857},  # Herald Square
                {"route_id": "L", "lat": 40.7411, "lng": -73.9897},  # Union Square
                {"route_id": "G", "lat": 40.6895, "lng": -73.9751},  # Brooklyn
                {"route_id": "J", "lat": 40.7062, "lng": -73.9986},  # Lower East Side
                {"route_id": "Z", "lat": 40.7192, "lng": -73.9884},  # Chinatown
            ]
            
            for item in mock_data:
                feature = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [item["lng"], item["lat"]]
                    },
                    'properties': {
                        'id': f"mock_{item['route_id']}",
                        'route_id': item["route_id"],
                        'status': "MOCK_DATA",
                        'trip_id': f"mock_trip_{item['route_id']}"
                    }
                }
                features.append(feature)
            
            print(f"Added {len(mock_data)} mock features for testing")
        
        return {
            'type': 'FeatureCollection',
            'features': features
        }
    
    def fetch_all_subway_geojson(self):
        """Fetch all subway data and convert directly to GeoJSON"""
        subway_data = self.fetch_all_subway_data()
        return self.to_geojson(subway_data)
    
    def fetch_service_alerts(self, system='subway'):
        """Fetch service alerts for the specified system"""
        if system not in SERVICE_ALERTS:
            raise ValueError(f"Invalid system: {system}")
            
        try:
            # Try to get JSON format first
            url = f"{self.base_url}{SERVICE_ALERTS[system]}.json"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                return response.json()
            
            # Fall back to protobuf format
            url = f"{self.base_url}{SERVICE_ALERTS[system]}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200:
                raise Exception(f"API returned status code {response.status_code}")
                
            # Parse the protobuf data
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)
            
            return self._parse_service_alerts(feed)
        except Exception as e:
            print(f"Error fetching service alerts for {system}: {str(e)}")
            raise
    
    def _parse_service_alerts(self, feed):
        """Parse service alerts feed"""
        result = {
            'header': {
                'timestamp': feed.header.timestamp,
                'version': feed.header.gtfs_realtime_version
            },
            'alerts': []
        }
        
        for entity in feed.entity:
            if entity.HasField('alert'):
                alert = {
                    'id': entity.id,
                    'effect': entity.alert.effect,
                    'header_text': self._get_translated_text(entity.alert.header_text),
                    'description_text': self._get_translated_text(entity.alert.description_text),
                    'active_period': [],
                    'informed_entity': []
                }
                
                for period in entity.alert.active_period:
                    alert['active_period'].append({
                        'start': period.start,
                        'end': period.end if period.HasField('end') else None
                    })
                
                for informed_entity in entity.alert.informed_entity:
                    entity_info = {}
                    if informed_entity.HasField('route_id'):
                        entity_info['route_id'] = informed_entity.route_id
                    if informed_entity.HasField('stop_id'):
                        entity_info['stop_id'] = informed_entity.stop_id
                    
                    alert['informed_entity'].append(entity_info)
                
                result['alerts'].append(alert)
                
        return result
    
    def _get_translated_text(self, translation_descriptor):
        """Extract text from TranslatedString"""
        for translation in translation_descriptor.translation:
            if translation.language == "en":
                return translation.text
        
        # If no English translation is found, return the first available
        if translation_descriptor.translation:
            return translation_descriptor.translation[0].text
        
        return ""
    
    def fetch_elevator_escalator_status(self, status_type='current'):
        """Fetch elevator and escalator status"""
        if status_type not in ELEVATOR_FEEDS:
            raise ValueError(f"Invalid status type: {status_type}")
            
        try:
            # Try to get JSON format first
            url = f"{self.base_url}{ELEVATOR_FEEDS[status_type]}.json"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                return response.json()
            
            # Fall back to XML format
            url = f"{self.base_url}{ELEVATOR_FEEDS[status_type]}.xml"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200:
                raise Exception(f"API returned status code {response.status_code}")
                
            # Parse XML data
            return self._parse_elevator_xml(response.text)
        except Exception as e:
            print(f"Error fetching elevator/escalator data: {str(e)}")
            raise
    
    def _parse_elevator_xml(self, xml_string):
        """Parse elevator/escalator XML data"""
        try:
            root = ET.fromstring(xml_string)
            result = {
                'equipments': []
            }
            
            for equipment in root.findall(".//equipment"):
                equipment_data = {}
                for child in equipment:
                    equipment_data[child.tag] = child.text
                
                result['equipments'].append(equipment_data)
            
            return result
        except Exception as e:
            print(f"Error parsing elevator XML: {str(e)}")
            return {'raw_xml': xml_string}