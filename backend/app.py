from flask import Flask, jsonify
from flask_cors import CORS
import threading
import schedule
import time
from routes.transit_routes import transit_routes_bp
from services.gtfs_service import GTFSService
from routes.vehicles import vehicles_bp
from routes.alerts import alerts_bp
from routes.accessibility import accessibility_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(transit_routes_bp)


# Register blueprints
app.register_blueprint(transit_routes_bp)
app.register_blueprint(vehicles_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(accessibility_bp)

# Add new API routes for the transit app
@app.route('/api/vehicles', methods=['GET'])
def get_vehicle_positions():
    from models.database import get_db_connection
    conn = get_db_connection()
    vehicles = conn.execute('''
        SELECT * FROM vehicle_positions 
        WHERE timestamp > ? 
        ORDER BY route_id
    ''', (int(time.time()) - 300,)).fetchall()  # Last 5 minutes
    conn.close()
    
    return jsonify([dict(v) for v in vehicles])

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    from models.database import get_db_connection
    conn = get_db_connection()
    alerts = conn.execute('''
        SELECT a.*, GROUP_CONCAT(ae.entity_id) as affected_entities
        FROM alerts a
        LEFT JOIN alert_entities ae ON a.id = ae.alert_id
        GROUP BY a.id
    ''').fetchall()
    conn.close()
    
    return jsonify([dict(a) for a in alerts])

@app.route('/api/accessibility', methods=['GET'])
def get_accessibility():
    from models.database import get_db_connection
    conn = get_db_connection()
    outages = conn.execute('''
        SELECT o.*, e.station_id, e.equipment_type, e.location, e.serving
        FROM accessibility_outages o
        JOIN accessibility_equipment e ON o.equipment_id = e.equipment_id
        WHERE o.is_upcoming = 0
    ''').fetchall()
    conn.close()
    
    return jsonify([dict(o) for o in outages])

# Background task for updating data
def run_scheduler():
    # Initial data load
    GTFSService.update_subway_positions()
    GTFSService.update_alerts()
    GTFSService.update_accessibility()
    
    # Schedule regular updates
    schedule.every(1).minutes.do(GTFSService.update_subway_positions)
    schedule.every(5).minutes.do(GTFSService.update_alerts)
    schedule.every(30).minutes.do(GTFSService.update_accessibility)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    # Start the scheduler in a background thread
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    # Run the Flask app
    app.run(debug=True)