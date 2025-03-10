from flask import jsonify, request
from models.transit import Route, Station

def transit_routes(app):
    @app.route('/api/routes')
    def get_routes():
        routes = Route.query.all()
        return jsonify({
            "routes": [route.to_dict() for route in routes]
        })
    
    @app.route('/api/routes/<route_id>')
    def get_route_details(route_id):
        route = Route.query.get_or_404(route_id)
        return jsonify(route.to_dict())
    
    @app.route('/api/stations')
    def get_stations():
        stations = Station.query.all()
        return jsonify({
            "stations": [station.to_dict() for station in stations]
        })
    
    @app.route('/api/stations/<station_id>')
    def get_station_details(station_id):
        station = Station.query.get_or_404(station_id)
        return jsonify(station.to_dict())
