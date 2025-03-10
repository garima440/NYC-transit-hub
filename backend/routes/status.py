from flask import jsonify
from models.transit import Route

def status_routes(app):
    @app.route('/api/status')
    def get_system_status():
        routes = Route.query.all()
        status_summary = {
            "system_status": "normal",
            "routes": {route.id: route.status for route in routes}
        }
        
        # Determine overall system status based on routes
        if any(route.status == "major_delays" for route in routes):
            status_summary["system_status"] = "major_delays"
        elif any(route.status == "minor_delays" for route in routes):
            status_summary["system_status"] = "minor_delays"
        
        return jsonify(status_summary)
