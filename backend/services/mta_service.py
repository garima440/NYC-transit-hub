# backend/services/mta_service.py
import requests
from google.transit import gtfs_realtime_pb2
import json
import time
import xml.etree.ElementTree as ET
from config.config import API_BASE_URL, SUBWAY_FEEDS, SERVICE_ALERTS, ELEVATOR_FEEDS
from data.stop_locations import get_stop_coordinates

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
                vehicle_count = len([e for e in data.get('entities', []) if e.get('type') == 'vehicle'])
                trip_update_count = len([e for e in data.get('entities', []) if e.get('type') == 'trip_update'])
                
                print(f"Retrieved {len(data.get('entities', []))} entities from {line}:")
                print(f"  - {vehicle_count} vehicles (0 with position)")
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
            'current_status': str(vehicle.current_status),
            'timestamp': vehicle.timestamp,
            'stop_id': vehicle.stop_id if vehicle.HasField('stop_id') else None
        }
        
        return result
    
    def to_geojson(self, subway_data):
        """Convert subway data to GeoJSON for map display using stop locations"""
        features = []
        
        # Analyze data first
        vehicle_count = 0
        vehicles_with_stop = 0
        unique_routes = set()
        
        for entity in subway_data.get('entities', []):
            if entity.get('type') == 'vehicle':
                vehicle_count += 1
                route_id = entity.get('route_id')
                
                if route_id:
                    unique_routes.add(route_id)
                
                if entity.get('stop_id'):
                    vehicles_with_stop += 1
                    # Get coordinates for this stop
                    lat, lon = get_stop_coordinates(entity.get('stop_id'))
                    
                    # Create GeoJSON feature
                    feature = {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [lon, lat]  # GeoJSON uses [longitude, latitude]
                        },
                        'properties': {
                            'id': entity.get('id'),
                            'route_id': route_id,
                            'trip_id': entity.get('trip_id'),
                            'status': entity.get('current_status'),
                            'stop_id': entity.get('stop_id'),
                            'timestamp': entity.get('timestamp')
                        }
                    }
                    features.append(feature)
        
        print(f"Data analysis: {vehicle_count} vehicles, {vehicles_with_stop} with stop IDs")
        print(f"Found {len(unique_routes)} unique routes: {sorted(list(unique_routes))}")
        print(f"Created {len(features)} GeoJSON features")
        
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