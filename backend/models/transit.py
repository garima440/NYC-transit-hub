# backend/models/transit.py
from datetime import datetime

class TransitData:
    def __init__(self):
        self.last_update = None
        self.subway_data = {}
        self.service_alerts = {}
        self.elevator_data = {}
    
    def update_subway_data(self, line, data):
        self.subway_data[line] = data
        self.last_update = datetime.now()
    
    def update_service_alerts(self, system, data):
        self.service_alerts[system] = data
        
    def update_elevator_data(self, status_type, data):
        self.elevator_data[status_type] = data
    
    def get_subway_data(self, line=None):
        if line:
            return self.subway_data.get(line)
        return self.subway_data
    
    def get_service_alerts(self, system=None):
        if system:
            return self.service_alerts.get(system)
        return self.service_alerts
    
    def get_elevator_data(self, status_type=None):
        if status_type:
            return self.elevator_data.get(status_type)
        return self.elevator_data
    
    def get_last_update(self):
        return self.last_update
    
    def to_geojson(self):
        """Convert subway positions to GeoJSON for map display"""
        features = []
        
        for line, data in self.subway_data.items():
            if 'entities' not in data:
                continue
                
            for entity in data['entities']:
                if entity['type'] == 'vehicle' and entity.get('position'):
                    feature = {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [
                                entity['position']['longitude'],
                                entity['position']['latitude']
                            ]
                        },
                        'properties': {
                            'id': entity['id'],
                            'route_id': entity['route_id'],
                            'trip_id': entity['trip_id'],
                            'status': entity['current_status'],
                            'timestamp': entity['timestamp']
                        }
                    }
                    features.append(feature)
        
        return {
            'type': 'FeatureCollection',
            'features': features
        }