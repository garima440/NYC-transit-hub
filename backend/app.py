# backend/app.py
from flask import Flask
from flask_cors import CORS
from routes.transit_routes import transit_bp
import os
import threading
import time
from services.mta_service import MTAService
from config.config import REFRESH_INTERVAL

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variable to store the latest transit data
latest_subway_data = None
latest_subway_geojson = None
latest_alerts = {}

# Create service instance
mta_service = MTAService()

# Register blueprints
app.register_blueprint(transit_bp)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy'}

def background_data_refresh():
    """Background thread to periodically refresh transit data"""
    global latest_subway_data, latest_subway_geojson, latest_alerts
    
    while True:
        try:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Refreshing transit data...")
            
            # Fetch subway data
            try:
                latest_subway_data = mta_service.fetch_all_subway_data()
                latest_subway_geojson = mta_service.to_geojson(latest_subway_data)
                
                # Count vehicles by line
                line_counts = {}
                for entity in latest_subway_data.get('entities', []):
                    if entity.get('type') == 'vehicle' and entity.get('route_id'):
                        route_id = entity.get('route_id')
                        line_counts[route_id] = line_counts.get(route_id, 0) + 1
                
                total_vehicles = sum(line_counts.values())
                print(f"Updated subway data: {total_vehicles} vehicles across {len(line_counts)} lines")
                for line, count in sorted(line_counts.items()):
                    print(f"  Line {line}: {count} vehicles")
            except Exception as e:
                print(f"Error refreshing subway data: {str(e)}")
            
            # Fetch service alerts
            try:
                latest_alerts['subway'] = mta_service.fetch_service_alerts('subway')
                alert_count = len(latest_alerts['subway'].get('alerts', []))
                print(f"Updated subway alerts: {alert_count} active alerts")
            except Exception as e:
                print(f"Error refreshing alerts: {str(e)}")
            
            # Sleep until next refresh
            time.sleep(REFRESH_INTERVAL)
        except Exception as e:
            print(f"Error in background refresh thread: {str(e)}")
            time.sleep(30)  # Shorter interval on error

if __name__ == '__main__':
    # Start background refresh thread
    refresh_thread = threading.Thread(target=background_data_refresh, daemon=True)
    refresh_thread.start()
    
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)