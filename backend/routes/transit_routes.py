# backend/routes/transit_routes.py
from flask import Blueprint, jsonify, request
from services.mta_service import MTAService
import time

transit_bp = Blueprint('transit', __name__)
mta_service = MTAService()

@transit_bp.route('/api/subway/<line>', methods=['GET'])
def get_subway_data(line):
    """Get subway data for a specific line"""
    try:
        data = mta_service.fetch_subway_feed(line)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transit_bp.route('/api/subway/all', methods=['GET'])
def get_all_subway_data():
    """Get data from all subway feeds"""
    try:
        data = mta_service.fetch_all_subway_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transit_bp.route('/api/subway/geojson', methods=['GET'])
def get_subway_geojson():
    """Get subway data in GeoJSON format for map display"""
    try:
        data = mta_service.fetch_all_subway_geojson()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transit_bp.route('/api/alerts/<system>', methods=['GET'])
def get_service_alerts(system):
    """Get service alerts for a specific system"""
    try:
        data = mta_service.fetch_service_alerts(system)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transit_bp.route('/api/elevator/<status_type>', methods=['GET'])
def get_elevator_status(status_type):
    """Get elevator and escalator status"""
    try:
        data = mta_service.fetch_elevator_escalator_status(status_type)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transit_bp.route('/api/status', methods=['GET'])
def get_data_status():
    """Get the current status of all data sources"""
    try:
        # Try to fetch data to ensure we have active connections
        subway_data = mta_service.fetch_all_subway_data()
        
        # Count active subway lines
        active_lines = set()
        for entity in subway_data.get('entities', []):
            if entity.get('route_id'):
                active_lines.add(entity.get('route_id'))
        
        # Try to fetch alerts
        alerts_data = mta_service.fetch_service_alerts('subway')
        alerts_available = ['subway']
        
        # Get elevator data
        elevator_data = mta_service.fetch_elevator_escalator_status('current')
        elevator_available = ['current']
        
        return jsonify({
            'last_update': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'lines_available': sorted(list(active_lines)),
            'alerts_available': alerts_available,
            'elevator_data_available': elevator_available,
            'total_vehicles': len([e for e in subway_data.get('entities', []) if e.get('type') == 'vehicle'])
        })
    except Exception as e:
        print(f"Error getting data status: {str(e)}")
        return jsonify({'error': 'No data available yet'})